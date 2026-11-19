import React from 'react';
import { FONT_STACKS } from '../../config';
import { useTheme } from '../../themes';
import { OUT, SMOOTH, clamp01, ramp } from './util';

/**
 * Tipografi sinematik: serif display (Cormorant) yang muncul per kata dari kabur,
 * kata emas bergradien, ornamen bintang delapan, kaligrafi Arab (Amiri) yang
 * tersingkap kanan → kiri, terjemahan, dan label sumber.
 */

export const GOLD = 'linear-gradient(100deg, #b8892a 0%, #f3d77f 38%, #d4af37 62%, #a87a1f 100%)';
export const EMERALD = '#1B5E20';
export const WARM_WHITE = '#F8F6F2';
export const CHARCOAL = '#2C2C2C';

export type Tone = 'light' | 'dark';

const goldText: React.CSSProperties = {
  backgroundImage: GOLD,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

/** Bintang delapan (rub el hizb) kecil di antara dua garis emas. */
export const Ornament: React.FC<{ p: number; width?: number; color?: string }> = ({ p, width = 360, color = '#d4af37' }) => {
  const { px } = useTheme();
  const line = clamp01(p * 1.4 - 0.2);
  const star = OUT(clamp01(p * 1.6));
  return (
    <svg width={px(width)} height={px(36)} viewBox={`0 0 ${width} 36`} style={{ overflow: 'visible', display: 'block' }}>
      <line x1={width / 2 - 26} y1={18} x2={width / 2 - 26 - (width / 2 - 40) * line} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <line x1={width / 2 + 26} y1={18} x2={width / 2 + 26 + (width / 2 - 40) * line} y2={18} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <g transform={`translate(${width / 2} 18) rotate(${(1 - star) * -90}) scale(${star})`} fill="none" stroke={color} strokeWidth={1.8}>
        <rect x={-10} y={-10} width={20} height={20} />
        <rect x={-10} y={-10} width={20} height={20} transform="rotate(45)" />
        <circle r={3} fill={color} />
      </g>
    </svg>
  );
};

/** Satu baris teks: kata muncul bergiliran dari kabur + naik halus; `highlight` berwarna emas. */
export const CineLine: React.FC<{
  text: string;
  highlight?: string;
  t: number;
  at: number;
  size: 'title' | 'body' | 'label';
  tone: Tone;
  align?: 'center' | 'left';
  exit?: number;
}> = ({ text, highlight, t, at, size, tone, align = 'center', exit = 0 }) => {
  const { px } = useTheme();
  const words = text.split(/\s+/);
  const hl = highlight ? highlight.split(/\s+/) : [];
  let hlStart = -1;
  if (hl.length) {
    for (let i = 0; i + hl.length <= words.length; i++) {
      if (hl.every((w, j) => words[i + j] === w)) {
        hlStart = i;
        break;
      }
    }
  }
  const color = tone === 'light' ? WARM_WHITE : EMERALD;
  const shadow =
    tone === 'light'
      ? '0 2px 18px rgba(20,8,0,0.55), 0 0 42px rgba(20,8,0,0.35)'
      : '0 0 24px rgba(255,250,240,0.9), 0 0 6px rgba(255,250,240,0.8)';
  const style: React.CSSProperties =
    size === 'label'
      ? { fontFamily: FONT_STACKS.jakarta, fontWeight: 600, fontSize: px(30), letterSpacing: '0.32em', textTransform: 'uppercase' }
      : size === 'body'
        ? { fontFamily: FONT_STACKS.cormorant, fontWeight: 600, fontStyle: 'italic', fontSize: px(64), lineHeight: 1.12 }
        : { fontFamily: FONT_STACKS.cormorant, fontWeight: 700, fontSize: px(104), lineHeight: 1.02, letterSpacing: '-0.005em' };
  const step = size === 'label' ? 0.06 : 0.16;
  return (
    <div style={{ ...style, color, textAlign: align, maxWidth: px(940), textWrap: 'balance' } as React.CSSProperties}>
      {words.map((w, i) => {
        const p = ramp(t, at + i * step, at + i * step + 1.1, SMOOTH);
        const gold = hlStart >= 0 && i >= hlStart && i < hlStart + hl.length;
        const e = exit;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: 'inline-block',
                opacity: p * (1 - e),
                transform: `translateY(${(1 - p) * px(18) - e * px(14)}px)`,
                letterSpacing: size === 'title' ? `${(1 - p) * 0.08}em` : undefined,
                ...(gold
                  ? { ...goldText, filter: `blur(${(1 - p) * px(14) + e * px(10)}px) drop-shadow(0 2px 12px rgba(30,12,0,${tone === 'light' ? 0.55 : 0.15}))` }
                  : { textShadow: shadow, filter: `blur(${(1 - p) * px(14) + e * px(10)}px)` }),
                paddingBottom: px(6),
              }}
            >
              {w}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * Kaligrafi Arab: tersingkap kanan → kiri dengan tepi lembut + kilau emas,
 * lalu terjemahan (serif miring) dan sumber (label kecil).
 */
export const ArabicReveal: React.FC<{
  text: string;
  translation?: string;
  source?: string;
  t: number;
  at: number;
  translationAt: number;
  tone: Tone;
  exit?: number;
  size?: number;
}> = ({ text, translation, source, t, at, translationAt, tone, exit = 0, size }) => {
  const { px } = useTheme();
  const reveal = ramp(t, at, at + Math.max(1.6, text.length * 0.045), SMOOTH);
  const tr = ramp(t, translationAt, translationAt + 1.2, SMOOTH);
  const src = ramp(t, translationAt + 0.8, translationAt + 1.8, SMOOTH);
  const shimmer = ((t - at) * 0.35) % 1.6;
  const longest = Math.max(...text.split('\n').map((l) => l.replace(/[\u064B-\u0652\u0670\s]/g, '').length));
  const fontSize = px(size ?? (longest > 26 ? 70 : longest > 18 ? 84 : 104));
  // Topeng: kanan terlihat lebih dulu; tepi lembut 18 %.
  const edge = (1 - reveal) * 118 - 18;
  const mask = `linear-gradient(270deg, #000 ${Math.max(0, 100 - edge - 18)}%, transparent ${Math.max(0, 100 - edge)}%)`;
  const color = tone === 'light' ? WARM_WHITE : CHARCOAL;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(30), opacity: 1 - exit, filter: `blur(${exit * px(8)}px)` }}>
      <div
        dir="rtl"
        style={{
          fontFamily: FONT_STACKS.amiri,
          fontWeight: 700,
          fontSize,
          lineHeight: 1.75,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          maxWidth: px(960),
          WebkitMaskImage: mask,
          maskImage: mask,
          position: 'relative',
        }}
      >
        <span
          style={{
            backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${(shimmer - 0.3) * 100}%, rgba(255,250,225,0.95) ${shimmer * 100}%, rgba(255,255,255,0) ${(shimmer + 0.3) * 100}%), ${GOLD}`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 3px 16px rgba(30,12,0,${tone === 'light' ? 0.6 : 0.25}))`,
          }}
        >
          {text}
        </span>
      </div>
      {translation ? (
        <div
          style={{
            fontFamily: FONT_STACKS.cormorant,
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: px(translation.length > 70 ? 54 : 62),
            lineHeight: 1.2,
            color,
            textAlign: 'center',
            maxWidth: px(900),
            opacity: tr,
            filter: `blur(${(1 - tr) * px(10)}px)`,
            transform: `translateY(${(1 - tr) * px(16)}px)`,
            textShadow: tone === 'light' ? '0 2px 6px rgba(20,8,0,0.8), 0 0 30px rgba(20,8,0,0.6)' : '0 0 20px rgba(255,250,240,0.9)',
          }}
        >
          “{translation}”
        </div>
      ) : null}
      {source ? (
        <div
          style={{
            fontFamily: FONT_STACKS.jakarta,
            fontWeight: 600,
            fontSize: px(28),
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: src,
            ...goldText,
            filter: `drop-shadow(0 2px 8px rgba(20,8,0,${tone === 'light' ? 0.7 : 0.1}))`,
          }}
        >
          {source}
        </div>
      ) : null}
    </div>
  );
};

/** Label dokumenter kecil (montase): garis emas + teks kapital. */
export const ShotCaption: React.FC<{ text: string; p: number; tone: Tone }> = ({ text, p, tone }) => {
  const { px } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: px(18), opacity: p, transform: `translateX(${(1 - p) * px(-20)}px)` }}>
      <div style={{ width: px(56) * p, height: px(2), background: '#d4af37' }} />
      <div
        style={{
          fontFamily: FONT_STACKS.jakarta,
          fontWeight: 600,
          fontSize: px(30),
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: tone === 'light' ? WARM_WHITE : EMERALD,
          textShadow: tone === 'light' ? '0 2px 14px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        {text}
      </div>
    </div>
  );
};
