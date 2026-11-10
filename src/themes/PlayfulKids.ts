import { FONT_STACKS } from '../config';
import type { Theme } from './types';

/** Ceria, membulat, memantul. Produk edukasi anak & game. */
export const PlayfulKids: Theme = {
  name: 'PlayfulKids',
  mode: 'light',
  colors: {
    background: '#fff7e6',
    backgroundAlt: '#ffe8f0',
    surface: '#ffffff',
    surfaceAlt: '#fff1d6',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    accent: '#ffc93c',
    text: '#2d3047',
    onPrimary: '#ffffff',
    muted: '#6b6f80',
    border: '#ffe0b3',
    success: '#2ecc71',
    danger: '#ff4757',
  },
  gradient: 'linear-gradient(120deg, #ff6b6b 0%, #ffc93c 50%, #4ecdc4 100%)',
  fonts: { heading: FONT_STACKS.fredoka, body: FONT_STACKS.fredoka, mono: FONT_STACKS.mono },
  fontWeights: { heading: 700, body: 400, strong: 600 },
  tabularNumbers: true,
  headingTracking: -0.01,
  radius: { sm: 20, md: 36, lg: 60, pill: 999 },
  shadow: {
    card: '0 10px 0 rgba(45,48,71,0.08), 0 20px 40px rgba(255,107,107,0.15)',
    elevated: '0 16px 0 rgba(45,48,71,0.08), 0 30px 60px rgba(255,107,107,0.25)',
  },
  motion: { spring: 'bouncy', entrance: 'pop', stagger: 'normal', transition: 'slideUp', energy: 'lively' },
  background: { kind: 'particles', intensity: 0.8 },
};
