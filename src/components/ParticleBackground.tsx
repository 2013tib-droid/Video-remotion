import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme } from '../themes';
import { GradientBackground } from './GradientBackground';

/** Partikel deterministik (seed tetap) yang melayang naik. Cocok untuk tema playful. */
export const ParticleBackground: React.FC<{ count?: number; intensity?: number; seed?: string }> = ({
  count,
  intensity,
  seed = 'ms',
}) => {
  const { theme, px } = useTheme();
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const k = intensity ?? theme.background.intensity;
  const n = count ?? Math.round(36 * k);
  const palette = [theme.colors.primary, theme.colors.secondary, theme.colors.accent];
  const playful = theme.motion.spring === 'bouncy';
  return (
    <AbsoluteFill>
      <GradientBackground intensity={k * 0.7} />
      {Array.from({ length: n }).map((_, i) => {
        const r = (s: string) => random(`${seed}-${s}-${i}`);
        const size = px(8 + r('s') * (playful ? 34 : 14));
        const speed = 0.012 + r('v') * 0.03; // layar per detik
        const y = ((r('y') - (frame / fps) * speed) % 1 + 1) % 1;
        const x = r('x') + 0.02 * Math.sin(frame / fps + r('p') * 6);
        const twinkle = 0.45 + 0.4 * Math.sin(frame / fps * (1 + r('t')) + r('p') * 10);
        const shape = playful ? Math.floor(r('shape') * 3) : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x * width,
              top: y * (height + size * 2) - size,
              width: size,
              height: size,
              background: palette[i % palette.length],
              borderRadius: shape === 1 ? size * 0.25 : '50%',
              transform: `rotate(${(frame / fps) * 40 * (r('rot') - 0.5)}rad)`,
              opacity: twinkle * k * (shape === 2 ? 0.5 : 0.75),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
