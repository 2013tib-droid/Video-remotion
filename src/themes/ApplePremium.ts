import { FONT_STACKS } from '../config';
import type { Theme } from './types';

/** Gelap, minimalis, presisi. Teknologi premium & peluncuran produk. */
export const ApplePremium: Theme = {
  name: 'ApplePremium',
  mode: 'dark',
  colors: {
    background: '#000000',
    backgroundAlt: '#0b0b10',
    surface: 'rgba(255,255,255,0.06)',
    surfaceAlt: 'rgba(255,255,255,0.10)',
    primary: '#0a84ff',
    secondary: '#5e5ce6',
    accent: '#30d158',
    text: '#f5f5f7',
    onPrimary: '#ffffff',
    muted: '#86868b',
    border: 'rgba(255,255,255,0.12)',
    success: '#30d158',
    danger: '#ff453a',
  },
  gradient: 'linear-gradient(120deg, #0a84ff 0%, #5e5ce6 50%, #bf5af2 100%)',
  fonts: { heading: FONT_STACKS.inter, body: FONT_STACKS.inter, mono: FONT_STACKS.mono },
  fontWeights: { heading: 700, body: 400, strong: 600 },
  tabularNumbers: true,
  headingTracking: -0.035,
  radius: { sm: 14, md: 28, lg: 48, pill: 999 },
  shadow: {
    card: '0 20px 60px rgba(0,0,0,0.5)',
    elevated: '0 40px 120px rgba(10,132,255,0.25)',
  },
  motion: { spring: 'smooth', entrance: 'blurUp', stagger: 'normal', transition: 'zoom', energy: 'calm', text: 'blur' },
  background: { kind: 'gradient', intensity: 0.6 },
};
