/**
 * Skala tipografi (px pada basis 1080 untuk sisi terpendek).
 * Ukuran sebenarnya = nilai * scale (lihat useTheme().type).
 */
export const TYPE_SCALE = {
  display: 128,
  h1: 96,
  h2: 72,
  h3: 52,
  subtitle: 40,
  body: 32,
  caption: 26,
  label: 22,
} as const;

export type TypeSize = keyof typeof TYPE_SCALE;

/** Pengali ukuran teks untuk format portrait/vertikal. */
export const PORTRAIT_TYPE_BOOST = 1.12;

export const LINE_HEIGHT = {
  tight: 1.05,
  heading: 1.12,
  body: 1.4,
} as const;
