// 02_SEGMENTATION / seg_mask
// in0 params | in1 camera (small) | in2 background plate | in3 external mask
// out: white body on black (rgb = mask, a = 1)
out vec4 fragColor;
void main() {
    vec2 uv = vUV.st;
    vec4 s  = P(0, ROW_SEG);
    vec4 s2 = P(0, ROW_SEG2);
    int mode = int(s.x + 0.5);
    float thr = s.y, soft = max(s.z, 1e-3);
    vec2 px = uTD2DInfos[1].res.xy;
    float v = 0.0;
    if (mode == 0) {
        // background subtraction - 5 tap to suppress sensor noise
        float acc = 0.0;
        vec2 o[5] = vec2[](vec2(0), vec2(px.x, 0), vec2(-px.x, 0), vec2(0, px.y), vec2(0, -px.y));
        for (int k = 0; k < 5; k++) {
            vec3 c  = texture(sTD2DInputs[1], uv + o[k]).rgb;
            vec3 bg = texture(sTD2DInputs[2], uv + o[k]).rgb;
            vec3 dd = abs(c - bg);
            float lum = abs(dot(c - bg, vec3(0.299, 0.587, 0.114)));
            float chroma = length(dd - vec3((dd.r + dd.g + dd.b) / 3.0));
            acc += max(max(dd.r, max(dd.g, dd.b)) * 0.6 + lum * 0.4, chroma * 1.5);
        }
        v = acc / 5.0;
    } else if (mode == 1) {
        // luma key: dark body on a bright backdrop (Keyinvert for the opposite)
        float l = dot(texture(sTD2DInputs[1], uv).rgb, vec3(0.299, 0.587, 0.114));
        v = (s2.z > 0.5) ? l : 1.0 - l;
    } else if (mode == 2) {
        v = texture(sTD2DInputs[1], uv).a;             // pre-keyed / test dancer
    } else {
        v = texture(sTD2DInputs[3], uv).r;             // MediaPipe / ML mask
    }
    float m = smoothstep(thr - soft, thr + soft, v);
    fragColor = TDOutputSwizzle(vec4(vec3(m), 1.0));
}
