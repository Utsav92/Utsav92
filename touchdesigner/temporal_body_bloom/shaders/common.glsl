// ---- TEMPORAL BODY BLOOM : shared shader header ---------------------------
// Prepended by the builder to every pixel shader. Input 0 of every GLSL TOP is
// the engine's parameter texture (RGBA32F, 32 x 20) - see engine.py ROW_*.
#define MAX_INST 24
#define MAX_TRAIL 32
#define ROW_G0 0
#define ROW_G1 1
#define ROW_G2 2
#define ROW_G3 3
#define ROW_I0 4
#define ROW_I1 5
#define ROW_I2 6
#define ROW_T0 7
#define ROW_TG 11
#define ROW_SEG 12
#define ROW_SEG2 13
#define ROW_LM 14
#define ROW_DBG 15
#define ROW_DUST 16

vec4 P(int col, int row) { return texelFetch(sTD2DInputs[0], ivec2(col, row), 0); }

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x),
               mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
bool inUnit(vec2 uv) { return all(greaterThanEqual(uv, vec2(0.0))) && all(lessThanEqual(uv, vec2(1.0))); }

// Inverse transform of silhouette instance i.
// Forward (per brief):  p' = pivotCur + offset + R(rot) * S(scale) * (p - pivotSrc)
// i.e.  T(pivot) * T(radialOffset) * R * S * T(-pivot), evaluated in aspect space,
// so every historical body rotates around the TRACKED BODY PIVOT, never the
// screen centre. Trunk preservation: near the pivot the transform is damped
// (k -> 1 - trunkHold), so torsos stay overlapped while limbs branch outward.
vec2 instanceSourceUV(int i, vec2 uv) {
    vec4 g0 = P(0, ROW_G0);
    vec4 g3 = P(0, ROW_G3);
    vec4 a  = P(i, ROW_I0);
    vec4 b  = P(i, ROW_I1);
    float aspect = g0.z;
    vec2 q  = vec2(uv.x * aspect, uv.y);
    vec2 cp = vec2(g0.x * aspect, g0.y);
    vec2 sp = vec2(b.z * aspect, b.w);
    float d = length(q - cp - a.xy * 0.5);
    float w = smoothstep(g3.y * 0.3, g3.y * 1.5, d);
    float k = mix(1.0 - g3.x, 1.0, w);
    float rot = a.z * k;
    float sc  = mix(1.0, a.w, k);
    vec2 r = q - cp - a.xy * k;
    float c = cos(-rot), s = sin(-rot);
    r = vec2(c * r.x - s * r.y, s * r.x + c * r.y) / sc;
    vec2 src = sp + r;
    return vec2(src.x / aspect, src.y);
}
