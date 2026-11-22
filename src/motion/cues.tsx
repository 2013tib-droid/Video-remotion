import React, { createContext, useCallback, useContext } from 'react';
import { CUE_SYNC } from '../config';
import { useSceneMotion } from './scene';

export interface CueWord {
  w: string;
  /** Detik relatif terhadap awal SCENE. */
  start: number;
  end: number;
}

const CueContext = createContext<CueWord[]>([]);

export const CueProvider: React.FC<{ words: CueWord[]; children: React.ReactNode }> = ({ words, children }) => (
  <CueContext.Provider value={words}>{children}</CueContext.Provider>
);

/** Kata narasi scene ini (detik relatif awal scene). Kosong bila scene tidak bernarasi. */
export function useCueWords(): CueWord[] {
  return useContext(CueContext);
}

export const normWord = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Waktu (detik dari awal scene) sebuah cue.
 * - number → dipakai apa adanya.
 * - "kata" → saat kata itu mulai diucapkan di narasi scene ini.
 * - "kata#2" → kemunculan ke-2. Frasa ("arah angin") → kata pertamanya.
 * Bila tidak ditemukan → `fallback`.
 */
export function useCue(): (at: string | number | undefined, fallback: number) => number {
  const words = useContext(CueContext);
  return useCallback(
    (at, fallback) => {
      if (typeof at === 'number') return at;
      if (!at) return fallback;
      const [phrase, nth] = at.split('#');
      const target = phrase.split(/\s+/).map(normWord).filter(Boolean);
      let seen = 0;
      for (let i = 0; i < words.length; i++) {
        if (target.every((t, k) => words[i + k] && normWord(words[i + k].w) === t)) {
          seen++;
          if (seen === Number(nth ?? 1)) return words[i].start;
        }
      }
      return fallback;
    },
    [words],
  );
}

/** Satu item isi scene data: `at` eksplisit dan/atau teks label untuk dicocokkan ke narasi. */
export interface CueItem {
  at?: string | number;
  text?: string;
}

const STOPWORDS = new Set<string>(CUE_SYNC.stopwords);
const labelTokens = (text: string) =>
  text
    .split(/[\s·/,()|–—-]+/)
    .map(normWord)
    .filter((t) => t.length >= CUE_SYNC.minTokenLength && !STOPWORDS.has(t));
const sameWord = (spoken: string, token: string) =>
  spoken === token || (token.length >= CUE_SYNC.prefixMinLength && spoken.startsWith(token));

/**
 * Waktu muncul (detik dari awal scene) tiap item isi scene data.
 * 1. `at` eksplisit → selalu dipakai (detik atau kata narasi).
 * 2. Scene ber-`sync: 'auto'` + bernarasi → saat kata pertama label item diucapkan (berurutan maju,
 *    tidak pernah mundur), muncul `CUE_SYNC.lead` dtk lebih awal.
 * 3. Selain itu → `fallback(i)` (jeda bergiliran lama). Item yang tidak ketemu setelah item yang
 *    tersinkron menyusul `CUE_SYNC.after` dtk setelah item sebelumnya.
 * Mengembalikan `undefined` bila tidak ada item yang tersinkron → komponen memakai perilaku lama persis.
 */
export function useItemTimes(items: CueItem[], fallback: (i: number) => number): number[] | undefined {
  const words = useContext(CueContext);
  const cue = useCue();
  const sync = Boolean(useSceneMotion()?.sync);
  const out: number[] = [];
  let cursor = 0;
  let prev: number | null = null;
  let anchored = false;
  items.forEach((it, i) => {
    let t: number | null = null;
    if (it.at !== undefined && it.at !== '') {
      const v = cue(it.at, Number.NaN);
      if (!Number.isNaN(v)) t = v;
    } else if (sync && words.length && it.text) {
      const tokens = labelTokens(it.text);
      for (let j = cursor; j < words.length && t === null; j++) {
        const spoken = normWord(words[j].w);
        if (spoken && tokens.some((tk) => sameWord(spoken, tk))) {
          t = Math.max(CUE_SYNC.earliest, words[j].start - CUE_SYNC.lead);
          cursor = j + 1;
        }
      }
    }
    if (t === null) t = anchored && prev !== null ? prev + CUE_SYNC.after : fallback(i);
    else anchored = true;
    out.push(t);
    prev = t;
  });
  return anchored ? out : undefined;
}
