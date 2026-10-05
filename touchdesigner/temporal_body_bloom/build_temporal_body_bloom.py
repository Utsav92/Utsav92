"""
TEMPORAL BODY BLOOM - LIVE 4D DANCE SHADOW SCULPTURE
One-shot network builder for TouchDesigner (2022.x / 2023.x / 2025.x).

Run inside TouchDesigner (Textport, Alt+T):

    SRC = r'C:/path/to/touchdesigner/temporal_body_bloom'
    exec(open(SRC + '/build_temporal_body_bloom.py').read())

It (re)creates /project1/TEMPORAL_BODY_BLOOM with the 12 sub-networks, wires
everything, loads the shaders and callbacks, creates the custom control
parameters, starts the network and, ~3 s later, prints a self-check report
(errors per operator, mask coverage, history fill, FPS) to the Textport.

Parameter names that vary between TD builds are set through `setp()`, which
tries a list of candidates and records anything it could not set in the
final report instead of aborting.
"""
import os

import td  # noqa: F401  (TouchDesigner module; provides the OP classes)

# ---------------------------------------------------------------- settings
SRC_DIR = globals().get('SRC') or os.environ.get('TBB_SRC') or \
    os.path.join(project.folder, 'temporal_body_bloom')  # noqa: F821
PARENT = globals().get('TBB_PARENT', '/project1')
NAME = 'TEMPORAL_BODY_BLOOM'
ROOT = PARENT + '/' + NAME
MAX_INST = 24
R = "op('%s')" % ROOT      # expression prefix used in parameter expressions

WARNINGS = []


def _read(rel):
    with open(os.path.join(SRC_DIR, rel), 'r') as f:
        text = f.read()
    if rel.startswith('callbacks/'):
        text = text.replace("'/project1/TEMPORAL_BODY_BLOOM'", repr(ROOT))
    return text


def _optype(name):
    t = getattr(td, name, None)
    if t is None:
        t = globals().get(name)
    if t is None:
        raise RuntimeError('Operator type %s not available in this TouchDesigner build' % name)
    return t


def setp(o, names, value=None, expr=None):
    """Set the first parameter that exists among `names`. Returns the name used."""
    if isinstance(names, str):
        names = [names]
    for n in names:
        p = getattr(o.par, n, None)
        if p is None:
            continue
        try:
            if expr is not None:
                p.expr = expr
                p.mode = ParMode.EXPRESSION  # noqa: F821
            else:
                p.val = value
            return n
        except Exception as e:  # menu value not accepted etc.
            WARNINGS.append('%s.%s: %s' % (o.path, n, e))
    WARNINGS.append('%s: none of %s exist' % (o.path, names))
    return None


def mk(parent, optype, name, x=0, y=0, comment=None):
    o = parent.create(_optype(optype), name)
    o.nodeX, o.nodeY = x, y
    if comment:
        o.comment = comment
    return o


def wire(dst, *srcs):
    for i, s in enumerate(srcs):
        if s is not None:
            dst.inputConnectors[i].connect(s)


def res(o, w=None, h=None, wexpr=None, hexpr=None):
    setp(o, ['outputresolution'], 'custom')
    if wexpr:
        setp(o, ['resolutionw'], expr=wexpr)
        setp(o, ['resolutionh'], expr=hexpr)
    else:
        setp(o, ['resolutionw'], w)
        setp(o, ['resolutionh'], h)


def sel_top(parent, name, path, x, y):
    s = mk(parent, 'selectTOP', name, x, y)
    s.par.top = path
    return s


def glsl(parent, name, shader, x, y, inputs, w=None, h=None, wexpr=None, hexpr=None,
         fmt=None, comment=None):
    dat = mk(parent, 'textDAT', name + '_pixel', x, y - 160)
    dat.text = _read('shaders/common.glsl') + '\n' + _read('shaders/' + shader)
    g = mk(parent, 'glslTOP', name, x, y, comment)
    setp(g, ['pixeldat'], dat.path)
    res(g, w, h, wexpr, hexpr)
    if fmt:
        setp(g, ['format'], fmt)
    wire(g, *inputs)
    return g


def code_dat(parent, name, rel, x, y):
    d = mk(parent, 'textDAT', name, x, y)
    d.text = _read(rel)
    return d


# ---------------------------------------------------------------- root + parameters
def build_root():
    par = op(PARENT)  # noqa: F821
    old = par.op(NAME)
    if old is not None:
        old.destroy()
    root = mk(par, 'baseCOMP', NAME, 0, 0,
              'TEMPORAL BODY BLOOM - live 4D dance shadow sculpture')
    root.color = (0.85, 0.78, 0.62)
    return root


def _pg(page, kind, name, label, default=None, lo=None, hi=None, menu=None, clamp=False):
    fn = getattr(page, 'append' + kind)
    p = fn(name, label=label)[0]
    if menu:
        p.menuNames = [m[0] for m in menu]
        p.menuLabels = [m[1] for m in menu]
    if lo is not None:
        p.normMin = lo
        if clamp:
            p.min, p.clampMin = lo, True
    if hi is not None:
        p.normMax = hi
        if clamp:
            p.max, p.clampMax = hi, True
    if default is not None:
        p.default = default
        p.val = default
    return p


def build_parameters(root):
    pg = root.appendCustomPage('Input')
    _pg(pg, 'Menu', 'Inputsource', 'Input Source', 'camera',
        menu=[('camera', 'Camera'), ('test', 'Test Dancer'), ('movie', 'Movie File')])
    _pg(pg, 'Str', 'Camera', 'Camera Device', '')
    _pg(pg, 'File', 'Moviefile', 'Movie File', '')
    _pg(pg, 'Toggle', 'Mirror', 'Mirror Camera', True)
    _pg(pg, 'Int', 'Procw', 'Processing Width', 1280, 320, 1920)
    _pg(pg, 'Int', 'Proch', 'Processing Height', 720, 180, 1080)
    _pg(pg, 'Int', 'Finalw', 'Final Width', 1920, 640, 3840)
    _pg(pg, 'Int', 'Finalh', 'Final Height', 1080, 360, 2160)

    pg = root.appendCustomPage('Segmentation')
    _pg(pg, 'Menu', 'Segsource', 'Segmentation Source', 'auto',
        menu=[('auto', 'Auto'), ('bgsub', 'Background Subtraction'),
              ('luma', 'Luma Key'), ('alpha', 'Input Alpha'), ('external', 'External Mask (ML)')])
    _pg(pg, 'Pulse', 'Capturebackground', 'Capture Background (empty stage)')
    _pg(pg, 'TOP', 'Externalmask', 'External Mask TOP (MediaPipe / NVIDIA)', '')
    _pg(pg, 'Float', 'Segthreshold', 'Segmentation Threshold', 0.16, 0, 1, clamp=True)
    _pg(pg, 'Float', 'Segsoftness', 'Threshold Softness', 0.05, 0, 0.3)
    _pg(pg, 'Float', 'Maskblur', 'Mask Blur', 3.0, 0, 20)
    _pg(pg, 'Float', 'Erode', 'Erode Amount', 1.0, 0, 8, clamp=True)
    _pg(pg, 'Float', 'Dilate', 'Dilate Amount', 2.0, 0, 8, clamp=True)
    _pg(pg, 'Toggle', 'Keyinvert', 'Luma Key: Bright Body', False)

    pg = root.appendCustomPage('Pose')
    _pg(pg, 'CHOP', 'Externalposechop', 'MediaPipe Pose CHOP', '')
    _pg(pg, 'Toggle', 'Flipposey', 'Pose Y Is Down (MediaPipe)', True)
    _pg(pg, 'Toggle', 'Flipposex', 'Mirror Pose X', False)
    _pg(pg, 'Float', 'Posesmoothing', 'Pose Smoothing', 0.18, 0, 0.95)
    _pg(pg, 'Menu', 'Pivotsource', 'Pivot', 'body',
        menu=[('body', 'Body Center'), ('pelvis', 'Pelvis Center')])

    pg = root.appendCustomPage('Memory')
    _pg(pg, 'Menu', 'Historymode', 'History Mode', 'hybrid',
        menu=[('timed', 'TIMED HISTORY'), ('keypose', 'KEY POSE'), ('hybrid', 'HYBRID')])
    _pg(pg, 'Int', 'Historylength', 'History Length (frames)', 90, 30, 180)
    _pg(pg, 'Int', 'Posecount', 'Pose Count', 16, 12, 24)
    _pg(pg, 'Float', 'Movementthreshold', 'Movement Threshold', 0.08, 0, 0.5)
    _pg(pg, 'Float', 'Maxinterval', 'Hybrid Max Interval (s)', 0.6, 0.1, 3)
    _pg(pg, 'Float', 'Mininterval', 'Min Interval (s)', 0.1, 0, 1)
    _pg(pg, 'Toggle', 'Freeze', 'Freeze', False)
    _pg(pg, 'Pulse', 'Resethistory', 'Reset History')

    pg = root.appendCustomPage('Sculpture')
    _pg(pg, 'Float', 'Rotationspread', 'Rotation Spread (deg)', 125, 0, 180)
    _pg(pg, 'Float', 'Scalespread', 'Scale Spread', 0.28, 0, 1)
    _pg(pg, 'Float', 'Radialdistance', 'Radial Distance', 0.20, 0, 0.6)
    _pg(pg, 'Float', 'Verticalbias', 'Vertical Bias (neg = up)', -0.10, -0.6, 0.6)
    _pg(pg, 'Float', 'Branchnoise', 'Branch Noise', 0.04, 0, 0.3)
    _pg(pg, 'Float', 'Jointbranchstrength', 'Joint Branch Strength', 0.25, 0, 1.5)
    _pg(pg, 'Toggle', 'Symmetry', 'Symmetry', True)
    _pg(pg, 'Float', 'Trunkhold', 'Trunk Preservation', 0.55, 0, 1, clamp=True)
    _pg(pg, 'Float', 'Trunkradius', 'Trunk Radius', 0.16, 0.02, 0.5)

    pg = root.appendCustomPage('Look')
    _pg(pg, 'Float', 'Silhouetteopacity', 'Silhouette Opacity', 1.0, 0, 1)
    _pg(pg, 'Float', 'Maximumopacity', 'Maximum Opacity', 0.92, 0, 1)
    _pg(pg, 'Float', 'Minimumopacity', 'Minimum Opacity', 0.12, 0, 1)
    _pg(pg, 'Float', 'Decayexponent', 'Decay Exponent', 1.6, 0.2, 4)
    _pg(pg, 'Menu', 'Currentbodymode', 'Current Body Mode', 'silhouette',
        menu=[('silhouette', 'BLACK SILHOUETTE'), ('live', 'LIVE VIDEO'), ('hidden', 'HIDDEN')])
    _pg(pg, 'Float', 'Currentopacity', 'Current Body Opacity', 1.0, 0, 1)
    _pg(pg, 'Float', 'Historyink', 'History Ink (RGB)', 0.02, 0, 0.3)
    _pg(pg, 'Float', 'Currentink', 'Current Body Ink (RGB)', 0.05, 0, 0.3)
    _pg(pg, 'Float', 'Backgroundbrightness', 'Background Brightness', 0.92, 0, 1)
    _pg(pg, 'Float', 'Backgroundwarmth', 'Background Warmth', 1.0, 0, 1)
    _pg(pg, 'Float', 'Vignette', 'Vignette', 0.12, 0, 0.6)

    pg = root.appendCustomPage('Particles')
    _pg(pg, 'Toggle', 'Particledissolve', 'Particle Dissolve', False)
    _pg(pg, 'Int', 'Particlecount', 'Particle Count', 8000, 2000, 20000)
    _pg(pg, 'Float', 'Particlelifetime', 'Particle Lifetime (s)', 2.5, 1, 4)
    _pg(pg, 'Float', 'Particlenoise', 'Noise Strength', 0.1, 0, 0.5)
    _pg(pg, 'Float', 'Particledrift', 'Upward Drift', 0.15, 0, 1)
    _pg(pg, 'Float', 'Dissolverange', 'Dissolve Range (oldest share)', 0.35, 0.05, 1)

    pg = root.appendCustomPage('Trails')
    _pg(pg, 'Toggle', 'Showwristtrails', 'Show Wrist Trails', False)
    _pg(pg, 'Toggle', 'Showankletrails', 'Show Ankle Trails', False)
    _pg(pg, 'Int', 'Traillength', 'Trail Length', 24, 2, 32)
    _pg(pg, 'Float', 'Trailwidth', 'Trail Width', 0.006, 0.001, 0.03)
    _pg(pg, 'Float', 'Trailopacity', 'Trail Opacity', 0.6, 0, 1)

    pg = root.appendCustomPage('Output')
    _pg(pg, 'Toggle', 'Fullscreen', 'Fullscreen', False)
    _pg(pg, 'Int', 'Outputmonitor', 'Output Monitor', 1, 0, 4)
    _pg(pg, 'Toggle', 'Record', 'Record', False)
    _pg(pg, 'Toggle', 'Debugview', 'Debug View', False)

    pg = root.appendCustomPage('Presets')
    _pg(pg, 'Menu', 'Preset', 'Preset', 'reference',
        menu=[('reference', 'REFERENCE'), ('tree', 'TREE'),
              ('mandala', 'MANDALA'), ('echo4d', '4D ECHO')])
    _pg(pg, 'Pulse', 'Applypreset', 'Apply Preset')


# ---------------------------------------------------------------- sub-networks
def p(name):
    return '%s.par.%s' % (R, name)


def build_input(c):
    pin = sel_top(c, 'params_in', ROOT + '/06_BODY_TRANSFORMS/params_tex', 0, 300)
    cam = mk(c, 'videodeviceinTOP', 'cam_in', 0, 0, 'Live camera (Camera parameter picks the device)')
    setp(cam, ['resolutionw'], 1280)
    setp(cam, ['resolutionh'], 720)
    setp(cam, ['fps'], 60)
    movie = mk(c, 'moviefileinTOP', 'movie_in', 0, -150)
    setp(movie, ['file'], expr="%s or ''" % p('Moviefile'))
    test = glsl(c, 'test_dancer', 'test_dancer.glsl', 0, -300, [pin],
                wexpr=p('Procw'), hexpr=p('Proch'),
                comment='Procedural dancer: verifies the whole network without a camera')
    sw = mk(c, 'switchTOP', 'src_switch', 200, 0)
    wire(sw, cam, test, movie)
    setp(sw, ['index'], expr="{'camera': 0, 'test': 1, 'movie': 2}.get(%s.eval(), 0)" % p('Inputsource'))
    flip = mk(c, 'flipTOP', 'cam_flip', 400, 0, 'Mirror (performer sees themselves)')
    wire(flip, sw)
    setp(flip, ['flipx'], expr='1 if %s else 0' % p('Mirror'))
    r = mk(c, 'resolutionTOP', 'cam_res', 600, 0, 'Processing resolution (default 1280x720)')
    wire(r, flip)
    res(r, wexpr=p('Procw'), hexpr=p('Proch'))
    out = mk(c, 'nullTOP', 'CAM_OUT', 800, 0)
    wire(out, r)


def build_segmentation(c):
    pin = sel_top(c, 'params_in', ROOT + '/06_BODY_TRANSFORMS/params_tex', 0, 300)
    cam = sel_top(c, 'cam_in', ROOT + '/01_INPUT/CAM_OUT', 0, 0)
    small = mk(c, 'resolutionTOP', 'seg_small', 200, 0, 'ML / keying at 640x360 for speed')
    wire(small, cam)
    res(small, 640, 360)
    bg = mk(c, 'cacheTOP', 'bg_plate', 200, -200,
            'Empty-stage plate. Auto-captured ~1.5 s after start; re-capture with the pulse')
    wire(bg, small)
    setp(bg, ['cachesize'], 1)
    setp(bg, ['active'], False)
    ext = mk(c, 'selectTOP', 'ext_mask_in', 0, -400,
             'External person mask (MediaPipe / NVIDIA / ONNX) - set Externalmask parameter')
    black = mk(c, 'constantTOP', 'ext_black', 0, -550)
    res(black, 640, 360)
    setp(black, ['colorr'], 0)
    setp(black, ['colorg'], 0)
    setp(black, ['colorb'], 0)
    esw = mk(c, 'switchTOP', 'ext_mask_switch', 200, -450)
    wire(esw, black, ext)
    setp(esw, ['index'], 0)
    eres = mk(c, 'resolutionTOP', 'ext_mask_res', 400, -450)
    wire(eres, esw)
    res(eres, 640, 360)
    seg = glsl(c, 'seg_mask', 'seg_mask.glsl', 600, 0, [pin, small, bg, eres], 640, 360,
               comment='Threshold: bg-subtraction / luma / alpha / external ML mask')
    er = glsl(c, 'erode', 'erode.glsl', 800, 0, [pin, seg], 640, 360)
    di = glsl(c, 'dilate', 'dilate.glsl', 1000, 0, [pin, er], 640, 360)
    up = mk(c, 'resolutionTOP', 'mask_up', 1200, 0)
    wire(up, di)
    res(up, wexpr=p('Procw'), hexpr=p('Proch'))
    bl = mk(c, 'blurTOP', 'mask_blur', 1400, 0)
    wire(bl, up)
    setp(bl, ['size'], expr=p('Maskblur'))
    cr = glsl(c, 'edge_crisp', 'edge_crisp.glsl', 1600, 0, [pin, bl],
              wexpr=p('Procw'), hexpr=p('Proch'))
    m = mk(c, 'nullTOP', 'SEGMENT_MASK', 1800, 0, 'black background / white body')
    wire(m, cr)
    o = mk(c, 'nullTOP', 'SEGMENT_MASK_OUT', 2000, 0)
    wire(o, m)


def build_pose(c):
    mi = sel_top(c, 'mask_in', ROOT + '/02_SEGMENTATION/SEGMENT_MASK_OUT', 0, 0)
    ms = mk(c, 'resolutionTOP', 'mask_small', 200, 0,
            '128x72 copy read by the engine (fallback pose + pivot)')
    wire(ms, mi)
    res(ms, 128, 72)
    ext = mk(c, 'selectCHOP', 'ext_pose', 0, -200,
             'MediaPipe Pose CHOP (set Externalposechop). Channel names are auto-matched')
    setp(ext, ['chop'], expr="%s.eval().path if %s.eval() else ''" % (p('Externalposechop'),
                                                                       p('Externalposechop')))
    cb = code_dat(c, 'pose_out_callbacks', 'callbacks/pose_out_callbacks.py', 200, -400)
    so = mk(c, 'scriptCHOP', 'pose_out', 400, -200,
            'EMA-smoothed landmarks + pelvis/shoulder/body centre')
    setp(so, ['callbacks'], cb.path)
    out = mk(c, 'nullCHOP', 'POSE_DATA_OUT', 600, -200)
    wire(out, so)


def build_memory(c):
    code_dat(c, 'bloom_engine', 'engine.py', 0, 300)
    hi = sel_top(c, 'hist_in', ROOT + '/02_SEGMENTATION/SEGMENT_MASK_OUT', 0, 0)
    hr = mk(c, 'resolutionTOP', 'hist_res', 200, 0, 'History stored at 960x540, mono')
    wire(hr, hi)
    res(hr, 960, 540)
    setp(hr, ['format'], 'r8fixed')
    cache = mk(c, 'cacheTOP', 'history_cache', 400, 0,
               'Frame ring buffer. Written only on accepted captures (key pose gate)')
    wire(cache, hr)
    setp(cache, ['cachesize'], 92)
    setp(cache, ['active'], True)
    for i in range(MAX_INST):
        cs = mk(c, 'cacheselectTOP', 'hist_%02d' % i, 650 + (i % 6) * 160, 200 - (i // 6) * 140)
        setp(cs, ['top', 'cachetop', 'cache'], cache.path)
        setp(cs, ['cacheindex', 'index'], -(i + 1))
    fe = code_dat(c, 'frame_exec_src', 'callbacks/frame_exec.py', 0, -300)
    ex = mk(c, 'executeDAT', 'frame_exec', 200, -300,
            'Per-frame: pose ingest, key-pose gate, cache write, slot indices, param texture')
    ex.text = fe.text
    fe.destroy()
    setp(ex, ['framestart'], True)
    setp(ex, ['active'], True)
    mk(c, 'tableDAT', 'history_info', 400, -300, 'captures_ago / time / pivot per stored frame')


def build_keypose(c):
    cb = code_dat(c, 'keypose_callbacks', 'callbacks/keypose_callbacks.py', 0, -200)
    k = mk(c, 'scriptCHOP', 'keypose_chop', 200, 0,
           'pose_difference vs last key pose (torso-normalised), capture flag')
    setp(k, ['callbacks'], cb.path)
    t = mk(c, 'trailCHOP', 'keypose_trail', 400, 0, 'pose_difference over time')
    wire(t, k)
    o = mk(c, 'nullCHOP', 'KEYPOSE_OUT', 600, 0)
    wire(o, k)


def build_transforms(c):
    cb = code_dat(c, 'params_tex_callbacks', 'callbacks/params_tex_callbacks.py', 0, -200)
    s = mk(c, 'scriptTOP', 'params_tex', 200, 0,
           '32x20 RGBA32F: per-instance rotation/scale/offset/opacity + historical pivots')
    setp(s, ['callbacks'], cb.path)
    setp(s, ['format'], 'rgba32float')
    res(s, 32, 20)
    mk(c, 'tableDAT', 'instance_table', 400, 0,
       'CLOCKWISE_BRANCH / COUNTERCLOCKWISE_BRANCH instance parameters (debug)')


def _history_inputs(c, x0):
    pin = sel_top(c, 'params_in', ROOT + '/06_BODY_TRANSFORMS/params_tex', x0, 400)
    cm = sel_top(c, 'cur_mask', ROOT + '/02_SEGMENTATION/SEGMENT_MASK_OUT', x0, 250)
    cc = sel_top(c, 'cur_cam', ROOT + '/01_INPUT/CAM_OUT', x0, 100)
    hs = [sel_top(c, 'h_%02d' % i, ROOT + '/04_TEMPORAL_MEMORY/hist_%02d' % i,
                  x0 + 160 * (i % 4), -60 - 110 * (i // 4)) for i in range(MAX_INST)]
    return [pin, cm, cc] + hs


def build_bloom(c):
    ins = _history_inputs(c, 0)
    b = glsl(c, 'bloom_comp', 'bloom_composite.glsl', 900, 0, ins,
             wexpr=p('Finalw'), hexpr=p('Finalh'), fmt='rgba16float',
             comment='All historical masks: pivot-centred transforms, MAXIMUM blend')
    o = mk(c, 'nullTOP', 'BLOOM_OUT', 1100, 0)
    wire(o, b)


def build_particles(c):
    ins = _history_inputs(c, 0)
    src = glsl(c, 'dissolve_src', 'dissolve_src.glsl', 900, 0, ins, 960, 540, fmt='r16float',
               comment='Edge pixels of the oldest (dissolving) silhouettes')
    pin = ins[0]
    seed = mk(c, 'constantTOP', 'dust_seed', 900, -250)
    res(seed, 960, 540)
    setp(seed, ['colorr'], 0)
    setp(seed, ['colorg'], 0)
    setp(seed, ['colorb'], 0)
    fb = mk(c, 'feedbackTOP', 'dust_feedback', 1100, -250)
    wire(fb, seed)
    sim = glsl(c, 'dust_sim', 'dust_sim.glsl', 1300, 0, [pin, fb, src], 960, 540, fmt='r16float',
               comment='Slow organic dust: noise flow, low gravity, upward drift')
    setp(fb, ['top'], sim.path)
    o = mk(c, 'nullTOP', 'DUST_OUT', 1500, 0)
    wire(o, sim)


def build_composite(c):
    pin = sel_top(c, 'params_in', ROOT + '/06_BODY_TRANSFORMS/params_tex', 0, 200)
    b = sel_top(c, 'bloom_in', ROOT + '/07_TEMPORAL_BLOOM/BLOOM_OUT', 0, 0)
    d = sel_top(c, 'dust_in', ROOT + '/08_PARTICLE_DECAY/DUST_OUT', 0, -200)
    f = glsl(c, 'final_comp', 'final_comp.glsl', 300, 0, [pin, b, d],
             wexpr=p('Finalw'), hexpr=p('Finalh'))
    o = mk(c, 'nullTOP', 'COMP_OUT', 500, 0)
    wire(o, f)


def build_output(c):
    ci = sel_top(c, 'comp_in', ROOT + '/09_COMPOSITE/COMP_OUT', 0, 0)
    fin = mk(c, 'nullTOP', 'FINAL_OUT', 200, 0, '1920x1080 projection output')
    wire(fin, ci)
    win = mk(c, 'windowCOMP', 'FULLSCREEN_OUT', 400, 200,
             'Projector / 2nd monitor / LED wall. Toggle with the Fullscreen parameter')
    setp(win, ['winop'], fin.path)
    setp(win, ['monitor'], expr=p('Outputmonitor'))
    setp(win, ['borders'], False)
    setp(win, ['size', 'winsize'], 'fill')
    setp(win, ['vsyncmode', 'vsync'], 'vsync')
    rec = mk(c, 'moviefileoutTOP', 'recorder', 400, -200, 'H.264 MP4 of FINAL_OUT (Record toggle)')
    wire(rec, fin)
    setp(rec, ['type'], 'movie')
    for codec in ('h264nvgpu', 'h264', 'mjpa'):
        try:
            rec.par.videocodec = codec
            break
        except Exception:
            continue
    setp(rec, ['record'], False)
    dbg = sel_top(c, 'debug_in', ROOT + '/12_DEBUG/DEBUG_OUT', 0, -400)
    sw = mk(c, 'switchTOP', 'preview_switch', 600, -400)
    wire(sw, fin, dbg)
    setp(sw, ['index'], expr='1 if %s else 0' % p('Debugview'))
    pv = mk(c, 'nullTOP', 'PREVIEW_OUT', 800, -400, 'FINAL_OUT or the debug wall')
    wire(pv, sw)


def build_controls(c):
    pe = mk(c, 'parameterexecuteDAT', 'par_exec', 0, 0,
            'Pulses, presets, fullscreen, record, reset')
    pe.text = _read('callbacks/par_exec.py')
    setp(pe, ['op'], ROOT)
    setp(pe, ['pars'], '*')
    setp(pe, ['valuechange'], True)
    setp(pe, ['onpulse'], True)
    setp(pe, ['custom'], True)
    setp(pe, ['builtin'], False)
    t = mk(c, 'tableDAT', 'presets', 200, 0, 'REFERENCE / TREE / MANDALA / 4D ECHO')
    E = mod(ROOT + '/04_TEMPORAL_MEMORY/bloom_engine')  # noqa: F821
    keys = sorted({k for v in E.PRESETS.values() for k in v})
    t.clear()
    t.appendRow(['parameter'] + list(E.PRESETS.keys()))
    for k in keys:
        t.appendRow([k] + [E.PRESETS[n].get(k, '') for n in E.PRESETS])
    try:
        ui = mk(c, 'parameterCOMP', 'control_panel', 400, 0, 'Control surface for the main COMP')
        setp(ui, ['op'], ROOT)
        setp(ui, ['w'], 420)
        setp(ui, ['h'], 900)
    except Exception as e:
        WARNINGS.append('parameterCOMP unavailable (%s) - use the COMP parameter dialog' % e)
    readme = mk(c, 'textDAT', 'README', 0, -200)
    readme.text = _read('README.md')


def build_debug(c):
    pin = sel_top(c, 'params_in', ROOT + '/06_BODY_TRANSFORMS/params_tex', 0, 400)
    srcs = [pin,
            sel_top(c, 'cam_in', ROOT + '/01_INPUT/CAM_OUT', 0, 250),
            sel_top(c, 'mask_in', ROOT + '/02_SEGMENTATION/SEGMENT_MASK_OUT', 0, 100),
            sel_top(c, 'final_in', ROOT + '/09_COMPOSITE/COMP_OUT', 0, -50)]
    for k, slot in enumerate((0, 5, 10, 15)):
        srcs.append(sel_top(c, 'hist_s%02d' % slot, ROOT + '/04_TEMPORAL_MEMORY/hist_%02d' % slot,
                            200, 250 - k * 150))
    srcs.append(sel_top(c, 'dissolve_in', ROOT + '/08_PARTICLE_DECAY/dissolve_src', 0, -200))
    srcs.append(sel_top(c, 'dust_in', ROOT + '/08_PARTICLE_DECAY/DUST_OUT', 0, -350))
    g = glsl(c, 'debug_grid', 'debug_grid.glsl', 500, 0, srcs, 1920, 1080,
             comment='cam+landmarks | mask+pivot | final / 4 history slots / dissolve | dust')
    txt = mk(c, 'textTOP', 'fps_text', 500, 250)
    res(txt, 1920, 1080)
    setp(txt, ['text'], 'starting...')
    setp(txt, ['fontsizex'], 22)
    setp(txt, ['alignx'], 'left')
    setp(txt, ['aligny'], 'top')
    setp(txt, ['bgalpha'], 0)
    setp(txt, ['fontcolorr'], 1)
    setp(txt, ['fontcolorg'], 0.9)
    setp(txt, ['fontcolorb'], 0.2)
    ov = mk(c, 'overTOP', 'debug_over', 700, 0)
    wire(ov, txt, g)
    o = mk(c, 'nullTOP', 'DEBUG_OUT', 900, 0)
    wire(o, ov)
    mk(c, 'performCHOP', 'perform', 500, -300, 'TD frame time / fps')


SECTIONS = [
    ('01_INPUT', build_input), ('02_SEGMENTATION', build_segmentation),
    ('03_POSE_TRACKING', build_pose), ('04_TEMPORAL_MEMORY', build_memory),
    ('05_KEYPOSE_ANALYSIS', build_keypose), ('06_BODY_TRANSFORMS', build_transforms),
    ('07_TEMPORAL_BLOOM', build_bloom), ('08_PARTICLE_DECAY', build_particles),
    ('09_COMPOSITE', build_composite), ('10_OUTPUT', build_output),
    ('11_CONTROLS', build_controls), ('12_DEBUG', build_debug),
]
# memory first: the engine DAT must exist before CONTROLS reads the presets
BUILD_ORDER = ['04_TEMPORAL_MEMORY'] + [n for n, _ in SECTIONS if n != '04_TEMPORAL_MEMORY']


def build():
    del WARNINGS[:]
    root = build_root()
    build_parameters(root)
    comps = {}
    for i, (name, _) in enumerate(SECTIONS):
        comps[name] = mk(root, 'baseCOMP', name, (i % 4) * 250, -(i // 4) * 200)
    fns = dict(SECTIONS)
    for name in BUILD_ORDER:
        try:
            fns[name](comps[name])
        except Exception as e:
            WARNINGS.append('BUILD %s failed: %r' % (name, e))
            raise
    pv = mk(root, 'selectTOP', 'PREVIEW', 1100, 0, 'FINAL_OUT (or debug wall when Debugview)')
    pv.par.top = ROOT + '/10_OUTPUT/PREVIEW_OUT'
    pv.viewer = True
    root.viewer = True
    print('TEMPORAL BODY BLOOM built at %s (%d setup warnings)' % (ROOT, len(WARNINGS)))
    for w in WARNINGS:
        print('  warn:', w)
    run("mod(%r).self_check()" % (ROOT + '/12_DEBUG/self_check'), delayFrames=180)  # noqa: F821
    return root


SELF_CHECK = r'''
# 12_DEBUG / self_check : run  mod('%(root)s/12_DEBUG/self_check').self_check()
ROOT = '%(root)s'

def _stats(top):
    try:
        a = top.numpyArray()
        return float(a[:, :, 0].mean()), float(a[:, :, 0].max())
    except Exception:
        return None, None

def self_check():
    root = op(ROOT)
    print('=' * 70)
    print('TEMPORAL BODY BLOOM self-check')
    bad = 0
    for o in root.findChildren(depth=None):
        try:
            e = o.errors()
        except Exception:
            e = ''
        if e:
            bad += 1
            print('  ERROR  %%s : %%s' %% (o.path, e.strip()[:200]))
    print('  operators with errors: %%d' %% bad)
    m, mx = _stats(op(ROOT + '/02_SEGMENTATION/SEGMENT_MASK_OUT'))
    print('  SEGMENT_MASK coverage: %%s  (expect 0.03-0.4 with a performer in frame)' %% m)
    eng = mod(ROOT + '/04_TEMPORAL_MEMORY/bloom_engine').get_engine()
    print('  pose source: %%s  valid: %%s  pivot: %%s' %% (eng.pose_source, eng.pose_valid,
          tuple(round(v, 3) for v in eng.pivot)))
    print('  history: %%d stored, %%d captures, fps %%.1f' %% (len(eng.history),
          eng.capture_count, eng.fps))
    valid = sum(1 for i in eng.instances if i['valid'])
    print('  silhouette instances valid: %%d / %%d' %% (valid, len(eng.instances)))
    distinct = len({i['slot'] for i in eng.instances})
    print('  distinct history slots: %%d' %% distinct)
    f = op(ROOT + '/10_OUTPUT/FINAL_OUT')
    print('  FINAL_OUT: %%dx%%d' %% (f.width, f.height))
    if eng.pose_source == 'none':
        print('  HINT: no body found. Step out of frame and pulse "Capture Background",')
        print('        or set Input Source = Test Dancer to verify the network.')
    print('=' * 70)
'''


def add_self_check():
    d = op(ROOT + '/12_DEBUG').create(_optype('textDAT'), 'self_check')  # noqa: F821
    d.nodeX, d.nodeY = 900, -300
    d.text = SELF_CHECK % {'root': ROOT}


build()
add_self_check()
