import { defineSeries } from '../../templates';

/**
 * Seri MELEK EKONOMI: edukasi ekonomi & investasi singkat (Shorts/TikTok/Reels, 9:16) bergaya fintech premium:
 * dunia 3D semi-isometrik (template `bedah3D`) berlatar abu-abu dingin.
 * Warna aset (dipakai konsisten di label/HUD): biru = institusi · merah = negatif/kenaikan bunga · hijau = untung · kuning = perhatian.
 * Ganti `watermark` dengan handle kanal bila sudah ada.
 */
export const melekEkonomi = defineSeries({
  brand: { name: 'Melek Ekonomi', logo: '📈' },
  idPrefix: 'MelekEkonomi',
  theme: 'ModernSaaS',
  themeOverrides: {
    colors: {
      background: '#e8ecf1',
      backgroundAlt: '#f1f4f8',
      surface: '#ffffff',
      surfaceAlt: '#eef1f6',
      primary: '#1d4ed8',
      secondary: '#16a34a',
      accent: '#f5b301',
      text: '#0f172a',
      muted: '#5b6574',
      border: '#d5dbe4',
      success: '#16a34a',
      danger: '#e5484d',
      highlight: '#f5c518',
      onHighlight: '#111111',
    },
    gradient: 'linear-gradient(120deg, #1d4ed8 0%, #0ea5e9 100%)',
  },
  audio: 'semangat',
  watermark: true,
  voice: {
    name: 'id-ID-Ardi:DragonHDLatestNeural',
    rate: '+10%',
    lexicon: { BI: 'Be I', SBN: 'Es Be En', IHSG: 'I Ha Es Ge', KPR: 'Ka Pe Er' },
  },
  outro: {
    title: 'Belajar ekonomi & investasi.',
    highlight: 'investasi',
    button: 'Follow',
    narasi: 'Follow untuk belajar ekonomi dan investasi dengan cara yang mudah dipahami.',
  },
});
