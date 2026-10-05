// 09_COMPOSITE / final_comp : bloom + dust grains. in0 params | in1 bloom | in2 dust
out vec4 fragColor;
void main() {
    vec2 uv = vUV.st;
    vec3 col = texture(sTD2DInputs[1], uv).rgb;
    float dust = (P(0, ROW_G2).z > 0.5) ? texture(sTD2DInputs[2], uv).r : 0.0;
    dust = smoothstep(0.08, 0.5, dust);
    col = mix(col, vec3(P(0, ROW_G1).a), dust * 0.85);
    fragColor = TDOutputSwizzle(vec4(col, 1.0));
}
