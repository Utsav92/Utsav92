# 06_BODY_TRANSFORMS / params_tex (Script TOP, 32-bit float RGBA)
# Uploads the engine's 32 x 20 parameter texture (per-instance rotation, scale,
# radial offset, opacity, historical pivots, trails, landmarks ...).
ROOT = '/project1/TEMPORAL_BODY_BLOOM'


def onCook(scriptOp):
	E = mod(ROOT + '/04_TEMPORAL_MEMORY/bloom_engine')
	eng = E.get_engine()
	data = eng.data
	if data is None:
		import numpy
		data = numpy.zeros((E.TEX_H, E.TEX_W, 4), dtype=numpy.float32)
	scriptOp.copyNumpyArray(data)
	return
