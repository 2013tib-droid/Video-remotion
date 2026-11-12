import type { IrisanPart, Vec2, Vec3, WorldObject } from '../../scenes/types';
import { bedah3D, type Irisan } from '../../templates';
import { bagaimanaJika } from './series';

/**
 * Naskah & sumber: `naskah/bagaimana-jika/listrik-padam.md`. Gaya `docs/REFERENSI.md` R2: dunia 3D isometrik berlatar krem
 * + irisan teknis 2D (jaringan listrik, terowongan MRT, pompa air rumah). Semua dari bentuk dasar → render cepat.
 * Tata letak: pembangkit & menara (kiri) → kota (tengah) → rel KRL & terowongan MRT (kanan) → rumah, ATM, SPBU (belakang).
 */
const NYALA = '#ffd23f';
const MATI = '#5b6475';

// Jendela menyala di gedung kota: id j0, j1, … (dimatikan bersamaan lewat `gelapkan`).
const jendela: WorldObject[] = [];
const gedung: { x: number; z: number; w: number; h: number; d: number; warna?: string }[] = [
  { x: -11, z: 2, w: 7, h: 13, d: 7, warna: '#f1ede5' },
  { x: -11, z: 12, w: 6, h: 8, d: 6, warna: '#e9dcc3' },
  { x: 11, z: 4, w: 7, h: 16, d: 8, warna: '#dfe3e6' },
  { x: 11, z: -7, w: 6, h: 10, d: 6, warna: '#e8d3c7' },
];
gedung.forEach((g) => {
  const muka = g.x < 0 ? g.x + g.w / 2 + 0.06 : g.x - g.w / 2 - 0.06;
  for (let y = 2; y < g.h - 1; y += 2.6) {
    for (const dz of [-g.d / 4, g.d / 4]) {
      jendela.push({ id: `j${jendela.length}`, shape: 'box', size: [0.1, 1.2, 1.4], pos: [muka, y, g.z + dz], color: NYALA });
    }
  }
});
const menara = (id: string, x: number, z: number): WorldObject => ({
  id,
  shape: 'group',
  pos: [x, 0, z],
  children: [
    { shape: 'cylinder', radius: 0.25, radiusTop: 0.08, height: 14, pos: [0, 7, 0], color: '#94a3b8' },
    { shape: 'box', size: [5, 0.25, 0.25], pos: [0, 12.5, 0], color: '#94a3b8' },
    { shape: 'box', size: [3.4, 0.25, 0.25], pos: [0, 10.5, 0], color: '#94a3b8' },
  ],
});
const kabel: Vec3[] = [[-38, 12.4, -10], [-26, 11.6, -10], [-14, 12.4, -10], [-11, 13.2, -2]];

const kereta = (id: string, pos: Vec3, warna: string, garis: string): WorldObject => ({
  id,
  shape: 'group',
  pos,
  children: [0, 1, 2].map((i) => ({
    shape: 'group',
    pos: [0, 0, -i * 7.4] as Vec3,
    children: [
      { shape: 'box', size: [2.8, 3, 7], pos: [0, 1.9, 0], color: warna },
      { shape: 'box', size: [2.86, 0.5, 7.02], pos: [0, 1.4, 0], color: garis },
      { shape: 'box', size: [2.9, 0.9, 5.6], pos: [0, 2.6, 0], color: '#1e293b' },
    ],
  })),
});

const objects: WorldObject[] = [
  // Pembangkit (kiri) + menara transmisi + kabel dengan aliran listrik.
  { shape: 'building', size: [10, 7, 10], pos: [-44, 0, -10], color: '#e2e8f0' },
  { shape: 'cylinder', radius: 1.4, height: 14, pos: [-46, 7, -14], color: '#f1f5f9' },
  { shape: 'cylinder', radius: 1.4, height: 12, pos: [-42, 6, -14], color: '#f1f5f9' },
  menara('menara1', -26, -10),
  menara('menara2', -14, -10),
  { shape: 'tube', path: kabel, radius: 0.06, color: '#334155' },
  { id: 'listrik', shape: 'flow', path: kabel, count: 14, size: 0.32, speed: 0.35, color: NYALA },
  { id: 'pembangkit', shape: 'group', pos: [-44, 8, -10] },

  // Kota: jalan, gedung berjendela, lampu lalu lintas buatan sendiri (bisa mati), mobil, pohon, menara BTS.
  { shape: 'road', length: 70, lanes: 2 },
  ...gedung.map((g): WorldObject => ({ shape: 'building', size: [g.w, g.h, g.d], pos: [g.x, 0, g.z], color: g.warna })),
  ...jendela,
  {
    id: 'lalin',
    shape: 'group',
    pos: [-4.6, 0, 8],
    children: [
      { shape: 'cylinder', radius: 0.12, height: 4.2, pos: [0, 2.1, 0], color: '#334155' },
      { shape: 'box', size: [0.7, 1.9, 0.5], pos: [0, 4.9, 0], color: '#1e293b' },
      { id: 'lalin-merah', shape: 'sphere', radius: 0.2, pos: [0, 5.45, 0.27], color: '#7f1d1d' },
      { id: 'lalin-kuning', shape: 'sphere', radius: 0.2, pos: [0, 4.9, 0.27], color: '#78350f' },
      { id: 'lalin-hijau', shape: 'sphere', radius: 0.2, pos: [0, 4.35, 0.27], color: '#22c55e' },
    ],
  },
  { shape: 'car', variant: 'sedan', pos: [-1.8, 0, 4], color: '#ef4444' },
  { shape: 'car', pos: [1.8, 0, -3], rotate: [0, 180, 0], color: '#0ea5e9' },
  { shape: 'car', pos: [-1.8, 0, -6], color: '#f59e0b' },
  { shape: 'tree', pos: [-6.5, 0, -4] },
  { shape: 'tree', pos: [6.5, 0, 14] },
  { shape: 'tree', pos: [-6.5, 0, 20], scale: 0.9 },
  { id: 'orang', shape: 'person', pos: [-5.2, 0, 10], rotate: [0, 90, 0] },
  {
    id: 'bts',
    shape: 'group',
    pos: [16, 0, 16],
    children: [
      { shape: 'cylinder', radius: 0.35, radiusTop: 0.15, height: 18, pos: [0, 9, 0], color: '#cbd5e1' },
      { shape: 'box', size: [0.5, 1.6, 0.3], pos: [0, 17, 0.3], color: '#f8fafc' },
      ...[1.4, 2.4, 3.4].map(
        (r, i): WorldObject => ({
          id: `sinyal${i}`,
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
  },

  // Transportasi (kanan): rel KRL di atas tanah + terowongan MRT.
  { shape: 'box', size: [0.2, 0.2, 80], pos: [21.3, 0.2, 0], color: '#64748b' },
  { shape: 'box', size: [0.2, 0.2, 80], pos: [22.7, 0.2, 0], color: '#64748b' },
  kereta('krl', [22, 0.3, 6], '#f8fafc', '#dc2626'),
  { shape: 'box', size: [0.2, 0.2, 80], pos: [31.3, 0.2, 0], color: '#64748b' },
  { shape: 'box', size: [0.2, 0.2, 80], pos: [32.7, 0.2, 0], color: '#64748b' },
  { id: 'terowongan', shape: 'cylinder', radius: 3, height: 26, axis: 'z', pos: [32, 0.6, -6], color: '#94a3b8', opacity: 0.35 },
  kereta('mrt', [32, 0.3, 26], '#e2e8f0', '#1d4ed8'),

  // Rumah (belakang kota): toren + pipa air, ATM, SPBU, kulkas.
  { id: 'rumah', shape: 'house', pos: [0, 0, -40] },
  {
    id: 'toren',
    shape: 'group',
    pos: [9, 0, -40],
    children: [
      { shape: 'box', size: [2.4, 4, 2.4], pos: [0, 2, 0], color: '#94a3b8', opacity: 0.5 },
      { shape: 'cylinder', radius: 1.2, height: 2, pos: [0, 5, 0], color: '#2563eb' },
    ],
  },
  { shape: 'tube', path: [[9, 4.2, -40], [9, 4.4, -37], [3, 2.2, -37]], radius: 0.1, color: '#64748b' },
  { id: 'air', shape: 'flow', path: [[9, 4.2, -40], [9, 4.4, -37], [3, 2.2, -37]], count: 10, size: 0.18, speed: 0.6, color: '#38bdf8' },
  {
    id: 'atm',
    shape: 'group',
    pos: [-7, 0, -36],
    rotate: [0, 30, 0],
    children: [
      { shape: 'box', size: [1.6, 2.4, 1], pos: [0, 1.2, 0], color: '#1d4ed8' },
      { id: 'layar-atm', shape: 'box', size: [1, 0.7, 0.05], pos: [0, 1.7, 0.52], color: '#7dd3fc' },
    ],
  },
  { id: 'tunai', shape: 'coins', count: 12, pos: [-5.2, 0, -34], hidden: true },
  // SPBU: kanopi, dua dispenser merah-putih (layar, selang, nozzle), pulau beton belang hitam-putih, mobil mengisi.
  {
    id: 'spbu',
    shape: 'group',
    pos: [-15, 0, -42],
    children: [
      { shape: 'box', size: [12, 0.7, 8], pos: [0, 5.6, 0], color: '#f4f1ea' },
      { shape: 'box', size: [12.1, 0.35, 8.1], pos: [0, 5.15, 0], color: '#e5484d' },
      { shape: 'cylinder', radius: 0.25, height: 5, pos: [-3, 2.5, 0], color: '#e9e6df' },
      { shape: 'cylinder', radius: 0.25, height: 5, pos: [3, 2.5, 0], color: '#e9e6df' },
      ...[-1, 1].flatMap((s, i): WorldObject[] => {
        const x = s * 2;
        const belang = Array.from({ length: 8 }, (_, k): WorldObject => ({
          shape: 'box',
          size: [0.5, 0.3, 1.6],
          pos: [x - 1.75 + k * 0.5, 0.15, 0],
          color: k % 2 ? '#1f1f1f' : '#f4f1ea',
          round: 0.02,
        }));
        return [
          ...belang,
          { shape: 'box', size: [1.1, 2, 0.8], pos: [x, 1.3, 0], color: '#f4f1ea' },
          { shape: 'box', size: [1.14, 0.7, 0.84], pos: [x, 2.5, 0], color: '#e5484d' },
          { id: i ? 'layar-spbu2' : 'layar-spbu', shape: 'box', size: [0.7, 0.35, 0.05], pos: [x, 1.9, 0.42], color: '#4ade80', round: 0.01 },
          { shape: 'tube', path: [[x + 0.5, 1.6, 0.42], [x + 0.9, 1.0, 0.8], [x + 0.95, 1.5, 1.2]], radius: 0.05, color: '#1f1f1f' },
          { id: i ? undefined : 'nozzle', shape: 'box', size: [0.14, 0.3, 0.14], pos: [x + 0.95, 1.6, 1.2], color: i ? '#2563eb' : '#16a34a', round: 0.03 },
        ];
      }),
      { shape: 'car', variant: 'suv', pos: [3.8, 0, 3.4], rotate: [0, -90, 0], color: '#c4c8cc' },
    ],
  },
  {
    id: 'kulkas',
    shape: 'group',
    pos: [-2.8, 0, -35],
    children: [
      { shape: 'box', size: [1.1, 2, 0.9], pos: [0, 1, 0], color: '#f8fafc' },
      { shape: 'box', size: [0.08, 0.6, 0.08], pos: [0.4, 1.4, 0.48], color: '#94a3b8' },
      { id: 'isi-kulkas', shape: 'sphere', radius: 0.32, pos: [0, 2.4, 0], color: '#4ade80', hidden: true },
    ],
  },
  { shape: 'tree', pos: [10, 0, -44] },
  { shape: 'tree', pos: [-10, 0, -48], scale: 1.2 },
];

// ---------- Irisan teknis 2D ----------
const KUNING = '#ffd23f';

const rumahJaringan = (x: number, id: string): IrisanPart => ({
  shape: 'group',
  children: [
    { shape: 'rect', x, y: 640, w: 92, h: 120, fill: '#f4f1ea' },
    { shape: 'poly', points: [[x - 10, 640], [x + 46, 588], [x + 102, 640]], fill: '#c96f53' },
    { id, shape: 'rect', x: x + 18, y: 664, w: 24, h: 26, fill: KUNING, glow: true },
    { id: `${id}b`, shape: 'rect', x: x + 52, y: 664, w: 24, h: 26, fill: KUNING, glow: true },
    { shape: 'rect', x: x + 36, y: 712, w: 20, h: 48, fill: '#6b5544' },
  ],
});
const menara2D = (x: number): IrisanPart => ({
  shape: 'poly',
  closed: false,
  points: [[x - 40, 760], [x - 12, 470], [x + 12, 470], [x + 40, 760], [x - 30, 660], [x + 30, 660], [x - 40, 760], [x - 22, 560], [x + 22, 560], [x + 40, 760], [x, 470], [x - 50, 490], [x + 50, 490]],
  fill: 'none',
  stroke: '#7b7f86',
  strokeWidth: 6,
});
const KABEL: Vec2[] = [[200, 560], [290, 505], [350, 492], [520, 520], [610, 492], [690, 520], [770, 600]];

/** Jaringan listrik dari samping: pembangkit → menara → rumah. */
const jaringan: Irisan = {
  size: [1000, 1000],
  badge: 'Ilustrasi · bukan skala',
  views: { utuh: { center: [500, 600], zoom: 1 }, putus: { center: [640, 560], zoom: 1.45 } },
  parts: [
    { shape: 'rect', x: 0, y: 760, w: 1000, h: 240, bahan: 'tanah' },
    { shape: 'rect', x: 0, y: 752, w: 1000, h: 14, bahan: 'rumput', stroke: false },
    // Pembangkit
    { shape: 'rect', x: 40, y: 560, w: 170, h: 200, bahan: 'beton' },
    { shape: 'rect', x: 60, y: 430, w: 38, h: 130, bahan: 'beton' },
    { shape: 'rect', x: 120, y: 470, w: 38, h: 90, bahan: 'beton' },
    { shape: 'circle', x: 80, y: 400, r: 26, bahan: 'udara', opacity: 0.85, motion: [{ type: 'bob', amount: 10, period: 2.4 }] },
    { shape: 'circle', x: 140, y: 440, r: 20, bahan: 'udara', opacity: 0.8, motion: [{ type: 'bob', amount: 8, period: 2 }] },
    { shape: 'rect', x: 70, y: 620, w: 40, h: 34, fill: KUNING, glow: true },
    { shape: 'rect', x: 140, y: 620, w: 40, h: 34, fill: KUNING, glow: true },
    { id: 'pembangkit', shape: 'group', pos: [125, 560], children: [] },
    menara2D(350),
    menara2D(610),
    { id: 'kabel1', shape: 'poly', closed: false, smooth: true, points: KABEL.slice(0, 5), fill: 'none', stroke: '#2b2b2b', strokeWidth: 5 },
    {
      id: 'kabel2',
      shape: 'poly',
      closed: false,
      smooth: true,
      points: KABEL.slice(4),
      fill: 'none',
      stroke: '#2b2b2b',
      strokeWidth: 5,
      origin: [610, 492],
    },
    { id: 'listrik', shape: 'flow', path: KABEL, count: 12, size: 11, speed: 0.4, fill: KUNING, glow: true },
    rumahJaringan(760, 'j1'),
    rumahJaringan(880, 'j2'),
    { id: 'titik-putus', shape: 'group', pos: [640, 500], children: [] },
  ],
};

/** Terowongan MRT dibelah: jalan di atas, tanah, kereta tertahan di dalam. */
const kereta2D = (x: number): IrisanPart => ({
  shape: 'group',
  children: [
    { shape: 'rect', x, y: 600, w: 250, h: 150, r: 26, fill: '#f4f4f2' },
    { shape: 'rect', x: x + 2, y: 700, w: 246, h: 14, fill: '#2563eb', stroke: false },
    { shape: 'rect', x: x + 22, y: 622, w: 60, h: 46, r: 6, fill: '#3a4250' },
    { shape: 'rect', x: x + 96, y: 622, w: 60, h: 46, r: 6, fill: '#3a4250' },
    { shape: 'rect', x: x + 170, y: 622, w: 60, h: 46, r: 6, fill: '#3a4250' },
    { shape: 'circle', x: x + 52, y: 650, r: 10, fill: '#f0c9a0', stroke: false },
    { shape: 'circle', x: x + 126, y: 652, r: 10, fill: '#d9a77c', stroke: false },
    { shape: 'circle', x: x + 200, y: 650, r: 10, fill: '#f0c9a0', stroke: false },
    { shape: 'circle', x: x + 50, y: 760, r: 14, bahan: 'logam' },
    { shape: 'circle', x: x + 200, y: 760, r: 14, bahan: 'logam' },
  ],
});
const terowongan: Irisan = {
  size: [1000, 1000],
  badge: 'Ilustrasi · irisan terowongan',
  views: { utuh: { center: [500, 560], zoom: 1 } },
  parts: [
    { shape: 'rect', x: 0, y: 400, w: 1000, h: 600, bahan: 'tanah' },
    { shape: 'rect', x: 0, y: 860, w: 1000, h: 140, bahan: 'batu', stroke: false },
    { shape: 'rect', x: 0, y: 370, w: 1000, h: 34, fill: '#8d9198' },
    { shape: 'rect', x: 120, y: 384, w: 60, h: 6, fill: '#f4f4f2', stroke: false },
    { shape: 'rect', x: 420, y: 384, w: 60, h: 6, fill: '#f4f4f2', stroke: false },
    { shape: 'rect', x: 720, y: 384, w: 60, h: 6, fill: '#f4f4f2', stroke: false },
    { shape: 'rect', x: 80, y: 330, w: 90, h: 40, r: 12, fill: '#e5484d' },
    { shape: 'rect', x: 640, y: 330, w: 90, h: 40, r: 12, fill: '#2563eb' },
    { shape: 'rect', x: 840, y: 180, w: 120, h: 190, fill: '#f1ede5' },
    { shape: 'rect', x: 30, y: 230, w: 30, h: 140, fill: '#7b7f86' },
    // Terowongan: lapisan beton + ruang dalam.
    { shape: 'rect', x: -20, y: 560, w: 1040, h: 260, r: 120, bahan: 'beton' },
    { shape: 'rect', x: -20, y: 584, w: 1040, h: 212, r: 100, fill: '#efece5' },
    { shape: 'rect', x: -20, y: 776, w: 1040, h: 10, fill: '#6b6f76', stroke: false },
    ...[120, 380, 640, 900].map((x, i): IrisanPart => ({ id: `lampu${i}`, shape: 'circle', x, y: 596, r: 9, fill: KUNING, glow: true })),
    {
      id: 'mrt',
      shape: 'group',
      motion: [{ type: 'move', to: [-700, 0], at: 0, duration: 0.01 }],
      children: [kereta2D(100), kereta2D(370), kereta2D(640)],
    },
    { id: 'jangkar-mrt', shape: 'group', pos: [500, 640], children: [] },
  ],
};

/** Rumah dibelah: sumur → pompa listrik → toren di atap → keran dapur. */
const PIPA: Vec2[] = [[290, 900], [290, 700], [400, 700], [430, 700], [430, 250], [610, 250]];
const pompa: Irisan = {
  size: [1000, 1000],
  badge: 'Ilustrasi · irisan rumah',
  views: { utuh: { center: [500, 560], zoom: 1 }, toren: { center: [640, 420], zoom: 1.5 } },
  parts: [
    { shape: 'rect', x: 0, y: 760, w: 1000, h: 240, bahan: 'tanah' },
    { shape: 'rect', x: 0, y: 940, w: 1000, h: 60, bahan: 'air', stroke: false },
    { shape: 'rect', x: 270, y: 760, w: 40, h: 200, fill: '#6b5544' },
    { shape: 'rect', x: 276, y: 900, w: 28, h: 56, bahan: 'air', stroke: false },
    // Rumah
    { shape: 'rect', x: 340, y: 420, w: 560, h: 340, bahan: 'beton' },
    { shape: 'rect', x: 360, y: 440, w: 520, h: 300, fill: '#f6f3ed' },
    { shape: 'poly', points: [[320, 420], [620, 300], [920, 420]], fill: '#c96f53' },
    { shape: 'rect', x: 520, y: 620, w: 200, h: 16, bahan: 'kayu' },
    { shape: 'rect', x: 530, y: 636, w: 16, h: 104, bahan: 'kayu' },
    { shape: 'rect', x: 694, y: 636, w: 16, h: 104, bahan: 'kayu' },
    { shape: 'rect', x: 760, y: 560, w: 90, h: 180, r: 8, fill: '#f8f8f6' },
    // Toren (dibelah) di atap
    { shape: 'rect', x: 560, y: 150, w: 180, h: 170, r: 22, fill: '#2f6fd6' },
    { shape: 'rect', x: 572, y: 162, w: 156, h: 146, r: 16, fill: '#eef3f7' },
    { id: 'air-toren', shape: 'rect', x: 572, y: 182, w: 156, h: 126, r: 14, bahan: 'air', origin: [650, 308] },
    { shape: 'rect', x: 580, y: 320, w: 12, h: 60, fill: '#7b7f86' },
    { shape: 'rect', x: 708, y: 320, w: 12, h: 60, fill: '#7b7f86' },
    // Pipa naik + pipa turun ke keran
    { shape: 'poly', closed: false, points: PIPA, fill: 'none', stroke: '#8b9097', strokeWidth: 16 },
    { shape: 'poly', closed: false, points: [[700, 320], [700, 560], [640, 560], [640, 590]], fill: 'none', stroke: '#8b9097', strokeWidth: 12 },
    { id: 'aliran', shape: 'flow', path: PIPA, count: 14, size: 8, speed: 0.5, bahan: 'air' },
    { id: 'tetes', shape: 'flow', path: [[640, 596], [640, 618]], count: 3, size: 7, speed: 1.2, bahan: 'air' },
    // Pompa listrik
    { shape: 'rect', x: 350, y: 650, w: 110, h: 100, r: 12, fill: '#4b7bd8' },
    {
      id: 'kipas',
      shape: 'group',
      motion: [{ type: 'spin', speed: 2 }],
      origin: [405, 700],
      children: [
        { shape: 'circle', x: 405, y: 700, r: 34, bahan: 'logam' },
        { shape: 'rect', x: 401, y: 668, w: 8, h: 64, fill: '#5d636b', stroke: false },
        { shape: 'rect', x: 373, y: 696, w: 64, h: 8, fill: '#5d636b', stroke: false },
      ],
    },
    { shape: 'poly', closed: false, smooth: true, points: [[460, 690], [520, 600], [560, 470], [600, 445]], fill: 'none', stroke: '#2b2b2b', strokeWidth: 5 },
    { id: 'setrum', shape: 'flow', path: [[600, 445], [560, 470], [520, 600], [460, 690]], count: 5, size: 7, speed: 0.8, fill: KUNING, glow: true },
    { id: 'jangkar-pompa', shape: 'group', pos: [405, 650], children: [] },
  ],
};

export default bedah3D(bagaimanaJika, {
  slug: 'ListrikPadam',
  topik: 'Listrik',
  catatan: 'Ilustrasi · bukan skala',
  dunia: {
    objects,
    ground: '#d9d3c7',
    sky: '#ebe7df',
    views: {
      kota: { target: [2, 4, 2], distance: 200, azimuth: 35, elevation: 34, fov: 15 },
      atas: { target: [2, 2, 0], distance: 300, azimuth: 20, elevation: 60, fov: 15 },
      krl: { target: [24, 2, 0], distance: 90, azimuth: 55, elevation: 26, fov: 15 },
      lalin: { target: [-4.6, 4.2, 8], distance: 60, azimuth: 30, elevation: 14, fov: 15 },
      bts: { target: [16, 14, 16], distance: 90, azimuth: 30, elevation: 10, fov: 15 },
      rumah: { target: [-4, 2, -38], distance: 85, azimuth: 25, elevation: 28, fov: 15 },
      atm: { target: [-6, 1.4, -35], distance: 55, azimuth: 30, elevation: 20, fov: 15 },
      spbu: { target: [-15, 2.5, -41], distance: 80, azimuth: 28, elevation: 30, fov: 15 },
      kulkas: { target: [-2.8, 1.4, -35], distance: 46, azimuth: 15, elevation: 20, fov: 15 },
    },
  },
  irisan: { jaringan, terowongan, pompa },
  adegan: [
    {
      bab: { label: 'Bagaimana jika…', judul: 'Jawa–Bali padam 3 hari?', highlight: '3 hari' },
      narasi: 'Bagaimana jika listrik Jawa dan Bali padam tiga hari?',
      emphasis: ['tiga hari'],
      kamera: 'kota',
    },
    {
      narasi: 'Setiap detik, listrik mengalir dari pembangkit ke jutaan rumah.',
      emphasis: ['mengalir'],
      gambar: 'jaringan',
      kamera: 'utuh',
      label: [
        { target: 'pembangkit', text: 'Pembangkit', at: 'pembangkit', side: 'right' },
        { target: 'j2', text: 'Rumah', at: 'rumah', side: 'left' },
      ],
    },
    {
      bab: { label: 'Pernah terjadi', judul: 'Agustus 2019', highlight: '2019' },
      narasi: 'Lalu, empat Agustus dua ribu sembilan belas, aliran itu putus.',
      emphasis: ['putus'],
      gambar: 'jaringan',
      kamera: { view: 'putus', at: 'aliran', duration: 1.2 },
      labelBersih: true,
      gerak: {
        kabel2: [
          { type: 'shake', amount: 5, at: 'aliran', stopAt: 'putus' },
          { type: 'turn', to: 38, at: 'putus', duration: 0.6 },
        ],
        j1: [{ type: 'color', to: '#55595f', at: 'putus', duration: 0.3 }],
        j1b: [{ type: 'color', to: '#55595f', at: 'putus', duration: 0.3 }],
        j2: [{ type: 'color', to: '#55595f', at: 'putus', duration: 0.3 }],
        j2b: [{ type: 'color', to: '#55595f', at: 'putus', duration: 0.3 }],
      },
      hilang: { listrik: 'putus' },
      data: { text: '4 Agustus 2019 · 11.48 WIB', source: 'Tempo · 2019' },
      cap: { text: 'PADAM', at: 'putus' },
    },
    {
      narasi: 'Dua puluh satu koma sembilan juta pelanggan PLN gelap seketika.',
      emphasis: ['dua puluh satu koma sembilan juta'],
      kamera: 'atas',
      data: false,
      ubah: Object.fromEntries(jendela.map((j) => [j.id!, { color: MATI }])),
      hilang: { listrik: 0 },
      panel: {
        title: 'Pemadaman 4 Agustus 2019',
        rows: [{ label: 'Pelanggan PLN', value: 0, to: 21.9, decimals: 1, suffix: ' juta', at: 'Dua', duration: 2.2, color: '#f6d23f' }],
        note: 'PLN di DPR, 6 Agustus 2019',
      },
    },
    {
      bab: { label: 'Jam pertama', judul: 'kota berhenti', highlight: 'berhenti' },
      narasi: 'Empat kereta MRT tertahan di dalam terowongan.',
      emphasis: ['tertahan'],
      gambar: 'terowongan',
      kamera: 'utuh',
      gerak: {
        mrt: [{ type: 'move', to: [-60, 0], at: 0.1, duration: 2.2 }],
        lampu0: [{ type: 'color', to: '#55595f', at: 'tertahan', duration: 0.3 }],
        lampu1: [{ type: 'color', to: '#55595f', at: 'tertahan', duration: 0.3 }],
        lampu2: [{ type: 'color', to: '#55595f', at: 'tertahan', duration: 0.3 }],
        lampu3: [{ type: 'color', to: '#55595f', at: 'tertahan', duration: 0.3 }],
      },
      label: [{ target: 'jangkar-mrt', text: 'Penumpang tertahan', at: 'tertahan' }],
      panel: {
        title: 'Jam pertama · CNN Indonesia 2019',
        rows: [{ label: 'Kereta MRT tertahan', value: 0, to: 4, at: 'Empat', duration: 0.8, color: '#f6d23f' }],
      },
    },
    {
      narasi: 'Dua ratus empat puluh perjalanan KRL batal.',
      emphasis: ['batal'],
      kamera: 'krl',
      panel: {
        title: 'Jam pertama · CNN Indonesia 2019',
        rows: [
          { label: 'Kereta MRT tertahan', value: 4, color: '#f6d23f' },
          { label: 'Perjalanan KRL batal', value: 0, to: 240, at: 'Dua', duration: 1.8, showAt: 'Dua', color: '#f6d23f' },
        ],
      },
      cap: { text: 'BATAL', target: 'krl', at: 'batal' },
    },
    {
      narasi: 'Lampu lalu lintas mati, dan sinyal ponsel ikut terganggu.',
      emphasis: ['mati', 'sinyal'],
      kamera: ['lalin', { view: 'bts', at: 'sinyal', duration: 1 }],
      panel: false,
      gerak: {
        'lalin-hijau': [{ type: 'color', to: MATI, at: 'mati', duration: 0.3 }],
        sinyal0: [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
        sinyal1: [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
        sinyal2: [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
      },
      label: [{ target: 'lalin', text: 'Diatur manual', at: 'mati' }],
      data: { text: 'Lalin manual · sinyal terganggu', source: 'Tirto · 2019' },
    },
    {
      narasi: 'Sebagian wilayah baru menyala lagi besok malamnya.',
      emphasis: ['besok malamnya'],
      kamera: 'atas',
      data: false,
      meter: {
        title: 'Lama padam',
        tag: 'Hitungan kami',
        tone: 'hitungan',
        max: 72,
        rows: [{ label: '2019', value: 0, to: 34, at: 'menyala', duration: 1.4, text: '±34 jam', color: '#1b1b1b' }],
        note: '4 Agt 11.48 → 5 Agt ±22.00 WIB (DPR, 2019)',
      },
    },
    {
      bab: { label: 'Skenario', judul: 'bagaimana jika 3 hari?', highlight: '3 hari' },
      narasi: 'Sekarang, bayangkan tiga hari penuh.',
      emphasis: ['tiga hari'],
      meter: {
        title: 'Lama padam',
        tag: 'Skenario',
        tone: 'ilustrasi',
        max: 72,
        rows: [
          { label: '2019', value: 34, text: '±34 jam', color: '#1b1b1b' },
          { label: 'Skenario', value: 0, to: 72, showAt: 'tiga', at: 'tiga', duration: 1.4, text: '72 jam', color: 'danger' },
        ],
      },
      cap: { text: '72 JAM', at: 'penuh' },
    },
    {
      bab: { label: 'Skenario · hari 2', judul: 'keran kering', highlight: 'kering' },
      narasi: 'Hari kedua, pompa air berhenti. Keran kering.',
      emphasis: ['kering'],
      gambar: 'pompa',
      kamera: ['utuh', { view: 'toren', at: 'Keran', duration: 1.1 }],
      meter: false,
      gerak: {
        kipas: [{ type: 'spin', speed: -2, at: 'berhenti', stopAt: 'berhenti' }],
        'air-toren': [{ type: 'scale', to: [1, 0.08], at: 'Keran', duration: 1.6 }],
      },
      hilang: { aliran: 'berhenti', setrum: 'Hari', tetes: 'kering' },
      label: [{ target: 'jangkar-pompa', text: 'Pompa butuh listrik', at: 'pompa', side: 'right' }],
      catatan: 'Skenario · bukan data',
    },
    {
      narasi: 'ATM dan QRIS mati. Uang tunai jadi raja.',
      emphasis: ['Uang tunai'],
      kamera: 'atm',
      gerak: { 'layar-atm': [{ type: 'color', to: '#1e293b', at: 'mati', duration: 0.3 }] },
      muncul: { tunai: 'tunai' },
      label: [{ target: 'atm', text: 'ATM & QRIS mati', at: 'mati' }],
      cap: { text: 'TUNAI', target: 'tunai', at: 'raja' },
      catatan: 'Skenario · bukan data',
    },
    {
      bab: { label: 'Skenario · hari 3', judul: 'SPBU tersendat', highlight: 'tersendat' },
      narasi: 'Hari ketiga, SPBU sulit memompa bensin.',
      emphasis: ['sulit'],
      kamera: 'spbu',
      gerak: {
        'layar-spbu': [{ type: 'color', to: '#1e293b', at: 'sulit', duration: 0.3 }],
        'layar-spbu2': [{ type: 'color', to: '#1e293b', at: 'sulit', duration: 0.3 }],
      },
      label: [{ target: 'nozzle', text: 'Pompa bensin pakai listrik', at: 'memompa' }],
      catatan: 'Skenario · bukan data',
    },
    {
      narasi: 'Dan isi kulkas mulai basi.',
      emphasis: ['basi'],
      kamera: 'kulkas',
      muncul: { 'isi-kulkas': 0.2 },
      gerak: { 'isi-kulkas': [{ type: 'color', to: '#a16207', at: 'basi', duration: 1 }] },
      label: [{ target: 'isi-kulkas', text: 'Basi', at: 'basi', color: 'danger' }],
      catatan: 'Skenario · bukan data',
    },
    {
      bab: { label: 'Siapa bertahan?', judul: 'yang bersiap', highlight: 'bersiap' },
      narasi: 'Yang bertahan bukan yang paling kaya, tapi yang punya uang tunai, stok air, dan senter.',
      emphasis: ['uang tunai', 'stok air', 'senter'],
      kamera: 'rumah',
      kartu: [
        {
          gaya: 'putusan',
          text: 'Siapkan di rumah',
          points: [
            { text: 'Uang tunai', ok: true, at: 'tunai' },
            { text: 'Stok air galon', ok: true, at: 'stok' },
            { text: 'Senter & power bank', ok: true, at: 'senter' },
          ],
          at: 'bertahan',
        },
      ],
    },
    {
      bab: { label: 'Jadi', judul: 'siapkan sebelum gelap', highlight: 'sebelum gelap' },
      narasi: 'Listrik padam tidak bisa kita cegah, tapi bisa kita siapkan.',
      emphasis: ['siapkan'],
      kamera: 'kota',
    },
  ],
  lexicon: { PLN: 'Pe El En', KRL: 'Ka Er El', MRT: 'Em Er Te', QRIS: 'kris', ATM: 'A Te Em', SPBU: 'Es Pe Be U' },
});
