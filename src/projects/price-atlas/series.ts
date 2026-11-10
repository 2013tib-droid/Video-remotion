import { defineSeries } from '../../templates';
import { priceAtlas } from './brand';

/** Semua yang sama di setiap video PriceAtlas. Video baru: lihat `iklan.ts`. */
export const priceAtlasSeries = defineSeries({
  brand: priceAtlas,
  theme: 'ApplePremium',
  audio: 'semangat',
  watermark: true,
  outro: { title: 'Belanja cerdas mulai sekarang.', highlight: 'cerdas', button: 'Unduh Gratis' },
});
