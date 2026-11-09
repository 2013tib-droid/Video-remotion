import React from 'react';
import { interpolate } from 'remotion';
import { Reveal, useSpring, useStagger } from '../motion';
import { useTheme } from '../themes';
import { BodyText, Icon } from './primitives';

export interface LogoRevealProps {
  name: string;
  /** Path gambar di public/, URL, atau emoji. Kosong = monogram huruf pertama. */
  logo?: string;
  tagline?: string;
  delay?: number;
  /** Ukuran mark (px basis 1080). */
  size?: number;
}

/** Mark logo muncul dengan cincin cahaya, lalu nama huruf demi huruf, lalu tagline. */
export const LogoReveal: React.FC<LogoRevealProps> = ({ name, logo, tagline, delay = 0, size = 220 }) => {
  const { theme, type, px } = useTheme();
  const stagger = useStagger('tight');
  const mark = useSpring({ delay, spring: theme.motion.spring === 'bouncy' ? 'bouncy' : 'gentle' });
  const ring = useSpring({ delay: delay + 0.1, spring: 'smooth', duration: 1.4 });
  const s = px(size);
  const letters = Array.from(name);
  const lettersDelay = delay + 0.45;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(48) }}>
      <div style={{ position: 'relative', width: s, height: s }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: px(theme.radius.lg),
            border: `${px(4)}px solid ${theme.colors.primary}`,
            transform: `scale(${interpolate(ring, [0, 1], [0.9, 1.7])})`,
            opacity: interpolate(ring, [0, 0.2, 1], [0, 0.7, 0]),
          }}
        />
        <div
          style={{
            width: s,
            height: s,
            borderRadius: px(theme.radius.lg),
            background: logo ? theme.colors.surface : theme.gradient,
            border: logo ? `${px(2)}px solid ${theme.colors.border}` : undefined,
            boxShadow: theme.shadow.elevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${interpolate(mark, [0, 1], [0.5, 1])}) rotate(${interpolate(mark, [0, 1], [-12, 0])}deg)`,
            opacity: Math.min(1, mark * 1.5),
            overflow: 'hidden',
          }}
        >
          {logo ? (
            <Icon src={logo} size={size * 0.62} />
          ) : (
            <span
              style={{
                fontFamily: theme.fonts.heading,
                fontWeight: theme.fontWeights.heading,
                fontSize: s * 0.5,
                color: theme.colors.onPrimary,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          overflow: 'hidden',
          fontFamily: theme.fonts.heading,
          fontWeight: theme.fontWeights.heading,
          fontSize: type.h1,
          letterSpacing: `${theme.headingTracking}em`,
          color: theme.colors.text,
          paddingBottom: px(10),
        }}
      >
        {letters.map((ch, i) => (
          <Reveal key={i} delay={stagger(i, lettersDelay) * 0.5} preset="fadeUp" style={{ whiteSpace: 'pre' }}>
            {ch}
          </Reveal>
        ))}
      </div>
      {tagline ? (
        <Reveal delay={lettersDelay + 0.35}>
          <BodyText size="subtitle">{tagline}</BodyText>
        </Reveal>
      ) : null}
    </div>
  );
};
