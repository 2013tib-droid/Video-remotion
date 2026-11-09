import type { VideoConfig } from '../core/types';
import type { Feature, StatsScene } from '../scenes/types';
import { baseConfig, compact, type CTAContent, type TemplateBase } from './types';

export interface SocialMediaShortProps extends TemplateBase {
  /** Kalimat pembuka (2 detik pertama menentukan!). */
  hook: string;
  highlight?: string;
  subtitle?: string;
  /** Maksimal 3–4 poin. */
  points: Feature[];
  pointsTitle?: string;
  /** Bukti sosial opsional (1–2 angka). */
  proof?: StatsScene['stats'];
  cta: CTAContent;
}

/** Reels/TikTok/Shorts 9:16 cepat: Hook → Poin → (Bukti) → CTA. */
export function socialMediaShort(p: SocialMediaShortProps): VideoConfig {
  return {
    ...baseConfig(p, 'ModernSaaS'),
    format: p.format ?? 'vertical',
    duration: p.duration ?? 15,
    scenes: compact([
      { type: 'hero', title: p.hook, highlight: p.highlight, subtitle: p.subtitle, duration: 3 },
      { type: 'features', title: p.pointsTitle, features: p.points, duration: 5 },
      p.proof?.length ? { type: 'stats', stats: p.proof, duration: 3 } : null,
      { type: 'cta', ...p.cta, duration: 3.5 },
    ]),
  };
}
