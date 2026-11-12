import type { Cue, Vec3, WorldMotion, WorldObject } from '../scenes/types';

/**
 * PUSTAKA BENDA 3D siap pakai (dirakit dari bentuk dasar → render cepat, gaya isometrik krem R2).
 * Katalog + gambar + cara pakai: `docs/PUSTAKA-VISUAL.md`. Tiap fungsi mengembalikan objek `world` biasa;
 * id bagian yang bisa digerakkan/diberi label tertulis di komentarnya (pola `<id>-<bagian>`).
 * Asal: seri `src/projects/bagaimana-jika/`.
 */

export const WARNA = {
  nyala: '#ffd23f',
  mati: '#5b6475',
  krem: '#f4f1ea',
  merah: '#e5484d',
  hitam: '#1f1f1f',
  laut: '#a9d3df',
  tanahKrem: '#d9d3c7',
  langitKrem: '#ebe7df',
} as const;

/** Gerak "membesar ke `to` saat `at`" (cincin gelombang/suara, awan abu). */
export const membesar = (to: number, at: Cue, duration: number): WorldMotion[] => [{ type: 'scale', to, at, duration }];

/** Pohon bulat dua lapis. */
export const pohon = (pos: Vec3, scale = 1): WorldObject => ({
  shape: 'group',
  pos,
  scale,
  children: [
    { shape: 'cylinder', radius: 0.18, height: 1.6, pos: [0, 0.8, 0], color: '#7a5a3c' },
    { shape: 'sphere', radius: 1.1, pos: [0, 2.2, 0], color: '#6fa85a' },
    { shape: 'sphere', radius: 0.8, pos: [0.6, 2.7, 0.3], color: '#7fb866' },
  ],
});

/** Rumah kecil beratap kerucut (pintu & jendela menghadap −x). */
export const rumahMini = (pos: Vec3, atap: string, scale = 1): WorldObject => ({
  shape: 'group',
  pos,
  scale,
  children: [
    { shape: 'box', size: [3.2, 2.4, 4], pos: [0, 1.2, 0], color: WARNA.krem },
    { shape: 'cone', radius: 3.2, height: 1.8, pos: [0, 3.3, 0], color: atap, rotate: [0, 45, 0] },
    { shape: 'box', size: [0.1, 1.3, 0.9], pos: [-1.62, 0.65, 0], color: '#5b4a3a', round: 0.02 },
    { shape: 'box', size: [0.1, 0.7, 0.8], pos: [-1.62, 1.5, 1.2], color: '#8fb8d8', round: 0.02 },
  ],
});

/**
 * Gedung + jendela menyala di sisi yang menghadap jalan (sumbu z). Jendela ber-id `<prefix>0`, `<prefix>1`, …
 * (berurutan lintas gedung) → padamkan dengan `ubah`/`gerak` warna ke `WARNA.mati`.
 */
export function gedungBerjendela(
  gedung: { x: number; z: number; w: number; h: number; d: number; warna?: string }[],
  prefix = 'j',
): { objects: WorldObject[]; jendela: string[] } {
  const jendela: WorldObject[] = [];
  gedung.forEach((g) => {
    const muka = g.x < 0 ? g.x + g.w / 2 + 0.06 : g.x - g.w / 2 - 0.06;
    for (let y = 2; y < g.h - 1; y += 2.6) {
      for (const dz of [-g.d / 4, g.d / 4]) {
        jendela.push({ id: `${prefix}${jendela.length}`, shape: 'box', size: [0.1, 1.2, 1.4], pos: [muka, y, g.z + dz], color: WARNA.nyala });
      }
    }
  });
  return {
    objects: [...gedung.map((g): WorldObject => ({ shape: 'building', size: [g.w, g.h, g.d], pos: [g.x, 0, g.z], color: g.warna })), ...jendela],
    jendela: jendela.map((j) => j.id!),
  };
}

/** Menara transmisi listrik (tiang meruncing + dua palang). */
export const menaraListrik = (id: string, x: number, z: number): WorldObject => ({
  id,
  shape: 'group',
  pos: [x, 0, z],
  children: [
    { shape: 'cylinder', radius: 0.25, radiusTop: 0.08, height: 14, pos: [0, 7, 0], color: '#94a3b8' },
    { shape: 'box', size: [5, 0.25, 0.25], pos: [0, 12.5, 0], color: '#94a3b8' },
    { shape: 'box', size: [3.4, 0.25, 0.25], pos: [0, 10.5, 0], color: '#94a3b8' },
  ],
});

/** Pembangkit: gedung + dua cerobong. Jangkar label: `<id>` (di atap). */
export const pembangkit = (id: string, x: number, z: number): WorldObject[] => [
  { shape: 'building', size: [10, 7, 10], pos: [x, 0, z], color: '#e2e8f0' },
  { shape: 'cylinder', radius: 1.4, height: 14, pos: [x - 2, 7, z - 4], color: '#f1f5f9' },
  { shape: 'cylinder', radius: 1.4, height: 12, pos: [x + 2, 6, z - 4], color: '#f1f5f9' },
  { id, shape: 'group', pos: [x, 8, z] },
];

/** Kereta (KRL/MRT) beberapa gerbong memanjang ke −z dari `pos`; `warna` badan, `garis` strip. */
export const kereta = (id: string, pos: Vec3, warna: string, garis: string, gerbong = 3): WorldObject => ({
  id,
  shape: 'group',
  pos,
  children: Array.from({ length: gerbong }, (_, i) => ({
    shape: 'group' as const,
    pos: [0, 0, -i * 7.4] as Vec3,
    children: [
      { shape: 'box', size: [2.8, 3, 7], pos: [0, 1.9, 0], color: warna },
      { shape: 'box', size: [2.86, 0.5, 7.02], pos: [0, 1.4, 0], color: garis },
      { shape: 'box', size: [2.9, 0.9, 5.6], pos: [0, 2.6, 0], color: '#1e293b' },
    ] as WorldObject[],
  })),
});

/** Sepasang rel sepanjang sumbu z, berpusat di `x`. */
export const rel = (x: number, panjang = 80): WorldObject[] => [
  { shape: 'box', size: [0.2, 0.2, panjang], pos: [x - 0.7, 0.2, 0], color: '#64748b' },
  { shape: 'box', size: [0.2, 0.2, panjang], pos: [x + 0.7, 0.2, 0], color: '#64748b' },
];

/** Lampu lalu lintas yang bisa MATI (beda dari `trafficLight` bawaan). Bagian: `<id>-merah` `<id>-kuning` `<id>-hijau` (hijau menyala). */
export const lampuLalin = (id: string, pos: Vec3): WorldObject => ({
  id,
  shape: 'group',
  pos,
  children: [
    { shape: 'cylinder', radius: 0.12, height: 4.2, pos: [0, 2.1, 0], color: '#334155' },
    { shape: 'box', size: [0.7, 1.9, 0.5], pos: [0, 4.9, 0], color: '#1e293b' },
    { id: `${id}-merah`, shape: 'sphere', radius: 0.2, pos: [0, 5.45, 0.27], color: '#7f1d1d' },
    { id: `${id}-kuning`, shape: 'sphere', radius: 0.2, pos: [0, 4.9, 0.27], color: '#78350f' },
    { id: `${id}-hijau`, shape: 'sphere', radius: 0.2, pos: [0, 4.35, 0.27], color: '#22c55e' },
  ],
});

/** Menara BTS + tiga busur sinyal hijau `<id>-sinyal0..2` (redupkan dengan `fade`). */
export const menaraBts = (id: string, pos: Vec3): WorldObject => ({
  id,
  shape: 'group',
  pos,
  children: [
    { shape: 'cylinder', radius: 0.35, radiusTop: 0.15, height: 18, pos: [0, 9, 0], color: '#cbd5e1' },
    { shape: 'box', size: [0.5, 1.6, 0.3], pos: [0, 17, 0.3], color: '#f8fafc' },
    ...[1.4, 2.4, 3.4].map(
      (r, i): WorldObject => ({
        id: `${id}-sinyal${i}`,
        shape: 'torus',
        radius: r,
        tube: 0.07,
        arc: 120,
        axis: 'z',
        pos: [0, 17, 0],
        rotate: [0, 0, 30],
        color: '#22c55e',
      }),
    ),
  ],
});

/** Toren air di atas rangka. */
export const toren = (id: string, pos: Vec3): WorldObject => ({
  id,
  shape: 'group',
  pos,
  children: [
    { shape: 'box', size: [2.4, 4, 2.4], pos: [0, 2, 0], color: '#94a3b8', opacity: 0.5 },
    { shape: 'cylinder', radius: 1.2, height: 2, pos: [0, 5, 0], color: '#2563eb' },
  ],
});

/** Mesin ATM. Bagian: `<id>-layar` (warnai gelap = mati). */
export const atm = (id: string, pos: Vec3, rotate: Vec3 = [0, 0, 0]): WorldObject => ({
  id,
  shape: 'group',
  pos,
  rotate,
  children: [
    { shape: 'box', size: [1.6, 2.4, 1], pos: [0, 1.2, 0], color: '#1d4ed8' },
    { id: `${id}-layar`, shape: 'box', size: [1, 0.7, 0.05], pos: [0, 1.7, 0.52], color: '#7dd3fc' },
  ],
});

/**
 * SPBU gaya R2: kanopi, dua dispenser merah-putih (layar, selang, nozzle), pulau beton belang hitam-putih, mobil mengisi.
 * Bagian: `<id>-layar1` `<id>-layar2` (layar hijau), `<id>-nozzle` (nozzle hijau, untuk label).
 */
export const spbu = (id: string, pos: Vec3): WorldObject => ({
  id,
  shape: 'group',
  pos,
  children: [
    { shape: 'box', size: [12, 0.7, 8], pos: [0, 5.6, 0], color: WARNA.krem },
    { shape: 'box', size: [12.1, 0.35, 8.1], pos: [0, 5.15, 0], color: WARNA.merah },
    { shape: 'cylinder', radius: 0.25, height: 5, pos: [-3, 2.5, 0], color: '#e9e6df' },
    { shape: 'cylinder', radius: 0.25, height: 5, pos: [3, 2.5, 0], color: '#e9e6df' },
    ...[-1, 1].flatMap((s, i): WorldObject[] => {
      const x = s * 2;
      const belang = Array.from({ length: 8 }, (_, k): WorldObject => ({
        shape: 'box',
        size: [0.5, 0.3, 1.6],
        pos: [x - 1.75 + k * 0.5, 0.15, 0],
        color: k % 2 ? WARNA.hitam : WARNA.krem,
        round: 0.02,
      }));
      return [
        ...belang,
        { shape: 'box', size: [1.1, 2, 0.8], pos: [x, 1.3, 0], color: WARNA.krem },
        { shape: 'box', size: [1.14, 0.7, 0.84], pos: [x, 2.5, 0], color: WARNA.merah },
        { id: `${id}-layar${i + 1}`, shape: 'box', size: [0.7, 0.35, 0.05], pos: [x, 1.9, 0.42], color: '#4ade80', round: 0.01 },
        { shape: 'tube', path: [[x + 0.5, 1.6, 0.42], [x + 0.9, 1.0, 0.8], [x + 0.95, 1.5, 1.2]], radius: 0.05, color: WARNA.hitam },
        { id: i ? undefined : `${id}-nozzle`, shape: 'box', size: [0.14, 0.3, 0.14], pos: [x + 0.95, 1.6, 1.2], color: i ? '#2563eb' : '#16a34a', round: 0.03 },
      ];
    }),
    { shape: 'car', variant: 'suv', pos: [3.8, 0, 3.4], rotate: [0, -90, 0], color: '#c4c8cc' },
  ],
});

/** Kulkas. Bagian: `<id>-isi` (bola hijau tersembunyi; munculkan lalu warnai coklat = basi). */
export const kulkas = (id: string, pos: Vec3): WorldObject => ({
  id,
  shape: 'group',
  pos,
  children: [
    { shape: 'box', size: [1.1, 2, 0.9], pos: [0, 1, 0], color: '#f8fafc' },
    { shape: 'box', size: [0.08, 0.6, 0.08], pos: [0.4, 1.4, 0.48], color: '#94a3b8' },
    { id: `${id}-isi`, shape: 'sphere', radius: 0.32, pos: [0, 2.4, 0], color: '#4ade80', hidden: true },
  ],
});

/** Cincin datar tersembunyi (gelombang suara/tsunami): `muncul` lalu `gerak: membesar(...)`. */
export const cincin = (id: string, pos: Vec3, radius: number, tube: number, color: string, opacity = 0.9): WorldObject => ({
  id,
  shape: 'torus',
  radius,
  tube,
  axis: 'y',
  pos,
  color,
  opacity,
  hidden: true,
});

/**
 * Gunung api di pulau (kerucut + bahu + kawah + pepohonan). Jangkar kawah: `<id>-kawah` (posisi dunia, untuk label/cap).
 * Besar default ±11 m jari-jari; atur dengan `scale`.
 */
export const gunungApi = (id: string, pos: Vec3 = [0, 0, 0], warna = '#a08672'): WorldObject[] => [
  {
    id,
    shape: 'group',
    pos,
    children: [
      { shape: 'cone', radius: 11, height: 9, pos: [0, 4.5, 0], color: warna },
      { shape: 'cone', radius: 6.5, height: 3.5, pos: [2.5, 1.75, 6], color: '#8f7562' },
      { shape: 'cylinder', radius: 2.4, radiusTop: 2.8, height: 0.6, pos: [0, 8.6, 0], color: '#5a463a' },
      pohon([6, 1.2, 5]),
      pohon([-5, 1.2, 6], 1.2),
      pohon([-7, 1.2, -3], 0.9),
    ],
  },
  { id: `${id}-kawah`, shape: 'group', pos: [pos[0], pos[1] + 9, pos[2]] },
];
