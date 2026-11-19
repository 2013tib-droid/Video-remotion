import React from 'react';
import type { SinemaScene, SinemaSet, SinemaShot } from '../../scenes/types';
import { LangitSet, MasjidSet } from './exterior';
import { JendelaSet, MihrabSet } from './interior';
import { AirSet, AnakSet, BerbagiSet, DompetSet, MushafSet, SarapanSet } from './closeup';
import { KartuSet, PolaSet, PonselSet } from './graphic';
import type { Tone } from './type';

export type SinemaSetView = React.FC<{ shot: SinemaShot; scene: SinemaScene }>;

/** Peta nama panggung → komponen. */
export const SINEMA_SETS: Record<SinemaSet, SinemaSetView> = {
  masjid: ({ shot, scene }) => <MasjidSet time={shot.time} crowd={shot.crowd} flare={scene.flare} dust={scene.dust} />,
  langit: () => <LangitSet />,
  mihrab: ({ scene }) => <MihrabSet dust={scene.dust} />,
  jendela: ({ scene }) => <JendelaSet dust={scene.dust} />,
  dompet: ({ shot }) => <DompetSet note={shot.note} />,
  sarapan: () => <SarapanSet />,
  berbagi: () => <BerbagiSet />,
  anak: () => <AnakSet />,
  air: () => <AirSet />,
  mushaf: () => <MushafSet />,
  pola: () => <PolaSet />,
  ponsel: () => <PonselSet />,
  kartu: () => <KartuSet />,
};

/** Warna teks yang terbaca di atas panggung: `light` = teks terang (panggung gelap). */
export function setTone(set: SinemaSet): Tone {
  return set === 'kartu' ? 'dark' : 'light';
}
