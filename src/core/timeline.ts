import {
  DEFAULT_FORMAT,
  DEFAULT_FPS,
  DEFAULT_SCENE_DURATION,
  FORMATS,
  MIN_SCENE_DURATION,
  getTransitionFrames,
  resolveTransition,
  type TransitionName,
} from '../config';
import { resolveTheme } from '../themes';
import { NARRATION_LEAD, NARRATION_TAIL, resolveClip } from './narration';
import type { VideoConfig } from './types';

export interface TimelineEntry {
  /** Durasi scene dalam frame (termasuk bagian yang tumpang tindih dengan transisi). */
  frames: number;
  /** Transisi MASUK ke scene ini (scene pertama: none). */
  transition: TransitionName;
  transitionFrames: number;
  /** Frame awal scene pada video. */
  from: number;
}

export interface Timeline {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  entries: TimelineEntry[];
}

/**
 * Hitung durasi setiap scene + transisi. Bila `config.duration` diisi,
 * durasi scene diskalakan proporsional agar total tepat sesuai target.
 */
export function computeTimeline(config: VideoConfig): Timeline {
  const fps = config.fps ?? DEFAULT_FPS;
  const { width, height } = FORMATS[config.format ?? DEFAULT_FORMAT];
  const theme = resolveTheme(config.theme, config.themeOverrides);
  const defaultTransition = config.transition ?? theme.motion.transition;

  if (config.scenes.length === 0) {
    throw new Error(`Video "${config.id}" tidak punya scene.`);
  }

  const transitions = config.scenes.map((s, i) =>
    i === 0 ? 'none' : resolveTransition(s.transition ?? defaultTransition, i),
  );
  const transitionFrames = transitions.map((t) => getTransitionFrames(t, fps));
  const overlap = transitionFrames.reduce((a, b) => a + b, 0);

  // Scene bernarasi: durasi = jeda awal + suara + jeda akhir (minimal sepanjang transisi berikutnya).
  const rawSec = config.scenes.map((s, i) => {
    const base = s.duration ?? DEFAULT_SCENE_DURATION[s.type] ?? 4;
    if (!s.narration) return base;
    const clip = resolveClip(s.narration, config.narration, config.voice);
    const tail = Math.max(NARRATION_TAIL, (transitionFrames[i + 1] ?? 0) / fps + 0.1);
    return Math.max(s.duration ?? 0, NARRATION_LEAD + clip.duration + tail);
  });
  let frames = rawSec.map((s) => Math.round(s * fps));
  const narrated = config.scenes.some((s) => s.narration);

  // Video bernarasi: durasi mengikuti suara, `duration` diabaikan.
  if (config.duration && !narrated) {
    const target = Math.round(config.duration * fps) + overlap;
    const sum = frames.reduce((a, b) => a + b, 0);
    const factor = target / sum;
    frames = rawSec.map((s) => Math.max(Math.round(MIN_SCENE_DURATION * fps), Math.round(s * fps * factor)));
    // Serap sisa pembulatan di scene terpanjang.
    const diff = target - frames.reduce((a, b) => a + b, 0);
    const longest = frames.indexOf(Math.max(...frames));
    frames[longest] += diff;
  }

  // Scene harus lebih panjang dari transisi yang mengapitnya.
  frames = frames.map((f, i) => Math.max(f, (transitionFrames[i] ?? 0) + (transitionFrames[i + 1] ?? 0) + 1));

  const durationInFrames = frames.reduce((a, b) => a + b, 0) - overlap;
  const starts: number[] = [];
  frames.reduce((acc, f, i) => {
    const from = acc - (transitionFrames[i] ?? 0);
    starts.push(from);
    return from + f;
  }, 0);
  return {
    fps,
    width,
    height,
    durationInFrames,
    entries: frames.map((f, i) => ({ frames: f, transition: transitions[i], transitionFrames: transitionFrames[i], from: starts[i] })),
  };
}
