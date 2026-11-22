import React, { createContext, useContext, useMemo } from 'react';
import { useVideoConfig } from 'remotion';
import { LEGIBILITY, PORTRAIT_TYPE_BOOST, SAFE_AREA, SPACING, TYPE_SCALE, type FormatName, type SpaceSize, type TypeSize } from '../config';
import type { Theme } from './types';

export interface ThemeContextValue {
  theme: Theme;
  format: FormatName;
  /** Faktor skala: sisi terpendek / 1080. */
  scale: number;
  isPortrait: boolean;
  /** Ukuran font terskala (px). */
  type: Record<TypeSize, number>;
  /** Spasi terskala (px). */
  space: Record<SpaceSize, number>;
  /** Padding area aman terskala (px). */
  safe: { top: number; bottom: number; x: number };
  /** Skala angka bebas (px basis 1080 → px aktual). */
  px: (n: number) => number;
  /**
   * Ukuran teks kecil (catatan, label HUD) yang dihitung dari `type.x * faktor`: pada
   * `legibility: 'mobile'` tidak lebih kecil dari `LEGIBILITY.smallFloor`; selain itu apa adanya.
   */
  small: (size: number) => number;
  /** `legibility: 'mobile'` aktif. */
  mobile: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function scaleRecord<K extends string>(rec: Record<K, number>, s: number): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const k of Object.keys(rec) as K[]) out[k] = Math.round(rec[k] * s);
  return out;
}

export const ThemeProvider: React.FC<{
  theme: Theme;
  format: FormatName;
  /** Ruang tambahan area aman (px basis 1080), mis. untuk lapisan header/subtitle. */
  insets?: { top?: number; bottom?: number };
  /** `mobile` = teks pendukung tidak lebih kecil dari `LEGIBILITY.typeFloor`. */
  legibility?: 'standard' | 'mobile';
  children: React.ReactNode;
}> = ({ theme, format, insets, legibility, children }) => {
  const { width, height } = useVideoConfig();
  const value = useMemo<ThemeContextValue>(() => {
    const scale = Math.min(width, height) / 1080;
    const base = SAFE_AREA[format];
    const safe = { ...base, top: base.top + (insets?.top ?? 0), bottom: base.bottom + (insets?.bottom ?? 0) };
    const portrait = height > width;
    // Video vertikal ditonton di layar ponsel: teks sedikit diperbesar.
    const typeScale = scale * (portrait ? PORTRAIT_TYPE_BOOST : 1);
    const type = scaleRecord(TYPE_SCALE, typeScale);
    if (legibility === 'mobile') {
      for (const [k, min] of Object.entries(LEGIBILITY.typeFloor) as [TypeSize, number][]) {
        type[k] = Math.max(type[k], Math.round(min * scale));
      }
    }
    return {
      theme,
      format,
      scale,
      isPortrait: portrait,
      type,
      space: scaleRecord(SPACING, scale),
      safe: scaleRecord(safe, scale),
      px: (n: number) => n * scale,
      small: legibility === 'mobile' ? (size: number) => Math.max(size, LEGIBILITY.smallFloor * scale) : (size: number) => size,
      mobile: legibility === 'mobile',
    };
  }, [theme, format, width, height, insets?.top, insets?.bottom, legibility]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() harus dipakai di dalam <ThemeProvider>.');
  return ctx;
}

/**
 * Ganti sebagian warna tema untuk sub-pohon (mis. teks putih di atas foto b-roll),
 * tanpa mengubah format/area aman.
 */
export const ThemeColors: React.FC<{ colors: Partial<Theme['colors']>; gradient?: string; children: React.ReactNode }> = ({
  colors,
  gradient,
  children,
}) => {
  const ctx = useTheme();
  const value = useMemo<ThemeContextValue>(
    () => ({ ...ctx, theme: { ...ctx.theme, colors: { ...ctx.theme.colors, ...colors }, gradient: gradient ?? ctx.theme.gradient } }),
    [ctx, colors, gradient],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
