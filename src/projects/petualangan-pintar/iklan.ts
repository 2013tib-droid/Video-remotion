import type { VideoConfig } from '../../core/types';
import type { SceneConfig } from '../../scenes/types';
import { promoProyek } from '../../templates';
import { petualanganPintar } from './series';

const img = (f: string) => `brands/petualangan-pintar/${f}`;

/** Iklan Petualangan Pintar. Naskah & sumber angka: `naskah/petualangan-pintar/iklan.md`. */
const promo = promoProyek(petualanganPintar, {
  slug: 'Iklan',
  duration: 35,
  lexicon: { TK: 'Te Ka', SD: 'Es De', Playgroup: 'Plé grup' },
  hook: 'Belum bisa baca? Tetap bisa belajar.',
  highlight: 'Tetap bisa belajar',
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
    solusi: 'Kenalkan Petualangan Pintar, game edukasi untuk anak Playgroup, TK, dan SD.',
    fitur: 'Tanpa iklan, tanpa hukuman saat salah. Untuk Playgroup dan TK, cukup sekali bayar sembilan belas ribu rupiah.',
    bukti: 'Ada empat puluh tujuh game, lima ratus enam puluh lima level, dan lebih dari dua ribu enam ratus variasi soal.',
  },
});

/**
 * Pembuka bergambar sejak detik pertama: montase gameplay (hook) → maskot memperkenalkan produk.
 * Menggantikan dua scene teks pertama promoProyek (hook & solusi); sisanya (layar HP, fitur, angka, CTA) tetap.
 */
const pembuka: SceneConfig[] = [
  {
    type: 'broll',
    // Tanpa judul: teks di screenshot bertabrakan dengan judul. Hook dibawa narasi + subtitle.
    dim: 0.1,
    emphasis: ['Tetap bisa belajar'],
    shots: [
      { src: img('03-gameplay-benar.jpg'), move: 'zoomIn', focus: [0.5, 0.5] },
      { src: img('04-gameplay-tulis.jpg'), move: 'zoomIn', focus: [0.5, 0.62] },
      { src: img('05-selamat.jpg'), move: 'panUp', focus: [0.5, 0.6] },
    ],
    narration: 'Anak belum lancar membaca? Tetap bisa belajar sendiri.',
  },
  {
    type: 'mascot',
    mascot: img('petualang.webp'),
    name: 'Petualangan Pintar',
    speech: 'Belajar seru, tanpa terasa belajar!',
    subtitle: 'Game edukasi untuk Playgroup, TK, dan SD.',
    narration: 'Kenalkan Petualangan Pintar, game edukasi untuk anak Playgroup, TK, dan SD.',
  },
];

const config: VideoConfig = { ...promo, scenes: [...pembuka, ...promo.scenes.slice(2)] };
export default config;
