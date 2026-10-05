"""
Minimal mock of the TouchDesigner Python API - enough to dry-run
build_temporal_body_bloom.py and the per-frame callbacks outside TouchDesigner.

It checks the Python control flow (node creation, wiring, custom parameters,
callbacks, engine round-trip, Cache TOP index bookkeeping). It cannot check
real TD parameter names, GPU cooking or shader output - those are verified by
the in-TD self check (12_DEBUG/self_check).

usage:  python tools/mock_td.py
"""
import os
import sys
import types

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import cpu_reference as C  # noqa: E402


class ParMode(object):
    CONSTANT, EXPRESSION, EXPORT, BIND = range(4)


class Par(object):
    def __init__(self, owner, name, val=None, kind='Float'):
        self.owner, self.name, self.val, self.kind = owner, name, val, kind
        self.expr, self.mode = '', ParMode.CONSTANT
        self.menuNames, self.menuLabels = [], []
        self.default = None
        self.normMin = self.normMax = self.min = self.max = 0
        self.clampMin = self.clampMax = False
        self.pulses = 0

    isPulse = property(lambda s: s.kind == 'Pulse')
    isOP = property(lambda s: s.kind in ('TOP', 'CHOP', 'OP'))
    isMenu = property(lambda s: s.kind == 'Menu')

    def eval(self):
        if self.isOP:
            return MOCK.op(self.val) if self.val else None
        return self.val

    def pulse(self):
        self.pulses += 1

    def __bool__(self):
        return bool(self.eval())

    def __float__(self):
        return float(self.eval())

    def __int__(self):
        return int(self.eval())


class ParCollection(object):
    def __init__(self, owner):
        object.__setattr__(self, '_owner', owner)
        object.__setattr__(self, '_pars', {})

    def __getattr__(self, name):
        pars = object.__getattribute__(self, '_pars')
        if name not in pars:
            if name[:1].isupper():  # custom pars must have been created
                return None
            pars[name] = Par(self._owner, name, 0)
        return pars[name]

    def __setattr__(self, name, value):
        p = getattr(self, name)
        if p is None:
            raise AttributeError(name)
        p.val = value


class Page(object):
    def __init__(self, owner, name):
        self.owner, self.name = owner, name

    def _append(self, kind, name, label=None):
        p = Par(self.owner, name, '' if kind in ('Str', 'File', 'TOP', 'CHOP', 'Menu') else 0, kind)
        self.owner.par._pars[name] = p
        self.owner.customPars.append(p)
        return [p]

    def __getattr__(self, attr):
        if attr.startswith('append'):
            kind = attr[len('append'):]
            return lambda name, label=None, **kw: self._append(kind, name, label)
        raise AttributeError(attr)


class Conn(object):
    def __init__(self, owner, i):
        self.owner, self.i = owner, i

    def connect(self, src):
        self.owner.inputs_[self.i] = src


class OP(object):
    def __init__(self, optype, name, parent):
        self.OPType, self.name, self.parent_ = optype, name, parent
        self.children = {}
        self.par = ParCollection(self)
        self.customPars = []
        self.inputs_ = {}
        self.nodeX = self.nodeY = 0
        self.comment, self.color, self.viewer = '', None, False
        self.text = ''
        self._rows = []
        self.cooks = 0
        self.width, self.height = 0, 0
        self._chans = {}
        self._array = None

    @property
    def path(self):
        if self.parent_ is None:
            return '/' + self.name if self.name else '/'
        return self.parent_.path.rstrip('/') + '/' + self.name

    @property
    def inputConnectors(self):
        return [Conn(self, i) for i in range(64)]

    def create(self, optype, name):
        o = OP(optype.__name__, name, self)
        self.children[name] = o
        return o

    def destroy(self):
        del self.parent_.children[self.name]

    def op(self, rel):
        o = self
        for part in rel.split('/'):
            o = o.children.get(part) if o else None
        return o

    def findChildren(self, depth=None):
        out = []
        for c in self.children.values():
            out.append(c)
            out.extend(c.findChildren())
        return out

    def appendCustomPage(self, name):
        return Page(self, name)

    def errors(self, recurse=False):
        return ''

    # DAT
    def clear(self):
        self._rows = []
        self._chans = {}

    def appendRow(self, row):
        self._rows.append(row)

    # CHOP (script)
    numSamples = 1

    def appendChan(self, name):
        arr = [0.0]
        self._chans[name] = arr
        return arr

    # TOP (script)
    def copyNumpyArray(self, a):
        self._array = np.array(a)
        self.height, self.width = a.shape[:2]

    def numpyArray(self, delayed=False):
        if self.name == 'mask_small':  # feed the procedural dancer into the pose fallback
            m = C.dancer_mask(MOCK.t, 128, 72)
            return np.dstack([m, m, m, np.ones_like(m)])
        if self.name in ('SEGMENT_MASK_OUT',):
            m = C.dancer_mask(MOCK.t, 128, 72)
            return np.dstack([m, m, m, np.ones_like(m)])
        return None

    def cook(self, force=False):
        self.cooks += 1
        if self.OPType in ('scriptCHOP', 'scriptTOP'):
            cb = self.par.callbacks.val
            MOCK.mod(cb).onCook(self)


class Mock(object):
    def __init__(self):
        self.root = OP('root', '', None)
        self.root.children['project1'] = OP('containerCOMP', 'project1', self.root)
        self.t = 0.0
        self.frame = 0
        self.queue = []
        self._mods = {}

    def op(self, path):
        if path is None or path == '':
            return None
        if isinstance(path, OP):
            return path
        o = self.root
        for part in path.strip('/').split('/'):
            o = o.children.get(part) if o else None
        return o

    def mod(self, path):
        o = self.op(path)
        key = (path, o.text)
        if key not in self._mods:
            m = types.ModuleType(path.replace('/', '_'))
            m.__dict__.update(self.globals())
            exec(compile(o.text, path, 'exec'), m.__dict__)
            self._mods[key] = m
        return self._mods[key]

    def run(self, cmd, delayFrames=0):
        self.queue.append((self.frame + delayFrames, cmd))

    def globals(self):
        td = types.ModuleType('td')
        for n in OPTYPES:
            setattr(td, n, type(n, (), {}))
        sys.modules['td'] = td
        return {
            'op': self.op, 'mod': self.mod, 'run': self.run, 'ParMode': ParMode,
            'debug': lambda *a: print('debug:', *a),
            'project': types.SimpleNamespace(folder=PKG),
            'absTime': types.SimpleNamespace(seconds=self.t, frame=self.frame),
        }


OPTYPES = ['baseCOMP', 'containerCOMP', 'selectTOP', 'videodeviceinTOP', 'moviefileinTOP',
           'glslTOP', 'switchTOP', 'flipTOP', 'resolutionTOP', 'nullTOP', 'cacheTOP',
           'constantTOP', 'blurTOP', 'selectCHOP', 'scriptCHOP', 'nullCHOP', 'textDAT',
           'executeDAT', 'tableDAT', 'trailCHOP', 'scriptTOP', 'cacheselectTOP',
           'feedbackTOP', 'windowCOMP', 'moviefileoutTOP', 'parameterexecuteDAT',
           'parameterCOMP', 'textTOP', 'overTOP', 'performCHOP']

MOCK = Mock()


def run_build_and_frames(frames=300, inputsource='test'):
    g = MOCK.globals()
    g['SRC'] = PKG
    g['__name__'] = '__td_textport__'
    exec(compile(open(os.path.join(PKG, 'build_temporal_body_bloom.py')).read(),
                 'build_temporal_body_bloom.py', 'exec'), g)
    root = MOCK.op('/project1/TEMPORAL_BODY_BLOOM')
    root.par.Inputsource = inputsource
    fe_path = root.path + '/04_TEMPORAL_MEMORY/frame_exec'
    pe = MOCK.mod(root.path + '/11_CONTROLS/par_exec')
    for f in range(frames):
        MOCK.frame, MOCK.t = f, f / 60.0
        fe = MOCK.mod(fe_path)
        fe.absTime.seconds, fe.absTime.frame = MOCK.t, f
        fe.onFrameStart(f)
        due = [c for c in MOCK.queue if c[0] <= f]
        MOCK.queue = [c for c in MOCK.queue if c[0] > f]
        for _, cmd in due:
            exec(cmd, MOCK.globals())
    return root, pe


if __name__ == '__main__':
    root, pe = run_build_and_frames()
    comps = sorted(root.children)
    print('children:', comps)
    eng = MOCK.mod(root.path + '/04_TEMPORAL_MEMORY/bloom_engine').get_engine()
    cache = MOCK.op(root.path + '/04_TEMPORAL_MEMORY/history_cache')
    print('history', len(eng.history), 'cache size', cache.par.cachesize.val,
          'pose', eng.pose_source)
    idx = [MOCK.op(root.path + '/04_TEMPORAL_MEMORY/hist_%02d' % i).par.cacheindex.val
           for i in range(16)]
    print('cache select indices', idx)
    print('params_tex', MOCK.op(root.path + '/06_BODY_TRANSFORMS/params_tex')._array.shape)
    print('pose chans', sorted(MOCK.op(root.path + '/03_POSE_TRACKING/pose_out')._chans)[:8])
    pe.onValueChange(root.par.Preset, 'reference') if False else None
    root.par.Preset = 'mandala'
    pe.onValueChange(root.par.Preset, 'reference')
    print('after mandala preset: Posecount', root.par.Posecount.val,
          'Rotationspread', root.par.Rotationspread.val)
    pe.onPulse(root.par.Resethistory)
    print('after reset: history', len(eng.history))
