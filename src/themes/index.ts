import { ApplePremium } from './ApplePremium';
import { Corporate } from './Corporate';
import { IslamicWarm } from './IslamicWarm';
import { ModernDark } from './ModernDark';
import { ModernSaaS } from './ModernSaaS';
import { PlayfulKids } from './PlayfulKids';
import type { Theme, ThemeOverrides } from './types';

/** Registry tema. Tambah tema baru: buat file, lalu daftarkan di sini. */
export const THEMES = {
  ApplePremium,
  ModernSaaS,
  ModernDark,
  PlayfulKids,
  Corporate,
  IslamicWarm,
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(override)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    out[key] = isObject(value) && isObject(out[key]) ? deepMerge(out[key], value) : value;
  }
  return out as T;
}

export function resolveTheme(name: ThemeName, overrides?: ThemeOverrides): Theme {
  const base = THEMES[name];
  if (!base) {
    throw new Error(`Tema "${String(name)}" tidak ditemukan. Pilihan: ${Object.keys(THEMES).join(', ')}`);
  }
  return deepMerge(base, overrides);
}

export type { Theme, ThemeOverrides, BackgroundKind } from './types';
export { ThemeProvider, useTheme } from './ThemeProvider';
