/**
 * NARASI (voice-over) — data hasil `npm run narasi`.
 *
 * Config menulis teks narasi per scene (`scene.narration`). Skrip
 * `scripts/narrate.mjs` merender teks itu jadi MP3 + waktu tiap kata, lalu
 * menyimpannya di `<config>.narration.json`. Config mengimpor JSON tersebut
 * ke `narration`, dan mesin memakainya untuk: durasi scene, audio, subtitle,
 * dan cue animasi (mis. "coret pilihan B saat kata 'higrometer' diucapkan").
 */

export interface NarrationWord {
  /** Kata seperti tertulis di naskah (dengan tanda baca). */
  w: string;
  /** Detik sejak awal klip. */
  start: number;
  end: number;
}

export interface NarrationClip {
  /** Path di public/. */
  src: string;
  /** Durasi audio (detik). */
  duration: number;
  words: NarrationWord[];
}

export interface NarrationData {
  /** Kunci = narrationKey(teks, suara). */
  clips: Record<string, NarrationClip>;
}

export interface VoiceSettings {
  /**
   * Nama suara Azure, mis. "id-ID-Ardi:DragonHDLatestNeural",
   * atau ElevenLabs: "elevenlabs:<voiceId>" (rate "+10%" → speed 1,1).
   */
  name: string;
  /** Kecepatan SSML, mis. "+10%". */
  rate?: string;
  /**
   * Ejaan khusus untuk MESIN SUARA saja (subtitle tetap ejaan asli).
   * Kunci = kata (tanpa membedakan huruf besar), nilai = ejaan lafal.
   */
  lexicon?: Record<string, string>;
}

/** Jeda sebelum narasi dimulai di setiap scene (detik). */
export const NARRATION_LEAD = 0.2;
/** Jeda minimum sesudah narasi selesai (detik). */
export const NARRATION_TAIL = 0.35;
/** Perkiraan kecepatan bicara bila audio belum dirender (kata/detik). */
export const ESTIMATED_WPS = 2.7;

/** FNV-1a 32-bit — dipakai juga oleh scripts/narrate.mjs (harus identik). */
export function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function narrationKey(text: string, voice?: VoiceSettings): string {
  const v = voice ? `${voice.name}|${voice.rate ?? ''}|${JSON.stringify(voice.lexicon ?? {})}` : '';
  return hashText(`${v}|${text.trim()}`);
}

/** Pecah teks narasi jadi kata (sama persis dengan skrip). */
export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

/** Klip untuk teks; bila belum dirender → klip perkiraan (tanpa audio) agar pratinjau tetap jalan. */
export function resolveClip(text: string, data?: NarrationData, voice?: VoiceSettings): NarrationClip & { estimated: boolean } {
  const clip = data?.clips[narrationKey(text, voice)];
  if (clip) return { ...clip, estimated: false };
  const words = splitWords(text);
  const step = 1 / ESTIMATED_WPS;
  return {
    src: '',
    duration: words.length * step,
    words: words.map((w, i) => ({ w, start: i * step, end: (i + 1) * step })),
    estimated: true,
  };
}

/** Normalisasi kata untuk pencocokan cue/emphasis. */
export const normWord = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
