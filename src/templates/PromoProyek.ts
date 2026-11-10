import type { VideoConfig } from '../core/types';
import type { DeviceScene, Feature, NotificationData, SceneConfig, ScreenConfig, StatsScene } from '../scenes/types';
import { outroScene, seriesConfig, type Series, type SeriesOutro, type SeriesVideoBase } from './series';

/** Satu tampilan aplikasi/website di dalam mockup perangkat. */
export interface LayarPromo {
  /** Path screenshot di public/ (mis. 'brands/x/home.jpg') atau isi layar buatan (`ScreenConfig`). */
  layar: string | ScreenConfig;
  judul?: string;
  highlight?: string;
  bullets?: string[];
  notifications?: NotificationData[];
  /** Default `phone`; `browser` untuk website/dashboard. */
  device?: DeviceScene['device'];
  narasi?: string;
}

export interface PromoProyekProps extends SeriesVideoBase {
  /** Kalimat pembuka: masalah penonton, bentuk pertanyaan/pernyataan tajam. */
  hook: string;
  highlight?: string;
  /** 2–3 keluhan singkat (teks besar bertumpuk) sesudah hook. Opsional. */
  masalah?: string[];
  /** Kalimat perkenalan produk, mis. "Kenalkan PriceAtlas." */
  solusi: string;
  solusiHighlight?: string;
  /** Satu kalimat penjelas di bawah `solusi`. */
  tagline?: string;
  /** Tampilan produk (1–3). String = path screenshot. */
  layar?: (string | LayarPromo)[];
  /** Fitur/manfaat utama (maks 4). */
  fitur: Feature[];
  fiturJudul?: string;
  /** Bukti angka (1–3). Hanya angka nyata. */
  bukti?: StatsScene['stats'];
  testimoni?: { teks: string; oleh: string; jabatan?: string };
  /** Ganti sebagian penutup seri (tombol, judul, url) untuk video ini. */
  cta?: Partial<SeriesOutro>;
  /** Narasi per bagian (opsional). Isi salah satu → video bersuara + subtitle. `layar` bisa juga lewat `LayarPromo.narasi`. */
  narasi?: { hook?: string; masalah?: string; solusi?: string; fitur?: string; bukti?: string; testimoni?: string; cta?: string };
}

/**
 * Iklan sebuah proyek/aplikasi: Hook (masalah) → (Keluhan) → Solusi → Tampilan produk → Fitur → (Bukti) → CTA.
 * Cocok untuk Reels/TikTok 20–35 dtk. Brand, tema, suara, dan CTA baku datang dari seri.
 */
export function promoProyek(series: Series, p: PromoProyekProps): VideoConfig {
  const n = p.narasi ?? {};
  const layar: LayarPromo[] = (p.layar ?? []).map((l) => (typeof l === 'string' ? { layar: l } : l));
  const narrated = Object.values(n).some(Boolean) || layar.some((l) => l.narasi);
  const scenes: (SceneConfig | null)[] = [
    { type: 'hero', title: p.hook, highlight: p.highlight, duration: 3, narration: n.hook ?? (narrated ? p.hook : undefined) },
    p.masalah?.length ? { type: 'statement', lines: p.masalah.map((text) => ({ text })), duration: 3.5, narration: n.masalah } : null,
    { type: 'logo', duration: 2.5 },
    { type: 'hero', eyebrow: `Kenalkan ${series.brand.name}`, title: p.solusi, highlight: p.solusiHighlight, subtitle: p.tagline, duration: 3.5, narration: n.solusi },
    ...layar.map(
      (l): SceneConfig => ({
        type: 'device',
        title: l.judul,
        highlight: l.highlight,
        bullets: l.bullets,
        notifications: l.notifications,
        device: l.device,
        screen: typeof l.layar === 'string' ? { kind: 'image', src: l.layar } : l.layar,
        duration: 5,
        narration: l.narasi,
      }),
    ),
    { type: 'features', title: p.fiturJudul, features: p.fitur, duration: 5, narration: n.fitur },
    p.bukti?.length ? { type: 'stats', stats: p.bukti, duration: 3.5, narration: n.bukti } : null,
    p.testimoni ? { type: 'testimonial', quote: p.testimoni.teks, author: p.testimoni.oleh, role: p.testimoni.jabatan, narration: n.testimoni } : null,
    outroScene(series, { ...p.cta, narasi: n.cta ?? p.cta?.narasi ?? series.outro?.narasi }, narrated),
  ];
  // Logo terpisah hanya untuk video tanpa narasi (video bernarasi langsung ke kalimat solusi agar tempo terjaga).
  return seriesConfig(series, p, narrated ? scenes.filter((s) => s?.type !== 'logo') : scenes);
}
