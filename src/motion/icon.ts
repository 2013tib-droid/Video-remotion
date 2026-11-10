import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASINGS, ICON_ANIMATION, ICON_IDLE, MOTION_ENERGY, type IconIdle } from '../config';
import { useMotionEnergy } from './scene';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export interface IconDraw {
  /** Progres gambar garis ke-i (0..1). */
  stroke: (i: number) => number;
  /** Opacity isian duotone garis ke-i (0..1 × fillOpacity). */
  fill: (i: number) => number;
  /** Skala pop saat ikon mulai digambar. */
  scale: number;
  /** Detik saat seluruh garis selesai tergambar (absolut). */
  doneAt: number;
}

/**
 * Jadwal animasi "tergambar" untuk ikon dengan `count` garis yang mulai pada `delay` (detik).
 * Deterministik dari frame.
 */
export function useIconDraw(count: number, delay: number, speed = 1): IconDraw {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delay;
  const { draw, stagger, fill, fillOpacity, popFrom } = ICON_ANIMATION;
  const d = draw / speed;
  const st = stagger / speed;
  const strokeAt = (i: number) => interpolate(t, [i * st, i * st + d], [0, 1], { ...clamp, easing: EASINGS.emphasized });
  const fillAt = (i: number) => interpolate(t, [i * st + d * 0.7, i * st + d * 0.7 + fill], [0, fillOpacity], clamp);
  const scale = interpolate(t, [0, d], [popFrom, 1], { ...clamp, easing: EASINGS.decelerate });
  return { stroke: strokeAt, fill: fillAt, scale, doneAt: delay + Math.max(0, count - 1) * st + d };
}

/**
 * Transform CSS gerak idle khas ikon (bergoyang, berdenyut, berputar, ...), mulai
 * setelah `startSec` dan menguat pelan. Amplitudo ikut energi gerak scene.
 */
export function useIconIdle(kind: IconIdle, startSec: number, seed = 0): string | undefined {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const energy = useMotionEnergy();
  if (kind === 'none') return undefined;
  const sec = frame / fps;
  const ramp = interpolate(sec, [startSec, startSec + ICON_ANIMATION.idleRamp], [0, 1], clamp);
  if (ramp === 0) return undefined;
  const k = (energy.idle.float / MOTION_ENERGY.normal.idle.float) * ramp;
  const local = sec - startSec;
  const wave = (period: number) => Math.sin((local / period) * Math.PI * 2 + seed);
  switch (kind) {
    case 'tilt':
      return `rotate(${ICON_IDLE.tilt.deg * k * wave(ICON_IDLE.tilt.period)}deg)`;
    case 'swing': {
      // Ayunan berulang dengan jeda: kuat di awal tiap siklus lalu mereda.
      const cycle = (local % (ICON_IDLE.swing.period * 2)) / (ICON_IDLE.swing.period * 2);
      const env = Math.max(0, 1 - cycle * 1.6);
      return `rotate(${ICON_IDLE.swing.deg * k * env * Math.sin(local * Math.PI * 2 * 1.8)}deg)`;
    }
    case 'beat': {
      const b = Math.pow(Math.max(0, wave(ICON_IDLE.beat.period)), 6);
      return `scale(${1 + ICON_IDLE.beat.scale * k * b})`;
    }
    case 'spin':
      return `rotate(${ICON_IDLE.spin.degPerSec * local * ramp}deg)`;
    case 'bob':
      return `translateY(${ICON_IDLE.bob.y * 100 * k * wave(ICON_IDLE.bob.period)}%)`;
    case 'nudge':
      return `translateX(${ICON_IDLE.nudge.x * 100 * k * Math.max(0, wave(ICON_IDLE.nudge.period))}%)`;
  }
}
