import { useCallback } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  ENTRANCES,
  SPRINGS,
  STAGGER,
  type EntrancePreset,
  type EntranceState,
  type SpringPreset,
  type StaggerName,
} from '../config';
import { useTheme } from '../themes';
import { useIdle, useMotionEnergy, useSceneExit } from './scene';

/** Konversi detik → frame sesuai fps aktif. */
export function useSec(): (seconds: number) => number {
  const { fps } = useVideoConfig();
  return useCallback((seconds: number) => Math.round(seconds * fps), [fps]);
}

export interface SpringOptions {
  /** Delay dalam detik. */
  delay?: number;
  /** Preset spring; default mengikuti tema. */
  spring?: SpringPreset;
  /** Paksa durasi animasi (detik). */
  duration?: number;
  from?: number;
  to?: number;
}

/** Nilai progres spring 0 → 1 (atau from → to). Fondasi semua animasi. */
export function useSpring(opts: SpringOptions = {}): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useTheme();
  const preset = opts.spring ?? theme.motion.spring;
  return spring({
    frame,
    fps,
    config: SPRINGS[preset],
    delay: Math.round((opts.delay ?? 0) * fps),
    durationInFrames: opts.duration ? Math.round(opts.duration * fps) : undefined,
    from: opts.from ?? 0,
    to: opts.to ?? 1,
  });
}

/** Ubah progres 0..1 + preset entrance menjadi CSS style. */
export function entranceStyle(
  progress: number,
  state: EntranceState,
  px: (n: number) => number,
): React.CSSProperties {
  const lerp = (from: number | undefined, neutral: number) =>
    from === undefined ? neutral : interpolate(progress, [0, 1], [from, neutral]);
  const opacity = lerp(state.opacity, 1);
  const x = px(lerp(state.x, 0));
  const y = px(lerp(state.y, 0));
  const scale = lerp(state.scale, 1);
  const rotate = lerp(state.rotate, 0);
  const blur = lerp(state.blur, 0);
  return {
    opacity: Math.min(1, Math.max(0, opacity)),
    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
    filter: blur > 0.05 ? `blur(${px(blur)}px)` : undefined,
  };
}

export interface EntranceOptions extends SpringOptions {
  /** Preset entrance; default mengikuti tema. */
  preset?: EntrancePreset;
  /** Setelah muncul, elemen tetap "bernapas" (melayang + denyut halus). Jangan untuk paragraf teks. */
  idle?: boolean;
  /** Ikut animasi keluar di akhir scene. Default true. */
  exit?: boolean;
}

/** Style animasi masuk siap pakai (+ idle opsional + keluar di akhir scene). */
export function useEntrance(opts: EntranceOptions = {}): React.CSSProperties {
  const { theme, px } = useTheme();
  const progress = useSpring(opts);
  const delay = opts.delay ?? 0;
  const idle = useIdle(delay, opts.idle ?? false);
  const exitP = useSceneExit(delay);
  const energy = useMotionEnergy();
  const base = entranceStyle(progress, ENTRANCES[opts.preset ?? theme.motion.entrance], px);
  const out = opts.exit === false ? 0 : exitP;
  if (out === 0 && idle.y === 0 && idle.scale === 1) return base;
  const extra: string[] = [];
  const y = idle.y - px(energy.exit.y) * out;
  if (y !== 0) extra.push(`translate3d(0, ${y}px, 0)`);
  if (idle.scale !== 1) extra.push(`scale(${idle.scale})`);
  const blur = px(energy.exit.blur) * out;
  const baseBlur = typeof base.filter === 'string' ? base.filter : '';
  return {
    ...base,
    opacity: (base.opacity as number) * (1 - out),
    transform: [...extra, base.transform].filter(Boolean).join(' '),
    filter: blur > 0.05 ? `${baseBlur} blur(${blur}px)`.trim() : base.filter,
  };
}

/** Delay (detik) untuk elemen ke-i dalam daftar berurutan. */
export function useStagger(name?: StaggerName): (index: number, base?: number) => number {
  const { theme } = useTheme();
  const step = STAGGER[name ?? theme.motion.stagger];
  return useCallback((index: number, base = 0) => base + index * step, [step]);
}

/** Angka berjalan dari `from` ke `to` dengan spring. */
export function useCountUp(to: number, opts: SpringOptions & { from?: number } = {}): number {
  const progress = useSpring({ spring: 'smooth', duration: 1.6, ...opts, from: 0, to: 1 });
  const from = opts.from ?? 0;
  return from + (to - from) * progress;
}

/** Gerak melayang halus (idle) untuk mockup/ikon. Mengembalikan offset px. */
export function useFloat(amplitude = 12, periodSec = 4, phase = 0): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px } = useTheme();
  return px(amplitude) * Math.sin((frame / fps / periodSec) * Math.PI * 2 + phase);
}

/** Progres linear 0..1 antara dua waktu (detik), dengan easing opsional. */
export function useProgress(startSec: number, endSec: number, easing?: (t: number) => number): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [startSec * fps, endSec * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}
