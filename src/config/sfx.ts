import type { ConcreteTransition } from './transitions';

/**
 * Efek suara (SFX). File ada di `public/sfx/` (disintesis oleh `scripts/build-sfx.mjs`).
 * Komponen memakai `<Sfx name="pop" at={detik} />` — jangan menulis path/volume langsung.
 */
export const SFX_FILES = {
  whoosh: ['whoosh'],
  whooshSoft: ['whoosh-soft'],
  swipe: ['swipe'],
  /** Tiga nada agar rentetan pop tidak terdengar seperti mesin. */
  pop: ['pop-1', 'pop-2', 'pop-3'],
  ting: ['ting'],
  tick: ['tick'],
  impact: ['impact'],
  riser: ['riser'],
} as const;

export type SfxName = keyof typeof SFX_FILES;

/** Volume dasar tiap suara (dikali volume video). Disetel agar di bawah narasi/musik. */
export const SFX_VOLUME: Record<SfxName, number> = {
  whoosh: 0.45,
  whooshSoft: 0.34,
  swipe: 0.32,
  pop: 0.36,
  ting: 0.42,
  tick: 0.4,
  impact: 0.5,
  riser: 0.3,
};

/** Panjang file (detik) — Sequence audio dipotong sepanjang ini. */
export const SFX_LENGTH: Record<SfxName, number> = {
  whoosh: 0.6,
  whooshSoft: 0.5,
  swipe: 0.32,
  pop: 0.16,
  ting: 1.3,
  tick: 0.12,
  impact: 0.6,
  riser: 1.0,
};

/** Suara untuk tiap transisi antar scene (`null` = senyap). */
export const TRANSITION_SFX: Record<ConcreteTransition, SfxName | null> = {
  fade: 'whooshSoft',
  zoom: 'whooshSoft',
  slideLeft: 'whoosh',
  slideRight: 'whoosh',
  slideUp: 'whoosh',
  slideDown: 'whoosh',
  wipe: 'swipe',
  wipeUp: 'swipe',
  flip: 'whoosh',
  flipUp: 'whoosh',
  cube: 'whoosh',
  clockWipe: 'swipe',
  iris: 'whooshSoft',
  pushCut: 'whoosh',
  none: null,
};

/** Waktu SFX (detik). */
export const SFX_TIMING = {
  /** Whoosh mulai sekian detik setelah transisi mulai (puncak suara ≈ puncak gerak). */
  transitionOffset: 0,
  /** Pop terdengar sekian detik setelah elemen mulai muncul. */
  popOffset: 0.03,
  /** Angka dianggap "selesai menghitung" sekian detik setelah mulai (lihat useCountUp, 1,6 dtk). */
  counterDone: 1.3,
} as const;

/** Video bernarasi: SFX dikecilkan agar suara narator tetap jelas. */
export const SFX_NARRATION_DUCK = 0.6;

/** Pengaturan SFX per video (`sfx` di config). `true`/kosong = semua aktif; `false` = senyap. */
export interface SfxOptions {
  /** Pengali volume semua SFX. Default 1. */
  volume?: number;
  /** Whoosh saat transisi antar scene. Default true. */
  transitions?: boolean;
  /** Pop saat kartu/ikon/badge muncul, tick per kata, dentum pin. Default true. */
  elements?: boolean;
  /** "Ting" saat angka selesai menghitung / jawaban benar. Default true. */
  counters?: boolean;
}
export type SfxSetting = boolean | SfxOptions;
