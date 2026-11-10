import type { BackgroundKind } from '../themes';
import type { CameraSetting, FormatName, IconStyle, MotionEnergy, SfxSetting, TransitionName } from '../config';
import type { Brand, VideoConfig } from '../core/types';
import type { VoiceSettings } from '../core/narration';
import type { SceneConfig } from '../scenes/types';
import type { ThemeName, ThemeOverrides } from '../themes';

/** Suara narasi default (pilihan pengguna). */
export const DEFAULT_VOICE: VoiceSettings = { name: 'id-ID-Ardi:DragonHDLatestNeural', rate: '+10%' };

/** Penutup baku sebuah seri (scene `cta` terakhir). */
export interface SeriesOutro {
  title: string;
  highlight?: string;
  button: string;
  subtitle?: string;
  badges?: string[];
  url?: string;
  /** Kalimat narasi penutup (hanya dipakai bila video bernarasi). */
  narasi?: string;
}

/**
 * SERI = semua hal yang SAMA di setiap video sebuah brand/kanal: brand, tema, suara,
 * transisi, musik, penutup. Ditulis sekali di `src/projects/<brand>/series.ts`;
 * video baru cukup berisi topik (lihat `kontenHarian` & `promoProyek`).
 */
export interface Series {
  brand: Brand;
  /** Awalan ID video. Default: nama brand tanpa spasi. ID akhir = `<idPrefix>-<slug>`. */
  idPrefix?: string;
  theme: ThemeName;
  themeOverrides?: ThemeOverrides;
  /** Default `vertical` (9:16). */
  format?: FormatName;
  /** Default `mix` (transisi bergiliran). */
  transition?: TransitionName;
  motion?: { energy?: MotionEnergy; camera?: CameraSetting; exit?: boolean; icons?: IconStyle };
  sfx?: SfxSetting;
  /** Musik latar semua video seri ini: `'tenang'` · `'semangat'` · `'korporat'` atau `{ src, volume }`. */
  audio?: VideoConfig['audio'];
  /** Watermark semua video seri ini: `true` (logo + nama brand) atau teks, mis. `'@harian.id'`. */
  watermark?: VideoConfig['watermark'];
  /** Suara narasi. Default Ardi HD +10%. `lexicon` di sini berlaku untuk semua video. */
  voice?: VoiceSettings;
  /** Lapisan explainer (HUD brand + subtitle karaoke) pada video bernarasi. Default true. */
  overlay?: boolean;
  /** Latar bergiliran per scene agar tidak monoton. Default gradient → pattern → particles. `false` = dari tema. */
  backgrounds?: BackgroundKind[] | false;
  /** Penutup baku. */
  outro?: SeriesOutro;
}

/** Helper identitas (autocomplete + type-check). */
export function defineSeries(series: Series): Series {
  return series;
}

/** Properti yang boleh diganti per video. */
export interface SeriesVideoBase {
  /** Bagian akhir ID, mis. `Inflasi-Okt26` → `<idPrefix>-Inflasi-Okt26`. */
  slug: string;
  theme?: ThemeName;
  format?: FormatName;
  /** Durasi total target (detik). Diabaikan bila video bernarasi (mengikuti suara). */
  duration?: number;
  transition?: TransitionName;
  /** Ganti musik seri untuk video ini (`false` = tanpa musik). */
  audio?: VideoConfig['audio'];
  /** Ganti watermark seri untuk video ini (`false` = tanpa watermark). */
  watermark?: VideoConfig['watermark'];
  /** Tambahan ejaan lafal khusus video ini, mis. { PDB: 'Pe De Be' }. */
  lexicon?: Record<string, string>;
}

const BACKGROUNDS: BackgroundKind[] = ['gradient', 'pattern', 'particles'];

/** Rakit VideoConfig dari seri + daftar scene. Dipakai semua template berbasis seri. */
export function seriesConfig(
  series: Series,
  p: SeriesVideoBase,
  scenes: (SceneConfig | false | null | undefined)[],
  opts: { hudLabel?: string } = {},
): VideoConfig {
  const list = scenes.filter(Boolean) as SceneConfig[];
  const narrated = list.some((s) => s.narration);
  const cycle = series.backgrounds === false ? null : series.backgrounds ?? BACKGROUNDS;
  const voice = series.voice ?? DEFAULT_VOICE;
  return {
    id: `${series.idPrefix ?? series.brand.name.replace(/[^A-Za-z0-9]/g, '')}-${p.slug}`,
    brand: series.brand,
    theme: p.theme ?? series.theme,
    themeOverrides: series.themeOverrides,
    format: p.format ?? series.format ?? 'vertical',
    duration: p.duration,
    transition: p.transition ?? series.transition ?? 'mix',
    motion: series.motion,
    sfx: series.sfx,
    audio: p.audio ?? series.audio,
    watermark: p.watermark ?? series.watermark,
    voice: narrated ? { ...voice, lexicon: { ...voice.lexicon, ...p.lexicon } } : undefined,
    overlay: narrated && series.overlay !== false ? { hud: opts.hudLabel ? { label: opts.hudLabel } : undefined } : undefined,
    // b-roll & peta punya latar sendiri; scene dengan `background` eksplisit tidak ditimpa.
    scenes: list.map((s, i) =>
      cycle && !s.background && s.type !== 'broll' && s.type !== 'map' ? { ...s, background: cycle[i % cycle.length] } : s,
    ),
  };
}

/** Scene penutup dari `series.outro` (atau override per video). `false` = tanpa penutup. */
export function outroScene(series: Series, override: Partial<SeriesOutro> | false | undefined, narrated: boolean): SceneConfig | null {
  if (override === false) return null;
  const o = { ...series.outro, ...override };
  if (!o.title || !o.button) return null;
  const { narasi, ...cta } = o;
  return { type: 'cta', ...cta, title: o.title, button: o.button, narration: narrated ? narasi : undefined };
}
