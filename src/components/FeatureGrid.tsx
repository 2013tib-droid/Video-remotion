import React from 'react';
import { useStagger } from '../motion';
import { useTheme } from '../themes';
import { FeatureCard, type Feature } from './FeatureCard';

export interface FeatureGridProps {
  features: Feature[];
  /** Kosong = otomatis berdasarkan format & jumlah fitur. */
  columns?: number;
  delay?: number;
}

/** Grid fitur dengan stagger otomatis. Layout menyesuaikan format video. */
export const FeatureGrid: React.FC<FeatureGridProps> = ({ features, columns, delay = 0 }) => {
  const { isPortrait, space, px } = useTheme();
  const stagger = useStagger();
  const n = features.length;
  const cols = columns ?? (isPortrait ? (n > 4 ? 2 : 1) : Math.min(n, n === 4 ? 2 : 3));
  const layout = cols === 1 ? 'row' : 'column';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: space.md,
        width: '100%',
        maxWidth: px(cols === 1 ? 900 : 1600),
      }}
    >
      {features.map((f, i) => (
        <FeatureCard key={i} {...f} layout={layout} delay={stagger(i, delay)} />
      ))}
    </div>
  );
};
