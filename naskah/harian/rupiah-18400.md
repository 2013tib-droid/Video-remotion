---
status: dibuat
id: Harian-Rupiah18400
template: manual (seriesConfig seri harian, scene bawaan — pola `spread-emas-antam.ts`)
seri: src/projects/harian/series.ts
file: src/projects/harian/rupiah-18400.ts
durasi: ±62 dtk (mengikuti suara Edge TTS)
---

# Rupiah Rp18.400 per Dolar, Apa Dampaknya bagi Kita?

## 1. Konsep
- **Tujuan:** penonton paham kenapa rupiah melemah, apa respons BI, dan dampaknya ke dompet, kredit, bisnis, investasi; tanpa panik.
- **Penonton:** masyarakat umum & investor ritel.
- **Pesan utama:** rupiah lemah berdampak nyata, tetapi sebagian besar dampaknya berupa *potensi*. Siapkan strategi, jangan panik.
- **Gaya:** editorial finansial premium, **latar putih** (revisi pengguna; awalnya navy gelap). Teks navy #0B1220, amber #D97706 = sorotan (digelapkan dari #FBBF24 agar terbaca di putih), merah #DC2626 = negatif, hijau #16A34A = positif.

### Data & sumber
⚠ Situs sumber tidak bisa dibuka dari sesi cloud (DNS diblokir). Angka diambil dari brief pengguna dan **belum diverifikasi independen**.

| Angka / fakta | Sumber + tanggal | Jenis |
|---|---|---|
| Kurs tertinggi intraday Rp18.400/US$, 26 Nov 2026 | IDX Channel, 27 Nov 2026 | data |
| Kurs penutupan Rp18.364/US$, 26 Nov 2026 | IDX Channel, 27 Nov 2026 | data |
| BI-Rate 5,75% → 6,00% (+25 bps), RDG 18 Nov 2026, + intervensi valas | Bank Indonesia, 18 Nov 2026 | data |
| Faktor: geopolitik, minyak, ekspektasi bunga AS, arus modal keluar | TKM BI November 2026 | data (kualitatif) |
| US$100 × Rp16.000 = Rp1.600.000; × Rp18.400 = Rp1.840.000; selisih Rp240.000 = 15,0% | hitungan kami | simulasi (harga dolar dianggap tetap) |
| Dampak kredit, simpanan, bisnis, investasi | penalaran ekonomi umum | potensi, bukan kepastian |

Cek hitungan: 18.400 − 16.000 = 2.400 × 100 = 240.000; 240.000 / 1.600.000 = 0,15 → 15%. 6,00 − 5,75 = 0,25 poin = 25 bps. ✓

## 2. Penyesuaian dari brief (dan alasannya)
1. **Hook 0–3 dtk, bukan 0–5.** Pertanyaan "Kenapa ini penting?" dibuang: hook ≤ 3,5 dtk (aturan `cek`), dan judul scene 2 sudah berupa pertanyaan.
2. **Scene 2 jadi 4 kartu faktor + rantai di subjudul** ("Dolar diburu → rupiah tertekan"). Kartu dan diagram tidak muat bersama dalam ±8 dtk.
   Diagram sebab-akibat (`alur`) dipakai di scene 6 dalam bentuk cabang (satu sebab, dua akibat), agar layout tidak berulang.
3. **Scene 3 memakai kata "sejak 18 November"** dan label "RDG BI 18 November 2026", sehingga keputusan BI terbaca *sebelum* kurs menyentuh Rp18.400.
4. **Scene 4 memakai grafik selisih** (dua batang dari nol + celah merah) dengan label "Simulasi · bukan data historis" dan catatan asumsi.
5. **Scene 5 diringkas jadi 2 baris tabel** (teks layar terlalu padat untuk 6 dtk). Catatan "Bunga tetap: tidak langsung naik" tetap ada.
6. **Scene 7: narasi emas dikoreksi.** Kalimat "dorongan dari penguatan dolar" diganti "emas rupiah ikut terdorong", karena dolar yang menguat *secara global* justru cenderung menekan harga emas dunia;
   yang mendorong emas domestik adalah pelemahan rupiah. Label "bukan ajakan beli/jual" ditambahkan.
7. **Penutup digabung:** "Pahami ekonomi, bukan sekadar berita." menjadi judul CTA + tombol Follow (satu scene, hemat ±3 dtk).
8. **Durasi ±62 dtk.** Narasi sudah diringkas dari 64,6 → 54,1 dtk suara. Sisanya berasal dari jeda baca ponsel (0,6 dtk/scene). Audio tidak dipotong paksa.
9. **Aksen merah di hook:** angka hero `stats` memakai gradien tema (amber), karena warnanya tidak bisa diatur per scene tanpa mengubah framework.
   Merah dipakai di celah biaya (scene 4) dan simpul tertekan (scene 6).

## 3. Alur & narasi (final, sumber kebenaran = file .ts)
| # | Visual | Narasi |
|---|---|---|
| 1 | `stats` hero Rp18.400 · pil "Ditutup Rp18.364" · sumber IDX | Rupiah tembus delapan belas ribu empat ratus per dolar! |
| 2 | `features` 4 faktor (muncul saat disebut) | Geopolitik tak pasti, minyak mahal, bunga Amerika diprediksi naik. Modal asing keluar, rupiah tertekan. |
| 3 | `stats` 6,00% · 25 bps · sumber BI | Sejak delapan belas November, BI-Rate sudah naik ke enam persen, plus intervensi valas. |
| 4 | `selisih` Rp1,6 jt vs Rp1,84 jt · +Rp240.000 · +15% | Barang impor seratus dolar: dari satu koma enam juta, jadi satu koma delapan empat juta. Lima belas persen lebih mahal, menekan daya beli. |
| 5 | `comparison` Peminjam vs Penabung | Bunga kredit mengambang berpotensi naik, bunga deposito bisa lebih menarik. |
| 6 | `alur` bercabang: Eksportir (hijau) / Importir & utang dolar (merah) | Eksportir berpotensi untung. Importir dan perusahaan berutang dolar tanpa lindung nilai, tertekan biaya. |
| 7 | `features` Saham · SBN · Emas | Saham bergejolak. Harga SBN lama bisa turun saat imbal hasil naik. Emas rupiah ikut terdorong. |
| 8 | `timeline` 3 langkah | Jangan panik. Jaga arus kas, siapkan dana darurat, kelola risiko investasi dan utang. |
| 9 | `cta` Pahami ekonomi, bukan sekadar berita. | Pahami ekonomi, bukan sekadar berita. |

**Lexicon:** BI-Rate → "Be I Ret" · SBN → "Es Be En" · KPR → "Ka Pe Er"
