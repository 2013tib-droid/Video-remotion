import React from 'react';
import { useStagger } from '../motion';
import { useTheme } from '../themes';
import { ChartAnimation, type ChartDatum } from './ChartAnimation';
import { CounterAnimation } from './CounterAnimation';

export interface KPI {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export interface DashboardMockupProps {
  title?: string;
  kpis: KPI[];
  chart?: ChartDatum[];
  delay?: number;
}

/** Dashboard SaaS (sidebar + KPI + chart). Mengisi penuh parent (mis. BrowserMockup). */
export const DashboardMockup: React.FC<DashboardMockupProps> = ({ title = 'Dashboard', kpis, chart, delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const stagger = useStagger();
  const dark = theme.mode === 'dark';
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', fontFamily: theme.fonts.body }}>
      <div
        style={{
          width: '18%',
          background: dark ? '#121216' : theme.colors.surfaceAlt,
          padding: px(24),
          display: 'flex',
          flexDirection: 'column',
          gap: px(18),
        }}
      >
        <div style={{ width: px(48), height: px(48), borderRadius: px(12), background: theme.gradient }} />
        {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
          <div key={i} style={{ height: px(14), width: `${w * 100}%`, borderRadius: px(7), background: theme.colors.border }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: px(32), display: 'flex', flexDirection: 'column', gap: px(24) }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: theme.fontWeights.heading, fontSize: type.caption, color: theme.colors.text }}>
          {title}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpis.length, 3)}, 1fr)`, gap: px(16) }}>
          {kpis.slice(0, 3).map((k, i) => (
            <div
              key={i}
              style={{
                padding: px(20),
                borderRadius: px(theme.radius.sm),
                background: theme.colors.surface,
                border: `${px(1.5)}px solid ${theme.colors.border}`,
              }}
            >
              <CounterAnimation {...k} size="caption" align="left" delay={stagger(i, delay)} gradient={i === 0} ting={i === 0} />
            </div>
          ))}
        </div>
        {chart ? (
          <div style={{ flex: 1, padding: px(20), borderRadius: px(theme.radius.sm), border: `${px(1.5)}px solid ${theme.colors.border}` }}>
            <ChartAnimation data={chart} orientation="vertical" height={260} compact delay={delay + 0.4} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
