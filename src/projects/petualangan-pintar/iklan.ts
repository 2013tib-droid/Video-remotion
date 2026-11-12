import { promoProyek } from '../../templates';
import { petualanganPintar } from './series';

/** Iklan Petualangan Pintar. Naskah & sumber angka: `naskah/petualangan-pintar/iklan.md`. */
export default promoProyek(petualanganPintar, {
  slug: 'Iklan',
  duration: 35,
  lexicon: { TK: 'Te Ka', SD: 'Es De', Playgroup: 'Plé grup' },
  hook: 'Belum bisa baca? Tetap bisa belajar.',
  highlight: 'Tetap bisa belajar',
  masalah: ['Game penuh iklan.', 'Belajar bikin bosan.', 'Takut salah.'],
  solusi: 'Belajar seru, tanpa terasa belajar.',
  solusiHighlight: 'tanpa terasa belajar',
  tagline: 'Game edukasi untuk Playgroup, TK, dan SD.',
  layar: [
    {
      layar: 'brands/petualangan-pintar/03-gameplay-benar.jpg',
      judul: 'Setiap soal dibacakan suara.',
      highlight: 'dibacakan',
      narasi: 'Setiap soal dibacakan, jadi anak yang belum bisa membaca tetap bisa main.',
    },
    {
      layar: 'brands/petualangan-pintar/04-gameplay-tulis.jpg',
      judul: 'Menulis huruf mengikuti jalur.',
      highlight: 'mengikuti jalur',
      narasi: 'Jarinya menyusuri jalur, belajar menulis huruf dengan urutan yang benar.',
    },
    {
      layar: 'brands/petualangan-pintar/05-selamat.jpg',
      judul: 'Kumpulkan bintang, maskot tumbuh.',
      highlight: 'maskot tumbuh',
      narasi: 'Kumpulkan bintang, dan teman belajarnya tumbuh sampai jadi naga.',
    },
  ],
  fiturJudul: 'Aman dan bikin betah',
  fitur: [
    { icon: '🎮', title: 'Banyak cara main', description: 'Hitung, labirin, coding, cerita' },
    { icon: '💛', title: 'Salah itu boleh', description: 'Tanpa hukuman, berani coba lagi' },
    { icon: '🛡️', title: 'Tanpa iklan', description: 'Aman, tanpa tautan keluar' },
    { icon: '💳', title: 'Sekali bayar', description: 'Playgroup & TK cuma Rp19.000' },
  ],
  // Angka dihitung dari repo game (registry & config level), 2026-11.
  bukti: [
    { value: 47, label: 'game' },
    { value: 565, label: 'level' },
    { value: 2600, suffix: '+', label: 'variasi soal' },
  ],
  narasi: {
    hook: 'Anak belum lancar membaca? Tetap bisa belajar sendiri.',
    masalah: 'Bukan game penuh iklan, bukan belajar yang membosankan.',
    solusi: 'Kenalkan Petualangan Pintar, game edukasi untuk anak Playgroup, TK, dan SD.',
    fitur: 'Tanpa iklan, tanpa hukuman saat salah. Untuk Playgroup dan TK, cukup sekali bayar sembilan belas ribu rupiah.',
    bukti: 'Ada empat puluh tujuh game, lima ratus enam puluh lima level, dan lebih dari dua ribu enam ratus variasi soal.',
  },
});
