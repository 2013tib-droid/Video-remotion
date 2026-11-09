import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import {
  linearTiming,
  type TransitionPresentation,
  type TransitionPresentationComponentProps,
  type TransitionTiming,
} from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { none } from '@remotion/transitions/none';
import { DURATIONS, EASINGS, type DurationName } from './animation';

/**
 * Transisi antar scene. Satu nama = satu perilaku yang konsisten.
 */
export const TRANSITION_NAMES = [
  'fade',
  'zoom',
  'slideLeft',
  'slideUp',
  'wipe',
  'none',
] as const;

export type TransitionName = (typeof TRANSITION_NAMES)[number];

/** Durasi transisi scene (memakai skala DURATIONS). */
export const TRANSITION_SPEED: DurationName = 'normal';

/** Zoom + fade halus: scene lama membesar & memudar, scene baru mengecil ke ukuran normal. */
const ZoomPresentation: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const style = useMemo<React.CSSProperties>(() => {
    if (presentationDirection === 'entering') {
      return {
        opacity: presentationProgress,
        transform: `scale(${interpolate(presentationProgress, [0, 1], [1.08, 1])})`,
      };
    }
    return {
      opacity: 1 - presentationProgress,
      transform: `scale(${interpolate(presentationProgress, [0, 1], [1, 0.94])})`,
    };
  }, [presentationDirection, presentationProgress]);
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

const zoom = (): TransitionPresentation<Record<string, never>> => ({
  component: ZoomPresentation,
  props: {},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPresentation(name: TransitionName): TransitionPresentation<any> {
  switch (name) {
    case 'fade':
      return fade();
    case 'zoom':
      return zoom();
    case 'slideLeft':
      return slide({ direction: 'from-right' });
    case 'slideUp':
      return slide({ direction: 'from-bottom' });
    case 'wipe':
      return wipe({ direction: 'from-right' });
    case 'none':
      return none();
  }
}

export function getTransitionFrames(name: TransitionName, fps: number): number {
  if (name === 'none') return 0;
  return Math.round(DURATIONS[TRANSITION_SPEED] * fps);
}

export function getTiming(name: TransitionName, fps: number): TransitionTiming {
  return linearTiming({
    durationInFrames: Math.max(1, getTransitionFrames(name, fps)),
    easing: EASINGS.emphasized,
  });
}
