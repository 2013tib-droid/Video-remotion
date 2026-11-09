import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, Html5Audio, continueRender, delayRender, useVideoConfig } from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import '../config/fonts';
import { DEFAULT_FORMAT, getPresentation, getTiming } from '../config';
import { resolveSrc } from '../components/primitives';
import { SceneRenderer } from '../scenes/registry';
import { ThemeProvider, resolveTheme, type Theme } from '../themes';
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
  const { fps } = useVideoConfig();
  const theme = useMemo(() => resolveTheme(config.theme, config.themeOverrides), [config.theme, config.themeOverrides]);
  const timeline = useMemo(() => computeTimeline(config), [config]);
  useFontsReady(theme);

  return (
    <ThemeProvider theme={theme} format={config.format ?? DEFAULT_FORMAT}>
      <AbsoluteFill style={{ background: theme.colors.background }}>
        <TransitionSeries>
          {config.scenes.map((scene, i) => {
            const entry = timeline.entries[i];
            const next = timeline.entries[i + 1];
            return (
              <React.Fragment key={i}>
                <TransitionSeries.Sequence durationInFrames={entry.frames} name={`${i + 1}. ${scene.type}`}>
                  <SceneRenderer scene={scene} brand={config.brand} />
                </TransitionSeries.Sequence>
                {next && next.transitionFrames > 0 ? (
                  <TransitionSeries.Transition presentation={getPresentation(next.transition)} timing={getTiming(next.transition, fps)} />
                ) : null}
              </React.Fragment>
            );
          })}
        </TransitionSeries>
        {config.audio ? <Html5Audio src={resolveSrc(config.audio.src)} volume={config.audio.volume ?? 0.8} /> : null}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
