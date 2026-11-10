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
import { flip } from '@remotion/transitions/flip';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { iris } from '@remotion/transitions/iris';
import { cube } from '@remotion/transitions/cube';
import { pushCut } from '@remotion/transitions/push-cut';
import { DURATIONS, EASINGS, type DurationName } from './animation';

/**
 * Transisi antar scene. Satu nama = satu perilaku yang konsisten.
 */
export const TRANSITION_NAMES = [
  'fade',
  'zoom',
  'slideLeft',
  'slideUp',
  'slideRight',
  'slideDown',
  'wipe',
  'wipeUp',
  'flip',
  'flipUp',
  'cube',
  'clockWipe',
  'iris',
  'pushCut',
  'mix',
  'none',
] as const;

export type TransitionName = (typeof TRANSITION_NAMES)[number];

/** Transisi konkret (tanpa `mix`, yang hanya alias bergiliran). */
export type ConcreteTransition = Exclude<TransitionName, 'mix'>;

/**
 * Urutan bergiliran untuk `mix`: variasi tanpa acak (deterministik dari indeks scene),
 * diselingi transisi ringan agar efek besar tidak terasa berlebihan.
 */
export const TRANSITION_MIX: readonly ConcreteTransition[] = [
  'slideLeft',
  'iris',
  'fade',
  'flip',
  'zoom',
  'clockWipe',
  'wipe',
  'cube',
  'pushCut',
];

/** Ubah `mix` menjadi transisi konkret untuk scene ke-`index`. */
export function resolveTransition(name: TransitionName, index: number): ConcreteTransition {
  if (name !== 'mix') return name;
  return TRANSITION_MIX[Math.max(0, index - 1) % TRANSITION_MIX.length];
}

/** Durasi transisi scene (memakai skala DURATIONS). */
export const TRANSITION_SPEED: DurationName = 'normal';

/** Transisi 3D/berbentuk butuh sedikit lebih lama agar terbaca, bukan sekadar kilat. */
const SLOWER_TRANSITIONS: readonly TransitionName[] = ['flip', 'flipUp', 'cube', 'clockWipe', 'iris'];
const SLOWER_FACTOR = 1.35;

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
export function getPresentation(
  name: TransitionName,
  size: { width: number; height: number },
): TransitionPresentation<any> {
  const { width, height } = size;
  switch (name) {
    case 'fade':
      return fade();
    case 'zoom':
      return zoom();
    case 'slideLeft':
      return slide({ direction: 'from-right' });
    case 'slideUp':
      return slide({ direction: 'from-bottom' });
    case 'slideRight':
      return slide({ direction: 'from-left' });
    case 'slideDown':
      return slide({ direction: 'from-top' });
    case 'wipe':
      return wipe({ direction: 'from-right' });
    case 'wipeUp':
      return wipe({ direction: 'from-bottom' });
    case 'flip':
      return flip({ direction: 'from-right', perspective: 2000 });
    case 'flipUp':
      return flip({ direction: 'from-bottom', perspective: 2000 });
    case 'cube':
      return cube({ direction: 'from-right', perspective: 2400 });
    case 'clockWipe':
      return clockWipe({ width, height });
    case 'iris':
      return iris({ width, height });
    case 'pushCut':
      return pushCut();
    case 'mix':
      // Seharusnya sudah di-resolve per scene (lihat resolveTransition); fallback aman.
      return fade();
    case 'none':
      return none();
  }
}

export function getTransitionFrames(name: TransitionName, fps: number): number {
  if (name === 'none') return 0;
  const base = DURATIONS[TRANSITION_SPEED] * fps;
  return Math.round(SLOWER_TRANSITIONS.includes(name) ? base * SLOWER_FACTOR : base);
}

export function getTiming(name: TransitionName, fps: number): TransitionTiming {
  return linearTiming({
    durationInFrames: Math.max(1, getTransitionFrames(name, fps)),
    easing: EASINGS.emphasized,
  });
}
