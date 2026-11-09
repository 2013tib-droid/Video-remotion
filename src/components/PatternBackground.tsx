import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme } from '../themes';
import { GradientBackground } from './GradientBackground';

/** Pola geometris bintang-8 (khatam) halus yang bergeser pelan. */
export const PatternBackground: React.FC<{ intensity?: number }> = ({ intensity }) => {
  const { theme, px } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = intensity ?? theme.background.intensity;
  const cell = px(140);
  const offset = ((frame / fps) * px(10)) % cell;
  const c = cell / 2;
  const sq = cell * 0.3;
  return (
    <AbsoluteFill>
      <GradientBackground intensity={k * 0.8} />
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.22 * k }}>
        <defs>
          <pattern id="ms-star" width={cell} height={cell} patternUnits="userSpaceOnUse" x={offset} y={offset}>
            <g fill="none" stroke={theme.colors.accent} strokeWidth={px(2)}>
              <rect x={c - sq} y={c - sq} width={sq * 2} height={sq * 2} />
              <rect x={c - sq} y={c - sq} width={sq * 2} height={sq * 2} transform={`rotate(45 ${c} ${c})`} />
              <circle cx={c} cy={c} r={sq * 0.45} />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ms-star)" />
      </svg>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse at center, ${theme.colors.background}cc 25%, transparent 75%)` }}
      />
    </AbsoluteFill>
  );
};
