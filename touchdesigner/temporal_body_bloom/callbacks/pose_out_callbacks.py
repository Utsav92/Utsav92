# 03_POSE_TRACKING / pose_out (Script CHOP) -> POSE_DATA_OUT
# Channels: pelvis_x/y shoulder_x/y body_x/y pivot_x/y lwrist_x/y rwrist_x/y
#           lankle_x/y rankle_x/y (+ velocities, all 13 landmarks, valid)
ROOT = '/project1/TEMPORAL_BODY_BLOOM'


def onCook(scriptOp):
	eng = mod(ROOT + '/04_TEMPORAL_MEMORY/bloom_engine').get_engine()
	scriptOp.clear()
	scriptOp.numSamples = 1
	for name, v in eng.pose_channels().items():
		scriptOp.appendChan(name)[0] = float(v)
	return
