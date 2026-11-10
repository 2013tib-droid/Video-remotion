import type { CameraSetting, FormatName, IconStyle, MotionEnergy, TransitionName } from '../config';
import type { ThemeName, ThemeOverrides } from '../themes';
import type { SceneConfig } from '../scenes/types';
import type { NarrationData, VoiceSettings } from './narration';

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
  /**
   * Gerak sepanjang scene untuk seluruh video. Default dari tema;
   * video dengan `overlay` (explainer) otomatis `energy: 'calm'`.
   * `icons`: `line` (default) = emoji dikenal jadi ikon garis yang tergambar; `emoji` = emoji asli.
   */
  motion?: { energy?: MotionEnergy; camera?: CameraSetting; exit?: boolean; icons?: IconStyle };
  /** Musik latar opsional (path di public/). */
  audio?: { src: string; volume?: number };
  /** Suara narasi (Azure). Wajib bila ada scene dengan `narration`. */
  voice?: VoiceSettings;
  /** Hasil `npm run narasi` — impor dari `<config>.narration.json`. */
  narration?: NarrationData;
  /** Lapisan tetap gaya explainer (header bab, HUD, subtitle). */
  overlay?: OverlayConfig;
  scenes: SceneConfig[];
}

/** Lapisan tetap di atas semua scene (gaya video explainer). */
export interface OverlayConfig {
  /** Widget status kanan atas, mis. { label: "TIU 7/20", timer: "00:18:42" }. */
  hud?: {
    label?: string;
    /** Timer awal "HH:MM:SS"; berjalan mundur sepanjang video. */
    timer?: string;
  };
  /** Tampilkan nama/logo brand di HUD. Default true. */
  brand?: boolean;
  /** Subtitle per kata dari narasi. Default true. */
  captions?: boolean;
}
