import { kontenHarian } from '../../templates';
import { bagaimanaJika } from './series';

/** Naskah & sumber: `naskah/bagaimana-jika/listrik-padam.md`. Bagian "Skenario" = logika, bukan data. */
export default kontenHarian(bagaimanaJika, {
  slug: 'ListrikPadam',
  topik: 'Bagaimana Jika?',
  hook: 'Jawa–Bali gelap 3 hari?',
  highlight: 'gelap 3 hari',
  hookNarasi: 'Bagaimana jika listrik Jawa dan Bali padam tiga hari?',
  bagian: [
    {
      label: 'Pernah terjadi',
      judul: 'Ini nyata, Agustus 2019',
      highlight: '2019',
      keterangan: 'Sumber: PLN di DPR, 6 Agustus 2019',
      angka: [{ value: 21.9, decimals: 1, suffix: ' juta', label: 'pelanggan PLN padam' }],
      narasi:
        'Ini bukan khayalan. Empat Agustus dua ribu sembilan belas, dua puluh satu koma sembilan juta pelanggan PLN mendadak gelap.',
      emphasis: ['dua puluh satu koma sembilan juta'],
    },
    {
      judul: 'Jam pertama: kota berhenti',
      highlight: 'Jam pertama',
      keterangan: 'Sumber: CNN Indonesia, Tirto, 2019',
      poin: [
        { icon: '🚇', title: '4 kereta MRT tertahan', description: 'Di terowongan bawah tanah' },
        { icon: '🚆', title: '240 perjalanan KRL batal' },
        { icon: '🚦', title: 'Lampu lalu lintas mati' },
        { icon: '📶', title: 'Sinyal ponsel terganggu' },
      ],
      narasi:
        'Dalam hitungan jam, empat kereta MRT tertahan di bawah tanah, dua ratus empat puluh perjalanan KRL batal, lampu lalu lintas mati, dan sinyal ponsel terganggu.',
    },
    {
      teks: ['Itu baru ±34 jam.', 'Bayangkan 72 jam.'],
      highlight: '72 jam',
      narasi: 'Itu pun sebagian wilayah baru menyala lagi besok malamnya. Sekarang bayangkan tiga hari penuh.',
    },
    {
      label: 'Skenario',
      judul: 'Hari ke-2 dan ke-3',
      highlight: 'Hari ke-2',
      langkah: [
        { icon: '🚰', title: 'Hari 2: keran kering', description: 'Pompa air butuh listrik' },
        { icon: '💵', title: 'Hari 2: tunai jadi raja', description: 'ATM & QRIS tidak jalan' },
        { icon: '⛽', title: 'Hari 3: SPBU tersendat', description: 'Pompa bensin pakai listrik' },
        { icon: '🧊', title: 'Hari 3: kulkas basi' },
      ],
      narasi:
        'Hari kedua, pompa air berhenti dan keran kering. ATM dan QRIS tidak jalan, uang tunai jadi raja. Hari ketiga, SPBU sulit memompa bensin, dan isi kulkas mulai basi.',
    },
    {
      judul: 'Siapa yang bertahan?',
      highlight: 'bertahan',
      banding: {
        kolom: ['Bertahan', 'Kewalahan'],
        baris: [
          { label: 'Uang', values: ['Ada uang tunai', 'Hanya dompet digital'] },
          { label: 'Air', values: ['Stok air galon', 'Bergantung pompa'] },
          { label: 'Cahaya', values: ['Senter & power bank', 'Hanya lampu rumah'] },
        ],
      },
      sorot: 0,
      narasi: 'Yang bertahan bukan yang paling kaya, tapi yang punya uang tunai, stok air, dan senter.',
    },
  ],
  kesimpulan: {
    teks: ['Siapkan', 'sebelum gelap.'],
    highlight: 'sebelum gelap.',
    narasi: 'Listrik padam tidak bisa kita cegah, tapi bisa kita siapkan. Mulai dari tiga hal tadi.',
  },
  lexicon: { PLN: 'Pe El En', KRL: 'Ka Er El', MRT: 'Em Er Te', QRIS: 'kris', ATM: 'A Te Em', SPBU: 'Es Pe Be U' },
});
