import { kontenHarian } from '../../templates';
import { harian } from '../harian/series';
import spreadEmas from '../harian/spread-emas-antam';

/**
 * DEMO visualisasi data 2D (Fase 2): `selisih`, `stats` 1 angka, `tren`, `alur` — lewat template `kontenHarian`.
 * Data SAMA dengan `harian/spread-emas-antam.ts` (snapshot dari pengguna, DATA REFERENSI, belum terverifikasi):
 *   Antam LM 22 Nov 2026: beli 2.495.000, buyback 2.095.000 → selisih 400.000, spread 16,03%
 *   UBS 7,89% · Galeri24 5,96% (22 Nov 2026)
 *   Emas dunia 16→20 Nov 2026: US$3.869,30 → US$3.543,60 /troy oz (−8,42%)
 *   Antam LM 16→22 Nov 2026: Rp2.522.000 → Rp2.495.000 (−1,07%)
 * Bandingkan panjang kode: scene 2 & 4 video asli ±60 baris koordinat `irisan`; di sini ±10 baris data.
 * Narasi: `npm run narasi -- Demo-DataViz`.
 */
const config = kontenHarian(harian, {
  slug: 'DataViz',
  topik: 'Emas',
  theme: 'ApplePremium',
  lexicon: { Galeri24: 'Galeri dua empat', UBS: 'U B S' },
  hook: 'Jual lagi emas, rugi Rp400.000?',
  highlight: 'Rp400.000',
  hookNarasi: 'Jual lagi emas, rugi empat ratus ribu?',
  bagian: [
    {
      label: 'Antam LM · 1 gram · 22 Nov 2026',
      judul: 'Harga beli vs buyback',
      highlight: 'buyback',
      selisih: {
        a: { label: 'Harga beli', value: 2495000 },
        b: { label: 'Buyback', value: 2095000, at: 'jual' },
        prefix: 'Rp',
        selisihLabel: 'Spread',
        selisihAt: 'Selisih',
        tanda: false,
      },
      catatan: 'Data referensi · perlu verifikasi',
      narasi:
        'Harga belinya dua juta empat ratus sembilan puluh lima ribu. Harga jual kembalinya cuma dua juta sembilan puluh lima ribu. Selisih inilah spread.',
      emphasis: ['spread.'],
    },
    {
      judul: 'Spread paling lebar',
      highlight: 'paling lebar',
      angka: [{ value: 16.03, suffix: '%', decimals: 2, label: 'Spread Antam LM · 1 gram', pembanding: 'UBS 7,89% · Galeri24 5,96%' }],
      catatan: 'Snapshot 22 Nov 2026 · referensi',
      narasi: 'Spread Antam lebih dari enam belas persen. Bandingkan dengan UBS hampir delapan persen, dan Galeri24 sekitar enam persen.',
      emphasis: ['lebih dari enam belas persen.'],
    },
    {
      label: 'Perubahan sejak 16 Nov 2026',
      judul: 'Emas dunia terkoreksi',
      highlight: 'terkoreksi',
      tren: {
        skala: 'persen',
        seri: [
          { label: 'Emas dunia', warna: 'danger', titik: [{ label: '16 Nov', x: 16, value: 3869.3 }, { label: '20 Nov', x: 20, value: 3543.6 }] },
          { label: 'Antam LM', warna: 'primary', titik: [{ label: '16 Nov', x: 16, value: 2522000 }, { label: '22 Nov', x: 22, value: 2495000 }] },
        ],
        cap: { at: 'delapan' },
      },
      catatan: 'Sejak 16 Nov · 2 titik data · referensi',
      narasi: 'Emas dunia turun sekitar delapan persen dalam sepekan. Tapi Antam hanya turun sekitar satu persen.',
      emphasis: ['sekitar satu persen.'],
    },
    {
      judul: 'Kenapa harga lokal beda?',
      highlight: 'beda',
      alur: {
        simpul: [
          { icon: '🌍', text: 'Emas dunia (US$)' },
          { icon: '💱', text: 'Harga dalam rupiah', panah: 'kurs' },
          { icon: '🏷️', text: 'Harga beli lokal', panah: '+ premi' },
        ],
        cabang: { dari: 1, icon: '💰', text: 'Harga buyback', panah: 'kebijakan', warna: 'danger' },
      },
      narasi:
        'Harga emas dunia dalam dolar dikonversi dengan kurs rupiah. Lalu penjual menambah premi untuk harga beli, dan menetapkan sendiri harga buyback.',
      emphasis: ['menetapkan sendiri'],
    },
  ],
  kesimpulan: { teks: ['Sebelum beli emas,', 'cek spread-nya.'], highlight: 'cek spread-nya.' },
});

export default {
  ...config,
  id: 'Demo-DataViz',
  watermark: false,
  themeOverrides: spreadEmas.themeOverrides,
};
