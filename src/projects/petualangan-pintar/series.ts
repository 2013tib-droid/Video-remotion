import { defineSeries } from '../../templates';

/** Semua yang sama di setiap video Petualangan Pintar. Naskah: `naskah/petualangan-pintar/`. */
export const petualanganPintar = defineSeries({
  brand: { name: 'Petualangan Pintar', logo: 'brands/petualangan-pintar/logo.svg', url: 'petualanganpintar.com' },
  idPrefix: 'PetualanganPintar',
  // Tanpa ungu (permintaan pemilik).
  theme: 'PlayfulKids',
  audio: 'semangat',
  // Belum ada akun medsos: tampilkan logo + nama brand. Nanti bisa diganti '@akun'.
  watermark: true,
  outro: {
    title: 'Coba gratis sekarang.',
    highlight: 'gratis',
    button: 'Coba Gratis',
    url: 'petualanganpintar.com',
    narasi: 'Coba gratis sekarang di petualangan pintar titik kom.',
  },
});
