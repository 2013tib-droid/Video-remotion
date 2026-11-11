import { defineVideo } from '../../core';
import type { WorldObject, WorldView } from '../../scenes/types';

/**
 * Demo scene `world` (dunia 3D): satu dunia bersambung lintas scene.
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
    children: [{ id: 'mesin', shape: 'group', pos: [0, 0.6, 1.2] }],
  },
  // Model yang sama, cat berbeda (cocokkan lewat nama material).
  {
    shape: 'model',
    src: 'models/car-concept.glb',
    size: 4.5,
    pos: [1.7, 0, -4.5],
    parts: [{ material: 'Paint 1*', color: '#e9e6df' }, { name: 'License Plate', hidden: true }],
  },
  {
    shape: 'model',
    src: 'models/car-concept.glb',
    size: 4.5,
    pos: [-1.7, 0, -5.5],
    parts: [{ material: 'Paint 1*', color: '#3d5a80' }, { name: 'License Plate', hidden: true }],
  },
];

/** Dunia yang sama, tetapi kap mobil utama terangkat pada detik 1,2. */
const withHood: WorldObject[] = objects.map((o) =>
  o.id === 'mobil' && o.shape === 'model'
    ? { ...o, parts: [...(o.parts ?? []), { name: 'BodyHood', motion: [{ type: 'move', to: [0, 0.55, 0], at: 1.2, duration: 1 }] }] }
    : o,
);

const views: Record<string, WorldView> = {
  jalan: { target: [0, 1.2, 1], distance: 30, azimuth: 205, elevation: 30 },
  mobil: { target: 'mobil', distance: 11, azimuth: 150, elevation: 20 },
  mesin: { target: 'mesin', distance: 5.2, azimuth: 52, elevation: 24 },
};

export default defineVideo({
  id: 'Demo-Dunia3D',
  brand: { name: 'Motion Studio' },
  theme: 'ModernSaaS',
  sfx: true,
  scenes: [
    {
      type: 'world',
      eyebrow: 'Demo scene world',
      title: 'Satu dunia, kamera yang terbang.',
      highlight: 'terbang',
      objects,
      views,
      shots: [{ view: 'jalan' }, { view: 'mobil', at: 3 }],
      labels: [{ target: 'mobil', text: 'Mobil kita', at: 4.4 }],
      duration: 6.5,
    },
    {
      type: 'world',
      transition: 'none',
      title: 'Tembus pandang ke dalam mesin.',
      highlight: 'Tembus pandang',
      views,
      shots: [{ view: 'mobil' }, { view: 'mesin', at: 0.6, duration: 1.6, xray: ['mobil'] }],
      // Bagian model bisa digerakkan per scene: kap terangkat saat kamera masuk.
      objects: withHood,
      labels: [
        { target: 'roda-gigi', text: 'Bagian berputar', at: 2.6 },
        { target: [-1.15, 0.45, 1.2], text: 'Aliran', at: 3.4, color: 'danger' },
      ],
      cards: [{ tag: 'Demo', text: 'Label menempel pada objek, ikut gerak kamera.', source: 'contoh · bukan data', at: 4.4 }],
      note: 'Ilustrasi · bukan skala',
      duration: 8,
    },
  ],
});
