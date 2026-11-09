import React from 'react';
import { useTheme } from '../../themes';

/** Kerangka layar aplikasi di dalam PhoneMockup: status bar + header + konten. */
export const AppScreen: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  const { theme, type, px } = useTheme();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        background: theme.mode === 'dark' ? '#111114' : theme.colors.background,
      }}
    >
      <div style={{ height: px(110) }} />
      {title ? (
        <div
          style={{
            padding: `0 ${px(36)}px ${px(20)}px`,
            fontFamily: theme.fonts.heading,
            fontWeight: theme.fontWeights.heading,
            fontSize: type.subtitle * 0.85,
            letterSpacing: `${theme.headingTracking}em`,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ flex: 1, padding: `0 ${px(28)}px ${px(28)}px`, position: 'relative', display: 'flex', flexDirection: 'column', gap: px(16) }}>
        {children}
      </div>
    </div>
  );
};
