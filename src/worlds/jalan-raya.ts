import type { Vec3, WorldColor, WorldObject } from '../scenes/types';
import type { Dunia } from '../templates/Bedah3D';

export interface JalanRayaOptions {
  /** Mobil utama: `'model'` (default, `models/car-concept.glb` — nyata tetapi render lambat) atau `'sederhana'` (kotak, cepat). */
  mobil?: 'model' | 'sederhana';
  /** Warna cat mobil utama. */
  warna?: WorldColor;
  /** Jumlah mobil lain yang antre (0–4). Default 2. */
  antrean?: number;
  /** Lampu awal. Default `red`. */
  lampu?: 'red' | 'yellow' | 'green';
  /** Gedung & pohon di tepi jalan. Default true. */
  kota?: boolean;
  /** Objek tambahan di dunia (koordinat dunia). */
  tambahan?: WorldObject[];
  /** Objek tambahan DI DALAM mobil utama (koordinat relatif mobil, depan = +z) — mis. mesin rakitan sendiri. */
  isiMobil?: WorldObject[];
}

const QUEUE: { pos: Vec3; color: string; variant?: 'sedan' }[] = [
  { pos: [1.7, 0, -4.5], color: '#e9e6df', variant: 'sedan' },
  { pos: [-1.7, 0, -5.5], color: '#3d5a80' },
  { pos: [1.7, 0, -11], color: '#6f7783' },
  { pos: [-1.7, 0, -12], color: '#c9b79c', variant: 'sedan' },
];

/**
 * KIT DUNIA: jalan raya tiga lajur dengan lampu lalu lintas, antrean mobil, gedung dan pohon.
 *
 * id objek: `mobil` (utama, depan = +z), `lampu`, `orang`; jangkar di dalam mobil: `mesin`, `roda-depan`, `kabin`, `bagasi`.
 * view: `jalan` (lebar dari atas) · `lampu` · `mobil` (belakang-kanan) · `depan` · `samping` · `mesin` (dekat kap) · `kabin` · `atas`.
 * Bagian model mobil (untuk `bagian`): lihat `npm run model -- public/models/car-concept.glb`
 * (`BodyHood`, `Engine`, `Wheel*`, `BodyDoorL*`, material `Paint 1*`, …).
 */
export function jalanRaya(o: JalanRayaOptions = {}): Dunia {
  const anchors: WorldObject[] = [
    { id: 'mesin', shape: 'group', pos: [0, 0.6, 1.2] },
    { id: 'roda-depan', shape: 'group', pos: [0.95, 0.36, 1.42] },
    { id: 'kabin', shape: 'group', pos: [0, 1.0, -0.3] },
    { id: 'bagasi', shape: 'group', pos: [0, 0.8, -1.7] },
    ...(o.isiMobil ?? []),
  ];
  const mobil: WorldObject =
    (o.mobil ?? 'model') === 'model'
      ? {
          id: 'mobil',
          shape: 'model',
          src: 'models/car-concept.glb',
          size: 4.5,
          pos: [-1.7, 0, 2],
          parts: [
            { name: 'Engine', solid: true },
            { name: 'Wheel*', solid: true },
            { name: 'License Plate', hidden: true },
            ...(o.warna ? [{ material: 'Paint 1*', color: o.warna }] : []),
          ],
          children: anchors,
        }
      : { id: 'mobil', shape: 'car', pos: [-1.7, 0, 2], color: o.warna ?? 'danger', brake: true, children: anchors };
  const kota: WorldObject[] =
    o.kota === false
      ? []
      : [
          { shape: 'building', size: [14, 16, 12], pos: [-17, 0, -8] },
          { shape: 'building', size: [10, 9, 10], pos: [-15, 0, 12], color: 'surface' },
          { shape: 'building', size: [12, 12, 14], pos: [17, 0, -14] },
          { shape: 'tree', pos: [7.2, 0, 6] },
          { shape: 'tree', pos: [7.4, 0, -6], scale: 0.85 },
          { shape: 'tree', pos: [-7.3, 0, -14], scale: 1.1 },
          { id: 'orang', shape: 'person', pos: [7, 0, 1], rotate: [0, -90, 0] },
        ];
  return {
    objects: [
      { shape: 'road', length: 90, lanes: 3 },
      { id: 'lampu', shape: 'trafficLight', pos: [-6.2, 0, 9], light: o.lampu ?? 'red' },
      ...kota,
      mobil,
      ...QUEUE.slice(0, Math.min(4, Math.max(0, o.antrean ?? 2))).map(
        (q): WorldObject => ({ shape: 'car', variant: q.variant, pos: q.pos, color: q.color, brake: true }),
      ),
      ...(o.tambahan ?? []),
    ],
    views: {
      jalan: { target: [0, 1.2, 1], distance: 30, azimuth: 205, elevation: 30 },
      lampu: { target: [-6.2, 4.4, 9], distance: 9, azimuth: 20, elevation: 8 },
      mobil: { target: 'mobil', distance: 11, azimuth: 150, elevation: 20 },
      depan: { target: 'mobil', distance: 9, azimuth: 25, elevation: 14 },
      samping: { target: 'kabin', distance: 12, azimuth: 80, elevation: 14 },
      mesin: { target: 'mesin', distance: 5.2, azimuth: 52, elevation: 24 },
      kabin: { target: 'kabin', distance: 4.6, azimuth: 115, elevation: 26 },
      atas: { target: 'mobil', distance: 14, azimuth: 180, elevation: 72 },
    },
  };
}
