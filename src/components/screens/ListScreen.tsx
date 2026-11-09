import React from 'react';
import { Reveal, useStagger } from '../../motion';
import { useTheme } from '../../themes';
import { Icon } from '../primitives';
import { AppScreen } from './AppScreen';

export interface ListItem {
  icon?: string;
  title: string;
  subtitle?: string;
  value?: string;
}

/** Daftar item gaya aplikasi (transaksi, pelajaran, produk). */
export const ListScreen: React.FC<{ title?: string; items: ListItem[]; delay?: number }> = ({ title, items, delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const stagger = useStagger();
  return (
    <AppScreen title={title}>
      {items.map((it, i) => (
        <Reveal key={i} delay={stagger(i, delay + 0.3)} preset="slideLeft">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: px(18),
              padding: px(20),
              borderRadius: px(theme.radius.sm),
              background: theme.colors.surface,
              border: `${px(1.5)}px solid ${theme.colors.border}`,
            }}
          >
            {it.icon ? (
              <div style={{ width: px(64), height: px(64), borderRadius: px(16), background: theme.colors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon src={it.icon} size={40} />
              </div>
            ) : null}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: theme.fontWeights.strong, fontSize: type.label }}>{it.title}</div>
              {it.subtitle ? <div style={{ color: theme.colors.muted, fontSize: type.label * 0.85 }}>{it.subtitle}</div> : null}
            </div>
            {it.value ? <div style={{ fontWeight: theme.fontWeights.strong, fontSize: type.label, color: theme.colors.primary }}>{it.value}</div> : null}
          </div>
        </Reveal>
      ))}
    </AppScreen>
  );
};
