import type { CameraSetting, FormatName, IconStyle, MotionEnergy, MusicSetting, SfxSetting, TransitionName } from '../config';
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
  /**
   * Efek suara: whoosh saat transisi, pop saat kartu/ikon/badge muncul, "ting" saat angka
   * selesai menghitung, tick per kata (scene `words`), dentum pin (scene `map`).
   * Default aktif. `false` = senyap; `{ volume: 0.6, transitions: false }` = atur sebagian.
   * Video bernarasi otomatis dikecilkan (SFX_NARRATION_DUCK).
   */
  sfx?: SfxSetting;
  /**
   * Musik latar opsional: trek bawaan `'tenang'` · `'semangat'` · `'korporat'` (loop mulus), atau
   * `{ src: 'brands/x/musik.mp3', volume?, loop?, fadeIn?, fadeOut? }`. Memudar masuk/keluar otomatis;
   * video bernarasi otomatis dikecilkan (MUSIC_NARRATION_DUCK).
   */
  audio?: MusicSetting;
  /**
   * Watermark brand kecil yang tetap di pojok sepanjang video. `true` = logo + nama brand,
   * string = teks sendiri (mis. `'@harian.id'`), atau objek opsi. Default mati.
   */
  watermark?: WatermarkSetting;
  /** Suara narasi (Azure). Wajib bila ada scene dengan `narration`. */
  voice?: VoiceSettings;
  /** Hasil `npm run narasi` — impor dari `<config>.narration.json`. */
  narration?: NarrationData;
  /** Lapisan tetap gaya explainer (header bab, HUD, subtitle). */
  overlay?: OverlayConfig;
  scenes: SceneConfig[];
}

export type WatermarkPosition = 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right';

export interface WatermarkOptions {
  /** Teks watermark. Default: nama brand. */
  text?: string;
  /** Tampilkan logo brand di samping teks. Default true. */
  logo?: boolean;
  /** Default `top-right`; video dengan `overlay` (HUD di atas) → `bottom`. */
  position?: WatermarkPosition;
  /** 0–1. Default 0,72. */
  opacity?: number;
  /** Tetap tampil di scene penutup `cta`. Default false (brand sudah tampil besar di sana). */
  outro?: boolean;
}
export type WatermarkSetting = boolean | string | WatermarkOptions;

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
