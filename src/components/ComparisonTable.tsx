import React from 'react';
import { Reveal, useStagger } from '../motion';
import { useTheme } from '../themes';

export interface ComparisonRow {
  label: string;
  /** true = ✓, false = ✕, string = teks bebas. */
  values: (boolean | string)[];
}

export interface ComparisonTableProps {
  columns: string[];
  rows: ComparisonRow[];
  /** Index kolom (dari `columns`) yang disorot sebagai pemenang. */
  highlightColumn?: number;
  delay?: number;
}

/** Tabel perbandingan: baris muncul berurutan, kolom pemenang disorot. */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({ columns, rows, highlightColumn, delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const stagger = useStagger();
  const template = `1.4fr repeat(${columns.length}, 1fr)`;
  const cellPad = px(26);
  const hl = (c: number) => c === highlightColumn;
  const renderValue = (v: boolean | string, c: number) => {
    if (typeof v === 'string') {
      return (
        <span style={{ fontWeight: hl(c) ? theme.fontWeights.strong : theme.fontWeights.body, color: hl(c) ? theme.colors.primary : theme.colors.text }}>
          {v}
        </span>
      );
    }
    return (
      <span
        style={{
          width: px(52),
          height: px(52),
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: v ? theme.colors.success : theme.colors.surfaceAlt,
          color: v ? '#fff' : theme.colors.muted,
          fontWeight: 700,
        }}
      >
        {v ? '✓' : '✕'}
      </span>
    );
  };
  return (
    <div
      style={{
        width: '100%',
        maxWidth: px(1300),
        fontFamily: theme.fonts.body,
        fontSize: type.caption,
        borderRadius: px(theme.radius.md),
        background: theme.colors.surface,
        border: `${px(2)}px solid ${theme.colors.border}`,
        boxShadow: theme.shadow.card,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Reveal delay={delay} preset="fadeIn">
        <div style={{ display: 'grid', gridTemplateColumns: template, borderBottom: `${px(2)}px solid ${theme.colors.border}` }}>
          <div style={{ padding: cellPad }} />
          {columns.map((c, i) => (
            <div
              key={i}
              style={{
                padding: cellPad,
                textAlign: 'center',
                fontFamily: theme.fonts.heading,
                fontWeight: theme.fontWeights.heading,
                color: hl(i) ? theme.colors.onPrimary : theme.colors.text,
                background: hl(i) ? theme.gradient : undefined,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </Reveal>
      {rows.map((r, ri) => (
        <Reveal key={ri} delay={stagger(ri + 1, delay)} preset="fadeUp">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: template,
              alignItems: 'center',
              borderBottom: ri < rows.length - 1 ? `${px(1.5)}px solid ${theme.colors.border}` : undefined,
            }}
          >
            <div style={{ padding: cellPad, color: theme.colors.text }}>{r.label}</div>
            {r.values.map((v, c) => (
              <div
                key={c}
                style={{
                  padding: cellPad,
                  textAlign: 'center',
                  background: hl(c) ? `${theme.colors.primary}14` : undefined,
                  alignSelf: 'stretch',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {renderValue(v, c)}
              </div>
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
};
