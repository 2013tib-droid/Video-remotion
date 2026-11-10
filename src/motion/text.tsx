import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { ACCENT_ROTATION, type AccentStroke, type HighlightStyle, type TextAnimation, type TypeSize } from '../config';
import { useTheme } from '../themes';
import { normWord } from './cues';

/**
 * Pengaturan tipografi kinetik untuk scene yang sedang dirender.
 * Diisi MotionVideo per scene; di luar video nilainya default.
 */
export interface SceneText {
  /** Override gaya muncul kata (scene.textAnimation). */
  textAnimation?: TextAnimation;
  highlightStyle: HighlightStyle;
  /** Kata dari scene.emphasis (sudah dinormalisasi). */
  emphasis: string[];
  /** Jumlah kata sorotan di scene-scene sebelumnya → giliran coretan tetap sama tiap render. */
  accentBase: number;
}

const DEFAULT_SCENE_TEXT: SceneText = { highlightStyle: 'mix', emphasis: [], accentBase: 0 };
const SceneTextContext = createContext<SceneText>(DEFAULT_SCENE_TEXT);

export const SceneTextProvider: React.FC<{ value: SceneText; children: React.ReactNode }> = ({ value, children }) => (
  <SceneTextContext.Provider value={value}>{children}</SceneTextContext.Provider>
);

export function useSceneText(): SceneText {
  return useContext(SceneTextContext);
}

/** Kata dalam frasa (dinormalisasi), mis. dari highlight/emphasis. */
export function wordSet(...phrases: (string | string[] | undefined)[]): Set<string> {
  const out = new Set<string>();
  for (const p of phrases.flat()) for (const w of (p ?? '').split(/\s+/)) if (normWord(w)) out.add(normWord(w));
  return out;
}

/** Penanda kata sorotan per kata pada `text`. Dipakai Heading & penghitung giliran aksen. */
export function accentFlags(text: string, highlight?: string, emphasis: string[] = []): { hl: boolean; emph: boolean }[] {
  const hl = wordSet(highlight);
  const em = wordSet(emphasis);
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ hl: hl.has(normWord(w)), emph: em.has(normWord(w)) }));
}

/** Jumlah kata sorotan pada sebuah teks. */
export function countAccents(text: string | undefined, highlight?: string, emphasis: string[] = []): number {
  if (!text) return 0;
  return accentFlags(text, highlight, emphasis).filter((f) => f.hl || f.emph).length;
}

/** Coretan untuk kata sorotan ke-`index` (global dalam video). null = tanpa coretan. */
export function accentStroke(style: HighlightStyle, index: number): AccentStroke | null {
  if (style === 'mix') return ACCENT_ROTATION[index % ACCENT_ROTATION.length];
  if (style === 'marker' || style === 'underline' || style === 'circle') return style;
  return null;
}

/** Gaya muncul kata yang berlaku: prop → scene → tema → rise. Judul kecil tidak memakai `slam`. */
export function useTextAnimation(size: TypeSize = 'h1', override?: TextAnimation): TextAnimation {
  const ctx = useSceneText();
  const { theme } = useTheme();
  const anim = override ?? ctx.textAnimation ?? theme.motion.text ?? 'rise';
  const dramatic = size === 'display' || size === 'h1';
  return !dramatic && anim === 'slam' ? 'rise' : anim;
}

/**
 * Tunggu font tertentu termuat sebelum mengukur teks. Render ditahan
 * (delayRender) sampai siap, jadi hasil ukur selalu sama setiap render.
 */
export function useFontReady(font: string): boolean {
  const [ready, setReady] = useState(false);
  const handle = useRef<number | null>(null);
  if (handle.current === null && !ready) handle.current = delayRender(`Memuat font ${font}`);
  useEffect(() => {
    let alive = true;
    document.fonts
      .load(font)
      .catch(() => undefined)
      .then(() => {
        if (alive) setReady(true);
        if (handle.current !== null) {
          continueRender(handle.current);
          handle.current = -1;
        }
      });
    return () => {
      alive = false;
    };
  }, [font]);
  return ready;
}

let measureCanvas: HTMLCanvasElement | null = null;

/** Lebar teks (px) dengan font CSS `font` — deterministik setelah font termuat. */
export function measureText(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 0.6 * parseFloat(font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '16');
  measureCanvas ??= document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}
