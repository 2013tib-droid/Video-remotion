/** Skala spasi (px pada basis 1080). Ukuran sebenarnya = nilai * scale. */
export const SPACING = {
  xs: 8,
  sm: 16,
  md: 32,
  lg: 56,
  xl: 88,
  xxl: 140,
} as const;

export type SpaceSize = keyof typeof SPACING;
