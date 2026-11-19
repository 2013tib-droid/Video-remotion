import React from 'react';
import { FONT_STACKS } from '../../config';
import { Sfx } from '../../motion';
import { LINE_ICONS, type IconPart } from '../icons/library';
import { Dust } from './atmos';
import { StarLattice } from './interior';
import { BlurFilter, Glow, H, Lapis, OUT, SMOOTH, W, clamp01, lerp, rand, ramp, useShot } from './util';

const GOLD_STOPS = (
  <>
    <stop offset={0} stopColor="#a87a1f" />
    <stop offset={0.4} stopColor="#f3d77f" />
    <stop offset={0.65} stopColor="#d4af37" />
    <stop offset={1} stopColor="#9a6e1a" />
  </>
);

/** Roset bintang 16 (garis emas) yang tergambar lalu berputar sangat pelan. */
function Roset({ cx, cy, r, p, rot, opacity = 1 }: { cx: number; cy: number; r: number; p: number; rot: number; opacity?: number }) {
  const n = 16;
  const pts = (rr: number, off: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((i + off) / n) * Math.PI * 2;
      return `${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`;
    });
  const star = (rr: number, step: number) => {
    const p0 = pts(rr, 0);
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(`M ${p0[i]} L ${p0[(i + step) % n]}`);
    return out.join(' ');
  };
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={opacity} fill="none" stroke="url(#gold-line)" strokeLinecap="round">
      <path d={star(r, 5)} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={star(r * 0.62, 3)} strokeWidth={1.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(p * 1.2 - 0.1)} />
      <circle cx={cx} cy={cy} r={r * 1.05} strokeWidth={1.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <circle cx={cx} cy={cy} r={r * 1.12} strokeWidth={0.8} opacity={0.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </g>
  );
}

/** Latar zamrud berpola geometris Islam + roset emas besar. */
export const PolaSet: React.FC = () => {
  const { t } = useShot();
  return (
    <>
      <Lapis
        d={0.1}
        defs={
          <>
            <radialGradient id="pola-bg" cx="50%" cy="45%" r="70%">
              <stop offset={0} stopColor="#1f6b34" />
              <stop offset={0.55} stopColor="#12401f" />
              <stop offset={1} stopColor="#06180c" />
            </radialGradient>
            <linearGradient id="gold-line" x1="0" y1="0" x2="1" y2="1">
              {GOLD_STOPS}
            </linearGradient>
          </>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#pola-bg)" />
        <g opacity={0.14 + 0.04 * Math.sin(t * 0.5)}>
          <StarLattice x={-300} y={-300} w={1700} h={2600} cell={120} color="#d4af37" width={1.4} />
        </g>
      </Lapis>
      <Lapis d={0.3}>
        <Roset cx={540} cy={1010} r={520} p={ramp(t, 0, 3.5)} rot={t * 1.2} opacity={0.32} />
      </Lapis>
      <Dust count={36} seed={111} d={0.6} opacity={0.75} />
    </>
  );
};

function IconPaths({ name, p, color }: { name: string; p: number; color: string }) {
  const def = (LINE_ICONS as Record<string, { parts: IconPart[] }>)[name.replace(/^line:/, '')] ?? LINE_ICONS.sparkles;
  return (
    <g fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {def.parts.map((part, i) => {
        const d = typeof part === 'string' ? part : part.d;
        const q = clamp01(p * def.parts.length - i * 0.6);
        return (
          <React.Fragment key={i}>
            {typeof part !== 'string' && part.fill ? <path d={d} fill={color} opacity={0.18 * q} stroke="none" /> : null}
            <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} />
          </React.Fragment>
        );
      })}
    </g>
  );
}

/**
 * Infografis alur: lingkaran emas bertumpuk vertikal, cincin tergambar melingkar saat
 * aktif, panah turun ke node berikutnya. Node terakhir memancarkan kilau berlipat.
 */
export const FlowDiagram: React.FC<{ items: { text: string; icon?: string; at: number }[]; exit: number }> = ({ items, exit }) => {
  const { t } = useShot();
  const n = items.length;
  const x = 300;
  const y0 = 650;
  const gap = n > 1 ? Math.min(215, 640 / (n - 1)) : 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 1 - exit }}>
      <defs>
        <linearGradient id="flow-gold" x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS}
        </linearGradient>
        <Glow id="flow-glow" color="#f3d77f" mid={0.3} />
        <BlurFilter id="flow-blur" sd={6} />
      </defs>
      {items.map((it, i) => {
        const cy = y0 + i * gap;
        const p = ramp(t, it.at, it.at + 1.1, OUT);
        const ring = ramp(t, it.at, it.at + 1.4, SMOOTH);
        const active = items[i + 1] ? t < items[i + 1].at + 0.6 : true;
        const pulse = active && p >= 1 ? 0.5 + 0.5 * Math.sin((t - it.at) * 3) : 0;
        const last = i === n - 1;
        const nextAt = items[i + 1]?.at ?? Infinity;
        const arrow = ramp(t, nextAt - 0.9, nextAt - 0.05);
        return (
          <g key={i}>
            {i < n - 1 ? (
              <g opacity={arrow > 0 ? 1 : 0}>
                <line x1={x} y1={cy + 92} x2={x} y2={cy + 92 + (gap - 184) * arrow} stroke="url(#flow-gold)" strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" />
                {arrow >= 1 ? <path d={`M ${x - 12} ${cy + gap - 104} L ${x} ${cy + gap - 92} L ${x + 12} ${cy + gap - 104}`} stroke="#e7c766" strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
              </g>
            ) : null}
            <g opacity={p} transform={`translate(${x} ${cy}) scale(${lerp(0.7, 1, p)})`}>
              <circle r={150} fill="url(#flow-glow)" opacity={0.35 + pulse * 0.35} />
              <circle r={78} fill="#0d3519" stroke="#d4af37" strokeOpacity={0.35} strokeWidth={2} />
              <circle r={88} fill="none" stroke="url(#flow-gold)" strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90)" />
              <g transform="translate(-36 -36) scale(3)">
                <IconPaths name={it.icon ?? 'sparkles'} p={ramp(t, it.at + 0.2, it.at + 1.3)} color="#f3d77f" />
              </g>
            </g>
            {last && p > 0
              ? Array.from({ length: 14 }, (_, k) => {
                  const q = ((t - it.at) * 0.55 + k / 14) % 1;
                  const a = (k / 14) * Math.PI * 2 + k;
                  const rr = 100 + q * 190;
                  return (
                    <path
                      key={k}
                      transform={`translate(${x + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}) scale(${0.6 + rand(k, 3)})`}
                      d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z"
                      fill="#f3d77f"
                      opacity={Math.sin(q * Math.PI) * p}
                    />
                  );
                })
              : null}
            <text
              x={x + 140}
              y={cy + 18}
              fontFamily={FONT_STACKS.cormorant}
              fontWeight={700}
              fontSize={last ? 72 : 66}
              fill={last ? 'url(#flow-gold)' : '#F8F6F2'}
              opacity={ramp(t, it.at + 0.15, it.at + 1)}
              transform={`translate(${(1 - ramp(t, it.at + 0.15, it.at + 1)) * -24} 0)`}
              style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))' }}
            >
              {it.text}
            </text>
            <Sfx name="pop" at={it.at + 0.05} seed={i} volume={0.7} />
          </g>
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Ponsel donasi                                                      */
/* ------------------------------------------------------------------ */

/** Latar hangat berbokeh untuk ponsel. */
export const PonselSet: React.FC = () => {
  const { t } = useShot();
  return (
    <>
      <Lapis
        d={0.1}
        defs={
          <radialGradient id="ponsel-bg" cx="50%" cy="40%" r="75%">
            <stop offset={0} stopColor="#6a4428" />
            <stop offset={0.55} stopColor="#2e1c10" />
            <stop offset={1} stopColor="#120a05" />
          </radialGradient>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#ponsel-bg)" />
        <g opacity={0.08}>
          <StarLattice x={-300} y={-300} w={1700} h={2600} cell={140} color="#d4af37" width={1.4} />
        </g>
      </Lapis>
      <Lapis d={0.25} blur={10}>
        {Array.from({ length: 16 }, (_, i) => (
          <circle
            key={i}
            cx={-80 + rand(i, 121) * 1240 + Math.sin(t * 0.25 + i) * 14}
            cy={-50 + rand(i, 122) * 2000}
            r={30 + rand(i, 123) * 80}
            fill={i % 3 ? '#ffcf86' : '#fff1cf'}
            opacity={0.1 + rand(i, 124) * 0.2}
          />
        ))}
      </Lapis>
      <Dust count={26} seed={125} d={0.8} opacity={0.6} />
    </>
  );
};

/** Pola QR bergaya (deterministik) dengan tiga penanda sudut; modul muncul dari tengah. */
function QrPattern({ x, y, size, p }: { x: number; y: number; size: number; p: number }) {
  const n = 25;
  const m = size / n;
  const finder = (i: number, j: number) => (i < 8 && j < 8) || (i >= n - 8 && j < 8) || (i < 8 && j >= n - 8);
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if (finder(i, j) || rand(i * 31 + j, 7) < 0.48) continue;
      const dist = Math.hypot(i - n / 2, j - n / 2) / (n * 0.71);
      const q = clamp01(p * 1.6 - dist);
      if (q <= 0) continue;
      cells.push(<rect key={`${i}-${j}`} x={x + i * m + (m * (1 - q)) / 2} y={y + j * m + (m * (1 - q)) / 2} width={m * q * 0.92} height={m * q * 0.92} rx={m * 0.18} fill="#14231a" />);
    }
  const f = clamp01(p * 2);
  const Finder = ({ fx, fy }: { fx: number; fy: number }) => (
    <g opacity={f}>
      <rect x={fx} y={fy} width={m * 7} height={m * 7} rx={m * 1.6} fill="#14231a" />
      <rect x={fx + m} y={fy + m} width={m * 5} height={m * 5} rx={m * 1.1} fill="#ffffff" />
      <rect x={fx + m * 2} y={fy + m * 2} width={m * 3} height={m * 3} rx={m * 0.7} fill="#1B5E20" />
    </g>
  );
  return (
    <g>
      {cells}
      <Finder fx={x} fy={y} />
      <Finder fx={x + (n - 7) * m} fy={y} />
      <Finder fx={x} fy={y + (n - 7) * m} />
    </g>
  );
}

/**
 * Ponsel premium: alamat situs diketik, QR tersusun, bingkai pemindai mengunci +
 * garis laser + bip, lalu layar berhasil (centang tergambar, cincin memancar).
 */
export const PhoneDonasi: React.FC<{
  url: string;
  title?: string;
  amount?: string;
  success?: string;
  qrAt: number;
  scanAt: number;
  successAt: number;
  exit: number;
}> = ({ url, title = 'Sedekah Jumat', amount = 'Rp1.000', success = 'Sedekah terkirim', qrAt, scanAt, successAt, exit }) => {
  const { t } = useShot();
  const enter = ramp(t, 0, 1.4, OUT);
  const typed = Math.round(url.length * ramp(t, 0.5, 0.5 + url.length * 0.06, (n) => n));
  const page = ramp(t, qrAt - 0.6, qrAt);
  const qr = ramp(t, qrAt, qrAt + 1.4);
  const scan = ramp(t, scanAt, scanAt + 0.6, OUT);
  const laser = scanAt <= t && t < successAt ? ((t - scanAt) / 0.9) % 1 : -1;
  const ok = ramp(t, successAt, successAt + 0.7, OUT);
  const check = ramp(t, successAt + 0.25, successAt + 0.9);
  const burst = ramp(t, successAt + 0.2, successAt + 1.6);
  // Ponsel: lebar 560, tinggi 1140, pusat (540, 1010) di kanvas.
  const pw = 560;
  const ph = 1140;
  const px0 = 540 - pw / 2;
  const py0 = 1010 - ph / 2;
  const sx0 = px0 + 22;
  const sy0 = py0 + 22;
  const sw = pw - 44;
  const sh = ph - 44;
  const float = Math.sin(t * 0.9) * 8;
  const tilt = lerp(-9, 0, enter) + Math.sin(t * 0.5) * 1.2;
  const qrSize = 330;
  const qrX = 540 - qrSize / 2;
  const qrY = sy0 + 400;
  return (
    <AbsoluteSvg opacity={(1 - exit) * clamp01(enter * 1.5)}>
      <defs>
        <linearGradient id="hp-frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset={0} stopColor="#8a8580" />
          <stop offset={0.3} stopColor="#3a3734" />
          <stop offset={0.7} stopColor="#2a2724" />
          <stop offset={1} stopColor="#76716b" />
        </linearGradient>
        <linearGradient id="hp-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset={0} stopColor="#fbf8f2" />
          <stop offset={1} stopColor="#f1ece1" />
        </linearGradient>
        <linearGradient id="hp-glare" x1="0" y1="0" x2="1" y2="1">
          <stop offset={0} stopColor="#ffffff" stopOpacity={0} />
          <stop offset={0.45} stopColor="#ffffff" stopOpacity={0.0} />
          <stop offset={0.5} stopColor="#ffffff" stopOpacity={0.16} />
          <stop offset={0.58} stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="hp-laser" x1="0" y1="0" x2="1" y2="0">
          <stop offset={0} stopColor="#3ad08a" stopOpacity={0} />
          <stop offset={0.5} stopColor="#7cf0b4" stopOpacity={1} />
          <stop offset={1} stopColor="#3ad08a" stopOpacity={0} />
        </linearGradient>
        <BlurFilter id="hp-shadow" sd={30} />
        <BlurFilter id="hp-laser-b" sd={8} />
        <clipPath id="hp-clip">
          <rect x={sx0} y={sy0} width={sw} height={sh} rx={58} />
        </clipPath>
      </defs>
      <g transform={`translate(0 ${lerp(160, 0, enter) + float - 80}) rotate(${tilt} 540 1010) translate(540 1010) scale(0.86) translate(-540 -1010)`}>
        <ellipse cx={540} cy={py0 + ph + 40} rx={300} ry={40} fill="#000" opacity={0.55} filter="url(#hp-shadow)" />
        <rect x={px0} y={py0} width={pw} height={ph} rx={80} fill="url(#hp-frame)" />
        <rect x={px0 + 6} y={py0 + 6} width={pw - 12} height={ph - 12} rx={75} fill="#0b0b0c" />
        <rect x={px0 + pw - 2} y={py0 + 240} width={6} height={120} rx={3} fill="#5b5752" />
        <rect x={px0 - 4} y={py0 + 200} width={6} height={70} rx={3} fill="#5b5752" />
        <rect x={px0 - 4} y={py0 + 290} width={6} height={110} rx={3} fill="#5b5752" />
        <g clipPath="url(#hp-clip)">
          <rect x={sx0} y={sy0} width={sw} height={sh} fill="url(#hp-screen)" />
          {/* Bilah status */}
          <text x={sx0 + 50} y={sy0 + 56} fontFamily={FONT_STACKS.jakarta} fontWeight={700} fontSize={24} fill="#1d1d1d">
            06:45
          </text>
          <rect x={sx0 + sw - 96} y={sy0 + 38} width={44} height={20} rx={5} fill="none" stroke="#1d1d1d" strokeWidth={2} />
          <rect x={sx0 + sw - 93} y={sy0 + 41} width={32} height={14} rx={3} fill="#1d1d1d" />
          {/* Bilah alamat */}
          <rect x={sx0 + 30} y={sy0 + 92} width={sw - 60} height={64} rx={32} fill="#ece6da" />
          <path d={`M ${sx0 + 62} ${sy0 + 126} v -8 a 9 9 0 0 1 18 0 v 8`} stroke="#1B5E20" strokeWidth={3} fill="none" />
          <rect x={sx0 + 58} y={sy0 + 124} width={26} height={20} rx={4} fill="#1B5E20" />
          <text x={sx0 + 100} y={sy0 + 134} fontFamily={FONT_STACKS.jakarta} fontWeight={600} fontSize={28} fill="#2C2C2C">
            {url.slice(0, typed)}
            {typed < url.length && Math.floor(t * 2) % 2 === 0 ? '|' : ''}
          </text>
          {/* Halaman */}
          <g opacity={page * (1 - ok)} transform={`translate(0 ${(1 - page) * 30})`}>
            <rect x={sx0 + 30} y={sy0 + 190} width={sw - 60} height={140} rx={28} fill="#1B5E20" />
            <text x={540} y={sy0 + 250} textAnchor="middle" fontFamily={FONT_STACKS.cormorant} fontWeight={700} fontSize={44} fill="#F8F6F2">
              {title}
            </text>
            <text x={540} y={sy0 + 296} textAnchor="middle" fontFamily={FONT_STACKS.jakarta} fontWeight={500} fontSize={22} fill="#e7d9a6">
              Masjid terdekatmu · QRIS resmi
            </text>
            <rect x={qrX - 26} y={qrY - 26} width={qrSize + 52} height={qrSize + 52} rx={30} fill="#ffffff" stroke="#e6dcc6" strokeWidth={2} />
            <QrPattern x={qrX} y={qrY} size={qrSize} p={qr} />
            <rect x={540 - 34} y={qrY + qrSize / 2 - 34} width={68} height={68} rx={16} fill="#ffffff" opacity={qr} />
            <path d={`M 540 ${qrY + qrSize / 2 + 18} s -22 -13 -22 -27 a 11 11 0 0 1 22 -3 a 11 11 0 0 1 22 3 c 0 14 -22 27 -22 27 z`} fill="#D4AF37" opacity={qr} />
            <text x={540} y={qrY + qrSize + 86} textAnchor="middle" fontFamily={FONT_STACKS.jakarta} fontWeight={600} fontSize={26} fill="#5a5148">
              Nominal bebas · mulai {amount}
            </text>
            <rect x={sx0 + 60} y={qrY + qrSize + 120} width={sw - 120} height={70} rx={35} fill="#D4AF37" opacity={0.9} />
            <text x={540} y={qrY + qrSize + 165} textAnchor="middle" fontFamily={FONT_STACKS.jakarta} fontWeight={700} fontSize={26} fill="#2C2C2C">
              Pindai dengan e-wallet apa pun
            </text>
          </g>
          {/* Layar berhasil */}
          <g opacity={ok}>
            <rect x={sx0} y={sy0 + 170} width={sw} height={sh - 170} fill="#F8F6F2" />
            {Array.from({ length: 3 }, (_, k) => {
              const q = clamp01(burst * 1.3 - k * 0.2);
              return <circle key={k} cx={540} cy={sy0 + 470} r={90 + q * 170} fill="none" stroke="#1B5E20" strokeWidth={3} opacity={(1 - q) * 0.5} />;
            })}
            <circle cx={540} cy={sy0 + 470} r={92 * lerp(0.6, 1, ok)} fill="#1B5E20" />
            <path d={`M 498 ${sy0 + 472} L 528 ${sy0 + 502} L 586 ${sy0 + 440}`} stroke="#F8F6F2" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
            <text x={540} y={sy0 + 650} textAnchor="middle" fontFamily={FONT_STACKS.cormorant} fontWeight={700} fontSize={52} fill="#1B5E20">
              {success}
            </text>
            <text x={540} y={sy0 + 730} textAnchor="middle" fontFamily={FONT_STACKS.jakarta} fontWeight={800} fontSize={60} fill="#2C2C2C">
              {amount}
            </text>
            <text x={540} y={sy0 + 800} textAnchor="middle" fontFamily={FONT_STACKS.cormorant} fontStyle="italic" fontWeight={600} fontSize={36} fill="#8a6a1f">
              Jazakallahu khairan
            </text>
            {Array.from({ length: 18 }, (_, k) => {
              const a = (k / 18) * Math.PI * 2;
              const q = burst;
              return (
                <circle key={k} cx={540 + Math.cos(a) * (110 + q * 200)} cy={sy0 + 470 + Math.sin(a) * (110 + q * 200) + q * q * 60} r={5 * (1 - q) + 1} fill={k % 2 ? '#D4AF37' : '#1B5E20'} opacity={(1 - q) * 0.9} />
              );
            })}
          </g>
          <rect x={sx0} y={sy0} width={sw} height={sh} fill="url(#hp-glare)" />
        </g>
        <rect x={540 - 70} y={sy0 + 14} width={140} height={38} rx={19} fill="#050505" />
        {/* Bingkai pemindai + laser */}
        {scan > 0 && ok < 1 ? (
          <g opacity={scan * (1 - ok)}>
            {[
              [qrX - 40, qrY - 40, 1, 1],
              [qrX + qrSize + 40, qrY - 40, -1, 1],
              [qrX - 40, qrY + qrSize + 40, 1, -1],
              [qrX + qrSize + 40, qrY + qrSize + 40, -1, -1],
            ].map(([cx, cy, dx, dy], i) => {
              const s = lerp(1.35, 1, scan);
              const ox = 540 + (cx - 540) * s;
              const oy = qrY + qrSize / 2 + (cy - (qrY + qrSize / 2)) * s;
              return <path key={i} d={`M ${ox} ${oy + dy * 64} L ${ox} ${oy} L ${ox + dx * 64} ${oy}`} stroke="#3ad08a" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
            })}
            {laser >= 0 ? (
              <g transform={`translate(0 ${qrY - 20 + Math.sin(laser * Math.PI) * (qrSize + 40)})`}>
                <rect x={qrX - 30} y={-10} width={qrSize + 60} height={20} fill="url(#hp-laser)" filter="url(#hp-laser-b)" />
                <rect x={qrX - 30} y={-2} width={qrSize + 60} height={4} fill="url(#hp-laser)" />
              </g>
            ) : null}
          </g>
        ) : null}
      </g>
      <Sfx name="beep" at={successAt - 0.15} volume={0.9} category="elements" />
      <Sfx name="ting" at={successAt + 0.3} volume={0.8} category="elements" />
    </AbsoluteSvg>
  );
};

function AbsoluteSvg({ children, opacity }: { children: React.ReactNode; opacity: number }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}>
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Kartu akhir                                                        */
/* ------------------------------------------------------------------ */

/** Ranting daun emas kecil (pengganti emoji 🌿). */
export const Ranting: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#b8892a" fill="none" strokeWidth={2.4} strokeLinecap="round">
    <path d="M 0 40 Q 0 0 0 -50" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    {[-30, -8, 14].map((yy, i) =>
      [-1, 1].map((side) => {
        const q = clamp01(p * 2 - 0.4 - i * 0.2);
        return (
          <path
            key={`${i}${side}`}
            d={`M 0 ${yy + 10} q ${side * 26} -6 ${side * 34} -30 q ${side * -22} 4 ${side * -34} 30 z`}
            fill="#d4af37"
            fillOpacity={0.25 * q}
            opacity={q}
          />
        );
      }),
    )}
    <path d="M 0 -50 q 10 -16 0 -30 q -10 14 0 30 z" fill="#d4af37" fillOpacity={0.3} opacity={clamp01(p * 2 - 1)} />
  </g>
);

/** Kertas putih hangat, kisi geometris samar, bingkai emas tipis. */
export const KartuSet: React.FC = () => {
  const { t } = useShot();
  const frame = ramp(t, 0.1, 1.8);
  return (
    <>
      <Lapis
        d={0.1}
        defs={
          <radialGradient id="kartu-bg" cx="50%" cy="45%" r="75%">
            <stop offset={0} stopColor="#fffdf8" />
            <stop offset={0.6} stopColor="#F8F6F2" />
            <stop offset={1} stopColor="#F5E9D3" />
          </radialGradient>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#kartu-bg)" />
        <g opacity={0.12}>
          <StarLattice x={-300} y={-300} w={1700} h={2600} cell={130} color="#b8892a" width={1.2} />
        </g>
      </Lapis>
      <Lapis d={0.05}>
        <rect x={70} y={150} width={940} height={1620} rx={8} fill="none" stroke="#c9a23a" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frame} opacity={0.75} />
        <rect x={88} y={168} width={904} height={1584} rx={6} fill="none" stroke="#c9a23a" strokeWidth={1} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frame} opacity={0.45} />
        <Ranting x={540} y={560} p={ramp(t, 0.2, 1.8)} s={1.3} />
      </Lapis>
      <Dust count={22} seed={131} color="#d4af37" d={0.5} opacity={0.35} size={0.8} />
    </>
  );
};

