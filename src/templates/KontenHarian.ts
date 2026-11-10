import type { VideoConfig } from '../core/types';
import type { ChartDatum, ComparisonRow, Feature, MapPoint, MapRegion, SceneConfig, StatsScene, TimelineStep } from '../scenes/types';
import { outroScene, seriesConfig, type Series, type SeriesOutro, type SeriesVideoBase } from './series';

/**
 * Satu bagian isi. Isi TEPAT SATU kunci konten (`angka`, `poin`, `langkah`, `grafik`, `banding`,
 * `kutipan`, `teks`, `kata`, `foto`, `peta`, `hitung`, atau `scene`); sisanya opsional.
 */
export interface Bagian {
  /** Judul bagian (≤ ±8 kata). */
  judul?: string;
  /** Kata di `judul` yang disorot. */
  highlight?: string;
  /** Label kecil di atas judul. */
  label?: string;
  /** Teks kecil di bawah judul (keterangan/sumber). */
  keterangan?: string;
  /** Kalimat yang dibacakan narator untuk bagian ini. Kosong = bagian ini tanpa suara. */
  narasi?: string;
  /** Kata/frasa narasi yang disorot di subtitle. */
  emphasis?: string[];

  /** Angka besar menghitung naik (1–3 angka). → scene `stats` */
  angka?: StatsScene['stats'];
  /** Daftar poin berikon (maks 4). String = judul saja. → scene `features` */
  poin?: (Feature | string)[];
  /** Langkah/urutan/kronologi. → scene `timeline` */
  langkah?: (TimelineStep | string)[];
  /** Grafik batang. → scene `chart` */
  grafik?: ChartDatum[];
  /** Opsi `grafik`: indeks batang disorot, label badge, awalan/akhiran angka. */
  sorot?: number;
  sorotLabel?: string;
  prefix?: string;
  suffix?: string;
  /** Tabel perbandingan: nama kolom + baris. → scene `comparison` (`sorot` = indeks kolom pemenang) */
  banding?: { kolom: string[]; baris: ComparisonRow[] };
  /** Kutipan tokoh/narasumber. → scene `testimonial` */
  kutipan?: { teks: string; oleh: string; jabatan?: string };
  /** Teks besar: satu kalimat atau beberapa baris bertumpuk. → scene `statement` */
  teks?: string | string[];
  /** Satu kata per ketukan memenuhi layar (kalimat pendek, ≤ ±8 kata). → scene `words` */
  kata?: string;
  /** Foto/video layar penuh (path di public/). → scene `broll` */
  foto?: string | string[];
  /** Pin di peta (nama kota bawaan atau lat/lon). → scene `map` */
  peta?: MapPoint[];
  wilayah?: MapRegion;
  /** Kalkulasi: baris nilai lalu total. → scene `calculation` */
  hitung?: { baris: { label: string; value: number; negative?: boolean }[]; total: { label: string; value: number }; catatan?: string };
  /** Jalan keluar: scene mentah apa pun dari `src/scenes/types.ts`. */
  scene?: SceneConfig;
}

export interface KontenHarianProps extends SeriesVideoBase {
  /** Rubrik/topik singkat, mis. "Keuangan" — tampil di HUD & di atas hook. */
  topik?: string;
  /** Kalimat pembuka (2 detik pertama menentukan). Pendek & memancing. */
  hook: string;
  /** Kata di hook yang disorot. */
  highlight?: string;
  /** Teks kecil di bawah hook. */
  subjudul?: string;
  /** Narasi hook. Default = teks hook (bila video bernarasi). */
  hookNarasi?: string;
  /** Isi video, 3–6 bagian. Ganti-ganti jenis agar visual tidak monoton. */
  bagian: Bagian[];
  /** Satu kalimat penutup isi (teks besar). `narasi` default = teksnya. */
  kesimpulan?: string | { teks: string | string[]; highlight?: string; narasi?: string };
  /** Sumber data, tampil kecil di bawah hook. */
  sumber?: string;
  /** Ganti sebagian penutup seri, atau `false` untuk tanpa penutup. */
  penutup?: Partial<SeriesOutro> | false;
}

const CONTENT_KEYS = ['angka', 'poin', 'langkah', 'grafik', 'banding', 'kutipan', 'teks', 'kata', 'foto', 'peta', 'hitung', 'scene'] as const;

function bagianScene(b: Bagian, i: number, id: string): SceneConfig {
  const used = CONTENT_KEYS.filter((k) => b[k] !== undefined);
  if (used.length !== 1) {
    throw new Error(`[${id}] bagian ke-${i + 1} harus punya tepat satu isi (${CONTENT_KEYS.join(' | ')}), ditemukan: ${used.join(', ') || 'tidak ada'}.`);
  }
  const head = { eyebrow: b.label, title: b.judul, highlight: b.highlight, subtitle: b.keterangan };
  const base = { narration: b.narasi, emphasis: b.emphasis };
  if (b.scene) return { ...b.scene, narration: b.scene.narration ?? b.narasi, emphasis: b.scene.emphasis ?? b.emphasis };
  if (b.angka) return { type: 'stats', ...head, ...base, stats: b.angka };
  if (b.poin) return { type: 'features', ...head, ...base, features: b.poin.map((f) => (typeof f === 'string' ? { title: f } : f)) };
  if (b.langkah) return { type: 'timeline', ...head, ...base, steps: b.langkah.map((s) => (typeof s === 'string' ? { title: s } : s)) };
  if (b.grafik) {
    return { type: 'chart', ...head, ...base, data: b.grafik, highlightBar: b.sorot, highlightLabel: b.sorotLabel, prefix: b.prefix, suffix: b.suffix };
  }
  if (b.banding) return { type: 'comparison', ...head, ...base, columns: b.banding.kolom, rows: b.banding.baris, highlightColumn: b.sorot };
  if (b.kutipan) return { type: 'testimonial', ...head, ...base, quote: b.kutipan.teks, author: b.kutipan.oleh, role: b.kutipan.jabatan };
  if (b.teks) {
    const lines = Array.isArray(b.teks) ? b.teks : [b.teks];
    return { type: 'statement', ...base, lines: lines.map((text) => ({ text, highlight: b.highlight && text.includes(b.highlight) ? b.highlight : undefined })) };
  }
  if (b.kata) return { type: 'words', ...base, words: b.kata, accent: b.highlight ? b.highlight.split(/\s+/) : undefined, caption: b.keterangan };
  if (b.foto) {
    const shots = (Array.isArray(b.foto) ? b.foto : [b.foto]).map((src) => ({ src }));
    return { type: 'broll', ...head, ...base, shots };
  }
  if (b.peta) return { type: 'map', ...head, ...base, points: b.peta, region: b.wilayah };
  const h = b.hitung!;
  return { type: 'calculation', ...head, ...base, lines: h.baris, total: h.total, note: h.catatan, prefix: b.prefix, suffix: b.suffix };
}

/**
 * Konten harian topik apa pun (keuangan, politik, sosial, tips):
 * Hook → bagian-bagian isi → (Kesimpulan) → Penutup seri.
 * Bila ada `narasi` di bagian mana pun, video otomatis bersuara + subtitle (jalankan `npm run narasi`).
 */
export function kontenHarian(series: Series, p: KontenHarianProps): VideoConfig {
  const narrated = p.bagian.some((b) => b.narasi || b.scene?.narration) || Boolean(p.hookNarasi);
  const k = typeof p.kesimpulan === 'string' ? { teks: p.kesimpulan } : p.kesimpulan;
  const kLines = k ? (Array.isArray(k.teks) ? k.teks : [k.teks]) : [];
  return seriesConfig(
    series,
    p,
    [
      {
        type: 'hero',
        // Video bernarasi sudah menampilkan topik di HUD.
        eyebrow: narrated && series.overlay !== false ? undefined : p.topik,
        title: p.hook,
        highlight: p.highlight,
        subtitle: p.subjudul ?? (p.sumber ? `Sumber: ${p.sumber}` : undefined),
        duration: 3,
        narration: narrated ? p.hookNarasi ?? p.hook : undefined,
      },
      ...p.bagian.map((b, i) => bagianScene(b, i, p.slug)),
      k
        ? {
            type: 'statement',
            lines: kLines.map((text) => ({ text, highlight: k.highlight && text.includes(k.highlight) ? k.highlight : undefined })),
            narration: narrated ? k.narasi ?? kLines.join(' ') : undefined,
          }
        : null,
      outroScene(series, p.penutup, narrated),
    ],
    { hudLabel: p.topik },
  );
}
