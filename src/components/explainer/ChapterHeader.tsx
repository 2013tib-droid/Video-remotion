import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASINGS } from '../../config';
import { useTheme } from '../../themes';

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Header bab kiri atas: label mono kecil + judul tebal (kata `highlight`
 * berwarna primary, miring). `startFrame` = frame saat bab ini dimulai.
 */
export const ChapterHeader: React.FC<{
  label?: string;
  title: string;
  highlight?: string;
  startFrame: number;
  top: number;
}> = ({ label, title, highlight, startFrame, top }) => {
  const { theme, px, safe } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - startFrame) / fps;
  const p = interpolate(t, [0, 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.decelerate });
  const hl = new Set((highlight ?? '').split(/\s+/).map(norm).filter(Boolean));
  return (
    <div
      style={{
        position: 'absolute',
        top: px(top),
        left: safe.x,
        right: safe.x,
        opacity: p,
        transform: `translateY(${px(16 * (1 - p))}px)`,
      }}
    >
      {label ? (
        <div
          style={{
            fontFamily: theme.fonts.mono,
            fontWeight: 500,
            fontSize: px(26),
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: theme.colors.muted,
            marginBottom: px(10),
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: px(title.length > 26 ? 50 : 60),
          lineHeight: 1.12,
          letterSpacing: `${theme.headingTracking}em`,
          color: theme.colors.text,
        }}
      >
        {title.split(/\s+/).map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : null}
            {hl.has(norm(w)) ? <span style={{ color: theme.colors.primary, fontStyle: 'italic' }}>{w}</span> : w}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
