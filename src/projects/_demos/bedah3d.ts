import { bedah3D, defineSeries } from '../../templates';
import { jalanRaya } from '../../worlds';

/**
 * ACUAN template `bedah3D` (±45 detik, bernarasi; tambah adegan untuk 1–2 menit). Untuk video baru: salin file ini ke
 * `src/projects/<brand>/<video>.ts`, pakai seri brand-mu, ganti `dunia` + kalimat tiap adegan, lalu
 * `AZURE_SPEECH_KEY=proxy-injected npm run narasi -- <ID>` dan `npm run cek`.
 *
 * Isi narasinya sengaja menjelaskan kemampuan template itu sendiri (bukan fakta topik).
 */
const seri = defineSeries({
  brand: { name: 'Bedah 3D' },
  idPrefix: 'Demo',
  theme: 'ModernSaaS',
  outro: {
    title: 'Tinggal ganti isinya.',
    highlight: 'ganti isinya',
    button: 'Salin file ini',
    narasi: 'Salin file ini, ganti dunianya, ganti kalimatnya. Selesai.',
  },
});

export default bedah3D(seri, {
  slug: 'Bedah3D',
  topik: 'Acuan',
  catatan: 'Ilustrasi · bukan skala',
  // Kit dunia siap pakai (id objek & view: lihat komentar di src/worlds/jalan-raya.ts).
  dunia: jalanRaya({
    isiMobil: [
      // Tersembunyi sampai dimunculkan sebuah adegan (`muncul`).
      { id: 'aliran', shape: 'flow', hidden: true, path: [[0, 0.6, 1.2], [0.5, 0.5, 1.55], [0.95, 0.36, 1.42]], count: 6, size: 0.045, speed: 0.6 },
    ],
  }),
  adegan: [
    // 1 — HOOK: kalimat pendek, kamera lebar.
    {
      bab: { label: 'Acuan', judul: 'template bedah 3D', highlight: 'bedah 3D' },
      narasi: 'Video ini dibuat dari satu file data.',
      emphasis: ['satu file data'],
      kamera: 'jalan',
    },
    // 2 — kamera terbang saat sebuah kata diucapkan.
    {
      narasi: 'Tiap adegan satu kalimat, dan kamera terbang ke tempat yang sedang dibahas.',
      emphasis: ['terbang'],
      kamera: { view: 'mobil', at: 'terbang' },
    },
    // 3 — perubahan saat cue, dan menetap.
    {
      bab: { label: 'Perubahan', judul: 'terjadi saat disebut', highlight: 'saat disebut' },
      narasi: 'Lampu berganti hijau saat disebut, dan tetap hijau di adegan berikutnya.',
      emphasis: ['hijau'],
      kamera: 'lampu',
      lampu: { lampu: { to: 'green', at: 'hijau' } },
    },
    // 4 — objek bergerak; kamera mengikuti karena menarget id.
    {
      narasi: 'Mobil bisa maju, lalu berhenti di posisi barunya.',
      emphasis: ['maju'],
      kamera: 'samping',
      gerak: { mobil: [{ type: 'move', to: [-1.7, 0, 7], at: 'maju', duration: 1.6 }] },
    },
    // 5 — bagian model bergerak + tembus pandang + label yang bertahan.
    {
      bab: { label: 'Bedah', judul: 'lihat isi di dalamnya', highlight: 'di dalamnya' },
      narasi: 'Kap terangkat, bodi dibuat tembus pandang, dan mesinnya terlihat.',
      emphasis: ['tembus pandang', 'mesinnya'],
      kamera: { view: 'mesin', at: 'tembus', duration: 1.5 },
      xray: ['mobil'],
      bagian: { mobil: [{ name: 'BodyHood', motion: [{ type: 'move', to: [0, 0.55, 0], at: 'Kap', duration: 1 }] }] },
      label: [{ target: 'mesin', text: 'Mesin', at: 'mesinnya', tetap: true }],
    },
    // 6 — objek tersembunyi dimunculkan.
    {
      narasi: 'Bagian yang tadinya tersembunyi bisa muncul, misalnya aliran dari mesin ke roda.',
      emphasis: ['aliran'],
      muncul: { aliran: 'aliran' },
      label: [{ target: 'roda-depan', text: 'Roda depan', at: 'roda', color: 'primary', tetap: true }],
    },
    // 7 — kartu keterangan/sumber; label dibersihkan, bodi kembali utuh.
    {
      bab: { label: 'Data', judul: 'kartu & sumber', highlight: 'sumber' },
      narasi: 'Kartu keterangan dan sumber muncul di atas, tanpa menutupi objeknya.',
      emphasis: ['Kartu', 'sumber'],
      kamera: 'depan',
      xray: [],
      labelBersih: true,
      hilang: { aliran: 0 },
      kartu: [{ tag: 'Demo', text: 'Untuk angka, kutipan, atau sumber.', source: 'contoh · bukan data', at: 'Kartu' }],
    },
    // 8 — scene biasa disisipkan di tengah.
    {
      sisip: {
        type: 'statement',
        lines: [{ text: 'Grafik, angka,' }, { text: 'teks besar.', highlight: 'teks besar' }],
        narration: 'Scene biasa, seperti grafik, angka, atau teks besar, bisa disisipkan di tengah.',
      },
    },
    // 9 — kembali ke dunia dari posisi terakhir.
    {
      bab: { label: 'Lanjut', judul: 'dunia yang sama', highlight: 'sama' },
      narasi: 'Setelah itu, dunia tiga dimensinya lanjut dari posisi terakhir.',
      kamera: 'atas',
    },
    // 10 — patokan durasi.
    {
      narasi: 'Satu menit, kira-kira lima belas adegan seperti ini.',
      emphasis: ['Satu menit'],
      kamera: 'jalan',
    },
  ],
});
