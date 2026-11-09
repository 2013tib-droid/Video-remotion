import type { FormatName, TransitionName } from '../config';
import type { ThemeName, ThemeOverrides } from '../themes';
import type { SceneConfig } from '../scenes/types';

export interface Brand {
  name: string;
  /** Path di public/ (mis. "brands/priceatlas/logo.svg"), URL, atau emoji. */
  logo?: string;
  url?: string;
}

/**
 * Konfigurasi satu video. Ini SATU-SATUNYA hal yang ditulis untuk video baru.
 */
export interface VideoConfig {
  /** ID komposisi Remotion (huruf, angka, tanda -). Dipakai saat render. */
  id: string;
  brand: Brand;
  theme: ThemeName;
  /** Override sebagian token tema, mis. { colors: { primary: '#ff0066' } }. */
  themeOverrides?: ThemeOverrides;
  /** Default: vertical (9:16). */
  format?: FormatName;
  fps?: number;
  /**
   * Durasi total target (detik). Bila diisi, durasi scene diskalakan
   * proporsional agar total pas. Bila kosong, total = jumlah durasi scene.
   */
  duration?: number;
  /** Transisi default antar scene. Default: dari tema. */
  transition?: TransitionName;
  /** Musik latar opsional (path di public/). */
  audio?: { src: string; volume?: number };
  scenes: SceneConfig[];
}
