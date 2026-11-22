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
const config = seriesConfig(
  harian,
  {
    slug: 'SpreadEmas',
    theme: 'ApplePremium',
    lexicon: { Galeri24: 'Galeri dua empat', UBS: 'U B S' },
  },
  [
    // 1 — HOOK: kata menghentak, Rp400.000 menguasai layar sejak 0,75 dtk (lebih cepat dari audio).
    {
      type: 'words',
      background: 'gradient',
      words: [
        { text: 'Beli', at: 0 },
        { text: 'emas', at: 0.2 },
        { text: 'Antam?', at: 0.4 },
        { text: 'Rp400.000', highlight: true, at: 0.75 },
      ],
      flash: false,
      caption: 'Selisih harga beli & buyback · 1 gram',
      narration: 'Baru beli emas Antam satu gram, langsung dijual lagi? Selisihnya bisa empat ratus ribu rupiah!',
      emphasis: ['empat ratus ribu rupiah!'],
    },
    // 2 — SIMULASI: dua batang tumbuh saat disebut; celah merah = selisih; spread menghitung.
    {
      type: 'irisan',
      transition: 'pushCut',
      eyebrow: 'Antam Logam Mulia · 1 gram · 22 Nov 2026',
      title: 'Harga beli vs buyback',
      highlight: 'buyback',
      size: [1000, 1000],
      parts: [
        { shape: 'rect', x: 110, y: 980, w: 780, h: 4, fill: '#2b3447', stroke: false },
        {
          id: 'beli', shape: 'rect', x: 190, y: 600, w: 260, h: 380, r: 18, fill: '#d4af37', stroke: false, hatch: false,
          origin: [320, 980],
          motion: [
            { type: 'scale', to: [1, 0.02], at: 0, duration: 0.01 },
            { type: 'scale', to: [1, 1], at: 'Harga', duration: 1.1 },
          ],
        },
        {
          id: 'buyback', shape: 'rect', x: 550, y: 661, w: 260, h: 319, r: 18, fill: '#8f7d4c', stroke: false, hatch: false,
          origin: [680, 980],
          motion: [
            { type: 'scale', to: [1, 0.02], at: 0, duration: 0.01 },
            { type: 'scale', to: [1, 1], at: 'jual', duration: 1.1 },
          ],
        },
        { id: 'celah', shape: 'rect', x: 550, y: 600, w: 260, h: 61, r: 10, fill: '#ef4444', stroke: '#ef4444', hatch: true, opacity: 0.9, hidden: true, showAt: 'Itulah' },
        { shape: 'rect', x: 450, y: 598, w: 360, h: 4, fill: '#d4af37', stroke: false, opacity: 0.7, hidden: true, showAt: 'Itulah' },
      ],
      panel: {
        title: 'Simulasi beli lalu jual hari yang sama',
        rows: [
          { label: 'Harga beli', dot: '#d4af37', value: 0, to: 2495000, prefix: 'Rp', at: 'Harga', showAt: 'Harga', duration: 1.1 },
          { label: 'Buyback', dot: '#8f7d4c', value: 0, to: 2095000, prefix: 'Rp', at: 'jual', showAt: 'jual', duration: 1.1 },
          { label: 'Selisih', dot: '#ef4444', value: 0, to: 400000, prefix: 'Rp', at: 'Itulah', showAt: 'Itulah', duration: 0.8, color: '#ef4444' },
          { label: 'Spread', text: '16,03%', showAt: 'spread', color: '#d4af37' },
        ],
        note: 'Data referensi · perlu verifikasi',
      },
      narration:
        'Harga belinya dua juta empat ratus sembilan puluh lima ribu. Tapi harga jual kembalinya cuma dua juta sembilan puluh lima ribu. Itulah yang disebut spread.',
      emphasis: ['spread.'],
    },
    // 3 — SPREAD: batang horizontal proporsional, tersingkap bergiliran; Antam disorot.
    {
      type: 'chart',
      transition: 'wipeUp',
      background: 'pattern',
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
      highlightLabel: 'Paling lebar',
      suffix: '%',
      decimals: 2,
      subtitle: 'Makin pendek makin hemat · data referensi',
      narration:
        'Galeri24, sekitar enam persen. Hartadinata, enam persen. UBS, hampir delapan persen. Sementara Antam Logam Mulia, lebih dari enam belas persen!',
      emphasis: ['lebih dari enam belas persen!'],
    },
    // 4 — EMAS DUNIA: perubahan % dari 16 Nov (skala 30 unit = 1%), dua titik per garis, tanpa data harian rekaan.
    {
      type: 'irisan',
      transition: 'slideLeft',
      eyebrow: 'US$ per troy ounce · 16–20 Nov 2026',
      title: 'Emas dunia terkoreksi',
      highlight: 'terkoreksi',
      size: [1000, 1000],
      parts: [
        { shape: 'rect', x: 100, y: 379, w: 800, h: 2, fill: '#3a4356', stroke: false },
        { shape: 'rect', x: 100, y: 529, w: 800, h: 2, fill: '#3a4356', stroke: false, opacity: 0.5 },
        { shape: 'rect', x: 100, y: 679, w: 800, h: 2, fill: '#3a4356', stroke: false, opacity: 0.5 },
        {
          id: 'dunia', shape: 'poly', points: [[160, 380], [840, 633]], closed: false, stroke: '#ef4444', strokeWidth: 12,
          origin: [160, 380],
          motion: [
            { type: 'scale', to: 0.01, at: 0, duration: 0.01 },
            { type: 'scale', to: 1, at: 'terkoreksi', duration: 1.3 },
          ],
        },
        {
          id: 'antam', shape: 'poly', points: [[160, 380], [840, 412]], closed: false, stroke: '#d4af37', strokeWidth: 12,
          origin: [160, 380], hidden: true, showAt: 'Indonesia',
          motion: [
            { type: 'scale', to: 0.01, at: 0, duration: 0.01 },
            { type: 'scale', to: 1, at: 'Indonesia', duration: 1.1 },
          ],
        },
        { shape: 'circle', x: 160, y: 380, r: 18, fill: '#f7f3ea', stroke: false },
        { shape: 'circle', x: 840, y: 633, r: 20, fill: '#ef4444', stroke: false, glow: true, hidden: true, showAt: 'delapan' },
        { shape: 'circle', x: 840, y: 412, r: 18, fill: '#d4af37', stroke: false, hidden: true, showAt: 'turun' },
      ],
      labels: [
        { target: [160, 380], text: '16 Nov · US$3.869', at: 0.3, hideAt: 'Indonesia', side: 'right' },
        { target: [840, 633], text: '20 Nov · US$3.544', color: '#ef4444', at: 'delapan', side: 'left' },
        { target: [840, 412], text: 'Antam LM −1,07% (16–22 Nov)', color: '#d4af37', at: 'turun', side: 'left' },
      ],
      stamp: { text: '−8,42%', color: '#ef4444', rotate: -4, target: [480, 735], at: 'delapan' },
      note: 'Perubahan sejak 16 Nov · dua titik data · data referensi',
      narration:
        'Di pasar dunia, emas juga terkoreksi sekitar delapan persen dalam sepekan. Tapi kenapa harga emas di Indonesia tidak turun sebesar itu?',
      emphasis: ['tidak turun sebesar itu?'],
    },
    // 5 — THE RUPIAH FACTOR: tiga faktor muncul bergiliran.
    {
      type: 'features',
      transition: 'zoom',
      background: 'particles',
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
      transition: 'slideUp',
      background: 'pattern',
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
      transition: 'wipe',
      background: 'gradient',
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
    // 8 — CLOSING: satu pesan; cap "CEK SPREAD" menghentak saat diucapkan di atas batang emas.
    {
      type: 'irisan',
      transition: 'fade',
      title: 'Beli emas?',
      subtitle: 'Harga beli • Buyback • Biaya',
      size: [1000, 640],
      parts: [
        {
          id: 'batang', shape: 'poly', points: [[230, 560], [770, 560], [680, 360], [320, 360]], fill: '#d4af37', stroke: '#b8862f', strokeWidth: 6, hatch: false,
          motion: [{ type: 'bob', amount: 6, period: 3 }],
        },
        { shape: 'poly', points: [[340, 390], [660, 390], [645, 375], [355, 375]], fill: '#f5d77a', stroke: false, opacity: 0.8, motion: [{ type: 'bob', amount: 6, period: 3 }] },
      ],
      stamp: { text: 'CEK SPREAD', color: '#d4af37', rotate: -3, target: [500, 200], at: 'Cek' },
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
  // HUD atas sudah menampilkan brand; watermark bawah dihapus agar tidak ganda.
  watermark: false,
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
      // Kata aktif subtitle: putih lembut, bukan emas — emas khusus angka/kata penting.
      highlight: 'rgba(247,243,234,0.18)',
      onHighlight: '#ffffff',
    },
    gradient: 'linear-gradient(120deg, #f5d77a 0%, #d4af37 50%, #b8862f 100%)',
    shadow: { elevated: '0 40px 120px rgba(212,175,55,0.22)' },
  },
};
