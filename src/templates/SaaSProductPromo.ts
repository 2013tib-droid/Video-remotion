import type { VideoConfig } from '../core/types';
import type { ComparisonScene, Feature, KPI, ChartDatum } from '../scenes/types';
import { baseConfig, compact, type CTAContent, type TemplateBase } from './types';

export interface SaaSProductPromoProps extends TemplateBase {
  title: string;
  highlight?: string;
  subtitle?: string;
  dashboard: { title?: string; kpis: KPI[]; chart?: ChartDatum[]; caption?: string };
  features: Feature[];
  comparison?: Pick<ComparisonScene, 'title' | 'columns' | 'rows' | 'highlightColumn'>;
  cta: CTAContent;
}

/** Promo SaaS: Hero → Dashboard → Fitur → (Perbandingan) → CTA. */
export function saasProductPromo(p: SaaSProductPromoProps): VideoConfig {
  return {
    ...baseConfig(p, 'ModernSaaS'),
    duration: p.duration ?? 25,
    scenes: compact([
      { type: 'hero', title: p.title, highlight: p.highlight, subtitle: p.subtitle },
      {
        type: 'device',
        title: p.dashboard.caption ?? 'Semua data, satu layar',
        screen: { kind: 'dashboard', title: p.dashboard.title, kpis: p.dashboard.kpis, chart: p.dashboard.chart },
      },
      { type: 'features', title: 'Kenapa tim memilih kami', features: p.features },
      p.comparison ? { type: 'comparison', ...p.comparison, title: p.comparison.title ?? 'Bandingkan sendiri' } : null,
      { type: 'cta', ...p.cta },
    ]),
  };
}
