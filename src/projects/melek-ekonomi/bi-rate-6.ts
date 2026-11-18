import { outroScene, seriesConfig } from '../../templates';
import { melekEkonomi } from './series';

/**
 * "BI naikkan suku bunga jadi 6% — siapa untung, siapa rugi?" · ±65 dtk · 9:16 · Shorts/TikTok/Reels.
 * Naskah: `naskah/melek-ekonomi/bi-rate-6.md`.
 *
 * Versi 2 (infografis): SATU kalimat narasi = SATU layar dengan SATU pesan (angka besar, sebab → akibat, tabel,
 * layar aplikasi). Versi 1 (dunia 3D) dinilai membingungkan: terlalu banyak benda kecil abstrak bergerak bersamaan.
 * Jenis scene berganti-ganti agar ritmenya tidak monoton.
 *
 * Angka 5,75% → 6%, cicilan Rp4 jt → Rp4,4 jt, kupon 5%: dari brief pengguna (cicilan & kupon = ilustrasi).
 */
export default seriesConfig(
  melekEkonomi,
  { slug: 'BIRate6' },
  [
    // ── SCENE 1 · HOOK ───────────────────────────────────────────────────────────────────────────────
    {
      type: 'words',
      words: [
        { text: 'BREAKING', highlight: true, at: 'Breaking' },
        { text: 'BI Rate', at: 'Bank' },
        { text: 'naik', at: 'menaikkan' },
        { text: '6%', highlight: true, at: 'persen' },
      ],
      caption: 'BI Rate: 5,75% → 6,00%',
      narration: 'Breaking! Bank Indonesia resmi menaikkan suku bunga jadi 6 persen.',
      emphasis: ['Breaking', '6 persen'],
    },
    {
      type: 'features',
      title: 'Siapa paling terdampak?',
      highlight: 'terdampak',
      columns: 2,
      features: [
        { icon: '🏠', title: 'Debitur', description: 'Yang punya cicilan' },
        { icon: '🏦', title: 'Bank', description: 'Pemberi pinjaman' },
        { icon: '📄', title: 'SBN', description: 'Obligasi negara' },
        { icon: '📈', title: 'Saham', description: 'Pasar modal' },
      ],
      narration: 'Tapi, siapa yang sebenarnya paling terdampak?',
      emphasis: ['paling terdampak'],
    },

    // ── SCENE 2 · KENAPA BI NAIKKAN BUNGA ────────────────────────────────────────────────────────────
    {
      type: 'relation',
      eyebrow: 'Kenapa BI menaikkan bunga?',
      title: 'Bunga naik = rem ekonomi',
      highlight: 'rem',
      rows: [
        { left: 'Bunga ↑', verb: 'menahan', right: 'Inflasi', at: 'menahan' },
        { left: 'Bunga ↑', verb: 'menjaga', right: 'Nilai rupiah', at: 'menjaga' },
      ],
      formula: 'TUJUAN: HARGA & RUPIAH STABIL',
      formulaAt: 'rupiah',
      narration: 'BI biasanya menaikkan suku bunga untuk menahan inflasi dan menjaga nilai rupiah.',
      emphasis: ['menahan inflasi', 'nilai rupiah'],
    },
    {
      type: 'timeline',
      title: 'Cara kerja rem bunga',
      highlight: 'rem bunga',
      steps: [
        { icon: '🏦', title: 'Bunga naik', description: 'Pinjam uang jadi lebih mahal' },
        { icon: '💸', title: 'Uang beredar berkurang', description: 'Orang menahan belanja & kredit' },
        { icon: '📊', title: 'Harga lebih stabil', description: 'Inflasi melambat' },
      ],
      narration: 'Caranya, mengurangi uang yang beredar, sehingga harga lebih stabil.',
      emphasis: ['uang yang beredar', 'stabil'],
    },

    // ── SCENE 3 · DEBITUR ────────────────────────────────────────────────────────────────────────────
    {
      type: 'device',
      eyebrow: 'Dampak 1 · Debitur',
      title: 'Bunga mengambang ikut naik',
      highlight: 'ikut naik',
      screen: {
        kind: 'list',
        title: 'Pinjaman saya',
        items: [
          { icon: '🏠', title: 'KPR', subtitle: 'Bunga mengambang', value: '▲ naik' },
          { icon: '🚗', title: 'Kredit mobil', subtitle: 'Bunga mengambang', value: '▲ naik' },
          { icon: '💳', title: 'Kartu kredit', subtitle: 'Bunga mengikuti pasar', value: '▲ naik' },
        ],
      },
      notifications: [{ icon: '🔔', app: 'Bank', title: 'Cicilan bulan ini naik', body: 'Akibat penyesuaian suku bunga' }],
      narration: 'Kalau kamu punya pinjaman berbunga mengambang, cicilan bisa naik.',
      emphasis: ['berbunga mengambang', 'naik'],
    },
    {
      type: 'calculation',
      eyebrow: 'Contoh cicilan per bulan',
      title: 'Beban bulanan bertambah',
      highlight: 'bertambah',
      prefix: 'Rp',
      lines: [
        { label: 'Cicilan sebelumnya', value: 4000000 },
        { label: 'Tambahan karena bunga naik', value: 400000 },
      ],
      total: { label: 'Cicilan sekarang', value: 4400000 },
      note: 'Ilustrasi · naik 10%',
      narration: 'Beban rumah tangga maupun bisnis ikut bertambah.',
      emphasis: ['bertambah'],
    },

    // ── SCENE 4 · BANK / KREDITUR ────────────────────────────────────────────────────────────────────
    {
      type: 'hero',
      eyebrow: 'Dampak 2 · Bank',
      illustration: 'line:bank',
      title: 'Pendapatan bunga bank naik',
      highlight: 'naik',
      subtitle: 'Bunga pinjaman ikut lebih tinggi',
      narration: 'Bank berpotensi memperoleh pendapatan bunga lebih besar.',
      emphasis: ['pendapatan bunga'],
    },
    {
      type: 'features',
      title: 'Untung naik, risiko juga',
      highlight: 'risiko',
      columns: 1,
      features: [
        { icon: 'line:trending-up', title: 'Pendapatan bunga ↑', description: 'Bunga yang diterima bank lebih besar' },
        { icon: 'line:alert', title: 'Risiko gagal bayar ↑', description: 'Sebagian debitur makin berat membayar' },
      ],
      narration: 'Namun risikonya juga meningkat, karena kemampuan bayar sebagian debitur bisa melemah.',
      emphasis: ['risikonya', 'melemah'],
    },

    // ── SCENE 5 · SBN / OBLIGASI ─────────────────────────────────────────────────────────────────────
    {
      type: 'relation',
      eyebrow: 'Dampak 3 · Obligasi',
      title: 'Bunga naik, harga obligasi turun',
      highlight: 'turun',
      rows: [{ left: 'Suku bunga ↑', verb: 'membuat', right: 'Harga obligasi lama ↓', at: 'harga' }],
      formula: 'OBLIGASI LAMA · KUPON 5% · KURANG MENARIK',
      formulaAt: 'turun',
      narration: 'Saat bunga naik, harga obligasi lama biasanya turun.',
      emphasis: ['obligasi lama', 'turun'],
    },
    {
      type: 'comparison',
      eyebrow: 'Dampak 3 · Obligasi',
      title: 'SBN baru lebih menarik',
      highlight: 'lebih menarik',
      columns: ['Obligasi lama', 'SBN baru'],
      rows: [
        { label: 'Kupon', values: ['5%', 'Lebih tinggi'] },
        { label: 'Harga di pasar', values: ['Turun', 'Baru terbit'] },
        { label: 'Imbal hasil menarik', values: [false, true] },
      ],
      highlightColumn: 1,
      narration: 'Sebaliknya, SBN baru menawarkan imbal hasil yang lebih menarik.',
      emphasis: ['imbal hasil', 'menarik'],
    },

    // ── SCENE 6 · SAHAM ──────────────────────────────────────────────────────────────────────────────
    {
      type: 'device',
      eyebrow: 'Dampak 4 · Saham',
      title: 'Dana pindah ke aset aman',
      highlight: 'aset aman',
      screen: {
        kind: 'list',
        title: 'Pasar hari ini',
        items: [
          { icon: '📉', title: 'Saham (IHSG)', subtitle: 'Aset berisiko', value: '▼ tertekan' },
          { icon: '📄', title: 'Obligasi / SBN', subtitle: 'Aset lebih aman', value: '▲ diminati' },
        ],
      },
      notifications: [{ icon: '💸', app: 'Investor', title: 'Dana pindah: saham → obligasi', body: 'Imbal hasil aman makin menarik' }],
      narration: 'Pasar saham sering tertekan, karena investor punya alternatif yang lebih aman.',
      emphasis: ['tertekan', 'lebih aman'],
    },
    {
      type: 'features',
      eyebrow: 'Dampak 4 · Saham per sektor',
      title: 'Tiap sektor beda nasib',
      highlight: 'beda nasib',
      columns: 1,
      features: [
        { icon: '🏦', title: 'Perbankan', description: 'Relatif lebih tahan' },
        { icon: '🏠', title: 'Properti', description: 'Tertekan: KPR makin mahal' },
        { icon: '💻', title: 'Growth / teknologi', description: 'Paling sensitif terhadap bunga' },
      ],
      narration: 'Tapi sektor perbankan bisa lebih tahan dibanding properti atau saham growth.',
      emphasis: ['perbankan', 'lebih tahan'],
    },

    // ── SCENE 7 · PENUTUP ────────────────────────────────────────────────────────────────────────────
    {
      type: 'statement',
      lines: [
        { text: 'Bunga naik', at: 'kenaikan' },
        { text: 'bukan selalu kabar buruk.', highlight: 'bukan selalu', at: 'bukan' },
      ],
      narration: 'Jadi, kenaikan suku bunga bukan selalu kabar buruk.',
      emphasis: ['bukan selalu'],
    },
    {
      type: 'comparison',
      title: 'Siapa untung, siapa rugi?',
      highlight: 'untung',
      columns: ['Untung', 'Rugi'],
      rows: [
        { label: '🏠 Debitur', values: [false, true] },
        { label: '🏦 Bank', values: ['Bunga ↑', 'Risiko ↑'] },
        { label: '📄 SBN baru', values: [true, false] },
        { label: '📈 Saham', values: [false, true] },
      ],
      duration: 4.5,
      narration: 'Dampaknya berbeda untuk setiap pihak.',
      emphasis: ['berbeda'],
    },
    {
      type: 'hero',
      illustration: 'line:lightbulb',
      title: 'Pahami arah bunga',
      highlight: 'arah bunga',
      subtitle: 'Biar keputusan keuanganmu lebih bijak',
      narration: 'Memahami hubungan ini bisa membantu kamu mengambil keputusan keuangan yang lebih bijak.',
      emphasis: ['lebih bijak'],
    },
    outroScene(melekEkonomi, undefined, true),
  ],
  { hudLabel: 'Ekonomi' },
);
