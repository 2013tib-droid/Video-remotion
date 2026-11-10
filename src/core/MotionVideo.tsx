import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, Html5Audio, Sequence, continueRender, delayRender, useVideoConfig } from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import '../config/fonts';
import { CAMERA_MOVES, DEFAULT_FORMAT, SCENE_MOTION_TIMING, getPresentation, getTiming } from '../config';
import { resolveSrc } from '../components/primitives';
import { SceneRenderer } from '../scenes/registry';
import { sceneAccentCount } from '../scenes/accents';
import { CueProvider, SceneMotionProvider, SceneTextProvider, type SceneMotion, type SceneText } from '../motion';
import { ThemeProvider, resolveTheme, type Theme } from '../themes';
import { ExplainerOverlay, OVERLAY_LAYOUT } from './ExplainerOverlay';
import { NARRATION_LEAD, resolveClip } from './narration';
import { computeTimeline } from './timeline';
import type { VideoConfig } from './types';

/** Tunda render sampai font tema termuat (hindari frame dengan font fallback). */
function useFontsReady(theme: Theme) {
  const [handle] = useState(() => delayRender('Memuat font tema'));
  useEffect(() => {
    const family = (stack: string) => stack.split(',')[0].trim();
    const loads = [
      `${theme.fontWeights.heading} 40px ${family(theme.fonts.heading)}`,
      `${theme.fontWeights.body} 40px ${family(theme.fonts.body)}`,
      `${theme.fontWeights.strong} 40px ${family(theme.fonts.body)}`,
    ].map((f) => document.fonts.load(f).catch(() => undefined));
    Promise.all(loads).then(() => continueRender(handle));
  }, [handle, theme]);
}

export interface MotionVideoProps {
  config: VideoConfig;
  [key: string]: unknown;
}

/**
 * Mesin video: VideoConfig → tema + timeline + scene + transisi.
 * Tidak perlu diubah saat membuat video baru.
 */
export const MotionVideo: React.FC<MotionVideoProps> = ({ config }) => {
  const { fps, width, height } = useVideoConfig();
  const theme = useMemo(() => resolveTheme(config.theme, config.themeOverrides), [config.theme, config.themeOverrides]);
  const timeline = useMemo(() => computeTimeline(config), [config]);
  useFontsReady(theme);
  const insets = useMemo(
    () => (config.overlay ? { top: OVERLAY_LAYOUT.insetTop, bottom: OVERLAY_LAYOUT.insetBottom } : undefined),
    [config.overlay],
  );
  const clips = useMemo(
    () => config.scenes.map((s) => (s.narration ? resolveClip(s.narration, config.narration, config.voice) : null)),
    [config],
  );
  const lead = Math.round(NARRATION_LEAD * fps);
  const sceneMotion = useMemo<SceneMotion[]>(() => {
    const energy = config.motion?.energy ?? (config.overlay ? 'calm' : theme.motion.energy ?? 'normal');
    return config.scenes.map((scene, i) => {
      const entry = timeline.entries[i];
      const next = timeline.entries[i + 1];
      const cam = scene.camera ?? config.motion?.camera ?? theme.motion.camera ?? 'auto';
      const exitOn = Boolean(next) && (scene.exit ?? config.motion?.exit ?? true);
      const exitStart = entry.frames - (next?.transitionFrames ?? 0) - Math.round(SCENE_MOTION_TIMING.exitLead * fps);
      return {
        index: i,
        frames: entry.frames,
        // Scene terlalu pendek: lewati animasi keluar.
        exitStart: exitOn && exitStart > fps ? exitStart : null,
        energy,
        camera: cam === 'auto' ? CAMERA_MOVES[i % CAMERA_MOVES.length] : cam,
      };
    });
  }, [config, theme, timeline, fps]);
  const sceneText = useMemo<SceneText[]>(() => {
    let base = 0;
    return config.scenes.map((scene) => {
      const value: SceneText = {
        textAnimation: scene.textAnimation,
        highlightStyle: scene.highlightStyle ?? 'mix',
        emphasis: scene.emphasis ?? [],
        accentBase: base,
      };
      base += sceneAccentCount(scene);
      return value;
    });
  }, [config]);
  useMemo(() => {
    const missing = clips.filter((c) => c?.estimated).length;
    if (missing) {
      console.warn(
        `[${config.id}] ${missing} klip narasi belum dirender — video akan BISU di bagian itu. ` +
          `Jalankan: npm run narasi -- <config.ts> (lihat docs/EXPLAINER.md).`,
      );
    }
  }, [clips, config.id]);

  return (
    <ThemeProvider theme={theme} format={config.format ?? DEFAULT_FORMAT} insets={insets}>
      <AbsoluteFill style={{ background: theme.colors.background }}>
        <TransitionSeries>
          {config.scenes.map((scene, i) => {
            const entry = timeline.entries[i];
            const next = timeline.entries[i + 1];
            return (
              <React.Fragment key={i}>
                <TransitionSeries.Sequence durationInFrames={entry.frames} name={`${i + 1}. ${scene.type}`}>
                  <SceneMotionProvider value={sceneMotion[i]}>
                    <SceneTextProvider value={sceneText[i]}>
                      <CueProvider words={(clips[i]?.words ?? []).map((w) => ({ ...w, start: w.start + NARRATION_LEAD, end: w.end + NARRATION_LEAD }))}>
                        <SceneRenderer scene={scene} brand={config.brand} />
                      </CueProvider>
                    </SceneTextProvider>
                  </SceneMotionProvider>
                </TransitionSeries.Sequence>
                {next && next.transitionFrames > 0 ? (
                  <TransitionSeries.Transition presentation={getPresentation(next.transition, { width, height })} timing={getTiming(next.transition, fps)} />
                ) : null}
              </React.Fragment>
            );
          })}
        </TransitionSeries>
        {config.overlay ? <ExplainerOverlay config={config} timeline={timeline} /> : null}
        {clips.map((clip, i) =>
          clip && clip.src ? (
            <Sequence key={`vo-${i}`} from={timeline.entries[i].from + lead} name={`Narasi ${i + 1}`} layout="none">
              <Html5Audio src={resolveSrc(clip.src)} />
            </Sequence>
          ) : null,
        )}
        {config.audio ? <Html5Audio src={resolveSrc(config.audio.src)} volume={config.audio.volume ?? 0.8} /> : null}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
