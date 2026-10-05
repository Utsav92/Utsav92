// 01_INPUT / test_dancer : procedural dancer so the whole network can be
// verified without a camera. rgb = studio image, a = ground-truth body mask.
// in0 params (time). Keep in sync with tools/cpu_reference.py.
out vec4 fragColor;
float capsule(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}
vec2 rot2(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
// limb direction: angle measured from straight down, + = away from the body
vec2 limb(float ang, float side, float lean) { return rot2(vec2(sin(ang) * side, -cos(ang)), lean); }

void main() {
    vec2 uv = vUV.st;
    float aspect = uTDOutputInfo.res.z / uTDOutputInfo.res.w;
    float t = P(0, ROW_SEG2).y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    vec2 pel = vec2((0.5 + 0.10 * sin(t * 0.37)) * aspect, 0.40 + 0.015 * sin(t * 1.3));
    float lean = 0.22 * sin(t * 0.43);
    vec2 up = rot2(vec2(0.0, 1.0), lean);
    vec2 neck = pel + up * 0.22;
    vec2 head = neck + up * 0.075;

    float la = 1.3 + 1.1 * sin(t * 0.9) + 0.4 * sin(t * 0.31 + 1.0);
    float ra = 1.2 + 1.2 * sin(t * 0.77 + 2.0) + 0.3 * sin(t * 0.23);
    float le = 0.6 + 0.6 * sin(t * 1.7);
    float re = 0.5 + 0.6 * sin(t * 1.3 + 1.0);
    vec2 lsh = neck + rot2(vec2(-0.055, -0.02), lean);
    vec2 rsh = neck + rot2(vec2( 0.055, -0.02), lean);
    vec2 lel = lsh + limb(la, -1.0, lean) * 0.12;
    vec2 rel = rsh + limb(ra,  1.0, lean) * 0.12;
    vec2 lwr = lel + limb(la + le, -1.0, lean) * 0.11;
    vec2 rwr = rel + limb(ra + re,  1.0, lean) * 0.11;

    float kick = pow(max(0.0, sin(t * 0.5)), 8.0) * 1.3;
    float lh = 0.12 + 0.1 * sin(t * 0.8) + kick;
    float rh = 0.12 + 0.1 * sin(t * 0.8 + 3.14);
    vec2 lhp = pel + vec2(-0.035, 0.0);
    vec2 rhp = pel + vec2( 0.035, 0.0);
    vec2 lkn = lhp + limb(lh, -1.0, 0.0) * 0.17;
    vec2 rkn = rhp + limb(rh,  1.0, 0.0) * 0.17;
    vec2 lan = lkn + limb(lh * 0.4, -1.0, 0.0) * 0.17;
    vec2 ran = rkn + limb(rh * 0.4,  1.0, 0.0) * 0.17;

    float d = length(p - head) - 0.045;
    d = min(d, capsule(p, pel, neck, 0.05));
    d = min(d, capsule(p, lsh, rsh, 0.03));
    d = min(d, capsule(p, lsh, lel, 0.022));
    d = min(d, capsule(p, lel, lwr, 0.018));
    d = min(d, capsule(p, rsh, rel, 0.022));
    d = min(d, capsule(p, rel, rwr, 0.018));
    d = min(d, capsule(p, lhp, lkn, 0.03));
    d = min(d, capsule(p, lkn, lan, 0.024));
    d = min(d, capsule(p, rhp, rkn, 0.03));
    d = min(d, capsule(p, rkn, ran, 0.024));

    float body = 1.0 - smoothstep(0.0, 0.004, d);
    vec3 room = mix(vec3(0.55, 0.53, 0.5), vec3(0.72, 0.7, 0.66), uv.y);
    vec3 col = mix(room, vec3(0.18, 0.14, 0.13), body);
    fragColor = TDOutputSwizzle(vec4(col, body));
}
