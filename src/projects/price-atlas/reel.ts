import { socialMediaShort } from '../../templates';
import { priceAtlas } from './brand';

/**
 * Contoh hasil prompt: "Buat Instagram Reel 20 detik untuk PriceAtlas
 * memakai Motion Studio, tema ApplePremium, sorot 3 fitur ini…"
 * → hanya file ini yang ditulis.
 */
export default socialMediaShort({
  id: 'PriceAtlas-Reel20',
  brand: priceAtlas,
  theme: 'ApplePremium',
  duration: 20,
  hook: 'Masih bayar lebih mahal untuk barang yang sama?',
  highlight: 'lebih mahal',
  pointsTitle: '3 cara PriceAtlas bikin hemat',
  points: [
    { icon: '🔍', title: 'Bandingkan harga', description: 'Ratusan toko dalam satu pencarian' },
    { icon: '🧾', title: 'Pindai struk', description: 'Catat belanja otomatis tanpa ketik' },
    { icon: '🔔', title: 'Alert harga turun', description: 'Notifikasi saat barang incaran diskon' },
  ],
  proof: [{ value: 287500, prefix: 'Rp ', label: 'rata-rata hemat per bulan' }],
  cta: { title: 'Belanja cerdas mulai sekarang.', highlight: 'cerdas', button: 'Unduh Gratis' },
});
