import type { Vec3, WorldObject } from '../../scenes/types';
import { bedah3D } from '../../templates';
import {
  WARNA,
  atm,
  gedungBerjendela,
  irisanJaringanListrik,
  irisanPompaAir,
  irisanTerowongan,
  kereta,
  kulkas,
  lampuLalin,
  menaraBts,
  menaraListrik,
  pembangkit,
  rel,
  spbu,
  toren,
} from '../../worlds';
import { bagaimanaJika } from './series';

/**
 * Naskah & sumber: `naskah/bagaimana-jika/listrik-padam.md`. Gaya `docs/REFERENSI.md` R2: dunia 3D isometrik berlatar krem
 * + irisan teknis 2D (jaringan listrik, terowongan MRT, pompa air rumah). Semua dari bentuk dasar → render cepat.
 * Tata letak: pembangkit & menara (kiri) → kota (tengah) → rel KRL & terowongan MRT (kanan) → rumah, ATM, SPBU (belakang).
 */
// Benda & irisan dari pustaka `src/worlds/` (katalog: docs/PUSTAKA-VISUAL.md).
const MATI = WARNA.mati;
const kota = gedungBerjendela([
  { x: -11, z: 2, w: 7, h: 13, d: 7, warna: '#f1ede5' },
  { x: -11, z: 12, w: 6, h: 8, d: 6, warna: '#e9dcc3' },
  { x: 11, z: 4, w: 7, h: 16, d: 8, warna: '#dfe3e6' },
  { x: 11, z: -7, w: 6, h: 10, d: 6, warna: '#e8d3c7' },
]);
const kabel: Vec3[] = [[-38, 12.4, -10], [-26, 11.6, -10], [-14, 12.4, -10], [-11, 13.2, -2]];

const objects: WorldObject[] = [
  // Pembangkit (kiri) + menara transmisi + kabel dengan aliran listrik.
  ...pembangkit('pembangkit', -44, -10),
  menaraListrik('menara1', -26, -10),
  menaraListrik('menara2', -14, -10),
  { shape: 'tube', path: kabel, radius: 0.06, color: '#334155' },
  { id: 'listrik', shape: 'flow', path: kabel, count: 14, size: 0.32, speed: 0.35, color: WARNA.nyala },

  // Kota: jalan, gedung berjendela, lampu lalu lintas (bisa mati), mobil, pohon, menara BTS.
  { shape: 'road', length: 70, lanes: 2 },
  ...kota.objects,
  lampuLalin('lalin', [-4.6, 0, 8]),
  { shape: 'car', variant: 'sedan', pos: [-1.8, 0, 4], color: '#ef4444' },
  { shape: 'car', pos: [1.8, 0, -3], rotate: [0, 180, 0], color: '#0ea5e9' },
  { shape: 'car', pos: [-1.8, 0, -6], color: '#f59e0b' },
  { shape: 'tree', pos: [-6.5, 0, -4] },
  { shape: 'tree', pos: [6.5, 0, 14] },
  { shape: 'tree', pos: [-6.5, 0, 20], scale: 0.9 },
  { id: 'orang', shape: 'person', pos: [-5.2, 0, 10], rotate: [0, 90, 0] },
  menaraBts('bts', [16, 0, 16]),

  // Transportasi (kanan): rel KRL di atas tanah + terowongan MRT.
  ...rel(22),
  kereta('krl', [22, 0.3, 6], '#f8fafc', '#dc2626'),
  ...rel(32),
  { id: 'terowongan', shape: 'cylinder', radius: 3, height: 26, axis: 'z', pos: [32, 0.6, -6], color: '#94a3b8', opacity: 0.35 },
  kereta('mrt', [32, 0.3, 26], '#e2e8f0', '#1d4ed8'),

  // Rumah (belakang kota): toren + pipa air, ATM, SPBU, kulkas.
  { id: 'rumah', shape: 'house', pos: [0, 0, -40] },
  toren('toren', [9, 0, -40]),
  { shape: 'tube', path: [[9, 4.2, -40], [9, 4.4, -37], [3, 2.2, -37]], radius: 0.1, color: '#64748b' },
  { id: 'air', shape: 'flow', path: [[9, 4.2, -40], [9, 4.4, -37], [3, 2.2, -37]], count: 10, size: 0.18, speed: 0.6, color: '#38bdf8' },
  atm('atm', [-7, 0, -36], [0, 30, 0]),
  { id: 'tunai', shape: 'coins', count: 12, pos: [-5.2, 0, -34], hidden: true },
  spbu('spbu', [-15, 0, -42]),
  kulkas('kulkas', [-2.8, 0, -35]),
  { shape: 'tree', pos: [10, 0, -44] },
  { shape: 'tree', pos: [-10, 0, -48], scale: 1.2 },
];

export default bedah3D(bagaimanaJika, {
  slug: 'ListrikPadam',
  topik: 'Listrik',
  catatan: 'Ilustrasi · bukan skala',
  dunia: {
    objects,
    ground: WARNA.tanahKrem,
    sky: WARNA.langitKrem,
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
  irisan: { jaringan: irisanJaringanListrik(), terowongan: irisanTerowongan(), pompa: irisanPompaAir() },
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
      ubah: Object.fromEntries(kota.jendela.map((id) => [id, { color: MATI }])),
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
        'bts-sinyal0': [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
        'bts-sinyal1': [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
        'bts-sinyal2': [{ type: 'fade', to: 0.1, at: 'terganggu', duration: 0.5 }],
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
      gerak: { 'atm-layar': [{ type: 'color', to: '#1e293b', at: 'mati', duration: 0.3 }] },
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
        'spbu-layar1': [{ type: 'color', to: '#1e293b', at: 'sulit', duration: 0.3 }],
        'spbu-layar2': [{ type: 'color', to: '#1e293b', at: 'sulit', duration: 0.3 }],
      },
      label: [{ target: 'spbu-nozzle', text: 'Pompa bensin pakai listrik', at: 'memompa' }],
      catatan: 'Skenario · bukan data',
    },
    {
      narasi: 'Dan isi kulkas mulai basi.',
      emphasis: ['basi'],
      kamera: 'kulkas',
      muncul: { 'kulkas-isi': 0.2 },
      gerak: { 'kulkas-isi': [{ type: 'color', to: '#a16207', at: 'basi', duration: 1 }] },
      label: [{ target: 'kulkas-isi', text: 'Basi', at: 'basi', color: 'danger' }],
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
