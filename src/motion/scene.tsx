import React, { createContext, useContext } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  EASINGS,
  MOTION_ENERGY,
  SCENE_MOTION_TIMING,
  type CameraMove,
  type MotionEnergy,
  type MotionEnergyPreset,
} from '../config';
import { useTheme } from '../themes';

/**
 * Info gerak untuk scene yang sedang dirender. Diisi oleh MotionVideo per scene;
 * di luar video (mis. pratinjau komponen) nilainya null → kamera & keluar mati.
 */
export interface SceneMotion {
  /** Urutan scene (0-based). */
  index: number;
  /** Durasi scene dalam frame. */
  frames: number;
  /** Frame awal scene di video (untuk gerak yang bersambung lintas scene). */
  from?: number;
  /** Frame mulai animasi keluar; null = tidak keluar (scene terakhir / exit: false). */
  exitStart: number | null;
  energy: MotionEnergy;
  camera: CameraMove | 'none';
}

const SceneMotionContext = createContext<SceneMotion | null>(null);

export const SceneMotionProvider: React.FC<{ value: SceneMotion; children: React.ReactNode }> = ({ value, children }) => (
  <SceneMotionContext.Provider value={value}>{children}</SceneMotionContext.Provider>
);

export function useSceneMotion(): SceneMotion | null {
  return useContext(SceneMotionContext);
}

/** Preset energi aktif (scene → tema → normal). */
export function useMotionEnergy(): MotionEnergyPreset {
  const ctx = useSceneMotion();
  const { theme } = useTheme();
  return MOTION_ENERGY[ctx?.energy ?? theme.motion.energy ?? 'normal'];
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * Gerak kamera pelan sepanjang scene. Mengembalikan transform untuk
 * lapisan konten dan lapisan background (parallax, sedikit di-overscan).
 */
export function useCamera(): { content?: string; background?: string } {
  const ctx = useSceneMotion();
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const energy = useMotionEnergy();
  const { px } = useTheme();
  if (!ctx || ctx.camera === 'none') return {};
  const t = interpolate(frame, [0, Math.max(1, ctx.frames)], [0, 1], { ...clamp, easing: EASINGS.drift });
  const { zoom, pan } = energy.camera;
  const panPx = px(pan);
  let scale = 1;
  let x = 0;
  switch (ctx.camera) {
    case 'zoomIn':
      scale = 1 + zoom * t;
      break;
    case 'zoomOut':
      scale = 1 + zoom * (1 - t);
      break;
    case 'panLeft':
      scale = 1 + zoom * 0.4;
      x = interpolate(t, [0, 1], [panPx, -panPx]);
      break;
    case 'panRight':
      scale = 1 + zoom * 0.4;
      x = interpolate(t, [0, 1], [-panPx, panPx]);
      break;
  }
  const k = energy.parallax;
  // Overscan background agar tepinya tidak terlihat saat digeser.
  const overscan = 1 + (2 * panPx * k) / width + 0.01;
  const bgScale = overscan * (1 + (scale - 1) * k);
  return {
    content: `translate3d(${x}px, 0, 0) scale(${scale})`,
    background: `translate3d(${x * k}px, 0, 0) scale(${bgScale})`,
  };
}

/**
 * Progres animasi keluar 0 → 1 untuk elemen dengan `delay` (detik) tertentu.
 * Elemen yang muncul lebih awal juga keluar lebih awal (bergiliran tipis).
 */
export function useSceneExit(delay = 0): number {
  const ctx = useSceneMotion();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!ctx || ctx.exitStart === null) return 0;
  const { exitDuration, exitStaggerMax } = SCENE_MOTION_TIMING;
  const offset = Math.min(exitStaggerMax, Math.max(0, delay) * 0.08);
  const start = ctx.exitStart + Math.round(offset * fps);
  return interpolate(frame, [start, start + Math.round(exitDuration * fps)], [0, 1], {
    ...clamp,
    easing: EASINGS.accelerate,
  });
}

/**
 * Gerak "bernapas" setelah elemen selesai muncul: melayang + denyut skala kecil.
 * Fase diturunkan dari `seed` agar elemen tidak bergerak serempak.
 */
export function useIdle(delay = 0, enabled = true, seed = delay): { y: number; scale: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const energy = useMotionEnergy();
  const { px } = useTheme();
  if (!enabled) return { y: 0, scale: 1 };
  const { idleAfter, idleRamp } = SCENE_MOTION_TIMING;
  const sec = frame / fps;
  const ramp = interpolate(sec, [delay + idleAfter, delay + idleAfter + idleRamp], [0, 1], {
    ...clamp,
    easing: EASINGS.standard,
  });
  if (ramp === 0) return { y: 0, scale: 1 };
  const { float, breathe, period } = energy.idle;
  const phase = seed * 2.399; // sudut emas → fase tersebar
  const w = (sec / period) * Math.PI * 2;
  return {
    y: ramp * px(float) * Math.sin(w + phase),
    scale: 1 + ramp * breathe * Math.sin(w * 0.77 + phase * 1.3),
  };
}
