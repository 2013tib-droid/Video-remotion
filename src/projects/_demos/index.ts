/**
 * Demo setiap template dengan brand fiktif — untuk pratinjau di Studio
 * dan sebagai contoh props. Aman untuk diabaikan.
 */
import { defineVideo } from '../../core';
import { appLaunch, mobileAppPromo, saasProductPromo } from '../../templates';

export const appLaunchDemo = appLaunch({
  id: 'Demo-AppLaunch',
  brand: { name: 'Nimbus', url: 'nimbus.app' },
  theme: 'Corporate',
  tagline: 'Penyimpanan awan untuk tim',
  title: 'File tim kamu, aman di satu tempat.',
  highlight: 'aman',
  subtitle: 'Sinkron otomatis di semua perangkat.',
  features: [
    { icon: '🔒', title: 'Enkripsi end-to-end', description: 'Data terlindungi sejak diunggah' },
    { icon: '⚡', title: 'Sinkron instan', description: 'Perubahan muncul dalam hitungan detik' },
    { icon: '👥', title: 'Kolaborasi', description: 'Bagikan folder dengan satu klik' },
  ],
  stats: [{ value: 99.9, decimals: 1, suffix: '%', label: 'uptime' }],
  cta: { title: 'Coba gratis 30 hari.', button: 'Mulai Sekarang' },
});

export const saasDemo = saasProductPromo({
  id: 'Demo-SaaS-Landscape',
  brand: { name: 'Lumen CRM', url: 'app.lumencrm.id' },
  format: 'landscape',
  title: 'CRM yang benar-benar dipakai tim sales.',
  highlight: 'dipakai',
  subtitle: 'Pipeline, follow-up, dan laporan dalam satu dashboard.',
  dashboard: {
    title: 'Ringkasan Penjualan',
    kpis: [
      { label: 'Pendapatan', value: 482, prefix: 'Rp ', suffix: ' jt' },
      { label: 'Deal aktif', value: 128 },
      { label: 'Win rate', value: 37, suffix: '%' },
    ],
    chart: [
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 180 },
      { label: 'Mar', value: 160 },
      { label: 'Apr', value: 240 },
      { label: 'Mei', value: 310 },
    ],
  },
  features: [
    { icon: '🤖', title: 'Follow-up otomatis', description: 'Tak ada prospek yang terlupa' },
    { icon: '📈', title: 'Forecast akurat', description: 'Prediksi pendapatan per bulan' },
    { icon: '🔗', title: 'Integrasi WhatsApp', description: 'Chat pelanggan langsung dari CRM' },
  ],
  comparison: {
    columns: ['Spreadsheet', 'CRM lain', 'Lumen'],
    rows: [
      { label: 'Pengingat otomatis', values: [false, true, true] },
      { label: 'Integrasi WhatsApp', values: [false, false, true] },
      { label: 'Harga / pengguna', values: ['Gratis', 'Rp 350rb', 'Rp 99rb'] },
    ],
    highlightColumn: 2,
  },
  cta: { title: 'Gratis untuk 3 pengguna pertama.', button: 'Daftar Sekarang' },
});

export const mobileDemo = mobileAppPromo({
  id: 'Demo-MobileApp',
  brand: { name: 'Dompetku', logo: '👛', url: 'dompetku.app' },
  title: 'Atur uang tanpa ribet.',
  highlight: 'tanpa ribet',
  subtitle: 'Catat, rencanakan, dan capai target tabungan.',
  screenTitle: 'Semua transaksi tercatat otomatis',
  bullets: ['Kategori otomatis', 'Grafik bulanan'],
  screen: {
    kind: 'list',
    title: 'Transaksi',
    items: [
      { icon: '☕', title: 'Kopi Senja', subtitle: 'Makan & minum', value: '-25rb' },
      { icon: '🛒', title: 'Belanja bulanan', subtitle: 'Kebutuhan', value: '-480rb' },
      { icon: '💼', title: 'Gaji', subtitle: 'Pemasukan', value: '+8,5jt' },
      { icon: '🎬', title: 'Streaming', subtitle: 'Hiburan', value: '-54rb' },
    ],
  },
  notifications: [{ icon: '🎯', title: 'Target tercapai!', body: 'Dana liburan sudah 100%' }],
  features: [
    { icon: '📊', title: 'Laporan bulanan', description: 'Tahu ke mana uangmu pergi' },
    { icon: '🎯', title: 'Target tabungan', description: 'Nabung terarah dan konsisten' },
    { icon: '🔔', title: 'Pengingat tagihan', description: 'Tak pernah telat bayar lagi' },
  ],
  cta: { title: 'Kendalikan keuanganmu.', button: 'Unduh Gratis' },
});

/** Contoh scene `statement` (teks besar ala Reels): gaya stack & replace + aksen kata kunci. */
export const statementDemo = defineVideo({
  id: 'Demo-Statement',
  brand: { name: 'Kinetik', url: 'kinetik.id' },
  theme: 'ModernDark',
  format: 'vertical',
  scenes: [
    {
      type: 'statement',
      style: 'stack',
      duration: 5,
      lines: [
        { text: 'Teks yang' },
        { text: 'benar-benar bicara', highlight: 'bicara' },
        { text: 'bukan sekadar muncul.', highlight: 'muncul' },
      ],
    },
    {
      type: 'statement',
      style: 'replace',
      duration: 6,
      lines: [
        { text: 'Satu frasa.', highlight: 'Satu' },
        { text: 'Memenuhi layar.', highlight: 'layar' },
        { text: 'Lalu berganti dengan frasa berikutnya yang lebih panjang.', highlight: 'berganti' },
      ],
    },
    {
      type: 'statement',
      style: 'stack',
      textAnimation: 'typewriter',
      highlightStyle: 'circle',
      duration: 5,
      lines: [{ text: 'Ketik huruf demi huruf,' }, { text: 'lalu lingkari kata kunci.', highlight: 'kunci' }],
    },
  ],
});

export const demoVideos = [appLaunchDemo, saasDemo, mobileDemo, statementDemo];
