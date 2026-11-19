import React from 'react';
import { Dust } from './atmos';
import { Orang } from './figures';
import { BlurFilter, Glow, H, Lapis, W, rand, useShot } from './util';

/** Lengkung runcing (ogival) beralas di `base`, lebar `w`, puncak di `top`. */
export const ogive = (cx: number, base: number, w: number, top: number) => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const ys = top + w * 0.62;
  return `M ${x0} ${base} L ${x0} ${ys} C ${x0} ${ys - w * 0.42} ${cx - w * 0.12} ${top + w * 0.14} ${cx} ${top} C ${cx + w * 0.12} ${top + w * 0.14} ${x1} ${ys - w * 0.42} ${x1} ${ys} L ${x1} ${base} Z`;
};

/** Pola kisi bintang delapan (masyrabiyah) sebagai garis. */
export const StarLattice: React.FC<{ x: number; y: number; w: number; h: number; cell: number; color: string; width?: number; opacity?: number }> = ({
  x,
  y,
  w,
  h,
  cell,
  color,
  width = 3,
  opacity = 1,
}) => {
  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;
  const r = cell * 0.36;
  const star = (cx: number, cy: number) =>
    `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z M ${cx} ${cy - r * 1.41} L ${cx + r * 1.41} ${cy} L ${cx} ${cy + r * 1.41} L ${cx - r * 1.41} ${cy} Z`;
  const d: string[] = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) d.push(star(x + i * cell, y + j * cell));
  for (let i = 0; i < cols; i++) d.push(`M ${x + i * cell + cell / 2} ${y - cell} L ${x + i * cell + cell / 2} ${y + h + cell}`);
  for (let j = 0; j < rows; j++) d.push(`M ${x - cell} ${y + j * cell + cell / 2} L ${x + w + cell} ${y + j * cell + cell / 2}`);
  return <path d={d.join(' ')} stroke={color} strokeWidth={width} fill="none" opacity={opacity} />;
};

/** Lampu gantung (lentera kuningan) yang berayun pelan. */
function Lentera({ x, y, s = 1, seed = 1 }: { x: number; y: number; s?: number; seed?: number }) {
  const { t } = useShot();
  const sway = Math.sin(t * 0.7 + seed) * 1.6;
  const flick = 0.9 + 0.1 * Math.sin(t * 7 + seed * 3) * Math.sin(t * 3.1 + seed);
  return (
    <g transform={`rotate(${sway} ${x} -900)`}>
      <line x1={x} y1={-900} x2={x} y2={y - 60 * s} stroke="#2a1a10" strokeWidth={3 * s} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={190} fill="url(#lentera-glow)" opacity={0.55 * flick} />
        <path d="M -8 -62 L 8 -62 L 14 -48 L -14 -48 Z" fill="#6b4a22" />
        <path d="M -34 -46 L 34 -46 L 42 -10 L 30 34 L -30 34 L -42 -10 Z" fill="#ffd98c" opacity={0.95 * flick} />
        <path d="M -34 -46 L 34 -46 L 42 -10 L 30 34 L -30 34 L -42 -10 Z" fill="none" stroke="#7a5426" strokeWidth={4} />
        <path d="M 0 -46 L 0 34 M -40 -10 L 40 -10" stroke="#7a5426" strokeWidth={3} />
        <path d="M -30 34 L 30 34 L 12 52 L -12 52 Z" fill="#6b4a22" />
        <circle cy={60} r={5} fill="#6b4a22" />
      </g>
    </g>
  );
}

/** Interior masjid: mihrab bercahaya, lengkung bertingkat, lentera, karpet saf. */
export const MihrabSet: React.FC<{ dust?: number }> = ({ dust = 0.7 }) => {
  const { t } = useShot();
  return (
    <>
      <Lapis
        d={0.1}
        defs={
          <>
            <linearGradient id="mihrab-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#140c08" />
              <stop offset={0.45} stopColor="#3d2717" />
              <stop offset={0.78} stopColor="#5a3b22" />
              <stop offset={1} stopColor="#2a1a10" />
            </linearGradient>
            <linearGradient id="mihrab-niche" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#f4d9a0" />
              <stop offset={0.55} stopColor="#c48d4c" />
              <stop offset={1} stopColor="#6e4626" />
            </linearGradient>
            <Glow id="mihrab-glow" color="#ffd690" mid={0.3} />
          </>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#mihrab-wall)" />
        <ellipse cx={540} cy={1060} rx={620} ry={760} fill="url(#mihrab-glow)" opacity={0.55} />
        {/* Bingkai mihrab */}
        <path d={ogive(540, 1520, 520, 520)} fill="#2a1a10" />
        <path d={ogive(540, 1520, 488, 548)} fill="none" stroke="#b8892a" strokeWidth={6} />
        <StarLattice x={290} y={560} w={500} h={960} cell={62} color="#b8892a" width={1.6} opacity={0.22} />
        <path d={ogive(540, 1520, 380, 640)} fill="url(#mihrab-niche)" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={ogive(540, 900 + i * 18, 300 - i * 64, 680 + i * 46)} fill="none" stroke="#8a5a2a" strokeWidth={3} opacity={0.6} />
        ))}
        <path d={ogive(540, 1520, 380, 640)} fill="none" stroke="#e8c472" strokeWidth={4} />
      </Lapis>
      {/* Deret lengkung samping */}
      <Lapis d={0.3}>
        {[-1, 1].map((side) =>
          [0, 1, 2].map((i) => {
            const cx = 540 + side * (390 + i * 170);
            const w = 150 + i * 30;
            const top = 720 - i * 90;
            return (
              <g key={`${side}-${i}`}>
                <path d={`M ${cx - w / 2 - 30} -200 L ${cx + w / 2 + 30} -200 L ${cx + w / 2 + 30} 1560 L ${cx - w / 2 - 30} 1560 Z`} fill={i === 2 ? '#1a0f09' : '#24160d'} />
                <path d={ogive(cx, 1560, w, top)} fill={i === 0 ? '#6a4527' : '#4a2f1b'} opacity={0.95} />
                <path d={ogive(cx, 1560, w, top)} fill="none" stroke="#a87a3a" strokeWidth={3} opacity={0.5} />
              </g>
            );
          }),
        )}
      </Lapis>
      {/* Karpet saf */}
      <Lapis
        d={0.75}
        defs={
          <linearGradient id="karpet" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#7a2a24" />
            <stop offset={0.4} stopColor="#4e1714" />
            <stop offset={1} stopColor="#260a09" />
          </linearGradient>
        }
      >
        <rect x={-600} y={1520} width={W + 1200} height={1500} fill="url(#karpet)" />
        {Array.from({ length: 9 }, (_, i) => {
          const y = 1520 + Math.pow(i + 1, 1.55) * 26;
          return <rect key={i} x={-600} y={y} width={W + 1200} height={3 + i * 0.8} fill="#c99a3e" opacity={0.35} />;
        })}
        <ellipse cx={540} cy={1580} rx={360} ry={60} fill="#ffcf85" opacity={0.18} />
      </Lapis>
      <Lapis d={0.6} defs={<Glow id="lentera-glow" color="#ffcf7a" mid={0.25} />}>
        <Lentera x={180} y={420} s={0.9} seed={1} />
        <Lentera x={900} y={460} s={0.95} seed={2} />
        <Lentera x={540} y={300} s={0.75} seed={3} />
      </Lapis>
      {/* Berkas cahaya dari jendela tinggi kiri */}
      <Lapis d={0.4} blend="screen" defs={<BlurFilter id="mihrab-shaft" sd={26} />}>
        <polygon
          points="-120,80 60,40 980,1620 640,1660"
          fill="#ffd9a0"
          opacity={0.16 + 0.04 * Math.sin(t * 0.6)}
          filter="url(#mihrab-shaft)"
        />
      </Lapis>
      {dust > 0 ? <Dust count={46} seed={31} region={[-60, 60, 900, 1600]} skew={0.42} d={0.5} opacity={dust} /> : null}
      <Lapis d={1.3} blur={6}>
        <rect x={-140} y={-300} width={160} height={2600} fill="#0d0705" />
        <rect x={1060} y={-300} width={160} height={2600} fill="#0d0705" />
      </Lapis>
    </>
  );
};

/** Interior masjid siang: sinar matahari menembus jendela kisi, debu berkilau, jamaah duduk. */
export const JendelaSet: React.FC<{ dust?: number }> = ({ dust = 1 }) => {
  const { t } = useShot();
  const wins = [
    { cx: 200, w: 170 },
    { cx: 540, w: 190 },
    { cx: 880, w: 170 },
  ];
  const top = 280;
  const base = 860;
  // Arah sinar: dari kiri atas ke kanan bawah.
  const dx = 0.42;
  const L = 1150;
  const pulse = 0.9 + 0.1 * Math.sin(t * 0.5);
  return (
    <>
      <Lapis
        d={0.12}
        defs={
          <>
            <linearGradient id="jendela-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#1c120b" />
              <stop offset={0.5} stopColor="#35231596" />
              <stop offset={1} stopColor="#20140c" />
            </linearGradient>
            <linearGradient id="jendela-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#fffaf0" />
              <stop offset={1} stopColor="#ffe2a6" />
            </linearGradient>
            <Glow id="jendela-bloom" color="#ffe3a8" mid={0.3} />
            <BlurFilter id="jendela-soft" sd={3} />
          </>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="#2a1b11" />
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#jendela-wall)" />
        {wins.map((wn, i) => (
          <g key={i}>
            <ellipse cx={wn.cx} cy={(top + base) / 2} rx={wn.w * 1.3} ry={(base - top) * 0.75} fill="url(#jendela-bloom)" opacity={0.55 * pulse} />
            <path d={ogive(wn.cx, base, wn.w + 26, top - 18)} fill="#140c07" />
            <clipPath id={`jendela-clip-${i}`}>
              <path d={ogive(wn.cx, base, wn.w, top)} />
            </clipPath>
            <g clipPath={`url(#jendela-clip-${i})`}>
              <rect x={wn.cx - wn.w} y={top - 50} width={wn.w * 2} height={base - top + 100} fill="url(#jendela-sky)" />
              <g filter="url(#jendela-soft)">
                <StarLattice x={wn.cx - wn.w / 2} y={top} w={wn.w} h={base - top} cell={44} color="#2a1a10" width={4.5} />
              </g>
            </g>
          </g>
        ))}
        <rect x={-600} y={base + 4} width={W + 1200} height={30} fill="#3a2716" />
      </Lapis>
      {/* Berkas cahaya volumetrik */}
      <Lapis
        d={0.35}
        blend="screen"
        defs={
          <>
            <linearGradient id="shaft-g" x1="0" y1="0" x2={dx} y2="1">
              <stop offset={0} stopColor="#ffe8b8" stopOpacity={0.75} />
              <stop offset={0.6} stopColor="#ffd28a" stopOpacity={0.28} />
              <stop offset={1} stopColor="#ffc06a" stopOpacity={0.05} />
            </linearGradient>
            <BlurFilter id="shaft-b" sd={22} />
          </>
        }
      >
        <g filter="url(#shaft-b)">
          {wins.map((wn, i) => {
            const x0 = wn.cx - wn.w / 2;
            const x1 = wn.cx + wn.w / 2;
            const flick = 0.8 + 0.2 * Math.sin(t * 0.45 + i * 1.8);
            return (
              <polygon
                key={i}
                points={`${x0},${top + 60} ${x1},${top + 60} ${x1 + dx * L},${top + 60 + L} ${x0 + dx * L},${top + 60 + L}`}
                fill="url(#shaft-g)"
                opacity={0.62 * flick}
              />
            );
          })}
        </g>
      </Lapis>
      {/* Lantai + bercak cahaya + jamaah duduk */}
      <Lapis
        d={0.7}
        defs={
          <>
            <linearGradient id="lantai" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#5a1f1a" />
              <stop offset={1} stopColor="#1d0907" />
            </linearGradient>
            <BlurFilter id="patch-b" sd={10} />
          </>
        }
      >
        <rect x={-600} y={1440} width={W + 1200} height={1500} fill="url(#lantai)" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={-600} y={1440 + Math.pow(i + 1, 1.6) * 24} width={W + 1200} height={3} fill="#c99a3e" opacity={0.28} />
        ))}
        <g filter="url(#patch-b)" opacity={0.85}>
          {wins.map((wn, i) => (
            <path
              key={i}
              d={`M ${wn.cx - wn.w / 2 + dx * 1000} 1560 L ${wn.cx + wn.w / 2 + dx * 1000} 1560 L ${wn.cx + wn.w / 2 + dx * 1100 + 30} 1700 L ${wn.cx - wn.w / 2 + dx * 1100 + 30} 1700 Z`}
              fill="#ffd79a"
              opacity={0.55}
            />
          ))}
        </g>
        <Orang kind="pria" pose="sit" x={760} y={1660} s={1.35} dir={-1} color="#140a06" />
        <Orang kind="pria" pose="sit" x={300} y={1610} s={1.05} dir={-1} color="#1c0f09" />
      </Lapis>
      {dust > 0 ? (
        <>
          {wins.map((wn, i) => (
            <Dust key={i} count={34} seed={40 + i} region={[wn.cx - wn.w / 2, top + 60, wn.w, L]} skew={dx} d={0.4} size={0.9} opacity={dust} />
          ))}
        </>
      ) : null}
      <Lapis d={1.35} blur={7}>
        <rect x={-200} y={-300} width={190} height={2600} fill="#0b0604" />
        <rect x={1100} y={-300} width={190} height={2600} fill="#0b0604" />
      </Lapis>
      <Dust count={8} seed={rand(3, 3) > 0.5 ? 51 : 52} size={1.6} d={1.2} opacity={0.5 * dust} />
    </>
  );
};
