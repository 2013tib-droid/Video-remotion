import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme } from '../../themes';
import { Icon } from '../primitives';

function parseClock(s: string): number {
  return s.split(':').map(Number).reduce((acc, n) => acc * 60 + (Number.isFinite(n) ? n : 0), 0);
}

function formatClock(total: number): string {
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Widget status kanan atas: brand + label (mis. "TIU 7/20") + timer mundur. */
export const StatusHud: React.FC<{
  brand?: { name: string; logo?: string };
  label?: string;
  timer?: string;
  top: number;
}> = ({ brand, label, timer, top }) => {
  const { theme, px, safe } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: px(14),
    height: px(76),
    padding: `0 ${px(24)}px`,
    borderRadius: px(22),
    background: theme.colors.surface,
    border: `${px(2)}px solid ${theme.colors.border}`,
    color: theme.colors.text,
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{ position: 'absolute', top: px(top), left: safe.x, right: safe.x, display: 'flex', justifyContent: 'space-between' }}>
      {brand ? (
        <div style={{ ...box, fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: px(30) }}>
          {brand.logo ? <Icon src={brand.logo} size={38} /> : null}
          {brand.name}
        </div>
      ) : (
        <div />
      )}
      {label || timer ? (
        <div style={{ ...box, fontFamily: theme.fonts.mono, fontSize: px(30) }}>
          {label ? <span style={{ fontWeight: 700, fontFamily: theme.fonts.body }}>{label}</span> : null}
          {label && timer ? <span style={{ color: theme.colors.border }}>|</span> : null}
          {timer ? (
            <>
              <span style={{ fontSize: px(28) }}>⏱</span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatClock(parseClock(timer) - frame / fps)}</span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
