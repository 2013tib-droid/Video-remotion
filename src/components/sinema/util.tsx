import React, { createContext, useContext } from 'react';
import { Easing } from 'remotion';

/**
 * Dasar adegan sinema. Semua set digambar di kanvas 1080×1920 (unit SVG) lalu
 * di-"slice" ke ukuran video. Waktu selalu datang dari `useShot()` (detik sejak
 * shot mulai) agar deterministik — tidak ada Math.random/Date.
 */

export const W = 1080;
export const H = 1920;

/** Pseudo-acak deterministik 0..1 dari indeks + benih. */
export function rand(i: number, seed = 0): number {
  const x = Math.sin(i * 127.1 + seed * 311.7 + 0.5) * 43758.5453;
  return x - Math.floor(x);
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Progres 0..1 dari `a` ke `b` (detik) dengan easing halus. */
export function ramp(t: number, a: number, b: number, ease: (n: number) => number = SMOOTH): number {
  if (b <= a) return t >= a ? 1 : 0;
  return ease(clamp01((t - a) / (b - a)));
}
export const SMOOTH = Easing.bezier(0.45, 0, 0.2, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const DRIFT = Easing.inOut(Easing.sin);

/** Campur dua warna hex. */
export function mix(a: string, b: string, p: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, p));
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}

/** Palet cahaya per waktu. */
export interface Palette {
  sky: [number, string][];
  sun: string;
  glow: string;
  sunPos: [number, number];
  sunR: number;
  far: string;
  mid: string;
  near: string;
  ground: string;
  road: string;
  window: string;
  cloud: string;
  cloudLit: string;
  bird: string;
  stars: number;
}

export const PALETTES: Record<'fajar' | 'pagi' | 'senja', Palette> = {
  fajar: {
    sky: [
      [0, '#16203f'],
      [0.22, '#33355c'],
      [0.4, '#7a5170'],
      [0.53, '#c9716a'],
      [0.62, '#ee9f6b'],
      [0.7, '#f9cf8c'],
      [0.76, '#fde6b8'],
    ],
    sun: '#fff6dc',
    glow: '#ffc56f',
    sunPos: [650, 1215],
    sunR: 58,
    far: '#a06d7c',
    mid: '#4c2f47',
    near: '#24172a',
    ground: '#1b1220',
    road: '#b97a6c',
    window: '#ffd27c',
    cloud: '#6c4a6a',
    cloudLit: '#ffb07a',
    bird: '#2a1a2c',
    stars: 0.7,
  },
  pagi: {
    sky: [
      [0, '#24497a'],
      [0.22, '#4f7aa6'],
      [0.42, '#a7b9c4'],
      [0.6, '#f4d7a4'],
      [0.72, '#fde9c2'],
    ],
    sun: '#fffbea',
    glow: '#ffe2a0',
    sunPos: [720, 860],
    sunR: 52,
    far: '#b39a96',
    mid: '#5d4a4f',
    near: '#2c2228',
    ground: '#231b21',
    road: '#c79a83',
    window: '#ffe1a0',
    cloud: '#c9b3ae',
    cloudLit: '#fff1d4',
    bird: '#3a2c30',
    stars: 0,
  },
  senja: {
    sky: [
      [0, '#1e1740'],
      [0.24, '#4b2a5e'],
      [0.42, '#9c405e'],
      [0.55, '#e0644c'],
      [0.65, '#f79a52'],
      [0.74, '#fcc678'],
    ],
    sun: '#ffe7b0',
    glow: '#ff8f45',
    sunPos: [330, 1290],
    sunR: 74,
    far: '#93506a',
    mid: '#46203e',
    near: '#1f0e1d',
    ground: '#180b17',
    road: '#b2604f',
    window: '#ffc56a',
    cloud: '#5b2a52',
    cloudLit: '#ff9a5c',
    bird: '#21101f',
    stars: 0.25,
  },
};

/** Kamera dalam unit kanvas: geser (x, y) dan zoom di sekitar pusat. */
export interface Cam {
  x: number;
  y: number;
  zoom: number;
}

export interface ShotState {
  /** Detik sejak shot mulai. */
  t: number;
  /** Panjang shot (detik). */
  dur: number;
  cam: Cam;
  /** Ukuran video (px) & faktor skala kanvas → px. */
  vw: number;
  vh: number;
  k: number;
}

const ShotContext = createContext<ShotState>({ t: 0, dur: 5, cam: { x: 0, y: 0, zoom: 1 }, vw: W, vh: H, k: 1 });
export const ShotProvider = ShotContext.Provider;
export const useShot = () => useContext(ShotContext);

/** Transform SVG untuk lapisan dengan kedalaman `d` (0 = jauh tak bergerak, 1 = bidang utama, >1 = latar depan). */
export function layerTransform(cam: Cam, d: number): string {
  const z = 1 + (cam.zoom - 1) * d;
  return `translate(${W / 2 + cam.x * d} ${H / 2 + cam.y * d}) scale(${z}) translate(${-W / 2} ${-H / 2})`;
}

/**
 * Satu lapisan paralaks: SVG layar penuh (kanvas 1080×1920, slice) yang
 * bergerak menurut kamera sesuai kedalaman `d`. `blur` = kedalaman ruang tajam (px kanvas).
 */
export const Lapis: React.FC<{
  d: number;
  blur?: number;
  opacity?: number;
  blend?: React.CSSProperties['mixBlendMode'];
  children: React.ReactNode;
  defs?: React.ReactNode;
}> = ({ d, blur, opacity, blend, children, defs }) => {
  const { cam, k } = useShot();
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        filter: blur ? `blur(${blur * k}px)` : undefined,
        opacity,
        mixBlendMode: blend,
      }}
    >
      {defs ? <defs>{defs}</defs> : null}
      <g transform={layerTransform(cam, d)}>{children}</g>
    </svg>
  );
};

/** Gradien vertikal dari daftar [posisi, warna]. */
export const VGrad: React.FC<{ id: string; stops: [number, string][]; x1?: number; y1?: number; x2?: number; y2?: number }> = ({
  id,
  stops,
  x1 = 0,
  y1 = 0,
  x2 = 0,
  y2 = 1,
}) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    {stops.map(([o, c], i) => (
      <stop key={i} offset={o} stopColor={c} />
    ))}
  </linearGradient>
);

/** Gradien radial sederhana: warna di tengah → transparan. */
export const Glow: React.FC<{ id: string; color: string; opacity?: number; mid?: number }> = ({ id, color, opacity = 1, mid = 0.35 }) => (
  <radialGradient id={id}>
    <stop offset={0} stopColor={color} stopOpacity={opacity} />
    <stop offset={mid} stopColor={color} stopOpacity={opacity * 0.45} />
    <stop offset={1} stopColor={color} stopOpacity={0} />
  </radialGradient>
);

/** Filter blur SVG (dipakai awan, cahaya, siluet bercahaya). */
export const BlurFilter: React.FC<{ id: string; sd: number }> = ({ id, sd }) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={sd} />
  </filter>
);
