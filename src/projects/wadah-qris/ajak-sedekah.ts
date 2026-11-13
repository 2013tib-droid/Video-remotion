import { kontenHarian } from '../../templates';
import { wadahQris } from './series';

/** Ajakan bersedekah lewat QRIS. Narasi: `AZURE_SPEECH_KEY=proxy-injected npm run narasi -- WadahQRIS-AjakSedekah`. */
export default kontenHarian(wadahQris, {
  slug: 'AjakSedekah',
  topik: 'Sedekah',
  hook: 'Kotak amal lewat, dompet kosong?',
  highlight: 'dompet kosong',
  hookNarasi: 'Pernah? Kotak amal lewat di depanmu, tapi dompetmu sedang kosong.',
  bagian: [
    {
      kata: 'Sedekah kini cukup dari genggamanmu.',
      highlight: 'genggamanmu',
      narasi: 'Tak apa. Kini sedekah bisa dari HP di genggamanmu.',
    },
    {
      judul: 'Cuma tiga langkah',
      highlight: 'tiga langkah',
      langkah: [
        { icon: '🔍', title: 'Cari masjidnya', description: 'Di wadahqris.id' },
        { icon: '📱', title: 'Scan QRIS', description: 'E-wallet atau m-banking apa pun' },
        { icon: '🤲', title: 'Isi semampunya', description: 'Berapa pun, dengan niat' },
      ],
      narasi: 'Cari masjidnya di WadahQRIS, lalu scan pakai e-wallet atau m-banking apa saja.',
    },
    {
      // Mockup HP: QRIS terpindai, lalu notifikasi berhasil muncul.
      scene: {
        type: 'device',
        title: 'Isi semampumu.',
        highlight: 'semampumu',
        screen: { kind: 'qr', title: 'Sedekah', merchant: 'Masjid terdekatmu', caption: 'Nominal bebas, sesuai niat' },
        notifications: [
          { icon: '✅', title: 'Sedekah terkirim', body: 'Langsung ke rekening masjid' },
          { icon: '🧾', title: 'Bukti tersimpan', body: 'Cek kapan saja di riwayat' },
        ],
        textAnimation: 'pop',
      },
      narasi: 'Isi semampumu, dan sedekahmu langsung terkirim.',
    },
    {
      scene: {
        type: 'testimonial',
        quote: 'Alloh tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
        author: 'QS. Al-Baqarah: 286',
        avatar: '📖',
      },
      narasi: 'Tak perlu memaksakan diri. Alloh tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
      emphasis: ['kesanggupannya'],
    },
    {
      judul: 'Sampai dengan tenang',
      highlight: 'dengan tenang',
      poin: [
        { icon: '🕌', title: 'Langsung ke lembaga', description: 'Tidak singgah di rekening kami' },
        { icon: '✅', title: 'Dicek pengurus', description: 'Tiap QRIS diverifikasi sebelum tayang' },
        { icon: '🧾', title: 'Bukti tersimpan', description: 'Di riwayat aplikasimu' },
      ],
      narasi: 'Danamu langsung masuk ke rekening resmi lembaga, dan setiap QRIS dicek dulu oleh pengurus.',
    },
    {
      scene: {
        type: 'testimonial',
        quote: 'Amalan yang paling dicintai Alloh adalah yang terus-menerus, walaupun sedikit.',
        author: 'HR. Bukhari & Muslim',
        avatar: '💚',
      },
      narasi: 'Rasulullah bersabda, amalan yang paling dicintai Alloh adalah yang terus-menerus, walaupun sedikit.',
      emphasis: ['terus-menerus'],
    },
    {
      // Perumpamaan QS. Al-Baqarah: 261 — frasa berganti tepat saat diucapkan.
      scene: {
        type: 'statement',
        style: 'replace',
        lines: [
          { text: 'Sebutir biji', highlight: 'biji', at: 'sebutir' },
          { text: 'tumbuh tujuh tangkai', highlight: 'tujuh tangkai', at: 'tujuh' },
          { text: 'tiap tangkai seratus biji', highlight: 'seratus', at: 'seratus' },
        ],
      },
      narasi: 'Seperti sebutir biji yang tumbuh tujuh tangkai, tiap tangkai seratus biji.',
    },
    {
      judul: 'Hingga tujuh ratus kali',
      highlight: 'tujuh ratus',
      angka: [{ value: 700, suffix: '×', label: 'dari sebutir biji' }],
      keterangan: 'QS. Al-Baqarah: 261',
      narasi: 'Alloh melipatgandakan bagi siapa yang Dia kehendaki.',
      emphasis: ['melipatgandakan'],
    },
  ],
  sumber: 'QS. Al-Baqarah: 286; HR. Bukhari no. 6464 & Muslim no. 783 (dari Aisyah r.a.); QS. Al-Baqarah: 261',
});
