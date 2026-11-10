import { defineVideo } from '../../core';

/**
 * Demo scene `words`, `broll`, `map` + efek suara (whoosh, pop, ting, tick).
 * Ganti `src` b-roll dengan foto/video brand kamu.
 */
export const sceneBaruDemo = defineVideo({
  id: 'Demo-SceneBaru',
  brand: { name: 'Jelajah Rasa', url: 'jelajahrasa.id' },
  theme: 'ModernDark',
  transition: 'mix',
  scenes: [
    {
      type: 'words',
      words: 'Satu aplikasi. Semua rasa. Seluruh Indonesia.',
      accent: ['rasa', 'indonesia'],
      caption: 'Jelajah Rasa',
      duration: 4.5,
    },
    {
      type: 'broll',
      eyebrow: 'Cerita mitra',
      title: 'Dari dapur kecil ke ribuan pelanggan.',
      highlight: 'ribuan',
      shots: [
        { src: 'brands/soalskd/tryout-soal.jpg', move: 'zoomIn', focus: [0.5, 0.3], caption: '📍 Yogyakarta' },
        { src: 'brands/soalskd/tryout-soal.jpg', move: 'panUp', caption: '📍 Surabaya' },
      ],
      duration: 5,
    },
    {
      type: 'map',
      eyebrow: 'Jangkauan',
      title: 'Hadir di 6 kota besar.',
      highlight: '6 kota',
      points: [
        { place: 'Jakarta', value: '1.240 mitra' },
        { place: 'Bandung', value: '410 mitra' },
        { place: 'Yogyakarta', value: '320 mitra' },
        { place: 'Surabaya', value: '680 mitra' },
        { place: 'Denpasar', value: '150 mitra' },
        { place: 'Makassar', value: '210 mitra' },
      ],
      routes: [
        { from: 0, to: 3 },
        { from: 3, to: 5 },
      ],
      duration: 6.5,
    },
    {
      type: 'stats',
      title: 'Tumbuh setiap bulan.',
      stats: [
        { value: 3010, label: 'mitra aktif' },
        { value: 48, suffix: '%', label: 'pertumbuhan' },
      ],
    },
    {
      type: 'map',
      region: 'world',
      title: 'Berikutnya: ekspor.',
      highlight: 'ekspor',
      countries: ['Indonesia', 'Malaysia', 'Singapore', 'Japan'],
      points: [
        { place: 'Jakarta', label: 'Jakarta' },
        { place: 'Tokyo', label: 'Tokyo', value: '2027' },
      ],
      routes: [{ from: 0, to: 1 }],
      zoomToPoints: false,
      duration: 5,
    },
    {
      type: 'cta',
      title: 'Pesan sekarang.',
      button: 'Unduh Aplikasi',
    },
  ],
});
