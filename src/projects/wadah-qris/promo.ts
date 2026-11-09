import { defineVideo } from '../../core';

/** WadahQRIS — donasi QRIS untuk masjid & komunitas. Hangat & terpercaya. */
export default defineVideo({
  id: 'WadahQRIS-Promo',
  brand: { name: 'WadahQRIS', logo: 'brands/wadahqris/logo.svg', url: 'wadahqris.id' },
  theme: 'IslamicWarm',
  duration: 28,
  scenes: [
    { type: 'logo', tagline: 'Donasi QRIS untuk masjid & komunitas' },
    {
      type: 'device',
      eyebrow: 'Alur donasi',
      title: 'Sedekah cukup sekali scan.',
      highlight: 'sekali scan',
      screen: { kind: 'qr', title: 'Infak', merchant: 'Masjid Al-Ikhlas', amount: 'Rp 50.000', caption: 'Pindai dengan aplikasi apa pun' },
      notifications: [
        { icon: '✅', title: 'Donasi berhasil', body: 'Rp 50.000 untuk Masjid Al-Ikhlas' },
        { icon: '🤲', title: 'Jazakumullahu khairan', body: 'Bukti donasi telah dikirim' },
      ],
      duration: 6,
    },
    {
      type: 'stats',
      eyebrow: 'Dampak komunitas',
      title: 'Kebaikan yang terus tumbuh.',
      highlight: 'tumbuh',
      stats: [
        { value: 1240, label: 'masjid & lembaga terdaftar' },
        { value: 3.8, decimals: 1, prefix: 'Rp ', suffix: ' M', label: 'donasi tersalurkan' },
        { value: 52000, suffix: '+', label: 'donatur aktif' },
      ],
      duration: 5,
    },
    {
      type: 'timeline',
      title: 'Transparan dari awal sampai akhir.',
      highlight: 'Transparan',
      steps: [
        { icon: '📱', title: 'Jamaah scan QRIS', description: 'Dari e-wallet atau m-banking apa pun' },
        { icon: '🏦', title: 'Dana langsung masuk', description: 'Ke rekening resmi lembaga' },
        { icon: '📊', title: 'Laporan otomatis', description: 'Pengurus & jamaah bisa memantau' },
      ],
      duration: 5,
    },
    {
      type: 'testimonial',
      quote: 'Laporan infak kini rapi dan jamaah makin percaya untuk bersedekah.',
      author: 'Ust. Ahmad Fauzi',
      role: 'Ketua DKM Masjid Al-Ikhlas',
      avatar: '🕌',
      badges: ['🔒 Pembayaran aman', '📊 Laporan real-time', '✅ Lembaga terverifikasi'],
      duration: 5,
    },
    {
      type: 'cta',
      title: 'Daftarkan masjid Anda hari ini.',
      highlight: 'masjid',
      subtitle: 'Gratis, aktif dalam 1 hari kerja.',
      button: 'Daftar Gratis',
      duration: 4.5,
    },
  ],
});
