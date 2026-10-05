// 12_DEBUG / debug_grid : 3x3 diagnostic wall
//  [ camera + landmarks | segmentation + pivot | final output   ]
//  [ history slot 0     | history slot n/3     | history n*2/3  ]
//  [ history last       | dissolve emission    | dust field     ]
// in0 params | in1 cam | in2 mask | in3 final | in4..7 history | in8 dissolve | in9 dust
out vec4 fragColor;
float dot2(vec2 p, vec2 c, float r) { return 1.0 - smoothstep(r * 0.7, r, length(p - c)); }
void main() {
    vec2 uv = vUV.st;
    float aspect = P(0, ROW_G0).z;
    vec2 cell = floor(uv * 3.0);
    vec2 l = fract(uv * 3.0);
    int idx = int(2.0 - cell.y) * 3 + int(cell.x);
    vec3 c = vec3(0.0);
    if (idx == 0)      c = texture(sTD2DInputs[1], l).rgb;
    else if (idx == 1) c = texture(sTD2DInputs[2], l).rgb * 0.8;
    else if (idx == 2) c = texture(sTD2DInputs[3], l).rgb;
    else if (idx <= 6) c = texture(sTD2DInputs[4 + idx - 3], l).rrr;
    else if (idx == 7) c = texture(sTD2DInputs[8], l).rrr;
    else               c = texture(sTD2DInputs[9], l).rrr;
    if (idx <= 1) {
        vec2 q = vec2(l.x * aspect, l.y);
        for (int j = 0; j < 13; j++) {
            vec4 lm = P(j, ROW_LM);
            if (lm.z < 0.5) continue;
            c = mix(c, vec3(1.0, 0.25, 0.1), dot2(q, vec2(lm.x * aspect, lm.y), 0.012));
        }
        vec4 pel = P(13, ROW_LM), bc = P(15, ROW_LM);
        c = mix(c, vec3(0.1, 0.6, 1.0), dot2(q, vec2(pel.x * aspect, pel.y), 0.016));
        c = mix(c, vec3(0.1, 1.0, 0.3), dot2(q, vec2(bc.x * aspect, bc.y), 0.02));
    }
    vec2 e = min(l, 1.0 - l);
    if (min(e.x, e.y) < 0.004) c = vec3(0.35);
    // capture flash in the corner of the final cell
    if (idx == 2 && P(0, ROW_DBG).w > 0.5 && l.x > 0.94 && l.y > 0.9) c = vec3(1.0, 0.1, 0.1);
    fragColor = TDOutputSwizzle(vec4(c, 1.0));
}
