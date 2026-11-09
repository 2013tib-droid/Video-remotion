import React from 'react';
import { interpolate } from 'remotion';
import { useSpring } from '../motion';
import { useTheme } from '../themes';

export interface BrowserMockupProps {
  children?: React.ReactNode;
  url?: string;
  /** Lebar (px basis 1080). */
  width?: number;
  /** Rasio tinggi/lebar area konten. */
  aspect?: number;
  delay?: number;
}

/** Jendela browser minimalis. Isi lewat children. */
export const BrowserMockup: React.FC<BrowserMockupProps> = ({ children, url = 'app.contoh.com', width = 960, aspect = 0.68, delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const p = useSpring({ delay, spring: 'heavy' });
  const w = px(width);
  const bar = px(64);
  const dark = theme.mode === 'dark';
  return (
    <div
      style={{
        width: w,
        borderRadius: px(theme.radius.md),
        overflow: 'hidden',
        background: dark ? '#16161a' : '#ffffff',
        border: `${px(2)}px solid ${theme.colors.border}`,
        boxShadow: theme.shadow.elevated,
        transform: `translateY(${interpolate(p, [0, 1], [px(300), 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
        opacity: Math.min(1, p * 2),
      }}
    >
      <div
        style={{
          height: bar,
          display: 'flex',
          alignItems: 'center',
          gap: px(12),
          padding: `0 ${px(24)}px`,
          background: dark ? '#1f1f24' : '#f1f3f6',
          borderBottom: `${px(2)}px solid ${theme.colors.border}`,
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: px(18), height: px(18), borderRadius: '50%', background: c }} />
        ))}
        <div
          style={{
            flex: 1,
            margin: `0 ${px(40)}px`,
            height: px(38),
            borderRadius: px(10),
            background: dark ? '#2a2a30' : '#ffffff',
            color: theme.colors.muted,
            fontFamily: theme.fonts.body,
            fontSize: type.label * 0.85,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ width: '100%', height: w * aspect, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  );
};
