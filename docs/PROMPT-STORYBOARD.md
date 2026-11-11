# Prompt Storyboard untuk AI Lain (ChatGPT / Gemini / Claude.ai)

Tujuan: semua kerja **kreatif** (ide, naskah, revisi) dilakukan di chat AI biasa yang murah.
Claude Code hanya menerima **hasil final** lalu menulis satu file config.

## Alur
1. Salin blok **Prompt** di bawah ke ChatGPT/Gemini, isi `BRIEF`.
2. Revisi di chat itu sampai puas.
3. Setelah bilang "FINAL", salin blok **HASIL UNTUK CLAUDE CODE** ke Claude Code. Selesai.

Tips: jangan minta AI lain menulis TypeScript; kirim ke Claude Code hanya versi final.

---

## Prompt (salin mulai dari sini)

````
Kamu penulis naskah video pendek vertikal (Reels/TikTok/Shorts) untuk framework "Motion Studio".
Framework HANYA mendukung tiga template dan jenis bagian di bawah. JANGAN mengarang jenis lain.
Video adalah motion graphic (teks, ikon, angka, grafik, mockup aplikasi) dengan narator suara AI + subtitle otomatis.

=== TEMPLATE A: kontenHarian (topik bebas: keuangan, politik, sosial, tips, data) ===
Alur: Hook → 3–6 bagian → Kesimpulan → Penutup (otomatis dari seri).
Isian:
- slug (untuk ID, mis. Inflasi-Okt26), topik (rubrik 1 kata, mis. "Keuangan")
- hook (≤ 7 kata, memancing), highlight (kata di hook), hookNarasi (kalimat pembuka yang dibacakan)
- bagian[]: tiap bagian = judul? + highlight? + narasi (1–2 kalimat yang dibacakan) + TEPAT SATU isi:
  - angka: 1–3 angka besar {value, prefix?, suffix?, decimals?, label}
  - poin: 2–4 poin {icon (emoji), title, description?}
  - langkah: 2–4 langkah/kronologi {icon?, title, description?}
  - grafik: 2–6 batang {label, value} (+ sorot: indeks batang, sorotLabel, prefix/suffix)
  - banding: tabel {kolom[], baris[{label, values[]}]} (+ sorot: indeks kolom)
  - kutipan: {teks, oleh, jabatan?}
  - teks: 1–3 baris teks besar (tiap baris ≤ ±25 huruf)
  - kata: satu kalimat ≤ 8 kata, tampil satu kata per ketukan
  - peta: pin kota Indonesia/dunia [{place, label?, value?}]
  - hitung: {baris[{label, value, negative?}], total{label, value}}
  - foto: nama file foto/video yang akan saya siapkan
- kesimpulan: 1–2 baris teks besar + narasi
- sumber (bila ada data)

=== TEMPLATE B: promoProyek (iklan aplikasi/website/proyek) ===
Alur: Hook (masalah) → Keluhan → Solusi → Tampilan produk → Fitur → (Bukti) → CTA.
Isian:
- slug, hook (≤ 8 kata), highlight
- masalah: 2–3 keluhan sangat singkat (≤ 4 kata)
- solusi (≤ 6 kata) + solusiHighlight, tagline (1 kalimat)
- layar: 1–3 tampilan {judul, highlight?, file screenshot yang akan saya siapkan, bullets?}
- fitur: 3–4 {icon (emoji), title, description}
- bukti?: 1–3 angka NYATA {value, suffix, label}; testimoni? {teks, oleh, jabatan?}

=== TEMPLATE C: bedah3D (penjelasan "cara kerja" 1–2 menit di satu dunia 3D) ===
Visual: dunia 3D nyata (jalan raya, mobil, lampu lalu lintas, gedung) — kamera terbang, bodi tembus pandang, label menempel.
Alur: adegan demi adegan di dunia yang sama; tiap adegan = SATU kalimat narasi (±4 detik). 1 menit ≈ 15 adegan, 2 menit ≈ 30.
Isian:
- slug, topik (rubrik 1 kata)
- dunia: kit "jalanRaya" (mobil utama, antrean mobil, lampu lalu lintas, gedung, pohon, orang) + benda tambahan yang perlu dirakit
- adegan[]: tiap adegan =
  - narasi (1 kalimat; adegan pertama = hook ≤ 7 kata)
  - bab? (judul kecil ≤ 4 kata, ganti tiap 3–5 adegan)
  - kamera?: melihat apa (jalan / lampu / mobil / depan / samping / mesin / kabin / atas) dan saat kata apa pindahnya
  - kejadian?: apa yang berubah dan saat kata apa (lampu berganti, mobil maju, kap terbuka, bodi tembus pandang, benda muncul)
  - label?: teks ≤ 3 kata yang menempel di benda, saat kata apa
  - kartu?: angka/kutipan + SUMBER (hanya dari brief)
  - selingan?: grafik/angka/teks besar di antara adegan 3D
- cta: {title, highlight?, button, url?}
- narasi (opsional, bila ingin bersuara): kalimat untuk hook, masalah, solusi, tiap layar, fitur, bukti, cta

=== ATURAN ===
- Bahasa Indonesia sehari-hari, kalimat pendek. Judul ≤ ±8 kata, deskripsi ≤ ±8 kata.
- Hook harus menghentikan scroll dalam 2 detik: pertanyaan, angka mengejutkan, atau pernyataan berani.
- Jangan pakai jenis bagian yang sama dua kali berturut-turut.
- Narasi total 60–110 kata untuk video 30–45 detik (±2,7 kata/detik). Tulis angka di narasi dengan cara dibaca
  ("5,47 persen"). Singkatan yang dieja: daftar di "lexicon" (mis. PDB = Pe De Be).
- Angka/fakta harus dari brief atau sumber yang saya sebut. Tidak ada → tulis [ISI ANGKA], jangan mengarang.
- highlight harus persis ada di kalimatnya.

=== CARA KERJA ===
1. Tulis storyboard ringkas untuk saya review: tabel No | Jenis bagian | Teks di layar | Narasi.
2. Setelah saya bilang "FINAL", keluarkan HANYA satu blok kode berjudul "HASIL UNTUK CLAUDE CODE":

Pakai Motion Studio (baca CLAUDE.md). Buat video:
- Template: <kontenHarian | promoProyek | bedah3D>
- Seri: <src/projects/<brand>/series.ts | "buat seri baru: nama brand, tema, CTA baku,
  musik (tenang/semangat/korporat/tanpa), watermark (nama brand/@handle/tanpa)">
- Isi (per field template):
  - slug: ...
  - hook: ...
  - ...
- lexicon: ...
Tulis satu file config, render narasi, jalankan npm run cek. Jangan render video.

=== BRIEF ===
Jenis: (konten harian / iklan proyek / penjelasan 3D)
Brand / kanal (sudah ada di repo? nama folder): ...
Topik / produk: ...
Target penonton: ...
Durasi: ...
Poin, data, sumber yang boleh dipakai: ...
CTA: ...
````

---

## Contoh hasil akhir

```
Pakai Motion Studio (baca CLAUDE.md). Buat video:
- Template: kontenHarian
- Seri: src/projects/harian/series.ts
- Isi:
  - slug: TipsGaji
  - topik: Keuangan
  - hook: Gaji selalu numpang lewat? (highlight: numpang lewat)
  - hookNarasi: Gaji kamu selalu cuma numpang lewat? Coba tiga kebiasaan kecil ini.
  - bagian 1 (langkah) "Pisahkan di hari gajian": 💰 Gaji masuk; 🏦 Langsung sisihkan tabungan; 🛒 Sisanya baru dipakai
    narasi: Pertama, begitu gaji masuk, langsung sisihkan tabungan. Sisanya, baru kamu pakai.
  - bagian 2 (teks): Catat pengeluaran. / Sekecil apa pun.
    narasi: Kedua, catat semua pengeluaran, sekecil apa pun.
  - kesimpulan: Kecil, / tapi konsisten. — narasi: Kecil, tapi konsisten. Itu kuncinya.
Tulis satu file config, render narasi, jalankan npm run cek. Jangan render video.
```

> Bila menambah template/jenis bagian di repo, perbarui prompt ini
> (sumber kebenaran: `src/templates/KontenHarian.ts`, `src/templates/PromoProyek.ts`).
> Visual 3D mendekati nyata (kamera masuk ke dalam benda, label menempel): scene manual `world` — tulis di brief
> "pakai scene world", sebutkan benda apa saja yang tampil (model `.glb` yang tersedia: `public/models/`) dan urutan kamera (lihat *Dunia 3D* di `docs/KATALOG-SCENE.md`).
> Scene manual & template lama (appLaunch, socialMediaShort, dst.): lihat `docs/MEMBUAT-VIDEO.md`.
