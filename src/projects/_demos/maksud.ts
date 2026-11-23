import { kontenHarian } from '../../templates';
import { harian } from '../harian/series';
import spreadEmas from '../harian/spread-emas-antam';

/**
 * DEMO MAKSUD (Fase 3): data spread emas yang sama dengan `Demo-DataViz`, ditulis HANYA dengan `maksud` + pola hook —
 * tanpa nama tipe scene. Template memilih visualnya (lihat tabel di docs/KATALOG-SCENE.md → Maksud & hook).
 * Data = snapshot dari pengguna (DATA REFERENSI, belum terverifikasi; lihat `harian/spread-emas-antam.ts`).
 * Narasi: `npm run narasi -- Demo-Maksud`.
 */
const config = kontenHarian(harian, {
  slug: 'Maksud',
  topik: 'Emas',
  theme: 'ApplePremium',
  lexicon: { Galeri24: 'Galeri dua empat', UBS: 'U B S' },
  hook: { pola: 'angka-konsekuensi', angka: 'Rp400.000', akibat: 'hilang saat dijual lagi' },
  bagian: [
    {
      maksud: 'dua-nilai',
      label: 'Antam LM · 1 gram · 22 Nov 2026',
      judul: 'Harga beli vs buyback',
      highlight: 'buyback',
      data: {
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
    },
    {
      maksud: 'peringkat',
      judul: 'Spread 1 gram, 22 Nov',
      highlight: 'Spread',
      data: {
        item: [
          { label: 'Antam LM', value: 16.03 },
          { label: 'UBS', value: 7.89 },
          { label: 'Hartadinata', value: 6.02 },
          { label: 'Galeri24', value: 5.96 },
        ],
        terbaik: 'rendah',
        suffix: '%',
        decimals: 2,
      },
      narasi: 'Spread terendah Galeri24, lalu Hartadinata, UBS hampir delapan persen, dan Antam LM lebih dari enam belas persen.',
      emphasis: ['lebih dari enam belas persen.'],
    },
    {
      maksud: 'perubahan',
      label: 'Perubahan sejak 16 Nov 2026',
      judul: 'Emas dunia terkoreksi',
      highlight: 'terkoreksi',
      data: {
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
      maksud: 'sebab-akibat',
      judul: 'Kenapa harga lokal beda?',
      highlight: 'beda',
      data: {
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
    { maksud: 'kesimpulan', data: ['Sebelum beli emas,', 'cek spread-nya.'], highlight: 'cek spread-nya.', narasi: 'Sebelum beli emas, cek spread-nya.' },
  ],
});

export default { ...config, id: 'Demo-Maksud', watermark: false, themeOverrides: spreadEmas.themeOverrides };
