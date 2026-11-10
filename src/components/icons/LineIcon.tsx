import React, { useId } from 'react';
import { useIconDraw, useIconIdle, useRevealDelay } from '../../motion';
import { useTheme } from '../../themes';
import { LINE_ICONS, type LineIconName } from './library';

export interface LineIconProps {
  name: LineIconName;
  /** Ukuran px basis 1080. */
  size: number;
  /** Mulai digambar (detik). Default: delay `<Reveal>` pembungkus. */
  delay?: number;
  /** Warna garis; default gradien primary → secondary tema. */
  color?: string;
  style?: React.CSSProperties;
}

/** Ikon garis yang tergambar garis demi garis, lalu isian duotone + gerak idle khas. */
export const LineIcon: React.FC<LineIconProps> = ({ name, size, delay, color, style }) => {
  const { theme, px } = useTheme();
  const revealDelay = useRevealDelay();
  const start = delay ?? revealDelay;
  const def = LINE_ICONS[name];
  const parts = def.parts.map((p) => (typeof p === 'string' ? { d: p, fill: false } : p));
  const draw = useIconDraw(parts.length, start);
  const idle = useIconIdle(def.idle ?? 'tilt', draw.doneAt, name.length);
  const gid = `ig${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const s = px(size);
  const strokeColor = color ?? `url(#${gid})`;
  const fillColor = color ?? theme.colors.primary;
  return (
    <svg
      width={s}
      height={s}
      viewBox="-1 -1 26 26"
      fill="none"
      style={{
        display: 'block',
        overflow: 'visible',
        transform: [`scale(${draw.scale})`, idle].filter(Boolean).join(' '),
        transformOrigin: 'origin' in def ? def.origin : '50% 50%',
        ...style,
      }}
    >
      {color ? null : (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={theme.colors.primary} />
            <stop offset="1" stopColor={theme.colors.secondary} />
          </linearGradient>
        </defs>
      )}
      {parts.map((p, i) =>
        p.fill ? <path key={`f${i}`} d={p.d} fill={fillColor} fillOpacity={draw.fill(i)} stroke="none" /> : null,
      )}
      {parts.map((p, i) => {
        const prog = draw.stroke(i);
        return (
          <path
            key={i}
            d={p.d}
            pathLength={1}
            stroke={strokeColor}
            strokeWidth={size > 200 ? 1.6 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - prog}
            opacity={prog > 0.001 ? 1 : 0}
          />
        );
      })}
    </svg>
  );
};
