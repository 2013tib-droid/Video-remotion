import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BlurFilter, Glow, H, Lapis, W, rand, useShot } from './util';

/**
 * Atmosfer sinematik: debu emas, berkas cahaya (god rays), lens flare,
 * grain film, vinyet, dan color grade hangat. Semua deterministik dari waktu shot.
 */

/** Debu/partikel emas melayang pelan (bokeh di dekat kamera). */
export const Dust: React.FC<{
  count?: number;
  seed?: number;
  color?: string;
  opacity?: number;
  /** Batas area [x, y, w, h] (unit kanvas). Default seluruh kanvas. */
  region?: [number, number, number, number];
  /** Geser x per satuan y (untuk debu di dalam berkas cahaya miring). */
  skew?: number;
  /** Kedalaman lapisan (paralaks). */
  d?: number;
  /** Pengali ukuran. */
  size?: number;
  /** Arah gerak: naik pelan (default) atau turun (cahaya dari langit). */
  fall?: boolean;
}> = ({ count = 60, seed = 1, color = '#ffe2a6', opacity = 1, region = [-120, -120, W + 240, H + 240], skew = 0, d = 1, size = 1, fall }) => {
  const { t } = useShot();
  const [rx, ry, rw, rh] = region;
  const id = `dust-${seed}-${color.slice(1)}`;
  return (
    <Lapis d={d} defs={<Glow id={id} color={color} mid={0.3} />}>
      {Array.from({ length: count }, (_, i) => {
        const near = rand(i, seed + 3) > 0.86;
        const v = (6 + rand(i, seed + 1) * 16) * (fall ? -1 : 1);
        const ph = rand(i, seed + 2) * Math.PI * 2;
        const yy = ((((rand(i, seed + 5) * rh - t * v) % rh) + rh) % rh) + ry;
        const xx = rx + rand(i, seed + 4) * rw + Math.sin(t * 0.35 + ph) * 18 + (yy - ry) * skew;
        const r = (near ? 9 + rand(i, seed + 6) * 12 : 1.4 + rand(i, seed + 7) * 3.2) * size;
        const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + rand(i, seed + 8)) + ph);
        const fadeEdge = Math.min(1, (yy - ry) / 120, (ry + rh - yy) / 120);
        return (
          <circle
            key={i}
            cx={xx}
            cy={yy}
            r={r * 2.4}
            fill={`url(#${id})`}
            opacity={Math.max(0, (near ? 0.28 : 0.85) * tw * fadeEdge * opacity)}
          />
        );
      })}
    </Lapis>
  );
};

/** Berkas cahaya dari satu titik (matahari/jendela), berputar sangat pelan. */
export const GodRays: React.FC<{
  x: number;
  y: number;
  color?: string;
  opacity?: number;
  count?: number;
  length?: number;
  /** Rentang sudut [dari, ke] (derajat, 0 = kanan, 90 = bawah). */
  spread?: [number, number];
  d?: number;
  seed?: number;
}> = ({ x, y, color = '#ffd99a', opacity = 0.35, count = 12, length = 1900, spread = [0, 360], d = 0.2, seed = 3 }) => {
  const { t } = useShot();
  const id = `rays-${seed}-${Math.round(x)}-${Math.round(y)}-${color.slice(1)}`;
  return (
    <Lapis
      d={d}
      blend="screen"
      defs={
        <>
          <radialGradient id={id} cx={x} cy={y} r={length} gradientUnits="userSpaceOnUse">
            <stop offset={0} stopColor={color} stopOpacity={0.9} />
            <stop offset={0.35} stopColor={color} stopOpacity={0.35} />
            <stop offset={1} stopColor={color} stopOpacity={0} />
          </radialGradient>
          <BlurFilter id={`${id}-b`} sd={14} />
        </>
      }
    >
      <g filter={`url(#${id}-b)`} opacity={opacity}>
        {Array.from({ length: count }, (_, i) => {
          const base = spread[0] + ((spread[1] - spread[0]) * (i + rand(i, seed) * 0.6)) / count;
          const a = ((base + Math.sin(t * 0.12 + i) * 1.6) * Math.PI) / 180;
          const wdt = ((1.2 + rand(i, seed + 1) * 2.8) * Math.PI) / 180;
          const pulse = 0.55 + 0.45 * Math.sin(t * 0.4 + i * 1.7);
          const p1 = [x + Math.cos(a - wdt) * length, y + Math.sin(a - wdt) * length];
          const p2 = [x + Math.cos(a + wdt) * length, y + Math.sin(a + wdt) * length];
          return <polygon key={i} points={`${x},${y} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={`url(#${id})`} opacity={pulse} />;
        })}
      </g>
    </Lapis>
  );
};

/** Lens flare: inti terang, garis anamorfik, dan "hantu" lensa di garis menuju pusat. */
export const Flare: React.FC<{ x: number; y: number; color?: string; opacity?: number; d?: number }> = ({
  x,
  y,
  color = '#ffd28a',
  opacity = 1,
  d = 0.15,
}) => {
  const { t, cam } = useShot();
  // Posisi matahari di layar (kira-kira) → hantu lensa berada di garis matahari → pusat layar.
  const z = 1 + (cam.zoom - 1) * d;
  const sx = W / 2 + cam.x * d + (x - W / 2) * z;
  const sy = H / 2 + cam.y * d + (y - H / 2) * z;
  const breathe = 0.85 + 0.15 * Math.sin(t * 0.9);
  const ghosts: [number, number, string, number][] = [
    [0.55, 34, '#9fe6d2', 0.06],
    [0.9, 80, '#ffd28a', 0.035],
    [1.25, 22, '#ffffff', 0.07],
    [1.55, 120, '#f6a3c0', 0.025],
    [1.9, 50, '#a8d8ff', 0.045],
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen', opacity }}>
      <defs>
        <Glow id={`flare-core-${color.slice(1)}`} color={color} mid={0.2} />
        <Glow id="flare-white" color="#ffffff" mid={0.25} />
        <linearGradient id="flare-streak" x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff6e0" stopOpacity={0.75} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <circle cx={sx} cy={sy} r={420 * breathe} fill={`url(#flare-core-${color.slice(1)})`} opacity={0.45} />
      <circle cx={sx} cy={sy} r={110} fill="url(#flare-white)" opacity={0.8} />
      <ellipse cx={sx} cy={sy} rx={620} ry={5} fill="url(#flare-streak)" opacity={0.55 * breathe} />
      {ghosts.map(([f, r, c, o], i) => (
        <circle key={i} cx={sx + (W / 2 - sx) * f} cy={sy + (H / 2 - sy) * f} r={r} fill={c} opacity={o * breathe} />
      ))}
    </svg>
  );
};

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Grain film + vinyet + grade hangat. Lapisan paling atas (di bawah teks). */
export const FilmLook: React.FC<{ vignette?: number; grain?: number; warm?: number }> = ({ vignette = 0.5, grain = 0.07, warm = 1 }) => {
  const frame = useCurrentFrame();
  const ox = Math.floor(rand(frame, 9) * 220);
  const oy = Math.floor(rand(frame, 11) * 220);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(255,196,128,0.14) 0%, rgba(255,170,110,0.04) 50%, rgba(120,60,30,0.10) 100%)',
          mixBlendMode: 'soft-light',
          opacity: warm,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 45%, rgba(18,8,4,${vignette * 0.55}) 80%, rgba(10,4,2,${vignette}) 100%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: NOISE, backgroundPosition: `${ox}px ${oy}px`, opacity: grain, mixBlendMode: 'overlay' }} />
    </AbsoluteFill>
  );
};

/** Kilau cahaya hangat yang menyapu layar (light leak) — penanda pergantian adegan. */
export const LightLeak: React.FC<{ t: number; at: number; dur?: number; from?: 'left' | 'right' }> = ({ t, at, dur = 1.4, from = 'left' }) => {
  const p = (t - at) / dur;
  if (p < 0 || p > 1) return null;
  const a = Math.sin(p * Math.PI);
  const x = from === 'left' ? -20 + p * 140 : 120 - p * 140;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: a * 0.55,
        background: `radial-gradient(ellipse 60% 45% at ${x}% 40%, rgba(255,214,150,0.95) 0%, rgba(255,160,90,0.45) 40%, rgba(255,120,60,0) 75%)`,
      }}
    />
  );
};

/** Langit gradien + bintang samar (fajar/senja). */
export const SkyFill: React.FC<{ stops: [number, string][]; id: string; stars?: number; seed?: number }> = ({ stops, id, stars = 0, seed = 2 }) => {
  const { t } = useShot();
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o, c], i) => (
            <stop key={i} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill={`url(#${id})`} />
      {stars > 0
        ? Array.from({ length: 40 }, (_, i) => {
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + rand(i, seed)) + i));
            return (
              <circle
                key={i}
                cx={-200 + rand(i, seed + 1) * (W + 400)}
                cy={-500 + rand(i, seed + 2) * 1000}
                r={0.8 + rand(i, seed + 3) * 1.6}
                fill="#fff8e8"
                opacity={stars * tw * (0.3 + rand(i, seed + 4) * 0.7)}
              />
            );
          })
        : null}
    </>
  );
};

/** Awan lembut: gugus elips kabur, sisi bawah tersinari. */
export const Cloud: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  lit: string;
  opacity?: number;
  seed?: number;
  drift?: number;
  litSide?: 'bottom' | 'top';
}> = ({ x, y, w, h, color, lit, opacity = 1, seed = 1, drift = 6, litSide = 'bottom' }) => {
  const { t } = useShot();
  const dx = t * drift;
  const puffs = 7;
  return (
    <g transform={`translate(${x + dx} ${y})`} opacity={opacity} filter="url(#cloud-blur)">
      {Array.from({ length: puffs }, (_, i) => {
        const px = (i / (puffs - 1) - 0.5) * w * 0.9 + (rand(i, seed) - 0.5) * w * 0.12;
        const ry = h * (0.35 + rand(i, seed + 1) * 0.35) * (1 - Math.abs(i / (puffs - 1) - 0.5) * 0.9);
        const rx = w * (0.14 + rand(i, seed + 2) * 0.1);
        return <ellipse key={i} cx={px} cy={-ry * 0.3} rx={rx} ry={ry} fill={color} />;
      })}
      {Array.from({ length: puffs }, (_, i) => {
        const px = (i / (puffs - 1) - 0.5) * w * 0.8 + (rand(i, seed + 4) - 0.5) * w * 0.1;
        const rx = w * (0.12 + rand(i, seed + 5) * 0.08);
        return <ellipse key={`l${i}`} cx={px} cy={litSide === 'bottom' ? h * 0.18 : -h * 0.45} rx={rx} ry={h * 0.16} fill={lit} opacity={0.85} />;
      })}
    </g>
  );
};

/** Defs bersama untuk set yang memakai awan. */
export const CloudDefs: React.FC = () => <BlurFilter id="cloud-blur" sd={16} />;
