import type { Vec2, Vec3, WorldObject, WorldView } from '../scenes/types';
import type { Dunia } from '../templates/Bedah3D';

/**
 * KIT KOTA bergaya komik (referensi R3 "SCBD jadi sirkuit F1?"): gedung berkarakter + kota dari PETA ASLI.
 * Paling cocok dengan `gaya: 'tinta'` di `dunia` (garis tinta + warna rata).
 *
 * Gedung satuan (koordinat dunia, meter; `pos` = titik tengah alas):
 *   `gedungKaca` · `menaraBulat` · `gedungPita` · `gedungKantor` · `podiumMenara`
 * Kota dari data OpenStreetMap: `npm run peta -- <nama> <lat> <lon> [radius]` → `src/worlds/peta/<nama>.json`,
 * lalu `kotaDariPeta(peta)`. Tulis kredit "© OpenStreetMap contributors" di sumber/catatan video.
 */

/** Warna kota komik: dinding krem/putih, kaca biru, atap abu hangat. */
export const WARNA_KOTA = {
  latar: '#efe9dc',
  tanah: '#e9e2d2',
  krem: '#efe3c6',
  putih: '#f5f2ea',
  pasir: '#e2cfa9',
  kacaMuda: '#a9c6e8',
  kaca: '#7fa6da',
  kacaTua: '#5b86c4',
  tosca: '#8fd0c2',
  jalanUtama: '#3d4456',
  jalan: '#cfcbc2',
  taman: '#9ccf7e',
  pohon: '#5fb55a',
  air: '#9fd3ee',
} as const;

type Opsi = { id?: string; color?: string; hidden?: boolean; showAt?: WorldObject['showAt'] };

const lingkaran = (r: number, n = 28): Vec2[] => Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]);
const persegi = (w: number, d: number): Vec2[] => [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
/** Persegi dengan sudut terpotong (menara kaca bersegi). */
const segiDelapan = (w: number, d: number, cut = 0.22): Vec2[] => {
  const cx = w * cut;
  const cz = d * cut;
  return [[-w / 2 + cx, -d / 2], [w / 2 - cx, -d / 2], [w / 2, -d / 2 + cz], [w / 2, d / 2 - cz], [w / 2 - cx, d / 2], [-w / 2 + cx, d / 2], [-w / 2, d / 2 - cz], [-w / 2, -d / 2 + cz]];
};

/** Menara kaca biru bersegi (sudut terpotong), garis lantai terang. */
export function gedungKaca(pos: Vec3, lebar: number, tinggi: number, o: Opsi & { dalam?: number; bulat?: boolean } = {}): WorldObject {
  return {
    ...o,
    shape: 'prism',
    pos,
    points: o.bulat ? lingkaran(lebar / 2) : segiDelapan(lebar, o.dalam ?? lebar),
    height: tinggi,
    facade: 'kaca',
    floor: 4,
    color: o.color ?? WARNA_KOTA.kaca,
  };
}

/** Menara silinder krem dengan jendela pita melingkar per lantai (khas gedung perkantoran lama). */
export function menaraBulat(pos: Vec3, jari: number, tinggi: number, o: Opsi = {}): WorldObject {
  return { ...o, shape: 'prism', pos, points: lingkaran(jari), height: tinggi, facade: 'pita', floor: 3.8, color: o.color ?? WARNA_KOTA.krem, windowColor: '#6f95c8' };
}

/** Gedung kotak bertingkat dengan jendela pita per lantai. */
export function gedungPita(pos: Vec3, lebar: number, dalam: number, tinggi: number, o: Opsi = {}): WorldObject {
  return { ...o, shape: 'prism', pos, points: persegi(lebar, dalam), height: tinggi, facade: 'pita', color: o.color ?? WARNA_KOTA.putih, windowColor: '#7fa3cf' };
}

/** Gedung kantor/ruko rendah dengan jendela satu-satu. */
export function gedungKantor(pos: Vec3, lebar: number, dalam: number, tinggi: number, o: Opsi = {}): WorldObject {
  return { ...o, shape: 'prism', pos, points: persegi(lebar, dalam), height: tinggi, facade: 'kisi', color: o.color ?? WARNA_KOTA.krem };
}

/** Podium lebar (mal/lobi) + menara di atasnya. `id` dipasang di podium; menara = `<id>-menara`. */
export function podiumMenara(
  pos: Vec3,
  podium: { lebar: number; dalam: number; tinggi: number },
  menara: { lebar: number; tinggi: number; kaca?: boolean },
  o: Opsi = {},
): WorldObject {
  const top: WorldObject = menara.kaca
    ? gedungKaca([0, podium.tinggi, 0], menara.lebar, menara.tinggi, { id: o.id ? `${o.id}-menara` : undefined })
    : gedungPita([0, podium.tinggi, 0], menara.lebar, menara.lebar, menara.tinggi, { id: o.id ? `${o.id}-menara` : undefined });
  return { ...o, shape: 'prism', pos, points: persegi(podium.lebar, podium.dalam), height: podium.tinggi, facade: 'kisi', roof: false, color: o.color ?? WARNA_KOTA.krem, children: [top] };
}

// ---------------------------------------------------------------- kota dari peta

/** Isi file `src/worlds/peta/<nama>.json` (dibuat `npm run peta`). Koordinat meter: x = timur, z = selatan. */
export interface PetaKota {
  nama: string;
  pusat: [number, number];
  radius: number;
  sumber: string;
  gedung: { p: Vec2[]; h: number; nama?: string }[];
  jalan: { p: Vec2[]; w: number; utama?: boolean }[];
  taman: { p: Vec2[] }[];
  air: { p: Vec2[] }[];
}

export interface KotaDariPetaOptions {
  /** Hanya isi dalam radius ini (m) dari pusat. Default seluruh peta. */
  radius?: number;
  /** Pohon di tepi jalan utama. Default true. */
  pohon?: boolean;
  /** Pengali tinggi gedung (gaya karikatur: 1,2–1,5 membuat menara lebih menonjol). Default 1. */
  tinggi?: number;
  /** Objek tambahan (koordinat dunia). */
  tambahan?: WorldObject[];
}

export interface KotaDariPeta extends Dunia {
  /** Nama gedung di peta → id objeknya (untuk `label`, `kamera`). */
  idGedung: Record<string, string>;
  /** Kredit wajib — tulis di sumber/catatan video. */
  kredit: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const pusatDenah = (p: Vec2[]): Vec2 => [p.reduce((a, v) => a + v[0], 0) / p.length, p.reduce((a, v) => a + v[1], 0) / p.length];

/** Gaya muka gedung dari bentuk & tinggi: menara tinggi = kaca, denah bulat = pita, sedang = pita, rendah = kisi. */
function gayaGedung(p: Vec2[], h: number, i: number): Pick<Extract<WorldObject, { shape: 'prism' }>, 'facade' | 'color' | 'windowColor' | 'floor'> {
  const [cx, cz] = pusatDenah(p);
  const r = p.map(([x, z]) => Math.hypot(x - cx, z - cz));
  const mean = r.reduce((a, v) => a + v, 0) / r.length;
  const bulat = p.length >= 10 && r.every((v) => Math.abs(v - mean) < mean * 0.15);
  const kaca = [WARNA_KOTA.kaca, WARNA_KOTA.kacaMuda, WARNA_KOTA.kacaTua, WARNA_KOTA.tosca];
  const dinding = [WARNA_KOTA.krem, WARNA_KOTA.putih, WARNA_KOTA.pasir];
  if (h >= 70 && !bulat) return { facade: 'kaca', color: kaca[i % kaca.length], floor: 4 };
  if (bulat || h >= 30) return { facade: 'pita', color: dinding[i % dinding.length], windowColor: '#7299cc', floor: 3.8 };
  return { facade: 'kisi', color: dinding[(i + 1) % dinding.length], floor: 3.6 };
}

/**
 * KIT DUNIA: kota dari peta asli (OpenStreetMap) — tata jalan, tapak & tinggi gedung sesuai aslinya.
 *
 * id objek: `gedung-<nama-gedung>` untuk gedung bernama (lihat `idGedung`), `gedung-<n>` lainnya; `pusat` (jangkar tengah).
 * view: `kota` (isometrik seluruh kawasan) · `dekat` (isometrik setengah jarak) · `atas` (peta dari atas) · `rendah` (sudut rendah).
 */
export function kotaDariPeta(peta: PetaKota, o: KotaDariPetaOptions = {}): KotaDariPeta {
  const R = o.radius ?? peta.radius;
  const dalam = (p: Vec2[]) => {
    const [x, z] = pusatDenah(p);
    return Math.hypot(x, z) <= R;
  };
  const k = o.tinggi ?? 1;
  const idGedung: Record<string, string> = {};
  const objects: WorldObject[] = [{ id: 'pusat', shape: 'group', pos: [0, 0, 0] }];

  for (const a of peta.air.filter((a) => dalam(a.p))) objects.push({ shape: 'prism', points: a.p, height: 0.06, facade: 'polos', roof: false, color: WARNA_KOTA.air });
  for (const t of peta.taman.filter((t) => dalam(t.p))) objects.push({ shape: 'prism', points: t.p, height: 0.1, facade: 'polos', roof: false, color: WARNA_KOTA.taman });
  // Jalan kecil dulu, jalan utama di atasnya (sedikit lebih tinggi agar tidak berkedip).
  // Jalan yang melintasi lingkaran radius (diuji per ruas, bukan hanya titiknya).
  const dekatPusat = (a: Vec2, b: Vec2) => {
    const [dx, dz] = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(0, Math.min(1, -(a[0] * dx + a[1] * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(a[0] + dx * t, a[1] + dz * t) <= R;
  };
  const jalan = peta.jalan.filter((j) => j.p.some((p, i) => i > 0 && dekatPusat(j.p[i - 1], p)));
  for (const j of jalan.filter((j) => !j.utama)) objects.push({ shape: 'strip', path: j.p, width: j.w, color: WARNA_KOTA.jalan });
  for (const j of jalan.filter((j) => j.utama))
    objects.push({ shape: 'strip', path: j.p, width: j.w, color: WARNA_KOTA.jalanUtama, centerLine: '#f4f1ea', pos: [0, 0.03, 0] });

  peta.gedung
    .filter((g) => dalam(g.p) && g.p.length >= 3)
    .forEach((g, i) => {
      const [cx, cz] = pusatDenah(g.p);
      const local = g.p.map(([x, z]) => [x - cx, z - cz] as Vec2);
      let id = `gedung-${i}`;
      if (g.nama) {
        const s = slug(g.nama);
        id = idGedung[g.nama] ? `${s}-${i}` : `gedung-${s}`;
        idGedung[g.nama] ??= id;
      }
      objects.push({ id, shape: 'prism', pos: [cx, 0, cz], points: local, height: Math.max(3, g.h * k), ...gayaGedung(local, g.h * k, i) });
    });

  if (o.pohon ?? true) {
    // Pohon tiap ±22 m di kedua sisi jalan utama, dilewati bila jatuh di tapak gedung.
    const kotakGedung = peta.gedung.map((g) => {
      const xs = g.p.map((p) => p[0]);
      const zs = g.p.map((p) => p[1]);
      return [Math.min(...xs) - 2, Math.max(...xs) + 2, Math.min(...zs) - 2, Math.max(...zs) + 2];
    });
    let n = 0;
    for (const j of jalan.filter((j) => j.utama)) {
      let carry = 0;
      for (let s = 0; s < j.p.length - 1 && n < 260; s++) {
        const [a, b] = [j.p[s], j.p[s + 1]];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const [ux, uz] = [(b[0] - a[0]) / (L || 1), (b[1] - a[1]) / (L || 1)];
        for (let d = carry; d < L; d += 22) {
          for (const side of [1, -1]) {
            const off = j.w / 2 + 3;
            const x = a[0] + ux * d - uz * off * side;
            const z = a[1] + uz * d + ux * off * side;
            if (Math.hypot(x, z) > R) continue;
            if (kotakGedung.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1)) continue;
            objects.push({ shape: 'tree', pos: [x, 0, z], scale: 1.6 + ((n * 7) % 5) * 0.12, color: WARNA_KOTA.pohon });
            n++;
          }
        }
        carry = (((carry - L) % 22) + 22) % 22;
      }
    }
  }

  objects.push(...(o.tambahan ?? []));

  const views: Record<string, WorldView> = {
    kota: { target: [0, 0, 0], distance: R * 10, azimuth: 32, elevation: 36, fov: 18 },
    dekat: { target: [0, 20, 0], distance: R * 5, azimuth: 40, elevation: 32, fov: 18 },
    atas: { target: [0, 0, 0], distance: R * 11, azimuth: 0, elevation: 88, fov: 18 },
    rendah: { target: [0, 30, 0], distance: R * 3, azimuth: 20, elevation: 14, fov: 24 },
  };
  return { objects, views, ground: WARNA_KOTA.tanah, sky: WARNA_KOTA.latar, gaya: 'tinta', idGedung, kredit: peta.sumber };
}
