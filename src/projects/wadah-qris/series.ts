import { DEFAULT_VOICE, defineSeries } from '../../templates';

/** Seri WadahQRIS — konten ajakan sedekah/infak. Hangat, santun, tidak menggurui. */
export const wadahQris = defineSeries({
  brand: { name: 'WadahQRIS', logo: 'brands/wadahqris/logo.svg', url: 'wadahqris.id' },
  idPrefix: 'WadahQRIS',
  theme: 'IslamicWarm',
  audio: 'tenang',
  watermark: '@wadahqris.id',
  // Reels: gerak kamera, idle & keluar lebih terasa (explainer default-nya `calm`).
  motion: { energy: 'lively' },
  voice: {
    ...DEFAULT_VOICE,
    // Urutan penting: yang panjang dulu.
    lexicon: {
      'wadahqris.id': 'wadah kyu-ris titik i-de',
      WadahQRIS: 'wadah kyu-ris',
      QRIS: 'kyu-ris',
      'HR.': 'hadits riwayat',
      HP: 'ha-pe',
    },
  },
  outro: {
    title: 'Sedekah dari genggaman',
    highlight: 'genggaman',
    button: 'wadahqris.id',
    url: 'wadahqris.id',
    narasi: 'Kalau berkenan, temukan QRIS masjid terdekat di wadahqris.id.',
  },
});
