import React from 'react';
import { interpolate } from 'remotion';
import { useSpring } from '../motion';
import { useTheme } from '../themes';
import { Icon } from './primitives';

export interface NotificationData {
  app?: string;
  icon?: string;
  title: string;
  body?: string;
  time?: string;
}

export interface NotificationPopupProps extends NotificationData {
  delay?: number;
  /** Lebar (px basis 1080). */
  width?: number;
}

/** Notifikasi gaya iOS yang meluncur dari atas. */
export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  app,
  icon = '🔔',
  title,
  body,
  time = 'sekarang',
  delay = 0,
  width = 820,
}) => {
  const { theme, type, px } = useTheme();
  const p = useSpring({ delay, spring: 'snappy' });
  const dark = theme.mode === 'dark';
  return (
    <div
      style={{
        width: px(width),
        display: 'flex',
        gap: px(24),
        alignItems: 'center',
        padding: px(28),
        borderRadius: px(36),
        background: dark ? 'rgba(40,40,46,0.88)' : 'rgba(255,255,255,0.94)',
        border: `${px(1.5)}px solid ${theme.colors.border}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        backdropFilter: 'blur(30px)',
        transform: `translateY(${interpolate(p, [0, 1], [-px(140), 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
        opacity: Math.min(1, p * 1.5),
        fontFamily: theme.fonts.body,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: px(84),
          height: px(84),
          flexShrink: 0,
          borderRadius: px(20),
          background: theme.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon src={icon} size={50} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.muted, fontSize: type.label }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{app ?? ''}</span>
          <span>{time}</span>
        </div>
        <div style={{ color: theme.colors.text, fontWeight: theme.fontWeights.strong, fontSize: type.caption, marginTop: px(4) }}>
          {title}
        </div>
        {body ? <div style={{ color: theme.colors.muted, fontSize: type.label, marginTop: px(2) }}>{body}</div> : null}
      </div>
    </div>
  );
};
