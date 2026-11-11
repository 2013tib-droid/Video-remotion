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
    id: 'mobil',
    shape: 'car',
    pos: [-1.7, 0, 2],
    brake: true,
    children: [
      {
        id: 'mesin',
        shape: 'box',
        size: [0.8, 0.42, 0.62],
        pos: [0, 0.68, 1.5],
        color: 'muted',
        children: [
          { id: 'roda-gigi', shape: 'gear', radius: 0.2, axis: 'z', pos: [0, 0, 0.36], color: 'accent', motion: [{ type: 'spin', speed: 0.8 }] },
          { shape: 'gear', radius: 0.13, teeth: 9, axis: 'z', pos: [0.31, 0.08, 0.36], color: 'primary', motion: [{ type: 'spin', speed: -1.24 }] },
        ],
      },
      {
        shape: 'flow',
        path: [[0.3, 0.55, 1.3], [0.55, 0.45, 0.4], [0.55, 0.42, -1.2]],
        count: 7,
        size: 0.04,
        speed: 0.45,
      },
    ],
  },
  { shape: 'car', variant: 'sedan', pos: [1.7, 0, -4.5], color: '#e9e6df', brake: true },
  { shape: 'car', pos: [-1.7, 0, -5.5], color: '#6f7783', brake: true },
];

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
      objects,
      views,
      shots: [{ view: 'mobil' }, { view: 'mesin', at: 0.6, duration: 1.6, xray: ['mobil'] }],
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
