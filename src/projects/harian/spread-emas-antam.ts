import { seriesConfig } from '../../templates';
import { harian } from './series';

/**
 * Spread emas 1 gram: Antam (Logam Mulia) vs UBS, Hartadinata EMASKU, Galeri24 — Reels 9:16.
 * Narasi: `npm run narasi -- spread-emas-antam-comparison` (Edge TTS).
 *
 * DATA (snapshot dari pengguna — DATA REFERENSI, BELUM terverifikasi ke sumber resmi):
 *   Antam LM     22 Nov 2026  beli 2.495.000  buyback 2.095.000  selisih 400.000  spread 16,03%
 *   UBS (G24)    22 Nov 2026  beli 2.357.000  buyback 2.171.000  selisih 186.000  spread  7,89%
 *   Hartadinata  21 Nov 2026  beli 2.258.000  buyback 2.122.000  selisih 136.000  spread  6,02%
 *   Galeri24     22 Nov 2026  beli 2.334.000  buyback 2.195.000  selisih 139.000  spread  5,96%
 *   Emas dunia 16→20 Nov 2026: US$3.869,30 → US$3.543,60 per troy ounce (−8,42%)
 *   Antam LM   16→22 Nov 2026: Rp2.522.000 → Rp2.495.000 (−1,07%)
 * Spread = (harga beli − buyback) / harga beli × 100%. Belum termasuk pajak & biaya; bukan real-time.
 * Sumber cek: logammulia.com · galeri24.co.id/harga-emas · hrtagold.id/en/gold-price
 */
const REF = 'Data referensi, perlu verifikasi';

const config = seriesConfig(
  harian,
  {
    slug: 'SpreadEmas',
    theme: 'ApplePremium',
    lexicon: { Galeri24: 'Galeri dua empat', UBS: 'U B S' },
  },
  [
    // 1 — THE SHOCK: tipografi hentak, angka kerugian dominan.
    {
      type: 'hero',
      illustration: '🪙',
      title: 'Beli Antam 1 gram? Langsung minus Rp400.000',
      highlight: 'Rp400.000',
      subtitle: 'Simulasi jual kembali hari yang sama',
      textAnimation: 'slam',
      highlightStyle: 'underline',
      narration:
        'Bayangin, baru beli emas Antam satu gram, kalau langsung dijual lagi, selisihnya bisa empat ratus ribu rupiah!',
      emphasis: ['empat ratus ribu rupiah!'],
    },
    // 2 — SPREAD EXPLAINED: kalkulasi berurutan beli → buyback → selisih.
    {
      type: 'calculation',
      transition: 'pushCut',
      eyebrow: 'Antam Logam Mulia · 1 gram · 22 Nov 2026',
      title: 'Harga beli vs buyback',
      highlight: 'buyback',
      lines: [
        { label: 'Harga beli', value: 2495000 },
        { label: 'Buyback', value: 2095000, negative: true },
      ],
      total: { label: 'Selisih', value: 400000 },
      prefix: 'Rp',
      note: 'Spread 16,03% dari harga beli',
      subtitle: REF,
      narration:
        'Harga belinya dua juta empat ratus sembilan puluh lima ribu. Tapi harga jual kembalinya cuma dua juta sembilan puluh lima ribu. Itulah yang disebut spread.',
      emphasis: ['spread.'],
    },
    // 3 — THE COMPARISON: batang proporsional, Antam disorot.
    {
      type: 'chart',
      transition: 'wipeUp',
      orientation: 'horizontal',
      eyebrow: 'Snapshot 21–22 Nov 2026',
      title: 'Spread emas 1 gram',
      highlight: 'Spread',
      data: [
        { label: 'Galeri24', value: 5.96 },
        { label: 'Hartadinata (21 Nov)', value: 6.02 },
        { label: 'UBS', value: 7.89 },
        { label: 'Antam LM', value: 16.03 },
      ],
      highlightBar: 3,
      highlightLabel: 'Tertinggi',
      suffix: '%',
      decimals: 2,
      subtitle: 'Hartadinata 21 Nov, lainnya 22 Nov · ' + REF,
      narration:
        'Galeri24, sekitar enam persen. Hartadinata, enam persen. UBS, hampir delapan persen. Sementara Antam Logam Mulia, lebih dari enam belas persen!',
      emphasis: ['lebih dari enam belas persen!'],
    },
    // 4 — GLOBAL GOLD CORRECTION: hanya dua titik (tanpa data antara).
    {
      type: 'chart',
      transition: 'slideLeft',
      orientation: 'vertical',
      eyebrow: 'US$ per troy ounce · 16–20 Nov 2026',
      title: 'Emas dunia terkoreksi',
      highlight: 'terkoreksi',
      data: [
        { label: '16 Nov', value: 3869.3 },
        { label: '20 Nov', value: 3543.6 },
      ],
      highlightBar: 1,
      highlightLabel: 'Turun 8,42%',
      prefix: 'US$',
      decimals: 0,
      subtitle: 'Antam LM 16–22 Nov: −1,07% · ' + REF,
      narration:
        'Di pasar dunia, emas juga terkoreksi sekitar delapan persen dalam sepekan. Tapi kenapa harga emas di Indonesia tidak turun sebesar itu?',
      emphasis: ['tidak turun sebesar itu?'],
    },
    // 5 — THE RUPIAH FACTOR: tiga faktor muncul bergiliran.
    {
      type: 'features',
      transition: 'iris',
      title: 'Kenapa harga lokal beda?',
      highlight: 'beda',
      features: [
        { icon: '🌍', title: 'Harga emas dunia', description: 'Acuan dalam dolar AS' },
        { icon: '💱', title: 'Kurs dolar/rupiah', description: 'Dikonversi ke rupiah' },
        { icon: '🏷️', title: 'Premi & spread', description: 'Kebijakan harga tiap penjual' },
      ],
      subtitle: 'Emas global ≠ harga ritel',
      narration:
        'Karena harga lokal bukan cuma ikut pasar dunia. Kurs dolar terhadap rupiah, ditambah premi dan kebijakan penjual, juga ikut menentukan.',
      emphasis: ['Kurs dolar terhadap rupiah,'],
    },
    // 6 — BUYBACK REALITY: dua transaksi berdampingan (beda dari kalkulasi scene 2).
    {
      type: 'comparison',
      transition: 'flip',
      eyebrow: 'Emas 1 gram',
      title: 'Jangan cuma lihat harga beli',
      highlight: 'harga beli',
      columns: ['Galeri24', 'Hartadinata'],
      rows: [
        { label: 'Harga beli', values: ['Rp2.334.000', 'Rp2.258.000'] },
        { label: 'Buyback', values: ['Rp2.195.000', 'Rp2.122.000'] },
        { label: 'Selisih', values: ['Rp139.000', 'Rp136.000'] },
      ],
      subtitle: 'Galeri24 22 Nov · Hartadinata 21 Nov 2026',
      narration:
        'Yang penting bukan cuma harga beli, tapi berapa uang yang kembali saat dijual. Di sini, selisih Hartadinata dan Galeri24 jauh lebih kecil.',
      emphasis: ['jauh lebih kecil.'],
    },
    // 7 — THE VERDICT: tiga putusan, angka menghitung.
    {
      type: 'stats',
      transition: 'zoom',
      title: 'Mana paling worth it?',
      highlight: 'worth it?',
      stats: [
        { value: 5.96, suffix: '%', decimals: 2, label: 'Galeri24 · spread terendah' },
        { value: 2258000, prefix: 'Rp', label: 'Hartadinata · harga beli terendah' },
        { value: 2495000, prefix: 'Rp', label: 'Antam LM · premi lebih tinggi' },
      ],
      subtitle: 'Belum termasuk pajak & biaya · bukan harga real-time',
      narration:
        'Kalau cari efisiensi, Galeri24 unggul tipis di persentase spread. Hartadinata paling murah harga belinya. Antam tetap populer, tapi preminya lebih tinggi.',
      emphasis: ['unggul tipis'],
    },
    // 8 — CLOSING: tipografi minimal, sorot SPREAD.
    {
      type: 'cta',
      transition: 'fade',
      title: 'Beli emas? Cek spread dulu.',
      highlight: 'spread',
      subtitle: 'Harga beli • Buyback • Biaya',
      button: 'Simpan video ini',
      textAnimation: 'pop',
      narration: 'Jadi sebelum beli emas, jangan cuma lihat mereknya. Cek spread dan harga jual kembalinya!',
      emphasis: ['Cek spread'],
    },
  ],
  { hudLabel: 'Emas' },
);

/** Palet editorial premium (navy/charcoal, emas metalik, putih hangat, hijau zamrud, merah sinyal). */
export default {
  ...config,
  id: 'spread-emas-antam-comparison',
  themeOverrides: {
    colors: {
      background: '#0a0f1c',
      backgroundAlt: '#121826',
      primary: '#d4af37',
      secondary: '#b8862f',
      accent: '#10b981',
      text: '#f7f3ea',
      onPrimary: '#1a1408',
      muted: '#9aa3b2',
      success: '#10b981',
      danger: '#ef4444',
    },
    gradient: 'linear-gradient(120deg, #f5d77a 0%, #d4af37 50%, #b8862f 100%)',
    shadow: { elevated: '0 40px 120px rgba(212,175,55,0.22)' },
  },
};
