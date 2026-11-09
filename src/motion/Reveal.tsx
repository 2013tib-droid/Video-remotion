import React from 'react';
import { useEntrance, type EntranceOptions } from './hooks';

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
      {children}
    </div>
  );
};

function joinTransform(a?: string, b?: string): string | undefined {
  if (a && b) return `${a} ${b}`;
  return a ?? b;
}
