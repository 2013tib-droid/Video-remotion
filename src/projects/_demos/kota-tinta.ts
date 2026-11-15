import { defineVideo } from '../../core';
import type { Vec2, WorldObject, WorldView } from '../../scenes/types';
import { gedungKaca, gedungKantor, gedungPita, menaraBulat, podiumMenara, WARNA_KOTA } from '../../worlds';

/**
 * Demo GAYA TINTA (`style: 'ink'`) + gedung berkarakter dari kit `src/worlds/kota.ts` (referensi R3).
 * Kota rakitan tangan; untuk kota dari peta asli lihat `kotaDariPeta()`.
 */
const lingkar = (r: number, n = 40): Vec2[] => Array.from({ length: n + 1 }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]);

const objects: WorldObject[] = [
  // Jalan: poros utara–selatan, jalan melintang, bundaran.
  { shape: 'strip', path: [[0, -260], [0, -40]], width: 24, color: WARNA_KOTA.jalanUtama, centerLine: '#f4f1ea' },
  { shape: 'strip', path: [[0, 40], [0, 260]], width: 24, color: WARNA_KOTA.jalanUtama, centerLine: '#f4f1ea' },
  { shape: 'strip', path: [[-260, 0], [-40, 0]], width: 14, color: WARNA_KOTA.jalan },
  { shape: 'strip', path: [[40, 0], [120, 30], [260, 30]], width: 14, color: WARNA_KOTA.jalan },
  { shape: 'strip', path: lingkar(32), width: 16, closed: true, color: WARNA_KOTA.jalanUtama },
  { shape: 'prism', points: lingkar(24).slice(0, -1), height: 0.3, facade: 'polos', roof: false, color: WARNA_KOTA.taman },
  { shape: 'cylinder', radius: 6, height: 1, pos: [0, 0.5, 0], color: WARNA_KOTA.air },
  // Taman di sudut.
  { shape: 'prism', points: [[-150, 40], [-60, 40], [-60, 110], [-150, 110]], height: 0.15, facade: 'polos', roof: false, color: WARNA_KOTA.taman },

  // Gedung.
  gedungKaca([60, 0, -80], 34, 150, { id: 'menara-kaca' }),
  gedungKaca([105, 0, -150], 28, 115, { color: WARNA_KOTA.kacaMuda, bulat: true }),
  menaraBulat([-60, 0, -70], 16, 85, { id: 'menara-bulat' }),
  podiumMenara([-90, 0, -170], { lebar: 70, dalam: 50, tinggi: 18 }, { lebar: 28, tinggi: 95, kaca: true }),
  gedungPita([70, 0, 90], 40, 26, 60, { color: WARNA_KOTA.putih }),
  gedungPita([-70, 0, 170], 30, 30, 45, { color: WARNA_KOTA.pasir }),
  gedungKaca([130, 0, 170], 26, 80, { color: WARNA_KOTA.tosca }),
  gedungKantor([-100, 0, -15 - 40], 30, 20, 14),
  gedungKantor([150, 0, -40], 40, 24, 18, { color: WARNA_KOTA.putih }),
  gedungKantor([60, 0, 190], 30, 30, 12, { color: WARNA_KOTA.pasir }),
  gedungKantor([-140, 0, 200], 36, 22, 10),
  gedungKantor([170, 0, 90], 30, 40, 22),

  // Pohon di tepi jalan utama.
  ...[-230, -190, -150, -110, -70, 70, 110, 150, 190, 230].flatMap((z): WorldObject[] => [
    { shape: 'tree', pos: [-17, 0, z], scale: 1.8, color: WARNA_KOTA.pohon },
    { shape: 'tree', pos: [17, 0, z + 20], scale: 1.8, color: WARNA_KOTA.pohon },
  ]),
  ...[[-120, 70], [-95, 55], [-80, 95], [-130, 95], [-105, 80]].map(([x, z]): WorldObject => ({ shape: 'tree', pos: [x, 0, z], scale: 2.4, color: WARNA_KOTA.pohon })),

  // Mobil di jalan utama.
  { shape: 'car', pos: [-5, 0, 120], scale: 1, color: '#e35d4f' },
  { shape: 'car', pos: [5, 0, -120], rotate: [0, 180, 0], color: '#f2c14e' },
];

const views: Record<string, WorldView> = {
  kota: { target: [0, 20, 0], distance: 1500, azimuth: 35, elevation: 36, fov: 18 },
  dekat: { target: [-60, 45, -70], distance: 560, azimuth: 55, elevation: 30, fov: 20 },
};

export default defineVideo({
  id: 'Demo-KotaTinta',
  brand: { name: 'Motion Studio' },
  theme: 'ModernSaaS',
  sfx: true,
  scenes: [
    {
      type: 'world',
      duration: 4,
      style: 'ink',
      chapter: { label: 'Gaya tinta', title: 'kota bergaya komik', highlight: 'komik' },
      objects,
      views,
      shots: [{ view: 'kota' }, { view: 'dekat', at: 1.6, duration: 1.6 }],
      labels: [{ target: 'menara-kaca', text: 'Menara kaca', at: 0.8, color: '#fff3c4' }],
      ground: WARNA_KOTA.tanah,
      sky: WARNA_KOTA.latar,
      note: 'Ilustrasi · bukan skala',
    },
  ],
});
