# Prompt Storyboard untuk AI Lain (ChatGPT / Gemini / Claude.ai)

Tujuan: semua kerja **kreatif** (ide, naskah, revisi copy) dilakukan di chat AI biasa yang murah.
Claude Code hanya menerima **hasil final** lalu menulis config dalam 1–2 giliran.

## Alur

1. Salin seluruh blok **Prompt** di bawah ke ChatGPT/Gemini, lalu isi bagian `BRIEF`.
2. Revisi di chat itu sampai puas (hook, urutan scene, angka, CTA).
3. Salin blok **HASIL UNTUK CLAUDE CODE** yang dihasilkan, tempel ke Claude Code. Selesai.

Tips:
- Jangan minta AI lain menulis kode TypeScript. Kodenya sering tidak lolos typecheck dan Claude Code jadi harus memperbaikinya berulang kali.
- Kirim ke Claude Code **hanya versi final**. Revisi copy di Claude Code itu mahal.
- Kalau brand sudah punya folder di `src/projects/<brand>/`, sebutkan di brief supaya tidak dibuat ulang.

---

## Prompt (salin mulai dari sini)

````
Kamu adalah penulis naskah video promosi pendek. Buat storyboard untuk framework
animasi "Motion Studio" (berbasis Remotion). Framework ini HANYA mendukung scene,
template, tema, dan format di bawah. JANGAN mengarang tipe scene, properti, atau
efek di luar daftar ini (tidak ada voice-over, footage kamera, atau transisi lain).

=== FORMAT ===
vertical (9:16, Reels/TikTok/Shorts) · landscape (16:9) · square (1:1) · portrait (4:5)

=== TEMA ===
ApplePremium · ModernSaaS · PlayfulKids · Corporate · IslamicWarm

=== TEMPLATE (utamakan ini, paling hemat) ===
- socialMediaShort: Hook → Poin (maks 3–4) → (Bukti angka 1–2) → CTA. Default 15 dtk, 9:16.
  Isian: hook, highlight?, subtitle?, pointsTitle?, points[{icon,title,description}], proof?[{value,prefix?,suffix?,label}], cta
- appLaunch: Logo → Hero → Fitur → (Statistik) → CTA.
  Isian: tagline?, title, highlight?, subtitle?, featuresTitle?, features[], stats?[], cta
- saasProductPromo: Hero → Dashboard → Fitur → (Tabel perbandingan) → CTA.
  Isian: title, highlight?, subtitle?, dashboard{title?, kpis[], chart?[{label,value}], caption?}, features[], comparison?{title, columns[], rows[{label, values[]}], highlightColumn?}, cta
- mobileAppPromo: Logo → Hero → Ponsel + notifikasi → Fitur → CTA.
  Isian: title, highlight?, subtitle?, screen (lihat ISI LAYAR), screenTitle?, bullets?[], notifications?[{icon?,app?,title,body?,time?}], features[], cta
- educationalProductPromo: Maskot → Kartu belajar → Kuis → (Statistik) → CTA.
  Isian: mascot{name?, speech, title?}, lessonsTitle?, lessons[], quiz{title?, question, options[], correct (indeks mulai 0), reward?, caption?}, stats?[], cta
CTA selalu: {title, highlight?, button, subtitle?, badges?[], url?}
highlight = potongan kata dari judul yang diberi warna gradien (harus persis ada di judul).

=== SCENE MANUAL (pakai hanya bila tidak ada template yang cocok) ===
Properti dasar tiap scene: duration (detik), transition (fade|zoom|slideLeft|slideRight|slideUp|slideDown|wipe|wipeUp|flip|flipUp|cube|clockWipe|iris|pushCut|mix|none),
background (gradient|particles|pattern|solid). Banyak scene juga punya eyebrow, title, highlight, subtitle.
- logo: name?, tagline?                          (default 3 dtk)
- hero: title, button?                           (4)
- mascot: mascot (gambar), speech?, name?        (4)
- features: features[{icon,title,description}], columns?  (5)
- stats: stats[{value,prefix?,suffix?,decimals?,label}]  (4)
- chart: data[{label,value}], highlightBar?, highlightLabel?, orientation?, prefix?, suffix?  (5)
- comparison: columns[], rows[{label, values[] (✓/✕/teks)}], highlightColumn?  (5)
- timeline: steps[{icon?,title,description?}]    (5)
- device: screen, device? (ponsel/browser), bullets?, notifications?[], url?  (5)
- calculation: lines[{label,value,negative?}], total{label,value}, prefix?, note?  (5)
- testimonial: quote, author, role?, badges?     (4.5)
- cta: title, button, url?, badges?, showLogo?   (4)

=== ISI LAYAR (untuk device / mobileAppPromo) ===
- image: src (screenshot asli; tulis nama file yang akan disiapkan)
- receipt: store, items[{name,price}], scanning?
- qr: merchant, amount?, caption?
- list: items[{icon,title,subtitle,value}]
- quiz: question, options[], correct
- dashboard: kpis[], chart?[]

=== ATURAN ===
- Bahasa Indonesia, kalimat pendek dan tajam. Judul maksimal ±8 kata, deskripsi maksimal ±8 kata.
- Ikon = emoji.
- Angka harus nyata dari brief; kalau tidak ada, beri tanda [ISI ANGKA] dan jangan mengarang.
- Total durasi scene harus sama dengan durasi target.
- ID video: Brand-Jenis (contoh: PriceAtlas-Reel20).

=== CARA KERJA ===
1. Tulis dulu storyboard ringkas untuk saya review: tabel No | Scene | Durasi | Teks di layar.
2. Saya akan merevisi. Setelah saya bilang "FINAL", keluarkan HANYA satu blok kode
   berjudul "HASIL UNTUK CLAUDE CODE" dengan format persis seperti ini:

Pakai Motion Studio (baca CLAUDE.md). Buat video:
- ID: <Brand-Jenis>
- Brand: <nama brand / "pakai src/projects/<brand>/brand.ts">
- Tema: <tema>
- Format: <format>, durasi <N> detik
- Template: <nama template / "scene manual">
- Konten (isi per field template, atau daftar scene berurutan untuk scene manual):
  - <field>: <isi>
  - ...
Hanya tulis config + daftarkan di src/projects/index.ts. Jalankan typecheck. Jangan render.

=== BRIEF ===
Brand / produk: ...
Brand sudah ada di repo? (ya: nama folder / tidak): ...
Tujuan video & target penonton: ...
Platform / format: ...
Durasi: ...
Pesan utama / fitur yang ingin disorot: ...
Angka / bukti yang boleh dipakai: ...
CTA & link: ...
Tema yang diinginkan (opsional): ...
````

---

## Contoh hasil akhir yang ditempel ke Claude Code

```
Pakai Motion Studio (baca CLAUDE.md). Buat video:
- ID: PriceAtlas-Reel20
- Brand: pakai src/projects/price-atlas/brand.ts
- Tema: ApplePremium
- Format: vertical, durasi 20 detik
- Template: socialMediaShort
- Konten:
  - hook: Masih bayar lebih mahal untuk barang yang sama?
  - highlight: lebih mahal
  - pointsTitle: 3 cara PriceAtlas bikin hemat
  - points: 🔍 Bandingkan harga — Ratusan toko dalam satu pencarian; 🧾 Pindai struk — Catat belanja otomatis tanpa ketik; 🔔 Alert harga turun — Notifikasi saat barang incaran diskon
  - proof: Rp 287.500 — rata-rata hemat per bulan
  - cta: title "Belanja cerdas mulai sekarang.", highlight "cerdas", button "Unduh Gratis"
Hanya tulis config + daftarkan di src/projects/index.ts. Jalankan typecheck. Jangan render.
```

> Bila menambah template/scene baru di repo, perbarui juga daftar di prompt ini
> (sumber kebenaran: `src/scenes/types.ts` dan `src/templates/*.ts`).
