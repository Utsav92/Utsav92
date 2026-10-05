"""
CPU (numpy) reference of the GPU pipeline, for offline verification.

  test dancer  ->  mask  ->  engine (pose, key-pose gate, history, transforms)
  ->  bloom composite  ->  PNG

Mirrors shaders/test_dancer.glsl, shaders/common.glsl (instanceSourceUV) and
shaders/bloom_composite.glsl (without particle dissolve / trails). Arrays use
TD orientation (row 0 = bottom); images are flipped only when saved.

usage:  python tools/cpu_reference.py  [out_dir]
"""
import math
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import engine as E  # noqa: E402


# ------------------------------------------------------------------ dancer
def _rot(v, a):
    c, s = math.cos(a), math.sin(a)
    return np.array([c * v[0] - s * v[1], s * v[0] + c * v[1]])


def _limb(ang, side, lean):
    return _rot((math.sin(ang) * side, -math.cos(ang)), lean)


def dancer_joints(t, aspect):
    pel = np.array([(0.5 + 0.10 * math.sin(t * 0.37)) * aspect, 0.40 + 0.015 * math.sin(t * 1.3)])
    lean = 0.22 * math.sin(t * 0.43)
    up = _rot((0.0, 1.0), lean)
    neck = pel + up * 0.22
    head = neck + up * 0.075
    la = 1.3 + 1.1 * math.sin(t * 0.9) + 0.4 * math.sin(t * 0.31 + 1.0)
    ra = 1.2 + 1.2 * math.sin(t * 0.77 + 2.0) + 0.3 * math.sin(t * 0.23)
    le = 0.6 + 0.6 * math.sin(t * 1.7)
    re = 0.5 + 0.6 * math.sin(t * 1.3 + 1.0)
    lsh = neck + _rot((-0.055, -0.02), lean)
    rsh = neck + _rot((0.055, -0.02), lean)
    lel = lsh + _limb(la, -1, lean) * 0.12
    rel = rsh + _limb(ra, 1, lean) * 0.12
    lwr = lel + _limb(la + le, -1, lean) * 0.11
    rwr = rel + _limb(ra + re, 1, lean) * 0.11
    kick = max(0.0, math.sin(t * 0.5)) ** 8 * 1.3
    lh = 0.12 + 0.1 * math.sin(t * 0.8) + kick
    rh = 0.12 + 0.1 * math.sin(t * 0.8 + 3.14)
    lhp = pel + np.array([-0.035, 0.0])
    rhp = pel + np.array([0.035, 0.0])
    lkn = lhp + _limb(lh, -1, 0) * 0.17
    rkn = rhp + _limb(rh, 1, 0) * 0.17
    lan = lkn + _limb(lh * 0.4, -1, 0) * 0.17
    ran = rkn + _limb(rh * 0.4, 1, 0) * 0.17
    return dict(pel=pel, neck=neck, head=head, lsh=lsh, rsh=rsh, lel=lel, rel=rel,
                lwr=lwr, rwr=rwr, lhp=lhp, rhp=rhp, lkn=lkn, rkn=rkn, lan=lan, ran=ran)


def _capsule(px, py, a, b, r):
    bax, bay = b[0] - a[0], b[1] - a[1]
    pax, pay = px - a[0], py - a[1]
    h = np.clip((pax * bax + pay * bay) / (bax * bax + bay * bay), 0, 1)
    return np.hypot(pax - bax * h, pay - bay * h) - r


def dancer_mask(t, w, h):
    aspect = w / float(h)
    J = dancer_joints(t, aspect)
    ys, xs = np.mgrid[0:h, 0:w]
    px = (xs + 0.5) / w * aspect
    py = (ys + 0.5) / h
    d = np.hypot(px - J['head'][0], py - J['head'][1]) - 0.045
    for a, b, r in [('pel', 'neck', 0.05), ('lsh', 'rsh', 0.03), ('lsh', 'lel', 0.022),
                    ('lel', 'lwr', 0.018), ('rsh', 'rel', 0.022), ('rel', 'rwr', 0.018),
                    ('lhp', 'lkn', 0.03), ('lkn', 'lan', 0.024), ('rhp', 'rkn', 0.03),
                    ('rkn', 'ran', 0.024)]:
        d = np.minimum(d, _capsule(px, py, J[a], J[b], r))
    return (1.0 - np.clip(d / 0.004, 0, 1)).astype(np.float32)


# ------------------------------------------------------------------ shader port
def _smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def instance_source_uv(data, i, u, v):
    """numpy port of common.glsl instanceSourceUV."""
    g0, g3 = data[E.ROW_G0, 0], data[E.ROW_G3, 0]
    a, b = data[E.ROW_I0, i], data[E.ROW_I1, i]
    aspect = g0[2]
    qx, qy = u * aspect, v
    cpx, cpy = g0[0] * aspect, g0[1]
    spx, spy = b[2] * aspect, b[3]
    d = np.hypot(qx - cpx - a[0] * 0.5, qy - cpy - a[1] * 0.5)
    w = _smoothstep(g3[1] * 0.3, g3[1] * 1.5, d)
    k = (1.0 - g3[0]) + (1.0 - (1.0 - g3[0])) * w
    rot = a[2] * k
    sc = 1.0 + (a[3] - 1.0) * k
    rx, ry = qx - cpx - a[0] * k, qy - cpy - a[1] * k
    c, s = np.cos(-rot), np.sin(-rot)
    rx, ry = (c * rx - s * ry) / sc, (s * rx + c * ry) / sc
    return (spx + rx) / aspect, spy + ry


def sample(img, u, v):
    h, w = img.shape
    ok = (u >= 0) & (u <= 1) & (v >= 0) & (v <= 1)
    x = np.clip((u * w).astype(int), 0, w - 1)
    y = np.clip((v * h).astype(int), 0, h - 1)
    return np.where(ok, img[y, x], 0.0)


def bloom(data, cur_mask, history_imgs, w, h):
    """numpy port of bloom_composite.glsl (dissolve/trails omitted)."""
    ys, xs = np.mgrid[0:h, 0:w]
    u = (xs + 0.5) / w
    v = (ys + 0.5) / h
    g0, g1, g2, g3 = (data[r, 0] for r in (E.ROW_G0, E.ROW_G1, E.ROW_G2, E.ROW_G3))
    n = int(g0[3] + 0.5)
    shadow = np.zeros((h, w), np.float32)
    for i in range(n):
        b = data[E.ROW_I1, i]
        if b[1] < 0.5 or b[0] <= 0.001:
            continue
        su, sv = instance_source_uv(data, i, u, v)
        shadow = np.maximum(shadow, sample(history_imgs[i], su, sv) * b[0])
    aspect = g0[2]
    r = np.hypot((u - 0.5) * aspect, v - 0.5)
    bg = g1[:3][None, None, :] * (1.0 - g3[3] * _smoothstep(0.35, 1.05, r))[..., None]
    col = bg + (g1[3] - bg) * shadow[..., None]
    mc = sample(cur_mask, u, v) * g2[1]
    if int(g2[0] + 0.5) == 0:
        col = col + (g3[2] - col) * mc[..., None]
    return np.clip(col, 0, 1)


# ------------------------------------------------------------------ simulation
def simulate(params=None, seconds=12.0, fps=30, out_w=480, out_h=270, mask_w=320, mask_h=180,
             snapshots=(4.0, 8.0, 12.0)):
    eng = E.BloomEngine()
    cache = []  # mirrors the Cache TOP (newest last)
    shots = {}
    frames = int(seconds * fps)
    log = []
    for f in range(frames):
        t = f / float(fps)
        m = dancer_mask(t, mask_w, mask_h)
        small = m[::max(1, mask_h // 72), ::max(1, mask_w // 128)]
        res = eng.update(params or {}, mask=small, t=t, frame=f, aspect=mask_w / float(mask_h))
        if res['reset_cache']:
            cache = []
        if res['capture']:
            cache.append(m)
            cache = cache[-res['cache_size']:]
        log.append((t, res['capture'], eng.diff))
        snap = [s for s in snapshots if abs(t - (s - 1.0 / fps)) < 0.5 / fps]
        if snap:
            hist = []
            for k in res['slots']:
                hist.append(cache[-1 - k] if k < len(cache) else np.zeros_like(m))
            img = bloom(res['data'], m, hist, out_w, out_h)
            shots[snap[0]] = (img, m, list(res['slots']), [dict(x) for x in eng.instances],
                              len(cache))
    return eng, shots, log


def save_png(path, rgb_bottom_up):
    from PIL import Image
    a = np.flipud(np.clip(rgb_bottom_up, 0, 1))
    if a.ndim == 2:
        a = np.repeat(a[..., None], 3, axis=2)
    Image.fromarray((a * 255).astype(np.uint8)).save(path)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'preview')
    os.makedirs(out, exist_ok=True)
    for preset in ('reference', 'tree', 'mandala', 'echo4d'):
        p = dict(E.PRESETS[preset])
        p['Particledissolve'] = False
        eng, shots, log = simulate(p)
        caps = sum(1 for _, c, _ in log if c)
        for s, (img, m, slots, inst, n) in sorted(shots.items()):
            save_png(os.path.join(out, '%s_t%02d.png' % (preset, int(s))), img)
        print('%-9s captures=%d history=%d' % (preset, caps, len(eng.history)))
