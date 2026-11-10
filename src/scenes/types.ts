/**
 * ============================================================
 *  KONTRAK SCENE — satu-satunya file yang perlu dibaca untuk
 *  membuat video baru. Semua scene murni data (JSON-serializable).
 * ============================================================
 */
import type { CameraSetting, HighlightStyle, TextAnimation, TransitionName } from '../config';
import type { BackgroundKind } from '../themes';
import type { ChartDatum } from '../components/ChartAnimation';
import type { ComparisonRow } from '../components/ComparisonTable';
import type { KPI } from '../components/DashboardMockup';
import type { Feature } from '../components/FeatureCard';
import type { NotificationData } from '../components/NotificationPopup';
import type { TimelineStep } from '../components/TimelineAnimation';
import type { ListItem } from '../components/screens/ListScreen';

export type { ChartDatum, ComparisonRow, KPI, Feature, NotificationData, TimelineStep, ListItem };

/** Properti yang dimiliki semua scene. */
export interface SceneBase {
  /** Durasi scene (detik). Default per tipe ada di config/scenes.ts. */
  duration?: number;
  /** Transisi MASUK ke scene ini. Default dari tema. */
  transition?: TransitionName;
  /** Override background untuk scene ini. */
  background?: BackgroundKind;
  /** Gerak kamera pelan sepanjang scene. Default `auto` (bergiliran zoom/geser). */
  camera?: CameraSetting;
  /** Elemen keluar bergiliran di akhir scene. Default true (scene terakhir tidak keluar). */
  exit?: boolean;
  /** Teks narasi (voice-over). Durasi scene otomatis mengikuti panjang suara. */
  narration?: string;
  /** Kata/frasa narasi yang disorot di subtitle. */
  emphasis?: string[];
  /** Header bab di lapisan explainer (kiri atas). */
  chapter?: { label?: string; title: string; highlight?: string };
  /** Gaya muncul kata judul: rise | pop | blur | typewriter | slam. Default dari tema. */
  textAnimation?: TextAnimation;
  /**
   * Aksen kata sorotan (highlight & emphasis di judul). Default `mix`:
   * punch + coretan bergiliran marker → underline → circle. Lainnya: marker | underline | circle | punch | none.
   */
  highlightStyle?: HighlightStyle;
}

/**
 * Waktu sebuah aksi: detik dari awal scene, atau kata di narasi scene ini
 * ("higrometer", frasa "arah angin", atau kemunculan ke-n "angin#2").
 */
export type Cue = string | number;

/** Judul standar scene (dipakai banyak scene). */
export interface SceneHeading {
  eyebrow?: string;
  title?: string;
  /** Kata dalam title yang diberi gradien. */
  highlight?: string;
  subtitle?: string;
}

/** Isi layar perangkat pada scene `device`. */
export type ScreenConfig =
  | { kind: 'image'; src: string }
  | { kind: 'receipt'; title?: string; store: string; items: { name: string; price: number }[]; currency?: string; scanning?: boolean }
  | { kind: 'qr'; title?: string; merchant: string; amount?: string; caption?: string }
  | { kind: 'list'; title?: string; items: ListItem[] }
  | { kind: 'quiz'; title?: string; question: string; options: string[]; correct: number; reward?: string }
  | { kind: 'dashboard'; title?: string; kpis: KPI[]; chart?: ChartDatum[] };

/** Logo besar + nama + tagline. */
export interface LogoScene extends SceneBase {
  type: 'logo';
  /** Default: brand.logo */
  logo?: string;
  /** Default: brand.name */
  name?: string;
  tagline?: string;
}

/** Judul besar pembuka. */
export interface HeroScene extends SceneBase, SceneHeading {
  type: 'hero';
  title: string;
  /** Label tombol opsional di bawah judul. */
  button?: string;
}

/** Karakter maskot + balon ucapan. */
export interface MascotScene extends SceneBase, SceneHeading {
  type: 'mascot';
  /** Emoji atau path gambar. */
  mascot: string;
  speech?: string;
  /** Nama maskot (ditampilkan sebagai pill). */
  name?: string;
}

/** Daftar/grid fitur. */
export interface FeaturesScene extends SceneBase, SceneHeading {
  type: 'features';
  features: Feature[];
  columns?: number;
}

/** Angka-angka statistik yang menghitung naik. */
export interface StatsScene extends SceneBase, SceneHeading {
  type: 'stats';
  stats: { value: number; prefix?: string; suffix?: string; decimals?: number; label: string }[];
}

/** Grafik batang. */
export interface ChartScene extends SceneBase, SceneHeading {
  type: 'chart';
  data: ChartDatum[];
  /** Index batang yang disorot. */
  highlightBar?: number;
  highlightLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/** Tabel perbandingan ✓/✕. */
export interface ComparisonScene extends SceneBase, SceneHeading {
  type: 'comparison';
  columns: string[];
  rows: ComparisonRow[];
  highlightColumn?: number;
}

/** Langkah-langkah berurutan. */
export interface TimelineScene extends SceneBase, SceneHeading {
  type: 'timeline';
  steps: TimelineStep[];
}

/** Mockup perangkat (ponsel/browser) + layar + notifikasi. */
export interface DeviceScene extends SceneBase, SceneHeading {
  type: 'device';
  /** Default: phone (atau browser bila screen.kind = dashboard). */
  device?: 'phone' | 'browser';
  screen: ScreenConfig;
  /** Poin singkat di samping/bawah judul. */
  bullets?: string[];
  /** Notifikasi yang muncul berurutan di atas perangkat. */
  notifications?: NotificationData[];
  /** URL di address bar (browser). */
  url?: string;
}

/** Perhitungan: baris-baris nilai lalu total besar (hemat, ROI, harga). */
export interface CalculationScene extends SceneBase, SceneHeading {
  type: 'calculation';
  lines: { label: string; value: number; /** Tampilkan sebagai pengurang (−). */ negative?: boolean }[];
  total: { label: string; value: number };
  prefix?: string;
  suffix?: string;
  /** Badge di bawah total, mis. "Hemat 22%". */
  note?: string;
}

/** Testimoni + badge kepercayaan. */
export interface TestimonialScene extends SceneBase, SceneHeading {
  type: 'testimonial';
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  badges?: string[];
}

/** Penutup ajakan bertindak. */
export interface CTAScene extends SceneBase, SceneHeading {
  type: 'cta';
  title: string;
  button: string;
  /** Default: brand.url */
  url?: string;
  /** Badge di bawah tombol, mis. "App Store", "Google Play". */
  badges?: string[];
  /** Tampilkan logo brand di atas. Default true. */
  showLogo?: boolean;
}

/** Kartu soal pilihan ganda dengan aksi berurutan (pilih, salah, coret, benar). */
export interface QuestionScene extends SceneBase {
  type: 'question';
  /** Label kecil di atas soal, mis. "Soal 7". */
  label?: string;
  question: string;
  options: string[];
  /** Lingkaran hitung mundur (detik) di pojok kartu. */
  countdown?: number;
  /** Waktu mulai hitung mundur. Default 0.6 dtk. */
  countdownAt?: Cue;
  /** Keadaan awal (lanjutan dari scene sebelumnya). */
  initial?: { struck?: number[]; wrong?: number[]; correct?: number; notes?: Record<number, string> };
  /** Aksi berurutan; `at` = detik atau kata narasi. */
  steps?: {
    action: 'select' | 'wrong' | 'strike' | 'correct';
    option: number;
    /** Catatan kecil di sisi pilihan, mis. nama alat. */
    note?: string;
    at?: Cue;
  }[];
  /** Animasi masuk. Matikan untuk scene lanjutan agar kartu terlihat sama. Default true. */
  enter?: boolean;
}

/** Hubungan "A —kata kerja→ B" (analogi, sebab-akibat), plus chip rumus. */
export interface RelationScene extends SceneBase, SceneHeading {
  type: 'relation';
  rows: { left: string; verb: string; right: string; at?: Cue }[];
  /** Chip rumus di bawah, mis. "ALAT : YANG DIUKUR". */
  formula?: string;
  formulaAt?: Cue;
}

/** Teks besar ala Reels/TikTok: frasa bertumpuk (`stack`) atau berganti memenuhi layar (`replace`). */
export interface StatementScene extends SceneBase {
  type: 'statement';
  /** Ukuran font otomatis menyesuaikan panjang teks. `at` = detik atau kata narasi. */
  lines: { text: string; /** Kata/frasa yang disorot (aksen). */ highlight?: string; at?: Cue }[];
  /** Default `stack`. */
  style?: 'stack' | 'replace';
}

export type SceneConfig =
  | LogoScene
  | HeroScene
  | MascotScene
  | FeaturesScene
  | StatsScene
  | ChartScene
  | ComparisonScene
  | TimelineScene
  | DeviceScene
  | CalculationScene
  | TestimonialScene
  | CTAScene
  | QuestionScene
  | RelationScene
  | StatementScene;

export type SceneType = SceneConfig['type'];
