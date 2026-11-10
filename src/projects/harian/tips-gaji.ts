import { kontenHarian } from '../../templates';
import { harian } from './series';

/**
 * CONTOH template `kontenHarian` (bernarasi). Untuk video baru: salin, ganti isinya,
 * lalu `AZURE_SPEECH_KEY=proxy-injected npm run narasi -- Harian-<slug>`.
 */
export default kontenHarian(harian, {
  slug: 'TipsGaji',
  topik: 'Keuangan',
  hook: 'Gaji selalu numpang lewat?',
  highlight: 'numpang lewat',
  hookNarasi: 'Gaji kamu selalu cuma numpang lewat? Coba tiga kebiasaan kecil ini.',
  bagian: [
    {
      judul: 'Pisahkan di hari gajian',
      highlight: 'hari gajian',
      langkah: [
        { icon: '💰', title: 'Gaji masuk' },
        { icon: '🏦', title: 'Langsung sisihkan tabungan' },
        { icon: '🛒', title: 'Sisanya baru dipakai' },
      ],
      narasi: 'Pertama, begitu gaji masuk, langsung sisihkan tabungan. Sisanya, baru kamu pakai.',
      emphasis: ['langsung sisihkan'],
    },
    {
      teks: ['Catat pengeluaran.', 'Sekecil apa pun.'],
      highlight: 'Sekecil apa pun',
      narasi: 'Kedua, catat semua pengeluaran, sekecil apa pun. Yang kecil-kecil itu yang biasanya bocor.',
    },
    {
      judul: 'Tunda belanja impulsif',
      highlight: 'Tunda',
      poin: [
        { icon: '🛍️', title: 'Pengin sesuatu?', description: 'Masukkan keranjang dulu' },
        { icon: '⏰', title: 'Tunggu 24 jam', description: 'Besok masih pengin atau tidak?' },
      ],
      narasi: 'Ketiga, kalau pengin beli sesuatu, tunggu dua puluh empat jam. Seringnya, besok sudah tidak pengin lagi.',
    },
  ],
  kesimpulan: { teks: ['Kecil,', 'tapi konsisten.'], highlight: 'konsisten', narasi: 'Kecil, tapi konsisten. Itu kuncinya.' },
});
