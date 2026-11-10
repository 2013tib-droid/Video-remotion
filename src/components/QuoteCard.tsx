import React from 'react';
import { Reveal, useStagger } from '../motion';
import { useTheme } from '../themes';
import { BodyText, Icon, Pill, Surface } from './primitives';

export interface QuoteCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  /** Badge kepercayaan, mis. "Terdaftar resmi", "Diaudit". */
  badges?: string[];
  delay?: number;
}

/** Testimoni + badge kepercayaan. */
export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, author, role, avatar = '🙂', badges = [], delay = 0 }) => {
  const { theme, type, px, space } = useTheme();
  const stagger = useStagger();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.lg, maxWidth: px(960) }}>
      <Reveal delay={delay}>
        <Surface padding={56} radius="lg" elevated>
          <div style={{ fontFamily: theme.fonts.heading, fontSize: type.h1 * 1.4, lineHeight: 0.6, color: theme.colors.accent }}>“</div>
          <div
            style={{
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.strong,
              fontSize: type.h3 * 0.85,
              lineHeight: 1.3,
              color: theme.colors.text,
              letterSpacing: `${theme.headingTracking / 2}em`,
            }}
          >
            {quote}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: px(24), marginTop: space.md }}>
            <div
              style={{
                width: px(96),
                height: px(96),
                borderRadius: '50%',
                background: theme.colors.surfaceAlt,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Icon src={avatar} size={70} />
            </div>
            <div>
              <div style={{ fontFamily: theme.fonts.body, fontWeight: theme.fontWeights.strong, fontSize: type.caption, color: theme.colors.text }}>
                {author}
              </div>
              {role ? (
                <BodyText size="label" align="left">
                  {role}
                </BodyText>
              ) : null}
            </div>
          </div>
        </Surface>
      </Reveal>
      {badges.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: px(16) }}>
          {badges.map((b, i) => (
            <Reveal key={i} delay={stagger(i, delay + 0.6)} preset="pop" spring="snappy" idle>
              <Pill>{b}</Pill>
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
};
