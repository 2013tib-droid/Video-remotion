import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Reveal, useFloat, useSpring } from '../motion';
import { useTheme } from '../themes';
import { Icon } from './primitives';

export interface MascotProps {
  /** Emoji atau path gambar karakter. */
  src: string;
  /** Teks balon ucapan. */
  speech?: string;
  size?: number;
  delay?: number;
}

/** Karakter maskot: lompat masuk, bergoyang, lalu balon ucapan muncul. */
export const Mascot: React.FC<MascotProps> = ({ src, speech, size = 420, delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jump = useSpring({ delay, spring: 'bouncy' });
  const bob = useFloat(14, 1.6);
  const wave = Math.sin((frame / fps) * 5) * 6 * Math.min(1, jump);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(24) }}>
      {speech ? (
        <Reveal delay={delay + 0.6} preset="pop" spring="bouncy">
          <div
            style={{
              position: 'relative',
              maxWidth: px(820),
              padding: `${px(30)}px ${px(44)}px`,
              borderRadius: px(theme.radius.lg),
              background: theme.colors.surface,
              border: `${px(4)}px solid ${theme.colors.primary}`,
              boxShadow: theme.shadow.card,
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.strong,
              fontSize: type.subtitle,
              color: theme.colors.text,
              textAlign: 'center',
            }}
          >
            {speech}
            <div
              style={{
                position: 'absolute',
                bottom: -px(22),
                left: '50%',
                marginLeft: -px(20),
                width: px(40),
                height: px(40),
                background: theme.colors.surface,
                borderRight: `${px(4)}px solid ${theme.colors.primary}`,
                borderBottom: `${px(4)}px solid ${theme.colors.primary}`,
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        </Reveal>
      ) : null}
      <div
        style={{
          transform: `translateY(${interpolate(jump, [0, 1], [px(600), 0]) + bob}px) rotate(${wave}deg) scale(${interpolate(jump, [0, 1], [0.6, 1])})`,
          filter: `drop-shadow(0 ${px(30)}px ${px(30)}px rgba(0,0,0,0.18))`,
        }}
      >
        <Icon src={src} size={size} delay={delay + 0.2} />
      </div>
    </div>
  );
};
