// 08_PARTICLE_DECAY / dissolve_src : edge pixels of the dissolving (oldest)
// silhouettes, in output space - the emission field for the dust particles.
// in0 params | in1 current mask (unused) | in2 camera (unused) | in3..in26 history
out vec4 fragColor;
void main() {
    vec2 uv = vUV.st;
    vec4 g0 = P(0, ROW_G0);
    int n = int(g0.w + 0.5);
    float e = 0.0;
    if (P(0, ROW_G2).z > 0.5) {
        for (int i = 0; i < MAX_INST; i++) {
            if (i >= n) break;
            vec4 b = P(i, ROW_I1);
            vec4 c = P(i, ROW_I2);
            if (b.y < 0.5 || c.y <= 0.0) continue;
            vec2 src = instanceSourceUV(i, uv);
            if (!inUnit(src)) continue;
            float m = texture(sTD2DInputs[3 + i], src).r;
            e = max(e, clamp(m * (1.0 - m) * 4.0 + m * 0.15, 0.0, 1.0) * c.y);
        }
    }
    fragColor = TDOutputSwizzle(vec4(vec3(e), 1.0));
}
