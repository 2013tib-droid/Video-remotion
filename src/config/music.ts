/**
 * Musik latar. Trek bawaan ada di `public/music/` (disintesis `scripts/build-music.mjs`,
 * loop mulus). Dipakai lewat `audio` di config/seri: `audio: 'tenang'`.
 */
export const MUSIC_TRACKS = {
  /** Pad hangat + arpeggio pelan — penjelasan, edukasi, data. */
  tenang: { file: 'music/tenang.wav', length: 16, volume: 0.55 },
  /** Ketukan ringan 120 bpm — iklan, tips cepat, promo. */
  semangat: { file: 'music/semangat.wav', length: 16, volume: 0.5 },
  /** Petikan redam + pad — profil produk, korporat, laporan. */
  korporat: { file: 'music/korporat.wav', length: 19.2, volume: 0.55 },
} as const;

export type MusicName = keyof typeof MUSIC_TRACKS;

/** Volume default file musik sendiri (bukan trek bawaan). */
export const MUSIC_FILE_VOLUME = 0.8;

/** Video bernarasi: musik dikecilkan agar suara narator tetap jelas. */
export const MUSIC_NARRATION_DUCK = 0.35;

/** Waktu musik (detik). */
export const MUSIC_TIMING = {
  fadeIn: 0.5,
  fadeOut: 1.5,
} as const;

export interface MusicOptions {
  /** Nama trek bawaan (`tenang` · `semangat` · `korporat`) atau path file di public/. */
  src: MusicName | (string & {});
  /** Volume 0–1. Default: preset trek (file sendiri 0,8). Bernarasi: otomatis ×0,35. */
  volume?: number;
  /** Ulangi sampai video habis. Default: trek bawaan `true`, file sendiri `false`. */
  loop?: boolean;
  /** Detik musik masuk / memudar di akhir video. Default 0,5 / 1,5. */
  fadeIn?: number;
  fadeOut?: number;
}

/** `audio` di config: nama trek bawaan, objek opsi, atau `false` (tanpa musik). */
export type MusicSetting = MusicName | MusicOptions | false;

export function isMusicName(src: string): src is MusicName {
  return Object.prototype.hasOwnProperty.call(MUSIC_TRACKS, src);
}
