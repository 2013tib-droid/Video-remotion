import { defineSeries } from '../../templates';

/**
 * Seri "BAGAIMANA JIKA?" versi Indonesia: skenario berandai-andai yang berpijak pada kejadian/data nyata bersumber.
 * Gaya: 3D isometrik + irisan teknis 2D (template `bedah3D`, acuan `docs/REFERENSI.md` R1–R2), latar krem.
 * Naskah: `naskah/bagaimana-jika/`. Ganti `watermark` dengan handle kanal bila sudah ada.
 */
export const bagaimanaJika = defineSeries({
  brand: { name: 'Bagaimana Jika?', logo: '🤔' },
  idPrefix: 'BagaimanaJika',
  theme: 'ModernSaaS',
  // Gaya referensi R2 (docs/REFERENSI.md): krem hangat netral, label & sorotan kuning, biru/hijau untuk pembeda.
  themeOverrides: {
    colors: {
      background: '#ebe7df',
      backgroundAlt: '#f3f0ea',
      surface: '#fbfaf6',
      surfaceAlt: '#f1ede5',
      primary: '#2563eb',
      secondary: '#16a34a',
      accent: '#f6d23f',
      text: '#1b1b1b',
      muted: '#6b665d',
      border: '#ddd7cc',
      highlight: '#f6d23f',
      onHighlight: '#141414',
    },
    gradient: 'linear-gradient(120deg, #1b1b1b 0%, #2b2b2b 100%)',
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
