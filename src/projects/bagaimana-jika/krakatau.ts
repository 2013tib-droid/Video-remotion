import type { Vec3, WorldMotion, WorldObject } from '../../scenes/types';
import { bedah3D } from '../../templates';
import { bagaimanaJika } from './series';

/**
 * Naskah & sumber: `naskah/bagaimana-jika/krakatau.md`. Dunia 3D dari bentuk dasar (tanpa model .glb → render cepat).
 * Tata letak: laut (lantai biru) · Krakatau di tengah · pesisir dengan rumah & bukit di kanan (+x).
 */
const COKLAT = '#8d6e63';

/** Cincin yang membesar dari pusat saat `at` (gelombang suara / tsunami). */
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

const rumah: WorldObject[] = [
  [34, 0, -14],
  [36, 0, -4],
  [33, 0, 6],
  [37, 0, 14],
  [41, 0, -9],
  [42, 0, 4],
].map(([x, y, z], i): WorldObject => ({ shape: 'house', pos: [x, y + 1, z], rotate: [0, -90, 0], scale: i % 2 ? 1.1 : 0.9 }));

const objects: WorldObject[] = [
  // Pesisir (kanan): pasir, daratan hijau, rumah, pohon, bukit, orang.
  { shape: 'box', size: [8, 1, 70], pos: [30, 0.3, 0], color: '#f4e1a6' },
  { shape: 'box', size: [40, 1.4, 70], pos: [54, 0.5, 0], color: '#a7d98b' },
  ...rumah,
  { shape: 'tree', pos: [38, 1, -20] },
  { shape: 'tree', pos: [39, 1, 20], scale: 1.2 },
  { shape: 'tree', pos: [44, 1, -1] },
  { id: 'bukit', shape: 'cone', radius: 10, height: 12, pos: [60, 6.8, 6], color: '#65a30d' },
  { id: 'puncak', shape: 'group', pos: [60, 12.8, 6] },
  { id: 'orang', shape: 'person', pos: [32, 0.8, 2], rotate: [0, 90, 0], scale: 1.3 },
  { id: 'pasir-surut', shape: 'box', size: [7, 0.6, 50], pos: [23, 0.1, 0], color: '#d6b878', hidden: true },
  ...[0, 1].map((i): WorldObject => cincin(`gemuruh${i}`, [12, 2, -6], 1.5 + i * 1.5, 0.12, '#f97316', 0.8)),

  // Krakatau 1883 (tengah) + letusan.
  {
    id: 'krakatau',
    shape: 'group',
    children: [
      { shape: 'cone', radius: 11, height: 9, pos: [0, 4.5, 0], color: COKLAT },
      { shape: 'cylinder', radius: 2.4, radiusTop: 2.8, height: 0.6, pos: [0, 8.6, 0], color: '#4e342e' },
      { shape: 'tree', pos: [6, 1.5, 5] },
      { shape: 'tree', pos: [-5, 2, 6], scale: 1.2 },
    ],
  },
  { id: 'kawah', shape: 'group', pos: [0, 9, 0] },
  { id: 'lava', shape: 'flow', path: [[0, 9, 0], [0.6, 15, 0.3], [-0.4, 22, 0]], count: 18, size: 0.7, speed: 0.9, color: '#f97316', hidden: true },
  { id: 'abu', shape: 'sphere', radius: 6, pos: [0, 28, 0], color: '#9ca3af', opacity: 0.75, hidden: true },
  ...[0, 1, 2].map((i): WorldObject => cincin(`suara${i}`, [0, 10, 0], 3, 0.18, '#fbbf24', 0.8 - i * 0.2)),
  cincin('tsunami', [0, 0.4, 0], 12, 0.9, '#e0f2fe'),

  // Anak Krakatau (muncul setelah Krakatau lama hancur) + lereng yang longsor.
  {
    id: 'anak',
    shape: 'group',
    hidden: true,
    children: [
      { shape: 'cone', radius: 5, height: 4.5, pos: [0, 2.25, 0], color: '#6d4c41' },
      { shape: 'cylinder', radius: 0.8, radiusTop: 1, height: 0.3, pos: [0, 4.4, 0], color: '#3e2723' },
      { id: 'lereng', shape: 'box', size: [2.6, 1, 2.4], pos: [3.2, 1.4, 0], rotate: [0, 0, -42], color: '#6d4c41' },
    ],
  },
  cincin('tsunami2018', [3, 0.4, 0], 6, 0.6, '#e0f2fe'),
];

export default bedah3D(bagaimanaJika, {
  slug: 'Krakatau',
  topik: 'Gunung Api',
  catatan: 'Ilustrasi · bukan skala',
  dunia: {
    objects,
    ground: '#5ec4ef',
    sky: '#d6efff',
    views: {
      lebar: { target: [14, 4, 0], distance: 170, azimuth: 160, elevation: 22, fov: 40 },
      gunung: { target: [0, 6, 0], distance: 80, azimuth: 150, elevation: 14 },
      atas: { target: [12, 0, 0], distance: 210, azimuth: 180, elevation: 70, fov: 40 },
      rendah: { target: [10, 2, 0], distance: 120, azimuth: 205, elevation: 8 },
      pesisir: { target: [34, 2, 0], distance: 75, azimuth: 240, elevation: 14 },
      anak: { target: [1, 2, 0], distance: 45, azimuth: 160, elevation: 16 },
      pantai: { target: [28, 1.5, 2], distance: 42, azimuth: 235, elevation: 12 },
      bukit: { target: [50, 6, 4], distance: 75, azimuth: 215, elevation: 16 },
    },
  },
  adegan: [
    {
      bab: { label: 'Bagaimana jika…', judul: 'Krakatau meletus lagi?', highlight: 'meletus' },
      narasi: 'Bagaimana jika Krakatau meletus seperti tahun delapan belas delapan puluh tiga?',
      emphasis: ['meletus'],
      kamera: 'lebar',
    },
    {
      bab: { label: '27 Agustus 1883', judul: 'Ledakan terkeras', highlight: 'terkeras' },
      narasi: 'Tanggal dua puluh tujuh Agustus, gunung ini meledak.',
      emphasis: ['meledak'],
      kamera: 'gunung',
      muncul: { lava: 'meledak', abu: 'meledak' },
      gerak: { abu: [{ type: 'scale', to: 1.5, at: 'meledak', duration: 2.5 }] },
      cap: { text: 'DUAR!', target: 'kawah', at: 'meledak' },
    },
    {
      narasi: 'Suaranya terdengar sampai Australia, empat ribu delapan ratus kilometer jauhnya.',
      emphasis: ['empat ribu delapan ratus kilometer'],
      kamera: { view: 'atas', at: 'terdengar', duration: 1.5 },
      muncul: { suara0: 'terdengar', suara1: 'terdengar', suara2: 'terdengar' },
      gerak: { suara0: membesar(30, 'terdengar', 2.4), suara1: membesar(22, 'terdengar', 3.2), suara2: membesar(14, 'terdengar', 4) },
      data: { value: 0, to: 4800, prefix: '±', suffix: ' km terdengar', source: 'Catatan sejarah · GNFI', at: 'Australia', duration: 2 },
    },
    {
      bab: { label: 'Lalu…', judul: 'laut bangkit', highlight: 'bangkit' },
      narasi: 'Lalu laut bangkit jadi tsunami setinggi tiga puluh sampai empat puluh meter.',
      emphasis: ['tsunami'],
      kamera: 'rendah',
      hilang: { suara0: 0, suara1: 0, suara2: 0 },
      muncul: { tsunami: 'tsunami' },
      gerak: { tsunami: membesar(1.8, 'tsunami', 2.5) },
      data: { text: 'Gelombang 30–40 m', source: 'Estimasi beragam', tone: 'data' },
    },
    {
      narasi: 'Gelombangnya menghantam pesisir Banten dan Lampung.',
      emphasis: ['menghantam'],
      kamera: 'pesisir',
      gerak: { tsunami: membesar(2.6, 'menghantam', 1.6) },
      label: [{ target: [33, 2, 6], text: 'Pesisir Banten & Lampung', at: 'pesisir' }],
      cap: { text: 'TSUNAMI', at: 'menghantam' },
    },
    {
      bab: { label: 'Korban', judul: '36.417 jiwa', highlight: '36.417' },
      narasi: 'Tiga puluh enam ribu lebih orang meninggal.',
      emphasis: ['Tiga puluh enam ribu'],
      kamera: 'lebar',
      data: { value: 0, to: 36417, suffix: ' jiwa', source: 'Catatan Hindia Belanda', at: 'Tiga', duration: 2 },
    },
    {
      narasi: 'Sembilan puluh persen di antaranya karena tsunami, bukan ledakan.',
      emphasis: ['tsunami'],
      data: false,
      meter: {
        title: 'Penyebab kematian',
        tag: 'Detik',
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
      hilang: { krakatau: 'hancur', lava: 'hancur', abu: 'hancur', tsunami: 0 },
    },
    {
      narasi: 'Yang tumbuh di sana sekarang adalah anaknya, Anak Krakatau.',
      emphasis: ['Anak Krakatau'],
      kamera: { view: 'anak', at: 'tumbuh', duration: 1.4 },
      muncul: { anak: 'tumbuh' },
      label: [{ target: 'anak', text: 'Anak Krakatau', at: 'anaknya', tetap: true }],
    },
    {
      bab: { label: '22 Desember 2018', judul: 'bahaya yang nyata', highlight: 'nyata' },
      narasi: 'Desember dua ribu delapan belas, lerengnya longsor ke laut.',
      emphasis: ['longsor'],
      gerak: {
        lereng: [
          { type: 'move', to: [7, -0.6, 0], at: 'longsor', duration: 1.4 },
          { type: 'turn', to: [0, 0, -70], at: 'longsor', duration: 1.4 },
        ],
      },
      label: [{ target: 'lereng', text: 'Lereng longsor', at: 'longsor', color: 'danger' }],
      data: { text: '± 21.27 WIB · malam hari', source: 'BNPB · 2018' },
    },
    {
      narasi: 'Tsunami datang malam hari, tanpa gempa, tanpa peringatan.',
      emphasis: ['tanpa gempa'],
      kamera: 'rendah',
      labelBersih: true,
      muncul: { tsunami2018: 'Tsunami' },
      gerak: { tsunami2018: membesar(4.5, 'Tsunami', 3.5) },
      cap: { text: 'TANPA GEMPA', at: 'gempa' },
    },
    {
      narasi: 'Empat ratus tiga puluh tujuh orang meninggal.',
      emphasis: ['Empat ratus tiga puluh tujuh'],
      kamera: 'pesisir',
      data: { value: 0, to: 437, suffix: ' jiwa', source: 'BNPB · per 31 Des 2018', at: 'Empat', duration: 1.8 },
    },
    {
      bab: { label: 'Di pantai?', judul: 'ingat tandanya', highlight: 'tandanya' },
      narasi: 'Kalau air laut tiba-tiba surut, jangan didekati.',
      emphasis: ['surut'],
      kamera: 'pantai',
      data: false,
      hilang: { tsunami2018: 0 },
      muncul: { 'pasir-surut': 'surut' },
      label: [{ target: 'pasir-surut', text: 'Air surut = tanda bahaya', at: 'surut', color: 'danger' }],
    },
    {
      narasi: 'Dengar gemuruh dari laut? Jangan tunggu sirene.',
      emphasis: ['Jangan tunggu sirene'],
      muncul: { gemuruh0: 'gemuruh', gemuruh1: 'gemuruh' },
      gerak: { gemuruh0: membesar(1.8, 'gemuruh', 1.5), gemuruh1: membesar(1.5, 'gemuruh', 2) },
      cap: { text: 'JANGAN TUNGGU', at: 'sirene' },
    },
    {
      narasi: 'Langsung lari ke tempat tinggi.',
      emphasis: ['tempat tinggi'],
      kamera: 'bukit',
      gerak: {
        orang: [
          { type: 'move', to: [44, 0.8, 4], at: 'lari', duration: 1.2 },
          { type: 'move', to: [58, 10, 6], at: 'tinggi', duration: 1.4 },
        ],
      },
      label: [{ target: 'puncak', text: 'Tempat tinggi', at: 'tinggi', color: 'success' }],
    },
    {
      bab: { label: 'Jadi', judul: 'tak perlu letusan besar', highlight: 'letusan besar' },
      narasi: 'Krakatau tidak perlu meletus sebesar dulu untuk berbahaya.',
      emphasis: ['berbahaya'],
      kamera: 'lebar',
      cap: { text: 'WASPADA', target: 'anak', at: 'berbahaya' },
    },
  ],
  lexicon: { BNPB: 'Be En Pe Be' },
});
