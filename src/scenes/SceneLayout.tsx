import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, Heading, LineText, Pill, textRevealSpan, useTextLastStart } from '../components';
import { LINE_HEIGHT } from '../config';
import { Reveal, useCamera, useTextAnimation } from '../motion';
import { type BackgroundKind, useTheme } from '../themes';
import type { SceneHeading } from './types';

/** Kanvas standar scene: background tema + area aman + kolom konten terpusat. */
export const SceneLayout: React.FC<{
  children: React.ReactNode;
  background?: BackgroundKind;
  /** Arah utama konten. Default: column (portrait) / row bila `split`. */
  split?: boolean;
  style?: React.CSSProperties;
}> = ({ children, background, split, style }) => {
  const { safe, space, isPortrait } = useTheme();
  const row = split && !isPortrait;
  const camera = useCamera();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: camera.background }}>
        <Background kind={background} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: camera.content,
          padding: `${safe.top}px ${safe.x}px ${safe.bottom}px`,
          display: 'flex',
          flexDirection: row ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: row ? space.xl : space.lg,
          ...style,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Judul scene standar (eyebrow + title + subtitle). */
export const SceneTitle: React.FC<SceneHeading & { align?: 'left' | 'center'; delay?: number; size?: 'h1' | 'h2' }> = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
  delay = 0,
  size = 'h2',
}) => {
  const { theme, type, space, px } = useTheme();
  const anim = useTextAnimation(size);
  const lastWord = useTextLastStart(title ?? '', anim, delay + 0.1);
  if (!title && !eyebrow && !subtitle) return null;
  const subDelay = Math.max(
    delay + 0.1 + (title ? Math.min(0.9, Math.max(0.25, textRevealSpan(title, anim) * 0.7)) : 0.15),
    title ? lastWord + 0.25 : 0,
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: space.sm, maxWidth: px(1400) }}>
      {eyebrow ? (
        <Reveal delay={delay}>
          <Pill>{eyebrow}</Pill>
        </Reveal>
      ) : null}
      {title ? <Heading text={title} highlight={highlight} size={size} align={align} delay={delay + 0.1} /> : null}
      {subtitle ? (
        <LineText
          text={subtitle}
          delay={subDelay}
          fontFamily={theme.fonts.body}
          fontWeight={theme.fontWeights.body}
          fontSize={type.body}
          style={{ lineHeight: LINE_HEIGHT.body, color: theme.colors.muted, textAlign: align }}
        />
      ) : null}
    </div>
  );
};

/** Delay standar konten utama setelah judul. */
export const CONTENT_DELAY = 0.55;
