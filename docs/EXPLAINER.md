# Video Explainer (narasi + subtitle)

Gaya konten edukasi TikTok/Reels: suara narasi, subtitle karaoke per kata,
header bab di kiri atas, dan HUD tetap. Contoh lengkap:
`src/projects/soal-skd/bedah-analogi.ts`.

## Config

```ts
defineVideo({
  id: 'Brand-Explainer',
  theme: 'ModernDark',
  voice: { name: 'id-ID-Ardi:DragonHDLatestNeural', rate: '+10%', lexicon: { SKD: 'Es Ka De' } },
  overlay: { hud: { label: 'TIU 7/20', timer: '00:18:42' } },
  scenes: [
    { type: 'question', ..., chapter: { label: 'Jebakan', title: 'Jawaban yang menjebak', highlight: 'menjebak' },
      narration: 'Banyak yang langsung pilih arah angin.', emphasis: ['arah angin'],
      steps: [{ action: 'wrong', option: 0, at: 'arah angin' }] },
  ],
});
```

- **Narasi** hasil `npm run narasi` (`<video>.narration.json` di sebelah config) dipasang otomatis oleh registry — tidak perlu diimpor.
  Untuk konten harian biasa, pakai template `kontenHarian` (lihat `docs/MEMBUAT-VIDEO.md`); halaman ini untuk scene manual.
- **Durasi scene** = panjang suara + jeda (tidak perlu `duration`). `duration` hanya batas minimum.
- **`at` / cue**: animasi mengikuti kata narasi — `'higrometer'`, frasa `'arah angin'`, kemunculan ke-n `'alat#2'`, atau angka detik.
- **`lexicon`**: ejaan khusus untuk mesin suara saja; subtitle tetap ejaan asli.
- **`overlay`**: HUD (brand + label + timer mundur), header bab dari `scene.chapter`, subtitle (`captions: false` untuk mematikan).

## Merender suara

```
AZURE_SPEECH_KEY=... npm run narasi -- src/projects/<brand>/<video>.ts   # atau ID video: npm run narasi -- Harian-TipsGaji
```

- Key dari portal.azure.com → resource Speech → Keys and Endpoint (atau `.env`). Region default `southeastasia`.
  Di sesi cloud Claude key disuntikkan proxy: `AZURE_SPEECH_KEY=proxy-injected`.
- Hanya klip yang teksnya berubah yang dirender ulang. `--dry-run` untuk melihat, `--redo` render ulang semua,
  `--retime` hitung ulang waktu kata tanpa Azure.
- Hasil: `public/narration/<id>/*.mp3` + `<video>.narration.json`. Sebelum dirender, pratinjau tetap jalan
  dengan durasi perkiraan (tanpa suara).
- Waktu per kata dihitung dari jeda pada audio + jumlah suku kata (REST Azure tidak mengirim waktu kata);
  akurasi ±0,1–0,2 dtk.
