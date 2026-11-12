import type { IrisanPart, Vec2 } from '../scenes/types';
import type { Irisan } from '../templates/Bedah3D';

/**
 * PUSTAKA IRISAN TEKNIS 2D siap pakai untuk template `bedah3D` (props `irisan` + adegan `gambar`).
 * Katalog + cara pakai + daftar id bagian & view: `docs/PUSTAKA-VISUAL.md`. Kanvas 1000 × 1000/1100 (y ke bawah).
 * Pakai apa adanya (`irisan: { gunung: irisanGunungApi() }`) atau salin lalu ubah. Asal: seri `src/projects/bagaimana-jika/`.
 *
 * Gambar utuh: irisanGunungApi · irisanLongsorLereng · irisanPantai · irisanJaringanListrik · irisanTerowongan · irisanPompaAir.
 * Potongan: rumahKecil2D · pesisir2D · rumahLampu2D · menaraListrik2D · kereta2D.
 */

const LAUT2D = 'air' as const;
export const rumahKecil2D = (x: number, y: number, roof: string): IrisanPart => ({
  shape: 'group',
  children: [
    { shape: 'rect', x, y, w: 46, h: 34, fill: '#f4f1ea' },
    { shape: 'poly', points: [[x - 6, y], [x + 23, y - 22], [x + 52, y]], fill: roof },
    { shape: 'rect', x: x + 18, y: y + 14, w: 10, h: 20, fill: '#5b4a3a', stroke: false },
  ],
});
export const pesisir2D: IrisanPart[] = [
  { shape: 'poly', points: [[790, 528], [860, 500], [1000, 490], [1000, 760], [760, 760]], bahan: 'tanah' },
  { shape: 'poly', points: [[790, 528], [860, 500], [1000, 490], [1000, 506], [860, 514], [796, 540]], bahan: 'rumput', stroke: false },
  rumahKecil2D(870, 466, '#d9534f'),
  rumahKecil2D(935, 460, '#e8a33d'),
];

/** Krakatau 1883 dibelah: dapur magma → saluran → kawah; puncak runtuh; gelombang menuju pesisir. */
export const irisanGunungApi = (): Irisan => ({
  size: [1000, 1100],
  badge: 'Ilustrasi · irisan · bukan skala',
  views: {
    utuh: { center: [500, 600], zoom: 1 },
    kawah: { center: [440, 430], zoom: 1.55 },
    laut: { center: [640, 560], zoom: 1.2 },
  },
  parts: [
    { shape: 'wave', x: 0, y: 530, w: 1000, h: 230, bahan: LAUT2D, amp: 7, length: 180, speed: 0.3 },
    { shape: 'poly', points: [[0, 740], [180, 720], [420, 760], [700, 735], [1000, 750], [1000, 860], [0, 860]], smooth: false, bahan: 'tanah' },
    { shape: 'rect', x: 0, y: 860, w: 1000, h: 240, bahan: 'batu', stroke: false },
    { id: 'dapur', shape: 'ellipse', x: 440, y: 960, rx: 190, ry: 78, bahan: 'magma' },
    {
      id: 'tubuh',
      shape: 'poly',
      smooth: true,
      points: [[120, 760], [260, 600], [340, 470], [400, 360], [480, 360], [540, 470], [620, 600], [760, 760]],
      fill: '#b49a84',
      hatch: true,
    },
    {
      id: 'puncak',
      shape: 'poly',
      smooth: true,
      points: [[330, 488], [372, 410], [400, 360], [480, 360], [508, 410], [550, 488]],
      fill: '#a58b75',
      hatch: true,
    },
    // Saluran magma: tumbuh dari dapur ke kawah (skala-y berporos di dasar).
    {
      id: 'saluran',
      shape: 'rect',
      x: 425,
      y: 380,
      w: 30,
      h: 520,
      r: 12,
      bahan: 'magma',
      origin: [440, 900],
      motion: [{ type: 'scale', to: [1, 0.25], at: 0, duration: 0.01 }],
    },
    {
      id: 'abu',
      shape: 'group',
      hidden: true,
      motion: [{ type: 'bob', amount: 8, period: 3 }],
      children: [
        { shape: 'circle', x: 440, y: 230, r: 110, bahan: 'abu' },
        { shape: 'circle', x: 330, y: 270, r: 80, bahan: 'abu' },
        { shape: 'circle', x: 560, y: 260, r: 90, bahan: 'abu' },
        { shape: 'circle', x: 440, y: 120, r: 85, bahan: 'abu' },
      ],
    },
    { id: 'lontaran', shape: 'flow', path: [[440, 360], [400, 250], [330, 170], [260, 140]], count: 7, size: 14, speed: 0.8, bahan: 'magma', hidden: true },
    { id: 'lontaran2', shape: 'flow', path: [[440, 360], [500, 240], [580, 160], [660, 150]], count: 7, size: 12, speed: 0.7, bahan: 'magma', hidden: true },
    ...pesisir2D,
    {
      id: 'gelombang',
      shape: 'poly',
      smooth: true,
      hidden: true,
      points: [[520, 545], [575, 470], [620, 440], [665, 470], [720, 545]],
      fill: '#5eaed0',
    },
    { id: 'titik-gelombang', shape: 'group', pos: [620, 440], children: [] },
  ],
});

/** Anak Krakatau dibelah: lereng kanan longsor ke laut → gelombang tanpa gempa. */
export const irisanLongsorLereng = (): Irisan => ({
  size: [1000, 1100],
  badge: 'Ilustrasi · irisan · bukan skala',
  views: {
    utuh: { center: [500, 600], zoom: 1 },
    lereng: { center: [520, 580], zoom: 1.5 },
  },
  parts: [
    { shape: 'wave', x: 0, y: 530, w: 1000, h: 230, bahan: LAUT2D, amp: 6, length: 180, speed: 0.25 },
    { shape: 'poly', points: [[0, 740], [180, 725], [420, 760], [700, 735], [1000, 750], [1000, 860], [0, 860]], bahan: 'tanah' },
    { shape: 'rect', x: 0, y: 860, w: 1000, h: 240, bahan: 'batu', stroke: false },
    { shape: 'ellipse', x: 400, y: 950, rx: 120, ry: 50, bahan: 'magma' },
    { shape: 'rect', x: 392, y: 470, w: 18, h: 440, r: 8, bahan: 'magma' },
    {
      shape: 'poly',
      smooth: true,
      points: [[180, 760], [290, 610], [360, 490], [395, 455], [430, 470], [452, 520], [470, 760]],
      fill: '#9c8270',
      hatch: true,
    },
    {
      id: 'lereng',
      shape: 'poly',
      smooth: false,
      points: [[430, 470], [452, 520], [520, 610], [600, 700], [610, 760], [470, 760]],
      fill: '#b08f74',
      hatch: true,
      origin: [520, 700],
    },
    ...pesisir2D,
    {
      id: 'gelombang',
      shape: 'poly',
      smooth: true,
      hidden: true,
      points: [[560, 545], [600, 490], [640, 470], [680, 490], [720, 545]],
      fill: '#5eaed0',
    },
  ],
});

/** Pantai dari samping: laut surut, gemuruh, orang lari ke bukit. */
export const irisanPantai = (): Irisan => ({
  size: [1000, 1100],
  badge: 'Ilustrasi · bukan skala',
  views: { utuh: { center: [500, 560], zoom: 1 }, bukit: { center: [700, 460], zoom: 1.25 } },
  parts: [
    { id: 'laut', shape: 'wave', x: -100, y: 600, w: 620, h: 400, bahan: LAUT2D, amp: 8, length: 150, speed: 0.35 },
    { shape: 'poly', points: [[0, 820], [420, 640], [560, 590], [700, 540], [1000, 520], [1000, 1000], [0, 1000]], bahan: 'pasir' },
    { shape: 'poly', smooth: true, points: [[620, 560], [760, 380], [860, 250], [960, 230], [1060, 260], [1060, 560]], bahan: 'rumput', fill: '#9cc77a' },
    { shape: 'poly', smooth: true, points: [[700, 560], [800, 440], [880, 360], [960, 340], [1060, 360], [1060, 560]], bahan: 'tanah', opacity: 0.35, stroke: false },
    rumahKecil2D(880, 214, '#3d7dd8'),
    {
      id: 'orang',
      shape: 'group',
      children: [
        { shape: 'circle', x: 560, y: 520, r: 14, fill: '#f0c9a0' },
        { shape: 'rect', x: 548, y: 536, w: 24, h: 42, r: 8, fill: '#2563eb' },
        { shape: 'rect', x: 550, y: 576, w: 8, h: 26, r: 3, fill: '#2b2b2b' },
        { shape: 'rect', x: 562, y: 576, w: 8, h: 26, r: 3, fill: '#2b2b2b' },
      ],
    },
    {
      id: 'gemuruh',
      shape: 'group',
      hidden: true,
      children: [0, 1, 2].map(
        (i): IrisanPart => ({
          shape: 'poly',
          closed: false,
          smooth: true,
          points: [[150 + i * 46, 440 - i * 34], [190 + i * 50, 520], [150 + i * 46, 600 + i * 34]] as Vec2[],
          fill: 'none',
          stroke: '#f0732b',
          strokeWidth: 8,
          motion: [{ type: 'fade', to: 0.25, at: 0.6 + i * 0.25, duration: 0.6 }],
        }),
      ),
    },
    { id: 'jangkar-laut', shape: 'group', pos: [300, 700], children: [] },
  ],
});


const KUNING = '#ffd23f';

export const rumahLampu2D = (x: number, id: string): IrisanPart => ({
  shape: 'group',
  children: [
    { shape: 'rect', x, y: 640, w: 92, h: 120, fill: '#f4f1ea' },
    { shape: 'poly', points: [[x - 10, 640], [x + 46, 588], [x + 102, 640]], fill: '#c96f53' },
    { id, shape: 'rect', x: x + 18, y: 664, w: 24, h: 26, fill: KUNING, glow: true },
    { id: `${id}b`, shape: 'rect', x: x + 52, y: 664, w: 24, h: 26, fill: KUNING, glow: true },
    { shape: 'rect', x: x + 36, y: 712, w: 20, h: 48, fill: '#6b5544' },
  ],
});
export const menaraListrik2D = (x: number): IrisanPart => ({
  shape: 'poly',
  closed: false,
  points: [[x - 40, 760], [x - 12, 470], [x + 12, 470], [x + 40, 760], [x - 30, 660], [x + 30, 660], [x - 40, 760], [x - 22, 560], [x + 22, 560], [x + 40, 760], [x, 470], [x - 50, 490], [x + 50, 490]],
  fill: 'none',
  stroke: '#7b7f86',
  strokeWidth: 6,
});
const KABEL: Vec2[] = [[200, 560], [290, 505], [350, 492], [520, 520], [610, 492], [690, 520], [770, 600]];

/** Jaringan listrik dari samping: pembangkit → menara → rumah. */
export const irisanJaringanListrik = (): Irisan => ({
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
    menaraListrik2D(350),
    menaraListrik2D(610),
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
    rumahLampu2D(760, 'j1'),
    rumahLampu2D(880, 'j2'),
    { id: 'titik-putus', shape: 'group', pos: [640, 500], children: [] },
  ],
});

/** Terowongan MRT dibelah: jalan di atas, tanah, kereta tertahan di dalam. */
export const kereta2D = (x: number): IrisanPart => ({
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
export const irisanTerowongan = (): Irisan => ({
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
});

/** Rumah dibelah: sumur → pompa listrik → toren di atap → keran dapur. */
const PIPA: Vec2[] = [[290, 900], [290, 700], [400, 700], [430, 700], [430, 250], [610, 250]];
export const irisanPompaAir = (): Irisan => ({
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
});

