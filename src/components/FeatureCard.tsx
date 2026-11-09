import React from 'react';
import { Reveal } from '../motion';
import { useTheme } from '../themes';
import { BodyText, Icon, Surface } from './primitives';

export interface Feature {
  /** Emoji, path gambar di public/, atau URL. */
  icon?: string;
  title: string;
  description?: string;
}

export interface FeatureCardProps extends Feature {
  delay?: number;
  /** row = ikon di kiri (list); column = ikon di atas (grid). */
  layout?: 'row' | 'column';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0, layout = 'row' }) => {
  const { theme, type, px } = useTheme();
  const isRow = layout === 'row';
  return (
    <Reveal delay={delay} style={{ width: '100%', height: '100%' }}>
      <Surface
        padding={isRow ? 36 : 44}
        style={{
          display: 'flex',
          flexDirection: isRow ? 'row' : 'column',
          alignItems: isRow ? 'center' : 'flex-start',
          gap: px(isRow ? 32 : 24),
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {icon ? (
          <div
            style={{
              flexShrink: 0,
              width: px(110),
              height: px(110),
              borderRadius: px(theme.radius.md),
              background: theme.colors.surfaceAlt,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon src={icon} size={64} />
          </div>
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: px(8) }}>
          <div
            style={{
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.heading,
              fontSize: type.h3 * 0.8,
              letterSpacing: `${theme.headingTracking}em`,
              color: theme.colors.text,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {description ? (
            <BodyText size="caption" align="left">
              {description}
            </BodyText>
          ) : null}
        </div>
      </Surface>
    </Reveal>
  );
};
