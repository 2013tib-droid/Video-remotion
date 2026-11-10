import { defineVideo } from '../../core';
import { bps } from './brand';
import narration from './ekonomi-q3-2026.narration.json';

/**
 * Pertumbuhan ekonomi Indonesia Q1–Q3 2026 menurut komponen pengeluaran, 9:16, ±90 dtk, narasi Ardi HD.
 * Ubah teks `narration` → jalankan `npm run narasi -- src/projects/bps/ekonomi-q3-2026.ts`.
 */
export default defineVideo({
  id: 'BPS-EkonomiQ32026',
  brand: bps,
  theme: 'Corporate',
  format: 'vertical',
  duration: 90,
  voice: {
    name: 'id-ID-Ardi:DragonHDLatestNeural',
    rate: '+10%',
    lexicon: { PDB: 'Pe De Be', PMTB: 'Pe Em Te Be', BPS: 'Be Pe Es' },
  },
  narration,
  overlay: { hud: { label: 'PDB Q3 2026' } },
  scenes: [
    {
      type: 'hero',
      title: 'Pertumbuhan Ekonomi Indonesia',
      subtitle: 'Q1 – Q3 2026 Komponen PDB menurut Pengeluaran',
      duration: 5,
      narration: 'Bagaimana kondisi ekonomi Indonesia sepanjang 2026? Yuk, kita bedah komponen PDB menurut pengeluaran, dari kuartal pertama sampai kuartal ketiga.',
      transition: 'fade',
      background: 'gradient',
    },
    {
      type: 'stats',
      eyebrow: 'Tren Pertumbuhan PDB yoy',
      stats: [
        { label: 'Q1 2026', value: 5.61, suffix: '%', decimals: 2 },
        { label: 'Q2 2026', value: 5.29, suffix: '%', decimals: 2 },
        { label: 'Q3 2026', value: 5.47, suffix: '%', decimals: 2 },
      ],
      duration: 7,
      narration: 'Ekonomi tumbuh 5,61 persen di kuartal pertama, melambat ke 5,29 persen di kuartal kedua, lalu naik lagi ke 5,47 persen di kuartal ketiga.',
      transition: 'slideUp',
      background: 'pattern',
    },
    {
      type: 'features',
      title: 'Konsumsi Rumah Tangga',
      subtitle: 'Pertumbuhan yoy',
      features: [
        { icon: '🛒', title: 'Q1 2026', description: '5.52%' },
        { icon: '🛒', title: 'Q2 2026', description: '5.06%' },
        { icon: '🛒', title: 'Q3 2026', description: '5.04%' },
      ],
      duration: 10,
      narration: 'Konsumsi rumah tangga tumbuh 5,52 persen di kuartal pertama, lalu 5,06 persen di kuartal kedua, dan 5,04 persen di kuartal ketiga.',
      transition: 'slideLeft',
      background: 'solid',
    },
    {
      type: 'stats',
      eyebrow: 'Peran Konsumsi RT Q3',
      stats: [
        { label: 'Pangsa PDB', value: 51.97, suffix: '%', decimals: 2 },
        { label: 'Sumber Pertumbuhan', value: 2.62, suffix: ' pp', decimals: 2 },
      ],
      duration: 8,
      narration: 'Meski melambat, konsumsi rumah tangga tetap jadi penopang utama. Pangsanya 51,97 persen dari PDB, dengan sumbangan pertumbuhan 2,62 poin persen.',
      transition: 'zoom',
      background: 'gradient',
    },
    {
      type: 'features',
      title: 'Konsumsi Pemerintah',
      subtitle: 'Pertumbuhan yoy',
      features: [
        { icon: '🏛️', title: 'Q1 2026', description: '21.81%' },
        { icon: '🏛️', title: 'Q2 2026', description: '15.97%' },
        { icon: '🏛️', title: 'Q3 2026', description: '8.95%' },
      ],
      duration: 10,
      narration: 'Konsumsi pemerintah tumbuh 21,81 persen di kuartal pertama, lalu 15,97 persen di kuartal kedua, dan 8,95 persen di kuartal ketiga.',
      transition: 'slideLeft',
      background: 'solid',
    },
    {
      type: 'stats',
      eyebrow: 'Dampak Konsumsi Pemerintah Q3',
      stats: [{ label: 'Sumber Pertumbuhan', value: 0.62, suffix: ' pp', decimals: 2 }],
      duration: 7,
      narration: 'Di kuartal ketiga, konsumsi pemerintah menyumbang 0,62 poin persen terhadap pertumbuhan ekonomi.',
      transition: 'fade',
      background: 'pattern',
    },
    {
      type: 'features',
      title: 'PMTB (Investasi)',
      subtitle: 'Pertumbuhan yoy',
      features: [
        { icon: '🏗️', title: 'Q1 2026', description: '5.96%' },
        { icon: '🏗️', title: 'Q2 2026', description: '6.87%' },
        { icon: '🏗️', title: 'Q3 2026', description: '6.06%' },
      ],
      duration: 10,
      narration: 'Investasi atau PMTB tumbuh 5,96 persen di kuartal pertama, naik ke 6,87 persen di kuartal kedua, lalu 6,06 persen di kuartal ketiga.',
      transition: 'slideLeft',
      background: 'solid',
    },
    {
      type: 'stats',
      eyebrow: 'Peran PMTB / Investasi Q3',
      stats: [
        { label: 'Pangsa PDB', value: 30.81, suffix: '%', decimals: 2 },
        { label: 'Sumber Pertumbuhan', value: 1.91, suffix: ' pp', decimals: 2 },
      ],
      duration: 8,
      narration: 'PMTB menyumbang 30,81 persen dari PDB, dengan sumbangan pertumbuhan 1,91 poin persen di kuartal ketiga.',
      transition: 'zoom',
      background: 'gradient',
    },
    {
      type: 'comparison',
      eyebrow: 'Perdagangan Luar Negeri',
      title: 'Perbandingan Ekspor & Impor',
      columns: ['Q2 2026', 'Q3 2026'],
      rows: [
        { label: 'Ekspor', values: ['4.13%', '4.59%'] },
        { label: 'Impor', values: ['8.82%', '7.31%'] },
      ],
      duration: 10,
      narration: 'Untuk perdagangan luar negeri, ekspor tumbuh 4,13 persen di kuartal kedua dan 4,59 persen di kuartal ketiga. Impor tumbuh 8,82 persen, lalu 7,31 persen.',
      transition: 'wipe',
      background: 'solid',
    },
    {
      type: 'timeline',
      title: 'Rangkuman Q3 2026',
      steps: [
        { icon: '📈', title: 'PDB Membaik', description: 'Pertumbuhan capai 5.47% yoy' },
        { icon: '🛍️', title: 'Konsumsi Dominan', description: 'Pangsa PDB capai 51.97%' },
        { icon: '🏭', title: 'Investasi Kuat', description: 'Pangsa PMTB capai 30.81%' },
      ],
      duration: 8,
      narration: 'Jadi, di kuartal ketiga 2026, PDB tumbuh 5,47 persen. Konsumsi tetap dominan dengan pangsa 51,97 persen, dan investasi kuat dengan pangsa 30,81 persen.',
      transition: 'slideUp',
      background: 'pattern',
    },
    {
      type: 'cta',
      title: 'Laporan Ekonomi BPS 2026',
      button: 'Lihat Detail Rilis',
      url: 'bps.go.id',
      badges: ['BPS 2026'],
      duration: 7,
      narration: 'Data lengkapnya ada di rilis resmi BPS. Kunjungi situs BPS untuk detailnya.',
      transition: 'fade',
      background: 'gradient',
    },
  ],
});
