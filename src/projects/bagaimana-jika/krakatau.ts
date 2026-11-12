import type { IrisanPart, Vec2, Vec3, WorldMotion, WorldObject } from '../../scenes/types';
import { bedah3D, type Irisan } from '../../templates';
import { bagaimanaJika } from './series';

/**
 * Naskah & sumber: `naskah/bagaimana-jika/krakatau.md`. Gaya `docs/REFERENSI.md` R2: dunia 3D isometrik berlatar krem
 * + irisan teknis 2D saat "masuk ke dalam" (gunung, longsor, pantai). Semua dari bentuk dasar → render cepat.
 */

// ---------- Dunia 3D (laut = lantai) ----------
const LAUT = '#a9d3df';
const BATU = '#a08672';

const cincin = (id: string, pos: Vec3, radius: number, tube: number, color: string, opacity = 0.9): WorldObject => ({
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
const membesar = (to: number, at: string, duration: number): WorldMotion[] => [{ type: 'scale', to, at, duration }];

const rumah: WorldObject[] = (
  [
    [34, -14, '#d9534f'],
    [36, -4, '#e8a33d'],
    [33, 6, '#3d7dd8'],
    [37, 14, '#d9534f'],
    [41, -9, '#5aa469'],
    [42, 4, '#e8a33d'],
  ] as [number, number, string][]
).map(([x, z, roof], i): WorldObject => ({
  shape: 'group',
  pos: [x, 1.2, z],
  scale: i % 2 ? 1.1 : 0.9,
  children: [
    { shape: 'box', size: [3.2, 2.4, 4], pos: [0, 1.2, 0], color: '#f4f1ea' },
    { shape: 'cone', radius: 3.2, height: 1.8, pos: [0, 3.3, 0], color: roof, rotate: [0, 45, 0] },
    { shape: 'box', size: [0.1, 1.3, 0.9], pos: [-1.62, 0.65, 0], color: '#5b4a3a', round: 0.02 },
    { shape: 'box', size: [0.1, 0.7, 0.8], pos: [-1.62, 1.5, 1.2], color: '#8fb8d8', round: 0.02 },
  ],
}));

const pohon = (x: number, z: number, s = 1): WorldObject => ({
  shape: 'group',
  pos: [x, 1.2, z],
  scale: s,
  children: [
    { shape: 'cylinder', radius: 0.18, height: 1.6, pos: [0, 0.8, 0], color: '#7a5a3c' },
    { shape: 'sphere', radius: 1.1, pos: [0, 2.2, 0], color: '#6fa85a' },
    { shape: 'sphere', radius: 0.8, pos: [0.6, 2.7, 0.3], color: '#7fb866' },
  ],
});

const objects: WorldObject[] = [
  // Pesisir (kanan): pasir, daratan hijau, rumah, pohon, bukit, orang, dermaga kecil.
  { shape: 'box', size: [8, 1.2, 70], pos: [30, 0.4, 0], color: '#e8d6a8' },
  { shape: 'box', size: [40, 1.6, 70], pos: [54, 0.6, 0], color: '#b5cf8f' },
  { shape: 'box', size: [1.2, 1.4, 70], pos: [34.2, 1.1, 0], color: '#d9d4c7' },
  ...rumah,
  pohon(38, -20),
  pohon(39, 20, 1.2),
  pohon(44, -1),
  pohon(47, 12, 0.9),
  pohon(46, -16, 1.1),
  { shape: 'box', size: [9, 0.3, 1.4], pos: [24, 0.9, -10], color: '#b08b62' },
  { shape: 'box', size: [3, 1, 1.4], pos: [21, 0.8, -12], color: '#e9e4d8', rotate: [0, 20, 0] },
  { id: 'bukit', shape: 'cone', radius: 10, height: 12, pos: [60, 7, 6], color: '#8fb36a' },
  { id: 'puncak', shape: 'group', pos: [60, 13, 6] },
  { id: 'orang', shape: 'person', pos: [32, 1, 2], rotate: [0, 90, 0], scale: 1.3 },

  // Krakatau 1883 (tengah) + letusan.
  {
    id: 'krakatau',
    shape: 'group',
    children: [
      { shape: 'cone', radius: 11, height: 9, pos: [0, 4.5, 0], color: BATU },
      { shape: 'cone', radius: 6.5, height: 3.5, pos: [2.5, 1.75, 6], color: '#8f7562' },
      { shape: 'cylinder', radius: 2.4, radiusTop: 2.8, height: 0.6, pos: [0, 8.6, 0], color: '#5a463a' },
      pohon(6, 5),
      pohon(-5, 6, 1.2),
      pohon(-7, -3, 0.9),
    ],
  },
  { id: 'kawah', shape: 'group', pos: [0, 9, 0] },
  { id: 'lava', shape: 'flow', path: [[0, 9, 0], [0.6, 15, 0.3], [-0.4, 22, 0]], count: 18, size: 0.7, speed: 0.9, color: '#f0732b', hidden: true },
  { id: 'abu', shape: 'sphere', radius: 6, pos: [0, 28, 0], color: '#a9a49c', opacity: 0.8, hidden: true },
  ...[0, 1, 2].map((i): WorldObject => cincin(`suara${i}`, [0, 10, 0], 3, 0.25, '#f6d23f', 0.85 - i * 0.2)),
  cincin('tsunami', [0, 0.4, 0], 12, 0.9, '#f4fbff'),

  // Anak Krakatau (muncul setelah Krakatau lama hancur).
  {
    id: 'anak',
    shape: 'group',
    hidden: true,
    children: [
      { shape: 'cone', radius: 5, height: 4.5, pos: [0, 2.25, 0], color: '#7d6658' },
      { shape: 'cylinder', radius: 0.8, radiusTop: 1, height: 0.3, pos: [0, 4.4, 0], color: '#3e3029' },
    ],
  },
];

// ---------- Irisan teknis 2D ----------
const LAUT2D = 'air' as const;
const rumahIrisan = (x: number, y: number, roof: string): IrisanPart => ({
  shape: 'group',
  children: [
    { shape: 'rect', x, y, w: 46, h: 34, fill: '#f4f1ea' },
    { shape: 'poly', points: [[x - 6, y], [x + 23, y - 22], [x + 52, y]], fill: roof },
    { shape: 'rect', x: x + 18, y: y + 14, w: 10, h: 20, fill: '#5b4a3a', stroke: false },
  ],
});
const pesisirIrisan: IrisanPart[] = [
  { shape: 'poly', points: [[790, 528], [860, 500], [1000, 490], [1000, 760], [760, 760]], bahan: 'tanah' },
  { shape: 'poly', points: [[790, 528], [860, 500], [1000, 490], [1000, 506], [860, 514], [796, 540]], bahan: 'rumput', stroke: false },
  rumahIrisan(870, 466, '#d9534f'),
  rumahIrisan(935, 460, '#e8a33d'),
];

/** Krakatau 1883 dibelah: dapur magma → saluran → kawah; puncak runtuh; gelombang menuju pesisir. */
const gunung: Irisan = {
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
    ...pesisirIrisan,
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
};

/** Anak Krakatau dibelah: lereng kanan longsor ke laut → gelombang tanpa gempa. */
const anak: Irisan = {
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
    ...pesisirIrisan,
    {
      id: 'gelombang',
      shape: 'poly',
      smooth: true,
      hidden: true,
      points: [[560, 545], [600, 490], [640, 470], [680, 490], [720, 545]],
      fill: '#5eaed0',
    },
  ],
};

/** Pantai dari samping: laut surut, gemuruh, orang lari ke bukit. */
const pantai: Irisan = {
  size: [1000, 1100],
  badge: 'Ilustrasi · bukan skala',
  views: { utuh: { center: [500, 560], zoom: 1 }, bukit: { center: [700, 460], zoom: 1.25 } },
  parts: [
    { id: 'laut', shape: 'wave', x: -100, y: 600, w: 620, h: 400, bahan: LAUT2D, amp: 8, length: 150, speed: 0.35 },
    { shape: 'poly', points: [[0, 820], [420, 640], [560, 590], [700, 540], [1000, 520], [1000, 1000], [0, 1000]], bahan: 'pasir' },
    { shape: 'poly', smooth: true, points: [[620, 560], [760, 380], [860, 250], [960, 230], [1060, 260], [1060, 560]], bahan: 'rumput', fill: '#9cc77a' },
    { shape: 'poly', smooth: true, points: [[700, 560], [800, 440], [880, 360], [960, 340], [1060, 360], [1060, 560]], bahan: 'tanah', opacity: 0.35, stroke: false },
    rumahIrisan(880, 214, '#3d7dd8'),
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
};

export default bedah3D(bagaimanaJika, {
  slug: 'Krakatau',
  topik: 'Gunung Api',
  catatan: 'Ilustrasi · bukan skala',
  dunia: {
    objects,
    ground: LAUT,
    sky: '#ebe7df',
    views: {
      lebar: { target: [16, 4, 0], distance: 330, azimuth: 150, elevation: 34, fov: 15 },
      gunung: { target: [0, 8, 0], distance: 170, azimuth: 150, elevation: 26, fov: 15 },
      atas: { target: [12, 0, 0], distance: 420, azimuth: 180, elevation: 70, fov: 18 },
      rendah: { target: [12, 2, 0], distance: 260, azimuth: 205, elevation: 20, fov: 15 },
      pesisir: { target: [34, 2, 0], distance: 170, azimuth: 235, elevation: 30, fov: 15 },
      anak: { target: [1, 3, 0], distance: 110, azimuth: 160, elevation: 26, fov: 15 },
      bukit: { target: [50, 6, 4], distance: 180, azimuth: 215, elevation: 28, fov: 15 },
    },
  },
  irisan: { gunung, anak, pantai },
  adegan: [
    {
      bab: { label: 'Bagaimana jika…', judul: 'Krakatau meletus lagi?', highlight: 'meletus' },
      narasi: 'Bagaimana jika Krakatau meletus seperti tahun delapan belas delapan puluh tiga?',
      emphasis: ['meletus'],
      kamera: 'lebar',
      label: [{ target: 'kawah', text: 'Krakatau', at: 'Krakatau' }],
    },
    {
      bab: { label: '27 Agustus 1883', judul: 'Ledakan terkeras', highlight: 'terkeras' },
      narasi: 'Tanggal dua puluh tujuh Agustus, gunung ini meledak.',
      emphasis: ['meledak'],
      gambar: 'gunung',
      kamera: ['utuh', { view: 'kawah', at: 'gunung', duration: 1.2 }],
      gerak: {
        saluran: [{ type: 'scale', to: [1, 1], at: 'Agustus', duration: 1.4 }],
        tubuh: [{ type: 'shake', amount: 6, at: 'meledak', stopAt: 2.9 }],
      },
      muncul: { abu: 'meledak', lontaran: 'meledak', lontaran2: 'meledak' },
      label: [
        { target: 'dapur', text: 'Dapur magma', at: 'Agustus', side: 'right' },
        { target: 'saluran', text: 'Saluran magma', at: 'gunung', side: 'left' },
      ],
      cap: { text: 'DUAR!', at: 'meledak' },
    },
    {
      narasi: 'Suaranya terdengar sampai Australia, empat ribu delapan ratus kilometer jauhnya.',
      emphasis: ['empat ribu delapan ratus kilometer'],
      kamera: { view: 'atas', at: 'terdengar', duration: 1.5 },
      muncul: { lava: 0.1, abu: 0.1, suara0: 'terdengar', suara1: 'terdengar', suara2: 'terdengar' },
      gerak: {
        abu: [{ type: 'scale', to: 1.5, at: 0.1, duration: 1.5 }],
        suara0: membesar(30, 'terdengar', 2.4),
        suara1: membesar(22, 'terdengar', 3.2),
        suara2: membesar(14, 'terdengar', 4),
      },
      panel: {
        title: 'Suara letusan terdengar',
        rows: [{ label: 'Jarak', value: 0, to: 4800, prefix: '±', suffix: ' km', at: 'Australia', duration: 2 }],
        note: 'Alice Springs, Australia · GNFI, 2026',
      },
    },
    {
      bab: { label: 'Lalu…', judul: 'laut bangkit', highlight: 'bangkit' },
      narasi: 'Lalu laut bangkit jadi tsunami setinggi tiga puluh sampai empat puluh meter.',
      emphasis: ['tsunami'],
      gambar: 'gunung',
      kamera: ['kawah', { view: 'laut', at: 'laut', duration: 1.2 }],
      panel: false,
      hilang: { lontaran: 'laut', lontaran2: 'laut' },
      gerak: {
        puncak: [
          { type: 'move', to: [0, 150], at: 'Lalu', duration: 1.1 },
          { type: 'fade', to: 0, at: 'laut', duration: 0.8 },
        ],
        gelombang: [
          { type: 'scale', to: [1, 1.8], at: 'tsunami', duration: 1 },
          { type: 'move', to: [170, 0], at: 'tsunami', duration: 2.6 },
        ],
      },
      muncul: { gelombang: 'bangkit' },
      label: [{ target: 'gelombang', text: 'Gelombang 30–40 m', at: 'tsunami', color: '#2563eb' }],
      data: { text: 'Tinggi 30–40 m', source: 'Estimasi beragam' },
    },
    {
      narasi: 'Gelombangnya menghantam pesisir Banten dan Lampung.',
      emphasis: ['menghantam'],
      kamera: 'pesisir',
      data: false,
      hilang: { suara0: 0, suara1: 0, suara2: 0 },
      muncul: { tsunami: 0.1 },
      gerak: { tsunami: [{ type: 'scale', to: 1.6, at: 0.1, duration: 0.8 }, { type: 'scale', to: 2.7, at: 'menghantam', duration: 1.6 }] },
      label: [{ target: [33, 3, 6], text: 'Pesisir Banten & Lampung', at: 'pesisir' }],
      cap: { text: 'TSUNAMI', at: 'menghantam' },
    },
    {
      bab: { label: 'Korban', judul: '36.417 jiwa', highlight: '36.417' },
      narasi: 'Tiga puluh enam ribu lebih orang meninggal.',
      emphasis: ['Tiga puluh enam ribu'],
      kamera: 'lebar',
      panel: {
        title: 'Korban letusan 1883',
        rows: [{ label: 'Meninggal', value: 0, to: 36417, at: 'Tiga', duration: 2, color: '#f6d23f' }],
        note: 'Catatan resmi Hindia Belanda',
      },
    },
    {
      narasi: 'Sembilan puluh persen di antaranya karena tsunami, bukan ledakan.',
      emphasis: ['tsunami'],
      panel: false,
      meter: {
        title: 'Penyebab kematian',
        tag: 'Detik · 2024',
        tone: 'data',
        max: 100,
        rows: [
          { label: 'Tsunami', value: 0, to: 90, at: 'Sembilan', duration: 1.2, text: '±90%', color: 'primary' },
          { label: 'Lainnya', value: 0, to: 10, at: 'ledakan', duration: 0.8, text: '±10%', color: 'muted' },
        ],
      },
    },
    {
      bab: { label: 'Sekarang', judul: 'Krakatau sudah hancur', highlight: 'hancur' },
      narasi: 'Gunung Krakatau yang lama sudah hancur.',
      emphasis: ['hancur'],
      kamera: 'gunung',
      meter: false,
      labelBersih: true,
      hilang: { krakatau: 'hancur', lava: 'hancur', abu: 'hancur', tsunami: 0 },
    },
    {
      narasi: 'Yang tumbuh di sana sekarang adalah anaknya, Anak Krakatau.',
      emphasis: ['Anak Krakatau'],
      kamera: { view: 'anak', at: 'tumbuh', duration: 1.4 },
      muncul: { anak: 'tumbuh' },
      label: [{ target: 'anak', text: 'Anak Krakatau', at: 'anaknya' }],
    },
    {
      bab: { label: '22 Desember 2018', judul: 'bahaya yang nyata', highlight: 'nyata' },
      narasi: 'Desember dua ribu delapan belas, lerengnya longsor ke laut.',
      emphasis: ['longsor'],
      gambar: 'anak',
      kamera: ['utuh', { view: 'lereng', at: 'lerengnya', duration: 1.1 }],
      gerak: {
        lereng: [
          { type: 'shake', amount: 4, at: 'lerengnya', stopAt: 'longsor' },
          { type: 'move', to: [150, 110], at: 'longsor', duration: 1.6 },
          { type: 'turn', to: 22, at: 'longsor', duration: 1.6 },
        ],
      },
      label: [{ target: 'lereng', text: 'Lereng longsor', at: 'lerengnya', color: '#e5484d' }],
      data: { text: '± 21.27 WIB · malam hari', source: 'BNPB · 2018' },
    },
    {
      narasi: 'Tsunami datang malam hari, tanpa gempa, tanpa peringatan.',
      emphasis: ['tanpa gempa'],
      gambar: 'anak',
      kamera: { view: 'utuh', at: 0, duration: 1 },
      labelBersih: true,
      muncul: { gelombang: 'Tsunami' },
      gerak: {
        gelombang: [
          { type: 'scale', to: [1, 1.6], at: 'Tsunami', duration: 0.8 },
          { type: 'move', to: [140, 0], at: 'Tsunami', duration: 2.6 },
        ],
      },
      kartu: [
        {
          text: 'Tanda yang biasa ditunggu',
          points: [
            { text: 'Gempa', ok: false, at: 'gempa' },
            { text: 'Peringatan dini', ok: false, at: 'peringatan' },
          ],
          source: 'Pemicu: longsor bawah laut · BNPB 2018',
          at: 'malam',
        },
      ],
      cap: { text: 'TANPA GEMPA', at: 'peringatan' },
    },
    {
      narasi: 'Empat ratus tiga puluh tujuh orang meninggal.',
      emphasis: ['Empat ratus tiga puluh tujuh'],
      kamera: 'pesisir',
      data: false,
      panel: {
        title: 'Korban tsunami Selat Sunda 2018',
        rows: [{ label: 'Meninggal', value: 0, to: 437, at: 'Empat', duration: 1.8, color: '#f6d23f' }],
        note: 'BNPB · per 31 Des 2018',
      },
    },
    {
      bab: { label: 'Di pantai?', judul: 'ingat tandanya', highlight: 'tandanya' },
      narasi: 'Kalau air laut tiba-tiba surut, jangan didekati.',
      emphasis: ['surut'],
      gambar: 'pantai',
      kamera: 'utuh',
      panel: false,
      gerak: { laut: [{ type: 'move', to: [-260, 70], at: 'surut', duration: 1.8 }] },
      label: [{ target: 'jangkar-laut', text: 'Air surut = tanda bahaya', at: 'surut', color: '#e5484d' }],
    },
    {
      narasi: 'Dengar gemuruh dari laut? Jangan tunggu sirene.',
      emphasis: ['Jangan tunggu sirene'],
      gambar: 'pantai',
      labelBersih: true,
      muncul: { gemuruh: 'gemuruh' },
      gerak: { orang: [{ type: 'turn', to: -8, at: 'gemuruh', duration: 0.4 }] },
      cap: { text: 'JANGAN TUNGGU', at: 'sirene' },
    },
    {
      narasi: 'Langsung lari ke tempat tinggi.',
      emphasis: ['tempat tinggi'],
      gambar: 'pantai',
      kamera: { view: 'bukit', at: 'lari', duration: 1.4 },
      hilang: { gemuruh: 0 },
      gerak: {
        orang: [
          { type: 'turn', to: 0, at: 0, duration: 0.3 },
          { type: 'bob', amount: 5, period: 0.35 },
          { type: 'move', to: [330, -300], at: 'lari', duration: 2.2 },
        ],
      },
      label: [{ target: [905, 225], text: 'Tempat tinggi', at: 'tinggi', color: '#16a34a' }],
    },
    {
      bab: { label: 'Jadi', judul: 'tak perlu letusan besar', highlight: 'letusan besar' },
      narasi: 'Krakatau tidak perlu meletus sebesar dulu untuk berbahaya.',
      emphasis: ['berbahaya'],
      kamera: 'lebar',
      label: [{ target: 'anak', text: 'Anak Krakatau', at: 0.3 }],
      kartu: [{ gaya: 'putusan', text: 'Air surut atau gemuruh? Lari ke tempat tinggi.', sorot: ['tempat tinggi'], at: 'berbahaya' }],
    },
  ],
  lexicon: { BNPB: 'Be En Pe Be' },
});
