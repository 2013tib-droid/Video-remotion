import { promoProyek } from '../../templates';
import { priceAtlasSeries } from './series';

/** CONTOH template `promoProyek` (iklan proyek, tanpa narasi). Salin file ini untuk iklan proyek lain. */
export default promoProyek(priceAtlasSeries, {
  slug: 'Iklan30',
  duration: 30,
  hook: 'Barang sama, kok harganya beda jauh?',
  highlight: 'beda jauh',
  masalah: ['Cek toko satu per satu.', 'Capek bandingin.', 'Tetap kemahalan.'],
  solusi: 'Semua harga, satu pencarian.',
  solusiHighlight: 'satu pencarian',
  tagline: 'Bandingkan harga dari ratusan toko dalam hitungan detik.',
  layar: [
    {
      judul: 'Pindai struk, sisanya otomatis.',
      highlight: 'otomatis',
      layar: {
        kind: 'receipt',
        store: 'SUPERMARKET MAJU',
        items: [
          { name: 'Minyak goreng 2L', price: 36500 },
          { name: 'Beras 5kg', price: 74900 },
          { name: 'Gula 1kg', price: 17800 },
        ],
        scanning: true,
      },
    },
  ],
  fiturJudul: 'Tiga cara bikin hemat',
  fitur: [
    { icon: '🔍', title: 'Bandingkan harga', description: 'Ratusan toko dalam satu pencarian' },
    { icon: '🧾', title: 'Pindai struk', description: 'Catat belanja otomatis tanpa ketik' },
    { icon: '🔔', title: 'Alert harga turun', description: 'Notifikasi saat barang incaran diskon' },
  ],
});
