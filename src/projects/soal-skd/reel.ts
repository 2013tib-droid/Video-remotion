import { defineVideo } from '../../core';
import { soalSkd } from './brand';

/** Reel 20 dtk SoalSKD — jual paket tryout SKD ke calon peserta CPNS, 9:16. */
export default defineVideo({
  id: 'SoalSKD-Reel20',
  brand: soalSkd,
  theme: 'ModernSaaS',
  format: 'vertical',
  duration: 20,
  scenes: [
    {
      type: 'hero',
      title: '330 soal latihan SKD, siap kamu taklukkan?',
      highlight: '330 soal',
      subtitle: 'Latihan dulu sebelum hari H.',
      duration: 3.5,
    },
    {
      type: 'device',
      eyebrow: 'Tampilan tryout SoalSKD',
      title: 'Ada timer, rasanya seperti ujian asli.',
      highlight: 'ujian asli',
      screen: { kind: 'image', src: 'brands/soalskd/tryout-soal.jpg' },
      duration: 5,
    },
    {
      type: 'features',
      title: 'Kenapa latihan di SoalSKD?',
      highlight: 'SoalSKD',
      features: [
        { icon: '📝', title: 'Seperti ujian asli', description: 'Format soal mirip SKD sebenarnya' },
        { icon: '💡', title: 'Pembahasan jelas', description: 'Mudah dipahami, langsung paham' },
        { icon: '🎯', title: 'Cocok untuk CPNS', description: 'Pas untuk persiapan seleksi' },
      ],
      duration: 4.5,
    },
    {
      type: 'stats',
      stats: [
        { value: 3, label: 'Paket Tryout' },
        { value: 110, label: 'Soal per Paket' },
      ],
      duration: 3.5,
    },
    {
      type: 'cta',
      title: 'Latihan sekarang, hadapi SKD lebih siap.',
      highlight: 'lebih siap',
      subtitle: 'SoalSKD: tryout persiapan CPNS',
      button: 'Mulai Tryout',
      duration: 3.5,
    },
  ],
});
