import React, { createContext, useContext } from 'react';
import { SFX_TIMING, type SfxName } from '../config';
import { useEntrance, type EntranceOptions } from './hooks';
import { Sfx } from './sfx';

const RevealDelayContext = createContext(0);

/**
 * Delay (detik) dari `<Reveal>` terdekat. Dipakai elemen di dalamnya (mis. ikon
 * yang tergambar) agar animasinya mulai bersamaan dengan pembungkusnya.
 */
export function useRevealDelay(): number {
  return useContext(RevealDelayContext);
}

export interface RevealProps extends EntranceOptions {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  /**
   * Efek suara saat muncul. Default: `pop` untuk elemen `idle` (kartu, ikon, badge, angka),
   * senyap untuk lainnya (teks). `false` = senyap.
   */
  sfx?: SfxName | false;
}

/**
 * Pembungkus animasi masuk standar. Gunakan ini alih-alih menulis
 * spring/interpolate manual di setiap komponen.
 *
 * <Reveal delay={0.2} preset="fadeUp">...</Reveal>
 */
export const Reveal: React.FC<RevealProps> = ({ children, style, className, sfx, ...opts }) => {
  const motion = useEntrance(opts);
  const sound = sfx ?? (opts.idle ? 'pop' : false);
  const delay = opts.delay ?? 0;
  return (
    <div className={className} style={{ ...style, ...motion, transform: joinTransform(style?.transform, motion.transform) }}>
      {sound ? <Sfx name={sound} at={delay + SFX_TIMING.popOffset} seed={delay * 10} /> : null}
      <RevealDelayContext.Provider value={delay}>{children}</RevealDelayContext.Provider>
    </div>
  );
};

function joinTransform(a?: string, b?: string): string | undefined {
  if (a && b) return `${a} ${b}`;
  return a ?? b;
}
