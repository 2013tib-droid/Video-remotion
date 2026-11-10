import type { CameraSetting, EntrancePreset, MotionEnergy, SpringPreset, StaggerName, TextAnimation, TransitionName } from '../config';

export type BackgroundKind = 'gradient' | 'particles' | 'pattern' | 'solid';

/**
 * Kontrak tema. Identitas brand = satu objek Theme.
 * Komponen TIDAK boleh memakai warna/font hardcoded — selalu dari sini.
 */
export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    /** Warna teks di atas warna primary (tombol, badge). */
    onPrimary: string;
    muted: string;
    border: string;
    success: string;
    danger: string;
  };
  /** Gradien teks/tombol hero, CSS linear-gradient lengkap. */
  gradient: string;
  fonts: { heading: string; body: string; mono: string };
  fontWeights: { heading: number; body: number; strong: number };
  /** Angka lebar-tetap (tabular) agar counter tidak bergoyang. Matikan untuk font serif. */
  tabularNumbers: boolean;
  /** Letter-spacing heading dalam em (Apple style = negatif). */
  headingTracking: number;
  /** Radius (px basis 1080). */
  radius: { sm: number; md: number; lg: number; pill: number };
  shadow: { card: string; elevated: string };
  /** Kepribadian gerak tema. */
  motion: {
    spring: SpringPreset;
    entrance: EntrancePreset;
    stagger: StaggerName;
    transition: TransitionName;
    /** Seberapa banyak gerak sepanjang scene (kamera, idle, keluar). Default `normal`. */
    energy?: MotionEnergy;
    /** Kamera default. Default `auto`. */
    camera?: CameraSetting;
    /** Gaya muncul kata pada judul (tipografi kinetik). Default `rise`. */
    text?: TextAnimation;
  };
  background: {
    kind: BackgroundKind;
    /** Intensitas efek background 0..1 */
    intensity: number;
  };
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** Override sebagian tema dari config video (mis. ganti warna brand saja). */
export type ThemeOverrides = DeepPartial<Theme>;
