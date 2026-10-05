// 08_PARTICLE_DECAY / dust_sim : GPU particle field (feedback buffer).
// Slow, organic, low gravity, slight upward drift - never explosive.
// in0 params | in1 previous dust (Feedback TOP) | in2 emission (dissolve_src)
out vec4 fragColor;
void main() {
    vec2 uv = vUV.st;
    vec4 g2 = P(0, ROW_G2);
    vec4 pd = P(0, ROW_DUST);
    float dt = clamp(P(1, ROW_DUST).x, 1.0 / 240.0, 1.0 / 10.0);
    if (g2.z < 0.5) { fragColor = vec4(0.0); return; }
    float t = g2.w;
    float ang = vnoise(uv * 3.0 + vec2(t * 0.07, -t * 0.05)) * 6.2831;
    vec2 vel = vec2(cos(ang), sin(ang)) * pd.z * 0.05 + vec2(0.0, pd.w * 0.05);
    float prev = texture(sTD2DInputs[1], uv - vel * dt).r;
    float decay = exp(-dt / max(pd.y, 0.1));
    vec2 res = uTD2DInfos[2].res.zw;
    float h = hash12(floor(uv * res) + fract(t * 13.37) * 512.0);
    float emit = texture(sTD2DInputs[2], uv).r * step(1.0 - pd.x * 0.06, h);
    float v = clamp(prev * decay + emit, 0.0, 1.0);
    fragColor = vec4(vec3(v), 1.0);
}
