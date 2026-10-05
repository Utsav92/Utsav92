// 07_TEMPORAL_BLOOM / bloom_comp
// in0 params | in1 current mask | in2 current camera | in3..in26 history slots
// Each instance samples a DIFFERENT cache entry (distinct past pose), is
// transformed around the tracked body pivot, and the shadows are combined with
// a MAXIMUM blend (no averaging, no feedback smear).
out vec4 fragColor;

float histMask(int i, vec2 src, float diss, float seed, float t, float aspect) {
    if (diss > 0.0) {
        // particle dissolve: solid -> broken edge -> grains -> gone, drifting up
        float n1 = vnoise(src * 7.0 + seed * 17.0 + t * 0.15);
        float n2 = vnoise(src * 7.0 + seed * 29.0 - t * 0.12);
        src += vec2(n1 - 0.5, -(0.35 + n2)) * diss * 0.045;
    }
    if (!inUnit(src)) return 0.0;
    float m = texture(sTD2DInputs[3 + i], src).r;
    if (diss > 0.0) {
        float cell = mix(520.0, 150.0, diss);
        float h = hash12(floor(src * vec2(cell * aspect, cell)) + seed * 101.0);
        float edge = 1.0 - smoothstep(0.55, 1.0, m);           // edges go first
        float cut = diss * (0.55 + 0.9 * edge);
        m *= step(cut, h);
    }
    return m;
}

void main() {
    vec2 uv = vUV.st;
    vec4 g0 = P(0, ROW_G0), g1 = P(0, ROW_G1), g2 = P(0, ROW_G2), g3 = P(0, ROW_G3);
    float aspect = g0.z;
    int n = int(g0.w + 0.5);
    float t = g2.w;

    // ---- historical bodies
    float shadow = 0.0;
    for (int i = 0; i < MAX_INST; i++) {
        if (i >= n) break;
        vec4 b = P(i, ROW_I1);
        if (b.y < 0.5 || b.x <= 0.001) continue;
        vec4 c = P(i, ROW_I2);
        vec2 src = instanceSourceUV(i, uv);
        float m = histMask(i, src, c.y, c.z, t, aspect);
        shadow = max(shadow, m * b.x);
    }

    // ---- joint trajectory ribbons
    vec4 tg = P(0, ROW_TG);
    int tn = int(tg.x + 0.5);
    int bits = int(tg.w + 0.5);
    float trail = 0.0;
    if (bits != 0) {
        vec2 q = vec2(uv.x * aspect, uv.y);
        float aa = uTD2DInfos[1].res.y * 1.5;
        for (int j = 0; j < 4; j++) {
            if (((bits >> j) & 1) == 0) continue;
            for (int k = 1; k < MAX_TRAIL; k++) {
                if (k >= tn) break;
                vec4 p0 = P(k - 1, ROW_T0 + j), p1 = P(k, ROW_T0 + j);
                if (p0.z < 0.5 || p1.z < 0.5) break;
                vec2 a = vec2(p0.x * aspect, p0.y), bb = vec2(p1.x * aspect, p1.y);
                vec2 ab = bb - a;
                float h = clamp(dot(q - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
                float d = length(q - a - ab * h);
                float fade = 1.0 - float(k) / float(tn);
                trail = max(trail, (1.0 - smoothstep(tg.y * 0.5, tg.y * 0.5 + aa, d)) * fade);
            }
        }
        trail *= tg.z;
    }

    // ---- warm ivory projection field
    vec3 bg = g1.rgb;
    float r = length((uv - 0.5) * vec2(aspect, 1.0));
    bg *= 1.0 - g3.w * smoothstep(0.35, 1.05, r);

    vec3 col = mix(bg, vec3(g1.a), shadow);
    col = mix(col, vec3(g1.a), trail);

    // ---- current performer
    int mode = int(g2.x + 0.5);
    float mc = texture(sTD2DInputs[1], uv).r * g2.y;
    if (mode == 0)      col = mix(col, vec3(g3.z), mc);
    else if (mode == 1) col = mix(col, texture(sTD2DInputs[2], uv).rgb, mc);

    fragColor = TDOutputSwizzle(vec4(col, 1.0));
}
