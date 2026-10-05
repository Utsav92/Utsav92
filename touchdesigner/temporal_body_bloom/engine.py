"""
TEMPORAL BODY BLOOM - core engine.

Pure Python + numpy. No TouchDesigner globals are used here, so the same file
runs inside TD (as the `bloom_engine` Text DAT, loaded with mod()) and in the
offline tests / preview renderer in this repository.

Responsibilities
  * pose ingest   - MediaPipe-style CHOP channels, or a mask-geometry fallback
  * smoothing     - EMA ("Posesmoothing")
  * key-pose gate - TIMED / KEYPOSE / HYBRID capture decisions
  * pose history  - ring buffer that mirrors the Cache TOP 1:1
  * transforms    - per-instance rotation / scale / radial offset around the
                    performer's tracked body pivot
  * packing       - one small float texture (TEX_W x TEX_H RGBA32F) that feeds
                    every GLSL TOP in the network, so the shaders need no
                    custom uniforms

Coordinate convention: normalised UV, x right 0..1, y UP 0..1 (TD texture space).
"Aspect space" = (x * aspect, y) so rotations are not squashed.
"""

import math
from collections import deque

try:
    import numpy as np
except ImportError:  # pragma: no cover
    np = None

# --------------------------------------------------------------------------
# constants shared with the shaders (keep in sync with shaders/common.glsl)
# --------------------------------------------------------------------------
MAX_INSTANCES = 24
MAX_TRAIL = 32
TEX_W = 32
TEX_H = 20

ROW_G0 = 0      # curPivot.x, curPivot.y, aspect, instanceCount
ROW_G1 = 1      # bg.r, bg.g, bg.b, historyInk
ROW_G2 = 2      # currentMode, currentOpacity, particleOn, time
ROW_G3 = 3      # trunkHold, trunkRadius(aspect units), currentInk, vignette
ROW_I0 = 4      # per instance: offset.x, offset.y (aspect units), rot (rad, CCW+), scale
ROW_I1 = 5      # per instance: opacity, valid, srcPivot.x, srcPivot.y
ROW_I2 = 6      # per instance: age, dissolve, seed, direction
ROW_T0 = 7      # rows 7..10 trails (lwrist, rwrist, lankle, rankle): x, y, valid, 0
ROW_TG = 11     # trailCount, trailWidth, trailOpacity, enabledMask
ROW_SEG = 12    # segMode, threshold, softness, erodeRadius
ROW_SEG2 = 13   # dilateRadius, testTime, keyInvert, 0
ROW_LM = 14     # landmarks: col j = x, y, valid, 0 (13 joints, 13 pelvis, 14 shoulder, 15 body)
ROW_DBG = 15    # fps, historyLen, poseDifference, captureFlag
ROW_DUST = 16   # density, lifetime, noise, drift   | col1: dt, 0, 0, 0

LANDMARKS = [
    'nose',
    'left_shoulder', 'right_shoulder',
    'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist',
    'left_hip', 'right_hip',
    'left_knee', 'right_knee',
    'left_ankle', 'right_ankle',
]
# MediaPipe Pose landmark indices
MP_INDEX = {
    'nose': 0, 'left_shoulder': 11, 'right_shoulder': 12, 'left_elbow': 13,
    'right_elbow': 14, 'left_wrist': 15, 'right_wrist': 16, 'left_hip': 23,
    'right_hip': 24, 'left_knee': 25, 'right_knee': 26, 'left_ankle': 27,
    'right_ankle': 28,
}
KEY_JOINTS = ['left_wrist', 'right_wrist', 'left_elbow', 'right_elbow',
              'left_knee', 'right_knee', 'left_ankle', 'right_ankle']
TRAIL_JOINTS = ['left_wrist', 'right_wrist', 'left_ankle', 'right_ankle']

HISTORY_MODES = ['timed', 'keypose', 'hybrid']
SEG_SOURCES = ['auto', 'bgsub', 'luma', 'alpha', 'external']
SEG_MODE_CODE = {'bgsub': 0, 'luma': 1, 'alpha': 2, 'external': 3}
CURRENT_MODES = ['silhouette', 'live', 'hidden']
INPUT_SOURCES = ['camera', 'test', 'movie']

WARM = (1.0, 0.913, 0.761)  # 0.92 * WARM = (0.92, 0.84, 0.70) - the reference ivory

# --------------------------------------------------------------------------
# parameters (TD custom-parameter names: first letter upper, rest lower)
# --------------------------------------------------------------------------
DEFAULTS = {
    'Inputsource': 'camera', 'Camera': '', 'Moviefile': '', 'Mirror': True,
    'Procw': 1280, 'Proch': 720, 'Finalw': 1920, 'Finalh': 1080,

    'Segsource': 'auto', 'Segthreshold': 0.16, 'Segsoftness': 0.05,
    'Maskblur': 3.0, 'Erode': 1.0, 'Dilate': 2.0, 'Keyinvert': False,
    'Externalmask': '', 'Externalposechop': '', 'Flipposey': True, 'Flipposex': False,

    'Historymode': 'hybrid', 'Historylength': 90, 'Posecount': 16,
    'Movementthreshold': 0.08, 'Maxinterval': 0.6, 'Mininterval': 0.1,

    'Rotationspread': 125.0, 'Scalespread': 0.28, 'Radialdistance': 0.20,
    'Verticalbias': -0.10, 'Branchnoise': 0.04, 'Jointbranchstrength': 0.25,
    'Symmetry': True, 'Pivotsource': 'body', 'Trunkhold': 0.55, 'Trunkradius': 0.16,
    'Posesmoothing': 0.18,

    'Silhouetteopacity': 1.0, 'Maximumopacity': 0.92, 'Minimumopacity': 0.12,
    'Decayexponent': 1.6,

    'Currentbodymode': 'silhouette', 'Currentopacity': 1.0,
    'Historyink': 0.02, 'Currentink': 0.05,
    'Backgroundbrightness': 0.92, 'Backgroundwarmth': 1.0, 'Vignette': 0.12,

    'Particledissolve': False, 'Particlecount': 8000, 'Particlelifetime': 2.5,
    'Particlenoise': 0.1, 'Particledrift': 0.15, 'Dissolverange': 0.35,

    'Showwristtrails': False, 'Showankletrails': False, 'Traillength': 24,
    'Trailwidth': 0.006, 'Trailopacity': 0.6,

    'Freeze': False, 'Fullscreen': False, 'Outputmonitor': 1, 'Record': False,
    'Debugview': False, 'Preset': 'reference',
}

PRESETS = {
    # closest to the reference photograph: wide symmetric fan, black on ivory
    'reference': {
        'Historymode': 'hybrid', 'Posecount': 16, 'Rotationspread': 125.0,
        'Scalespread': 0.28, 'Radialdistance': 0.20, 'Verticalbias': -0.10,
        'Branchnoise': 0.04, 'Jointbranchstrength': 0.25, 'Symmetry': True,
        'Trunkhold': 0.55, 'Maximumopacity': 0.92, 'Minimumopacity': 0.12,
        'Decayexponent': 1.6, 'Particledissolve': False,
        'Backgroundbrightness': 0.92, 'Backgroundwarmth': 1.0,
    },
    # grows upward like a tree: less sideways fan, strong lift
    'tree': {
        'Historymode': 'hybrid', 'Posecount': 18, 'Rotationspread': 140.0,
        'Scalespread': 0.22, 'Radialdistance': 0.05, 'Verticalbias': -0.38,
        'Branchnoise': 0.05, 'Jointbranchstrength': 0.2, 'Symmetry': True,
        'Trunkhold': 0.9, 'Trunkradius': 0.22, 'Decayexponent': 1.3,
        'Minimumopacity': 0.15,
    },
    # full circular many-armed figure
    'mandala': {
        'Historymode': 'keypose', 'Posecount': 24, 'Rotationspread': 172.0,
        'Scalespread': 0.12, 'Radialdistance': 0.16, 'Verticalbias': 0.0,
        'Branchnoise': 0.0, 'Jointbranchstrength': 0.0, 'Symmetry': True,
        'Trunkhold': 0.15, 'Decayexponent': 1.0, 'Minimumopacity': 0.25,
        'Maximumopacity': 0.85,
    },
    # asymmetric, follows the dancer's actual motion vectors
    'echo4d': {
        'Historymode': 'keypose', 'Posecount': 16, 'Rotationspread': 70.0,
        'Scalespread': 0.15, 'Radialdistance': 0.12, 'Verticalbias': -0.05,
        'Branchnoise': 0.03, 'Jointbranchstrength': 0.85, 'Symmetry': False,
        'Trunkhold': 0.35, 'Decayexponent': 1.9, 'Minimumopacity': 0.08,
        'Particledissolve': True,
    },
}


# --------------------------------------------------------------------------
# small math helpers
# --------------------------------------------------------------------------
def _lerp(a, b, t):
    return a + (b - a) * t


def _lerp2(p, q, t):
    return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)


def _sub(p, q):
    return (p[0] - q[0], p[1] - q[1])


def _len(v):
    return math.hypot(v[0], v[1])


def _clip_len(v, m):
    n = _len(v)
    if n > m and n > 0:
        return (v[0] * m / n, v[1] * m / n)
    return v


def _smoothstep(e0, e1, x):
    if e1 == e0:
        return 1.0 if x >= e1 else 0.0
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def _hash01(n):
    """Deterministic pseudo random in [0,1) for an integer seed."""
    x = math.sin(n * 12.9898 + 78.233) * 43758.5453
    return x - math.floor(x)


def _menu_val(v, options, default):
    v = str(v).strip().lower().replace(' ', '').replace('_', '')
    for o in options:
        if v == o.replace('_', ''):
            return o
    return default


# --------------------------------------------------------------------------
# pose sources
# --------------------------------------------------------------------------
def pose_from_mask(mask, thresh=0.5, min_fraction=0.004):
    """Approximate the 13 landmarks from a binary body mask.

    `mask` is a 2D numpy array, row 0 = BOTTOM of the image (TD numpyArray
    convention). Used when no ML pose model is available. It is a geometric
    heuristic (head = top, wrists = farthest upper-body points left/right of
    the torso, ankles = lowest points per side) - good enough to drive the
    pivot, the key-pose gate and joint branching.
    """
    if np is None or mask is None:
        return None
    h, w = mask.shape[:2]
    ys, xs = np.nonzero(mask > thresh)
    if xs.size < max(12, min_fraction * w * h):
        return None
    aspect = w / float(h)
    x = (xs + 0.5) / w
    y = (ys + 0.5) / h
    cx = float(x.mean())
    top, bottom = float(y.max()), float(y.min())
    hgt = max(top - bottom, 1e-3)
    to_x = 1.0 / aspect  # convert a y-unit length into x-uv units

    def band_x(yc, half):
        sel = np.abs(y - yc) < half
        return (x[sel], int(sel.sum()))

    nose_y = top - 0.07 * hgt
    nx, nn = band_x(nose_y, 0.03 * hgt)
    nose = (float(nx.mean()) if nn else cx, nose_y)

    sh_y = top - 0.19 * hgt
    hip_y = top - 0.50 * hgt
    hx, hn = band_x(hip_y, 0.03 * hgt)
    hip_cx = float(np.median(hx)) if hn else cx
    if hn and (np.percentile(hx, 90) - np.percentile(hx, 10)) * aspect > 0.2 * hgt:
        # a kicked leg crosses the hip band: use the waist instead
        wx, wn = band_x(top - 0.42 * hgt, 0.03 * hgt)
        if wn:
            hip_cx = float(np.median(wx))
    torso_x = hip_cx  # the hips are the most stable horizontal reference
    sw = 0.085 * hgt * to_x
    hw = 0.05 * hgt * to_x
    l_sh, r_sh = (torso_x - sw, sh_y), (torso_x + sw, sh_y)
    l_hip, r_hip = (torso_x - hw, hip_y), (torso_x + hw, hip_y)
    sh_c = (torso_x, sh_y)

    # wrists: farthest points (aspect space) from the shoulder centre, among the
    # pixels above mid-thigh that lie outside the torso column (i.e. the arms)
    upper = (y > hip_y + 0.02 * hgt) & (np.abs(x - torso_x) * aspect > 0.06 * hgt)
    dx = (x - sh_c[0]) * aspect
    dy = y - sh_c[1]
    dist = np.sqrt(dx * dx + dy * dy)

    def far_point(sel, fallback):
        if not sel.any():
            return fallback
        idx = np.argmax(np.where(sel, dist, -1.0))
        return (float(x[idx]), float(y[idx]))

    l_wr = far_point(upper & (x < torso_x - 0.25 * sw), (torso_x - 1.2 * sw, hip_y))
    r_wr = far_point(upper & (x > torso_x + 0.25 * sw), (torso_x + 1.2 * sw, hip_y))

    low = y < bottom + 0.12 * hgt

    def foot(sel, fallback):
        if not sel.any():
            return fallback
        return (float(x[sel].mean()), float(y[sel].min()))

    l_an = foot(low & (x < torso_x), (torso_x - hw, bottom))
    r_an = foot(low & (x >= torso_x), (torso_x + hw, bottom))
    # a kicked leg leaves the floor band: use the farthest lower-body point instead
    lower_body = y < hip_y - 0.1 * hgt
    ddx = (x - torso_x) * aspect
    if lower_body.any():
        kick_l = lower_body & (x < torso_x) & (ddx < -0.30 * hgt)
        kick_r = lower_body & (x > torso_x) & (ddx > 0.30 * hgt)
        if kick_l.any() and not (low & (x < torso_x)).any():
            i = np.argmin(np.where(kick_l, ddx, 9.0))
            l_an = (float(x[i]), float(y[i]))
        if kick_r.any() and not (low & (x >= torso_x)).any():
            i = np.argmax(np.where(kick_r, ddx, -9.0))
            r_an = (float(x[i]), float(y[i]))

    pose = {
        'nose': nose, 'left_shoulder': l_sh, 'right_shoulder': r_sh,
        'left_wrist': l_wr, 'right_wrist': r_wr,
        'left_elbow': _lerp2(l_sh, l_wr, 0.5), 'right_elbow': _lerp2(r_sh, r_wr, 0.5),
        'left_hip': l_hip, 'right_hip': r_hip,
        'left_ankle': l_an, 'right_ankle': r_an,
        'left_knee': _lerp2(l_hip, l_an, 0.5), 'right_knee': _lerp2(r_hip, r_an, 0.5),
    }
    return pose


def _tokens(s):
    out, cur = [], ''
    for ch in s.lower():
        if ch.isalnum():
            cur += ch
        else:
            if cur:
                out.append(cur)
            cur = ''
    if cur:
        out.append(cur)
    return out


def pose_from_channels(chans, flip_y=True, flip_x=False):
    """Map arbitrary MediaPipe-style CHOP channels onto our 13 landmarks.

    Accepts names such as  left_wrist:x, pose:left_wrist:tx, p1/left_wrist_x,
    landmark15_x, pose_15_x ...   Values are expected normalised 0..1 with
    y DOWN (MediaPipe) - flip_y converts to TD's y-up.
    """
    if not chans:
        return None
    axes = {}
    for key, val in chans.items():
        tk = _tokens(key)
        if not tk:
            continue
        last = tk[-1]
        if last in ('x', 'tx', 'u'):
            ax, base = 0, tk[:-1]
        elif last in ('y', 'ty', 'v'):
            ax, base = 1, tk[:-1]
        elif last.endswith('x') and len(last) > 1 and not last[-2].isdigit():
            ax, base = 0, tk[:-1] + [last[:-1]]
        elif last.endswith('y') and len(last) > 1 and not last[-2].isdigit():
            ax, base = 1, tk[:-1] + [last[:-1]]
        else:
            continue
        if 'world' in base or 'z' in base:
            continue
        axes.setdefault(tuple(base), [None, None])[ax] = float(val)

    pose = {}
    for name in LANDMARKS:
        idx = MP_INDEX[name]
        flat = name.replace('_', '')
        short = name.replace('left_', 'l').replace('right_', 'r')
        found = None
        for base, xy in axes.items():
            if xy[0] is None or xy[1] is None:
                continue
            joined = ''.join(base)
            if (flat in joined or (short in base) or str(idx) in base
                    or ('p%d' % idx) in base or ('landmark%d' % idx) in base
                    or ('pose%d' % idx) in base):
                # avoid 'left_wrist' matching 'left_wrist_pinky' style channels
                if flat in joined and joined.find(flat) + len(flat) < len(joined) \
                        and not joined.endswith(flat):
                    tail = joined[joined.find(flat) + len(flat):]
                    if tail.isalpha():
                        continue
                found = xy
                break
        if found is None:
            continue
        px, py = found
        if flip_x:
            px = 1.0 - px
        if flip_y:
            py = 1.0 - py
        pose[name] = (px, py)
    need = ('left_hip', 'right_hip', 'left_shoulder', 'right_shoulder')
    if not all(n in pose for n in need):
        return None
    # tolerate missing extremities by falling back to their anchors
    pose.setdefault('nose', _lerp2(pose['left_shoulder'], pose['right_shoulder'], 0.5))
    for side in ('left', 'right'):
        sh, hp = pose[side + '_shoulder'], pose[side + '_hip']
        pose.setdefault(side + '_elbow', sh)
        pose.setdefault(side + '_wrist', pose[side + '_elbow'])
        pose.setdefault(side + '_knee', hp)
        pose.setdefault(side + '_ankle', pose[side + '_knee'])
    return pose


def derived_points(pose):
    pel = _lerp2(pose['left_hip'], pose['right_hip'], 0.5)
    sh = _lerp2(pose['left_shoulder'], pose['right_shoulder'], 0.5)
    body = _lerp2(pel, sh, 0.35)
    return pel, sh, body


def torso_size(pose, aspect):
    pel, sh, _ = derived_points(pose)
    return max(1e-3, _len(((sh[0] - pel[0]) * aspect, sh[1] - pel[1])))


def pose_difference(pose, ref, aspect):
    """Mean displacement of the 8 key joints, normalised by torso length.
    Both poses are first aligned on their pelvis so travelling across the
    stage is not mistaken for a new pose."""
    if pose is None or ref is None:
        return float('inf')
    pa, _, _ = derived_points(pose)
    pb, _, _ = derived_points(ref)
    tot = 0.0
    for j in KEY_JOINTS:
        ax = (pose[j][0] - pa[0]) - (ref[j][0] - pb[0])
        ay = (pose[j][1] - pa[1]) - (ref[j][1] - pb[1])
        tot += math.hypot(ax * aspect, ay)
    return tot / len(KEY_JOINTS) / torso_size(pose, aspect)


def slot_offsets(mode, count, history_length):
    """History offsets (in cache entries) used by each silhouette instance.

    TIMED: frames ago, gaps growing with age. For 11 slots and 90 frames this
    reproduces the brief's 4, 8, 12, 17, 22, 28, 35, 43, 52, 62, 74 sequence
    to within one frame.
    KEYPOSE/HYBRID: each slot is one accepted key pose further back.
    """
    count = max(1, int(count))
    if mode != 'timed':
        return list(range(1, count + 1))
    H = max(int(history_length), count + 2)

    def f(i):  # cumulative sum of gaps 3.6 + 0.07 k^2  (4,4,4,5,5,6,7,8,9,10,12 ...)
        return 3.6 * i + 0.07 * i * (i + 1) * (2 * i + 1) / 6.0

    scale = 0.82 * H / f(count)
    out, prev = [], 0
    for i in range(1, count + 1):
        o = max(prev + 1, int(round(f(i) * scale)))
        o = min(o, H - 1)
        out.append(o)
        prev = o
    return out


# --------------------------------------------------------------------------
# engine
# --------------------------------------------------------------------------
class BloomEngine(object):

    def __init__(self):
        self.cache_size = None
        self.total_frames = 0  # never reset: drives the one-off background capture
        self.reset()

    def reset(self):
        self.history = deque(maxlen=self.cache_size or 512)
        self.capture_count = 0
        self.last_accepted = None
        self.last_capture_t = -1e9
        self.smoothed = None
        self.prev_smoothed = None
        self.pivot = (0.5, 0.45)
        self.trails = {j: deque(maxlen=MAX_TRAIL) for j in TRAIL_JOINTS}
        self.diff = 0.0
        self.pose_valid = False
        self.pose_source = 'none'
        self.frames = 0
        self.fps = 0.0
        self._last_t = None
        self.slots = []
        self.capture = False
        self.reset_cache = True
        self.data = None
        self.instances = []

    # ---------------------------------------------------------------- params
    @staticmethod
    def normalize_params(p):
        q = dict(DEFAULTS)
        q.update({k: v for k, v in (p or {}).items() if v is not None})
        q['Historymode'] = _menu_val(q['Historymode'], HISTORY_MODES, 'hybrid')
        q['Segsource'] = _menu_val(q['Segsource'], SEG_SOURCES, 'auto')
        q['Currentbodymode'] = _menu_val(q['Currentbodymode'], CURRENT_MODES, 'silhouette')
        q['Inputsource'] = _menu_val(q['Inputsource'], INPUT_SOURCES, 'camera')
        q['Pivotsource'] = _menu_val(q['Pivotsource'], ['body', 'pelvis'], 'body')
        q['Posecount'] = int(min(MAX_INSTANCES, max(1, int(q['Posecount']))))
        q['Historylength'] = int(max(q['Posecount'] + 2, int(q['Historylength'])))
        return q

    @staticmethod
    def seg_mode(p):
        src = p['Segsource']
        if src == 'auto':
            if p['Inputsource'] == 'test':
                src = 'alpha'
            elif p.get('Externalmask'):
                src = 'external'
            else:
                src = 'bgsub'
        return SEG_MODE_CODE[src]

    # ---------------------------------------------------------------- update
    def update(self, params, mask=None, ext_channels=None, t=0.0, frame=0,
               aspect=16.0 / 9.0):
        p = self.normalize_params(params)
        self.reset_cache = False

        size = max(p['Historylength'], p['Posecount'] + 2)
        if size != self.cache_size:
            self.cache_size = size
            self.reset()
            self.reset_cache = True

        if self._last_t is not None and t > self._last_t:
            inst = 1.0 / (t - self._last_t)
            self.fps = inst if self.fps == 0 else self.fps * 0.9 + inst * 0.1
        self._last_t = t
        self.frames += 1
        self.total_frames += 1

        # ---- pose ingest
        raw, src = None, 'none'
        if ext_channels:
            raw = pose_from_channels(ext_channels, p['Flipposey'], p['Flipposex'])
            src = 'external' if raw else 'none'
        if raw is None and mask is not None:
            raw = pose_from_mask(mask)
            src = 'mask' if raw else 'none'
        self.pose_source = src
        self.pose_valid = raw is not None

        if raw is not None:
            if self.smoothed is None:
                sm = dict(raw)
            else:
                a = 1.0 - min(0.97, max(0.0, float(p['Posesmoothing'])))
                sm = {k: _lerp2(self.smoothed[k], raw[k], a) for k in LANDMARKS}
            self.prev_smoothed = self.smoothed or sm
            self.smoothed = sm
            pel, sh, body = derived_points(sm)
            self.pivot = body if p['Pivotsource'] == 'body' else pel

        pose = self.smoothed
        frozen = bool(p['Freeze'])

        # ---- trails (every frame, not gated)
        if pose is not None and not frozen:
            for j in TRAIL_JOINTS:
                self.trails[j].appendleft(pose[j])

        # ---- key-pose gate
        mode = p['Historymode']
        self.diff = pose_difference(pose, self.last_accepted, aspect) if pose else 0.0
        since = t - self.last_capture_t
        capture = False
        if not frozen:
            if mode == 'timed':
                capture = True
            elif self.pose_valid:
                moved = self.diff > p['Movementthreshold'] and since >= p['Mininterval']
                if mode == 'keypose':
                    capture = moved or self.last_accepted is None
                else:  # hybrid
                    capture = moved or self.last_accepted is None or since >= p['Maxinterval']
        self.capture = capture

        if capture:
            self._push(pose, t, frame, aspect)

        # ---- per-instance transforms + texture
        self.slots = slot_offsets(mode, p['Posecount'], p['Historylength'])
        self.instances = self._instances(p, aspect)
        self.data = self._pack(p, t, aspect)
        return {
            'capture': capture,
            'slots': self.slots,
            'cache_size': self.cache_size,
            'reset_cache': self.reset_cache,
            'capture_bg': self.total_frames == 45,  # auto background plate after warm-up
            'data': self.data,
        }

    def _push(self, pose, t, frame, aspect):
        reach, motion = (0.0, 0.0), (0.0, 0.0)
        if pose is not None:
            pel, sh, body = derived_points(pose)
            ts = torso_size(pose, aspect)
            # reach: how far the limbs extend away from their resting places
            wr = _lerp2(pose['left_wrist'], pose['right_wrist'], 0.5)
            an = _lerp2(pose['left_ankle'], pose['right_ankle'], 0.5)
            arm = (((wr[0] - sh[0]) * aspect) / ts, (wr[1] - sh[1]) / ts + 0.9)
            leg = (((an[0] - pel[0]) * aspect) / ts, (an[1] - pel[1]) / ts + 1.6)
            # emphasise the single most extended wrist: raising ONE arm leans the branch
            best = None
            for j, anchor in (('left_wrist', sh), ('right_wrist', sh)):
                v = (((pose[j][0] - anchor[0]) * aspect) / ts, (pose[j][1] - anchor[1]) / ts + 0.9)
                if best is None or _len(v) > _len(best):
                    best = v
            reach = _clip_len((0.5 * arm[0] + 0.5 * best[0] + 0.3 * leg[0],
                               0.5 * arm[1] + 0.5 * best[1] + 0.3 * leg[1]), 2.0)
            # motion: displacement of extremities since the previously accepted pose
            ref = self.last_accepted or pose
            pr, _, _ = derived_points(ref)
            mx = my = 0.0
            for j in TRAIL_JOINTS:
                mx += ((pose[j][0] - pel[0]) - (ref[j][0] - pr[0])) * aspect
                my += (pose[j][1] - pel[1]) - (ref[j][1] - pr[1])
            motion = _clip_len((mx / 4.0 / ts, my / 4.0 / ts), 1.5)
            self.last_accepted = dict(pose)
        self.history.append({
            'id': self.capture_count, 't': t, 'frame': frame,
            'pivot': self.pivot, 'pose': dict(pose) if pose else None,
            'reach': reach, 'motion': motion,
        })
        self.capture_count += 1
        self.last_capture_t = t

    def entry(self, k):
        """k captures ago (0 = newest). Same indexing as Cache Select index -k."""
        if k < 0 or k >= len(self.history):
            return None
        return self.history[-1 - k]

    def _instances(self, p, aspect):
        n = p['Posecount']
        spread = math.radians(float(p['Rotationspread']))
        n_cw = (n + 1) // 2
        n_ccw = n // 2
        out = []
        for j in range(n):
            e = self.entry(self.slots[j]) if j < len(self.slots) else None
            fam = j % 2
            f = j // 2
            nf = n_cw if fam == 0 else n_ccw
            fam_age = f / float(nf - 1) if nf > 1 else 0.0
            age = j / float(n - 1) if n > 1 else 0.0
            direction = 1.0 if fam == 0 else -1.0
            reach = e['reach'] if e else (0.0, 0.0)
            motion = e['motion'] if e else (0.0, 0.0)
            seed = _hash01(e['id'] + 1) if e else 0.0
            if not p['Symmetry'] and abs(reach[0]) > 0.15:
                # 4D echo: the branch side follows where that pose actually reached
                direction = 1.0 if reach[0] > 0 else -1.0

            angle_cw = direction * fam_age * spread       # clockwise-positive
            rot = -angle_cw                               # shader uses CCW-positive
            scale = 1.0 + age * float(p['Scalespread'])
            dist = (fam_age ** 1.3) * float(p['Radialdistance']) * aspect
            ox = math.sin(angle_cw) * dist
            oy = math.cos(angle_cw) * dist
            oy += -float(p['Verticalbias']) * age        # negative bias -> upward

            bn = float(p['Branchnoise'])
            if bn and e:
                ox += (_hash01(e['id'] * 3 + 11) - 0.5) * 2.0 * bn * age * aspect
                oy += (_hash01(e['id'] * 7 + 5) - 0.5) * 2.0 * bn * age

            js = float(p['Jointbranchstrength'])
            if js and e:
                jv = (0.10 * reach[0] + 0.25 * motion[0], 0.10 * reach[1] + 0.25 * motion[1])
                jv = _clip_len(jv, 0.35)
                w = js * (age ** 0.8)
                ox += jv[0] * w
                oy += jv[1] * w
                rot += -jv[0] * w * 1.2   # lean the body toward its own reach

            op_ = _lerp(float(p['Maximumopacity']), float(p['Minimumopacity']),
                        age ** float(p['Decayexponent']))
            op_ *= float(p['Silhouetteopacity'])
            diss = 0.0
            if p['Particledissolve']:
                r = max(0.01, float(p['Dissolverange']))
                diss = _smoothstep(1.0 - r, 1.0, age) * 0.92
            out.append({
                'slot': self.slots[j] if j < len(self.slots) else 0,
                'offset': (ox, oy), 'rot': rot, 'scale': scale,
                'opacity': op_ if e else 0.0, 'valid': 1.0 if e else 0.0,
                'src_pivot': e['pivot'] if e else self.pivot,
                'age': age, 'dissolve': diss, 'seed': seed, 'dir': direction,
                'family': 'CLOCKWISE_BRANCH' if fam == 0 else 'COUNTERCLOCKWISE_BRANCH',
                'angle_deg': math.degrees(angle_cw),
            })
        return out

    def _pack(self, p, t, aspect):
        if np is None:
            return None
        d = np.zeros((TEX_H, TEX_W, 4), dtype=np.float32)
        n = p['Posecount']
        d[ROW_G0, 0] = (self.pivot[0], self.pivot[1], aspect, n)
        b, w = float(p['Backgroundbrightness']), float(p['Backgroundwarmth'])
        bg = [b * (1.0 - w + w * c) for c in WARM]
        d[ROW_G1, 0] = (bg[0], bg[1], bg[2], float(p['Historyink']))
        d[ROW_G2, 0] = (CURRENT_MODES.index(p['Currentbodymode']),
                        float(p['Currentopacity']), 1.0 if p['Particledissolve'] else 0.0, t)
        d[ROW_G3, 0] = (float(p['Trunkhold']), float(p['Trunkradius']),
                        float(p['Currentink']), float(p['Vignette']))
        for i, ins in enumerate(self.instances[:MAX_INSTANCES]):
            d[ROW_I0, i] = (ins['offset'][0], ins['offset'][1], ins['rot'], ins['scale'])
            d[ROW_I1, i] = (ins['opacity'], ins['valid'], ins['src_pivot'][0], ins['src_pivot'][1])
            d[ROW_I2, i] = (ins['age'], ins['dissolve'], ins['seed'], ins['dir'])
        tl = int(min(MAX_TRAIL, max(2, int(p['Traillength']))))
        for r, j in enumerate(TRAIL_JOINTS):
            for k, pt in enumerate(list(self.trails[j])[:tl]):
                d[ROW_T0 + r, k] = (pt[0], pt[1], 1.0, 0.0)
        mask_bits = (3 if p['Showwristtrails'] else 0) | (12 if p['Showankletrails'] else 0)
        d[ROW_TG, 0] = (tl, float(p['Trailwidth']), float(p['Trailopacity']), mask_bits)
        d[ROW_SEG, 0] = (self.seg_mode(p), float(p['Segthreshold']),
                         float(p['Segsoftness']), float(p['Erode']))
        d[ROW_SEG2, 0] = (float(p['Dilate']), t, 1.0 if p['Keyinvert'] else 0.0, 0.0)
        if self.smoothed:
            for c, name in enumerate(LANDMARKS):
                x, y = self.smoothed[name]
                d[ROW_LM, c] = (x, y, 1.0, 0.0)
            pel, sh, body = derived_points(self.smoothed)
            d[ROW_LM, 13] = (pel[0], pel[1], 1.0, 0.0)
            d[ROW_LM, 14] = (sh[0], sh[1], 1.0, 0.0)
            d[ROW_LM, 15] = (body[0], body[1], 1.0, 0.0)
        d[ROW_DBG, 0] = (self.fps, len(self.history), min(self.diff, 99.0),
                         1.0 if self.capture else 0.0)
        cnt = float(p['Particlecount'])
        d[ROW_DUST, 0] = (min(1.0, cnt / 20000.0), float(p['Particlelifetime']),
                          float(p['Particlenoise']), float(p['Particledrift']))
        d[ROW_DUST, 1] = (1.0 / max(1.0, self.fps or 60.0), 0.0, 0.0, 0.0)
        return d

    # ---------------------------------------------------------------- outputs
    def pose_channels(self):
        out = {}
        pose = self.smoothed
        if not pose:
            return {'valid': 0.0}
        pel, sh, body = derived_points(pose)
        out.update({
            'pelvis_x': pel[0], 'pelvis_y': pel[1],
            'shoulder_x': sh[0], 'shoulder_y': sh[1],
            'body_x': body[0], 'body_y': body[1],
            'pivot_x': self.pivot[0], 'pivot_y': self.pivot[1],
        })
        short = {'left_wrist': 'lwrist', 'right_wrist': 'rwrist',
                 'left_ankle': 'lankle', 'right_ankle': 'rankle'}
        for k, s in short.items():
            out[s + '_x'], out[s + '_y'] = pose[k]
        prev = self.prev_smoothed or pose
        for k, s in short.items():
            out[s + '_vx'] = pose[k][0] - prev[k][0]
            out[s + '_vy'] = pose[k][1] - prev[k][1]
        for k in LANDMARKS:
            out[k + '_x'], out[k + '_y'] = pose[k]
        out['valid'] = 1.0 if self.pose_valid else 0.0
        return out

    def keypose_channels(self):
        return {
            'pose_difference': min(self.diff, 99.0),
            'capture': 1.0 if self.capture else 0.0,
            'history_count': float(len(self.history)),
            'captures_total': float(self.capture_count),
            'fps': self.fps,
        }


# --------------------------------------------------------------------------
# module-level singleton (TD: survives between frames while the DAT is unchanged)
# --------------------------------------------------------------------------
_ENGINE = None


def get_engine():
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = BloomEngine()
    return _ENGINE


def read_params(comp):
    """Collect every custom parameter of a TD COMP into a plain dict."""
    out = {}
    for par in comp.customPars:
        try:
            v = par.eval()
        except Exception:
            continue
        if par.isOP:
            v = v.path if v else ''
        elif par.isMenu:
            v = par.eval()
        out[par.name] = v
    return out
