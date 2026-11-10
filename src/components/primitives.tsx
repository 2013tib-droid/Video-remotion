/**
 * Primitif dasar: Icon/aset, teks, permukaan (card), pill.
 * Semua komponen lain dibangun dari sini.
 */
import React from 'react';
import { Img } from 'remotion';
import { type TextAnimation, type TypeSize, LINE_HEIGHT } from '../config';
import { useIconIdle, useRevealDelay, useTextAnimation } from '../motion';
import { isImageSrc, isLottieSrc, resolveSrc } from './assets';
import { DrawSvg, LINE_ICONS, LineIcon, LottieIcon, isLineIconName, lineIconForEmoji } from './icons';
import { KineticText } from './KineticText';
import { useTheme } from '../themes';

export { isImageSrc, isLottieSrc, resolveSrc } from './assets';

export interface IconProps {
  /**
   * - emoji (`'🛒'`): emoji dikenal → ikon garis yang tergambar (tema `motion.icons: 'line'`, default);
   *   lainnya tetap emoji + gerak idle.
   * - `'line:cart'`: ikon garis dari pustaka (lihat `LINE_ICONS`).
   * - `'draw:brands/x/ikon.svg'`: file SVG yang tergambar garis demi garis.
   * - `'brands/x/anim.json'` / `'lottie:...'`: animasi Lottie.
   * - path/URL gambar lain: gambar biasa.
   */
  src: string;
  size: number;
  /** Mulai animasi (detik). Default: delay `<Reveal>` pembungkus. */
  delay?: number;
  /** Matikan animasi gambar/idle (tampil statis). */
  animate?: boolean;
  /** Warna ikon garis (mis. di atas latar gradien); default gradien tema. */
  color?: string;
  style?: React.CSSProperties;
}

/** Ikon: emoji, ikon garis beranimasi, SVG tergambar, Lottie, atau gambar. */
export const Icon: React.FC<IconProps> = ({ src, size, delay, animate = true, color, style }) => {
  const { theme, px } = useTheme();
  const s = px(size);
  if (src.startsWith('line:')) {
    const name = src.slice(5).trim();
    if (isLineIconName(name)) return <LineIcon name={name} size={size} delay={animate ? delay : -100} color={color} style={style} />;
    console.warn(`[Icon] ikon garis "${name}" tidak ada. Pilihan: ${Object.keys(LINE_ICONS).join(', ')}`);
  }
  if (src.startsWith('draw:')) return <DrawSvg src={src.slice(5).trim()} size={size} delay={animate ? delay : -100} style={style} />;
  if (isLottieSrc(src)) return <LottieIcon src={src.replace(/^lottie:/, '').trim()} size={size} delay={delay} style={style} />;
  if (isImageSrc(src)) {
    return <Img src={resolveSrc(src)} style={{ width: s, height: s, objectFit: 'contain', ...style }} />;
  }
  const mapped = (theme.motion.icons ?? 'line') === 'line' ? lineIconForEmoji(src) : undefined;
  if (mapped) return <LineIcon name={mapped} size={size} delay={animate ? delay : -100} color={color} style={style} />;
  return <EmojiIcon text={src} size={s} delay={delay} animate={animate} style={style} />;
};

/** Emoji/teks pendek: tetap diberi gerak idle halus agar tidak statis. */
const EmojiIcon: React.FC<{ text: string; size: number; delay?: number; animate: boolean; style?: React.CSSProperties }> = ({
  text,
  size,
  delay,
  animate,
  style,
}) => {
  const revealDelay = useRevealDelay();
  const idle = useIconIdle(animate ? 'tilt' : 'none', (delay ?? revealDelay) + 0.6, text.length);
  return (
    <span
      style={{
        width: size,
        height: size,
        fontSize: size * 0.78,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: idle,
        ...style,
      }}
    >
      {text}
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
  /** Kata/frasa sorotan: sapuan gradien + punch + coretan (lihat highlightStyle scene). */
  highlight?: string;
  align?: 'left' | 'center';
  /** Animasi kata demi kata. */
  animate?: boolean;
  delay?: number;
  color?: string;
  /** Gaya muncul kata; default scene.textAnimation → tema. */
  animation?: TextAnimation;
  /** Urutan kata sorotan pertama di antara judul lain dalam scene yang sama. */
  accentOffset?: number;
  style?: React.CSSProperties;
}

const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** Judul dengan tipografi kinetik (kata per kata) dan aksen kata sorotan. */
export const Heading: React.FC<HeadingProps> = ({
  text,
  size = 'h1',
  highlight,
  align = 'center',
  animate = true,
  delay = 0,
  color,
  animation,
  accentOffset,
  style,
}) => {
  const { theme, type } = useTheme();
  const anim = useTextAnimation(size, animation);
  const typo: React.CSSProperties = {
    fontFamily: theme.fonts.heading,
    fontWeight: theme.fontWeights.heading,
    fontSize: type[size],
    lineHeight: LINE_HEIGHT.heading,
    letterSpacing: `${theme.headingTracking}em`,
    textAlign: align,
    justifyContent: align === 'center' ? 'center' : 'flex-start',
    ...style,
  };
  if (animate) {
    return (
      <KineticText
        text={text}
        highlight={highlight}
        animation={anim}
        delay={delay}
        fontSize={type[size]}
        accentOffset={accentOffset}
        color={color ?? theme.colors.text}
        style={typo}
      />
    );
  }
  const hl = new Set((highlight ?? '').split(/\s+/).map(clean).filter(Boolean));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.26em', color: color ?? theme.colors.text, ...typo }}>
      {text
        .split(/\s+/)
        .filter(Boolean)
        .map((w, i) => (
          <span key={i}>{hl.has(clean(w)) ? <GradientText>{w}</GradientText> : w}</span>
        ))}
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
