import React from 'react';
import { Reveal, useSpring, useStagger } from '../motion';
import { useTheme } from '../themes';
import { BodyText, Icon } from './primitives';

export interface TimelineStep {
  title: string;
  description?: string;
  icon?: string;
}

export interface TimelineAnimationProps {
  steps: TimelineStep[];
  delay?: number;
}

/** Langkah-langkah vertikal dengan garis progres yang tergambar. */
export const TimelineAnimation: React.FC<TimelineAnimationProps> = ({ steps, delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const stagger = useStagger('relaxed');
  const line = useSpring({ delay, spring: 'smooth', duration: 0.4 + steps.length * 0.3 });
  const node = px(96);
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: px(48), width: '100%', maxWidth: px(880) }}>
      <div
        style={{
          position: 'absolute',
          left: node / 2 - px(3),
          top: node / 2,
          width: px(6),
          height: `calc((100% - ${node}px) * ${line})`,
          borderRadius: px(3),
          background: theme.gradient,
        }}
      />
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: px(36), position: 'relative' }}>
          <Reveal delay={stagger(i, delay)} preset="pop" spring="snappy">
            <div
              style={{
                width: node,
                height: node,
                borderRadius: '50%',
                background: theme.colors.surface,
                border: `${px(5)}px solid ${theme.colors.primary}`,
                boxShadow: theme.shadow.card,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                fontFamily: theme.fonts.heading,
                fontWeight: theme.fontWeights.heading,
                fontSize: type.caption,
                color: theme.colors.primary,
              }}
            >
              {s.icon ? <Icon src={s.icon} size={52} /> : i + 1}
            </div>
          </Reveal>
          <Reveal delay={stagger(i, delay) + 0.1} preset="slideLeft" style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontWeight: theme.fontWeights.heading,
                fontSize: type.h3 * 0.75,
                color: theme.colors.text,
                letterSpacing: `${theme.headingTracking}em`,
              }}
            >
              {s.title}
            </div>
            {s.description ? (
              <BodyText size="caption" align="left">
                {s.description}
              </BodyText>
            ) : null}
          </Reveal>
        </div>
      ))}
    </div>
  );
};
