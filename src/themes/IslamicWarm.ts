import { FONT_STACKS } from '../config';
import type { Theme } from './types';

/** Hangat, krem & hijau tosca, aksen emas, pola geometris. Dampak sosial, donasi, komunitas. */
export const IslamicWarm: Theme = {
  name: 'IslamicWarm',
  mode: 'light',
  colors: {
    background: '#fbf6ee',
    backgroundAlt: '#f3e9d8',
    surface: '#fffdf9',
    surfaceAlt: '#f7efe2',
    primary: '#0f766e',
    secondary: '#b45309',
    accent: '#c99a2e',
    text: '#3b2f2f',
    onPrimary: '#ffffff',
    muted: '#8b7e74',
    border: '#eadcc6',
    success: '#15803d',
    danger: '#b91c1c',
  },
  gradient: 'linear-gradient(120deg, #0f766e 0%, #15803d 50%, #c99a2e 100%)',
  fonts: { heading: FONT_STACKS.lora, body: FONT_STACKS.jakarta, mono: FONT_STACKS.mono },
  fontWeights: { heading: 700, body: 400, strong: 600 },
  tabularNumbers: false,
  headingTracking: -0.015,
  radius: { sm: 14, md: 26, lg: 44, pill: 999 },
  shadow: {
    card: '0 12px 40px rgba(59,47,47,0.08)',
    elevated: '0 30px 80px rgba(15,118,110,0.18)',
  },
  motion: { spring: 'gentle', entrance: 'fadeUp', stagger: 'relaxed', transition: 'fade' },
  background: { kind: 'pattern', intensity: 0.5 },
};
