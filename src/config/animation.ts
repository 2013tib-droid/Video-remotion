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
