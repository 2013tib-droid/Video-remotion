import { defineSeries } from '../../templates';

/**
 * Seri "BAGAIMANA JIKA?" versi Indonesia: skenario berandai-andai yang berpijak pada kejadian/data nyata bersumber.
 * Naskah: `naskah/bagaimana-jika/`. Ganti `watermark` dengan handle kanal bila sudah ada.
 */
export const bagaimanaJika = defineSeries({
  brand: { name: 'Bagaimana Jika?', logo: '🤔' },
  idPrefix: 'BagaimanaJika',
  theme: 'ModernDark',
  audio: 'semangat',
  watermark: true,
  outro: {
    title: 'Mau skenario apa lagi?',
    highlight: 'skenario',
    button: 'Follow',
    narasi: 'Tulis skenario bagaimana jika versimu di komentar. Follow untuk jawabannya.',
  },
});
