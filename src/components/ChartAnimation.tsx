import React from 'react';
import { interpolate } from 'remotion';
import { Reveal, formatValue, useSpring, useStagger } from '../motion';
import { useTheme } from '../themes';

export interface ChartDatum {
  label: string;
  value: number;
}

export interface ChartAnimationProps {
  data: ChartDatum[];
  /** Index batang yang disorot. */
  highlight?: number;
  /** Teks badge pada batang yang disorot, mis. "Termurah". */
  highlightLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
  /** Tinggi area chart vertikal (px basis 1080). */
  height?: number;
  compact?: boolean;
}

const Bar: React.FC<{
  datum: ChartDatum;
  ratio: number;
  delay: number;
  highlighted: boolean;
  dimmed: boolean;
  props: ChartAnimationProps;
}> = ({ datum, ratio, delay, highlighted, dimmed, props }) => {
  const { theme, type, px } = useTheme();
  const grow = useSpring({ delay, spring: 'gentle' });
  const horizontal = props.orientation !== 'vertical';
  const fs = props.compact ? type.label * 0.8 : type.caption;
  const value = formatValue(datum.value * Math.min(1, grow), props);
  const fill = highlighted ? theme.gradient : dimmed ? theme.colors.surfaceAlt : theme.colors.primary;
  const label = (
    <div style={{ fontFamily: theme.fonts.body, fontSize: fs, color: theme.colors.muted, whiteSpace: 'nowrap' }}>{datum.label}</div>
  );
  const valueEl = (
    <div
      style={{
        fontFamily: theme.fonts.heading,
        fontWeight: theme.fontWeights.heading,
        fontSize: fs * 1.1,
        color: highlighted ? theme.colors.primary : theme.colors.text,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
        opacity: interpolate(grow, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
      }}
    >
      {value}
    </div>
  );
  if (horizontal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: px(10) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {label}
          {valueEl}
        </div>
        <div style={{ height: px(props.compact ? 22 : 44), borderRadius: px(999), background: theme.colors.surfaceAlt, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${ratio * grow * 100}%`,
              borderRadius: px(999),
              background: fill === theme.colors.surfaceAlt ? theme.colors.muted : fill,
              opacity: dimmed ? 0.45 : 1,
            }}
          />
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: px(10), height: '100%' }}>
      {valueEl}
      <div
        style={{
          width: '70%',
          height: `${ratio * grow * 80}%`,
          borderRadius: `${px(14)}px ${px(14)}px ${px(4)}px ${px(4)}px`,
          background: fill === theme.colors.surfaceAlt ? theme.colors.muted : fill,
          opacity: dimmed ? 0.45 : 1,
        }}
      />
      {label}
    </div>
  );
};

/** Grafik batang beranimasi (horizontal cocok untuk perbandingan harga). */
export const ChartAnimation: React.FC<ChartAnimationProps> = (props) => {
  const { data, highlight, highlightLabel, orientation = 'horizontal', delay = 0, height = 520 } = props;
  const { theme, type, px, space } = useTheme();
  const stagger = useStagger();
  const max = Math.max(...data.map((d) => d.value), 1);
  const lastDelay = stagger(data.length, delay);
  const bars = data.map((d, i) => (
    <Bar
      key={i}
      datum={d}
      ratio={d.value / max}
      delay={stagger(i, delay)}
      highlighted={highlight === i}
      dimmed={highlight !== undefined && highlight !== i}
      props={{ ...props, orientation }}
    />
  ));
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {orientation === 'vertical' ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: px(16), height: px(height) }}>{bars}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: props.compact ? px(14) : space.md }}>{bars}</div>
      )}
      {highlight !== undefined && highlightLabel ? (
        <Reveal delay={lastDelay + 0.3} preset="pop" spring="bouncy" style={{ display: 'flex', justifyContent: 'center', marginTop: space.md }}>
          <div
            style={{
              padding: `${px(14)}px ${px(30)}px`,
              borderRadius: px(999),
              background: theme.colors.success,
              color: '#fff',
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.heading,
              fontSize: type.caption,
            }}
          >
            ✓ {highlightLabel}: {data[highlight]?.label}
          </div>
        </Reveal>
      ) : null}
    </div>
  );
};
