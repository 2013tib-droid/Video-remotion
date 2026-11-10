import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { isVideoSrc, resolveSrc } from '../components';
import { BROLL_MOTION, EASINGS } from '../config';
import { Sfx, useSceneMotion, useSceneExit } from '../motion';
import { ThemeColors, useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneTitle } from './SceneLayout';
import type { BrollMove, BrollScene, BrollShot } from './types';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const WHITE_TEXT = { text: '#ffffff', muted: 'rgba(255,255,255,0.84)' };

/** Transform Ken Burns untuk progres p (0..1). */
function kenBurns(move: Exclude<BrollMove, 'auto'>, p: number, w: number, h: number): string {
  const { zoom, pan, panScale } = BROLL_MOTION;
  const lerp = (a: number, b: number) => a + (b - a) * p;
  switch (move) {
    case 'zoomIn':
      return `scale(${lerp(1.02, 1.02 + zoom)})`;
    case 'zoomOut':
      return `scale(${lerp(1.02 + zoom, 1.02)})`;
    case 'panLeft':
      return `translate3d(${lerp(pan, -pan) * w}px, 0, 0) scale(${panScale})`;
    case 'panRight':
      return `translate3d(${lerp(-pan, pan) * w}px, 0, 0) scale(${panScale})`;
    case 'panUp':
      return `translate3d(0, ${lerp(pan, -pan) * h}px, 0) scale(${panScale})`;
    case 'panDown':
      return `translate3d(0, ${lerp(-pan, pan) * h}px, 0) scale(${panScale})`;
    case 'none':
      return 'scale(1)';
  }
}

/** Foto/video b-roll layar penuh dengan gerak kamera (Ken Burns), crossfade antar shot, dan judul di atas scrim. */
export const BrollSceneView: React.FC<SceneProps<BrollScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { theme, safe, space, px, type } = useTheme();
  const motion = useSceneMotion();
  const exit = useSceneExit(0);
  const t = frame / fps;
  const sceneSec = motion ? motion.frames / fps : 5;
  const shots: BrollShot[] = scene.shots ?? (scene.src ? [{ src: scene.src }] : []);
  const xf = BROLL_MOTION.crossfade;

  // Jadwal shot: durasi eksplisit atau dibagi rata; shot berikutnya mulai `xf` sebelum shot ini berakhir.
  const fixed = shots.reduce((a, s) => a + (s.duration ?? 0), 0);
  const free = shots.filter((s) => s.duration === undefined).length;
  const each = free ? Math.max(1, (sceneSec - fixed + xf * (shots.length - 1)) / free) : 0;
  const starts: number[] = [];
  const lens: number[] = [];
  shots.reduce((acc, s, i) => {
    starts[i] = acc;
    lens[i] = s.duration ?? each;
    return acc + lens[i] - xf;
  }, 0);

  const pos = scene.textPosition ?? 'bottom';
  const dim = scene.dim ?? 0.6;
  const scrim =
    pos === 'center'
      ? `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,${dim * 0.85}) 0%, rgba(0,0,0,${dim * 0.45}) 70%)`
      : `linear-gradient(${pos === 'bottom' ? '180deg' : '0deg'}, rgba(0,0,0,${dim * 0.25}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,${dim * 0.55}) 62%, rgba(0,0,0,${dim}) 100%)`;
  const hasText = Boolean(scene.title || scene.eyebrow || scene.subtitle);

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {shots.map((shot, i) => {
        const start = starts[i];
        const end = start + lens[i];
        const last = i === shots.length - 1;
        if (t < start - 0.05 || (!last && t > end)) return null;
        const move = shot.move ?? scene.move ?? 'auto';
        const resolved = move === 'auto' ? BROLL_MOTION.auto[((motion?.index ?? 0) + i) % BROLL_MOTION.auto.length] : move;
        // Gerak tetap berjalan sampai akhir scene (shot terakhir) agar tidak berhenti mendadak.
        const span = last ? Math.max(lens[i], sceneSec - start) : lens[i];
        const p = interpolate(t, [start, start + span], [0, 1], { ...clamp, easing: EASINGS.drift });
        const fadeIn = i === 0 ? 1 : interpolate(t, [start, start + xf], [0, 1], { ...clamp, easing: EASINGS.standard });
        const focus = shot.focus ?? [0.5, 0.5];
        const media = resolveSrc(shot.src);
        const volume = scene.volume ?? 0;
        const capIn = interpolate(t, [start + 0.25, start + 0.6], [0, 1], clamp);
        const capOut = last ? 1 - exit : interpolate(t, [end - xf - 0.2, end - xf], [1, 0], clamp);
        return (
          <AbsoluteFill key={i} style={{ opacity: fadeIn }}>
            {i > 0 ? <Sfx name="swipe" at={start} volume={0.6} /> : null}
            <AbsoluteFill style={{ transform: kenBurns(resolved, p, width, height), transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` }}>
              {isVideoSrc(shot.src) ? (
                <Sequence from={Math.round(start * fps)} layout="absolute-fill" name={`B-roll ${i + 1}`}>
                  <OffthreadVideo
                    src={media}
                    muted={volume <= 0}
                    volume={volume}
                    startFrom={Math.round((shot.startFrom ?? 0) * fps)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Sequence>
              ) : (
                <Img src={media} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%` }} />
              )}
            </AbsoluteFill>
            {shot.caption ? (
              <div
                style={{
                  position: 'absolute',
                  top: safe.top,
                  left: safe.x,
                  padding: `${px(12)}px ${px(22)}px`,
                  borderRadius: px(theme.radius.pill),
                  background: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  fontFamily: theme.fonts.body,
                  fontWeight: theme.fontWeights.strong,
                  fontSize: type.caption,
                  opacity: capIn * capOut,
                  transform: `translate3d(${(1 - capIn) * -px(24)}px, 0, 0)`,
                }}
              >
                {shot.caption}
              </div>
            ) : null}
          </AbsoluteFill>
        );
      })}
      {/* Vinyet halus + scrim untuk keterbacaan teks. */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)' }} />
      {hasText ? <AbsoluteFill style={{ background: scrim }} /> : null}
      {hasText ? (
        <AbsoluteFill
          style={{
            padding: `${safe.top}px ${safe.x}px ${safe.bottom}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: pos === 'top' ? 'flex-start' : pos === 'center' ? 'center' : 'flex-end',
            alignItems: pos === 'center' ? 'center' : 'flex-start',
            gap: space.md,
            textShadow: '0 2px 24px rgba(0,0,0,0.35)',
          }}
        >
          <ThemeColors colors={WHITE_TEXT}>
            <SceneTitle {...scene} align={pos === 'center' ? 'center' : 'left'} size="h1" delay={0.2} />
          </ThemeColors>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
