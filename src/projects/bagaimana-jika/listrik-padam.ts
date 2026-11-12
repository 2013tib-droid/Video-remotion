import type { Vec3, WorldMotion, WorldObject } from '../../scenes/types';
import { bedah3D } from '../../templates';
import { bagaimanaJika } from './series';

/**
 * Naskah & sumber: `naskah/bagaimana-jika/listrik-padam.md`. Dunia 3D dari bentuk dasar (tanpa model .glb → render cepat).
 * Tata letak: pembangkit & menara (kiri) → kota (tengah) → rel KRL & terowongan MRT (kanan) → rumah, ATM, SPBU (belakang).
 */
const NYALA = '#ffd23f';
const MATI = '#5b6475';

// Jendela menyala di gedung kota: id j0, j1, … (dimatikan bersamaan lewat `gelapkan`).
const jendela: WorldObject[] = [];
const gedung: { x: number; z: number; w: number; h: number; d: number; warna?: string }[] = [
  { x: -11, z: 2, w: 7, h: 13, d: 7 },
  { x: -11, z: 12, w: 6, h: 8, d: 6, warna: '#fde68a' },
  { x: 11, z: 4, w: 7, h: 16, d: 8, warna: '#bfdbfe' },
  { x: 11, z: -7, w: 6, h: 10, d: 6, warna: '#fecaca' },
];
gedung.forEach((g) => {
  const muka = g.x < 0 ? g.x + g.w / 2 + 0.06 : g.x - g.w / 2 - 0.06;
  for (let y = 2; y < g.h - 1; y += 2.6) {
    for (const dz of [-g.d / 4, g.d / 4]) {
      jendela.push({ id: `j${jendela.length}`, shape: 'box', size: [0.1, 1.2, 1.4], pos: [muka, y, g.z + dz], color: NYALA });
    }
  }
});
const gelapkan = (at: string): Record<string, WorldMotion[]> =>
  Object.fromEntries(jendela.map((j) => [j.id!, [{ type: 'color', to: MATI, at, duration: 0.4 }]]));

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
  {
    id: 'spbu',
    shape: 'group',
    pos: [-14, 0, -42],
    children: [
      { shape: 'box', size: [8, 0.4, 6], pos: [0, 5, 0], color: '#ef4444' },
      { shape: 'cylinder', radius: 0.2, height: 5, pos: [-3.5, 2.5, 0], color: '#e2e8f0' },
      { shape: 'cylinder', radius: 0.2, height: 5, pos: [3.5, 2.5, 0], color: '#e2e8f0' },
      { shape: 'box', size: [1, 2, 0.8], pos: [0, 1, 0], color: '#f8fafc' },
      { id: 'layar-spbu', shape: 'box', size: [0.7, 0.5, 0.05], pos: [0, 1.5, 0.42], color: '#4ade80' },
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

export default bedah3D(bagaimanaJika, {
  slug: 'ListrikPadam',
  topik: 'Listrik',
  catatan: 'Ilustrasi · bukan skala',
  dunia: {
    objects,
    ground: '#c7ecb6',
    sky: '#cfe9ff',
    views: {
      kota: { target: [0, 4, 0], distance: 80, azimuth: 30, elevation: 26 },
      pembangkit: { target: [-30, 8, -10], distance: 50, azimuth: 20, elevation: 14 },
      atas: { target: [-6, 2, 0], distance: 110, azimuth: 10, elevation: 55 },
      krl: { target: [22, 2, 0], distance: 34, azimuth: 60, elevation: 16 },
      mrt: { target: [32, 1.5, -2], distance: 32, azimuth: 40, elevation: 18 },
      lalin: { target: [-4.6, 4.6, 8], distance: 15, azimuth: 30, elevation: 6 },
      bts: { target: [16, 14, 16], distance: 28, azimuth: 30, elevation: 4 },
      rumah: { target: [0, 2, -38], distance: 30, azimuth: 20, elevation: 18 },
      toren: { target: [6, 3, -38.5], distance: 18, azimuth: 40, elevation: 12 },
      atm: { target: [-6, 1.4, -35], distance: 11, azimuth: 30, elevation: 12 },
      spbu: { target: [-14, 2, -42], distance: 24, azimuth: 20, elevation: 14 },
      kulkas: { target: [-2.8, 1.4, -35], distance: 9, azimuth: 15, elevation: 14 },
    },
  },
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
      kamera: 'pembangkit',
      label: [
        { target: 'pembangkit', text: 'Pembangkit', at: 'pembangkit' },
        { target: 'menara2', text: 'Saluran transmisi', at: 'mengalir', side: 'right' },
      ],
    },
    {
      bab: { label: 'Pernah terjadi', judul: 'Agustus 2019', highlight: '2019' },
      narasi: 'Lalu, empat Agustus dua ribu sembilan belas, aliran itu putus.',
      emphasis: ['putus'],
      kamera: { view: 'kota', at: 'putus', duration: 1.4 },
      gerak: gelapkan('putus'),
      hilang: { listrik: 'putus' },
      data: { text: '4 Agustus 2019 · 11.48 WIB', source: 'Tempo · 2019' },
      cap: { text: 'PADAM', at: 'putus' },
    },
    {
      narasi: 'Dua puluh satu koma sembilan juta pelanggan PLN gelap seketika.',
      emphasis: ['dua puluh satu koma sembilan juta'],
      kamera: 'atas',
      data: { value: 0, to: 21.9, decimals: 1, suffix: ' juta pelanggan', source: 'PLN di DPR · 2019', at: 'Dua', duration: 2.2 },
    },
    {
      bab: { label: 'Jam pertama', judul: 'kota berhenti', highlight: 'berhenti' },
      narasi: 'Empat kereta MRT tertahan di dalam terowongan.',
      emphasis: ['tertahan'],
      kamera: 'mrt',
      gerak: { mrt: [{ type: 'move', to: [32, 0.3, 4], at: 0, duration: 2.2 }] },
      label: [{ target: 'terowongan', text: '4 kereta MRT tertahan', at: 'tertahan' }],
      data: { text: '4 kereta MRT', source: 'CNN Indonesia · 2019' },
    },
    {
      narasi: 'Dua ratus empat puluh perjalanan KRL batal.',
      emphasis: ['batal'],
      kamera: 'krl',
      data: { value: 0, to: 240, suffix: ' perjalanan KRL batal', source: 'CNN Indonesia · 2019', at: 'Dua', duration: 1.8 },
      cap: { text: 'BATAL', target: 'krl', at: 'batal' },
    },
    {
      narasi: 'Lampu lalu lintas mati, dan sinyal ponsel ikut terganggu.',
      emphasis: ['mati', 'sinyal'],
      kamera: ['lalin', { view: 'bts', at: 'sinyal', duration: 1 }],
      gerak: {
        'lalin-hijau': [{ type: 'color', to: MATI, at: 'mati', duration: 0.3 }],
        sinyal0: [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
        sinyal1: [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
        sinyal2: [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
      },
      data: { text: 'Lalin diatur manual · sinyal terganggu', source: 'Tirto · 2019' },
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
        rows: [{ label: '2019', value: 0, to: 34, at: 'menyala', duration: 1.4, text: '±34 jam' }],
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
          { label: '2019', value: 34, text: '±34 jam' },
          { label: 'Skenario', value: 0, to: 72, showAt: 'tiga', at: 'tiga', duration: 1.4, text: '72 jam', color: 'danger' },
        ],
      },
      cap: { text: '72 JAM', at: 'penuh' },
    },
    {
      bab: { label: 'Skenario · hari 2', judul: 'keran kering', highlight: 'kering' },
      narasi: 'Hari kedua, pompa air berhenti. Keran kering.',
      emphasis: ['kering'],
      kamera: 'toren',
      meter: false,
      hilang: { air: 'berhenti' },
      label: [{ target: 'toren', text: 'Pompa butuh listrik', at: 'pompa' }],
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
      gerak: { 'layar-spbu': [{ type: 'color', to: '#1e293b', at: 'sulit', duration: 0.3 }] },
      label: [{ target: 'spbu', text: 'Pompa bensin pakai listrik', at: 'memompa' }],
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
