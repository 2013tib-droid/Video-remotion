/**
 * Primitif dasar: Icon/aset, teks, permukaan (card), pill.
 * Semua komponen lain dibangun dari sini.
 */
import React from 'react';
import { Img, staticFile } from 'remotion';
import { type TypeSize, LINE_HEIGHT } from '../config';
import { Reveal, useStagger } from '../motion';
import { useTheme } from '../themes';

/** True bila string adalah path/URL gambar (bukan emoji/teks). */
export function isImageSrc(src: string): boolean {
  return /^(https?:|data:)/.test(src) || /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(src);
}

/** Path relatif → file di folder public/. URL absolut dibiarkan. */
export function resolveSrc(src: string): string {
  return /^(https?:|data:)/.test(src) ? src : staticFile(src.replace(/^\/+/, ''));
}

/** Ikon: emoji/teks pendek ATAU gambar (path di public/ atau URL). */
export const Icon: React.FC<{ src: string; size: number; style?: React.CSSProperties }> = ({ src, size, style }) => {
  const { px } = useTheme();
  const s = px(size);
  if (isImageSrc(src)) {
    return <Img src={resolveSrc(src)} style={{ width: s, height: s, objectFit: 'contain', ...style }} />;
  }
  return (
    <span
      style={{
        width: s,
        height: s,
        fontSize: s * 0.78,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {src}
    </span>
  );
};

export const GradientText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { theme } = useTheme();
  return (
    <span
      style={{
        backgroundImage: theme.gradient,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export interface HeadingProps {
  text: string;
  size?: TypeSize;
  /** Kata/frasa yang diberi warna gradien. */
  highlight?: string;
  align?: 'left' | 'center';
  /** Animasi kata demi kata. */
  animate?: boolean;
  delay?: number;
  color?: string;
  style?: React.CSSProperties;
}

const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** Judul dengan reveal kata-per-kata dan highlight gradien opsional. */
export const Heading: React.FC<HeadingProps> = ({
  text,
  size = 'h1',
  highlight,
  align = 'center',
  animate = true,
  delay = 0,
  color,
  style,
}) => {
  const { theme, type } = useTheme();
  const stagger = useStagger('tight');
  const hl = new Set((highlight ?? '').split(/\s+/).map(clean).filter(Boolean));
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div
      style={{
        fontFamily: theme.fonts.heading,
        fontWeight: theme.fontWeights.heading,
        fontSize: type[size],
        lineHeight: LINE_HEIGHT.heading,
        letterSpacing: `${theme.headingTracking}em`,
        color: color ?? theme.colors.text,
        textAlign: align,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: '0.26em',
        ...style,
      }}
    >
      {words.map((w, i) => {
        const content = hl.has(clean(w)) ? <GradientText>{w}</GradientText> : w;
        return animate ? (
          <Reveal key={i} delay={stagger(i, delay)} style={{ display: 'inline-block' }}>
            {content}
          </Reveal>
        ) : (
          <span key={i}>{content}</span>
        );
      })}
    </div>
  );
};

export const BodyText: React.FC<{
  children: React.ReactNode;
  size?: TypeSize;
  align?: 'left' | 'center';
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 'body', align = 'center', color, weight, style }) => {
  const { theme, type } = useTheme();
  return (
    <div
      style={{
        fontFamily: theme.fonts.body,
        fontWeight: weight ?? theme.fontWeights.body,
        fontSize: type[size],
        lineHeight: LINE_HEIGHT.body,
        color: color ?? theme.colors.muted,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Permukaan kartu standar sesuai tema. */
export const Surface: React.FC<{
  children: React.ReactNode;
  padding?: number;
  radius?: 'sm' | 'md' | 'lg';
  elevated?: boolean;
  style?: React.CSSProperties;
}> = ({ children, padding = 40, radius = 'md', elevated, style }) => {
  const { theme, px } = useTheme();
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `${px(2)}px solid ${theme.colors.border}`,
        borderRadius: px(theme.radius[radius]),
        boxShadow: elevated ? theme.shadow.elevated : theme.shadow.card,
        padding: px(padding),
        backdropFilter: theme.mode === 'dark' ? 'blur(30px)' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Label kecil berbentuk pil (eyebrow, badge). */
export const Pill: React.FC<{ children: React.ReactNode; tone?: 'primary' | 'surface'; style?: React.CSSProperties }> = ({
  children,
  tone = 'surface',
  style,
}) => {
  const { theme, type, px } = useTheme();
  const isPrimary = tone === 'primary';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: px(12),
        padding: `${px(12)}px ${px(28)}px`,
        borderRadius: px(theme.radius.pill),
        background: isPrimary ? theme.colors.primary : theme.colors.surface,
        border: `${px(2)}px solid ${isPrimary ? 'transparent' : theme.colors.border}`,
        color: isPrimary ? theme.colors.onPrimary : theme.colors.text,
        fontFamily: theme.fonts.body,
        fontWeight: theme.fontWeights.strong,
        fontSize: type.label,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
