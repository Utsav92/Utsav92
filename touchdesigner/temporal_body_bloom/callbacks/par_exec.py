# 11_CONTROLS / par_exec (Parameter Execute DAT watching TEMPORAL_BODY_BLOOM)
import os
import datetime

ROOT = '/project1/TEMPORAL_BODY_BLOOM'


def _E():
	return mod(ROOT + '/04_TEMPORAL_MEMORY/bloom_engine')


def apply_preset(name):
	E = _E()
	preset = E.PRESETS.get(str(name).lower())
	if not preset:
		return
	root = op(ROOT)
	for k, v in preset.items():
		p = getattr(root.par, k, None)
		if p is not None:
			p.val = v
	debug('TEMPORAL BODY BLOOM preset ->', name)


def reset_cache():
	cache = op(ROOT + '/04_TEMPORAL_MEMORY/history_cache')
	for n in ('resetpulse', 'reset', 'clear', 'clearpulse'):
		p = getattr(cache.par, n, None)
		if p is not None and p.isPulse:
			p.pulse()
			return
	s = cache.par.cachesize.eval()      # fallback: resizing flushes the cache
	cache.par.cachesize = s + 1
	cache.par.cachesize = s


def reset_history():
	_E().get_engine().reset()
	reset_cache()
	fb = op(ROOT + '/08_PARTICLE_DECAY/dust_feedback')
	if fb is not None and hasattr(fb.par, 'resetpulse'):
		fb.par.resetpulse.pulse()


def capture_background():
	bg = op(ROOT + '/02_SEGMENTATION/bg_plate')
	bg.par.active = True
	run("op(%r).par.active = False" % bg.path, delayFrames=2)


def set_fullscreen(on):
	win = op(ROOT + '/10_OUTPUT/FULLSCREEN_OUT')
	if win is None:
		return
	if on:
		win.par.winopen.pulse()
	else:
		win.par.winclose.pulse()


def set_record(on):
	rec = op(ROOT + '/10_OUTPUT/recorder')
	if on:
		folder = os.path.join(project.folder, 'recordings')
		os.makedirs(folder, exist_ok=True)
		stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
		rec.par.file = os.path.join(folder, 'temporal_body_bloom_%s.mp4' % stamp)
	rec.par.record = bool(on)


def set_external_mask(path):
	sel = op(ROOT + '/02_SEGMENTATION/ext_mask_in')
	sw = op(ROOT + '/02_SEGMENTATION/ext_mask_switch')
	sel.par.top = path or ''
	sw.par.index = 1 if path else 0


def set_camera(name):
	cam = op(ROOT + '/01_INPUT/cam_in')
	if name:
		try:
			cam.par.device = name
		except Exception as e:
			debug('Camera device not found:', name, e)


def onPulse(par):
	n = par.name
	if n == 'Resethistory':
		reset_history()
	elif n == 'Capturebackground':
		capture_background()
	elif n == 'Applypreset':
		apply_preset(par.owner.par.Preset.eval())
	return


def onValueChange(par, prev):
	n = par.name
	if n == 'Preset':
		apply_preset(par.eval())
	elif n == 'Fullscreen':
		set_fullscreen(par.eval())
	elif n == 'Record':
		set_record(par.eval())
	elif n == 'Externalmask':
		v = par.eval()
		set_external_mask(v.path if v else '')
	elif n == 'Camera':
		set_camera(par.eval())
	elif n == 'Historylength' or n == 'Posecount' or n == 'Historymode':
		reset_history()
	return
