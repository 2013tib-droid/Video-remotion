import type { VideoConfig } from '../core/types';
import type {
  Cue,
  SceneConfig,
  WorldCard,
  WorldLabel,
  WorldMeasure,
  WorldMeter,
  WorldModelPart,
  WorldMotion,
  WorldObject,
  WorldReadout,
  WorldScene,
  WorldShot,
  WorldStamp,
  WorldView,
} from '../scenes/types';
import { outroScene, seriesConfig, type Series, type SeriesOutro, type SeriesVideoBase } from './series';

/** Dunia 3D yang dipakai sepanjang video: objek + sudut pandang bernama. Kit siap pakai: `src/worlds/`. */
export interface Dunia {
  objects: WorldObject[];
  views: Record<string, WorldView>;
  ground?: WorldScene['ground'];
  sky?: WorldScene['sky'];
}

/** Perubahan permanen sebuah objek mulai adegan ini (mis. `{ light: 'green' }`, `{ brake: false }`, `{ color: 'danger' }`). */
export type UbahObjek = Partial<Pick<WorldObject, 'pos' | 'rotate' | 'scale' | 'color' | 'opacity' | 'hidden'>> & {
  light?: 'red' | 'yellow' | 'green';
  brake?: boolean;
};

/**
 * Satu ADEGAN = satu kalimat narasi di dunia yang sama. Semua yang terjadi di sebuah adegan
 * (kamera pindah, objek bergerak, bagian terbuka, lampu berganti) TETAP berlaku di adegan berikutnya.
 */
export interface Adegan {
  /** Header bab kiri atas. String = judul saja. Kosong = lanjut bab sebelumnya. */
  bab?: string | { label?: string; judul: string; highlight?: string };
  /** Kalimat yang dibacakan (1–2 kalimat pendek, ±3–7 detik). */
  narasi: string;
  /** Kata/frasa narasi yang disorot di subtitle. */
  emphasis?: string[];
  /**
   * Kamera: nama `view` (terbang ke sana di awal adegan), atau `{ view, at: 'kata' }` (terbang saat kata itu),
   * atau beberapa sekaligus. Kosong = kamera diam di posisi terakhir (tetap mengorbit pelan).
   */
  kamera?: string | WorldShot | (string | WorldShot)[];
  /** id objek yang tembus pandang mulai adegan ini. `[]` = kembali utuh. Kosong = sama seperti sebelumnya. */
  xray?: string[];
  /** Label yang menempel pada objek. `tetap: true` = bertahan di adegan-adegan berikutnya. */
  label?: (WorldLabel & { tetap?: boolean })[];
  /** `true` = hapus semua label `tetap` sebelum adegan ini. */
  labelBersih?: boolean;
  /** Kartu keterangan/sumber (hanya di adegan ini). */
  kartu?: WorldCard[];
  /**
   * Strip data di bawah bab: angka/teks + lencana sumber. BERTAHAN ke adegan berikutnya (angka yang menghitung
   * berhenti di nilai akhirnya) sampai diganti; `false` = hapus.
   */
  data?: WorldReadout | false;
  /** Panel batang ukur (HUD). BERTAHAN ke adegan berikutnya di nilai akhirnya sampai diganti; `false` = hapus. */
  meter?: WorldMeter | WorldMeter[] | false;
  /** Penanda ukuran antara dua titik (mis. celah "0,8 mm"). `tetap: true` = bertahan; `labelBersih` menghapusnya. */
  ukur?: (WorldMeasure & { tetap?: boolean })[];
  /** Cap putusan besar (mis. "IMPAS") — hanya di adegan ini. */
  cap?: WorldStamp;
  /** Gerak objek per id: `{ mobil: [{ type: 'move', to: [0, 0, 8], at: 'maju' }] }`. Hasil akhirnya menetap. */
  gerak?: Record<string, WorldMotion[]>;
  /** Atur bagian model `.glb` per id model: `{ mobil: [{ name: 'BodyHood', motion: [...] }] }`. Menetap. */
  bagian?: Record<string, WorldModelPart[]>;
  /** Munculkan objek ber-`hidden: true` saat cue: `{ panah: 'dorong' }`. */
  muncul?: Record<string, Cue>;
  /** Hilangkan objek saat cue (seterusnya hilang). */
  hilang?: Record<string, Cue>;
  /** Lampu lalu lintas berganti saat cue: `{ lampu: { to: 'green', at: 'hijau' } }`. Menetap. */
  lampu?: Record<string, { to: 'red' | 'yellow' | 'green'; at: Cue }>;
  /** Ubah properti objek seketika di awal adegan (permanen). */
  ubah?: Record<string, UbahObjek>;
  /** Catatan kecil di bawah (mis. "Ilustrasi · bukan skala"). Kosong = `catatan` video. */
  catatan?: string;
}

/** Scene biasa (grafik, angka, teks besar, …) yang disisipkan di antara adegan 3D. */
export interface Sisipan {
  sisip: SceneConfig;
}

export interface Bedah3DProps extends SeriesVideoBase {
  /** Rubrik singkat di HUD, mis. "Otomotif". */
  topik?: string;
  dunia: Dunia;
  /**
   * Urutan adegan. Adegan pertama = HOOK (kalimat ≤ 2–3 detik yang memancing).
   * Patokan durasi (terukur dari contoh): satu adegan ≈ 4 detik → 1 menit ≈ 15 adegan, 2 menit ≈ 30 adegan.
   */
  adegan: (Adegan | Sisipan)[];
  /** Catatan kecil di semua adegan 3D, mis. "Ilustrasi · bukan skala". */
  catatan?: string;
  /** Ganti sebagian penutup seri, atau `false` untuk tanpa penutup. */
  penutup?: Partial<SeriesOutro> | false;
}

/** Waktu "sudah lama terjadi": gerak dari adegan sebelumnya langsung berada di keadaan akhirnya. */
const DONE = -30;
const TWEENS = new Set(['move', 'turn', 'scale', 'fade', 'color']);

/** Bawa gerak ke adegan berikutnya: tween → sudah selesai; spin → terus berputar (atau hilang bila sudah dihentikan). */
function carryMotion(list: WorldMotion[] | undefined): WorldMotion[] | undefined {
  if (!list) return undefined;
  const out: WorldMotion[] = [];
  for (const m of list) {
    if (TWEENS.has(m.type)) out.push({ ...m, at: DONE } as WorldMotion);
    else if (m.type === 'spin') {
      if (m.stopAt === undefined) out.push({ ...m, at: undefined });
    } else out.push(m);
  }
  return out;
}

function carry(objects: WorldObject[]): WorldObject[] {
  return objects.flatMap((o) => {
    if (o.hideAt !== undefined) return [];
    const next = { ...o, motion: carryMotion(o.motion), children: o.children ? carry(o.children) : undefined } as WorldObject;
    if (next.showAt !== undefined) {
      next.showAt = undefined;
      next.hidden = false;
    }
    if (next.shape === 'flow') {
      if (next.stopAt !== undefined) return [];
      next.at = undefined;
    }
    if (next.shape === 'trafficLight' && next.changes?.length) {
      next.light = next.changes[next.changes.length - 1].to;
      next.changes = undefined;
    }
    if (next.shape === 'model' && next.parts) next.parts = next.parts.map((p) => ({ ...p, motion: carryMotion(p.motion) }));
    return [next];
  });
}

/** Terapkan `fn` ke objek ber-id `id` (di kedalaman mana pun); lapor bila tidak ada. */
function patch(objects: WorldObject[], id: string, fn: (o: WorldObject) => WorldObject, found: { ok: boolean }): WorldObject[] {
  return objects.map((o) => {
    if (o.id === id) {
      found.ok = true;
      return fn(o);
    }
    return o.children ? ({ ...o, children: patch(o.children, id, fn, found) } as WorldObject) : o;
  });
}

const isSisipan = (a: Adegan | Sisipan): a is Sisipan => 'sisip' in a;

/**
 * Penjelasan "cara kerja" 1–2 menit di SATU dunia 3D yang bersambung: tiap adegan satu kalimat narasi,
 * kamera terbang antar sudut pandang, objek & bagian model bergerak saat kata tertentu diucapkan,
 * dan semua perubahan menetap ke adegan berikutnya. Contoh: `src/projects/_demos/bedah3d.ts`.
 */
export function bedah3D(series: Series, p: Bedah3DProps): VideoConfig {
  const where = (i: number) => `[${p.slug}] adegan ke-${i + 1}`;
  let objects = p.dunia.objects;
  let camera: WorldShot | null = null;
  let xray: string[] = [];
  let sticky: WorldLabel[] = [];
  let stickyMeasures: WorldMeasure[] = [];
  let readout: WorldReadout | undefined;
  let meters: WorldMeter[] = [];
  let chapter: SceneConfig['chapter'];
  let afterInsert = false;
  const scenes: SceneConfig[] = [];

  p.adegan.forEach((a, i) => {
    if (isSisipan(a)) {
      scenes.push(a.sisip);
      afterInsert = true;
      return;
    }
    if (a.xray) xray = a.xray;
    if (a.labelBersih) {
      sticky = [];
      stickyMeasures = [];
    }
    if (a.data !== undefined) readout = a.data || undefined;
    if (a.meter !== undefined) meters = a.meter ? (Array.isArray(a.meter) ? a.meter : [a.meter]) : [];
    if (a.bab) chapter = typeof a.bab === 'string' ? { title: a.bab } : { label: a.bab.label, title: a.bab.judul, highlight: a.bab.highlight };

    // Objek: keadaan akhir adegan sebelumnya + perubahan adegan ini.
    const apply = (id: string, what: string, fn: (o: WorldObject) => WorldObject) => {
      const found = { ok: false };
      objects = patch(objects, id, fn, found);
      if (!found.ok) throw new Error(`${where(i)}: ${what} menunjuk id "${id}" yang tidak ada di dunia.`);
    };
    for (const [id, props] of Object.entries(a.ubah ?? {})) apply(id, '`ubah`', (o) => ({ ...o, ...props }) as WorldObject);
    for (const [id, m] of Object.entries(a.gerak ?? {})) apply(id, '`gerak`', (o) => ({ ...o, motion: [...(o.motion ?? []), ...m] }) as WorldObject);
    for (const [id, at] of Object.entries(a.muncul ?? {})) apply(id, '`muncul`', (o) => ({ ...o, showAt: at }) as WorldObject);
    for (const [id, at] of Object.entries(a.hilang ?? {})) apply(id, '`hilang`', (o) => ({ ...o, hideAt: at }) as WorldObject);
    for (const [id, change] of Object.entries(a.lampu ?? {})) {
      apply(id, '`lampu`', (o) => {
        if (o.shape !== 'trafficLight') throw new Error(`${where(i)}: \`lampu\` hanya untuk objek trafficLight ("${id}").`);
        return { ...o, changes: [...(o.changes ?? []), change] };
      });
    }
    for (const [id, parts] of Object.entries(a.bagian ?? {})) {
      apply(id, '`bagian`', (o) => {
        if (o.shape !== 'model') throw new Error(`${where(i)}: \`bagian\` hanya untuk objek model ("${id}").`);
        return { ...o, parts: [...(o.parts ?? []), ...parts] };
      });
    }

    // Kamera: mulai dari posisi terakhir, lalu terbang sesuai `kamera`.
    const moves = (a.kamera === undefined ? [] : Array.isArray(a.kamera) ? a.kamera : [a.kamera]).map((k) => (typeof k === 'string' ? { view: k } : k));
    for (const m of moves) if (m.view && !p.dunia.views[m.view]) throw new Error(`${where(i)}: view "${m.view}" tidak ada di dunia.views.`);
    let shots: WorldShot[];
    if (!camera) {
      if (!moves.length) throw new Error(`${where(i)}: adegan 3D pertama wajib punya \`kamera\`.`);
      shots = moves.map((m) => ({ ...m, xray }));
    } else {
      // Terbang di awal adegan dimulai sedikit setelah potongan agar tidak terasa melompat.
      shots = [camera, ...moves.map((m) => ({ ...m, at: m.at ?? 0.05, xray }))];
      // Tanpa perpindahan: tetap di tempat; perubahan xray memudar halus.
      if (!moves.length) shots = [camera, { ...camera, at: 0.05, duration: 0.8, xray }];
    }
    const last = shots[shots.length - 1];
    camera = { ...last, at: undefined, duration: undefined, xray };

    scenes.push({
      type: 'world',
      transition: scenes.length === 0 ? undefined : afterInsert ? 'fade' : 'none',
      chapter,
      narration: a.narasi,
      emphasis: a.emphasis,
      objects,
      views: p.dunia.views,
      shots,
      labels: [...sticky.map((l) => ({ ...l, at: DONE })), ...(a.label ?? []).map(({ tetap: _tetap, ...l }) => l)],
      cards: a.kartu,
      readout,
      meters: meters.length ? meters : undefined,
      measures: [...stickyMeasures.map((m) => ({ ...m, at: DONE })), ...(a.ukur ?? []).map(({ tetap: _tetap, ...m }) => m)],
      stamp: a.cap,
      ground: p.dunia.ground,
      sky: p.dunia.sky,
      note: a.catatan ?? p.catatan,
    });
    afterInsert = false;
    sticky = [...sticky, ...(a.label ?? []).filter((l) => l.tetap).map(({ tetap: _tetap, ...l }) => l)];
    stickyMeasures = [...stickyMeasures, ...(a.ukur ?? []).filter((m) => m.tetap).map(({ tetap: _tetap, ...m }) => m)];
    // HUD yang bertahan: adegan berikutnya mulai dari keadaan akhirnya (tanpa animasi masuk ulang).
    if (readout?.value !== undefined && readout.to !== undefined) readout = { ...readout, value: readout.to, to: undefined };
    if (readout) readout = { ...readout, at: DONE };
    meters = meters.map((m) => ({
      ...m,
      at: DONE,
      rows: m.rows.map(({ to, at: _at, showAt: _showAt, ...r }) => ({ ...r, value: to ?? r.value })),
    }));
    objects = carry(objects);
  });

  return seriesConfig(series, p, [...scenes, outroScene(series, p.penutup, true)], { hudLabel: p.topik });
}
