import React from 'react';
import { Html5Audio, Sequence, interpolate, useVideoConfig } from 'remotion';
import {
  MUSIC_FILE_VOLUME,
  MUSIC_NARRATION_DUCK,
  MUSIC_TIMING,
  MUSIC_TRACKS,
  isMusicName,
  type MusicSetting,
} from '../config';
import { resolveSrc } from '../components/primitives';

/**
 * Musik latar sepanjang video: trek bawaan di-loop mulus, masuk & keluar memudar,
 * dan otomatis dikecilkan bila video bernarasi. Tidak merender apa pun di layar.
 */
export const Music: React.FC<{ audio?: MusicSetting; narrated: boolean }> = ({ audio, narrated }) => {
  const { fps, durationInFrames: total } = useVideoConfig();
  if (!audio) return null;
  const opt = typeof audio === 'string' ? { src: audio } : audio;
  const track = isMusicName(opt.src) ? MUSIC_TRACKS[opt.src] : null;
  const base = Math.min(1, (opt.volume ?? track?.volume ?? MUSIC_FILE_VOLUME) * (narrated ? MUSIC_NARRATION_DUCK : 1));
  const fadeIn = Math.max(1, Math.round((opt.fadeIn ?? MUSIC_TIMING.fadeIn) * fps));
  const fadeOut = Math.max(1, Math.round((opt.fadeOut ?? MUSIC_TIMING.fadeOut) * fps));
  /** Volume pada frame absolut video. */
  const volumeAt = (frame: number) =>
    base *
    interpolate(frame, [0, fadeIn], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) *
    interpolate(frame, [total - fadeOut, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const src = resolveSrc(track ? track.file : opt.src);

  if (!track || opt.loop === false) {
    return <Html5Audio src={src} loop={opt.loop ?? false} volume={volumeAt} name="Musik" />;
  }
  const length = Math.max(1, Math.round(track.length * fps));
  return (
    <>
      {Array.from({ length: Math.ceil(total / length) }, (_, k) => (
        <Sequence key={k} from={k * length} durationInFrames={length} layout="none" name={`Musik ${opt.src} ${k + 1}`}>
          <Html5Audio src={src} volume={(f) => volumeAt(f + k * length)} />
        </Sequence>
      ))}
    </>
  );
};
