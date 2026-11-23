import { kontenHarian, type HookPola, type KontenHarianProps } from '../../templates';
import { harian } from '../harian/series';
import spreadEmas from '../harian/spread-emas-antam';

/**
 * DEMO PRESET HOOK (Fase 3): satu video pendek per pola — ID `Demo-Hook-<pola>`.
 * Hook ditulis sebagai `{ pola, … }`; narasi hook dibangkitkan dari isinya (tanpa `hookNarasi`).
 * Data = snapshot spread emas dari pengguna (DATA REFERENSI, belum terverifikasi; lihat `harian/spread-emas-antam.ts`):
 *   Antam LM 22 Nov 2026 beli 2.495.000 / buyback 2.095.000 (selisih 400.000, spread 16,03%) · Galeri24 5,96%
 *   Emas dunia 16→20 Nov −8,42% · Antam LM 16→22 Nov −1,07% (dibulatkan 8% / 1% di hook)
 * Narasi: `npm run narasi -- Demo-Hook`. Pratinjau: `npm run pratinjau -- Demo-Hook`.
 */
const isi: KontenHarianProps['bagian'] = [
  {
    judul: 'Selisih beli & buyback',
    highlight: 'buyback',
    maksud: 'dua-nilai',
    data: { a: { label: 'Harga beli', value: 2495000 }, b: { label: 'Buyback', value: 2095000 }, prefix: 'Rp', selisihLabel: 'Spread', tanda: false },
    catatan: 'Antam 1 gram · 22 Nov 2026 · referensi',
    narasi: 'Harga beli dua juta empat ratus sembilan puluh lima ribu, buyback dua juta sembilan puluh lima ribu.',
  },
];

const demo = (slug: string, hook: HookPola, bagian = isi) => ({
  ...kontenHarian(harian, {
    slug,
    topik: 'Emas',
    theme: 'ApplePremium',
    lexicon: { Galeri24: 'Galeri dua empat', UBS: 'U B S' },
    hook,
    bagian,
    penutup: false,
  }),
  id: `Demo-Hook-${slug}`,
  watermark: false as const,
  themeOverrides: spreadEmas.themeOverrides,
});

export default [
  demo('angka-konsekuensi', { pola: 'angka-konsekuensi', angka: 'Rp400.000', akibat: 'hilang saat dijual lagi' }),
  demo('asumsi-dibantah', { pola: 'asumsi-dibantah', asumsi: 'Emas dunia turun 8%', bantahan: 'Antam cuma 1%' }),
  demo(
    'kontras',
    {
      pola: 'kontras',
      judul: 'Spread emas 1 gram',
      highlight: 'Spread',
      a: { label: 'Antam', value: 16.03 },
      b: { label: 'UBS', value: 7.89 },
      suffix: '%',
      decimals: 0,
      persen: false,
      tanda: false,
      arah: 'naik-buruk',
    },
    // Hook `kontras` sudah `selisih` → isi memakai `peringkat` (chart) agar tipe tidak berulang.
    [
      {
        judul: 'Spread emas 1 gram',
        highlight: 'Spread',
        maksud: 'peringkat',
        data: {
          item: [
            { label: 'Antam LM', value: 16.03 },
            { label: 'UBS', value: 7.89 },
            { label: 'Galeri24', value: 5.96 },
          ],
          terbaik: 'rendah',
          suffix: '%',
          decimals: 2,
        },
        narasi: 'Galeri24 sekitar enam persen, UBS hampir delapan, Antam LM lebih dari enam belas persen.',
      },
    ],
  ),
  demo('kesalahan-umum', { pola: 'kesalahan-umum', kesalahan: 'Emas buat untung cepat', koreksi: 'Rugi di spread', highlight: 'untung cepat' }),
  demo('pertanyaan', { pola: 'pertanyaan', teks: 'Kenapa Antam cuma turun 1%?', highlight: 'cuma turun 1%?' }),
];
