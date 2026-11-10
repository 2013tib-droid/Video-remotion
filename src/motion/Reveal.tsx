import React, { createContext, useContext } from 'react';
import { useEntrance, type EntranceOptions } from './hooks';

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
}

/**
 * Pembungkus animasi masuk standar. Gunakan ini alih-alih menulis
 * spring/interpolate manual di setiap komponen.
 *
 * <Reveal delay={0.2} preset="fadeUp">...</Reveal>
 */
export const Reveal: React.FC<RevealProps> = ({ children, style, className, ...opts }) => {
  const motion = useEntrance(opts);
  return (
    <div className={className} style={{ ...style, ...motion, transform: joinTransform(style?.transform, motion.transform) }}>
      <RevealDelayContext.Provider value={opts.delay ?? 0}>{children}</RevealDelayContext.Provider>
    </div>
  );
};

function joinTransform(a?: string, b?: string): string | undefined {
  if (a && b) return `${a} ${b}`;
  return a ?? b;
}
