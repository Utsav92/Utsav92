// re-sharpens the blurred, upscaled mask: clean high-contrast edge, slightly soft.
// in0 params | in1 blurred mask
out vec4 fragColor;
void main() {
    float m = texture(sTD2DInputs[1], vUV.st).r;
    m = smoothstep(0.32, 0.68, m);
    fragColor = TDOutputSwizzle(vec4(vec3(m), 1.0));
}
