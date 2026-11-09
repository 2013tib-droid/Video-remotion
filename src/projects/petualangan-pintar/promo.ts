import { educationalProductPromo } from '../../templates';

/** Petualangan Pintar — edukasi anak yang ceria, dibangun dari template. */
export default educationalProductPromo({
  id: 'PetualanganPintar-Promo',
  brand: { name: 'Petualangan Pintar', logo: '🦉', url: 'petualanganpintar.id' },
  theme: 'PlayfulKids',
  duration: 22,
  mascot: {
    src: '🦉',
    name: 'Halo, aku Pinta!',
    title: 'Petualangan Pintar',
    speech: 'Ayo belajar sambil bertualang bersamaku!',
  },
  lessonsTitle: 'Kartu belajar seru',
  lessons: [
    { icon: '🔢', title: 'Matematika', description: 'Berhitung lewat teka-teki' },
    { icon: '📖', title: 'Membaca', description: 'Cerita bergambar interaktif' },
    { icon: '🔬', title: 'Sains', description: 'Eksperimen kecil yang aman' },
    { icon: '🎨', title: 'Kreativitas', description: 'Menggambar & mewarnai' },
  ],
  quiz: {
    caption: 'Main game, kumpulkan bintang!',
    title: 'Level 3 🌟',
    question: 'Pinta punya 3 apel, lalu dapat 4 lagi. Jadi berapa?',
    options: ['6', '7', '8', '9'],
    correct: 1,
    reward: '+10 ⭐',
  },
  cta: {
    title: 'Yuk, mulai petualangan!',
    button: 'Main Sekarang',
    subtitle: 'Gratis untuk anak usia 4–8 tahun',
    badges: ['App Store', 'Google Play'],
  },
});
