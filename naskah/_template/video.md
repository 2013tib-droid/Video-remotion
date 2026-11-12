---
status: ide          # ide | draf | final | dibuat
id: Brand-Slug       # ID video (idPrefix seri + slug)
template: kontenHarian   # kontenHarian | promoProyek | bedah3D | manual
seri: src/projects/<brand>/series.ts   # atau "baru" (isi bagian Seri baru di bawah)
file: src/projects/<brand>/<video>.ts  # diisi saat dibuat
durasi: 30–45 dtk
---

# <Judul kerja video>

## 1. Konsep
- **Tujuan:** penonton jadi tahu / percaya / melakukan apa?
- **Penonton:** siapa, sedang mengalami apa.
- **Pesan utama (1 kalimat):** …
- **Kenapa ditonton sampai habis:** pertanyaan yang baru terjawab di akhir / angka mengejutkan / daftar bernomor.
- **Gaya acuan:** (mis. `docs/REFERENSI.md` R1) atau "-".

### Data & sumber
Angka hanya dari sini. Belum ada → tulis `[ISI ANGKA]`, jangan mengarang.

| Angka / fakta | Sumber + tahun | Jenis (data / ilustrasi / hitungan kami) |
|---|---|---|
| … | … | … |

### Seri baru (hapus bila memakai seri yang ada)
- Brand: … · Tema: … · Musik: tenang / semangat / korporat / tanpa · Watermark: true / @handle / tanpa
- Penutup baku: judul … · tombol … · narasi …

## 2. Alur & narasi
Satu blok per bagian (kontenHarian/promoProyek) atau per adegan (bedah3D: 1 kalimat ≈ 4 dtk, 1 menit ≈ 15 adegan).
Jenis isi yang boleh dipakai: lihat *Contekan* di bawah. Jangan jenis yang sama berturut-turut.

### 0 · Hook (≤ 2–3 dtk)
- **Layar:** … _(highlight: …)_
- **Narasi:** …

### 1 · <jenis> — <judul ≤ 8 kata>
- **Layar:** … _(highlight: …)_
- **Isi:** (maks 4 item) …
- **Narasi:** …
- **Visual/kamera (bedah3D):** …

### 2 · <jenis> — …
- **Layar:** …
- **Narasi:** …

### Kesimpulan / CTA
- **Layar:** …
- **Narasi:** …

**Lexicon** (singkatan yang dieja): PDB → "Pe De Be"

## 3. Catatan revisi
- (tgl) …

---
<details><summary>Contekan jenis isi</summary>

- **kontenHarian** — bagian berisi tepat satu: `angka` (1–3) · `poin` (2–4, ikon emoji) · `langkah` (2–4) · `grafik` (2–6 batang)
  · `banding` (tabel) · `kutipan` · `teks` (1–3 baris ≤ 25 huruf) · `kata` (≤ 8 kata) · `peta` · `hitung` · `foto`.
  Alur: hook → 3–6 bagian → kesimpulan → penutup seri. Detail: `src/templates/KontenHarian.ts`.
- **promoProyek** — hook (masalah) → keluhan (2–3, ≤ 4 kata) → solusi + tagline → layar (1–3 screenshot) → fitur (3–4)
  → bukti (angka nyata/testimoni, opsional) → CTA. Detail: `src/templates/PromoProyek.ts`.
- **bedah3D** — per adegan: narasi 1 kalimat + `bab` · `kamera` · `xray` · `label` · `data` (sumber + tone) · `meter` · `ukur`
  · `cap` · `kartu` · `muncul`/`hilang` · `sisip` (selingan). Tiap kalimat harus mengubah gambar. Gaya: `docs/REFERENSI.md`.
  Detail: `src/templates/Bedah3D.ts`, `docs/MEMBUAT-VIDEO.md`.
- Narasi ±2,7 kata/dtk (30–45 dtk ≈ 60–110 kata). Tulis angka seperti dibaca ("5,47 persen"). `highlight` harus persis ada di teksnya.
</details>
