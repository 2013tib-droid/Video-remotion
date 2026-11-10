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
  /** `false` = scene ini tanpa efek suara elemen (pop/ting/tick). Whoosh transisi diatur config `sfx`. */
  sfx?: boolean;
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
  /**
   * Ilustrasi beranimasi di atas judul: emoji / `line:<nama>` (ikon garis tergambar),
   * `draw:<file.svg>` (SVG tergambar), atau file Lottie `.json`.
   */
  illustration?: string;
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

/**
 * Teks besar SATU KATA (atau frasa pendek) per ketukan, memenuhi layar — gaya Reels/iklan.
 * Bila scene bernarasi, tiap kata muncul tepat saat diucapkan.
 */
export interface WordsScene extends SceneBase {
  type: 'words';
  /** Kalimat (dipecah per kata) atau daftar kata/frasa pendek. */
  words: string | (string | { text: string; /** Disorot (gradien/latar berkedip). */ highlight?: boolean; at?: Cue })[];
  /** Kata yang disorot (bila `words` berupa kalimat). */
  accent?: string[];
  /** Detik per kata. Default: durasi scene dibagi rata (min 0,35 dtk), atau mengikuti narasi. */
  interval?: number;
  /** Latar berkedip warna brand saat kata sorotan muncul. Default true. */
  flash?: boolean;
  /** Teks kecil tetap di bawah (sumber, handle, CTA singkat). */
  caption?: string;
}

/** Gerak kamera pada foto/video b-roll (efek Ken Burns). */
export type BrollMove = 'auto' | 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'panDown' | 'none';

export interface BrollShot {
  /** Foto (jpg/png/webp) atau video (mp4/webm/mov) di public/ atau URL. */
  src: string;
  /** Default: dari scene, `auto` = bergiliran per shot. */
  move?: BrollMove;
  /** Titik fokus zoom [x, y] 0..1 (mis. [0.5, 0.3] = wajah di atas tengah). Default tengah. */
  focus?: [number, number];
  /** Label kecil kiri bawah, mis. "📍 Pasar Beringharjo". */
  caption?: string;
  /** Durasi shot (detik). Default: durasi scene dibagi rata. */
  duration?: number;
  /** Video: mulai dari detik ke-. */
  startFrom?: number;
}

/** Foto/video b-roll layar penuh dengan gerak kamera, scrim, dan judul di atasnya. */
export interface BrollScene extends SceneBase, SceneHeading {
  type: 'broll';
  /** Satu media (singkat untuk `shots: [{ src }]`). */
  src?: string;
  /** Beberapa shot berurutan (montase, crossfade antar shot). */
  shots?: BrollShot[];
  /** Gerak kamera default semua shot. Default `auto`. */
  move?: BrollMove;
  /** Posisi judul. Default `bottom`. */
  textPosition?: 'top' | 'center' | 'bottom';
  /** Kegelapan scrim di belakang teks 0..1. Default 0.6. */
  dim?: number;
  /** Volume suara asli video 0..1. Default 0 (senyap). */
  volume?: number;
}

/** Wilayah peta bawaan, atau bbox `[bujurBarat, lintangSelatan, bujurTimur, lintangUtara]`. */
export type MapRegion =
  | 'world'
  | 'asia'
  | 'asean'
  | 'indonesia'
  | 'sumatra'
  | 'jawa'
  | 'kalimantan'
  | 'sulawesi'
  | 'bali-nusra'
  | 'maluku'
  | 'papua'
  | [number, number, number, number];

export interface MapPoint {
  /** Nama kota bawaan (lihat MAP_PLACES di docs), mis. "Jakarta". Atau isi `lat`/`lon`. */
  place?: string;
  lat?: number;
  lon?: number;
  /** Label pin. Default: nama `place`. */
  label?: string;
  /** Angka/keterangan di bawah label, mis. "Rp 12,4 T" atau "+5,2%". */
  value?: string;
  /** Emoji/ikon di dalam pin (default titik). */
  icon?: string;
  /** Waktu jatuh pin (detik atau kata narasi). Default bergiliran. */
  at?: Cue;
}

/** Peta beranimasi: peta tergambar, kamera terbang ke area, pin jatuh, rute tergambar. */
export interface MapScene extends SceneBase, SceneHeading {
  type: 'map';
  /** Area awal. Default `indonesia` (atau `world` bila ada titik di luar Asia Tenggara). */
  region?: MapRegion;
  points?: MapPoint[];
  /** Garis rute melengkung antar titik (indeks `points`), tergambar + titik berjalan. */
  routes?: { from: number; to: number; at?: Cue }[];
  /** Negara yang diwarnai (nama Inggris Natural Earth, mis. "Indonesia", "Malaysia"). */
  countries?: string[];
  /** Kamera terbang dari `region` ke area pin. Default true bila ada pin. */
  zoomToPoints?: boolean;
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
  | StatementScene
  | WordsScene
  | BrollScene
  | MapScene;

export type SceneType = SceneConfig['type'];
