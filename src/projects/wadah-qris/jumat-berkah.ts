import { defineVideo } from '../../core';
import { wadahQris } from './series';

/**
 * Sedekah Jumat Berkah — film pendek sinematik 9:16 (adegan `sinema`: siluet berlapis,
 * cahaya fajar, kaligrafi). Narasi: `AZURE_SPEECH_KEY=proxy-injected npm run narasi -- WadahQRIS-JumatBerkah`.
 */
export default defineVideo({
  id: 'WadahQRIS-JumatBerkah',
  brand: wadahQris.brand,
  theme: 'IslamicWarm',
  themeOverrides: {
    colors: { primary: '#1B5E20', accent: '#D4AF37', highlight: '#D4AF37', onHighlight: '#2C2C2C', text: '#2C2C2C', background: '#F8F6F2' },
  },
  transition: 'fade',
  audio: { src: 'khidmat', volume: 0.6 },
  sfx: { volume: 0.9 },
  voice: {
    name: 'id-ID-Ardi:DragonHDLatestNeural',
    rate: '+6%',
    lexicon: {
      ...wadahQris.voice?.lexicon,
      'ﷺ': 'shallallahu alaihi wasallam',
    },
  },
  overlay: { brand: false, captionStyle: 'sinema' },
  scenes: [
    {
      type: 'sinema',
      set: 'masjid',
      time: 'fajar',
      crowd: 'jalan',
      move: 'descend',
      lines: [{ text: 'Hari Jumat Telah Tiba', highlight: 'Telah Tiba', at: 'Jumat…' }],
      narration: 'Besok adalah hari Jumat… hari terbaik dalam sepekan bagi seorang muslim.',
    },
    {
      type: 'sinema',
      shots: [{ set: 'dompet', note: '10.000' }, { set: 'sarapan' }],
      lines: [{ text: 'Tak perlu menunggu kaya.', highlight: 'menunggu kaya', at: 'Padahal' }],
      narration: 'Banyak dari kita menunggu kaya dulu untuk bersedekah. Padahal yang Allah lihat adalah keikhlasan.',
      emphasis: ['keikhlasan'],
    },
    {
      type: 'sinema',
      shots: [
        { set: 'berbagi', caption: 'Nasi kotak untuk pekerja' },
        { set: 'anak', caption: 'Makanan untuk anak yatim' },
        { set: 'air', caption: 'Air minum untuk jamaah' },
        { set: 'mushaf', caption: 'Perlengkapan ibadah masjid' },
      ],
      lines: [
        { text: 'Sedikit untukmu.', at: 'Sedikit' },
        { text: 'Berarti bagi mereka.', highlight: 'Berarti', at: 'kebahagiaan' },
      ],
      narration: 'Sedikit bagi kita… bisa menjadi kebahagiaan besar bagi orang lain.',
      duration: 7.3,
    },
    {
      type: 'sinema',
      set: 'langit',
      lines: [{ text: 'Doa malaikat setiap pagi', size: 'label', at: 0.6 }],
      arabic: { text: 'اللَّهُمَّ أَعْطِ مُنْفِقًا خَلَفًا', at: 'malaikat' },
      narration: 'Setiap pagi, dua malaikat turun dan berdoa.',
      duration: 4.6,
    },
    {
      type: 'sinema',
      set: 'mihrab',
      textPosition: 'center',
      captions: false,
      lines: [{ text: 'Rasulullah ﷺ bersabda', size: 'body', at: 0.3 }],
      arabic: {
        text: 'اللَّهُمَّ أَعْطِ مُنْفِقًا خَلَفًا\nاللَّهُمَّ أَعْطِ مُمْسِكًا تَلَفًا',
        translation: 'Ya Allah, berilah ganti kepada orang yang berinfak, dan binasakanlah harta orang yang menahan hartanya.',
        source: 'HR. Bukhari no. 1442 & Muslim no. 1010',
        at: 0.8,
        translationAt: 'Ya',
      },
      narration:
        'Rasulullah ﷺ bersabda: Ya Allah, berilah ganti kepada orang yang berinfak, dan binasakanlah harta orang yang menahan hartanya.',
    },
    {
      type: 'sinema',
      set: 'masjid',
      time: 'pagi',
      crowd: 'masuk',
      move: 'pullOut',
      lines: [{ text: 'Hari terbaik dalam sepekan', highlight: 'terbaik', at: 'Jumat' }],
      narration: 'Hari Jumat adalah hari yang penuh keberkahan.',
      emphasis: ['keberkahan'],
      duration: 3.8,
    },
    {
      type: 'sinema',
      set: 'jendela',
      textPosition: 'bottom',
      captions: false,
      lines: [{ text: 'Rasulullah ﷺ bersabda', size: 'body', at: 0.3 }],
      arabic: {
        text: 'خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ',
        translation: 'Sebaik-baik hari di mana matahari terbit adalah hari Jumat.',
        source: 'HR. Muslim no. 854',
        at: 0.7,
        translationAt: 'Sebaik-baik',
      },
      narration: 'Rasulullah ﷺ bersabda: Sebaik-baik hari di mana matahari terbit adalah hari Jumat.',
    },
    {
      type: 'sinema',
      set: 'pola',
      lines: [{ text: 'Perbanyak Amal Shalih', highlight: 'Amal Shalih', at: 0.3 }],
      flow: {
        items: [
          { text: 'Hari Jumat', icon: 'line:calendar', at: 'Jumat' },
          { text: 'Amal Shalih', icon: 'line:heart', at: 'amal' },
          { text: 'Sedekah', icon: 'line:gift', at: 'bersedekah' },
          { text: 'Kebaikan Berlipat', icon: 'line:sparkles', at: 'kesempatan' },
        ],
      },
      narration: 'Hari Jumat adalah waktu terbaik untuk memperbanyak amal saleh. Jangan lewatkan kesempatan bersedekah.',
      emphasis: ['amal saleh'],
    },
    {
      type: 'sinema',
      set: 'ponsel',
      lines: [{ text: 'Sedekah Mudah', highlight: 'Mudah', at: 'mudah.' }],
      phone: {
        url: 'wadahqris.id',
        title: 'Sedekah Jumat',
        amount: 'Rp1.000',
        success: 'Sedekah terkirim',
        qrAt: 'Kini',
        scanAt: 'Mulai',
        successAt: 'pun',
      },
      narration: 'Kini bersedekah semakin mudah. Mulai dari seribu rupiah pun bisa menjadi jalan kebaikan.',
      emphasis: ['seribu rupiah'],
    },
    {
      type: 'sinema',
      set: 'masjid',
      time: 'senja',
      crowd: 'pulang',
      move: 'panRight',
      lines: [
        { text: 'Jumat Berkah', highlight: 'Berkah', at: 'Mari' },
        { text: 'Sedekah hari ini', size: 'body', at: 'Jumat#1' },
      ],
      logo: { text: 'wadahqris.id', at: 'bermakna' },
      narration: 'Semoga setiap sedekah menjadi amal jariyah yang terus mengalir. Mari jadikan Jumat ini lebih bermakna.',
      emphasis: ['amal jariyah'],
    },
    {
      type: 'sinema',
      set: 'kartu',
      textPosition: 'center',
      lines: [
        { text: 'Jumat Berkah', highlight: 'Berkah', at: 0.4 },
        { text: '“Sedikit untukmu, berarti bagi mereka.”', size: 'body', at: 1.2 },
      ],
      logo: { text: 'wadahqris.id', at: 1.6 },
      duration: 3.6,
    },
  ],
});
