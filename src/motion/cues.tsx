import React, { createContext, useCallback, useContext } from 'react';

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

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

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
      const target = phrase.split(/\s+/).map(norm).filter(Boolean);
      let seen = 0;
      for (let i = 0; i < words.length; i++) {
        if (target.every((t, k) => words[i + k] && norm(words[i + k].w) === t)) {
          seen++;
          if (seen === Number(nth ?? 1)) return words[i].start;
        }
      }
      return fallback;
    },
    [words],
  );
}
