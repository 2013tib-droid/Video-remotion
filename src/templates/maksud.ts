/**
 * MAKSUD → KOMPOSISI dan PRESET HOOK — logika pemilihan visual, murni (tanpa React), dipakai `kontenHarian`
 * dan template lain. Penulis cukup menulis maksud informasi + data; fungsi di sini memilih tipe scene yang tepat.
 *
 *   maksudScene(bagian, i, id)      → SceneConfig (galat jelas bila data tidak cocok dengan maksud)
 *   variasi(scenes, dariMaksud)     → tipe sama berturut-turut diberi varian (chart ⇄ orientasi, features ⇄ kolom)
 *   hookScene(hook, opsi)           → scene hook dari pola yang terbukti (`masuk: 'cepat'`, narasi default)
 *   bacaTeks(teks)                  → angka di teks ditulis seperti dibaca ("Rp400.000" → "empat ratus ribu rupiah")
 */
import type {
  AlurScene,
  AlurSimpul,
  ChartDatum,
  ComparisonRow,
  Feature,
  MapPoint,
  MapRegion,
  SceneConfig,
  SelisihScene,
  TimelineStep,
  TrenScene,
  TrenSeri,
  TrenTitik,
} from '../scenes/types';

/* ============================================================
 * Maksud
 * ============================================================ */

export const MAKSUD = [
  'satu-angka',
  'dua-nilai',
  'peringkat',
  'perubahan',
  'sebab-akibat',
  'urutan',
  'alasan',
  'atribut',
  'simulasi',
  'kesimpulan',
  'lokasi',
] as const;
export type Maksud = (typeof MAKSUD)[number];

/** Isi `selisih` tanpa properti dasar/judul. */
type IsiSelisih = Omit<SelisihScene, 'type' | 'eyebrow' | 'title' | 'highlight' | 'subtitle' | 'note' | keyof SceneConfigBase>;
type SceneConfigBase = Pick<SelisihScene, 'duration' | 'transition' | 'background' | 'camera' | 'exit' | 'narration' | 'emphasis' | 'chapter' | 'textAnimation' | 'highlightStyle' | 'sfx' | 'sync' | 'masuk'>;

export interface PeringkatItem {
  label: string;
  value: number;
  /** Muncul saat (detik / kata narasi). */
  at?: string | number;
}

/** Data per maksud. */
export interface DataMaksud {
  /** Satu angka penting → angka hero (`stats` 1 item). */
  'satu-angka': { value: number; label: string; prefix?: string; suffix?: string; decimals?: number; pembanding?: string; at?: string | number };
  /** Dua nilai (beli vs buyback, sebelum vs sesudah) → `selisih`. `a` = acuan. */
  'dua-nilai': IsiSelisih;
  /**
   * 2–6 nilai sejenis. 2 → `selisih`; 3–6 → `chart` horizontal, urut otomatis dari yang terbaik, yang terbaik disorot.
   * `terbaik`: `tinggi` (default) = nilai terbesar terbaik; `rendah` = terkecil terbaik (biaya, spread).
   */
  peringkat:
    | PeringkatItem[]
    | { item: PeringkatItem[]; terbaik?: 'tinggi' | 'rendah'; sorotLabel?: string; prefix?: string; suffix?: string; decimals?: number };
  /** Perubahan dari waktu ke waktu → `tren` (titik data nyata saja, ≥ 2 per garis). */
  perubahan:
    | (Omit<TrenScene, 'type' | 'eyebrow' | 'title' | 'highlight' | 'subtitle' | 'note' | keyof SceneConfigBase> & { titik?: never })
    | { titik: TrenTitik[]; label?: string; warna?: TrenSeri['warna']; skala?: TrenScene['skala']; cap?: TrenScene['cap']; arah?: TrenScene['arah']; prefix?: string; suffix?: string; decimals?: number; seri?: never };
  /** Sebab → akibat 2–4 simpul (+ 1 cabang) → `alur`. */
  'sebab-akibat': (AlurSimpul | string)[] | { simpul: (AlurSimpul | string)[]; cabang?: AlurScene['cabang'] };
  /** Urutan / kronologi 2–4 langkah → `timeline`. */
  urutan: (TimelineStep | string)[];
  /** Daftar alasan / faktor ≤ 4 → `features`. */
  alasan: (Feature | string)[] | { poin: (Feature | string)[]; kolom?: number };
  /** Beberapa atribut dibandingkan → `comparison`. `sorot` = indeks kolom pemenang. */
  atribut: { kolom: string[]; baris: ComparisonRow[]; sorot?: number };
  /** Simulasi / perhitungan → `calculation`. */
  simulasi: { baris: { label: string; value: number; negative?: boolean }[]; total: { label: string; value: number }; catatan?: string; prefix?: string; suffix?: string };
  /** Kesimpulan 1–2 baris teks besar → `statement`. */
  kesimpulan: string | string[];
  /** Lokasi → `map`. */
  lokasi: MapPoint[] | { titik: MapPoint[]; wilayah?: MapRegion };
}

/** Kepala bagian (sama untuk semua maksud). */
export interface KepalaBagian {
  /** Judul bagian (≤ ±8 kata). */
  judul?: string;
  /** Kata di `judul` yang disorot (untuk `kesimpulan`: kata di barisnya). */
  highlight?: string;
  /** Label kecil di atas judul. */
  label?: string;
  /** Teks kecil di bawah judul (keterangan). */
  keterangan?: string;
  /** Catatan sumber kecil di bawah (≤ ±40 huruf) — untuk satu-angka, dua-nilai, peringkat (2), perubahan, sebab-akibat. */
  catatan?: string;
  /** Kalimat yang dibacakan narator. Sebut label persis seperti di layar agar isi muncul saat disebut. */
  narasi?: string;
  /** Kata/frasa narasi yang disorot di subtitle. */
  emphasis?: string[];
}

/** Satu bagian berbasis maksud: `{ maksud, data, judul?, … }`. */
export type BagianMaksud = KepalaBagian & { [M in Maksud]: { maksud: M; data: DataMaksud[M] } }[Maksud];

const fail = (id: string, i: number, m: string, msg: string): never => {
  throw new Error(`[${id}] bagian ke-${i + 1} (maksud '${m}'): ${msg}`);
};
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isObj = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** Bagian maksud → scene. Melempar galat jelas (bagian ke-berapa) bila data tidak cocok dengan maksud. */
export function maksudScene(b: BagianMaksud, i: number, id: string): SceneConfig {
  const m = b.maksud as string;
  if (!(MAKSUD as readonly string[]).includes(m)) fail(id, i, m, `maksud tidak dikenal — pilih: ${MAKSUD.join(' | ')}`);
  const d = b.data as unknown;
  if (d === undefined || d === null) fail(id, i, m, '`data` kosong');
  const head = { eyebrow: b.label, title: b.judul, highlight: b.highlight, subtitle: b.keterangan };
  const base = { narration: b.narasi, emphasis: b.emphasis };
  const note = b.catatan;

  switch (b.maksud) {
    case 'satu-angka': {
      const x = b.data;
      if (!isObj(x) || !isNum(x.value) || typeof x.label !== 'string') fail(id, i, m, 'butuh `data: { value: angka, label }`');
      const { value, label, prefix, suffix, decimals, pembanding, at } = x;
      return { type: 'stats', ...head, ...base, stats: [{ value, label, prefix, suffix, decimals, pembanding, at }], note };
    }
    case 'dua-nilai': {
      const x = b.data;
      if (!isObj(x) || !isObj(x.a) || !isObj(x.b)) fail(id, i, m, 'butuh `data: { a: { label, value }, b: { label, value } }`');
      if (!isNum(x.a.value) || !isNum(x.b.value)) fail(id, i, m, '`a.value` dan `b.value` harus angka');
      return { type: 'selisih', ...head, ...base, note, ...x };
    }
    case 'peringkat': {
      const x = Array.isArray(b.data) ? { item: b.data } : b.data;
      if (!isObj(x) || !Array.isArray(x.item)) fail(id, i, m, 'butuh `data: [{ label, value }, …]` atau `{ item: […], terbaik? }`');
      const item = x.item;
      if (item.length < 2 || item.length > 6) fail(id, i, m, `butuh 2–6 item, ada ${item.length}`);
      if (item.some((it) => !isNum(it?.value) || typeof it?.label !== 'string')) fail(id, i, m, 'setiap item butuh `label` dan `value` angka');
      const rendah = x.terbaik === 'rendah';
      const fmt = { prefix: x.prefix, suffix: x.suffix, decimals: x.decimals };
      if (item.length === 2) {
        // Dua nilai → selisih (a = item pertama sebagai acuan); arah buruk = menjauhi yang terbaik.
        return { type: 'selisih', ...head, ...base, note, a: item[0], b: item[1], ...fmt, arah: rendah ? 'naik-buruk' : 'turun-buruk' };
      }
      const data: ChartDatum[] = [...item].sort((p, q) => (rendah ? p.value - q.value : q.value - p.value));
      return {
        type: 'chart',
        ...head,
        ...base,
        data,
        orientation: 'horizontal',
        highlightBar: 0,
        highlightLabel: x.sorotLabel ?? (rendah ? 'Terendah' : 'Terbaik'),
        ...fmt,
      };
    }
    case 'perubahan': {
      const x = b.data as DataMaksud['perubahan'];
      if (!isObj(x)) fail(id, i, m, 'butuh `data: { seri: [...] }` atau `{ titik: [...] }`');
      let seri: TrenSeri[];
      let rest: Omit<TrenScene, 'type' | 'seri'>;
      if (Array.isArray(x.titik)) {
        const { titik, label, warna, ...r } = x as Extract<DataMaksud['perubahan'], { titik: TrenTitik[] }>;
        seri = [{ label: label ?? b.judul ?? 'Nilai', titik, warna }];
        rest = r;
      } else if (Array.isArray(x.seri)) {
        const { seri: s, ...r } = x as Extract<DataMaksud['perubahan'], { seri: TrenSeri[] }>;
        seri = s;
        rest = r;
      } else {
        return fail(id, i, m, 'butuh `data.seri` (1–3 garis) atau `data.titik`');
      }
      if (!seri.length) fail(id, i, m, '`seri` kosong');
      for (const sr of seri) {
        // Dua titik tetap dua titik: garis lurus apa adanya, tanpa titik tengah rekaan.
        if (!Array.isArray(sr.titik) || sr.titik.length < 2) fail(id, i, m, `garis "${sr.label}" butuh ≥ 2 titik data nyata`);
        if (sr.titik.some((p) => !isNum(p?.value))) fail(id, i, m, `garis "${sr.label}": setiap titik butuh \`value\` angka`);
      }
      return { type: 'tren', ...head, ...base, note, ...rest, seri };
    }
    case 'sebab-akibat': {
      const x = Array.isArray(b.data) ? { simpul: b.data } : b.data;
      if (!isObj(x) || !Array.isArray(x.simpul)) fail(id, i, m, 'butuh `data: [simpul, …]` atau `{ simpul, cabang? }`');
      if (x.simpul.length < 2 || x.simpul.length > 4) fail(id, i, m, `butuh 2–4 simpul, ada ${x.simpul.length}`);
      const simpul = x.simpul.map((n) => (typeof n === 'string' ? { text: n } : n));
      return { type: 'alur', ...head, ...base, note, simpul, cabang: x.cabang };
    }
    case 'urutan': {
      const x = b.data;
      if (!Array.isArray(x) || x.length < 2) fail(id, i, m, 'butuh `data: [langkah, …]` (2–4 langkah)');
      return { type: 'timeline', ...head, ...base, steps: x.map((s) => (typeof s === 'string' ? { title: s } : s)) };
    }
    case 'alasan': {
      const x = Array.isArray(b.data) ? { poin: b.data } : b.data;
      if (!isObj(x) || !Array.isArray(x.poin) || !x.poin.length) fail(id, i, m, 'butuh `data: [poin, …]` (1–4 poin)');
      return { type: 'features', ...head, ...base, features: x.poin.map((f) => (typeof f === 'string' ? { title: f } : f)), columns: x.kolom };
    }
    case 'atribut': {
      const x = b.data;
      if (!isObj(x) || !Array.isArray(x.kolom) || !Array.isArray(x.baris) || !x.baris.length) fail(id, i, m, 'butuh `data: { kolom: [...], baris: [{ label, values }] }`');
      if (x.baris.some((r) => !Array.isArray(r?.values) || r.values.length !== x.kolom.length)) {
        fail(id, i, m, `setiap baris butuh ${x.kolom.length} nilai (sesuai jumlah kolom)`);
      }
      return { type: 'comparison', ...head, ...base, columns: x.kolom, rows: x.baris, highlightColumn: x.sorot };
    }
    case 'simulasi': {
      const x = b.data;
      if (!isObj(x) || !Array.isArray(x.baris) || !x.baris.length || !isObj(x.total) || !isNum(x.total.value)) {
        fail(id, i, m, 'butuh `data: { baris: [{ label, value }], total: { label, value } }`');
      }
      return { type: 'calculation', ...head, ...base, lines: x.baris, total: x.total, note: x.catatan ?? note, prefix: x.prefix, suffix: x.suffix };
    }
    case 'kesimpulan': {
      const x = b.data;
      const lines = Array.isArray(x) ? x : [x];
      if (!lines.length || lines.some((l) => typeof l !== 'string' || !l.trim())) fail(id, i, m, 'butuh `data: "teks"` atau `["baris 1", "baris 2"]`');
      return { type: 'statement', ...base, lines: lines.map((text) => ({ text, highlight: b.highlight && text.includes(b.highlight) ? b.highlight : undefined })) };
    }
    case 'lokasi': {
      const x = Array.isArray(b.data) ? { titik: b.data } : b.data;
      if (!isObj(x) || !Array.isArray(x.titik) || !x.titik.length) fail(id, i, m, 'butuh `data: [{ place | lat+lon, label? }]`');
      return { type: 'map', ...head, ...base, points: x.titik, region: x.wilayah };
    }
  }
  return fail(id, i, m, 'maksud tidak dikenal');
}

/**
 * Dua scene berturut-turut bertipe sama terasa seperti slide diulang. Untuk scene dari `maksud` (`dariMaksud[i]`),
 * pakai varian yang ada: `chart` vertikal ⇄ horizontal, `features` 1 ⇄ 2 kolom. Tanpa varian → dibiarkan
 * (`npm run cek` memberi peringatan). Scene lain tidak disentuh.
 */
export function variasi(scenes: SceneConfig[], dariMaksud: boolean[], portrait = true): SceneConfig[] {
  const out: SceneConfig[] = [];
  scenes.forEach((s, i) => {
    const prev = out[i - 1];
    if (!dariMaksud[i] || !prev || prev.type !== s.type) return void out.push(s);
    if (s.type === 'chart' && prev.type === 'chart') {
      const prevOri = prev.orientation ?? 'horizontal';
      return void out.push({ ...s, orientation: prevOri === 'horizontal' ? 'vertical' : 'horizontal' });
    }
    if (s.type === 'features' && prev.type === 'features' && s.columns === undefined) {
      const n = prev.features.length;
      const prevCols = prev.columns ?? (portrait ? (n > 4 ? 2 : 1) : Math.min(n, n === 4 ? 2 : 3));
      return void out.push({ ...s, columns: prevCols === 1 ? Math.min(2, s.features.length) : 1 });
    }
    out.push(s);
  });
  return out;
}

/* ============================================================
 * Preset hook
 * ============================================================ */

export interface NilaiKontras {
  label: string;
  value: number;
}

/** Pola hook yang terbukti. Elemen utama tampil penuh ≤ 0,5 dtk (`masuk: 'cepat'`), tidak menunggu narasi. */
export type HookPola =
  /** Angka + akibatnya: "Rp400.000" + "hilang dalam sehari". → `statement` (angka besar disorot). */
  | { pola: 'angka-konsekuensi'; angka: string; akibat: string; highlight?: string }
  /** Asumsi umum lalu bantahannya: "Emas dunia turun 8%" → "Di sini cuma 1%". → `statement` 2 baris. */
  | { pola: 'asumsi-dibantah'; asumsi: string; bantahan: string; highlight?: string }
  /** Dua nilai berhadapan. → `selisih` ringkas (selisih & % otomatis). */
  | {
      pola: 'kontras';
      a: NilaiKontras;
      b: NilaiKontras;
      prefix?: string;
      suffix?: string;
      decimals?: number;
      /** Judul kecil di atas (opsional, ≤ ±5 kata). */
      judul?: string;
      highlight?: string;
      selisihLabel?: string;
      arah?: SelisihScene['arah'];
      persen?: boolean;
      tanda?: boolean;
    }
  /** Kesalahan yang sering dilakukan (+ koreksi singkat). → `hero` dengan label "Kesalahan umum". */
  | { pola: 'kesalahan-umum'; kesalahan: string; koreksi?: string; highlight?: string }
  /** Pertanyaan yang dijawab video. → `hero`. */
  | { pola: 'pertanyaan'; teks: string; highlight?: string };

export const POLA_HOOK = ['angka-konsekuensi', 'asumsi-dibantah', 'kontras', 'kesalahan-umum', 'pertanyaan'] as const;

export interface OpsiHook {
  /** Video bernarasi → hook juga bernarasi (default dibangkitkan dari isi bila `narasi` kosong). */
  narrated: boolean;
  narasi?: string;
  /** Teks kecil di bawah (pola `hero`). */
  subjudul?: string;
  /** Label kecil di atas (pola `hero`, video tanpa HUD). */
  eyebrow?: string;
  /** ID video untuk pesan galat. */
  id?: string;
}

/** Kata pertama yang mengandung angka (untuk sorotan default). */
const angkaDi = (t: string) => t.split(/\s+/).find((w) => /\d/.test(w));
const kalimat = (t: string) => {
  const s = t.trim();
  return s ? s[0].toUpperCase() + s.slice(1) : s;
};
const titik = (t: string) => (/[.!?…]$/.test(t.trim()) ? t.trim() : `${t.trim()}.`);
const tanya = (t: string) => (/[?]$/.test(t.trim()) ? t.trim() : `${t.trim().replace(/[.!…]+$/, '')}?`);

/** Narasi default sebuah pola hook (angka ditulis seperti dibaca). */
export function narasiHook(h: HookPola): string {
  switch (h.pola) {
    case 'angka-konsekuensi':
      return kalimat(titik(bacaTeks(`${h.angka} ${h.akibat}`)));
    case 'asumsi-dibantah': {
      // Satu kalimat (koma, bukan titik): jeda antarkalimat TTS memperpanjang hook.
      const asumsi = bacaTeks(h.asumsi.trim().replace(/[.!…]+$/, ''));
      return `${kalimat(asumsi)}${asumsi.endsWith('?') ? '' : ','} ${titik(bacaTeks(h.bantahan))}`;
    }
    case 'kontras': {
      // Satuan disebut sekali di akhir ("Antam enam belas, Galeri24 enam persen") agar hook tetap ≤ 3 dtk.
      const f = { prefix: h.prefix, suffix: h.suffix, decimals: h.decimals };
      return `${kalimat(bacaTeks(h.a.label))} ${bacaNilai(h.a.value, { decimals: f.decimals })}, ${bacaTeks(h.b.label)} ${bacaNilai(h.b.value, f)}.`;
    }
    case 'kesalahan-umum':
      return h.koreksi ? `${kalimat(tanya(bacaTeks(h.kesalahan)))} ${kalimat(titik(bacaTeks(h.koreksi)))}` : `${kalimat(tanya(bacaTeks(h.kesalahan)))} Ini kesalahan umum.`;
    case 'pertanyaan':
      return kalimat(bacaTeks(h.teks.trim()));
  }
  return '';
}

/** Scene hook dari pola. Durasi mengikuti narasi (tanpa narasi: 3 dtk). */
export function hookScene(h: HookPola, o: OpsiHook): SceneConfig {
  const narration = o.narrated ? o.narasi ?? narasiHook(h) : undefined;
  const common = { masuk: 'cepat' as const, narration, duration: narration ? undefined : 3 };
  const where = o.id ? `[${o.id}] hook` : 'hook';
  const need = (ok: unknown, msg: string) => {
    if (!ok) throw new Error(`${where} (pola '${(h as { pola?: string }).pola}'): ${msg}`);
  };
  switch (h.pola) {
    case 'angka-konsekuensi': {
      need(h.angka?.trim() && h.akibat?.trim(), 'butuh `angka` dan `akibat`');
      const hl = h.highlight && h.akibat.includes(h.highlight) ? h.highlight : undefined;
      return {
        type: 'statement',
        ...common,
        lines: [
          { text: h.angka, highlight: h.angka, at: 0 },
          { text: h.akibat, highlight: hl, at: 0.1 },
        ],
      };
    }
    case 'asumsi-dibantah': {
      need(h.asumsi?.trim() && h.bantahan?.trim(), 'butuh `asumsi` dan `bantahan`');
      const hl = h.highlight ?? angkaDi(h.bantahan) ?? h.bantahan.split(/\s+/).pop();
      return {
        type: 'statement',
        ...common,
        lines: [
          { text: h.asumsi, highlight: h.highlight && h.asumsi.includes(h.highlight) ? h.highlight : undefined, at: 0 },
          { text: h.bantahan, highlight: hl && h.bantahan.includes(hl) ? hl : undefined, at: 0.1 },
        ],
      };
    }
    case 'kontras': {
      need(isNum(h.a?.value) && isNum(h.b?.value) && h.a.label && h.b.label, 'butuh `a: { label, value }` dan `b: { label, value }` (value angka)');
      return {
        type: 'selisih',
        ...common,
        ringkas: true,
        title: h.judul,
        highlight: h.highlight,
        a: { label: h.a.label, value: h.a.value },
        b: { label: h.b.label, value: h.b.value },
        prefix: h.prefix,
        suffix: h.suffix,
        decimals: h.decimals,
        selisihLabel: h.selisihLabel,
        arah: h.arah,
        persen: h.persen,
        tanda: h.tanda,
      };
    }
    case 'kesalahan-umum': {
      need(h.kesalahan?.trim(), 'butuh `kesalahan`');
      return {
        type: 'hero',
        ...common,
        eyebrow: 'Kesalahan umum',
        illustration: '❌',
        title: h.kesalahan,
        highlight: h.highlight,
        subtitle: h.koreksi ? `✓ ${h.koreksi}` : o.subjudul,
      };
    }
    case 'pertanyaan': {
      need(h.teks?.trim(), 'butuh `teks`');
      return { type: 'hero', ...common, eyebrow: o.eyebrow, title: h.teks, highlight: h.highlight, subtitle: o.subjudul };
    }
  }
  throw new Error(`${where}: pola tidak dikenal — pilih: ${POLA_HOOK.join(' | ')}`);
}

/* ============================================================
 * Angka → kata (untuk narasi default)
 * ============================================================ */

const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
const SKALA: [number, string][] = [
  [1e12, 'triliun'],
  [1e9, 'miliar'],
  [1e6, 'juta'],
  [1e3, 'ribu'],
];

/** Bilangan bulat ≥ 0 → kata ("400000" → "empat ratus ribu"). */
export function terbilang(n: number): string {
  n = Math.floor(Math.abs(n));
  const tail = (r: number) => (r ? ` ${terbilang(r)}` : '');
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) return `${SATUAN[Math.floor(n / 10)]} puluh${tail(n % 10)}`;
  if (n < 200) return `seratus${tail(n - 100)}`;
  if (n < 1000) return `${SATUAN[Math.floor(n / 100)]} ratus${tail(n % 100)}`;
  if (n < 2000) return `seribu${tail(n - 1000)}`;
  for (const [v, w] of SKALA) if (n >= v) return `${terbilang(Math.floor(n / v))} ${w}${tail(n % v)}`;
  return String(n);
}

/** Angka (bagian bulat + desimal digit per digit) → kata: 16.03 → "enam belas koma nol tiga". */
function bacaBilangan(intPart: string, frac?: string): string {
  const head = terbilang(Number(intPart.replace(/\./g, '')));
  frac = frac?.replace(/0+$/, '');
  return frac ? `${head} koma ${[...frac].map((d) => SATUAN[Number(d)]).join(' ')}` : head;
}

const SATUAN_UANG: Record<string, string> = { Rp: 'rupiah', 'US$': 'dolar AS', $: 'dolar' };

/** Nilai + format (seperti di layar) → kata: (400000, {prefix:'Rp'}) → "empat ratus ribu rupiah". */
export function bacaNilai(value: number, f: { prefix?: string; suffix?: string; decimals?: number } = {}): string {
  const d = f.decimals ?? (Number.isInteger(value) ? 0 : 2);
  const [i, frac] = Math.abs(value).toFixed(d).split('.');
  const neg = value < 0 ? 'minus ' : '';
  const trimmed = frac && /[1-9]/.test(frac) ? frac : undefined;
  const words = `${neg}${bacaBilangan(i, trimmed)}`;
  const pre = f.prefix?.trim();
  const suf = f.suffix?.trim();
  const unit = [pre ? SATUAN_UANG[pre] ?? pre : '', suf === '%' ? 'persen' : suf ?? ''].filter(Boolean).join(' ');
  return unit ? `${words} ${unit}` : words;
}

/**
 * Angka di teks → seperti dibaca: "Rp400.000" → "empat ratus ribu rupiah", "8%" → "delapan persen",
 * "16,03%" → "enam belas koma nol tiga persen", "Rp400 ribu" → "empat ratus ribu rupiah".
 * Angka yang menempel di kata (Galeri24) dibiarkan (atur lewat `lexicon`).
 */
export function bacaTeks(teks: string): string {
  const re = /(?<![\p{L}\p{N}])(Rp|US\$|\$)?\s?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(\s?(?:ribu|juta|miliar|triliun))?\s?(%)?(?![\p{L}\p{N}])/gu;
  return teks.replace(re, (_all, cur: string | undefined, int: string, frac: string | undefined, skala: string | undefined, pct: string | undefined) => {
    const parts = [bacaBilangan(int, frac)];
    if (skala) parts.push(skala.trim());
    if (cur) parts.push(SATUAN_UANG[cur]);
    if (pct) parts.push('persen');
    return parts.join(' ');
  });
}
