import React from 'react';
import { interpolate } from 'remotion';
import { useFloat, useSpring } from '../motion';
import { useTheme } from '../themes';

export interface PhoneMockupProps {
  children?: React.ReactNode;
  /** Lebar ponsel (px basis 1080). */
  width?: number;
  delay?: number;
  /** Melayang halus saat idle. */
  float?: boolean;
  /** Kemiringan 3D awal (derajat). */
  tilt?: number;
}

/** Ponsel modern (dynamic island). Isi layar lewat children. */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({ children, width = 520, delay = 0, float = true, tilt = 14 }) => {
  const { theme, px } = useTheme();
  const p = useSpring({ delay, spring: 'heavy' });
  const floatY = useFloat(10, 5);
  const w = px(width);
  const h = w * 2.06;
  const bezel = w * 0.035;
  const radius = w * 0.16;
  return (
    <div style={{ perspective: px(2400) }}>
      <div
        style={{
          width: w,
          height: h,
          borderRadius: radius,
          background: '#0d0d0f',
          padding: bezel,
          boxSizing: 'border-box',
          boxShadow: `0 0 0 ${px(3)}px #2c2c30, ${theme.shadow.elevated}`,
          transform: `translateY(${interpolate(p, [0, 1], [px(500), 0]) + (float ? floatY : 0)}px) rotateX(${interpolate(p, [0, 1], [tilt, 0])}deg)`,
          opacity: Math.min(1, p * 2),
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: radius - bezel,
            overflow: 'hidden',
            background: theme.mode === 'dark' ? '#111114' : '#ffffff',
            position: 'relative',
          }}
        >
          {children}
          <div
            style={{
              position: 'absolute',
              top: w * 0.03,
              left: '50%',
              width: w * 0.3,
              height: w * 0.085,
              marginLeft: -w * 0.15,
              borderRadius: w,
              background: '#000',
            }}
          />
        </div>
      </div>
    </div>
  );
};
