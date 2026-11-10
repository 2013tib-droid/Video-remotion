import { FONT_STACKS } from '../config';
import type { Theme } from './types';

/** Terang, bersih, indigo/cyan. Produk SaaS & dashboard B2B. */
export const ModernSaaS: Theme = {
  name: 'ModernSaaS',
  mode: 'light',
  colors: {
    background: '#f8fafc',
    backgroundAlt: '#eef2ff',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    primary: '#6366f1',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    text: '#0f172a',
    onPrimary: '#ffffff',
    muted: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    danger: '#ef4444',
  },
  gradient: 'linear-gradient(120deg, #6366f1 0%, #8b5cf6 45%, #06b6d4 100%)',
  fonts: { heading: FONT_STACKS.jakarta, body: FONT_STACKS.jakarta, mono: FONT_STACKS.mono },
  fontWeights: { heading: 800, body: 400, strong: 600 },
  tabularNumbers: true,
  headingTracking: -0.03,
  radius: { sm: 12, md: 24, lg: 40, pill: 999 },
  shadow: {
    card: '0 12px 40px rgba(15,23,42,0.08)',
    elevated: '0 30px 80px rgba(99,102,241,0.22)',
  },
  motion: { spring: 'gentle', entrance: 'fadeUp', stagger: 'normal', transition: 'slideLeft', energy: 'normal', text: 'rise' },
  background: { kind: 'gradient', intensity: 0.5 },
};
