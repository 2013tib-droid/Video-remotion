import { kontenHarian } from '../../templates';
import { bagaimanaJika } from './series';

/** Naskah & sumber: `naskah/bagaimana-jika/krakatau.md`. */
export default kontenHarian(bagaimanaJika, {
  slug: 'Krakatau',
  topik: 'Gunung Api',
  hook: 'Krakatau meletus seperti 1883?',
  highlight: '1883',
  hookNarasi: 'Bagaimana jika Krakatau meletus seperti tahun delapan belas delapan puluh tiga?',
  bagian: [
    {
      label: '27 Agustus 1883',
      judul: 'Suara terkeras dalam sejarah',
      highlight: 'terkeras',
      keterangan: 'Sumber: catatan Hindia Belanda; Tirto',
      angka: [
        { value: 4800, prefix: '±', suffix: ' km', label: 'suara terdengar' },
        { value: 36417, label: 'jiwa meninggal' },
      ],
      narasi:
        'Tahun itu, ledakannya terdengar sampai Australia, sekitar empat ribu delapan ratus kilometer jauhnya. Tiga puluh enam ribu lebih orang meninggal.',
      emphasis: ['empat ribu delapan ratus kilometer'],
    },
    {
      judul: 'Pembunuh sebenarnya: tsunami',
      highlight: 'tsunami',
      keterangan: 'Gelombang 30–40 m · Sumber: Detik, RCTI+',
      grafik: [
        { label: 'Tsunami', value: 90 },
        { label: 'Lainnya', value: 10 },
      ],
      sorot: 0,
      sorotLabel: '±90%',
      suffix: '%',
      narasi:
        'Tapi yang paling banyak merenggut nyawa bukan ledakannya. Sekitar sembilan puluh persen korban tewas karena tsunami setinggi tiga puluh sampai empat puluh meter.',
    },
    {
      teks: ['Krakatau lama sudah hancur.', 'Kini tumbuh anaknya.'],
      highlight: 'anaknya.',
      narasi: 'Gunung Krakatau yang lama sudah hancur. Yang tumbuh di sana sekarang adalah anaknya, Anak Krakatau.',
    },
    {
      label: '22 Des 2018 · Sumber: BNPB',
      judul: 'Bahayanya sudah datang, 2018',
      highlight: '2018',
      poin: [
        { icon: '🌋', title: 'Lereng longsor ke laut' },
        { icon: '🌊', title: 'Tsunami malam, tanpa gempa' },
        { icon: '🕯️', title: '437 jiwa meninggal' },
      ],
      narasi:
        'Desember dua ribu delapan belas, lerengnya longsor ke laut. Tsunami datang malam hari, tanpa gempa, tanpa peringatan. Empat ratus tiga puluh tujuh orang meninggal.',
    },
    {
      judul: 'Di pantai? Ingat ini',
      highlight: 'Ingat ini',
      langkah: [
        { icon: '🌊', title: 'Air laut surut mendadak', description: 'Jangan didekati' },
        { icon: '👂', title: 'Gemuruh dari laut', description: 'Jangan tunggu sirene' },
        { icon: '⛰️', title: 'Lari ke tempat tinggi' },
      ],
      narasi:
        'Jadi kalau air laut tiba-tiba surut, atau terdengar gemuruh dari laut, jangan tunggu sirene. Langsung lari ke tempat tinggi.',
      emphasis: ['tempat tinggi'],
    },
  ],
  kesimpulan: {
    teks: ['Tak perlu letusan besar', 'untuk berbahaya.'],
    highlight: 'Tak perlu letusan besar',
    narasi: 'Krakatau tidak perlu meletus sebesar dulu untuk berbahaya. Ia sudah membuktikannya.',
  },
  lexicon: { BNPB: 'Be En Pe Be' },
});
