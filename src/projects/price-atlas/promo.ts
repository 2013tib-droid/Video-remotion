import { defineVideo } from '../../core';
import { priceAtlas } from './brand';

/** Promo utama PriceAtlas — premium technology, 9:16. */
export default defineVideo({
  id: 'PriceAtlas-Promo',
  brand: priceAtlas,
  theme: 'ApplePremium',
  scenes: [
    {
      type: 'hero',
      eyebrow: 'Memperkenalkan PriceAtlas',
      title: 'Belanja lebih cerdas, setiap hari.',
      highlight: 'cerdas',
      subtitle: 'Bandingkan harga dari ratusan toko dalam hitungan detik.',
      duration: 4,
    },
    {
      type: 'chart',
      eyebrow: 'Perbandingan harga',
      title: 'Barang sama, harga beda.',
      subtitle: 'Minyak goreng 2 liter hari ini',
      data: [
        { label: 'Toko Sentosa', value: 38900 },
        { label: 'Mart Kita', value: 36500 },
        { label: 'Pasar Online', value: 34200 },
        { label: 'Grosir Jaya', value: 31750 },
      ],
      highlightBar: 3,
      highlightLabel: 'Termurah',
      prefix: 'Rp ',
      duration: 5,
    },
    {
      type: 'device',
      title: 'Pindai struk, sisanya otomatis.',
      highlight: 'otomatis',
      screen: {
        kind: 'receipt',
        store: 'SUPERMARKET MAJU',
        items: [
          { name: 'Beras 5kg', price: 72500 },
          { name: 'Minyak 2L', price: 38900 },
          { name: 'Telur 1kg', price: 29000 },
          { name: 'Gula 1kg', price: 17500 },
        ],
      },
      duration: 5.5,
    },
    {
      type: 'calculation',
      eyebrow: 'Hasilnya',
      title: 'Hemat nyata setiap bulan.',
      highlight: 'Hemat',
      lines: [
        { label: 'Belanja di toko biasa', value: 1250000 },
        { label: 'Dengan harga terbaik', value: 962500 },
      ],
      total: { label: 'Kamu hemat', value: 287500 },
      prefix: 'Rp ',
      note: 'Hemat 23% 🎉',
      duration: 5,
    },
    {
      type: 'cta',
      title: 'Mulai hemat hari ini.',
      highlight: 'hemat',
      button: 'Unduh Gratis',
      badges: ['App Store', 'Google Play'],
      duration: 4.5,
    },
  ],
});
