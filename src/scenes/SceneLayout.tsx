import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, BodyText, Heading, Pill } from '../components';
import { Reveal, useCamera } from '../motion';
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
  const { space, px } = useTheme();
  if (!title && !eyebrow && !subtitle) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: space.sm, maxWidth: px(1400) }}>
      {eyebrow ? (
        <Reveal delay={delay}>
          <Pill>{eyebrow}</Pill>
        </Reveal>
      ) : null}
      {title ? <Heading text={title} highlight={highlight} size={size} align={align} delay={delay + 0.1} /> : null}
      {subtitle ? (
        <Reveal delay={delay + 0.35}>
          <BodyText size="body" align={align}>
            {subtitle}
          </BodyText>
        </Reveal>
      ) : null}
    </div>
  );
};

/** Delay standar konten utama setelah judul. */
export const CONTENT_DELAY = 0.55;
