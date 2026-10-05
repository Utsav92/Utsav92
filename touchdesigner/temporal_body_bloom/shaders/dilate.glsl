// morphology: dilate (max over a disc). in0 params | in1 mask
out vec4 fragColor;
void main() {
    int r = int(clamp(P(0, ROW_SEG2).x, 0.0, 8.0) + 0.5);
    vec2 px = uTD2DInfos[1].res.xy;
    float m = texture(sTD2DInputs[1], vUV.st).r;
    for (int y = -8; y <= 8; y++) {
        if (abs(y) > r) continue;
        for (int x = -8; x <= 8; x++) {
            if (abs(x) > r || x * x + y * y > r * r) continue;
            m = max(m, texture(sTD2DInputs[1], vUV.st + vec2(x, y) * px).r);
        }
    }
    fragColor = TDOutputSwizzle(vec4(vec3(m), 1.0));
}
