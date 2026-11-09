import React from 'react';
import { AbsoluteFill } from 'remotion';
import { type BackgroundKind, useTheme } from '../themes';
import { GradientBackground } from './GradientBackground';
import { ParticleBackground } from './ParticleBackground';
import { PatternBackground } from './PatternBackground';

/** Pilih background berdasarkan tema (atau override per scene). */
export const Background: React.FC<{ kind?: BackgroundKind }> = ({ kind }) => {
  const { theme } = useTheme();
  switch (kind ?? theme.background.kind) {
    case 'particles':
      return <ParticleBackground />;
    case 'pattern':
      return <PatternBackground />;
    case 'solid':
      return (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${theme.colors.backgroundAlt} 0%, ${theme.colors.background} 70%)`,
          }}
        />
      );
    default:
      return <GradientBackground />;
  }
};
