import { defineVideo } from '../../core';
import { soalSkd } from './brand';
import narration from './bedah-analogi.narration.json';

/**
 * Explainer bedah soal TIU analogi (±50 dtk, 9:16) dengan narasi Ardi HD.
 * Ubah teks `narration` → jalankan `npm run narasi -- src/projects/soal-skd/bedah-analogi.ts`.
 */
const SOAL = {
  label: 'Soal 7',
  question: 'BAROMETER : TEKANAN UDARA = ANEMOMETER : ....',
  options: ['Arah angin', 'Kelembapan udara', 'Curah hujan', 'Kecepatan angin', 'Intensitas cahaya matahari'],
};

const HOOK = { label: 'TIU · ANALOGI', title: 'Soal ini sering bikin salah', highlight: 'sering bikin salah' };

const NOTES = { 0: 'Penunjuk arah angin', 1: 'Higrometer', 2: 'Ombrometer', 4: 'Solarimeter' };

export default defineVideo({
  id: 'SoalSKD-BedahAnalogi',
  brand: soalSkd,
  theme: 'ModernDark',
  format: 'vertical',
  voice: {
    name: 'id-ID-Ardi:DragonHDLatestNeural',
    rate: '+10%',
    lexicon: { SoalSKD: 'Soal Es Ka De', SKD: 'Es Ka De' },
  },
  narration,
  overlay: { hud: { label: 'TIU 7/20', timer: '00:18:42' } },
  scenes: [
    {
      type: 'question',
      ...SOAL,
      enter: false,
      chapter: HOOK,
      countdown: 5,
      countdownAt: 'coba',
      duration: 8.4,
      narration: 'Soal analogi kayak gini sering banget bikin salah. Coba jawab dalam lima detik.',
      emphasis: ['sering banget bikin salah', 'lima detik'],
    },
    {
      type: 'question',
      ...SOAL,
      enter: false,
      chapter: { label: 'Jebakan', title: 'Jawaban yang menjebak', highlight: 'menjebak' },
      steps: [
        { action: 'select', option: 0, at: 'arah angin' },
        { action: 'wrong', option: 0, at: 'kan' },
      ],
      narration: 'Banyak yang langsung pilih arah angin. Kedengarannya cocok, kan? Sama-sama soal angin.',
      emphasis: ['arah angin'],
    },
    {
      type: 'relation',
      chapter: { label: 'Langkah 1 · Cari hubungan', title: 'Alat mengukur sesuatu', highlight: 'mengukur' },
      rows: [
        { left: 'Barometer', verb: 'MENGUKUR', right: 'Tekanan udara', at: 'hubungan' },
        { left: 'Anemometer', verb: 'MENGUKUR', right: '?', at: 'polanya' },
      ],
      formula: 'ALAT : YANG DIUKUR',
      formulaAt: 'alat#2',
      narration: 'Triknya: cari dulu hubungan pasangan pertama. Barometer itu alat untuk mengukur tekanan udara. Jadi polanya: alat, dan yang diukur.',
      emphasis: ['mengukur', 'alat, dan yang diukur.'],
    },
    {
      type: 'question',
      ...SOAL,
      enter: false,
      chapter: { label: 'Langkah 2 · Eliminasi', title: 'Coret yang bukan kerja anemometer', highlight: 'bukan' },
      initial: { wrong: [0] },
      steps: [
        { action: 'strike', option: 0, note: NOTES[0], at: 'arah' },
        { action: 'strike', option: 1, note: NOTES[1], at: 'kelembapan' },
        { action: 'strike', option: 2, note: NOTES[2], at: 'curah' },
        { action: 'strike', option: 4, note: NOTES[4], at: 'cahaya' },
      ],
      narration:
        'Sekarang cek anemometer. Arah angin? Itu tugas penunjuk arah angin. Kelembapan, pakai higrometer. Curah hujan, pakai ombrometer. Cahaya matahari, pakai solarimeter.',
      emphasis: ['higrometer.', 'ombrometer.', 'solarimeter.'],
    },
    {
      type: 'question',
      ...SOAL,
      enter: false,
      chapter: { label: 'Jawaban', title: 'Anemometer = kecepatan angin', highlight: 'kecepatan angin' },
      initial: { wrong: [0], struck: [0, 1, 2, 4], notes: NOTES },
      steps: [{ action: 'correct', option: 3, at: 'kecepatan' }],
      narration: 'Yang tersisa: kecepatan angin. Anemometer mengukur kecepatan angin. Jawabannya, D.',
      emphasis: ['kecepatan angin.', 'D.'],
    },
    {
      type: 'timeline',
      chapter: { label: 'Ringkasan', title: 'Trik soal analogi', highlight: 'analogi' },
      steps: [
        { icon: '🔍', title: 'Cari hubungan pasangan pertama' },
        { icon: '➡️', title: 'Terapkan ke pasangan kedua' },
        { icon: '✂️', title: 'Coret yang tidak cocok' },
      ],
      narration: 'Jadi, kunci soal analogi: temukan hubungannya dulu, baru cocokkan pilihannya.',
      emphasis: ['hubungannya'],
    },
    {
      type: 'cta',
      chapter: { label: 'Latihan', title: '330 soal kayak gini', highlight: '330 soal' },
      title: 'Coba tryout di SoalSKD',
      highlight: 'SoalSKD',
      subtitle: 'Lengkap dengan pembahasan',
      button: 'Mulai Tryout',
      badges: ['3 Paket', '110 Soal per Paket'],
      narration: 'Mau latihan tiga ratus tiga puluh soal kayak gini, lengkap sama pembahasannya? Coba tryout di SoalSKD.',
      emphasis: ['tiga ratus tiga puluh soal', 'SoalSKD.'],
    },
    // Kembali ke soal awal agar video berputar mulus (loop).
    { type: 'question', ...SOAL, enter: false, chapter: HOOK, duration: 1.2 },
  ],
});
