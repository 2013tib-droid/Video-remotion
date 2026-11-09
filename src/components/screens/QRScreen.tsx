import React from 'react';
import { random } from 'remotion';
import { Reveal, useProgress } from '../../motion';
import { useTheme } from '../../themes';
import { AppScreen } from './AppScreen';

export interface QRScreenProps {
  title?: string;
  merchant: string;
  amount?: string;
  caption?: string;
  delay?: number;
}

/** Layar pembayaran QR (dekoratif, bukan QR yang bisa dipindai). */
export const QRScreen: React.FC<QRScreenProps> = ({ title = 'Bayar', merchant, amount, caption = 'Pindai untuk membayar', delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const n = 21;
  const reveal = useProgress(delay + 0.3, delay + 1.3);
  const cells: React.ReactNode[] = [];
  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let on: boolean;
      if (isFinder(x, y)) {
        const fx = x >= n - 7 ? x - (n - 7) : x;
        const fy = y >= n - 7 ? y - (n - 7) : y;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
      } else {
        on = random(`qr-${merchant}-${x}-${y}`) > 0.5;
      }
      const visible = (x + y) / (2 * n) < reveal;
      if (on && visible) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} />);
    }
  }
  return (
    <AppScreen title={title}>
      <Reveal delay={delay} preset="scaleIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(20), marginTop: px(20) }}>
        <div style={{ fontWeight: theme.fontWeights.strong, fontSize: type.caption }}>{merchant}</div>
        <div style={{ padding: px(24), background: '#fff', borderRadius: px(24), border: `${px(4)}px solid ${theme.colors.primary}` }}>
          <svg viewBox={`0 0 ${n} ${n}`} width={px(330)} height={px(330)} fill="#111" shapeRendering="crispEdges">
            {cells}
          </svg>
        </div>
        {amount ? (
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: theme.fontWeights.heading, fontSize: type.h3 * 0.8, color: theme.colors.primary }}>
            {amount}
          </div>
        ) : null}
        <div style={{ color: theme.colors.muted, fontSize: type.label }}>{caption}</div>
      </Reveal>
    </AppScreen>
  );
};
