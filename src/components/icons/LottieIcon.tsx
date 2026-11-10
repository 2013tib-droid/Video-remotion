import React, { useEffect, useState } from 'react';
import { Lottie, type LottieAnimationData } from '@remotion/lottie';
import { Sequence, cancelRender, continueRender, delayRender, useVideoConfig } from 'remotion';
import { useRevealDelay } from '../../motion';
import { useTheme } from '../../themes';
import { resolveSrc } from '../assets';

export interface LottieIconProps {
  /** File Lottie (.json) di public/ atau URL. */
  src: string;
  size: number;
  /** Mulai diputar (detik). Default: delay `<Reveal>` pembungkus. */
  delay?: number;
  /** Ulangi terus. Default true. */
  loop?: boolean;
  playbackRate?: number;
  style?: React.CSSProperties;
}

/** Animasi Lottie (ikon/ilustrasi bergerak dari LottieFiles, After Effects, dsb.). */
export const LottieIcon: React.FC<LottieIconProps> = ({ src, size, delay, loop = true, playbackRate, style }) => {
  const { px } = useTheme();
  const { fps } = useVideoConfig();
  const revealDelay = useRevealDelay();
  const [handle] = useState(() => delayRender(`Memuat Lottie ${src}`));
  const [data, setData] = useState<LottieAnimationData | null>(null);
  useEffect(() => {
    fetch(resolveSrc(src))
      .then((r) => {
        if (!r.ok) throw new Error(`Lottie ${src}: HTTP ${r.status}`);
        return r.json();
      })
      .then((json: LottieAnimationData) => {
        setData(json);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle, src]);
  const s = px(size);
  const box: React.CSSProperties = { width: s, height: s, position: 'relative', ...style };
  if (!data) return <div style={box} />;
  return (
    <div style={box}>
      <Sequence from={Math.round((delay ?? revealDelay) * fps)} layout="none" name="Lottie">
        <Lottie animationData={data} loop={loop} playbackRate={playbackRate} style={{ width: s, height: s }} />
      </Sequence>
    </div>
  );
};
