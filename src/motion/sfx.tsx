import React, { createContext, useContext } from 'react';
import { Html5Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { SFX_FILES, SFX_LENGTH, SFX_VOLUME, type SfxName } from '../config';

/** Kategori SFX — bisa dimatikan terpisah lewat config `sfx`. */
export type SfxCategory = 'transitions' | 'elements' | 'counters';

export interface SfxState {
  volume: number;
  transitions: boolean;
  elements: boolean;
  counters: boolean;
}

/** Di luar MotionVideo (pratinjau komponen) SFX mati. */
const OFF: SfxState = { volume: 0, transitions: false, elements: false, counters: false };
const SfxContext = createContext<SfxState>(OFF);

export const SfxProvider: React.FC<{ value: SfxState; children: React.ReactNode }> = ({ value, children }) => (
  <SfxContext.Provider value={value}>{children}</SfxContext.Provider>
);

export function useSfx(): SfxState {
  return useContext(SfxContext);
}

/** Kategori bawaan tiap suara. */
const CATEGORY: Record<SfxName, SfxCategory> = {
  whoosh: 'transitions',
  whooshSoft: 'transitions',
  swipe: 'elements',
  pop: 'elements',
  tick: 'elements',
  impact: 'elements',
  riser: 'elements',
  ting: 'counters',
};

export interface SfxProps {
  name: SfxName;
  /** Detik dari awal Sequence/scene saat suara diputar. Negatif = tidak diputar. */
  at: number;
  /** Pengali volume (1 = standar preset). */
  volume?: number;
  /** Pilih varian nada secara deterministik (mis. indeks elemen). */
  seed?: number;
  /** Paksa kategori (default menurut nama suara). */
  category?: SfxCategory;
}

/**
 * Efek suara pada waktu tertentu. Mengikuti pengaturan `sfx` video (volume,
 * kategori yang aktif); di luar video tidak berbunyi. Tidak merender apa pun di layar.
 */
export const Sfx: React.FC<SfxProps> = ({ name, at, volume = 1, seed = 0, category }) => {
  const state = useSfx();
  const { fps } = useVideoConfig();
  if (at < 0 || !state[category ?? CATEGORY[name]] || state.volume <= 0) return null;
  const files = SFX_FILES[name];
  const file = files[Math.abs(Math.round(seed * 7.13)) % files.length];
  const v = Math.min(1, SFX_VOLUME[name] * volume * state.volume);
  return (
    <Sequence from={Math.round(at * fps)} durationInFrames={Math.ceil(SFX_LENGTH[name] * fps) + 1} layout="none" name={`SFX ${name}`}>
      <Html5Audio src={staticFile(`sfx/${file}.wav`)} volume={v} />
    </Sequence>
  );
};
