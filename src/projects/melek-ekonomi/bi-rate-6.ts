import type { Vec3, WorldMotion, WorldObject } from '../../scenes/types';
import { bedah3D } from '../../templates';
import { cincin, gedungKaca, gedungKantor, gedungPita, membesar, pohon } from '../../worlds';
import { melekEkonomi } from './series';

/**
 * "BI naikkan suku bunga jadi 6% — siapa untung, siapa rugi?" · ±65 dtk · 9:16 · Shorts/TikTok/Reels.
 * Naskah: `naskah/melek-ekonomi/bi-rate-6.md`. Satu dunia 3D semi-isometrik (render cepat, tanpa `.glb`):
 *
 *   SBN (kiri-belakang)          SAHAM / bursa (kanan-belakang)
 *                    GEDUNG BI (tengah) + tuas rem
 *   DEBITUR (kiri-depan)         BANK + timbangan (kanan-depan)
 *
 * Warna aset: biru = institusi · merah = negatif/kenaikan bunga · hijau = untung · kuning = perhatian.
 * Angka 5,75% → 6%, cicilan Rp4 jt → Rp4,4 jt, kupon 5%: dari brief pengguna (cicilan & kupon = ilustrasi).
 */

const BIRU = '#1d4ed8';
const MERAH = '#e5484d';
const HIJAU = '#16a34a';
const KUNING = '#f5b301';
const ABU = '#94a3b8';
const PUTIH = '#f6f8fb';

/** Titik-titik lingkaran datar (jalur uang beredar). */
const lingkar = (r: number, y: number, n = 20): Vec3[] =>
  Array.from({ length: n }, (_, i): Vec3 => [Math.cos((i / n) * Math.PI * 2) * r, y, Math.sin((i / n) * Math.PI * 2) * r]);

// ── Gedung Bank Indonesia (tengah): podium bertiang + menara kaca biru ───────────────────────────────
const gedungBI: WorldObject[] = [
  {
    id: 'bi',
    shape: 'group',
    children: [
      { shape: 'box', size: [24, 5, 16], pos: [0, 2.5, 0], color: PUTIH },
      { shape: 'box', size: [24.4, 0.7, 16.4], pos: [0, 5.2, 0], color: BIRU },
      { shape: 'box', size: [24, 0.6, 2.4], pos: [0, 4.6, 9], color: '#e6ebf2' },
      ...[-9, -5.4, -1.8, 1.8, 5.4, 9].map((x): WorldObject => ({ shape: 'cylinder', radius: 0.55, height: 4.3, pos: [x, 2.15, 9.4], color: '#ffffff' })),
      { shape: 'box', size: [5, 3, 0.2], pos: [0, 1.5, 8.1], color: '#1e3a8a' },
      gedungKaca([0, 5.5, -1], 12, 30, { color: '#2f6fdc' }),
      { shape: 'cylinder', radius: 0.15, height: 5, pos: [0, 38, -1], color: ABU },
    ],
  },
  { id: 'bi-atap', shape: 'group', pos: [0, 36, -1] },
  { id: 'bi-lobi', shape: 'group', pos: [0, 4, 9] },
  // Sirene alarm di puncak (muncul saat "Breaking").
  { id: 'sirene', shape: 'sphere', radius: 1.3, pos: [0, 36.6, -1], color: MERAH, hidden: true, motion: [{ type: 'bob', amount: 0.4, period: 0.5 }] },
  { ...cincin('alarm1', [0, 0.3, 0], 16, 0.5, MERAH), motion: membesar(3.2, 'Breaking', 1.4) },
  { ...cincin('alarm2', [0, 0.3, 0], 16, 0.5, MERAH), motion: membesar(3.2, 'resmi', 1.4) },
];

// Tuas REM di depan BI: lengan berputar saat "menahan".
const tuasRem: WorldObject = {
  id: 'tuas',
  shape: 'group',
  pos: [15, 0, 13],
  children: [
    { shape: 'box', size: [3.4, 1.6, 2.6], pos: [0, 0.8, 0], color: '#334155' },
    { shape: 'box', size: [2.6, 0.1, 0.5], pos: [0, 1.62, 0], color: '#0f172a' },
    {
      id: 'tuas-lengan',
      shape: 'group',
      pos: [0, 1.6, 0],
      rotate: [0, 0, -40],
      children: [
        { shape: 'cylinder', radius: 0.28, height: 7, pos: [0, 3.5, 0], color: '#cbd5e1' },
        { shape: 'sphere', radius: 1, pos: [0, 7.2, 0], color: MERAH },
      ],
    },
  ],
};

// Dunia ekonomi di sekitar BI: toko berapi (inflasi), koin rupiah & dolar, uang beredar.
const ekonomi: WorldObject[] = [
  gedungKantor([-16, 0, 11], 8, 6, 5, { id: 'toko', color: '#efe3c6' }),
  { shape: 'box', size: [8.4, 0.4, 1.8], pos: [-16, 3.6, 14.6], color: MERAH },
  {
    id: 'api',
    shape: 'group',
    pos: [-16, 5.2, 11],
    motion: [{ type: 'bob', amount: 0.25, period: 0.9 }],
    children: [
      { shape: 'cone', radius: 1.8, height: 4, pos: [0, 2, 0], color: '#f97316' },
      { shape: 'cone', radius: 1, height: 2.6, pos: [0.3, 1.3, 0.8], color: '#facc15' },
    ],
  },
  { id: 'koin-rupiah', shape: 'cylinder', axis: 'z', radius: 2.2, height: 0.5, pos: [-12, 14, 4], color: '#f2c14e', motion: [{ type: 'spin', axis: 'y', speed: 0.3 }, { type: 'bob', amount: 0.4 }] },
  { id: 'koin-dolar', shape: 'cylinder', axis: 'z', radius: 2.2, height: 0.5, pos: [-19, 19, -2], color: '#4caf7a', motion: [{ type: 'spin', axis: 'y', speed: 0.3 }, { type: 'bob', amount: 0.4, period: 3 }] },
  // Uang beredar: cepat (sebelum rem) → lambat (sesudah rem).
  { id: 'uang-cepat', shape: 'flow', path: lingkar(26, 0.8), closed: true, count: 30, size: 0.6, speed: 0.22, color: '#22c55e' },
  { id: 'uang-lambat', shape: 'flow', path: lingkar(26, 0.8), closed: true, count: 12, size: 0.6, speed: 0.05, color: '#22c55e', hidden: true },
  // Lantai memerah saat pengumuman (latar "alarm").
  { id: 'zona-merah', shape: 'cylinder', radius: 160, height: 0.04, pos: [0, 0.03, 0], color: '#ef4444', opacity: 0.32, hidden: true },
];

// ── DEBITUR (kiri-depan): rumah KPR, mobil, kartu kredit, dompet, usaha kecil ─────────────────────────
const debitur: WorldObject[] = [
  { id: 'rumah', shape: 'house', pos: [-46, 0, 22], scale: 1.5 },
  { id: 'rumah2', shape: 'house', pos: [-56, 0, 34], scale: 1.1 },
  { id: 'rumah3', shape: 'house', pos: [-58, 0, 12], scale: 1.1 },
  { id: 'mobil', shape: 'car', variant: 'sedan', pos: [-35, 0, 29], rotate: [0, 70, 0], color: '#94a3b8' },
  {
    id: 'kartu',
    shape: 'group',
    pos: [-33, 6, 18],
    rotate: [0, -25, 0],
    motion: [{ type: 'bob', amount: 0.3 }],
    children: [
      { shape: 'box', size: [4, 2.5, 0.14], color: '#1e3a8a', round: 0.18 },
      { shape: 'box', size: [4.02, 0.45, 0.16], pos: [0, 0.55, 0], color: '#0f172a', round: 0 },
      { shape: 'box', size: [0.7, 0.5, 0.06], pos: [-1.2, -0.2, 0.09], color: '#f5c518', round: 0.06 },
    ],
  },
  { id: 'debitur', shape: 'person', pos: [-40, 0, 34], rotate: [0, 30, 0], scale: 1.4 },
  {
    id: 'dompet',
    shape: 'group',
    pos: [-34, 3.2, 36],
    rotate: [0, -20, 0],
    motion: [{ type: 'bob', amount: 0.2 }],
    children: [
      { shape: 'box', size: [2.8, 2, 1.1], color: '#7c4a2d', round: 0.25 },
      { shape: 'box', size: [2.2, 0.3, 1.14], pos: [0, 0.5, 0], color: '#22c55e', round: 0.05 },
    ],
  },
  gedungKantor([-52, 0, 44], 7, 5, 4.5, { id: 'usaha', color: '#e9dcc3' }),
  { shape: 'box', size: [7.4, 0.35, 1.6], pos: [-52, 3.3, 47.2], color: '#0ea5e9' },
  // Tanda "gagal bayar" di atas dua rumah (muncul belakangan).
  { id: 'macet1', shape: 'sphere', radius: 1.2, pos: [-56, 12, 34], color: MERAH, hidden: true, motion: [{ type: 'bob', amount: 0.4, period: 1.2 }] },
  { id: 'macet2', shape: 'sphere', radius: 1.2, pos: [-58, 12, 12], color: MERAH, hidden: true, motion: [{ type: 'bob', amount: 0.4, period: 1.4 }] },
  pohon([-62, 0, 24], 1.3),
  pohon([-44, 0, 44], 1.1),
  pohon([-28, 0, 40], 1.2),
];

// ── BANK (kanan-depan): gedung bank, tumpukan bunga, timbangan pendapatan vs risiko ───────────────────
const timbangan: WorldObject = {
  id: 'timbangan',
  shape: 'group',
  pos: [26, 0, 38],
  children: [
    { shape: 'cylinder', radius: 2.4, radiusTop: 1.8, height: 0.8, pos: [0, 0.4, 0], color: '#334155' },
    { shape: 'cylinder', radius: 0.32, height: 8, pos: [0, 4.6, 0], color: '#cbd5e1' },
    { shape: 'sphere', radius: 0.6, pos: [0, 8.7, 0], color: KUNING },
    {
      id: 'timbangan-lengan',
      shape: 'group',
      pos: [0, 8.5, 0],
      children: [
        { shape: 'box', size: [13, 0.4, 0.4], color: '#cbd5e1' },
        ...[-1, 1].flatMap((s): WorldObject[] => [
          { shape: 'cylinder', radius: 0.06, height: 3.4, pos: [s * 6, -1.7, 0], color: '#64748b' },
          { shape: 'cylinder', radius: 2.2, radiusTop: 2.4, height: 0.3, pos: [s * 6, -3.5, 0], color: s < 0 ? HIJAU : MERAH },
        ]),
        { id: 'timbangan-kiri', shape: 'coins', count: 7, pos: [-6, -3.35, 0] },
        { id: 'timbangan-kanan', shape: 'group', pos: [6, -2, 0] },
        { id: 'risiko', shape: 'box', size: [2.2, 2.2, 2.2], pos: [6, -2.2, 0], color: MERAH, hidden: true },
      ],
    },
  ],
};

const bank: WorldObject[] = [
  gedungPita([42, 0, 18], 14, 11, 20, { id: 'bank', color: PUTIH }),
  { shape: 'box', size: [14.4, 1, 11.4], pos: [42, 20.4, 18], color: '#0ea5e9' },
  ...[37, 40.3, 43.7, 47].map((x): WorldObject => ({ shape: 'cylinder', radius: 0.45, height: 4, pos: [x, 2, 24.4], color: '#ffffff' })),
  { id: 'bank-atap', shape: 'group', pos: [42, 22, 18] },
  { id: 'koin-bunga', shape: 'coins', count: 18, pos: [34, 0, 28], scale: 2.2, hidden: true },
  // Bunga mengalir dari debitur ke bank.
  {
    id: 'aliran-bunga',
    shape: 'flow',
    path: [[-34, 3, 30], [-14, 16, 36], [12, 16, 36], [33, 3, 29]],
    count: 16,
    size: 0.7,
    speed: 0.25,
    color: KUNING,
    hidden: true,
  },
  timbangan,
  pohon([52, 0, 32], 1.2),
  pohon([30, 0, 12], 1),
];

// ── SBN / OBLIGASI (kiri-belakang): sertifikat lama vs SBN baru ──────────────────────────────────────
const sertifikat = (id: string, x: number, kertas: string, pita: string, segel: string): WorldObject => ({
  id,
  shape: 'group',
  pos: [x, 6.2, -26],
  children: [
    { id: `${id}-kertas`, shape: 'box', size: [7, 9, 0.4], color: kertas, round: 0.12 },
    { id: `${id}-pita`, shape: 'box', size: [7.04, 1.2, 0.44], pos: [0, 3, 0], color: pita, round: 0 },
    ...[0.6, -0.4, -1.4].map((y): WorldObject => ({ shape: 'box', size: [4.6, 0.22, 0.44], pos: [-0.6, y, 0], color: '#94a3b8', round: 0 })),
    { id: `${id}-segel`, shape: 'cylinder', axis: 'z', radius: 1, height: 0.25, pos: [2, -3, 0.25], color: segel },
  ],
});

const sbn: WorldObject[] = [
  { shape: 'box', size: [30, 0.8, 14], pos: [-36, 0.4, -26], color: '#f8fafc' },
  { shape: 'box', size: [1.2, 1.6, 0.8], pos: [-43, 1.6, -26], color: '#64748b' },
  { shape: 'box', size: [1.2, 1.6, 0.8], pos: [-29, 1.6, -26], color: '#64748b' },
  sertifikat('obligasi-lama', -43, '#d6dbe2', '#6b7280', '#9ca3af'),
  sertifikat('sbn-baru', -29, '#ffffff', BIRU, KUNING),
  { id: 'panah-turun', shape: 'cone', radius: 1.4, height: 3, rotate: [180, 0, 0], pos: [-48.5, 7, -26], color: MERAH, hidden: true },
  { id: 'panah-naik', shape: 'cone', radius: 1.4, height: 3, pos: [-23.5, 9, -26], color: HIJAU, hidden: true },
  { id: 'investor', shape: 'person', pos: [-36, 0.8, -19], rotate: [0, 0, 0], scale: 1.4 },
];

// ── SAHAM (kanan-belakang): bursa, batang IHSG, batang sektor, aliran dana ke SBN ─────────────────────
const tinggiIhsg = [7, 9, 8, 11, 10, 12];
const turunIhsg = [0, 0, 1.5, 3.5, 4.5, 6.5];
const sahamTurun = (i: number): WorldMotion[] =>
  turunIhsg[i]
    ? [
        { type: 'move', to: [24 + i * 3.2, tinggiIhsg[i] / 2 - turunIhsg[i], -18], at: 'tertekan', duration: 0.8 + i * 0.25 },
        { type: 'color', to: MERAH, at: 'tertekan', duration: 0.8 + i * 0.25 },
      ]
    : [];
const garisIhsg: Vec3[] = tinggiIhsg.map((h, i): Vec3 => [24 + i * 3.2, h - turunIhsg[i] + 1.4, -16.6]);

const saham: WorldObject[] = [
  gedungKaca([46, 0, -34], 12, 24, { id: 'bursa', color: '#3b6fd6' }),
  { shape: 'box', size: [18, 4, 0.4], pos: [44, 3, -27.6], color: '#0f172a', round: 0.1 },
  { shape: 'box', size: [16, 0.5, 0.42], pos: [44, 3.6, -27.4], color: '#22c55e', round: 0 },
  { shape: 'box', size: [12, 0.5, 0.42], pos: [42, 2.3, -27.4], color: MERAH, round: 0 },
  { shape: 'box', size: [22, 0.5, 8], pos: [32, 0.25, -18], color: '#f8fafc' },
  ...tinggiIhsg.map((h, i): WorldObject => ({
    id: `ihsg-${i}`,
    shape: 'box',
    size: [2.2, h, 2.2],
    pos: [24 + i * 3.2, h / 2, -18],
    color: '#60a5fa',
  })),
  { id: 'ihsg-garis', shape: 'tube', path: garisIhsg, radius: 0.3, color: MERAH, hidden: true },
  { id: 'ihsg-label', shape: 'group', pos: [34, 12, -18] },
  // Batang sektor: bank / properti / growth-tech.
  { id: 'sektor-bank', shape: 'box', size: [3.6, 10, 3.6], pos: [26, 5, -6], color: BIRU },
  { id: 'sektor-properti', shape: 'box', size: [3.6, 10, 3.6], pos: [32, 5, -6], color: '#64748b' },
  { id: 'sektor-growth', shape: 'box', size: [3.6, 10, 3.6], pos: [38, 5, -6], color: '#64748b' },
  {
    id: 'aliran-dana',
    shape: 'flow',
    path: [[36, 8, -22], [16, 22, -32], [-12, 22, -32], [-29, 12, -26]],
    count: 18,
    size: 0.75,
    speed: 0.28,
    color: '#22c55e',
    hidden: true,
  },
  pohon([20, 0, -30], 1.2),
  pohon([56, 0, -20], 1.1),
];

// ── Penutup: jalur dari BI ke tiap pihak ─────────────────────────────────────────────────────────────
const jalur = (id: string, ujung: Vec3): WorldObject[] => {
  const path: Vec3[] = [[0, 30, -1], [ujung[0] * 0.5, 26, ujung[2] * 0.5], ujung];
  return [
    { id, shape: 'tube', path, radius: 0.35, color: BIRU, hidden: true },
    { id: `${id}-arus`, shape: 'flow', path, count: 6, size: 0.6, speed: 0.4, color: '#60a5fa', hidden: true },
  ];
};
const zona: WorldObject[] = [
  { id: 'zona-debitur', shape: 'group', pos: [-44, 14, 24] },
  { id: 'zona-bank', shape: 'group', pos: [42, 22, 18] },
  { id: 'zona-sbn', shape: 'group', pos: [-36, 12, -26] },
  { id: 'zona-saham', shape: 'group', pos: [44, 25, -34] },
  ...jalur('jalur-debitur', [-44, 12, 24]),
  ...jalur('jalur-bank', [40, 20, 18]),
  ...jalur('jalur-sbn', [-36, 11, -26]),
  ...jalur('jalur-saham', [44, 24, -34]),
];

const objects: WorldObject[] = [...ekonomi, ...gedungBI, tuasRem, ...debitur, ...bank, ...sbn, ...saham, ...zona];

export default bedah3D(melekEkonomi, {
  slug: 'BIRate6',
  topik: 'Ekonomi',
  catatan: 'Ilustrasi · bukan saran investasi',
  dunia: {
    objects,
    ground: '#dde2e9',
    sky: '#e8ecf1',
    // Lensa 24° (semi-isometrik). Lebar terlihat di layar potret ≈ 0,24 × distance.
    views: {
      biJauh: { target: [0, 20, 0], distance: 460, azimuth: 18, elevation: 16, fov: 24 },
      biDekat: { target: [0, 19, 2], distance: 180, azimuth: 14, elevation: 12, fov: 24 },
      kota: { target: [0, 6, 4], distance: 500, azimuth: 35, elevation: 38, fov: 24 },
      orbitA: { target: [-4, 10, 6], distance: 290, azimuth: -30, elevation: 24, fov: 24 },
      orbitB: { target: [-2, 9, 6], distance: 290, azimuth: 30, elevation: 26, fov: 24 },
      orbitC: { target: [2, 8, 6], distance: 300, azimuth: 70, elevation: 30, fov: 24 },
      debitur: { target: [-44, 4, 28], distance: 195, azimuth: 28, elevation: 24, fov: 24 },
      dompet: { target: [-37, 3, 34], distance: 95, azimuth: 20, elevation: 18, fov: 24 },
      bank: { target: [36, 8, 26], distance: 215, azimuth: 40, elevation: 22, fov: 24 },
      timbangan: { target: [26, 6, 38], distance: 105, azimuth: -15, elevation: 14, fov: 24 },
      depan: { target: [-6, 6, 28], distance: 500, azimuth: 18, elevation: 30, fov: 24 },
      sbn: { target: [-38, 6, -24], distance: 175, azimuth: 18, elevation: 16, fov: 24 },
      sbnBaru: { target: [-32, 7, -24], distance: 130, azimuth: 30, elevation: 14, fov: 24 },
      saham: { target: [34, 6, -16], distance: 195, azimuth: 30, elevation: 22, fov: 24 },
      arusDana: { target: [4, 10, -22], distance: 460, azimuth: 10, elevation: 26, fov: 24 },
      sektor: { target: [32, 5, -8], distance: 140, azimuth: -30, elevation: 16, fov: 24 },
      jauh: { target: [0, 8, 0], distance: 545, azimuth: 40, elevation: 42, fov: 24 },
    },
  },
  adegan: [
    // ── SCENE 1 · HOOK ──────────────────────────────────────────────────────────────────────────────
    {
      bab: { label: 'Breaking', judul: 'BI Rate naik jadi 6%', highlight: '6%' },
      narasi: 'Breaking! Bank Indonesia resmi menaikkan suku bunga jadi 6 persen.',
      emphasis: ['Breaking', '6 persen'],
      kamera: [{ view: 'biJauh' }, { view: 'biDekat', at: 0.15, duration: 0.7 }],
      muncul: { sirene: 'Breaking', alarm1: 'Breaking', alarm2: 'resmi', 'zona-merah': 'menaikkan' },
      panel: {
        title: 'BI Rate',
        rows: [{ label: 'Suku bunga acuan', value: 5.75, to: 6, decimals: 2, suffix: '%', at: 'menaikkan', duration: 1.4, color: '#ff6b6b' }],
        note: 'Bank Indonesia',
      },
      cap: { text: 'BI RATE 6%', target: 'bi-atap', color: MERAH, at: 'persen' },
    },
    {
      narasi: 'Tapi, siapa yang sebenarnya paling terdampak?',
      emphasis: ['paling terdampak'],
      kamera: { view: 'kota', duration: 1.6 },
      hilang: { alarm1: 0.2, alarm2: 0.2 },
      label: [
        { target: 'zona-debitur', text: 'Debitur?', at: 'siapa' },
        { target: 'zona-bank', text: 'Bank?', at: 'sebenarnya' },
        { target: 'zona-sbn', text: 'SBN?', at: 'paling' },
        { target: 'zona-saham', text: 'Saham?', at: 'terdampak' },
      ],
    },
    // ── SCENE 2 · KENAPA BI NAIKKAN BUNGA ───────────────────────────────────────────────────────────
    {
      bab: { label: 'Kenapa naik?', judul: 'BI menginjak rem', highlight: 'rem' },
      narasi: 'BI biasanya menaikkan suku bunga untuk menahan inflasi dan menjaga nilai rupiah.',
      emphasis: ['menahan inflasi', 'nilai rupiah'],
      kamera: [{ view: 'orbitA', duration: 1.4 }, { view: 'orbitB', at: 'inflasi', duration: 3 }],
      panel: false,
      hilang: { sirene: 0.3 },
      gerak: {
        'zona-merah': [{ type: 'fade', to: 0, at: 0.2, duration: 1.2 }],
        'tuas-lengan': [{ type: 'turn', to: [0, 0, 35], at: 'menahan', duration: 0.8 }],
        api: [{ type: 'scale', to: 0.45, at: 'inflasi', duration: 1.2 }],
      },
      label: [
        { target: 'tuas', text: 'Tuas rem: bunga naik', color: BIRU, at: 'menahan' },
        { target: 'api', text: '🔥 Inflasi', color: MERAH, at: 'inflasi' },
        { target: 'koin-rupiah', text: 'Rupiah', color: BIRU, at: 'rupiah' },
        { target: 'koin-dolar', text: 'Dolar AS', color: HIJAU, at: 'rupiah' },
      ],
    },
    {
      narasi: 'Caranya, mengurangi uang yang beredar, sehingga harga lebih stabil.',
      emphasis: ['uang yang beredar', 'stabil'],
      kamera: { view: 'orbitC', duration: 3.5 },
      hilang: { 'uang-cepat': 'mengurangi' },
      muncul: { 'uang-lambat': 'mengurangi' },
      label: [{ target: [26, 1, 0], text: 'Uang beredar melambat', color: HIJAU, at: 'beredar' }],
      meter: {
        title: 'Efek rem bunga',
        tag: 'Arah umum',
        tone: 'ilustrasi',
        rows: [
          { label: 'Inflasi', value: 0.8, to: 0.45, at: 'mengurangi', text: '↓', color: MERAH },
          { label: 'Permintaan', value: 0.75, to: 0.5, at: 'beredar', text: '↓', color: MERAH },
          { label: 'Stabilitas', value: 0.4, to: 0.85, at: 'stabil', text: '↑', color: HIJAU },
        ],
      },
    },
    // ── SCENE 3 · DEBITUR ───────────────────────────────────────────────────────────────────────────
    {
      bab: { label: 'Debitur · floating rate', judul: 'Cicilan bisa naik', highlight: 'naik' },
      narasi: 'Kalau kamu punya pinjaman berbunga mengambang, cicilan bisa naik.',
      emphasis: ['berbunga mengambang', 'naik'],
      kamera: { view: 'debitur', duration: 1.4 },
      labelBersih: true,
      meter: false,
      label: [
        { target: 'rumah', text: '🏠 KPR', color: BIRU, at: 'punya' },
        { target: 'mobil', text: '🚗 Kredit mobil', color: BIRU, at: 'pinjaman' },
        { target: 'kartu', text: '💳 Kartu kredit', color: BIRU, at: 'berbunga' },
      ],
      panel: {
        title: 'Cicilan per bulan',
        rows: [
          { label: 'Cicilan', tag: 'floating', value: 4000000, to: 4400000, prefix: 'Rp', at: 'naik', duration: 1.2, color: '#ff6b6b' },
          { label: 'Selisih', value: 0, to: 400000, prefix: '+Rp', showAt: 'naik', at: 'naik', duration: 1.2, color: '#ff6b6b' },
        ],
        note: 'Ilustrasi · bukan simulasi bank',
      },
    },
    {
      narasi: 'Beban rumah tangga maupun bisnis ikut bertambah.',
      emphasis: ['bertambah'],
      kamera: { view: 'dompet', duration: 1.4 },
      gerak: {
        debitur: [
          { type: 'move', to: [-40, 0.9, 34], at: 'Beban', duration: 0.18 },
          { type: 'move', to: [-40, 0, 34], at: 'rumah', duration: 0.3 },
        ],
        dompet: [{ type: 'scale', to: 0.5, at: 'bertambah', duration: 1.2 }],
      },
      label: [
        { target: 'usaha', text: 'Usaha kecil', color: KUNING, at: 'bisnis' },
        { target: 'dompet', text: 'Dompet makin tipis', color: MERAH, at: 'bertambah' },
      ],
      cap: { text: 'CICILAN NAIK', color: MERAH, at: 'bertambah' },
    },
    // ── SCENE 4 · BANK / KREDITUR ───────────────────────────────────────────────────────────────────
    {
      bab: { label: 'Bank · kreditur', judul: 'Bunga masuk lebih besar', highlight: 'lebih besar' },
      narasi: 'Bank berpotensi memperoleh pendapatan bunga lebih besar.',
      emphasis: ['pendapatan bunga'],
      kamera: [{ view: 'bank', duration: 1.4 }, { view: 'timbangan', at: 'pendapatan', duration: 2.6 }],
      labelBersih: true,
      panel: false,
      muncul: { 'aliran-bunga': 'Bank', 'koin-bunga': 'memperoleh' },
      gerak: { 'timbangan-lengan': [{ type: 'turn', to: [0, 0, 9], at: 'besar', duration: 0.9 }] },
      label: [
        { target: 'bank-atap', text: 'Bank', color: BIRU, at: 'Bank' },
        { target: 'timbangan-kiri', text: 'Pendapatan bunga ↑', color: HIJAU, at: 'pendapatan', tetap: true },
      ],
    },
    {
      narasi: 'Namun risikonya juga meningkat, karena kemampuan bayar sebagian debitur bisa melemah.',
      emphasis: ['risikonya', 'melemah'],
      kamera: { view: 'depan', at: 'karena', duration: 1.8 },
      muncul: { risiko: 'risikonya', macet1: 'melemah', macet2: 'melemah' },
      gerak: { 'timbangan-lengan': [{ type: 'turn', to: [0, 0, -4], at: 'meningkat', duration: 1 }] },
      label: [
        { target: 'timbangan-kanan', text: 'Risiko gagal bayar ↑', color: MERAH, at: 'meningkat' },
        { target: 'macet1', text: 'Telat bayar', color: MERAH, at: 'melemah' },
      ],
    },
    // ── SCENE 5 · SBN / OBLIGASI ────────────────────────────────────────────────────────────────────
    {
      bab: { label: 'Obligasi & SBN', judul: 'Obligasi lama turun harga', highlight: 'turun harga' },
      narasi: 'Saat bunga naik, harga obligasi lama biasanya turun.',
      emphasis: ['obligasi lama', 'turun'],
      kamera: { view: 'sbn', duration: 1.4 },
      labelBersih: true,
      gerak: {
        'obligasi-lama': [{ type: 'move', to: [-43, 3.8, -26], at: 'turun', duration: 0.9 }],
        'obligasi-lama-kertas': [{ type: 'color', to: '#e9c9ca', at: 'turun', duration: 0.9 }],
      },
      muncul: { 'panah-turun': 'turun' },
      label: [{ target: 'obligasi-lama-pita', text: 'Lama · kupon 5%', color: ABU, at: 'obligasi', tetap: true }],
      meter: {
        title: 'Obligasi saat bunga naik',
        tag: 'Arah umum',
        tone: 'ilustrasi',
        rows: [{ label: 'Harga obligasi lama', value: 0.75, to: 0.45, at: 'turun', text: '↓', color: MERAH }],
      },
    },
    {
      narasi: 'Sebaliknya, SBN baru menawarkan imbal hasil yang lebih menarik.',
      emphasis: ['imbal hasil', 'menarik'],
      kamera: { view: 'sbnBaru', duration: 1.6 },
      gerak: {
        'sbn-baru': [{ type: 'move', to: [-29, 8.6, -26], at: 'SBN', duration: 1 }],
        'sbn-baru-segel': [{ type: 'spin', axis: 'z', speed: 0.6, at: 'imbal' }],
        investor: [{ type: 'move', to: [-31, 0.8, -20.5], at: 'menarik', duration: 1.2 }],
      },
      muncul: { 'panah-naik': 'imbal' },
      label: [{ target: 'sbn-baru-pita', text: 'SBN baru · kupon ↑', color: HIJAU, at: 'SBN' }],
      meter: {
        title: 'Obligasi saat bunga naik',
        tag: 'Arah umum',
        tone: 'ilustrasi',
        rows: [
          { label: 'Harga obligasi lama', value: 0.45, text: '↓', color: MERAH },
          { label: 'Imbal hasil SBN baru', value: 0.45, to: 0.85, at: 'imbal', text: '↑', color: HIJAU },
        ],
      },
    },
    // ── SCENE 6 · SAHAM ─────────────────────────────────────────────────────────────────────────────
    {
      bab: { label: 'Saham', judul: 'Dana pindah ke aset aman', highlight: 'aset aman' },
      narasi: 'Pasar saham sering tertekan, karena investor punya alternatif yang lebih aman.',
      emphasis: ['tertekan', 'lebih aman'],
      kamera: [{ view: 'saham', duration: 1.4 }, { view: 'arusDana', at: 'alternatif', duration: 2 }],
      labelBersih: true,
      muncul: { 'ihsg-garis': 'tertekan', 'aliran-dana': 'investor' },
      gerak: Object.fromEntries(tinggiIhsg.map((_, i) => [`ihsg-${i}`, sahamTurun(i)]).filter(([, m]) => m.length)),
      label: [
        { target: 'ihsg-label', text: '📉 IHSG melemah', color: MERAH, at: 'tertekan' },
        { target: 'sbn-baru-pita', text: 'Obligasi / SBN', color: HIJAU, at: 'aman' },
      ],
      meter: {
        title: 'Ke mana dana investor?',
        tag: 'Arah umum',
        tone: 'ilustrasi',
        rows: [
          { label: 'Aset berisiko (saham)', value: 0.7, to: 0.4, at: 'tertekan', text: '↓', color: MERAH },
          { label: 'Aset aman (obligasi)', value: 0.4, to: 0.75, at: 'aman', text: '↑', color: HIJAU },
        ],
      },
    },
    {
      bab: { label: 'Saham · per sektor', judul: 'Bank relatif lebih tahan', highlight: 'lebih tahan' },
      narasi: 'Tapi sektor perbankan bisa lebih tahan dibanding properti atau saham growth.',
      emphasis: ['perbankan', 'lebih tahan'],
      kamera: { view: 'sektor', duration: 1.6 },
      meter: false,
      gerak: {
        'sektor-bank': [{ type: 'color', to: HIJAU, at: 'perbankan', duration: 0.6 }],
        'sektor-properti': [
          { type: 'move', to: [32, 1.5, -6], at: 'properti', duration: 1 },
          { type: 'color', to: MERAH, at: 'properti', duration: 0.6 },
        ],
        'sektor-growth': [
          { type: 'move', to: [38, -0.5, -6], at: 'growth', duration: 1 },
          { type: 'color', to: KUNING, at: 'growth', duration: 0.6 },
        ],
      },
      label: [
        { target: 'sektor-bank', text: '🏦 Bank: lebih kuat', color: HIJAU, at: 'perbankan' },
        { target: 'sektor-properti', text: '🏠 Properti: tertekan', color: MERAH, at: 'properti' },
        { target: 'sektor-growth', text: '💻 Growth/tech: sensitif', color: KUNING, at: 'growth' },
      ],
    },
    // ── SCENE 7 · PENUTUP ───────────────────────────────────────────────────────────────────────────
    {
      bab: { label: 'Jadi', judul: 'Bukan selalu kabar buruk', highlight: 'kabar buruk' },
      narasi: 'Jadi, kenaikan suku bunga bukan selalu kabar buruk.',
      emphasis: ['bukan selalu'],
      kamera: { view: 'jauh', duration: 2.4 },
      labelBersih: true,
      muncul: {
        'jalur-debitur': 'kenaikan',
        'jalur-debitur-arus': 'kenaikan',
        'jalur-bank': 'suku',
        'jalur-bank-arus': 'suku',
        'jalur-sbn': 'bunga',
        'jalur-sbn-arus': 'bunga',
        'jalur-saham': 'bukan',
        'jalur-saham-arus': 'bukan',
      },
      label: [
        { target: 'bi-atap', text: 'BI RATE', color: BIRU, at: 'Jadi', tetap: true },
        { target: 'zona-debitur', text: '🏠 Debitur', color: MERAH, at: 'kenaikan', tetap: true },
        { target: 'zona-bank', text: '🏦 Bank', color: BIRU, at: 'suku', tetap: true },
        { target: 'zona-sbn', text: '📄 SBN', color: HIJAU, at: 'bunga', tetap: true },
        { target: 'zona-saham', text: '📈 Saham', color: MERAH, at: 'bukan', tetap: true },
      ],
    },
    {
      narasi: 'Dampaknya berbeda untuk setiap pihak.',
      emphasis: ['berbeda'],
      kartu: [
        {
          gaya: 'putusan',
          text: 'Siapa untung, siapa rugi?',
          at: 'Dampaknya',
          points: [
            { text: 'Debitur: cicilan bisa naik', ok: false, at: 'Dampaknya' },
            { text: 'Bank: bunga naik, risiko juga', at: 'berbeda' },
            { text: 'SBN baru: imbal hasil naik', ok: true, at: 'setiap' },
            { text: 'Saham: cenderung tertekan', ok: false, at: 'pihak' },
          ],
        },
      ],
    },
    {
      narasi: 'Memahami hubungan ini bisa membantu kamu mengambil keputusan keuangan yang lebih bijak.',
      emphasis: ['lebih bijak'],
      kamera: { view: 'kota', duration: 3 },
      kartu: [{ gaya: 'putusan', text: 'Pahami arah bunga, atur keuanganmu.', sorot: ['arah bunga'], at: 'Memahami' }],
    },
  ],
});
