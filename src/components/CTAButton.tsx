import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useSpring } from '../motion';
import { useTheme } from '../themes';

export interface CTAButtonProps {
  label: string;
  delay?: number;
  /** Denyut halus setelah muncul. */
  pulse?: boolean;
  /** Animasi kursor menekan tombol. */
  cursor?: boolean;
  icon?: string;
}

/** Tombol CTA gradien: pop-in → (opsional) kursor klik → denyut halus. */
export const CTAButton: React.FC<CTAButtonProps> = ({ label, delay = 0, pulse = true, cursor = false, icon = '→' }) => {
  const { theme, type, px } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useSpring({ delay, spring: theme.motion.spring === 'bouncy' ? 'bouncy' : 'gentle' });
  const clickAt = delay + 0.9;
  const cursorIn = useSpring({ delay: delay + 0.35, spring: 'smooth', duration: 0.6 });
  const press = cursor
    ? interpolate(frame / fps, [clickAt, clickAt + 0.1, clickAt + 0.3], [1, 0.93, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;
  const ripple = interpolate(frame / fps, [clickAt, clickAt + 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const t = frame / fps - delay - 1.2;
  const beat = pulse && t > 0 ? 1 + 0.03 * Math.sin(t * Math.PI * 1.6) : 1;
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: px(20),
          padding: `${px(34)}px ${px(64)}px`,
          borderRadius: px(theme.radius.pill),
          background: theme.gradient,
          color: theme.colors.onPrimary,
          fontFamily: theme.fonts.heading,
          fontWeight: theme.fontWeights.heading,
          fontSize: type.subtitle,
          letterSpacing: `${theme.headingTracking / 2}em`,
          boxShadow: theme.shadow.elevated,
          transform: `scale(${interpolate(enter, [0, 1], [0.6, 1]) * press * beat})`,
          opacity: Math.min(1, enter * 1.4),
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {cursor && ripple > 0 && ripple < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: '70%',
              top: '50%',
              width: px(600),
              height: px(600),
              marginLeft: -px(300),
              marginTop: -px(300),
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              transform: `scale(${ripple})`,
              opacity: 1 - ripple,
            }}
          />
        ) : null}
        <span>{label}</span>
        {icon ? <span>{icon}</span> : null}
      </div>
      {cursor ? (
        <svg
          viewBox="0 0 24 24"
          width={px(72)}
          height={px(72)}
          style={{
            position: 'absolute',
            left: '68%',
            top: '55%',
            transform: `translate(${interpolate(cursorIn, [0, 1], [px(220), 0])}px, ${interpolate(cursorIn, [0, 1], [px(180), 0])}px) scale(${press})`,
            opacity: cursorIn,
            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))',
          }}
        >
          <path d="M4 2l16 9-7 2-3 7z" fill="#ffffff" stroke="#111111" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      ) : null}
    </div>
  );
};
