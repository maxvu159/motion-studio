import React, { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Real mesh-gradient background: a grid of colour control points, bicubic-interpolated
 * (Catmull-Rom, in sRGB, clamped to the local control colours). No blobs, no radial gradients.
 *
 * Motion = dragging the INNER points; the outer ring is pinned so the frame edge never shows.
 * Inner points move on Lissajous paths (x and y at different integer frequencies), so speed
 * varies naturally instead of the mechanical constant speed of a circle.
 *
 * Seamless loop: every frequency is an integer number of cycles per loop, and the multiples are
 * coprime (2 and 3), otherwise the pattern visibly repeats mid-video.
 * Keep horizontal amplitude small (0.06-0.07) in the column where text sits: a bright colour
 * dragged under text drops contrast fast. If contrast fails, brighten the text, not darken the bg.
 */

/** One inner point: Lissajous path + colour oscillation. */
export type MeshPoint = {
  /** horizontal drag amplitude (NDC, frame is 2 wide). */
  ax: number;
  /** vertical drag amplitude. */
  ay: number;
  /** horizontal cycles per loop — MUST be an integer. */
  kx: number;
  /** vertical cycles per loop — integer, different from kx. */
  ky: number;
  px: number;
  py: number;
  /** colour cycles per loop — integer. */
  ck: number;
  cp: number;
  /** alternate colour the point oscillates towards. */
  alt: string;
};

export type MeshConfig = {
  /** Colour grid, NY rows x NX cols, top row first. At least 3x3. */
  grid: string[][];
  /** Inner points, left-to-right then top-to-bottom. Length = (NX-2)*(NY-2). */
  points: MeshPoint[];
  /** Subdivisions per cell; 18 is smooth enough at 2K. */
  sub?: number;
  /** Luma grain amplitude (LSB). Chroma grain is fixed at 6 LSB. */
  grain?: number;
};

/** Motion of the 9 inner points of a 5x5 grid (brand-independent; tuned on real renders). */
const POINT_MOTION = [
  { ax: 0.07, ay: 0.16, kx: 2, ky: 3, px: 0.0, py: 1.3, ck: 2, cp: 0.4 },
  { ax: 0.12, ay: 0.20, kx: 3, ky: 2, px: 1.7, py: 4.1, ck: 3, cp: 2.2 },
  { ax: 0.24, ay: 0.17, kx: 2, ky: 3, px: 3.4, py: 0.6, ck: 2, cp: 4.0 },
  { ax: 0.06, ay: 0.22, kx: 3, ky: 2, px: 5.0, py: 2.9, ck: 3, cp: 1.1 },
  { ax: 0.13, ay: 0.18, kx: 2, ky: 3, px: 0.9, py: 5.4, ck: 2, cp: 3.3 },
  { ax: 0.22, ay: 0.24, kx: 3, ky: 2, px: 2.6, py: 1.1, ck: 3, cp: 5.1 },
  { ax: 0.07, ay: 0.19, kx: 2, ky: 3, px: 4.3, py: 3.7, ck: 2, cp: 2.7 },
  { ax: 0.11, ay: 0.24, kx: 3, ky: 2, px: 6.0, py: 0.2, ck: 3, cp: 0.8 },
  { ax: 0.25, ay: 0.17, kx: 2, ky: 3, px: 1.2, py: 4.8, ck: 2, cp: 4.6 },
];

/** Build a mesh config from a brand's 5x5 colour grid. Each inner point oscillates towards its right neighbour. */
export const meshFromGrid = (grid: string[][], grain = 9): MeshConfig => {
  const pts: MeshPoint[] = [];
  let m = 0;
  for (let j = 1; j < grid.length - 1; j++)
    for (let i = 1; i < grid[0].length - 1; i++) {
      const a = new THREE.Color(grid[j][i]); const b = new THREE.Color(grid[j][i + 1]);
      pts.push({ ...POINT_MOTION[m % POINT_MOTION.length], alt: "#" + a.lerp(b, 0.55).getHexString() });
      m++;
    }
  return { grid, points: pts, sub: 18, grain };
};

const VERT = `
attribute vec3 mcolor;
varying vec3 vCol;
void main() {
  vCol = mcolor;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec3 vCol;
uniform float uTime;
uniform float uGrain;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 toSRGB(vec3 c) {
  c = max(c, vec3(0.0));
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec3 col = vCol;

  // The framebuffer decodes sRGB once on output; vCol is already sRGB, so encode exactly once
  // to match CSS colours drawn on top.
  col = toSRGB(col);

  // Grain: luma at uGrain LSB, chroma fixed at 6 LSB (the eye is less sensitive to chroma, and
  // it is what breaks up colour banding).

  vec2 dp = gl_FragCoord.xy * 0.0173 + fract(uTime) * 7.1;
  vec3 d3 = vec3(hash(dp), hash(dp + 31.7), hash(dp + 71.3)) - 0.5;
  float dl = dot(d3, vec3(0.2126, 0.7152, 0.0722));
  vec3 dc = d3 - dl;
  col += (vec3(dl) * uGrain + dc * 6.0) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

/** Catmull-Rom: tangents come from the neighbours. */
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};
const cl = (i: number, n: number) => (i < 0 ? 0 : i > n - 1 ? n - 1 : i);

/** Colours stay in sRGB: interpolating in linear space let Catmull-Rom overshoot dark colours into black specks. */
const srgbRGB = (hex: string) => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b] as [number, number, number];
};

export const MeshSurface: React.FC<{
  t: number;
  width: number;
  height: number;
  loopSeconds?: number;
  config: MeshConfig;
}> = ({ t, width, height, loopSeconds = 14, config }) => {
  const geo = useRef<THREE.BufferGeometry>(null);

  const NY = config.grid.length;
  const NX = config.grid[0].length;
  const SUB = config.sub ?? 18;
  const VX = (NX - 1) * SUB + 1;
  const VY = (NY - 1) * SUB + 1;

  const BASE = useMemo(() => config.grid.map((row) => row.map(srgbRGB)), [config]);
  const ALT = useMemo(() => config.points.map((p) => srgbRGB(p.alt)), [config]);

  const { index, posArr, colArr } = useMemo(() => {
    const idx: number[] = [];
    for (let j = 0; j < VY - 1; j++) {
      for (let i = 0; i < VX - 1; i++) {
        const a = j * VX + i;
        idx.push(a, a + VX, a + 1, a + 1, a + VX, a + VX + 1);
      }
    }
    return {
      index: new Uint32Array(idx),
      posArr: new Float32Array(VX * VY * 3),
      colArr: new Float32Array(VX * VY * 3),
    };
  }, [VX, VY]);

  const { px, py, COL } = useMemo(() => {
    const ph = (2 * Math.PI * t) / loopSeconds;
    const X: number[][] = [];
    const Y: number[][] = [];
    const C = BASE.map((row) => row.map((c) => [...c] as [number, number, number]));
    let m = 0;
    for (let j = 0; j < NY; j++) {
      X.push([]);
      Y.push([]);
      for (let i = 0; i < NX; i++) {
        const bx = -1 + (2 * i) / (NX - 1);
        const by = 1 - (2 * j) / (NY - 1);
        if (i > 0 && i < NX - 1 && j > 0 && j < NY - 1) {
          const k = config.points[m];
          X[j].push(bx + k.ax * Math.sin(ph * k.kx + k.px));
          Y[j].push(by + k.ay * Math.sin(ph * k.ky + k.py));
          const w = 0.5 + 0.5 * Math.sin(ph * k.ck + k.cp);
          const a = BASE[j][i];
          const b = ALT[m];
          C[j][i] = [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
          m++;
        } else {
          X[j].push(bx);
          Y[j].push(by);
        }
      }
    }
    return { px: X, py: Y, COL: C };
  }, [t, loopSeconds, config, BASE, ALT, NX, NY]);

  useMemo(() => {
    const at = (u: number, v: number) => {
      const fx = u * (NX - 1);
      const i = Math.min(NX - 2, Math.floor(fx));
      const fy = v * (NY - 1);
      const j = Math.min(NY - 2, Math.floor(fy));
      return { i, tu: fx - i, j, tv: fy - j };
    };
    const samp = (P: number[][], u: number, v: number) => {
      const { i, tu, j, tv } = at(u, v);
      const r: number[] = [];
      for (let d = -1; d <= 2; d++) {
        const row = P[cl(j + d, NY)];
        r.push(cr(row[cl(i - 1, NX)], row[cl(i, NX)], row[cl(i + 1, NX)], row[cl(i + 2, NX)], tu));
      }
      return cr(r[0], r[1], r[2], r[3], tv);
    };
    const sampC = (ch: 0 | 1 | 2, u: number, v: number) => {
      const { i, tu, j, tv } = at(u, v);
      const r: number[] = [];
      let lo = Infinity;
      let hi = -Infinity;
      for (let d = -1; d <= 2; d++) {
        const row = COL[cl(j + d, NY)];
        for (let e = -1; e <= 2; e++) {
          const val = row[cl(i + e, NX)][ch];
          if (val < lo) lo = val;
          if (val > hi) hi = val;
        }
        r.push(cr(row[cl(i - 1, NX)][ch], row[cl(i, NX)][ch], row[cl(i + 1, NX)][ch], row[cl(i + 2, NX)][ch], tu));
      }
      const out = cr(r[0], r[1], r[2], r[3], tv);
      return out < lo ? lo : out > hi ? hi : out;
    };
    let n = 0;
    for (let j = 0; j < VY; j++) {
      const v = j / (VY - 1);
      for (let i = 0; i < VX; i++) {
        const u = i / (VX - 1);
        posArr[n] = samp(px, u, v);
        posArr[n + 1] = samp(py, u, v);
        posArr[n + 2] = 0;
        colArr[n] = sampC(0, u, v);
        colArr[n + 1] = sampC(1, u, v);
        colArr[n + 2] = sampC(2, u, v);
        n += 3;
      }
    }
    if (geo.current) {
      geo.current.attributes.position.needsUpdate = true;
      geo.current.attributes.mcolor.needsUpdate = true;
    }
  }, [px, py, COL, posArr, colArr, NX, NY, VX, VY]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uGrain: { value: config.grain ?? 9.0 } }),
    [config],
  );
  uniforms.uTime.value = t;

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="index" args={[index, 1]} />
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
        <bufferAttribute attach="attributes-mcolor" args={[colArr, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};
