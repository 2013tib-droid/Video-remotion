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
    // 2 — PENYEBAB (konteks): 4 faktor muncul saat disebut; rantai dolar → rupiah di subjudul.
    {
      type: 'features',
      transition: 'slideLeft',
      eyebrow: 'Konteks · TKM BI November 2026',
      title: 'Kenapa rupiah melemah?',
      highlight: 'melemah?',
      features: [
        { icon: '🌍', title: 'Ketidakpastian geopolitik' },
        { icon: '🛢️', title: 'Harga minyak tinggi' },
        { icon: '🏦', title: 'Bunga AS diprediksi naik' },
        { icon: '💸', title: 'Modal asing keluar', at: 'Modal' },
      ],
      subtitle: 'Dolar diburu → rupiah tertekan',
      narration:
        'Geopolitik tak pasti, minyak mahal, bunga Amerika diprediksi naik. Modal asing keluar, rupiah tertekan.',
      emphasis: ['rupiah tertekan.'],
    },
    // 3 — RESPONS BI (fakta): kisi 2 angka. "Sejak 18 November" = keputusan SEBELUM kurs menyentuh Rp18.400.
    {
      type: 'stats',
      transition: 'wipeUp',
      eyebrow: 'Fakta · RDG BI 18 November 2026',
      title: 'BI naikkan suku bunga',
      highlight: 'suku bunga',
      stats: [
        { value: 6, decimals: 2, suffix: '%', label: 'BI-Rate, dari 5,75%', at: 'enam persen' },
        { value: 25, suffix: ' bps', label: 'Kenaikan', at: 'intervensi' },
      ],
      subtitle: 'Plus intervensi pasar valas',
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
    // 5 — KREDIT vs SIMPANAN (potensi): dua sisi berdampingan; bunga tetap disebut tidak langsung terdampak.
    {
      type: 'comparison',
      transition: 'slideUp',
      eyebrow: 'Potensi dampak',
      title: 'Cicilan vs simpanan',
      highlight: 'simpanan',
      columns: ['Peminjam', 'Penabung'],
      rows: [
        { label: 'Bunga', values: ['Berpotensi naik', 'Berpotensi naik'], at: 'kredit' },
        { label: 'Terdampak', values: ['KPR floating', 'Deposito baru'], at: 'deposito' },
      ],
      subtitle: 'Bunga tetap: tidak langsung naik',
      narration:
        'Bunga kredit mengambang berpotensi naik, bunga deposito bisa lebih menarik.',
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
    // 7 — INVESTASI (potensi): tiga kartu bergantian; tanpa sinyal beli/jual.
    {
      type: 'features',
      transition: 'slideRight',
      eyebrow: 'Potensi dampak · bukan ajakan beli/jual',
      title: 'Bagaimana dengan investasi?',
      highlight: 'investasi?',
      columns: 1,
      features: [
        { icon: '📈', title: 'Saham', description: 'Volatilitas & biaya modal naik' },
        { icon: '🏛️', title: 'SBN', description: 'Yield naik, harga seri lama turun' },
        { icon: '🥇', title: 'Emas', description: 'Harga rupiah terdorong kurs' },
      ],
      narration:
        'Saham bergejolak. Harga SBN lama bisa turun saat imbal hasil naik. Emas rupiah ikut terdorong.',
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
