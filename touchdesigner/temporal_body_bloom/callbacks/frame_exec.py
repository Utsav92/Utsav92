# 04_TEMPORAL_MEMORY / frame_exec  (Execute DAT, Frame Start ON)
# Drives the whole temporal system once per frame:
#   pose ingest -> key-pose gate -> Cache TOP write-enable -> per-slot Cache
#   Select indices -> parameter texture. No per-pixel Python anywhere.
ROOT = '/project1/TEMPORAL_BODY_BLOOM'
MEM = ROOT + '/04_TEMPORAL_MEMORY'
_idx_par = None   # resolved Cache Select index parameter name
_reset_names = ('resetpulse', 'reset', 'clear', 'clearpulse')


def _engine_mod():
	return mod(MEM + '/bloom_engine')


def _set_index(cs, value):
	global _idx_par
	if _idx_par is None:
		for name in ('cacheindex', 'index', 'outputindex'):
			if hasattr(cs.par, name):
				_idx_par = name
				break
	if _idx_par and getattr(cs.par, _idx_par).eval() != value:
		setattr(cs.par, _idx_par, value)


def reset_cache():
	cache = op(MEM + '/history_cache')
	for n in _reset_names:
		p = getattr(cache.par, n, None)
		if p is not None and p.isPulse:
			p.pulse()
			return True
	# fallback: toggling the cache size flushes the Cache TOP
	s = cache.par.cachesize.eval()
	cache.par.cachesize = s + 1
	cache.par.cachesize = s
	return False


def onFrameStart(frame):
	root = op(ROOT)
	if root is None:
		return
	E = _engine_mod()
	eng = E.get_engine()
	params = E.read_params(root)

	# ---- pose inputs: external MediaPipe CHOP first, mask geometry fallback
	ext = None
	chop = root.par.Externalposechop.eval()
	if chop is not None:
		try:
			ext = {c.name: c.eval() for c in chop.chans()}
		except Exception:
			ext = None
	mask = None
	ms = op(ROOT + '/03_POSE_TRACKING/mask_small')
	try:
		ms.cook(force=True)              # 128x72 - tiny GPU->CPU download
		a = ms.numpyArray(delayed=True)
		if a is not None:
			mask = a[:, :, 0]
	except Exception:
		mask = None

	aspect = float(root.par.Procw) / max(1.0, float(root.par.Proch))
	res = eng.update(params, mask=mask, ext_channels=ext,
	                 t=absTime.seconds, frame=absTime.frame, aspect=aspect)

	# ---- frame history (Cache TOP mirrors eng.history 1:1)
	cache = op(MEM + '/history_cache')
	if cache.par.cachesize.eval() != res['cache_size']:
		cache.par.cachesize = res['cache_size']
	if res['reset_cache']:
		reset_cache()
	cache.par.active = bool(res['capture'])

	slots = res['slots']
	for i in range(E.MAX_INSTANCES):
		cs = op(MEM + '/hist_%02d' % i)
		if cs is not None:
			_set_index(cs, -(slots[i] if i < len(slots) else 0))

	# ---- background plate (auto once after warm-up, or via pulse)
	if res['capture_bg']:
		bg = op(ROOT + '/02_SEGMENTATION/bg_plate')
		bg.par.active = True
		run("op(%r).par.active = False" % bg.path, delayFrames=2)

	# ---- push data to the network
	for path in ('/03_POSE_TRACKING/pose_out', '/05_KEYPOSE_ANALYSIS/keypose_chop',
	             '/06_BODY_TRANSFORMS/params_tex'):
		o = op(ROOT + path)
		if o is not None:
			o.cook(force=True)

	if frame % 15 == 0:
		_update_tables(eng)


def _update_tables(eng):
	t = op(ROOT + '/06_BODY_TRANSFORMS/instance_table')
	if t is not None:
		t.clear()
		t.appendRow(['i', 'family', 'slot', 'angle', 'scale', 'off_x', 'off_y',
		             'opacity', 'valid', 'pivot_x', 'pivot_y'])
		for i, ins in enumerate(eng.instances):
			t.appendRow([i, ins['family'], ins['slot'], '%.1f' % ins['angle_deg'],
			             '%.3f' % ins['scale'], '%.3f' % ins['offset'][0],
			             '%.3f' % ins['offset'][1], '%.2f' % ins['opacity'],
			             int(ins['valid']), '%.3f' % ins['src_pivot'][0],
			             '%.3f' % ins['src_pivot'][1]])
	h = op(MEM + '/history_info')
	if h is not None:
		h.clear()
		h.appendRow(['captures_ago', 'id', 'time', 'frame', 'pivot_x', 'pivot_y'])
		for k in range(min(len(eng.history), 40)):
			e = eng.entry(k)
			h.appendRow([k, e['id'], '%.2f' % e['t'], e['frame'],
			             '%.3f' % e['pivot'][0], '%.3f' % e['pivot'][1]])
	txt = op(ROOT + '/12_DEBUG/fps_text')
	if txt is not None:
		txt.par.text = 'FPS %.1f  |  pose: %s  |  history %d  |  pose diff %.3f  |  %s' % (
			eng.fps, eng.pose_source, len(eng.history), min(eng.diff, 99.0),
			'CAPTURE' if eng.capture else '')
