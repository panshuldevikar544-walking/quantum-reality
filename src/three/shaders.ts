/**
 * GLSL used by the 3D actors. Everything glowing is additive and depth-write
 * free, which reads as bloom without a post-processing pass.
 */

export const PALETTE = {
  void: '#02030a',
  navy: '#060b1f',
  cyan: '#3fe0ff',
  blue: '#2f6bff',
  violet: '#8b5cff',
  magenta: '#ff3fb4',
  orange: '#ff9a3c',
  white: '#e8eeff',
}

/* ---------------------------- particle field ---------------------------- */

export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uReveal;      // 0..1 reveal radius, grows from the centre
  uniform float uMaxRadius;
  uniform float uFocus;       // focal distance for the depth-of-field look
  uniform float uDrift;
  uniform float uBurstAge;    // seconds since the last burst (large = none)
  uniform vec3  uBurstOrigin;
  attribute vec4 aRand;
  varying float vAlpha;
  varying float vBlur;
  varying float vHue;
  varying float vBurst;

  void main() {
    vec3 p = position;
    float r = length(p);
    // slow, non-repeating drift
    float t = uTime * uDrift;
    p += vec3(
      sin(t * (0.21 + aRand.x * 0.2) + aRand.y * 6.283),
      cos(t * (0.17 + aRand.z * 0.2) + aRand.x * 6.283),
      sin(t * (0.19 + aRand.w * 0.2) + aRand.z * 6.283)
    ) * (0.25 + aRand.w * 0.35);

    // controlled burst: an expanding shell pushes particles outward
    float burstR = uBurstAge * 9.0;
    float dB = length(p - uBurstOrigin);
    float shell = exp(-pow((dB - burstR) * 0.9, 2.0)) * exp(-uBurstAge * 1.1);
    p += normalize(p - uBurstOrigin + 1e-4) * shell * 0.6;
    vBurst = shell;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    float blur = clamp(abs(depth - uFocus) / max(uFocus, 1.0), 0.0, 2.0);
    vBlur = blur;

    float reveal = smoothstep(uReveal * uMaxRadius + 0.5, uReveal * uMaxRadius - 3.0, r);
    float twinkle = 0.65 + 0.35 * sin(uTime * (0.8 + aRand.w * 2.2) + aRand.x * 40.0);
    vAlpha = reveal * twinkle / (1.0 + blur * 2.2);
    vHue = aRand.y;

    float size = uSize * (0.35 + aRand.z * 0.9) * (1.0 + blur * 1.6 + shell * 1.5);
    gl_PointSize = size * uPixelRatio / max(depth, 0.5);
    gl_Position = projectionMatrix * mv;
  }
`

export const particleFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uMix;   // 0 cyan/blue … 1 violet … 2 magenta
  uniform vec3 uCyan;
  uniform vec3 uBlue;
  uniform vec3 uViolet;
  uniform vec3 uMagenta;
  uniform vec3 uOrange;
  varying float vAlpha;
  varying float vBlur;
  varying float vHue;
  varying float vBurst;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float soft = mix(2.4, 1.0, clamp(vBlur, 0.0, 1.0));
    float a = pow(1.0 - d, soft);
    vec3 base = mix(uCyan, uBlue, vHue);
    vec3 warm = mix(uViolet, uMagenta, vHue);
    vec3 col = mix(base, uViolet, clamp(uMix, 0.0, 1.0));
    col = mix(col, warm, clamp(uMix - 1.0, 0.0, 1.0));
    col = mix(col, uOrange, clamp(vBurst * 1.5, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
  }
`

/* ------------------------------- glow sprite ------------------------------ */

export const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uCore;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float halo = pow(max(0.0, 1.0 - d), 2.6);
    float core = pow(max(0.0, 1.0 - d * 3.2), 2.0) * uCore;
    vec3 col = uColor * halo + vec3(1.0) * core;
    gl_FragColor = vec4(col, (halo + core) * uOpacity);
  }
`

/* --------------------------------- ring ---------------------------------- */

export const ringFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uRadius;  // 0..1 in uv space
  uniform float uWidth;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float ring = exp(-pow((d - uRadius) / uWidth, 2.0));
    gl_FragColor = vec4(uColor, ring * uOpacity);
  }
`

/* ----------------------------- fresnel shell ----------------------------- */

export const shellVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying vec3 vObj;
  void main() {
    vObj = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

export const shellFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uIntensity;
  uniform float uBands;    // latitude band strength (grid)
  uniform float uVeins;    // flowing energy veins
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying vec3 vObj;

  void main() {
    vec3 n = normalize(vNormalV);
    float facing = abs(dot(n, normalize(vViewDir)));
    float fres = pow(1.0 - facing, 2.4);
    vec3 o = normalize(vObj);

    float lat = abs(sin(asin(clamp(o.y, -1.0, 1.0)) * 6.0));
    float lon = abs(sin(atan(o.z, o.x) * 6.0 + uTime * 0.05));
    float grid = (smoothstep(0.965, 1.0, 1.0 - lat) + smoothstep(0.975, 1.0, 1.0 - lon)) * uBands;

    float v = sin(o.x * 5.0 + uTime * 0.6) * sin(o.y * 6.0 - uTime * 0.45) * sin(o.z * 4.0 + uTime * 0.3);
    float veins = smoothstep(0.82, 1.0, 1.0 - abs(v) * 6.0) * uVeins;

    float k = 0.5 + 0.5 * sin(o.y * 2.0 + uTime * 0.3);
    vec3 col = mix(uColorA, uColorB, k);
    float a = (fres * 1.1 + grid * (0.35 + fres) + veins * 0.5 + 0.03) * uIntensity;
    gl_FragColor = vec4(col * (1.0 + veins), a * uOpacity);
  }
`

/* ------------------------------ wave field ------------------------------- */

export const waveVertex = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const waveFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uAmp;
  uniform float uSep;
  uniform float uPhase;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  uniform vec3 uMagenta;
  varying vec2 vP;

  void main() {
    vec2 s1 = vec2(-uSep, 0.0);
    vec2 s2 = vec2(uSep, 0.0);
    float r1 = length(vP - s1);
    float r2 = length(vP - s2);
    float k = 1.6;
    float w = uTime * 1.2;
    // two coherent sources: their sum shows interference fringes
    float amp = sin(r1 * k - w) / sqrt(r1 + 1.5) + sin(r2 * k - w + uPhase) / sqrt(r2 + 1.5);
    float crest = pow(clamp(amp * 0.9, 0.0, 1.0), 3.0) * uAmp;

    vec2 g = abs(fract(vP / 2.0) - 0.5);
    float grid = smoothstep(0.03, 0.0, min(g.x, g.y)) * 0.12;

    float fade = smoothstep(26.0, 4.0, length(vP));
    float hue = 0.5 + 0.5 * sin(r1 * 0.35 - uTime * 0.3 + uPhase);
    vec3 col = mix(uCyan, mix(uViolet, uMagenta, hue), hue);
    gl_FragColor = vec4(col, (crest + grid) * fade * uOpacity);
  }
`

/* ----------------------------- energy stream ----------------------------- */

export const streamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const streamFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSpeed;
  uniform float uOffset;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float head = fract(uTime * uSpeed + uOffset) * 1.4 - 0.2;
    float x = vUv.x;
    float tail = smoothstep(head - 0.35, head, x) * step(x, head);
    float glow = exp(-pow((x - head) * 30.0, 2.0));
    float base = 0.06;
    float a = (tail * 0.7 + glow * 1.5 + base) * smoothstep(0.0, 0.08, x) * smoothstep(1.0, 0.9, x);
    gl_FragColor = vec4(uColor + glow * 0.6, a * uOpacity);
  }
`

/* ------------------------------- braid ---------------------------------- */

export const braidVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec3 aData; // t along the pair, phase, strand
  varying float vAlpha;
  varying float vStrand;
  void main() {
    float t = aData.x;
    vec3 axis = mix(uA, uB, t);
    vec3 dir = normalize(uB - uA + 1e-4);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 side = normalize(cross(dir, up));
    up = normalize(cross(side, dir));
    float pinch = sin(3.14159 * t);
    float ang = aData.y + uTime * 0.7 + t * 12.566 * (aData.z > 0.5 ? 1.0 : -1.0);
    float rad = (0.25 + 0.75 * pinch) * 0.85;
    vec3 p = axis + (side * cos(ang) + up * sin(ang)) * rad;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAlpha = 0.25 + 0.75 * pinch;
    vStrand = aData.z;
    gl_PointSize = uSize * uPixelRatio / max(-mv.z, 0.5);
    gl_Position = projectionMatrix * mv;
  }
`

export const braidFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uViolet;
  uniform vec3 uMagenta;
  varying float vAlpha;
  varying float vStrand;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = pow(1.0 - d, 2.0);
    vec3 col = mix(uViolet, uMagenta, vStrand);
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
  }
`

/* ------------------------------- network -------------------------------- */

export const nodeVertex = /* glsl */ `
  uniform float uCount;
  uniform float uConverge;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uFocusCluster;
  uniform float uTime;
  attribute float aIndex;
  attribute float aCluster;
  attribute vec3 aLattice;
  varying float vAlpha;
  varying float vFocus;
  void main() {
    float on = smoothstep(aIndex - 0.6, aIndex + 0.4, uCount);
    vec3 p = mix(position, aLattice, uConverge);
    p *= mix(0.6, 1.0, on);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float focus = (uFocusCluster < 0.0 || abs(aCluster - uFocusCluster) < 0.5) ? 1.0 : 0.45;
    vFocus = focus;
    vAlpha = on;
    float pulse = 1.0 + 0.15 * sin(uTime * 2.0 + aIndex);
    gl_PointSize = uSize * (aIndex < 0.5 ? 1.8 : 1.0) * pulse * uPixelRatio * (0.6 + 0.4 * focus) / max(-mv.z, 0.5);
    gl_Position = projectionMatrix * mv;
  }
`

export const nodeFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vFocus;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float halo = pow(1.0 - d, 2.6);
    float core = pow(max(0.0, 1.0 - d * 2.6), 1.6);
    vec3 col = uColor * halo + core;
    gl_FragColor = vec4(col, (halo + core) * vAlpha * vFocus * uOpacity);
  }
`

export const edgeVertex = /* glsl */ `
  uniform float uConverge;
  attribute float aIndex;
  attribute float aT;
  attribute float aSeed;
  attribute vec3 aLattice;
  varying float vIndex;
  varying float vT;
  varying float vSeed;
  void main() {
    vIndex = aIndex;
    vT = aT;
    vSeed = aSeed;
    vec3 p = mix(position, aLattice, uConverge);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

export const edgeFragment = /* glsl */ `
  uniform float uCount;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uPulse;
  varying float vIndex;
  varying float vT;
  varying float vSeed;
  void main() {
    float on = smoothstep(vIndex - 0.2, vIndex + 0.8, uCount);
    // the edge draws itself from one end as it appears
    float grow = smoothstep(vT - 0.05, vT, (uCount - vIndex + 0.2) * 1.4);
    float head = fract(uTime * 0.35 + vSeed);
    float pulse = exp(-pow((vT - head) * 14.0, 2.0));
    vec3 col = mix(uColor, uPulse, pulse);
    gl_FragColor = vec4(col, (0.42 + pulse * 1.1) * on * grow * uOpacity);
  }
`
