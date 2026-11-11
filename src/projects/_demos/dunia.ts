import { defineVideo } from '../../core';
import type { WorldObject, WorldView } from '../../scenes/types';

/**
 * Demo scene `world` (dunia 3D) bernarasi: satu dunia bersambung lintas scene, gerak dipicu kata narasi.
 * `objects` + `views` disimpan sekali, tiap scene hanya mengatur kamera, label dan kartu.
 */
const objects: WorldObject[] = [
  { shape: 'road', length: 90, lanes: 3 },
  { shape: 'trafficLight', pos: [-6.2, 0, 9], light: 'red' },
  { shape: 'building', size: [14, 16, 12], pos: [-17, 0, -8] },
  { shape: 'building', size: [10, 9, 10], pos: [-15, 0, 12], color: 'surface' },
  { shape: 'tree', pos: [7.2, 0, 6] },
  { shape: 'tree', pos: [7.4, 0, -6], scale: 0.85 },
  { shape: 'person', pos: [7, 0, 1], rotate: [0, -90, 0] },
  {
    // Model .glb nyata; nama bagian dari `npm run model -- public/models/car-concept.glb`.
    id: 'mobil',
    shape: 'model',
    src: 'models/car-concept.glb',
    size: 4.5,
    pos: [-1.7, 0, 2],
    parts: [
      { name: 'Engine', solid: true },
      { name: 'Wheel*', solid: true },
      { name: 'License Plate', hidden: true },
    ],
    // Jangkar label/kamera di dalam mobil (posisi dalam meter, relatif mobil).
    children: [
      { id: 'mesin', shape: 'group', pos: [0, 0.6, 1.2] },
      { id: 'roda-depan', shape: 'group', pos: [0.95, 0.36, 1.42] },
      { id: 'kabin', shape: 'group', pos: [0, 1.0, -0.3] },
    ],
  },
  // Latar: mobil sederhana (satu model detail saja agar render tetap cepat).
  { shape: 'car', variant: 'sedan', pos: [1.7, 0, -4.5], color: '#e9e6df', brake: true },
  { shape: 'car', pos: [-1.7, 0, -5.5], color: '#3d5a80', brake: true },
];

/** Dunia yang sama, tetapi kap mobil utama terangkat saat `at`. */
const withHood = (at: string | number): WorldObject[] =>
  objects.map((o) =>
    o.id === 'mobil' && o.shape === 'model'
      ? { ...o, parts: [...(o.parts ?? []), { name: 'BodyHood', motion: [{ type: 'move', to: [0, 0.55, 0], at, duration: 1 }] }] }
      : o,
  );

const views: Record<string, WorldView> = {
  jalan: { target: [0, 1.2, 1], distance: 30, azimuth: 205, elevation: 30 },
  mobil: { target: 'mobil', distance: 11, azimuth: 150, elevation: 20 },
  mesin: { target: 'mesin', distance: 5.2, azimuth: 52, elevation: 24 },
  samping: { target: 'kabin', distance: 9, azimuth: 80, elevation: 14 },
};

export default defineVideo({
  id: 'Demo-Dunia3D',
  brand: { name: 'Motion Studio' },
  theme: 'ModernSaaS',
  sfx: true,
  voice: { name: 'id-ID-Ardi:DragonHDLatestNeural', rate: '+10%' },
  overlay: {},
  scenes: [
    {
      type: 'world',
      chapter: { label: 'Demo scene world', title: 'satu dunia tiga dimensi', highlight: 'tiga dimensi' },
      narration: 'Ini bukan slide. Ini satu dunia tiga dimensi, dan kameranya bisa terbang ke mana saja.',
      emphasis: ['tiga dimensi', 'terbang'],
      objects,
      views,
      shots: [{ view: 'jalan' }, { view: 'mobil', at: 'terbang' }],
    },
    {
      type: 'world',
      transition: 'none',
      chapter: { label: 'Tembus pandang', title: 'lihat isi di dalamnya', highlight: 'di dalamnya' },
      narration: 'Kita dekati mobilnya. Bodinya dibuat tembus pandang, supaya mesin di dalamnya terlihat.',
      emphasis: ['tembus pandang', 'mesin'],
      // Bagian model bisa digerakkan per scene: kap terangkat saat kata "tembus".
      objects: withHood('tembus'),
      views,
      shots: [{ view: 'mobil' }, { view: 'mesin', at: 'tembus', duration: 1.6, xray: ['mobil'] }],
      labels: [{ target: 'mesin', text: 'Mesin', at: 'mesin' }],
      note: 'Ilustrasi · bukan skala',
    },
    {
      type: 'world',
      transition: 'none',
      chapter: { label: 'Label', title: 'muncul tepat saat disebut', highlight: 'tepat saat disebut' },
      narration: 'Setiap bagian bisa diberi label, tepat saat disebut: mesin, roda depan, sampai kabin.',
      emphasis: ['label', 'roda depan', 'kabin'],
      objects: withHood(0),
      views,
      shots: [
        { view: 'mesin', xray: ['mobil'] },
        { view: 'samping', at: 'sampai', duration: 1.4, xray: ['mobil'] },
      ],
      labels: [
        { target: 'mesin', text: 'Mesin', at: 'mesin', color: 'primary' },
        { target: 'roda-depan', text: 'Roda depan', at: 'roda' },
        { target: 'kabin', text: 'Kabin', at: 'kabin', color: 'danger' },
      ],
      cards: [{ tag: 'Demo', text: 'Label menempel pada objek dan ikut gerak kamera.', source: 'contoh · bukan data', at: 'label' }],
      note: 'Ilustrasi · bukan skala',
    },
  ],
});
