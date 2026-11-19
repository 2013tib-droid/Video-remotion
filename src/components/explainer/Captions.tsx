import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme } from '../../themes';

export interface CaptionWord {
  w: string;
  /** Detik absolut pada video. */
  start: number;
  end: number;
  emphasis?: boolean;
}

interface Page {
  words: CaptionWord[];
  start: number;
  end: number;
}

const MAX_WORDS = 5;
const MAX_CHARS = 26;

/** Kelompokkan kata jadi "halaman" subtitle pendek; putus di tanda baca. */
export function paginate(words: CaptionWord[]): Page[] {
  const pages: Page[] = [];
  let cur: CaptionWord[] = [];
  const flush = () => {
    if (cur.length) pages.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  words.forEach((word, i) => {
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0) + word.w.length;
    const gap = cur.length ? word.start - cur[cur.length - 1].end : 0;
    if (cur.length && (cur.length >= MAX_WORDS || chars > MAX_CHARS || gap > 0.45)) flush();
    cur.push(word);
    const next = words[i + 1];
    if (/[.,?!:;]$/.test(word.w) && (!next || next.start - word.end > 0.12 || cur.length >= 2)) flush();
  });
  flush();
  return pages;
}

/**
 * Subtitle karaoke: kotak gelap, kata yang sedang diucapkan disorot.
 * `variant: 'sinema'` = tanpa kotak: serif putih bayangan lembut, kata memudar masuk saat diucapkan.
 */
export const Captions: React.FC<{ words: CaptionWord[]; bottom: number; variant?: 'kotak' | 'sinema' }> = ({ words, bottom, variant = 'kotak' }) => {
  const { theme, px } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pages = useMemo(() => paginate(words), [words]);
  const idx = pages.findIndex((p, i) => t >= p.start - 0.05 && t < Math.max(p.end + 0.5, 0) && (!pages[i + 1] || t < pages[i + 1].start - 0.05));
  if (idx < 0) return null;
  const page = pages[idx];
  if (variant === 'sinema') {
    const out = interpolate(t, [page.end + 0.25, page.end + 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const next = pages[idx + 1];
    const fade = next && next.start - page.end < 0.6 ? 1 : out;
    return (
      <div style={{ position: 'absolute', left: px(80), right: px(80), bottom: px(bottom), display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: px(860),
            lineHeight: 1.3,
            fontFamily: '"Cormorant Garamond", "Lora", "Amiri", serif',
            fontWeight: 700,
            fontSize: px(58),
            color: '#fffaf0',
            opacity: fade,
            textShadow: '0 2px 6px rgba(0,0,0,0.75), 0 0 28px rgba(0,0,0,0.55)',
          }}
        >
          {page.words.map((word, i) => {
            const p = interpolate(t, [word.start - 0.06, word.start + 0.16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <React.Fragment key={i}>
                {i > 0 ? ' ' : null}
                <span
                  style={{
                    display: 'inline-block',
                    opacity: p,
                    filter: `blur(${(1 - p) * px(6)}px)`,
                    transform: `translateY(${(1 - p) * px(8)}px)`,
                    color: word.emphasis ? (theme.colors.highlight ?? theme.colors.accent) : undefined,
                  }}
                >
                  {word.w}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }
  const appear = interpolate(t, [page.start - 0.05, page.start + 0.08], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: px(70),
        right: px(70),
        bottom: px(bottom),
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        transform: `scale(${appear})`,
      }}
    >
      <div style={{ maxWidth: px(880), lineHeight: 1.5 }}>
        <span
          style={{
            background: 'rgba(0,0,0,0.88)',
            border: `${px(2)}px solid rgba(255,255,255,0.08)`,
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
            padding: `${px(6)}px ${px(18)}px`,
            borderRadius: px(16),
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            fontSize: px(54),
            color: '#ffffff',
          }}
        >
          {page.words.map((word, i) => {
            const next = page.words[i + 1];
            const active = t >= word.start - 0.03 && t < (next ? next.start - 0.03 : word.end + 0.25);
            const said = t >= word.start - 0.03;
            return (
              <React.Fragment key={i}>
                {i > 0 ? ' ' : null}
                <span
                  style={{
                    borderRadius: px(10),
                    padding: `0 ${px(6)}px`,
                    margin: `0 ${px(-6)}px`,
                    background: active ? (theme.colors.highlight ?? theme.colors.primary) : 'transparent',
                    color: active ? (theme.colors.onHighlight ?? theme.colors.onPrimary) : word.emphasis ? (theme.colors.highlight ?? theme.colors.primary) : said ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {word.w}
                </span>
              </React.Fragment>
            );
          })}
        </span>
      </div>
    </div>
  );
};
