import { seriesConfig } from '../../templates';
import { harian } from './series';

/**
 * Rupiah Rp18.400 per Dolar, Apa Dampaknya bagi Kita? — Reels/Shorts/TikTok 9:16, ±60 dtk, bernarasi (Edge TTS).
 * Naskah & alasan penyesuaian brief: naskah/harian/rupiah-18400.md.
 * Narasi: `npm run narasi -- Harian-Rupiah18400` · Render: workflow "Narasi & Render" (video = Harian-Rupiah18400).
 *
 * DATA (dari brief pengguna; situs sumber tidak bisa dibuka dari sesi cloud → BELUM diverifikasi independen):
 *   Kurs 26 Nov 2026: tertinggi intraday Rp18.400/US$, penutupan Rp18.364      — IDX Channel, 27 Nov 2026
 *   BI-Rate 5,75% → 6,00% (+25 bps), RDG 18 Nov 2026, + intervensi valas       — Bank Indonesia, 18 Nov 2026
 *   Faktor pelemahan: geopolitik, minyak, ekspektasi bunga AS, arus modal keluar — TKM BI November 2026
 * SIMULASI (hitungan kami, bukan data historis; harga US$100 dianggap tetap):
 *   US$100 × Rp16.000 = Rp1.600.000 · US$100 × Rp18.400 = Rp1.840.000 · selisih Rp240.000 = 15,0% dari Rp1.600.000
 * Dampak scene 5–7 = POTENSI (bukan kepastian), tanpa sinyal beli/jual.
 */
const config = seriesConfig(
  harian,
  {
    slug: 'Rupiah18400',
    lexicon: { 'BI-Rate': 'Be I Ret', SBN: 'Es Be En', KPR: 'Ka Pe Er' },
  },
  [
    // 1 — HOOK (fakta): angka kurs = fokus, tampil penuh < 0,5 dtk. Penutupan dibedakan di pil pembanding.
    {
      type: 'stats',
      masuk: 'cepat',
      transition: 'fade',
      eyebrow: 'Kurs · 26 November 2026',
      title: 'Rupiah tembus',
      highlight: 'tembus',
      stats: [
        {
          value: 18400,
          prefix: 'Rp',
          label: 'per US$1 · tertinggi intraday',
          pembanding: 'Ditutup Rp18.364',
          at: 0,
        },
      ],
      note: 'Sumber: IDX Channel, 27 Nov 2026',
      narration: 'Rupiah tembus delapan belas ribu empat ratus per dolar!',
      emphasis: ['delapan belas ribu empat ratus'],
    },
    // 2 — PENYEBAB (konteks): peta dunia — pin Jakarta & New York, rute "modal keluar" tergambar + titik mengalir.
    {
      type: 'map',
      transition: 'slideLeft',
      eyebrow: 'Konteks · TKM BI November 2026',
      title: 'Kenapa rupiah melemah?',
      highlight: 'melemah?',
      subtitle: 'Geopolitik & minyak mahal → dolar diburu',
      region: 'world',
      countries: ['Indonesia', 'United States of America'],
      points: [
        { place: 'Jakarta', label: 'Rupiah', value: 'tertekan', icon: '📉', at: 0.4 },
        { place: 'New York', label: 'Bunga AS', value: 'diprediksi naik', icon: '🏦', at: 'bunga' },
      ],
      routes: [{ from: 0, to: 1, at: 'Modal' }],
      narration:
        'Geopolitik tak pasti, minyak mahal, bunga Amerika diprediksi naik. Modal asing keluar, rupiah tertekan.',
      emphasis: ['rupiah tertekan.'],
    },
    // 3 — RESPONS BI (fakta): garis BI-Rate 5,75% → 6,00% tergambar saat disebut.
    // "Sejak 18 November" = keputusan SEBELUM kurs menyentuh Rp18.400. Hanya 2 titik data nyata (tanpa titik rekaan).
    {
      type: 'tren',
      transition: 'wipeUp',
      eyebrow: 'Fakta · RDG BI 18 November 2026',
      title: 'BI naikkan suku bunga',
      highlight: 'suku bunga',
      subtitle: 'Naik 25 bps · plus intervensi valas',
      seri: [
        {
          label: 'BI-Rate',
          titik: [
            { label: 'Sebelum', value: 5.75 },
            { label: '18 Nov', value: 6 },
          ],
          at: 'BI-Rate',
        },
      ],
      suffix: '%',
      decimals: 2,
      note: 'Sumber: Bank Indonesia, 18 Nov 2026',
      narration:
        'Sejak delapan belas November, BI-Rate sudah naik ke enam persen, plus intervensi valas.',
      emphasis: ['enam persen,'],
    },
    // 4 — SIMULASI (hitungan kami): dua batang dari nol, celah merah = biaya tambahan.
    {
      type: 'selisih',
      transition: 'pushCut',
      eyebrow: 'Simulasi · bukan data historis',
      title: 'Dampak ke dompet',
      highlight: 'dompet',
      subtitle: 'Barang impor seharga US$100',
      a: { label: 'Kurs Rp16.000', value: 1600000, at: 'satu koma enam' },
      b: { label: 'Kurs Rp18.400', value: 1840000, at: 'satu koma delapan' },
      prefix: 'Rp',
      arah: 'naik-buruk',
      selisihLabel: 'Lebih mahal',
      selisihAt: 'lima belas persen',
      persenDecimals: 0,
      note: 'Asumsi: harga dolar barang tetap',
      narration:
        'Barang impor seratus dolar: dari satu koma enam juta, jadi satu koma delapan empat juta. Lima belas persen lebih mahal, menekan daya beli.',
      emphasis: ['Lima belas persen'],
    },
    // 5 — KREDIT vs SIMPANAN (potensi): ilustrasi rumah (peminjam) vs tumpukan koin (penabung);
    // panah naik merah/hijau muncul saat disebut. Bunga tetap disebut tidak langsung terdampak.
    {
      type: 'irisan',
      transition: 'slideUp',
      eyebrow: 'Potensi dampak',
      title: 'Cicilan vs simpanan',
      highlight: 'simpanan',
      subtitle: 'Bunga tetap: tidak langsung naik',
      size: [1000, 900],
      parts: [
        { shape: 'rect', x: 60, y: 820, w: 880, h: 6, r: 3, fill: '#CBD5E1', stroke: false },
        // Rumah (peminjam / KPR)
        { shape: 'rect', x: 150, y: 620, w: 240, h: 200, r: 6, fill: '#F1F5F9', stroke: '#0B1220', strokeWidth: 6, hatch: false },
        { shape: 'poly', points: [[120, 630], [270, 500], [420, 630]], fill: '#475569', stroke: '#0B1220', strokeWidth: 6, hatch: false },
        { shape: 'rect', x: 240, y: 710, w: 60, h: 110, r: 4, fill: '#D97706', stroke: '#0B1220', strokeWidth: 5, hatch: false },
        { shape: 'rect', x: 175, y: 660, w: 45, h: 40, r: 4, fill: '#BFDBFE', stroke: '#0B1220', strokeWidth: 4, hatch: false },
        { shape: 'rect', x: 320, y: 660, w: 45, h: 40, r: 4, fill: '#BFDBFE', stroke: '#0B1220', strokeWidth: 4, hatch: false },
        {
          id: 'panah-kredit', shape: 'poly',
          points: [[245, 470], [295, 470], [295, 350], [335, 350], [270, 260], [205, 350], [245, 350]],
          fill: 'danger', stroke: false, hatch: false, origin: [270, 470],
          motion: [
            { type: 'scale', to: 0.01, at: 0, duration: 0.01 },
            { type: 'scale', to: 1, at: 'mengambang', duration: 0.6 },
            { type: 'bob', amount: 8, period: 1.6 },
          ],
        },
        // Tumpukan koin (penabung / deposito)
        { shape: 'ellipse', x: 740, y: 800, rx: 110, ry: 26, fill: '#F59E0B', stroke: '#B45309', strokeWidth: 5, hatch: false },
        { shape: 'ellipse', x: 740, y: 765, rx: 110, ry: 26, fill: '#F59E0B', stroke: '#B45309', strokeWidth: 5, hatch: false },
        { shape: 'ellipse', x: 740, y: 730, rx: 110, ry: 26, fill: '#FBBF24', stroke: '#B45309', strokeWidth: 5, hatch: false },
        {
          shape: 'ellipse', x: 740, y: 695, rx: 110, ry: 26, fill: '#FBBF24', stroke: '#B45309', strokeWidth: 5, hatch: false,
          hidden: true, showAt: 'deposito', origin: [740, 695],
          motion: [{ type: 'move', to: [0, -60], at: 0, duration: 0.01 }, { type: 'move', to: [0, 0], at: 'deposito', duration: 0.5 }],
        },
        {
          id: 'panah-deposito', shape: 'poly',
          points: [[715, 600], [765, 600], [765, 480], [805, 480], [740, 390], [675, 480], [715, 480]],
          fill: 'success', stroke: false, hatch: false, origin: [740, 600],
          motion: [
            { type: 'scale', to: 0.01, at: 0, duration: 0.01 },
            { type: 'scale', to: 1, at: 'menarik', duration: 0.6 },
            { type: 'bob', amount: 8, period: 1.6 },
          ],
        },
      ],
      labels: [
        { target: [335, 400], text: 'KPR floating', color: 'danger', at: 'mengambang', side: 'right' },
        { target: [630, 780], text: 'Deposito', color: 'success', at: 'menarik', side: 'left' },
      ],
      narration: 'Bunga kredit mengambang berpotensi naik, bunga deposito bisa lebih menarik.',
      emphasis: ['berpotensi naik'],
    },
    // 6 — BISNIS (potensi): satu sebab bercabang dua — hijau berpotensi untung, merah tertekan.
    {
      type: 'alur',
      transition: 'zoom',
      eyebrow: 'Potensi dampak',
      title: 'Siapa untung, siapa tertekan?',
      highlight: 'tertekan?',
      simpul: [
        { text: 'Rupiah melemah', icon: '💱', at: 0.3 },
        { text: 'Eksportir', icon: '📦', panah: 'bisa untung', warna: 'success', at: 'Eksportir' },
      ],
      cabang: { dari: 0, text: 'Importir & utang dolar', icon: '🏭', panah: 'biaya naik', warna: 'danger', at: 'importir' },
      subtitle: 'Paling rentan: utang dolar tanpa lindung nilai',
      narration:
        'Eksportir berpotensi untung. Importir dan perusahaan berutang dolar tanpa lindung nilai, tertekan biaya.',
      emphasis: ['tertekan biaya.'],
    },
    // 7 — INVESTASI (potensi): tiga baris ilustrasi bergerak saat disebut; tanpa sinyal beli/jual.
    //   Saham = candlestick bergetar · SBN = jungkat-jungkit (yield ↑, harga lama ↓) · Emas = batang emas + panah naik.
    {
      type: 'irisan',
      transition: 'slideRight',
      eyebrow: 'Potensi dampak · bukan ajakan beli/jual',
      title: 'Bagaimana dengan investasi?',
      highlight: 'investasi?',
      size: [1000, 1400],
      parts: [
        // Pemisah baris
        { shape: 'rect', x: 80, y: 785, w: 840, h: 3, fill: '#E2E8F0', stroke: false },
        { shape: 'rect', x: 80, y: 1100, w: 840, h: 3, fill: '#E2E8F0', stroke: false },
        // SAHAM — candlestick bergetar saat "bergejolak"
        {
          shape: 'group',
          origin: [250, 650],
          motion: [{ type: 'shake', amount: 7, at: 'bergejolak', stopAt: 'SBN' }],
          children: [
            { shape: 'rect', x: 108, y: 630, w: 4, h: 110, fill: '#16A34A', stroke: false },
            { shape: 'rect', x: 95, y: 650, w: 30, h: 70, r: 4, fill: '#16A34A', stroke: false },
            { shape: 'rect', x: 178, y: 600, w: 4, h: 130, fill: '#DC2626', stroke: false },
            { shape: 'rect', x: 165, y: 620, w: 30, h: 90, r: 4, fill: '#DC2626', stroke: false },
            { shape: 'rect', x: 248, y: 560, w: 4, h: 150, fill: '#16A34A', stroke: false },
            { shape: 'rect', x: 235, y: 580, w: 30, h: 110, r: 4, fill: '#16A34A', stroke: false },
            { shape: 'rect', x: 318, y: 610, w: 4, h: 140, fill: '#DC2626', stroke: false },
            { shape: 'rect', x: 305, y: 635, w: 30, h: 90, r: 4, fill: '#DC2626', stroke: false },
            { shape: 'rect', x: 388, y: 550, w: 4, h: 160, fill: '#16A34A', stroke: false },
            { shape: 'rect', x: 375, y: 570, w: 30, h: 115, r: 4, fill: '#16A34A', stroke: false },
          ],
        },
        // SBN — jungkat-jungkit: sisi yield (kiri) naik, sisi harga (kanan) turun saat "turun"
        { shape: 'poly', points: [[250, 970], [210, 1045], [290, 1045]], fill: '#475569', stroke: '#0B1220', strokeWidth: 4, hatch: false },
        {
          shape: 'group',
          origin: [250, 965],
          motion: [{ type: 'turn', to: 14, at: 'turun', duration: 0.8 }],
          children: [
            { shape: 'rect', x: 70, y: 958, w: 360, h: 14, r: 7, fill: '#0B1220', stroke: false },
            { id: 'sbn-yield', shape: 'rect', x: 80, y: 898, w: 70, h: 60, r: 8, fill: '#D97706', stroke: '#0B1220', strokeWidth: 4, hatch: false },
            { id: 'sbn-harga', shape: 'rect', x: 350, y: 898, w: 70, h: 60, r: 8, fill: '#DC2626', stroke: '#0B1220', strokeWidth: 4, hatch: false },
          ],
        },
        // EMAS — batang emas bergoyang pelan + panah naik saat "terdorong"
        {
          shape: 'poly', points: [[90, 1360], [350, 1360], [310, 1260], [130, 1260]], fill: '#F59E0B', stroke: '#B45309', strokeWidth: 6, hatch: false,
          motion: [{ type: 'bob', amount: 5, period: 2.4 }],
        },
        { shape: 'poly', points: [[150, 1280], [290, 1280], [280, 1268], [160, 1268]], fill: '#FDE68A', stroke: false, opacity: 0.9, motion: [{ type: 'bob', amount: 5, period: 2.4 }] },
        {
          shape: 'poly', points: [[385, 1360], [425, 1360], [425, 1250], [460, 1250], [405, 1160], [350, 1250], [385, 1250]],
          fill: 'success', stroke: false, hatch: false, origin: [405, 1360],
          motion: [
            { type: 'scale', to: 0.01, at: 0, duration: 0.01 },
            { type: 'scale', to: 1, at: 'terdorong', duration: 0.6 },
            { type: 'bob', amount: 8, period: 1.6 },
          ],
        },
      ],
      labels: [
        { target: [440, 650], text: 'Saham: volatil', at: 'Saham', side: 'right' },
        { target: [450, 940], text: 'SBN lama: harga ↓', color: 'danger', at: 'turun', side: 'right' },
        { target: [480, 1290], text: 'Emas rupiah ↑', color: 'success', at: 'terdorong', side: 'right' },
      ],
      narration: 'Saham bergejolak. Harga SBN lama bisa turun saat imbal hasil naik. Emas rupiah ikut terdorong.',
      emphasis: ['bisa turun'],
    },
    // 8 — STRATEGI: tiga langkah berurutan.
    {
      type: 'timeline',
      transition: 'wipe',
      title: 'Jangan panik. Siapkan strategi.',
      highlight: 'strategi.',
      steps: [
        { icon: '💧', title: 'Jaga arus kas' },
        { icon: '🛟', title: 'Siapkan dana darurat' },
        { icon: '⚖️', title: 'Kelola risiko investasi & utang', at: 'risiko' },
      ],
      narration: 'Jangan panik. Jaga arus kas, siapkan dana darurat, kelola risiko investasi dan utang.',
      emphasis: ['Jangan panik.'],
    },
    // 9 — PENUTUP: pernyataan penutup brief = judul CTA (satu scene, hemat durasi).
    {
      type: 'cta',
      transition: 'fade',
      title: 'Pahami ekonomi, bukan sekadar berita.',
      highlight: 'ekonomi,',
      button: 'Follow',
      narration: 'Pahami ekonomi, bukan sekadar berita.',
    },
  ],
  { hudLabel: 'Ekonomi' },
);

/**
 * Palet editorial finansial TERANG (permintaan pengguna: latar putih). Teks navy #0B1220; amber digelapkan (#D97706)
 * agar angka & sorotan terbaca di putih; merah = pelemahan/biaya, hijau = positif.
 */
export default {
  ...config,
  // Latar polos putih di semua scene (gradien/pola seri memberi rona amber/krem).
  scenes: config.scenes.map((s) => ({ ...s, background: 'solid' as const })),
  // HUD atas sudah menampilkan brand; watermark bawah dihapus agar tidak ganda.
  watermark: false,
  themeOverrides: {
    mode: 'light' as const,
    colors: {
      background: '#FFFFFF',
      backgroundAlt: '#F1F5F9',
      surface: '#FFFFFF',
      surfaceAlt: '#F8FAFC',
      border: '#E2E8F0',
      primary: '#D97706',
      secondary: '#F59E0B',
      accent: '#D97706',
      text: '#0B1220',
      onPrimary: '#FFFFFF',
      muted: '#475569',
      success: '#16A34A',
      danger: '#DC2626',
      // Kata aktif subtitle: sorotan amber muda, teks tetap navy.
      highlight: 'rgba(251,191,36,0.35)',
      onHighlight: '#0B1220',
    },
    gradient: 'linear-gradient(120deg, #F59E0B 0%, #D97706 55%, #B45309 100%)',
    shadow: { card: '0 10px 30px rgba(11,18,32,0.08)', elevated: '0 24px 60px rgba(217,119,6,0.14)' },
    // Editorial: judul naik dari balik garis (bukan menghentak), energi sedang.
    motion: { text: 'rise' as const },
  },
};
