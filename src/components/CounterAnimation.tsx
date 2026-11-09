import React from 'react';
import { type TypeSize } from '../config';
import { Reveal, formatNumber, useCountUp } from '../motion';
import { useTheme } from '../themes';
import { BodyText, GradientText } from './primitives';

export interface CounterAnimationProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label?: string;
  delay?: number;
  size?: TypeSize;
  gradient?: boolean;
  align?: 'left' | 'center';
}

/** Angka yang menghitung naik dengan spring, diformat gaya Indonesia (1.250.000). */
export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  value,
  prefix,
  suffix,
  decimals = 0,
  label,
  delay = 0,
  size = 'h1',
  gradient = true,
  align = 'center',
}) => {
  const { theme, type, px } = useTheme();
  const current = useCountUp(value, { delay });
  const text = (
    <>
      {prefix}
      <span style={{ fontVariantNumeric: theme.tabularNumbers ? 'tabular-nums' : undefined }}>{formatNumber(current, decimals)}</span>
      {suffix}
    </>
  );
  return (
    <Reveal delay={delay} style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: px(8) }}>
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: theme.fontWeights.heading,
          fontSize: type[size],
          letterSpacing: `${theme.headingTracking}em`,
          lineHeight: 1.05,
          color: theme.colors.text,
          whiteSpace: 'nowrap',
        }}
      >
        {gradient ? <GradientText>{text}</GradientText> : text}
      </div>
      {label ? (
        <BodyText size="caption" align={align}>
          {label}
        </BodyText>
      ) : null}
    </Reveal>
  );
};
