import { defineSeries } from '../../templates';

/**
 * Seri "BAGAIMANA JIKA?" versi Indonesia: skenario berandai-andai yang berpijak pada kejadian/data nyata bersumber.
 * Gaya: animasi 3D penuh (template `bedah3D`, acuan `docs/REFERENSI.md` R1) dengan latar terang.
 * Naskah: `naskah/bagaimana-jika/`. Ganti `watermark` dengan handle kanal bila sudah ada.
 */
export const bagaimanaJika = defineSeries({
  brand: { name: 'Bagaimana Jika?', logo: '🤔' },
  idPrefix: 'BagaimanaJika',
  theme: 'ModernSaaS',
  // Latar cerah: biru langit + aksen oranye.
  themeOverrides: {
    colors: { background: '#e6f4ff', backgroundAlt: '#fff4e0', primary: '#2563eb', secondary: '#0ea5e9', accent: '#f97316' },
    gradient: 'linear-gradient(120deg, #2563eb 0%, #0ea5e9 50%, #f97316 100%)',
  },
  audio: 'semangat',
  watermark: true,
  outro: {
    title: 'Mau skenario apa lagi?',
    highlight: 'skenario',
    button: 'Follow',
    narasi: 'Tulis skenario bagaimana jika versimu di komentar. Follow untuk jawabannya.',
  },
});
