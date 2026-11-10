import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Captions, ChapterHeader, StatusHud, type CaptionWord } from '../components/explainer';
import { NARRATION_LEAD, normWord, resolveClip } from './narration';
import type { Timeline } from './timeline';
import type { VideoConfig } from './types';

/** Posisi lapisan (px basis 1080, format vertikal). */
export const OVERLAY_LAYOUT = {
  hudTop: 120,
  chapterTop: 230,
  /** Tambahan area aman atas untuk konten scene. */
  insetTop: 250,
  captionsBottom: 390,
  /** Tambahan area aman bawah untuk konten scene. */
  insetBottom: 230,
};

/** Kata narasi seluruh video dengan waktu absolut (detik). */
export function narrationWords(config: VideoConfig, timeline: Timeline): CaptionWord[] {
  const out: CaptionWord[] = [];
  config.scenes.forEach((scene, i) => {
    if (!scene.narration) return;
    const offset = timeline.entries[i].from / timeline.fps + NARRATION_LEAD;
    const emph = (scene.emphasis ?? []).map((p) => p.split(/\s+/).map(normWord));
    const words = resolveClip(scene.narration, config.narration, config.voice).words;
    const marked = words.map(() => false);
    emph.forEach((phrase) => {
      for (let k = 0; k + phrase.length <= words.length; k++) {
        if (phrase.every((p, j) => normWord(words[k + j].w) === p)) phrase.forEach((_, j) => (marked[k + j] = true));
      }
    });
    words.forEach((w, k) => out.push({ w: w.w, start: offset + w.start, end: offset + w.end, emphasis: marked[k] }));
  });
  return out;
}

/** Lapisan tetap gaya explainer: HUD, header bab, subtitle. */
export const ExplainerOverlay: React.FC<{ config: VideoConfig; timeline: Timeline }> = ({ config, timeline }) => {
  const frame = useCurrentFrame();
  const overlay = config.overlay!;
  const words = useMemo(() => narrationWords(config, timeline), [config, timeline]);

  let idx = 0;
  timeline.entries.forEach((e, i) => {
    if (frame >= e.from) idx = i;
  });
  const chapter = config.scenes[idx].chapter;
  // Bab yang sama berturut-turut tidak dianimasikan ulang.
  let chapterStart = idx;
  while (chapter && chapterStart > 0 && config.scenes[chapterStart - 1].chapter?.title === chapter.title) chapterStart--;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <StatusHud
        top={OVERLAY_LAYOUT.hudTop}
        brand={overlay.brand === false ? undefined : config.brand}
        label={overlay.hud?.label}
        timer={overlay.hud?.timer}
      />
      {chapter ? (
        <ChapterHeader key={chapterStart} {...chapter} startFrame={timeline.entries[chapterStart].from} top={OVERLAY_LAYOUT.chapterTop} />
      ) : null}
      {overlay.captions === false ? null : <Captions words={words} bottom={OVERLAY_LAYOUT.captionsBottom} />}
    </AbsoluteFill>
  );
};
