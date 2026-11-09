import type { VideoConfig } from '../core/types';
import type { Feature, NotificationData, ScreenConfig } from '../scenes/types';
import { baseConfig, type CTAContent, type TemplateBase } from './types';

export interface MobileAppPromoProps extends TemplateBase {
  title: string;
  highlight?: string;
  subtitle?: string;
  /** Layar utama aplikasi yang dipamerkan. */
  screen: ScreenConfig;
  screenTitle?: string;
  bullets?: string[];
  notifications?: NotificationData[];
  features: Feature[];
  cta: CTAContent;
}

/** Promo aplikasi mobile: Logo → Hero → Ponsel+notifikasi → Fitur → CTA (badge toko aplikasi). */
export function mobileAppPromo(p: MobileAppPromoProps): VideoConfig {
  return {
    ...baseConfig(p, 'ModernSaaS'),
    duration: p.duration ?? 20,
    scenes: [
      { type: 'logo' },
      { type: 'hero', title: p.title, highlight: p.highlight, subtitle: p.subtitle },
      { type: 'device', title: p.screenTitle, bullets: p.bullets, screen: p.screen, notifications: p.notifications },
      { type: 'features', features: p.features },
      { type: 'cta', badges: ['App Store', 'Google Play'], ...p.cta },
    ],
  };
}
