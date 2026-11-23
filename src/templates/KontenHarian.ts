import type { VideoConfig } from '../core/types';
import type {
  AlurScene,
  AlurSimpul,
  ChartDatum,
  ComparisonRow,
  Feature,
  MapPoint,
  MapRegion,
  SceneBase,
  SceneConfig,
  SceneHeading,
  SelisihScene,
  StatsScene,
  TimelineStep,
  TrenScene,
} from '../scenes/types';
import { hookScene, maksudScene, variasi, type BagianMaksud, type HookPola } from './maksud';
import { outroScene, seriesConfig, type Series, type SeriesOutro, type SeriesVideoBase } from './series';

/** Isi scene tanpa properti dasar/judul (judul diambil dari `judul`/`label`/`keterangan` bagian). */
type Isi<S> = Omit<S, 'type' | keyof SceneBase | keyof SceneHeading>;

/**
 * Satu bagian isi. Cara yang disarankan: **`{ maksud, data, … }`** (lihat `BagianMaksud` di `./maksud.ts`) —
 * template memilih visualnya. Cara lama tetap valid: isi TEPAT SATU kunci konten (`angka`, `poin`, `langkah`,
 * `grafik`, `banding`, `kutipan`, `teks`, `kata`, `foto`, `peta`, `hitung`, `selisih`, `tren`, `alur`, atau `scene`).
 */
export type Bagian = BagianIsi | BagianMaksud;

/** Bagian dengan kunci isi (cara lama: penulis memilih tipe visualnya sendiri). */
export interface BagianIsi {
  /** Tidak dipakai bersama kunci isi — pakai `{ maksud, data }` saja. */
  maksud?: never;
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

  /** Catatan sumber kecil di bawah (≤ ±40 huruf) untuk `angka`, `selisih`, `tren`, `alur`. */
  catatan?: string;

  /** Angka besar menghitung naik. 1 angka = angka hero layar penuh (+ `pembanding`); 2–3 angka = kisi. → scene `stats` */
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
  /** Dua nilai berdampingan (beli vs buyback, sebelum vs sesudah) + selisih & % otomatis. → scene `selisih` */
  selisih?: Isi<SelisihScene>;
  /** Perubahan dari waktu ke waktu: 1–3 garis dari titik data yang diberikan. → scene `tren` */
  tren?: Isi<TrenScene>;
  /** Sebab-akibat 2–4 simpul (string = teks saja), atau `{ simpul, cabang? }`. → scene `alur` */
  alur?: (AlurSimpul | string)[] | Isi<AlurScene>;
  /** Jalan keluar: scene mentah apa pun dari `src/scenes/types.ts`. */
  scene?: SceneConfig;
}

export interface KontenHarianProps extends SeriesVideoBase {
  /** Rubrik/topik singkat, mis. "Keuangan" — tampil di HUD & di atas hook. */
  topik?: string;
  /**
   * Pembuka (2 detik pertama menentukan). Teks pendek & memancing (judul besar), atau **pola hook**
   * `{ pola: 'angka-konsekuensi' | 'asumsi-dibantah' | 'kontras' | 'kesalahan-umum' | 'pertanyaan', … }`
   * (lihat `HookPola` di `./maksud.ts`): elemen utama tampil penuh ≤ 0,5 dtk, narasi default dari isinya.
   */
  hook: string | HookPola;
  /** Kata di hook (teks) yang disorot. */
  highlight?: string;
  /** Teks kecil di bawah hook. */
  subjudul?: string;
  /** Narasi hook. Default = teks hook / dibangkitkan dari pola hook (bila video bernarasi). */
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

const CONTENT_KEYS = ['angka', 'poin', 'langkah', 'grafik', 'banding', 'kutipan', 'teks', 'kata', 'foto', 'peta', 'hitung', 'selisih', 'tren', 'alur', 'scene'] as const;

function bagianScene(bagian: Bagian, i: number, id: string): SceneConfig {
  if (bagian.maksud !== undefined) {
    const extra = CONTENT_KEYS.filter((k) => (bagian as unknown as Record<string, unknown>)[k] !== undefined);
    if (extra.length) throw new Error(`[${id}] bagian ke-${i + 1}: pakai \`maksud\` ATAU kunci isi, bukan keduanya (ditemukan: ${extra.join(', ')}).`);
    return maksudScene(bagian, i, id);
  }
  const b = bagian;
  const used = CONTENT_KEYS.filter((k) => b[k] !== undefined);
  if (used.length !== 1) {
    throw new Error(`[${id}] bagian ke-${i + 1} harus punya tepat satu isi (${CONTENT_KEYS.join(' | ')}), ditemukan: ${used.join(', ') || 'tidak ada'}.`);
  }
  const head = { eyebrow: b.label, title: b.judul, highlight: b.highlight, subtitle: b.keterangan };
  const base = { narration: b.narasi, emphasis: b.emphasis };
  if (b.scene) return { ...b.scene, narration: b.scene.narration ?? b.narasi, emphasis: b.scene.emphasis ?? b.emphasis };
  if (b.angka) return { type: 'stats', ...head, ...base, stats: b.angka, note: b.catatan };
  if (b.selisih) return { type: 'selisih', ...head, ...base, note: b.catatan, ...b.selisih };
  if (b.tren) return { type: 'tren', ...head, ...base, note: b.catatan, ...b.tren };
  if (b.alur) {
    const isi = Array.isArray(b.alur) ? { simpul: b.alur } : b.alur;
    const simpul = isi.simpul.map((n) => (typeof n === 'string' ? { text: n } : n));
    return { type: 'alur', ...head, ...base, note: b.catatan, ...isi, simpul };
  }
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
  const narrated = p.bagian.some((b) => b.narasi || (b.maksud === undefined && b.scene?.narration)) || Boolean(p.hookNarasi);
  const k = typeof p.kesimpulan === 'string' ? { teks: p.kesimpulan } : p.kesimpulan;
  const kLines = k ? (Array.isArray(k.teks) ? k.teks : [k.teks]) : [];
  // Video bernarasi sudah menampilkan topik di HUD.
  const eyebrow = narrated && series.overlay !== false ? undefined : p.topik;
  const subjudul = p.subjudul ?? (p.sumber ? `Sumber: ${p.sumber}` : undefined);
  const hook: SceneConfig =
    typeof p.hook === 'string'
      ? {
          type: 'hero',
          eyebrow,
          title: p.hook,
          highlight: p.highlight,
          subtitle: subjudul,
          duration: 3,
          narration: narrated ? p.hookNarasi ?? p.hook : undefined,
        }
      : hookScene(p.hook, { narrated, narasi: p.hookNarasi, subjudul, eyebrow, id: p.slug });
  // Bagian dari `maksud`: tipe sama berturut-turut (termasuk dengan hook) diberi varian bila ada.
  const isi = variasi(
    [hook, ...p.bagian.map((b, i) => bagianScene(b, i, p.slug))],
    [false, ...p.bagian.map((b) => b.maksud !== undefined)],
    ['vertical', 'portrait'].includes(p.format ?? series.format ?? 'vertical'),
  );
  return seriesConfig(
    series,
    p,
    [
      ...isi,
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
