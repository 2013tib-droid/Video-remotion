import React from 'react';
import { rand, useShot } from './util';

/**
 * Siluet: orang (pakaian muslim: peci & koko/sarung, hijab & gamis, anak-anak),
 * burung, pohon kelapa, pohon rimbun, lampu jalan, motor. Tanpa wajah — siluet
 * berlatar cahaya, gaya dokumenter sinematik.
 */

export type OrangKind = 'pria' | 'priaCelana' | 'wanita' | 'anak' | 'anakPerempuan';
export type OrangPose = 'walk' | 'stand' | 'give' | 'receive' | 'bow' | 'sit' | 'hold';

export interface OrangProps {
  kind: OrangKind;
  /** Posisi kaki (unit kanvas). */
  x: number;
  y: number;
  /** Tinggi relatif (1 = ±190 unit dewasa). */
  s?: number;
  /** Arah hadap: 1 kanan, -1 kiri. */
  dir?: 1 | -1;
  pose?: OrangPose;
  color: string;
  /** Langkah per detik (gerak lambat ±0,55). */
  pace?: number;
  phase?: number;
  /** Benda di tangan depan (pose give/hold/receive). */
  item?: 'box' | 'plate' | 'bottle' | null;
  itemColor?: string;
  /** Sudut lengan depan manual (derajat, negatif = ke depan). */
  arm?: number;
  /** Condong badan (derajat, positif = ke depan). */
  lean?: number;
  /** Penutup kepala pria: `peci` (default), `helm` (pekerja), `none`. */
  hat?: 'peci' | 'helm' | 'none';
}

const ARM = 60;

function Arm({ x, y, a, w, len, color }: { x: number; y: number; a: number; w: number; len: number; color: string }) {
  // Lengan meruncing (bahu → pergelangan) + telapak tangan lonjong.
  const e = len * 0.48;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`} fill={color}>
      <circle cx={0} cy={0} r={w * 0.55} />
      <path
        d={`M ${-w * 0.55} 0 Q ${-w * 0.6} ${e} ${-w * 0.42} ${e} L ${-w * 0.34} ${len} L ${w * 0.34} ${len} L ${w * 0.42} ${e} Q ${w * 0.6} ${e} ${w * 0.55} 0 Z`}
      />
      <ellipse cx={w * 0.08} cy={len + w * 0.42} rx={w * 0.42} ry={w * 0.68} />
    </g>
  );
}

function Item({ kind, color }: { kind: 'box' | 'plate' | 'bottle'; color: string }) {
  if (kind === 'box')
    return (
      <g>
        <rect x={-6} y={-22} width={36} height={24} rx={3} fill={color} />
        <rect x={-6} y={-22} width={36} height={6} rx={2} fill="#ffffff" opacity={0.35} />
        <path d="M 12 -22 L 12 2" stroke="#000" strokeOpacity={0.15} strokeWidth={1.5} />
      </g>
    );
  if (kind === 'plate')
    return (
      <g>
        <ellipse cx={14} cy={-4} rx={22} ry={6} fill={color} />
        <ellipse cx={14} cy={-9} rx={13} ry={7} fill={color} opacity={0.9} />
      </g>
    );
  return <rect x={2} y={-34} width={12} height={34} rx={4} fill={color} />;
}

/** Satu orang (siluet, menghadap kanan; `dir: -1` dicerminkan). */
export const Orang: React.FC<OrangProps> = ({
  kind,
  x,
  y,
  s = 1,
  dir = 1,
  pose = 'walk',
  color,
  pace = 0.55,
  phase = 0,
  item = null,
  itemColor = '#f5e6c8',
  arm,
  lean = 0,
  hat = 'peci',
}) => {
  const { t } = useShot();
  const child = kind === 'anak' || kind === 'anakPerempuan';
  const female = kind === 'wanita' || kind === 'anakPerempuan';
  const sc = s * (child ? 0.62 : 1);
  const walking = pose === 'walk';
  const ph = t * pace * Math.PI * 2 + phase * Math.PI * 2;
  const sw = walking ? Math.sin(ph) : 0;
  const bob = walking ? -Math.abs(Math.cos(ph)) * 2.6 : Math.sin(t * 1.3 + phase * 6) * 0.6;
  const legA = walking ? sw * 21 : pose === 'stand' || pose === 'receive' || pose === 'give' ? 4 : 0;
  const armSwing = sw * (female ? 12 : 17);
  const shoulderY = female ? -128 : -142;
  const hipY = -88;
  let front = armSwing * -1;
  let back = armSwing;
  if (pose === 'give') front = arm ?? -72;
  if (pose === 'hold') front = arm ?? -48;
  if (pose === 'receive') {
    front = arm ?? -66;
    back = -58;
  }
  if (pose === 'bow') front = arm ?? -62;
  if (pose === 'stand') {
    front = arm ?? 4;
    back = -3;
  }
  const leanDeg = pose === 'bow' ? lean || 26 : lean;
  const sarung = kind === 'pria';
  const hem = sw * 3;

  const handPos = (a: number) => {
    const r = (a * Math.PI) / 180;
    return [-Math.sin(r) * ARM, shoulderY + Math.cos(r) * ARM];
  };

  if (pose === 'sit') {
    // Duduk tahiyat (menghadap kanan): kaki terlipat di lantai, punggung tegak.
    return (
      <g transform={`translate(${x} ${y}) scale(${sc * dir} ${sc})`} fill={color}>
        <path d="M -38 0 Q -40 -30 -18 -34 L 22 -34 Q 34 -30 34 -10 L 34 0 Z" />
        <path d="M -20 -30 Q -22 -70 -12 -96 Q 4 -104 14 -96 Q 18 -66 18 -32 Z" />
        <circle cx={2} cy={-112} r={12.5} />
        {female ? (
          <path d="M -13 -114 Q -13 -128 1 -129 Q 15 -128 15 -112 Q 18 -98 22 -84 L -18 -82 Q -16 -98 -13 -114 Z" />
        ) : (
          <path d="M -10 -122 L -9 -131 Q 2 -134 13 -131 L 14 -122 Z" />
        )}
        <Arm x={4} y={-92} a={-38} w={9} len={46} color={color} />
      </g>
    );
  }

  const handFront = handPos(front);

  return (
    <g transform={`translate(${x} ${y + bob * sc}) scale(${sc * dir} ${sc})`} fill={color}>
      {/* Lengan belakang */}
      <g transform={`rotate(${leanDeg} 0 ${hipY})`}>
        <Arm x={-1} y={shoulderY + 2} a={back} w={female ? 10 : 9} len={ARM - 2} color={color} />
      </g>
      {/* Kaki */}
      {sarung ? (
        <>
          <path d={`M -17 ${hipY} L 17 ${hipY} L ${19 + hem} -7 Q 0 -3 ${-19 + hem} -7 Z`} />
          <ellipse cx={sw * 9 + 6} cy={-3} rx={10} ry={4} />
          <ellipse cx={-sw * 9 + 2} cy={-3} rx={10} ry={4} />
        </>
      ) : female ? (
        <>
          <ellipse cx={sw * 8 + 6} cy={-3} rx={9} ry={3.6} />
          <ellipse cx={-sw * 8 + 2} cy={-3} rx={9} ry={3.6} />
        </>
      ) : (
        [legA, -legA].map((a, i) => (
          <g key={i} transform={`translate(${i ? -2 : 2} ${hipY + 2}) rotate(${-a})`}>
            <path d="M -8 0 L 8 0 L 6.5 84 L -5.5 84 Z" />
            <path d="M -6 80 Q -6 88 2 88 L 13 88 Q 15 84 10 80 Z" />
          </g>
        ))
      )}
      {/* Badan + kepala (condong dari pinggul) */}
      <g transform={`rotate(${leanDeg} 0 ${hipY})`}>
        {female ? (
          <>
            <path d={`M -18 -132 Q 0 -137 19 -132 Q 22 -70 ${25 + hem} -6 Q 0 -1 ${-25 + hem} -6 Q -22 -70 -18 -132 Z`} />
            <g transform={child ? 'translate(1 -132) scale(1.2) translate(-1 132)' : undefined}>
            <circle cx={2} cy={-160} r={13} />
            <path d="M -14 -163 Q -14 -180 1 -181 Q 16 -180 16 -162 Q 18 -146 23 -127 Q 0 -120 -21 -127 Q -16 -146 -14 -163 Z" />
            <ellipse cx={15} cy={-160} rx={3.6} ry={4} />
            </g>
          </>
        ) : (
          <>
            <path d={`M -15 -146 Q 0 -151 15 -146 Q 18 -116 17 ${hipY + 2} Q 0 ${hipY + 6} -17 ${hipY + 2} Q -18 -116 -15 -146 Z`} />
            <rect x={-4.5} y={-156} width={10} height={12} />
            <g transform={child ? 'translate(1 -152) scale(1.22) translate(-1 152)' : undefined}>
            <circle cx={1} cy={-166} r={12.5} />
            <ellipse cx={13} cy={-165} rx={3.4} ry={3} />
            {hat === 'peci' ? <path d="M -12 -174 L -11 -185 Q 1 -188 13 -185 L 13 -174 Z" /> : null}
            {hat === 'helm' ? <path d="M -15 -168 Q -15 -186 1 -187 Q 17 -186 17 -170 L 24 -168 L 24 -164 L -15 -165 Z" /> : null}
            </g>
          </>
        )}
        {/* Lengan depan + benda */}
        <Arm x={2} y={shoulderY + 2} a={front} w={female ? 10 : 9} len={ARM} color={color} />
        {item ? (
          <g transform={`translate(${handFront[0] + 2} ${handFront[1] + 6})`}>
            <Item kind={item} color={itemColor} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

/** Kawanan burung mengepak pelan melintasi langit. */
export const Birds: React.FC<{
  count?: number;
  x: number;
  y: number;
  color: string;
  seed?: number;
  speed?: number;
  scale?: number;
  spread?: number;
}> = ({ count = 7, x, y, color, seed = 5, speed = 22, scale = 1, spread = 260 }) => {
  const { t } = useShot();
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const bx = x + (rand(i, seed) - 0.5) * spread + t * speed * (0.85 + rand(i, seed + 1) * 0.3);
        const by = y + (rand(i, seed + 2) - 0.5) * spread * 0.45 + Math.sin(t * 0.7 + i) * 6;
        const s = scale * (0.6 + rand(i, seed + 3) * 0.6);
        const k = 9 * Math.sin(t * (5 + rand(i, seed + 4) * 2) + i * 1.3);
        return (
          <path
            key={i}
            transform={`translate(${bx} ${by}) scale(${s})`}
            d={`M -15 ${-k * 0.4} Q -7 ${-k - 3} 0 1 Q 7 ${-k - 3} 15 ${-k * 0.4}`}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </g>
  );
};

/** Satu pelepah kelapa: poligon bergerigi sepanjang lengkung yang menjuntai. */
function frond(len: number, angle: number, droop: number, seed: number): string {
  const n = 16;
  const a = (angle * Math.PI) / 180;
  const pts: [number, number][] = [];
  const back: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const px = Math.cos(a) * len * u;
    const py = Math.sin(a) * len * u + droop * u * u;
    const dx = Math.cos(a) * len;
    const dy = Math.sin(a) * len + 2 * droop * u;
    const m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m;
    const ny = dx / m;
    const wdt = (len * 0.16 * Math.sin(Math.PI * Math.min(1, u * 1.1)) + 1.5) * (i % 2 ? 1 : 0.45 + rand(i, seed) * 0.2);
    pts.push([px + nx * wdt + (i % 2 ? dx / m * 6 : 0), py + ny * wdt + (i % 2 ? dy / m * 6 : 0)]);
    back.push([px - nx * wdt * 0.8, py - ny * wdt * 0.8 + (i % 2 ? 8 : 0)]);
  }
  const all = [...pts, ...back.reverse()];
  return `M ${all.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`;
}

/** Pohon kelapa (siluet) dengan pelepah bergoyang pelan. */
export const Palem: React.FC<{ x: number; y: number; h: number; lean?: number; color: string; seed?: number; s?: number }> = ({
  x,
  y,
  h,
  lean = 40,
  color,
  seed = 1,
  s = 1,
}) => {
  const { t } = useShot();
  const top: [number, number] = [lean, -h];
  const fronds = [-170, -145, -118, -60, -35, -8, 18, 160, -95, 200];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d={`M -9 0 Q ${lean * 0.2 - 8} ${-h * 0.55} ${top[0] - 4} ${top[1]} L ${top[0] + 4} ${top[1]} Q ${lean * 0.2 + 9} ${-h * 0.55} 9 0 Z`} />
      <g transform={`translate(${top[0]} ${top[1]})`}>
        {fronds.map((a, i) => {
          const sway = Math.sin(t * 0.55 + i * 0.9 + seed) * 3.2;
          return (
            <g key={i} transform={`rotate(${sway})`}>
              <path d={frond(120 + rand(i, seed) * 70, a, 50 + rand(i, seed + 1) * 50, seed + i)} />
            </g>
          );
        })}
        <circle cx={0} cy={4} r={10} />
      </g>
    </g>
  );
};

/** Pohon rimbun (mangga/beringin) dari gugus lingkaran. */
export const Pohon: React.FC<{ x: number; y: number; r: number; color: string; seed?: number }> = ({ x, y, r, color, seed = 2 }) => {
  const { t } = useShot();
  const sway = Math.sin(t * 0.4 + seed) * 1.2;
  return (
    <g transform={`translate(${x} ${y})`} fill={color}>
      <path d={`M -${r * 0.09} 0 L -${r * 0.06} ${-r * 1.1} L ${r * 0.06} ${-r * 1.1} L ${r * 0.09} 0 Z`} />
      <g transform={`rotate(${sway} 0 ${-r})`}>
        {Array.from({ length: 11 }, (_, i) => {
          const a = (i / 11) * Math.PI * 2;
          const rr = r * (0.42 + rand(i, seed) * 0.25);
          return <circle key={i} cx={Math.cos(a) * r * 0.55} cy={-r * 1.35 + Math.sin(a) * r * 0.4} r={rr} />;
        })}
        <circle cx={0} cy={-r * 1.4} r={r * 0.6} />
      </g>
    </g>
  );
};

/** Tiang lampu jalan yang masih menyala. */
export const LampuJalan: React.FC<{ x: number; y: number; h: number; color: string; light: string; on?: number; dir?: 1 | -1 }> = ({
  x,
  y,
  h,
  color,
  light,
  on = 1,
  dir = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${dir} 1)`}>
    <circle cx={34} cy={-h + 14} r={70} fill={light} opacity={0.22 * on} filter="url(#soft-glow)" />
    <rect x={-4} y={-h} width={8} height={h} fill={color} />
    <path d={`M 0 ${-h} Q 18 ${-h - 18} 40 ${-h + 2}`} stroke={color} strokeWidth={6} fill="none" />
    <path d={`M 26 ${-h + 2} L 54 ${-h + 2} L 48 ${-h + 12} L 32 ${-h + 12} Z`} fill={color} />
    <ellipse cx={40} cy={-h + 13} rx={9} ry={3} fill={light} opacity={on} />
  </g>
);

/** Motor + pengendara berhelm, melintas pelan. */
export const Motor: React.FC<{ x: number; y: number; s?: number; color: string; light?: string; dir?: 1 | -1 }> = ({
  x,
  y,
  s = 1,
  color,
  light = '#fff1c4',
  dir = 1,
}) => {
  const { t } = useShot();
  const spin = t * 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`} fill={color}>
      {[-46, 48].map((wx, i) => (
        <g key={i} transform={`translate(${wx} -22) rotate(${spin})`}>
          <circle r={22} />
          <circle r={9} fill={light} opacity={0.08} />
        </g>
      ))}
      <path d="M -70 -34 Q -60 -60 -20 -58 L 24 -58 Q 40 -60 52 -84 L 62 -84 Q 60 -56 70 -36 Q 30 -28 -10 -30 Z" />
      <path d="M 52 -84 L 46 -112 L 54 -114 L 62 -86 Z" />
      <ellipse cx={74} cy={-70} rx={5} ry={7} fill={light} />
      <path d="M 78 -70 L 260 -96 L 260 -44 Z" fill={light} opacity={0.12} />
      {/* Pengendara */}
      <path d="M -26 -58 Q -30 -100 -10 -118 L 14 -116 Q 20 -96 26 -84 L 46 -100 L 52 -92 L 30 -72 Q 10 -66 -6 -62 Z" />
      <path d="M -6 -62 L 30 -60 L 38 -30 L 28 -28 L 22 -50 L -4 -50 Z" />
      <circle cx={2} cy={-134} r={17} />
      <path d="M -16 -136 Q -14 -156 4 -156 Q 22 -154 22 -134 Z" />
    </g>
  );
};
