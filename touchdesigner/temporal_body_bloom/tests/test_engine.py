"""Offline tests for the TEMPORAL BODY BLOOM engine and the shader math.

    python -m unittest discover -s touchdesigner/temporal_body_bloom/tests
"""
import math
import os
import sys
import unittest

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import engine as E  # noqa: E402
import cpu_reference as C  # noqa: E402

ASPECT = 16.0 / 9.0


def make_pose(lw=(0.40, 0.45), rw=(0.60, 0.45), shift=(0.0, 0.0)):
    base = {
        'nose': (0.5, 0.80), 'left_shoulder': (0.46, 0.70), 'right_shoulder': (0.54, 0.70),
        'left_elbow': (0.43, 0.58), 'right_elbow': (0.57, 0.58),
        'left_wrist': lw, 'right_wrist': rw,
        'left_hip': (0.48, 0.45), 'right_hip': (0.52, 0.45),
        'left_knee': (0.47, 0.28), 'right_knee': (0.53, 0.28),
        'left_ankle': (0.47, 0.10), 'right_ankle': (0.53, 0.10),
    }
    return {k: (v[0] + shift[0], v[1] + shift[1]) for k, v in base.items()}


def channels(pose, mediapipe_style=True):
    """Fake MediaPipe CHOP channels (y down)."""
    out = {}
    for name, (x, y) in pose.items():
        key = 'pose:%s' % name if mediapipe_style else 'landmark%d' % E.MP_INDEX[name]
        out[key + ':x'] = x
        out[key + ':y'] = 1.0 - y
    return out


class TestSlots(unittest.TestCase):
    def test_timed_offsets_follow_brief(self):
        offs = E.slot_offsets('timed', 11, 90)
        self.assertEqual(len(offs), 11)
        self.assertEqual(offs[0], 4)
        self.assertEqual(offs[-1], 74)
        self.assertTrue(all(b > a for a, b in zip(offs, offs[1:])), offs)
        # within 1 frame of the brief's sequence
        brief = [4, 8, 12, 17, 22, 28, 35, 43, 52, 62, 74]
        self.assertTrue(all(abs(a - b) <= 1 for a, b in zip(offs, brief)), offs)

    def test_slots_are_distinct(self):
        for mode in ('timed', 'keypose', 'hybrid'):
            for n in (12, 16, 24):
                offs = E.slot_offsets(mode, n, 90)
                self.assertEqual(len(set(offs)), n, (mode, n))
                self.assertNotIn(0, offs)  # never the current frame


class TestKeyPoseGate(unittest.TestCase):
    def run_poses(self, poses, params, dt=1 / 30.0):
        eng = E.BloomEngine()
        caps = []
        for i, pose in enumerate(poses):
            r = eng.update(params, ext_channels=channels(pose), t=i * dt, frame=i)
            caps.append(r['capture'])
        return eng, caps

    def test_static_pose_is_not_recaptured(self):
        eng, caps = self.run_poses([make_pose()] * 60,
                                   {'Historymode': 'keypose', 'Posesmoothing': 0})
        self.assertEqual(sum(caps), 1)

    def test_movement_triggers_capture(self):
        poses = [make_pose()] * 10 + [make_pose(rw=(0.70, 0.85))] * 10
        eng, caps = self.run_poses(poses, {'Historymode': 'keypose', 'Posesmoothing': 0})
        self.assertEqual(sum(caps), 2)
        self.assertTrue(caps[10])

    def test_travel_is_not_a_new_pose(self):
        poses = [make_pose(shift=(i * 0.005, 0)) for i in range(40)]
        eng, caps = self.run_poses(poses, {'Historymode': 'keypose', 'Posesmoothing': 0})
        self.assertEqual(sum(caps), 1)

    def test_hybrid_timeout(self):
        eng, caps = self.run_poses([make_pose()] * 61,
                                   {'Historymode': 'hybrid', 'Maxinterval': 0.5,
                                    'Posesmoothing': 0})
        self.assertEqual(sum(caps), 5)  # t = 0, .5, 1.0, 1.5, 2.0

    def test_timed_captures_every_frame(self):
        eng, caps = self.run_poses([make_pose()] * 20, {'Historymode': 'timed'})
        self.assertTrue(all(caps))

    def test_freeze_keeps_sculpture(self):
        eng = E.BloomEngine()
        p = {'Historymode': 'timed', 'Historylength': 30, 'Posecount': 12}
        for i in range(40):
            eng.update(p, ext_channels=channels(make_pose()), t=i / 30.0)
        n = len(eng.history)
        p['Freeze'] = True
        for i in range(40, 80):
            r = eng.update(p, ext_channels=channels(make_pose(rw=(0.7, 0.9))), t=i / 30.0)
            self.assertFalse(r['capture'])
        self.assertEqual(len(eng.history), n)
        self.assertTrue(all(ins['valid'] for ins in eng.instances))

    def test_reset_clears_history(self):
        eng = E.BloomEngine()
        for i in range(30):
            eng.update({'Historymode': 'timed'}, ext_channels=channels(make_pose()), t=i / 30.0)
        eng.reset()
        self.assertEqual(len(eng.history), 0)
        r = eng.update({'Historymode': 'timed'}, ext_channels=channels(make_pose()), t=2.0)
        self.assertTrue(r['capture'])
        self.assertEqual(len(eng.history), 1)
        self.assertFalse(any(ins['valid'] for ins in eng.instances[1:]))


class TestPoseSources(unittest.TestCase):
    def test_mediapipe_channel_names(self):
        pose = make_pose(rw=(0.7, 0.8))
        for style in (True, False):
            got = E.pose_from_channels(channels(pose, style))
            self.assertIsNotNone(got)
            for k in E.LANDMARKS:
                self.assertAlmostEqual(got[k][0], pose[k][0], places=5)
                self.assertAlmostEqual(got[k][1], pose[k][1], places=5)

    def test_derived_points(self):
        pel, sh, body = E.derived_points(make_pose())
        self.assertAlmostEqual(pel[1], 0.45)
        self.assertAlmostEqual(sh[1], 0.70)
        self.assertAlmostEqual(body[1], 0.45 + 0.35 * 0.25)

    def test_mask_fallback_tracks_dancer(self):
        w, h = 256, 144
        for t in (0.0, 3.0, 6.0, 9.0):
            m = C.dancer_mask(t, w, h)
            pose = E.pose_from_mask(m)
            J = C.dancer_joints(t, w / float(h))
            pel, _, _ = E.derived_points(pose)
            self.assertLess(abs(pel[0] - J['pel'][0] / (w / float(h))), 0.03)
            self.assertLess(abs(pel[1] - J['pel'][1]), 0.05)

    def test_empty_mask(self):
        self.assertIsNone(E.pose_from_mask(np.zeros((72, 128), np.float32)))


class TestTransforms(unittest.TestCase):
    def setUp(self):
        self.eng = E.BloomEngine()
        for i in range(120):
            pose = make_pose(rw=(0.6 + 0.1 * math.sin(i * 0.3), 0.45 + 0.3 * abs(math.sin(i * 0.2))),
                             shift=(0.002 * i, 0))
            self.eng.update({'Historymode': 'hybrid', 'Posecount': 16},
                            ext_channels=channels(pose), t=i / 30.0, frame=i)

    def test_instance_rules(self):
        inst = self.eng.instances
        self.assertEqual(len(inst), 16)
        cw = [i for i in inst if i['family'] == 'CLOCKWISE_BRANCH']
        ccw = [i for i in inst if i['family'] == 'COUNTERCLOCKWISE_BRANCH']
        self.assertEqual(len(cw), 8)
        self.assertEqual(len(ccw), 8)
        self.assertAlmostEqual(cw[-1]['angle_deg'], 125.0)
        self.assertAlmostEqual(ccw[-1]['angle_deg'], -125.0)
        self.assertAlmostEqual(cw[1]['angle_deg'], 125.0 / 7)
        ops = [i['opacity'] for i in inst]
        self.assertAlmostEqual(ops[0], 0.92, places=5)
        self.assertAlmostEqual(ops[-1], 0.12, places=5)
        self.assertTrue(all(a >= b for a, b in zip(ops, ops[1:])))
        self.assertAlmostEqual(inst[-1]['scale'], 1.28)

    def test_rotation_is_around_body_pivot_not_screen_centre(self):
        """With trunk hold off, the current pivot maps exactly onto each
        historical pivot (pivot is the fixed point), for every instance."""
        p = E.normalize = None  # noqa: F841  (keep linter quiet)
        d = self.eng.data.copy()
        d[E.ROW_G3, 0, 0] = 0.0                     # trunk hold off
        cx, cy = d[E.ROW_G0, 0, 0], d[E.ROW_G0, 0, 1]
        aspect = d[E.ROW_G0, 0, 2]
        for i in range(16):
            ox, oy = d[E.ROW_I0, i, 0], d[E.ROW_I0, i, 1]
            u = np.array([cx + ox / aspect])
            v = np.array([cy + oy])
            su, sv = C.instance_source_uv(d, i, u, v)
            self.assertAlmostEqual(su[0], d[E.ROW_I1, i, 2], places=5)
            self.assertAlmostEqual(sv[0], d[E.ROW_I1, i, 3], places=5)
            # and the screen centre is NOT a fixed point for rotated instances
            if abs(d[E.ROW_I0, i, 2]) > 0.3:
                su2, sv2 = C.instance_source_uv(d, i, np.array([0.5]), np.array([0.5]))
                self.assertGreater(math.hypot(su2[0] - 0.5, sv2[0] - 0.5), 0.01)

    def test_historical_pivots_differ(self):
        piv = [ins['src_pivot'] for ins in self.eng.instances if ins['valid']]
        self.assertGreater(len(set(piv)), 8)  # the dancer travelled: pivots are per-capture

    def test_texture_layout(self):
        d = self.eng.data
        self.assertEqual(d.shape, (E.TEX_H, E.TEX_W, 4))
        self.assertEqual(d.dtype, np.float32)
        self.assertEqual(int(d[E.ROW_G0, 0, 3]), 16)
        np.testing.assert_allclose(d[E.ROW_G1, 0, :3], (0.92, 0.84, 0.70), atol=0.005)

    def test_joint_branch_follows_raised_arm(self):
        """Raising the right arm should push older silhouettes toward the right."""
        def run(rw):
            eng = E.BloomEngine()
            for i in range(90):
                wob = 0.12 * math.sin(i * 0.5)
                pose = make_pose(rw=(rw[0] + wob * 0.2, rw[1] + wob), lw=(0.40, 0.45 + wob))
                eng.update({'Historymode': 'keypose', 'Symmetry': False,
                            'Jointbranchstrength': 1.0, 'Branchnoise': 0.0},
                           ext_channels=channels(pose), t=i / 30.0)
            return np.mean([ins['offset'][0] for ins in eng.instances if ins['valid']])
        self.assertGreater(run((0.75, 0.85)), run((0.60, 0.40)))


class TestEndToEnd(unittest.TestCase):
    def test_silhouettes_are_distinct_poses(self):
        eng, shots, log = C.simulate({'Historymode': 'hybrid'}, seconds=6.0, snapshots=(6.0,),
                                     out_w=160, out_h=90, mask_w=160, mask_h=90)
        img, m, slots, inst, n = shots[6.0]
        self.assertGreater(n, 8)
        # the sampled history frames must not be identical images
        caps = sum(1 for _, c, _ in log if c)
        self.assertGreater(caps, 8)
        # the composite has a large shadow sculpture beyond the current body
        dark = (img.mean(axis=2) < 0.5).sum()
        body = (m > 0.5).sum() * (160 * 90) / float(m.size)
        self.assertGreater(dark, 2.0 * body)


if __name__ == '__main__':
    unittest.main()
