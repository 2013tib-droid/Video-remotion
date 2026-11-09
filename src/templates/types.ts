import type { FormatName, TransitionName } from '../config';
import type { Brand, VideoConfig } from '../core/types';
import type { ThemeName, ThemeOverrides } from '../themes';

/** Properti umum semua template. */
export interface TemplateBase {
  id: string;
  brand: Brand;
  theme?: ThemeName;
  themeOverrides?: ThemeOverrides;
  format?: FormatName;
  /** Durasi total target (detik). */
  duration?: number;
  transition?: TransitionName;
  audio?: VideoConfig['audio'];
}

export interface CTAContent {
  title: string;
  highlight?: string;
  button: string;
  subtitle?: string;
  badges?: string[];
  url?: string;
}

export function baseConfig(p: TemplateBase, defaultTheme: ThemeName): Omit<VideoConfig, 'scenes'> {
  return {
    id: p.id,
    brand: p.brand,
    theme: p.theme ?? defaultTheme,
    themeOverrides: p.themeOverrides,
    format: p.format,
    duration: p.duration,
    transition: p.transition,
    audio: p.audio,
  };
}

/** Buang nilai falsy dari daftar scene (untuk scene opsional). */
export function compact<T>(list: (T | false | null | undefined)[]): T[] {
  return list.filter(Boolean) as T[];
}
