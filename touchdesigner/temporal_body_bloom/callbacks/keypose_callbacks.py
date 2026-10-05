# 05_KEYPOSE_ANALYSIS / keypose_chop (Script CHOP)
# pose_difference = mean displacement of wrists/elbows/knees/ankles vs the last
# accepted key pose, normalised by torso length (pelvis aligned).
ROOT = '/project1/TEMPORAL_BODY_BLOOM'


def onCook(scriptOp):
	eng = mod(ROOT + '/04_TEMPORAL_MEMORY/bloom_engine').get_engine()
	scriptOp.clear()
	scriptOp.numSamples = 1
	for name, v in eng.keypose_channels().items():
		scriptOp.appendChan(name)[0] = float(v)
	return
