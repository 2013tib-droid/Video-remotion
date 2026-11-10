import { Easing, type SpringConfig } from 'remotion';

/**
 * Preset spring. Semua animasi memakai salah satu preset ini —
 * jangan menulis angka stiffness/damping langsung di komponen.
 */
export const SPRINGS = {
  /** Tanpa overshoot. Nuansa premium ala Apple. */
  smooth: { damping: 200, stiffness: 110, mass: 1 },
  /** Sedikit overshoot, lembut. Default SaaS modern. */
  gentle: { damping: 26, stiffness: 120, mass: 1 },
  /** Cepat dan tegas untuk elemen kecil (badge, ikon). */
  snappy: { damping: 22, stiffness: 220, mass: 0.7 },
  /** Memantul, ceria — untuk tema anak/playful. */
  bouncy: { damping: 11, stiffness: 160, mass: 0.9 },
  /** Berat dan pelan untuk elemen besar (mockup, background). */
  heavy: { damping: 40, stiffness: 70, mass: 1.6 },
} satisfies Record<string, Partial<SpringConfig>>;

export type SpringPreset = keyof typeof SPRINGS;

/** Durasi standar (detik). */
export const DURATIONS = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.0,
} as const;

export type DurationName = keyof typeof DURATIONS;

/** Preset easing (dipakai untuk interpolasi non-spring & transisi scene). */
export const EASINGS = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  apple: Easing.bezier(0.25, 0.1, 0.25, 1),
  linear: Easing.linear,
  /** Lambat-cepat-lambat seperti gerak kamera. */
  drift: Easing.inOut(Easing.sin),
} as const;

export type EasingName = keyof typeof EASINGS;

/** Jeda antar elemen berurutan (detik). */
export const STAGGER = {
  tight: 0.06,
  normal: 0.12,
  relaxed: 0.2,
} as const;

export type StaggerName = keyof typeof STAGGER;

/**
 * Preset animasi masuk. Setiap preset mendeskripsikan keadaan AWAL;
 * keadaan akhir selalu netral (opacity 1, posisi 0, scale 1, blur 0).
 * Nilai x/y dalam px pada basis 1080 (otomatis diskalakan).
 */
export interface EntranceState {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  blur?: number;
  rotate?: number;
}

export const ENTRANCES = {
  fadeIn: { opacity: 0 },
  fadeUp: { opacity: 0, y: 60 },
  fadeDown: { opacity: 0, y: -60 },
  slideLeft: { opacity: 0, x: 120 },
  slideRight: { opacity: 0, x: -120 },
  scaleIn: { opacity: 0, scale: 0.85 },
  pop: { opacity: 0, scale: 0.4 },
  blurUp: { opacity: 0, y: 40, blur: 18 },
  blurIn: { opacity: 0, blur: 24, scale: 1.04 },
  tiltIn: { opacity: 0, y: 80, rotate: -6 },
} satisfies Record<string, EntranceState>;

export type EntrancePreset = keyof typeof ENTRANCES;

/* ------------------------------------------------------------------
 * Gerak sepanjang scene: kamera, idle, dan animasi keluar.
 * ------------------------------------------------------------------ */

/** Gerakan kamera per scene (seluruh isi scene bergerak pelan). */
export const CAMERA_MOVES = ['zoomIn', 'panLeft', 'zoomOut', 'panRight'] as const;
export type CameraMove = (typeof CAMERA_MOVES)[number];
/** `auto` = bergiliran per scene; `none` = kamera diam. */
export type CameraSetting = 'auto' | 'none' | CameraMove;

/** Tingkat "energi" gerak. Tema memilih default; explainer otomatis `calm`. */
export interface MotionEnergyPreset {
  /** Kamera: tambahan skala maksimal & geser maksimal (px basis 1080). */
  camera: { zoom: number; pan: number };
  /** Background bergerak sebesar ini × gerak konten (parallax). */
  parallax: number;
  /** Idle: amplitudo melayang (px basis 1080), denyut skala, periode (detik). */
  idle: { float: number; breathe: number; period: number };
  /** Keluar: geser ke atas (px basis 1080) dan blur maksimal. */
  exit: { y: number; blur: number };
}

export const MOTION_ENERGY = {
  calm: {
    camera: { zoom: 0.03, pan: 14 },
    parallax: 0.4,
    idle: { float: 4, breathe: 0.006, period: 5 },
    exit: { y: 18, blur: 4 },
  },
  normal: {
    camera: { zoom: 0.05, pan: 24 },
    parallax: 0.45,
    idle: { float: 6, breathe: 0.01, period: 4 },
    exit: { y: 26, blur: 6 },
  },
  lively: {
    camera: { zoom: 0.07, pan: 36 },
    parallax: 0.5,
    idle: { float: 10, breathe: 0.018, period: 3 },
    exit: { y: 36, blur: 8 },
  },
} satisfies Record<string, MotionEnergyPreset>;

export type MotionEnergy = keyof typeof MOTION_ENERGY;

/** Waktu animasi keluar & idle (detik). */
export const SCENE_MOTION_TIMING = {
  /** Lama animasi keluar satu elemen. */
  exitDuration: 0.35,
  /** Jeda bergiliran maksimal antar elemen saat keluar. */
  exitStaggerMax: 0.12,
  /** Keluar dimulai sekian detik sebelum transisi keluar dimulai. */
  exitLead: 0.1,
  /** Idle mulai sekian detik setelah delay elemen, lalu menguat selama `idleRamp`. */
  idleAfter: 0.7,
  idleRamp: 0.8,
} as const;

/* ------------------------------------------------------------------
 * Tipografi kinetik: gaya muncul kata & aksen kata kunci.
 * ------------------------------------------------------------------ */

/** Gaya muncul kata pada judul. `fade` = kalem per baris (subtitle/paragraf). */
export type TextAnimation = 'rise' | 'pop' | 'blur' | 'typewriter' | 'slam' | 'fade';

export interface TextAnimationPreset {
  /** Keadaan awal; y & blur dalam em (ikut ukuran font). Keadaan akhir selalu netral. */
  from: { opacity?: number; y?: number; scale?: number; blur?: number };
  spring: SpringPreset;
  /** Lama sampai kata diam penuh (detik). Maks 0,5 agar teks cepat terbaca. */
  duration: number;
  /** Jeda bergiliran antar kata (detik). */
  stagger: number;
  /** Opacity mencapai 1 pada progres ini (0..1). */
  opacityRamp: number;
  /** Kata terpotong garis bawah (naik dari balik garis). */
  mask?: boolean;
}

export const TEXT_ANIMATIONS = {
  /** Naik dari balik garis, seperti terpotong di bawah. */
  rise: { from: { y: 1.1 }, spring: 'smooth', duration: 0.45, stagger: 0.08, opacityRamp: 0.01, mask: true },
  /** Membesar sedikit melewati ukuran akhir lalu kembali. */
  pop: { from: { opacity: 0, scale: 0.55 }, spring: 'bouncy', duration: 0.45, stagger: 0.09, opacityRamp: 0.35 },
  /** Muncul dari kabur. */
  blur: { from: { opacity: 0, blur: 0.22, scale: 1.06 }, spring: 'smooth', duration: 0.45, stagger: 0.09, opacityRamp: 0.6 },
  /** Huruf per huruf dengan kursor berkedip (lihat TYPEWRITER). */
  typewriter: { from: {}, spring: 'smooth', duration: 0, stagger: 0, opacityRamp: 0 },
  /** Turun dari ukuran besar lalu menghentak. */
  slam: { from: { opacity: 0, scale: 1.3, y: -0.08 }, spring: 'snappy', duration: 0.4, stagger: 0.15, opacityRamp: 0.3 },
  /** Kalem: fade naik. Dipakai subtitle & paragraf (per baris). */
  fade: { from: { opacity: 0, y: 0.45 }, spring: 'smooth', duration: 0.5, stagger: 0.12, opacityRamp: 1 },
} satisfies Record<TextAnimation, TextAnimationPreset>;

/** Mesin ketik: detik per huruf, kedip kursor, kursor hilang sekian detik setelah selesai. */
export const TYPEWRITER = { charStep: 0.04, blink: 0.5, cursorLinger: 1.2 } as const;

/** Gaya aksen kata sorotan. `mix` = punch + coretan bergiliran marker → underline → circle. */
export type HighlightStyle = 'mix' | 'marker' | 'underline' | 'circle' | 'punch' | 'none';
export type AccentStroke = 'marker' | 'underline' | 'circle';
export const ACCENT_ROTATION: readonly AccentStroke[] = ['marker', 'underline', 'circle'];

/** Waktu aksen (detik) relatif terhadap saat kata muncul. */
export const ACCENT_TIMING = {
  /** Punch dimulai sekian detik setelah kata muncul. */
  after: 0.26,
  /** Kata diucapkan di narasi: aksen dimulai sekian detik setelah cue kata. */
  afterCue: 0.08,
  /** Lama punch (membesar lalu kembali); berakhir ≤ 0,5 dtk setelah muncul. */
  punch: 0.22,
  /** Skala puncak punch. */
  punchScale: 0.08,
  /** Lama sapuan warna gradien. */
  sweep: 0.45,
  /** Lama coretan tergambar. */
  draw: 0.5,
} as const;
