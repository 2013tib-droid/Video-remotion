import { FONT_STACKS } from '../config';
import type { Theme } from './types';

/** Tenang, terpercaya, navy. Enterprise, fintech, B2B formal. */
export const Corporate: Theme = {
  name: 'Corporate',
  mode: 'light',
  colors: {
    background: '#f5f7fa',
    backgroundAlt: '#e8eef6',
    surface: '#ffffff',
    surfaceAlt: '#f0f3f8',
    primary: '#0b3d91',
    secondary: '#1f7ae0',
    accent: '#00a3a1',
    text: '#0d1b2a',
    onPrimary: '#ffffff',
    muted: '#5b6b7f',
    border: '#d8e0ea',
    success: '#1a9e5c',
    danger: '#d64545',
  },
  gradient: 'linear-gradient(120deg, #0b3d91 0%, #1f7ae0 60%, #00a3a1 100%)',
  fonts: { heading: FONT_STACKS.plex, body: FONT_STACKS.plex, mono: FONT_STACKS.mono },
  fontWeights: { heading: 700, body: 400, strong: 600 },
  tabularNumbers: true,
  headingTracking: -0.02,
  radius: { sm: 8, md: 16, lg: 24, pill: 999 },
  shadow: {
    card: '0 8px 30px rgba(13,27,42,0.08)',
    elevated: '0 24px 60px rgba(11,61,145,0.18)',
  },
  motion: { spring: 'smooth', entrance: 'fadeUp', stagger: 'normal', transition: 'fade' },
  background: { kind: 'solid', intensity: 0.3 },
};
