import React from 'react';
import { interpolate } from 'remotion';
import { Reveal, formatValue, useProgress, useStagger } from '../../motion';
import { useTheme } from '../../themes';
import { AppScreen } from './AppScreen';

export interface ReceiptScreenProps {
  title?: string;
  store: string;
  items: { name: string; price: number }[];
  currency?: string;
  /** Tampilkan garis pemindai yang menyapu struk. */
  scanning?: boolean;
  delay?: number;
}

/** Struk belanja dengan animasi pemindaian lalu item terdeteksi satu per satu. */
export const ReceiptScreen: React.FC<ReceiptScreenProps> = ({ title = 'Pindai Struk', store, items, currency = 'Rp', scanning = true, delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const stagger = useStagger('normal');
  const scanStart = delay + 0.6;
  const scanEnd = scanStart + 1.4;
  const scan = useProgress(scanStart, scanEnd);
  const fs = type.label;
  const total = items.reduce((s, it) => s + it.price, 0);
  return (
    <AppScreen title={title}>
      <div
        style={{
          position: 'relative',
          background: '#fffdf7',
          color: '#222',
          borderRadius: px(16),
          padding: px(28),
          fontFamily: theme.fonts.mono,
          fontSize: fs * 0.9,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: px(16) }}>{store}</div>
        {items.map((it, i) => (
          <Reveal key={i} delay={scanning ? stagger(i, scanEnd) : stagger(i, delay)} preset="slideLeft">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${px(6)}px 0`, gap: px(12) }}>
              <span>{it.name}</span>
              <span style={{ display: 'flex', gap: px(8) }}>
                {formatValue(it.price, { prefix: `${currency} ` })}
                {scanning ? <span style={{ color: theme.colors.success }}>✓</span> : null}
              </span>
            </div>
          </Reveal>
        ))}
        <div style={{ borderTop: `${px(2)}px dashed #bbb`, marginTop: px(12), paddingTop: px(12), display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>TOTAL</span>
          <span>{formatValue(total, { prefix: `${currency} ` })}</span>
        </div>
        {scanning && scan > 0 && scan < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${interpolate(scan, [0, 1], [0, 100])}%`,
              height: px(6),
              background: theme.colors.primary,
              boxShadow: `0 0 ${px(30)}px ${px(10)}px ${theme.colors.primary}66`,
            }}
          />
        ) : null}
      </div>
      {scanning ? (
        <Reveal delay={stagger(items.length, scanEnd) + 0.1} preset="pop" spring="snappy" style={{ alignSelf: 'center' }}>
          <div
            style={{
              padding: `${px(14)}px ${px(28)}px`,
              borderRadius: px(999),
              background: theme.colors.success,
              color: '#fff',
              fontWeight: 700,
              fontSize: fs,
            }}
          >
            ✓ {items.length} item terdeteksi
          </div>
        </Reveal>
      ) : null}
    </AppScreen>
  );
};
