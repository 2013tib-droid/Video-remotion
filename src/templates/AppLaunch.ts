import type { VideoConfig } from '../core/types';
import type { Feature, StatsScene } from '../scenes/types';
import { baseConfig, compact, type CTAContent, type TemplateBase } from './types';

export interface AppLaunchProps extends TemplateBase {
  tagline?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  features: Feature[];
  featuresTitle?: string;
  stats?: StatsScene['stats'];
  cta: CTAContent;
}

/** Peluncuran produk: Logo → Hero → Fitur → (Statistik) → CTA. */
export function appLaunch(p: AppLaunchProps): VideoConfig {
  return {
    ...baseConfig(p, 'ApplePremium'),
    duration: p.duration ?? 20,
    scenes: compact([
      { type: 'logo', tagline: p.tagline },
      { type: 'hero', eyebrow: 'Diluncurkan hari ini', title: p.title, highlight: p.highlight, subtitle: p.subtitle },
      { type: 'features', title: p.featuresTitle ?? 'Semua yang kamu butuhkan', features: p.features },
      p.stats?.length ? { type: 'stats', stats: p.stats } : null,
      { type: 'cta', ...p.cta },
    ]),
  };
}
