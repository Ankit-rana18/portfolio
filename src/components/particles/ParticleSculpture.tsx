"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loadPortrait, makeAbstract } from "./portraitData";

gsap.registerPlugin(ScrollTrigger);

export type Formation = "portrait" | "sphere" | "terrain" | "galaxy";
const FORM_ID: Record<Formation, number> = { portrait: 0, sphere: 1, terrain: 2, galaxy: 3 };

export type ParticleSculptureProps = {
  /** Folder (under /public) holding points.bin + meta.json from scripts/build_portrait.py. */
  src?: string;
  /** While this element scrolls out, the camera moves in on the portrait's face. */
  intro?: string;
  /** Formation shown before any trigger is reached. Without "portrait" anywhere, no portrait file is loaded. */
  initial?: Formation;
  /** In page order: as each trigger scrolls into view, the particles flow into that formation. */
  formations?: { trigger: string; form: Formation }[];
  /** Elements matching this selector pause rendering while they fully cover the screen. */
  occluders?: string;
  /** Elements matching this selector attract particles while hovered. */
  attractors?: string;
  count?: { desktop: number; mobile: number };
  className?: string;
  onReady?: () => void;
  onUnsupported?: () => void;
};

// ---------------------------------------------------------------- shaders
const palette = /* glsl */ `
  const vec3 WHITE  = vec3(0.94, 0.97, 1.00);
  const vec3 ICE    = vec3(0.62, 0.86, 1.00);
  const vec3 CYAN   = vec3(0.32, 0.86, 1.00);
  const vec3 BLUE   = vec3(0.25, 0.45, 1.00);
  const vec3 VIOLET = vec3(0.58, 0.42, 1.00);
  const vec3 MAGENTA = vec3(0.86, 0.32, 0.92);
`;

const particleVertex = /* glsl */ `
  ${palette}
  uniform float uTime, uFrom, uTo, uMix, uAssemble, uSize, uPixelRatio, uAspect, uFade, uIntensity, uScanY, uMinY;
  uniform float uPointerStrength, uPulse, uLo, uGamma, uGain, uTurb, uAttractStrength;
  uniform vec2 uPointer, uPulseOrigin, uAttract;
  attribute vec3 aNormal;
  attribute vec4 aRand;
  attribute vec3 aMeta;    // portrait: (photo luminance, region, edge strength)
  attribute vec3 aSphere;  // flow-sphere base position
  attribute vec3 aTerrain; // (x, row, seed)
  attribute vec3 aGalaxy;  // flat spiral-disc position
  varying vec3 vColor;
  varying float vAlpha;

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  // Positions, colours and opacity for each formation.
  void form(float id, vec3 portraitP, vec3 portraitCol, float portraitA, float t,
            out vec3 p, out vec3 col, out float a) {
    if (id < 0.5) { p = portraitP; col = portraitCol; a = portraitA; return; }

    if (id < 1.5) {
      // flow sphere: neighbouring latitude bands counter-rotate like data streams
      vec3 s = aSphere;
      float R = length(s);
      float lat = asin(clamp(s.y / max(R, 1e-3), -1.0, 1.0));
      float band = floor((lat / 3.14159 + 0.5) * 44.0);
      float dir = mod(band, 2.0) * 2.0 - 1.0;
      s.xz = rot(t * (0.07 + 0.09 * fract(band * 0.37)) * dir) * s.xz;
      s *= 1.0 + 0.025 * sin(t * 0.9 + s.y * 3.0);
      p = s + vec3(0.0, -0.6, 0.0);
      float core = step(R, 1.2);
      col = mix(mix(CYAN, VIOLET, 0.5 + 0.5 * s.y / 1.42), VIOLET, core);
      col = mix(col, WHITE, step(0.985, aRand.z));
      a = (0.55 + 0.45 * aRand.y) * mix(1.0, 0.45, core);
      return;
    }

    if (id < 2.5) {
      // data terrain: scan rows rolling towards the viewer
      float row = aTerrain.y, x = aTerrain.x;
      float z = 1.6 - row * 0.15;
      float h = sin(x * 0.55 + t * 0.55 + row * 0.06) * 0.34
              + sin(x * 1.3 - t * 0.75 + row * 0.23) * 0.14
              + sin(row * 0.31 + t * 0.45) * 0.2;
      p = vec3(x, -2.15 + h, z);
      float hn = clamp(h / 0.68 + 0.5, 0.0, 1.0);
      col = mix(mix(BLUE, CYAN, hn), WHITE, smoothstep(0.82, 1.0, hn));
      a = (0.25 + hn * 0.8) * smoothstep(70.0, 25.0, row) * smoothstep(8.0, 4.5, abs(x));
      return;
    }

    // galaxy: differential rotation, tilted towards the viewer
    vec3 g = aGalaxy;
    float r = length(g.xz);
    g.xz = rot(t * 0.24 / (r + 0.6)) * g.xz;
    float c = cos(0.62), sn = sin(0.62);
    g = vec3(g.x, g.y * c - g.z * sn, g.y * sn + g.z * c);
    p = g + vec3(0.0, -0.6, 0.0);
    col = mix(WHITE, mix(CYAN, VIOLET, aRand.y), smoothstep(0.0, 1.2, r));
    col = mix(col, MAGENTA, step(0.97, aRand.z));
    a = clamp(1.25 - r * 0.25, 0.25, 1.0) * (0.6 + 0.4 * aRand.w);
  }

  void main() {
    float t = uTime;
    float lum = aMeta.x, region = aMeta.y, edge = aMeta.z;
    bool isFace = region < 0.5, isHair = region > 0.5 && region < 1.5, isCloth = region > 2.5 && region < 3.5;
    bool isHalo = region > 3.5 && region < 4.5, isBack = region > 4.5;

    // ---------- portrait position + look
    vec3 pp = position;
    float breath = 0.5 + 0.5 * sin(t * 1.05);
    float body = smoothstep(-0.55, -1.1, pp.y);
    pp += aNormal * breath * 0.008 * body;
    pp.y += breath * (0.004 + 0.004 * body);
    pp += aNormal * sin(pp.y * 7.0 - t * 1.3 + aRand.x * 6.28) * (isFace ? 0.0012 : 0.003);
    if (isHalo) pp += vec3(sin(t * 0.35 + aRand.y * 30.0), cos(t * 0.3 + aRand.z * 30.0), sin(t * 0.32 + aRand.w * 30.0)) * (0.03 + aRand.x * 0.06);

    vec3 nvP = normalize(normalMatrix * aNormal);
    vec4 mvGuess = modelViewMatrix * vec4(pp, 1.0);
    vec3 L = normalize(vec3(-0.45, 0.4, 0.8));
    float diff = max(dot(nvP, L), 0.0);
    float rim = pow(1.0 - abs(dot(nvP, normalize(-mvGuess.xyz))), 2.4);
    float pb = uLo + pow(lum, uGamma) * uGain + edge * 0.4 + rim * 0.3 + diff * 0.1;
    vec3 pc = mix(ICE, WHITE, smoothstep(0.35, 0.9, lum));
    if (isHair) pc = mix(mix(BLUE, VIOLET, aRand.y), ICE, lum * 0.8);
    if (isCloth) { pc = mix(BLUE, ICE, lum * 0.7); pb *= 0.8; }
    if (isHalo) { pc = mix(CYAN, VIOLET, aRand.y); pb = 0.6; }
    pc = mix(pc, CYAN, rim * 0.55);
    if (aRand.z > 0.97) pc = CYAN; else if (aRand.z < 0.025) pc = VIOLET;
    float band = exp(-pow((position.y - uScanY) * 6.0, 2.0)) * (isBack ? 0.0 : 1.0);
    pc = mix(pc, CYAN, band * 0.5);
    pb += band * 0.6;
    float pa = (isFace ? 1.0 : (isHair ? 0.95 : (isCloth ? 0.7 : (isHalo ? 0.3 : (isBack ? 0.12 : 0.9)))))
             * smoothstep(uMinY, uMinY + 0.7, position.y);
    vec3 portraitCol = pc * pb;

    // ---------- blend between the current pair of formations (staggered per particle)
    float k = smoothstep(aRand.x * 0.4, aRand.x * 0.4 + 0.6, uMix);
    vec3 p0, c0, p1, c1; float a0, a1;
    form(uFrom, pp, portraitCol, pa, t, p0, c0, a0);
    form(uTo, pp, portraitCol, pa, t, p1, c1, a1);
    vec3 p = mix(p0, p1, k) + (aRand.yzw - 0.5) * 1.1 * sin(k * 3.14159);
    vec3 col = mix(c0, c1, k);
    float alpha = mix(a0, a1, k);
    float pw = (uFrom < 0.5 ? 1.0 - k : 0.0) + (uTo < 0.5 ? k : 0.0); // how "portrait" this particle is

    // cinematic entrance + scroll-speed turbulence
    vec3 from = normalize((aRand.yzw - 0.5) * 2.0 + vec3(0.0, 0.2, 0.6)) * (2.5 + aRand.x * 3.5);
    float as = uAssemble * (0.6 + aRand.x * 0.4);
    p += from * as * as;
    p += (aRand.yzw - 0.5) * uTurb * (0.45 - 0.33 * pw);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;

    // cursor: gentle on the portrait, ripples through the other formations
    vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
    float dl = length(d);
    float infl = smoothstep(0.2 + 0.15 * (1.0 - pw), 0.0, dl) * uPointerStrength;
    mv.xy += (d / max(dl, 1e-4)) * infl * mix(0.22, 0.012, pw) * (0.4 + aRand.x);
    float ripple = sin(dl * 30.0 - t * 6.0) * exp(-dl * 5.0) * uPointerStrength * (1.0 - pw);
    mv.y += ripple * 0.05;

    // hovered buttons / cards pull nearby particles in and light them up
    vec2 ad = (uAttract - ndc) * vec2(uAspect, 1.0);
    float al = length(ad);
    float pull = uAttractStrength * smoothstep(0.6, 0.0, al) * (1.0 - 0.85 * pw);
    mv.xy += (ad / max(al, 1e-4)) * pull * 0.16 * (0.3 + aRand.y);

    // click / tap shockwave
    vec2 pd = (ndc - uPulseOrigin) * vec2(uAspect, 1.0);
    float pl = length(pd);
    float pulse = uPulse * smoothstep(0.9, 0.0, pl);
    mv.xy += (pd / max(pl, 1e-4)) * pulse * 0.6 * (0.3 + aRand.x);
    mv.z += pulse * (aRand.y - 0.5) * 0.8;

    gl_Position = projectionMatrix * mv;
    float sizeK = mix(0.9, isFace ? 0.78 : (isHair ? 0.9 : (isBack ? 0.8 : 1.0)), pw);
    gl_PointSize = uSize * sizeK * (0.7 + aRand.w * 0.6) * uPixelRatio / -mv.z;

    float glow = 1.0 + pull * 0.9 + abs(ripple) * 0.8 + pulse * 0.6;
    vColor = col * glow * (0.85 + 0.15 * sin(t * 1.2 + aRand.x * 50.0)) + CYAN * pulse * 0.4;
    vAlpha = alpha * uFade * uIntensity * (1.0 - uAssemble * 0.6);
  }
`;

const softPointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = exp(-d * d * 32.0);
    float halo = exp(-d * d * 8.0) * 0.18;
    gl_FragColor = vec4(vColor, (core + halo) * vAlpha);
  }
`;

const lineVertex = /* glsl */ `
  uniform float uTime, uPortrait, uAssemble, uFade, uScanY;
  attribute vec2 aSeed;
  varying float vA;
  void main() {
    float t = uTime;
    vec3 p = position;
    p.y += (0.5 + 0.5 * sin(t * 1.05)) * 0.008;
    float flick = 0.3 + 0.7 * pow(0.5 + 0.5 * sin(t * 1.1 + aSeed.x * 60.0), 3.0);
    float band = exp(-pow((position.y - uScanY) * 6.0, 2.0));
    vA = flick * (0.035 + band * 0.22) * smoothstep(0.7, 1.0, uPortrait) * (1.0 - uAssemble) * uFade;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const lineFragment = /* glsl */ `
  varying float vA;
  void main() { gl_FragColor = vec4(0.4, 0.75, 1.0, vA); }
`;

const streamVertex = /* glsl */ `
  ${palette}
  uniform float uTime, uPortrait, uPixelRatio, uFade;
  attribute vec4 aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float t = uTime;
    float life = fract(aSeed.x + t * (0.018 + aSeed.y * 0.03));
    float ang = aSeed.z * 6.2831 + t * (0.12 + aSeed.w * 0.2) + life * 3.0;
    float r = (1.5 + aSeed.w * 1.1 + sin(life * 6.2831 + aSeed.x * 10.0) * 0.08) * (1.3 - 0.3 * uPortrait);
    vec3 p = vec3(cos(ang) * r, -3.0 + life * 4.6, sin(ang) * r * 0.6 - 0.4);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (4.0 + aSeed.y * 6.0) * uPixelRatio / -mv.z;
    vColor = mix(CYAN, VIOLET, aSeed.y);
    vAlpha = sin(life * 3.14159) * 0.4 * uFade * (0.35 + 0.65 * uPortrait);
  }
`;

const dustVertex = /* glsl */ `
  ${palette}
  uniform float uTime, uPixelRatio, uTurb;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * 0.03 * (0.4 + aSeed) + aSeed * 10.0, 8.0) - 4.0;
    p.x += sin(uTime * 0.2 + aSeed * 30.0) * 0.15;
    p.y -= uTurb * aSeed * 0.6; // streaks downward with fast scrolling
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (5.0 + aSeed * 9.0) * uPixelRatio / -mv.z;
    vColor = mix(ICE, VIOLET, step(0.6, aSeed));
    vAlpha = (0.25 + 0.5 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0))) * (0.45 + uTurb * 0.4);
  }
`;

type View = { camZ: number; lookY: number; camX: number; rotY: number };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpView = (a: View, b: View, t: number): View => ({
  camZ: lerp(a.camZ, b.camZ, t), lookY: lerp(a.lookY, b.lookY, t), camX: lerp(a.camX, b.camX, t), rotY: lerp(a.rotY, b.rotY, t),
});
const smooth = (t: number) => t * t * (3 - 2 * t);

// ---------------------------------------------------------------- component
export default function ParticleSculpture({
  src = "/portrait",
  intro,
  initial = "portrait",
  formations = [],
  occluders,
  attractors = "a, button, .cap-card",
  count = { desktop: 100000, mobile: 40000 },
  className,
  onReady,
  onUnsupported,
}: ParticleSculptureProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onUnsupported });
  callbacks.current = { onReady, onUnsupported };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      callbacks.current.onUnsupported?.();
      return;
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    const group = new THREE.Group();
    scene.add(group);

    // Camera framing per formation (portrait-shaped screens pull back).
    const tall = mount.clientWidth / Math.max(mount.clientHeight, 1) < 0.8;
    const views: Record<"home" | "close" | Formation, View> = tall
      ? {
          home: { camZ: 9.0, lookY: -0.95, camX: 0.15, rotY: 0 },
          close: { camZ: 4.2, lookY: 0.05, camX: 0, rotY: -0.38 },
          portrait: { camZ: 9.0, lookY: -0.95, camX: 0.15, rotY: 0 },
          sphere: { camZ: 9.5, lookY: -0.6, camX: 0, rotY: 0 },
          terrain: { camZ: 6.4, lookY: -1.4, camX: 0, rotY: 0 },
          galaxy: { camZ: 11, lookY: -0.6, camX: 0, rotY: 0 },
        }
      : {
          home: { camZ: 6.0, lookY: -0.5, camX: 0, rotY: 0 },
          close: { camZ: 2.7, lookY: 0.05, camX: 0, rotY: -0.38 },
          portrait: { camZ: 6.0, lookY: -0.5, camX: 0, rotY: 0 },
          sphere: { camZ: 6.6, lookY: -0.6, camX: 0, rotY: 0 },
          terrain: { camZ: 4.6, lookY: -1.4, camX: 0, rotY: 0 },
          galaxy: { camZ: 7.6, lookY: -0.6, camX: 0, rotY: 0 },
        };

    // Scroll progress per stage (written by GSAP, read in the render loop — never React state).
    const introProg = { p: 0 };
    const stageProg = formations.map(() => ({ p: 0 }));
    const fx = { assemble: reduce ? 0 : 1, turb: 0, attract: 0, tAttract: 0 };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: 0, tActive: 0 };
    let attractEl: Element | null = null;

    const shared = {
      uTime: { value: 0 },
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uMix: { value: 0 },
      uPortrait: { value: 1 },
      uAssemble: { value: fx.assemble },
      uFade: { value: 1 },
      uTurb: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uScanY: { value: -3 },
    };
    const particleUniforms = {
      ...shared,
      uSize: { value: mobile ? 14 : 11 },
      uAspect: { value: 1 },
      uIntensity: { value: mobile ? 1.5 : 1.4 },
      uMinY: { value: -3 },
      uLo: { value: 0.06 },
      uGamma: { value: 1.3 },
      uGain: { value: 1.5 },
      uPointer: { value: new THREE.Vector2(10, 10) },
      uPointerStrength: { value: 0 },
      uPulseOrigin: { value: new THREE.Vector2(0, 0) },
      uPulse: { value: 0 },
      uAttract: { value: new THREE.Vector2(10, 10) },
      uAttractStrength: { value: 0 },
    };
    const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;
    const disposables: { dispose: () => void }[] = [];

    // Atmospheric floating particles (scene space, deep layer).
    {
      const n = mobile ? 450 : 1300;
      const pos = new Float32Array(n * 3);
      const seed = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 12;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 8 - 1;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
        seed[i] = Math.random();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      const mat = new THREE.ShaderMaterial({ vertexShader: dustVertex, fragmentShader: softPointFragment, uniforms: shared, ...additive });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      scene.add(pts);
      disposables.push(geo, mat);
    }

    // Faint data streams spiralling up around the formation.
    {
      const n = mobile ? 700 : 1800;
      const seed = new Float32Array(n * 4);
      for (let i = 0; i < n * 4; i++) seed[i] = Math.random();
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
      const mat = new THREE.ShaderMaterial({ vertexShader: streamVertex, fragmentShader: softPointFragment, uniforms: shared, ...additive });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      group.add(pts);
      disposables.push(geo, mat);
    }

    let disposed = false;
    let raf = 0;
    let running = false;
    let occluded = false;
    let ready = false;
    let lastScroll = window.scrollY;
    let lastFrame = performance.now();
    const frameDelta = () => {
      const now = performance.now();
      const d = (now - lastFrame) / 1000;
      lastFrame = now;
      return d;
    };

    const layout = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      particleUniforms.uAspect.value = camera.aspect;
    };

    const elementNdc = (el: Element) => {
      const r = el.getBoundingClientRect(), m = mount.getBoundingClientRect();
      return [((r.left + r.width / 2 - m.left) / m.width) * 2 - 1, -(((r.top + r.height / 2 - m.top) / m.height) * 2 - 1)] as const;
    };

    const render = () => {
      const dt = Math.min(frameDelta(), 0.05);
      if (!reduce) shared.uTime.value += dt;
      const t = shared.uTime.value;

      // pointer + effects smoothing (frame-rate independent)
      const k = 1 - Math.pow(0.0015, dt);
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;
      pointer.active += (pointer.tActive - pointer.active) * k;
      particleUniforms.uPulse.value *= Math.exp(-dt * 2.2);
      fx.attract += (fx.tAttract - fx.attract) * (1 - Math.pow(0.02, dt));
      if (attractEl && fx.tAttract > 0) particleUniforms.uAttract.value.set(...elementNdc(attractEl));

      // scroll speed -> turbulence (rises fast, settles slowly)
      const sy = window.scrollY;
      const speed = dt > 0 ? Math.abs(sy - lastScroll) / dt : 0;
      lastScroll = sy;
      const target = reduce ? 0 : Math.min(speed / 2600, 1);
      fx.turb += (target - fx.turb) * (target > fx.turb ? 0.35 : 1 - Math.pow(0.05, dt));

      // which pair of formations are we between?
      let j = -1;
      for (let i = 0; i < stageProg.length; i++) if (stageProg[i].p > 0) j = i;
      const initialId = FORM_ID[initial];
      const introView = initial === "portrait" ? lerpView(views.home, views.close, smooth(introProg.p)) : views[initial];
      let fromId = initialId, toId = initialId, mix = 0, view = introView;
      if (j >= 0) {
        fromId = j === 0 ? initialId : FORM_ID[formations[j - 1].form];
        toId = FORM_ID[formations[j].form];
        mix = stageProg[j].p;
        const fromView = j === 0 ? introView : views[formations[j - 1].form];
        view = lerpView(fromView, views[formations[j].form], smooth(mix));
      }
      const portraitness = (fromId === 0 ? 1 - mix : 0) + (toId === 0 ? mix : 0);

      group.rotation.y = view.rotY + pointer.x * 0.16 + Math.sin(t * 0.18) * 0.03;
      group.rotation.x = -pointer.y * 0.06;
      shared.uFrom.value = fromId;
      shared.uTo.value = toId;
      shared.uMix.value = mix;
      shared.uPortrait.value = portraitness;
      shared.uAssemble.value = fx.assemble;
      shared.uTurb.value = fx.turb;
      shared.uScanY.value = -3.2 + ((t * 0.3) % 5.4);
      particleUniforms.uPointerStrength.value = reduce ? 0 : pointer.active;
      particleUniforms.uPointer.value.set(pointer.tx, pointer.ty);
      particleUniforms.uAttractStrength.value = fx.attract;

      // depth parallax: the camera drifts slightly with the cursor
      camera.position.set(view.camX + pointer.x * 0.22, view.lookY + 0.12 + pointer.y * 0.1, view.camZ);
      camera.lookAt(view.camX, view.lookY, 0);
      renderer.render(scene, camera);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      render();
    };
    const start = () => {
      if (running || reduce || !ready || occluded || document.hidden) return;
      running = true;
      frameDelta();
      loop();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(() => {
      layout();
      if (!running && ready) render();
    });
    ro.observe(mount);
    layout();

    const checkOcclusion = () => {
      if (!occluders) return;
      const covered = Array.from(document.querySelectorAll<HTMLElement>(occluders)).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= 0 && r.bottom >= window.innerHeight;
      });
      if (covered !== occluded) {
        occluded = covered;
        mount.style.visibility = covered ? "hidden" : "visible";
        if (covered) stop();
        else start();
      }
    };
    window.addEventListener("scroll", checkOcclusion, { passive: true });

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const toNdc = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)] as const;
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      [pointer.tx, pointer.ty] = toNdc(e);
      pointer.tActive = 1;
    };
    const onLeave = () => {
      pointer.tActive = 0;
      pointer.tx *= 0.3;
      pointer.ty *= 0.3;
      fx.tAttract = 0;
    };
    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      const [x, y] = toNdc(e);
      particleUniforms.uPulseOrigin.value.set(x, y);
      particleUniforms.uPulse.value = Math.min(particleUniforms.uPulse.value + 0.8, 1.2);
    };
    // Hovering a link, button or card pulls particles toward it.
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch" || reduce) return;
      const el = (e.target as Element | null)?.closest?.(attractors) ?? null;
      attractEl = el;
      fx.tAttract = el ? 1 : 0;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Scroll-linked stages across the page.
    const tweens: gsap.core.Tween[] = [];
    const q = (sel?: string) => (sel ? document.querySelector<HTMLElement>(sel) : null);
    if (!reduce) {
      const introEl = q(intro);
      if (introEl) {
        tweens.push(gsap.fromTo(introProg, { p: 0 }, {
          p: 1, ease: "none", immediateRender: false,
          scrollTrigger: { trigger: introEl, start: "top top", end: "bottom top", scrub: 1.2 },
        }));
      }
      formations.forEach((f, i) => {
        const el = q(f.trigger);
        if (!el) return;
        tweens.push(gsap.fromTo(stageProg[i], { p: 0 }, {
          p: 1, ease: "none", immediateRender: false,
          scrollTrigger: { trigger: el, start: "top 88%", end: "top 18%", scrub: 1.3 },
        }));
      });
    }

    const usesPortrait = initial === "portrait" || formations.some((f) => f.form === "portrait");
    const n = mobile ? count.mobile : count.desktop;
    (usesPortrait ? loadPortrait(src, n) : Promise.resolve(makeAbstract(Math.round(n * 0.7))))
      .then((d) => {
        if (disposed) return;
        particleUniforms.uMinY.value = d.bounds.minY;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(d.positions, 3));
        geo.setAttribute("aNormal", new THREE.BufferAttribute(d.normals, 3));
        geo.setAttribute("aRand", new THREE.BufferAttribute(d.randoms, 4));
        geo.setAttribute("aMeta", new THREE.BufferAttribute(d.meta, 3));
        geo.setAttribute("aSphere", new THREE.BufferAttribute(d.sphere, 3));
        geo.setAttribute("aTerrain", new THREE.BufferAttribute(d.terrain, 3));
        geo.setAttribute("aGalaxy", new THREE.BufferAttribute(d.galaxy, 3));
        const mat = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: softPointFragment, uniforms: particleUniforms, ...additive });
        const pts = new THREE.Points(geo, mat);
        pts.frustumCulled = false;
        group.add(pts);

        const lgeo = new THREE.BufferGeometry();
        lgeo.setAttribute("position", new THREE.BufferAttribute(d.linePositions, 3));
        lgeo.setAttribute("aSeed", new THREE.BufferAttribute(d.lineSeeds, 2));
        const lmat = new THREE.ShaderMaterial({ vertexShader: lineVertex, fragmentShader: lineFragment, uniforms: shared, ...additive });
        const lines = new THREE.LineSegments(lgeo, lmat);
        lines.frustumCulled = false;
        group.add(lines);
        disposables.push(geo, mat, lgeo, lmat);

        ready = true;
        ScrollTrigger.refresh();
        checkOcclusion();
        render();
        callbacks.current.onReady?.();
        // Cinematic entrance: the cloud converges into the portrait.
        if (!reduce) tweens.push(gsap.to(fx, { assemble: 0, duration: 3.2, ease: "power3.out", delay: 0.2 }));
        start();
      })
      .catch(() => callbacks.current.onUnsupported?.());

    return () => {
      disposed = true;
      stop();
      tweens.forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
      ro.disconnect();
      window.removeEventListener("scroll", checkOcclusion);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      disposables.forEach((x) => x.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Settings are read once per mount; remount the component to change them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={className} />;
}
