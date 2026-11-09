import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme } from '../themes';

/** Background gradien dengan "blob" warna brand yang bergerak sangat pelan. */
export const GradientBackground: React.FC<{ intensity?: number }> = ({ intensity }) => {
  const { theme } = useTheme();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = intensity ?? theme.background.intensity;
  const alpha = (theme.mode === 'dark' ? 0.55 : 0.35) * k;
  const size = Math.max(width, height) * 0.9;
  const blobs = [
    { color: theme.colors.primary, x: 0.2 + 0.06 * Math.sin(t * 0.4), y: 0.15 + 0.05 * Math.cos(t * 0.3) },
    { color: theme.colors.secondary, x: 0.85 + 0.05 * Math.cos(t * 0.35), y: 0.45 + 0.06 * Math.sin(t * 0.25) },
    { color: theme.colors.accent, x: 0.3 + 0.05 * Math.sin(t * 0.3 + 2), y: 0.95 + 0.04 * Math.cos(t * 0.4) },
  ];
  return (
    <AbsoluteFill style={{ background: theme.colors.background, overflow: 'hidden' }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            left: b.x * width - size / 2,
            top: b.y * height - size / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color} 0%, transparent 62%)`,
            opacity: alpha * (i === 2 ? 0.35 : 1),
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          background:
            theme.mode === 'dark'
              ? 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)'
              : 'radial-gradient(ellipse at center, transparent 55%, rgba(255,255,255,0.35) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
