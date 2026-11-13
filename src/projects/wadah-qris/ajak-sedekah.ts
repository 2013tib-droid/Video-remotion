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
      narasi: 'Cari masjidnya di WadahQRIS, scan pakai e-wallet atau m-banking apa saja, lalu isi semampumu.',
    },
    {
      kutipan: { teks: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.', oleh: 'QS. Al-Baqarah: 286' },
      narasi: 'Tak perlu memaksakan diri. Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
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
      kutipan: {
        teks: 'Amalan yang paling dicintai Allah adalah yang terus-menerus, walaupun sedikit.',
        oleh: 'HR. Bukhari & Muslim',
      },
      narasi: 'Rasulullah bersabda, amalan yang paling dicintai Allah adalah yang terus-menerus, walaupun sedikit.',
      emphasis: ['terus-menerus'],
    },
  ],
  kesimpulan: {
    teks: ['Sebutir biji,', 'tujuh ratus kebaikan.'],
    highlight: 'kebaikan',
    narasi: 'Seperti sebutir biji yang tumbuh tujuh tangkai, tiap tangkai seratus biji. Allah melipatgandakan bagi siapa yang Dia kehendaki.',
  },
  sumber: 'QS. Al-Baqarah: 286; HR. Bukhari no. 6464 & Muslim no. 783 (dari Aisyah r.a.); QS. Al-Baqarah: 261',
});
