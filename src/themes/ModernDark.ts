import { FONT_STACKS } from '../config';
import type { Theme } from './types';

/** Gelap ala aplikasi modern: hitam pekat, kartu abu gelap, aksen biru. Cocok untuk explainer/edukasi. */
export const ModernDark: Theme = {
  name: 'ModernDark',
  mode: 'dark',
  colors: {
    background: '#050505',
    backgroundAlt: '#101826',
    surface: '#1a1a1a',
    surfaceAlt: '#232323',
    primary: '#6e9ef6',
    secondary: '#9cc0ff',
    accent: '#f5c84c',
    text: '#f5f5f5',
    onPrimary: '#0b1220',
    muted: '#9a9a9a',
    border: '#2e2e2e',
    success: '#5fd38a',
    danger: '#f26b6b',
  },
  gradient: 'linear-gradient(120deg, #6e9ef6 0%, #9cc0ff 100%)',
  fonts: { heading: FONT_STACKS.inter, body: FONT_STACKS.inter, mono: FONT_STACKS.mono },
  fontWeights: { heading: 700, body: 400, strong: 600 },
  tabularNumbers: true,
  headingTracking: -0.02,
  radius: { sm: 14, md: 28, lg: 40, pill: 999 },
  shadow: {
    card: '0 12px 40px rgba(0,0,0,0.45)',
    elevated: '0 30px 80px rgba(110,158,246,0.18)',
  },
  motion: { spring: 'snappy', entrance: 'fadeUp', stagger: 'tight', transition: 'fade' },
  background: { kind: 'solid', intensity: 0.4 },
};
