import { defineSeries } from '../../templates';

/**
 * Seri KONTEN HARIAN (topik bebas: keuangan, politik, sosial, tips).
 * Ganti nama/handle di sini sekali — semua video ikut. Video baru: salin `tips-gaji.ts`.
 */
export const harian = defineSeries({
  brand: { name: 'Harian', logo: '📰' },
  idPrefix: 'Harian',
  theme: 'ModernDark',
  audio: 'tenang',
  // Ganti dengan handle kanal, mis. '@namakanal'.
  watermark: true,
  // Video bernarasi vertikal: isi muncul saat disebut + teks pendukung terbaca di ponsel.
  motion: { sync: 'auto' },
  legibility: 'mobile',
  outro: {
    title: 'Follow biar nggak ketinggalan.',
    highlight: 'Follow',
    button: 'Follow',
    narasi: 'Follow untuk bahasan singkat lainnya setiap hari.',
  },
});
