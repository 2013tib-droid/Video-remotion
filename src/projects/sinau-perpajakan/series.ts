import { DEFAULT_VOICE, defineSeries } from '../../templates';

/**
 * Seri SINAU PERPAJAKAN — edukasi pajak untuk orang awam. Naskah: `naskah/sinau-perpajakan/`.
 * Gaya: kuning + putih dominan (cerah, berenergi), biru sebagai aksen (sorotan, tombol, angka).
 * Alur kerja: agen `riset-pajak` → agen `penulis-naskah` → pemilik set `status: final` → buat config.
 */
export const sinauPerpajakan = defineSeries({
  brand: { name: 'Sinau Perpajakan', logo: 'brands/sinau-perpajakan/logo.svg' },
  idPrefix: 'SinauPajak',
  theme: 'ModernSaaS',
  themeOverrides: {
    name: 'SinauPerpajakan',
    colors: {
      // Dominan: kuning (latar) + putih (kartu).
      background: '#FFE14D',
      backgroundAlt: '#FFF3B0',
      surface: '#FFFFFF',
      surfaceAlt: '#FFF8D6',
      // Aksen biru: sorotan kata, tombol, angka. Teks hampir hitam agar terbaca di kuning.
      primary: '#1D3FA6',
      secondary: '#2F7BF5',
      accent: '#0B1B4D',
      text: '#1B1B1F',
      onPrimary: '#FFFFFF',
      muted: '#4A4A55',
      border: '#F2CF2E',
      success: '#1E9E6A',
      danger: '#E2483D',
      highlight: '#1D3FA6',
      onHighlight: '#FFFFFF',
    },
    gradient: 'linear-gradient(120deg, #0B1B4D 0%, #1D3FA6 50%, #2F7BF5 100%)',
    shadow: {
      card: '0 12px 0 rgba(27,27,31,0.08), 0 18px 40px rgba(11,27,77,0.12)',
      elevated: '0 16px 0 rgba(27,27,31,0.08), 0 30px 70px rgba(29,63,166,0.22)',
    },
    motion: { spring: 'snappy', entrance: 'pop', transition: 'slideUp', energy: 'lively', text: 'pop' },
    background: { kind: 'gradient', intensity: 0.5 },
  },
  audio: 'semangat',
  // Belum ada akun medsos: logo + nama brand. Nanti ganti '@akun'.
  watermark: true,
  voice: {
    ...DEFAULT_VOICE,
    // Urutan penting: yang panjang dulu.
    lexicon: {
      'Coretax': 'kor-teks',
      NPWP: 'en pe we pe',
      PTKP: 'pe te ka pe',
      PKP: 'pe ka pe',
      PPnBM: 'pe pe en be em',
      PPh: 'pe pe ha',
      PPN: 'pe pe en',
      PBB: 'pe be be',
      SPT: 'es pe te',
      DJP: 'de je pe',
      NIK: 'en i ka',
      UMKM: 'u em ka em',
      HPP: 'ha pe pe',
      PMK: 'pe em ka',
      TER: 'te e er',
    },
  },
  outro: {
    title: 'Melek pajak, nggak pakai pusing.',
    highlight: 'Melek pajak',
    button: 'Follow',
    narasi: 'Follow Sinau Perpajakan, biar paham pajak tanpa pusing.',
  },
});
