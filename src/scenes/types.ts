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

/** Titik/ukuran 3D dalam meter: [x (kanan), y (atas), z (ke arah penonton)]. */
export type Vec3 = [number, number, number];

/** Warna objek 3D: hex (`#c8ccd4`) atau token tema (`primary`, `accent`, `surface`, `muted`, `text`, `success`, `danger`, ...). */
export type WorldColor = string;

/**
 * Gerak/perubahan sebuah objek 3D.
 * - `spin` berputar terus (opsional mulai `at`, berhenti `stopAt`) · `bob` naik-turun pelan.
 * - `move` / `turn` / `scale` / `fade` / `color`: berubah ke nilai `to` saat cue `at` (berurutan bila lebih dari satu).
 */
export type WorldMotion =
  | { type: 'spin'; axis?: 'x' | 'y' | 'z'; /** Putaran per detik. Default 0,5. */ speed?: number; at?: Cue; stopAt?: Cue }
  | { type: 'bob'; /** Meter. Default 0,08. */ amount?: number; /** Detik. Default 2,4. */ period?: number }
  | { type: 'move'; to: Vec3; at: Cue; duration?: number }
  | { type: 'turn'; /** Derajat. */ to: Vec3; at: Cue; duration?: number }
  | { type: 'scale'; to: number; at: Cue; duration?: number }
  | { type: 'fade'; /** Opasitas 0..1. */ to: number; at: Cue; duration?: number }
  | { type: 'color'; to: WorldColor; at: Cue; duration?: number };

interface WorldObjectBase {
  /** Nama objek — dipakai `shots[].target`, `shots[].xray`, `labels[].target`. */
  id?: string;
  /** Posisi (meter) relatif induknya. Default [0, 0, 0]. */
  pos?: Vec3;
  /** Rotasi (derajat) sumbu x, y, z. */
  rotate?: Vec3;
  scale?: number | Vec3;
  color?: WorldColor;
  /** 0..1. Default 1. */
  opacity?: number;
  /** Objek belum tampil (sampai diberi `showAt` / dimunculkan template `bedah3D`). */
  hidden?: boolean;
  /** Objek baru muncul (membesar memantul) saat cue ini. */
  showAt?: Cue;
  /** Objek menghilang saat cue ini. */
  hideAt?: Cue;
  motion?: WorldMotion[];
  /** Objek anak: ikut posisi/rotasi/skala induk (mis. mesin di dalam mobil). */
  children?: WorldObject[];
}

/**
 * Objek di dunia 3D. Bentuk dasar (`box`, `cylinder`, `sphere`, `cone`, `torus`, `tube`), bagian mesin
 * (`gear`, `fan`, `flow` = butiran mengalir sepanjang jalur) dan objek jadi berukuran nyata
 * (`car` ±4,4 m menghadap +z, `road` memanjang sumbu z, `trafficLight`, `building`, `house`, `tree`, `person`, `coins`).
 */
export type WorldObject = WorldObjectBase &
  (
    | { shape: 'group' }
    | { shape: 'box'; size: Vec3; /** Jari-jari sudut membulat (m). Default otomatis kecil; 0 = tajam. */ round?: number }
    | { shape: 'cylinder'; radius: number; height: number; /** Jari-jari atas (kerucut terpancung). */ radiusTop?: number; /** Arah sumbu. Default y. */ axis?: 'x' | 'y' | 'z' }
    | { shape: 'sphere'; radius: number }
    | { shape: 'cone'; radius: number; height: number; axis?: 'x' | 'y' | 'z' }
    | { shape: 'torus'; radius: number; tube: number; /** Derajat busur. Default 360. */ arc?: number; axis?: 'x' | 'y' | 'z' }
    | { shape: 'tube'; path: Vec3[]; radius?: number; closed?: boolean }
    | { shape: 'gear'; radius: number; teeth?: number; thickness?: number; axis?: 'x' | 'y' | 'z' }
    | { shape: 'fan'; radius: number; blades?: number; axis?: 'x' | 'y' | 'z' }
    | { shape: 'flow'; path: Vec3[]; /** Jumlah butiran. Default 10. */ count?: number; /** Putaran jalur per detik. Default 0,25. */ speed?: number; /** Jari-jari butiran. */ size?: number; closed?: boolean; at?: Cue; stopAt?: Cue }
    | { shape: 'car'; variant?: 'suv' | 'sedan'; /** Lampu rem menyala. */ brake?: boolean }
    | { shape: 'road'; length: number; lanes?: number; /** Lebar satu lajur (m). Default 3,4. */ laneWidth?: number; /** Trotoar bergaris di tepi. Default true. */ curb?: boolean }
    | { shape: 'trafficLight'; light?: 'red' | 'yellow' | 'green'; changes?: { to: 'red' | 'yellow' | 'green'; at: Cue }[] }
    | { shape: 'building'; size: Vec3 }
    | { shape: 'house' }
    | { shape: 'tree' }
    | { shape: 'person' }
    | { shape: 'coins'; count?: number }
    | {
        /** Model 3D `.glb` (glTF biner) di `public/`, mis. `models/car-concept.glb`. Draco/KTX2 tidak didukung. */
        shape: 'model';
        src: string;
        /** Panjang sisi terpanjang setelah diskalakan (meter), mis. mobil 4.5. Default: satuan asli model. */
        size?: number;
        /** `false` = pakai titik asal model apa adanya. Default: tengah model di x/z, alas di y = 0. */
        ground?: boolean;
        /** Atur bagian model (nama dari `npm run model -- <file.glb>`): warnai, sembunyikan, buka kap, putar roda. */
        parts?: WorldModelPart[];
      }
  );

/**
 * Pengaturan satu/sekelompok bagian model `.glb`. Cocokkan lewat `name` (nama node; anak-anaknya ikut) dan/atau
 * `material` (nama material). `*` = bebas, mis. `'Wheel*'`, `'Paint 1*'`. Entri belakang menimpa entri depan.
 */
export interface WorldModelPart {
  name?: string;
  material?: string;
  color?: WorldColor;
  /** 0..1. */
  opacity?: number;
  hidden?: boolean;
  /** Tetap utuh saat model ini di-`xray` (mis. mesin di balik bodi). */
  solid?: boolean;
  /**
   * Gerak bagian (hanya untuk `name`): `turn`/`move`/`scale` relatif posisi aslinya dalam satuan model
   * (mis. kap terbuka: `{ type: 'turn', to: [-50, 0, 0], at: 'kap' }`), `spin`, `fade`, `color`.
   */
  motion?: WorldMotion[];
}

/** Sudut pandang kamera 3D (mengorbit `target`). */
export interface WorldView {
  /** Titik yang dilihat: id objek (mengikuti objek bergerak) atau koordinat. */
  target: string | Vec3;
  /** Jarak kamera ke target (meter). */
  distance: number;
  /** Derajat mengelilingi target: 0 = dari depan (+z), 90 = dari kanan (+x). Default 35. */
  azimuth?: number;
  /** Derajat di atas horizon. Default 28. */
  elevation?: number;
  /** Sudut lensa (derajat). Default 32. */
  fov?: number;
}

/** Satu posisi kamera di scene `world`. Shot pertama = posisi awal; berikutnya kamera TERBANG ke sana saat `at`. */
export interface WorldShot extends Partial<WorldView> {
  /** Nama sudut pandang di `views` (bagian lain shot menimpanya). */
  view?: string;
  at?: Cue;
  /** Lama terbang (detik). Default 1,2. */
  duration?: number;
  /** Kamera tetap berayun mengorbit pelan (derajat total, bersambung lintas scene). Default 7; 0 = diam. */
  drift?: number;
  /** id objek yang dibuat tembus pandang selama shot ini (melihat isi di dalamnya). */
  xray?: string[];
}

/** Label yang menempel pada objek 3D (garis penunjuk + pil teks). */
export interface WorldLabel {
  target: string | Vec3;
  text: string;
  color?: WorldColor;
  at?: Cue;
  hideAt?: Cue;
  /** Sisi pil terhadap titik. Default otomatis. */
  side?: 'left' | 'right';
}

/** Kartu keterangan/sumber di atas dunia 3D. */
export interface WorldCard {
  /** Gaya kartu: `catatan` (default, putih), `kutipan` (kutipan + sumber, kata `sorot` bertanda kuning), `putusan` (kuning besar). */
  gaya?: 'catatan' | 'kutipan' | 'putusan';
  /** Kata/frasa di `text` yang disorot kuning. */
  sorot?: string[];
  /** Teks besar di kiri (mis. tahun "2023" atau angka). */
  tag?: string;
  text: string;
  /** Sumber kecil di bawah teks. */
  source?: string;
  /** Daftar putusan di bawah teks: `ok: true` = ✓ hijau, `false` = ✕ merah, kosong = titik. Muncul bergiliran (atau saat `at`). */
  points?: { text: string; ok?: boolean; at?: Cue }[];
  color?: WorldColor;
  at?: Cue;
  hideAt?: Cue;
}

/** Jenis bukti sebuah angka — menentukan warna lencana sumber: data pihak lain, ilustrasi, atau hitungan/asumsi sendiri. */
export type WorldSourceTone = 'data' | 'ilustrasi' | 'hitungan';

/**
 * Strip data di bawah judul: angka/teks huruf mesin tik di kiri + lencana sumber di kanan
 * (mis. `8.000 km` · `PABRIKAN BUSI`). `value` + `to` = angka menghitung (odometer) saat `at`.
 */
export interface WorldReadout {
  /** Teks tetap (mis. "celah busi 0,8–0,9 mm"). Diabaikan bila `value` diisi. */
  text?: string;
  value?: number;
  /** Angka akhir: menghitung dari `value` ke `to` mulai `at`. */
  to?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Lencana sumber di kanan, mis. "Pabrikan busi", "Uji dyno · 2023", "Ilustrasi · dipercepat". */
  source?: string;
  /** Warna lencana. Default `data`. */
  tone?: WorldSourceTone;
  /** Kapan angka mulai menghitung. Default awal scene. */
  at?: Cue;
  /** Lama menghitung (detik). Default sampai ±akhir scene. */
  duration?: number;
}

/** Satu baris panel layar: label (+ lencana kecil) di kiri, angka (bisa menghitung) di kanan. */
export interface WorldPanelRow {
  label: string;
  /** Lencana kecil di samping label, mis. "RON 90". */
  tag?: string;
  /** Titik warna di depan label (mis. hijau = pilihan A). */
  dot?: WorldColor;
  value?: number;
  /** Angka akhir: menghitung dari `value` ke `to` saat `at`. */
  to?: number;
  /** Teks tetap di kanan (dipakai bila `value` kosong). */
  text?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  at?: Cue;
  duration?: number;
  /** Baris baru muncul saat cue ini (mis. "SELISIH"). */
  showAt?: Cue;
  /** Warna angka. Default putih. */
  color?: WorldColor;
}

/** Panel gelap gaya layar mesin (pompa bensin, meteran): judul kecil + baris angka mesin tik + catatan. */
export interface WorldPanel {
  title?: string;
  rows: WorldPanelRow[];
  note?: string;
  at?: Cue;
  hideAt?: Cue;
}

/** Satu batang ukur. `value`/`to` dalam satuan `max` panelnya. */
export interface WorldMeterRow {
  label: string;
  value: number;
  /** Nilai akhir: batang bergerak dari `value` ke `to` saat `at`. */
  to?: number;
  at?: Cue;
  /** Lama batang bergerak (detik). Default 0,9. */
  duration?: number;
  /** Nilai tertulis di kanan batang, mis. "5,64 L". */
  text?: string;
  color?: WorldColor;
  /** Baris baru muncul saat cue ini (mis. pembanding yang disebut belakangan). */
  showAt?: Cue;
}

/** Panel batang ukur (HUD) di bawah judul: satu besaran yang naik-turun, atau 2–3 batang pembanding. */
export interface WorldMeter {
  /** Judul kecil panel, mis. "Tegangan yang dibutuhkan". */
  title?: string;
  /** Lencana jenis bukti di samping judul, mis. "Ilustrasi". */
  tag?: string;
  tone?: WorldSourceTone;
  /** Nilai batang penuh. Default 1. */
  max?: number;
  rows: WorldMeterRow[];
  /** Keterangan kecil di bawah batang, mis. "per 100 km · kata pabrik, bukan tes kami". */
  note?: string;
  at?: Cue;
  hideAt?: Cue;
}

/** Penanda ukuran antara dua titik 3D (garis berujung + teks), mis. celah "0,8 mm". */
export interface WorldMeasure {
  from: string | Vec3;
  to: string | Vec3;
  text: string;
  color?: WorldColor;
  at?: Cue;
  hideAt?: Cue;
}

/** Cap putusan: satu–dua kata besar miring yang menghentak masuk (mis. "IMPAS", "MITOS"). */
export interface WorldStamp {
  text: string;
  /** Menempel di objek/titik 3D. Default tengah layar. */
  target?: string | Vec3;
  color?: WorldColor;
  /** Kemiringan (derajat). Default -6. */
  rotate?: number;
  at?: Cue;
  hideAt?: Cue;
}

/**
 * Dunia 3D: objek nyata (mobil, jalan, gedung, mesin) dengan kamera yang terbang antar sudut pandang,
 * tembus pandang ke dalam objek, bagian bergerak, dan label yang menempel. Untuk satu dunia yang
 * bersambung lintas scene: simpan `objects` + `views` di satu konstanta, pakai di tiap scene dengan
 * `transition: 'none'`, dan mulai tiap scene dari `view` terakhir scene sebelumnya.
 */
export interface WorldScene extends SceneBase, SceneHeading {
  type: 'world';
  objects: WorldObject[];
  /** Sudut pandang bernama untuk dipakai `shots[].view`. */
  views?: Record<string, WorldView>;
  shots: WorldShot[];
  labels?: WorldLabel[];
  cards?: WorldCard[];
  /** Strip data di bawah judul: angka (bisa menghitung) + lencana sumber. */
  readout?: WorldReadout;
  /** Panel batang ukur (HUD). */
  meters?: WorldMeter[];
  /** Panel gelap gaya layar mesin. */
  panel?: WorldPanel;
  /** Penanda ukuran antara dua titik 3D. */
  measures?: WorldMeasure[];
  /** Cap putusan besar. */
  stamp?: WorldStamp;
  /** Lantai: `true` (default, warna tema), `false`, atau warna. */
  ground?: boolean | WorldColor;
  /** Warna langit/latar. Default background tema. */
  sky?: WorldColor;
  /** Catatan kecil di bawah (mis. "Ilustrasi · bukan skala"). */
  note?: string;
}


/** Titik 2D di gambar irisan (satuan kanvas `size`, default 1000 × 1000; y ke bawah). */
export type Vec2 = [number, number];

/**
 * Bahan bagian irisan → warna + tekstur otomatis (aksir/titik) + garis tepi lebih gelap.
 * `magma` menyala; `air` sedikit tembus.
 */
export type IrisanBahan = 'batu' | 'tanah' | 'pasir' | 'magma' | 'air' | 'logam' | 'beton' | 'abu' | 'udara' | 'kayu' | 'karet' | 'rumput';

/** Gerak bagian irisan. `move` relatif posisi asal; `turn`/`scale` berporos di `origin` bagian. */
export type IrisanMotion =
  | { type: 'move'; to: Vec2; at: Cue; duration?: number }
  | { type: 'turn'; /** Derajat. */ to: number; at: Cue; duration?: number }
  | { type: 'scale'; to: number | Vec2; at: Cue; duration?: number }
  | { type: 'fade'; to: number; at: Cue; duration?: number }
  | { type: 'color'; to: WorldColor; at: Cue; duration?: number }
  | { type: 'bob'; /** Satuan kanvas. Default 6. */ amount?: number; /** Detik. Default 2. */ period?: number }
  | { type: 'spin'; /** Putaran per detik. Default 1. */ speed?: number; at?: Cue; stopAt?: Cue }
  | { type: 'shake'; /** Satuan kanvas. Default 8. */ amount?: number; at?: Cue; stopAt?: Cue };

interface IrisanPartBase {
  id?: string;
  /** Geser seluruh bagian (satuan kanvas). */
  pos?: Vec2;
  /** Poros `turn`/`scale` dan titik tempel label. Default tengah bagian. */
  origin?: Vec2;
  bahan?: IrisanBahan;
  /** Warna isi (hex/token tema). Menimpa warna `bahan`. */
  fill?: WorldColor;
  /** Warna garis tepi; `false` = tanpa garis. Default isi yang digelapkan. */
  stroke?: WorldColor | false;
  strokeWidth?: number;
  /** Tekstur aksir: `true` (garis miring), `'titik'`, `false`. Default dari `bahan`. */
  hatch?: boolean | 'titik';
  opacity?: number;
  /** Menyala (lampu, magma, api). */
  glow?: boolean;
  hidden?: boolean;
  showAt?: Cue;
  hideAt?: Cue;
  motion?: IrisanMotion[];
}

/** Bagian gambar irisan teknis (cutaway 2D). */
export type IrisanPart = IrisanPartBase &
  (
    | { shape: 'rect'; x: number; y: number; w: number; h: number; /** Radius sudut. */ r?: number }
    | { shape: 'circle'; x: number; y: number; r: number }
    | { shape: 'ellipse'; x: number; y: number; rx: number; ry: number }
    | { shape: 'poly'; points: Vec2[]; /** Sudut dihaluskan (lekuk alami: gunung, batu). */ smooth?: boolean; /** `false` = garis terbuka (kabel, pipa). */ closed?: boolean }
    | { shape: 'path'; /** Data path SVG. */ d: string }
    | {
        /** Permukaan air bergelombang: area dari garis gelombang `y` sampai `y + h`. */
        shape: 'wave';
        x: number;
        y: number;
        w: number;
        h: number;
        /** Tinggi gelombang. Default 10. */ amp?: number;
        /** Panjang satu gelombang. Default 160. */ length?: number;
        /** Kecepatan geser (gelombang/detik). Default 0,4. */ speed?: number;
      }
    | { shape: 'flow'; path: Vec2[]; /** Jumlah butiran. Default 10. */ count?: number; size?: number; /** Putaran jalur per detik. Default 0,3. */ speed?: number; closed?: boolean; at?: Cue; stopAt?: Cue }
    | { shape: 'group'; children: IrisanPart[] }
  );

/** Posisi "kamera" irisan: titik tengah + perbesaran; berikutnya bergeser halus saat `at`. */
export interface IrisanShot {
  center?: Vec2;
  /** 1 = seluruh kanvas. Default 1. */
  zoom?: number;
  at?: Cue;
  duration?: number;
}

/** Label irisan: pil + garis penunjuk ke bagian (`id`) atau titik [x, y]. */
export interface IrisanLabel {
  target: string | Vec2;
  text: string;
  color?: WorldColor;
  at?: Cue;
  hideAt?: Cue;
  side?: 'left' | 'right';
}

/**
 * Irisan teknis 2D (cutaway) gaya buku teknik: bagian berwarna per bahan dengan aksir, bergerak saat kata narasi,
 * label menempel, + HUD yang sama dengan scene `world` (strip data, panel, batang, kartu, cap).
 */
export interface IrisanScene extends SceneBase, SceneHeading {
  type: 'irisan';
  /** Ukuran kanvas gambar. Default [1000, 1000]. */
  size?: Vec2;
  parts: IrisanPart[];
  shots?: IrisanShot[];
  labels?: IrisanLabel[];
  /** Lencana di atas gambar, mis. "Ilustrasi · gerak lambat". */
  badge?: string;
  cards?: WorldCard[];
  readout?: WorldReadout;
  meters?: WorldMeter[];
  panel?: WorldPanel;
  stamp?: Omit<WorldStamp, 'target'> & { target?: string | Vec2 };
  /** Warna latar. Default background tema. */
  latar?: WorldColor;
  note?: string;
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
  | MapScene
  | WorldScene
  | IrisanScene;

export type SceneType = SceneConfig['type'];
