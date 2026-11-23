# Prompt Storyboard untuk AI Lain (ChatGPT / Gemini / Claude.ai)

Tujuan: semua kerja **kreatif** (ide, naskah, revisi) dilakukan di chat AI biasa yang murah.
Claude Code hanya menerima **hasil final** lalu menulis satu file config.

## Alur
1. Salin blok **Prompt** di bawah ke ChatGPT/Gemini, isi `BRIEF`.
2. Revisi di chat itu sampai puas.
3. Setelah bilang "FINAL", salin blok **HASIL UNTUK CLAUDE CODE** ke Claude Code. Selesai.

Tips: jangan minta AI lain menulis TypeScript; kirim ke Claude Code hanya versi final.
Atau simpan naskahnya di repo: tempel `naskah/_template/video.md` sebagai BRIEF, simpan hasilnya ke `naskah/<brand>/<video>.md`
(status `final`), lalu cukup bilang ke Claude Code "buat video dari naskah itu" (lihat `naskah/README.md`).

## Komposisi
Tulis **maksud** informasinya + datanya — template `kontenHarian` memilih visualnya (`src/templates/maksud.ts`).
Nama tipe scene tidak perlu diketahui. Dua bagian berturut-turut dengan tipe hasil sama → varian otomatis bila ada
(`chart` vertikal ⇄ horizontal, `features` 1 ⇄ 2 kolom); tanpa varian → peringatan `npm run cek`.

| Maksud (`maksud:`) | `data` | Visual yang dipilih | Catatan |
|---|---|---|---|
| `satu-angka` — satu angka penting | `{ value, label, prefix?, suffix?, decimals?, pembanding? }` | `stats` 1 item (angka hero) | + `catatan` sumber; jangan 3 angka setara berulang |
| `dua-nilai` — beli vs buyback, sebelum vs sesudah | `{ a: {label,value}, b: {label,value}, prefix?, selisihLabel?, arah?, tanda? }` | `selisih` | celah + selisih & % otomatis; `arah` = arah yang buruk |
| `peringkat` — 2–6 nilai sejenis | `[{label,value}]` atau `{ item, terbaik?: 'tinggi'\|'rendah', sorotLabel?, prefix?, suffix? }` | 2 item → `selisih`; 3–6 → `chart` horizontal, urut dari yang terbaik, terbaik disorot | `sorotLabel` default "Terbaik" / "Terendah"; narasi sebut label **urut dari atas** |
| `perubahan` — nilai dari waktu ke waktu | `{ seri: [{label, titik}], skala?, cap? }` atau `{ titik: [...], label? }` | `tren` | titik nyata saja (≥ 2/garis; 2 titik = garis lurus, tanpa titik tengah rekaan) |
| `sebab-akibat` — A memicu B | `[simpul…]` atau `{ simpul, cabang? }` | `alur` | 2–4 simpul ≤ 4 kata; label panah ≤ 14 huruf |
| `urutan` — langkah / kronologi | `[langkah…]` | `timeline` | 2–4 langkah |
| `alasan` — daftar alasan / faktor | `[poin…]` atau `{ poin, kolom? }` | `features` | ≤ 4 kartu |
| `atribut` — banding beberapa atribut | `{ kolom, baris, sorot? }` | `comparison` | ≤ 3 kolom, sel ≤ 16 huruf |
| `simulasi` — hitungan | `{ baris, total, catatan?, prefix? }` | `calculation` | |
| `kesimpulan` — putusan | `"teks"` atau `["baris 1", "baris 2"]` | `statement` | `highlight` = kata di barisnya |
| `lokasi` — tempat | `[{place, label?}]` atau `{ titik, wilayah? }` | `map` | |
| Ajakan | penutup seri | `cta` | otomatis |

Data yang tidak cocok dengan maksudnya (mis. `dua-nilai` tanpa `b`) → galat jelas saat config dibangun, menyebut bagian
ke-berapa. Kunci isi lama (`angka`, `grafik`, `langkah`, …) tetap valid; `cek` menyarankan `maksud` bila pilihannya
bertentangan (grafik 2 batang, angka setara berulang, langkah berisi "memicu/menyebabkan").

**Hook — pakai pola** (`hook: { pola, … }`; elemen utama tampil penuh ≤ 0,5 dtk tanpa menunggu narasi, narasi default
dibangkitkan dari isinya bila `hookNarasi` kosong; tetap ≤ ±3 dtk — dicek `cek`, "hook lambat" dicek `pratinjau`):

| Pola | Isi | Visual | Contoh |
|---|---|---|---|
| `angka-konsekuensi` | `{ angka, akibat }` | `statement`: angka besar disorot + akibat | "Rp400.000" + "hilang saat dijual lagi" |
| `asumsi-dibantah` | `{ asumsi, bantahan, highlight? }` | `statement` 2 baris | "Emas dunia turun 8%" → "Antam cuma 1%" |
| `kontras` | `{ a:{label,value}, b:{label,value}, prefix?, suffix?, decimals?, judul? }` | `selisih` ringkas | Antam 16% vs UBS 8% |
| `kesalahan-umum` | `{ kesalahan, koreksi?, highlight? }` | `hero` + label "Kesalahan umum" | "Emas buat untung cepat" / "Rugi di spread" |
| `pertanyaan` | `{ teks, highlight? }` | `hero` | "Kenapa Antam cuma turun 1%?" |

Teks hook singkat: Edge TTS menambah ±0,8 dtk hening di akhir klip, jadi ucapan ±2,5 dtk (≤ ±7 kata terbaca).
Janji hook harus dibayar di video (tanpa clickbait). `hook: 'teks'` lama tetap valid (judul besar biasa).

**Alur cerita**: hook → konteks → konflik → bukti data → penjelasan → putusan → ajakan. Taruh "re-hook" di ±40%
durasi ("Tapi ada yang aneh…"). Ganti tipe visual tiap ±5–8 dtk, tetapi jangan lebih cepat dari waktu baca
(≤ 4 kata layar per detik tampil — dicek otomatis).

**Sinkron**: dengan `motion: { sync: 'auto' }` di seri, kartu/batang/baris muncul saat labelnya **diucapkan** —
jadi sebut label persis seperti di layar ("Galeri24, sekitar enam persen…"), berurutan dari atas ke bawah.

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
- hook = SATU pola (elemen utamanya langsung tampil; narasi dibuat otomatis dari isinya, atau tulis hookNarasi):
  - angka-konsekuensi: {angka, akibat} — "Rp400.000" + "hilang saat dijual lagi"
  - asumsi-dibantah: {asumsi, bantahan} — "Emas dunia turun 8%" → "Antam cuma 1%"
  - kontras: {a{label, value}, b{label, value}, prefix?, suffix?, judul?} — dua nilai berhadapan
  - kesalahan-umum: {kesalahan, koreksi?} — "Emas buat untung cepat" / "Rugi di spread"
  - pertanyaan: {teks, highlight?} — "Kenapa Antam cuma turun 1%?"
- bagian[]: tiap bagian = maksud + data + judul? + highlight? + label? + catatan? (sumber ≤ 40 huruf) + narasi (1–2 kalimat).
  JANGAN memilih jenis visual — cukup maksudnya:
  - satu-angka: {value, label, prefix?, suffix?, decimals?, pembanding? ("vs 7,89% di UBS")}
  - dua-nilai: {a{label, value}, b{label, value}, prefix?, selisihLabel?, arah?: turun-buruk|naik-buruk}
  - peringkat: 2–6 nilai sejenis [{label, value}] + terbaik?: tinggi|rendah (urut & sorot otomatis)
  - perubahan: titik waktu NYATA saja, ≥ 2 per garis: {seri[{label, titik[{label, value, x?}]}], skala?: absolut|persen, cap?}
  - sebab-akibat: 2–4 simpul [{icon?, text ≤ 4 kata, panah? (label panah masuk)}] (+ cabang?)
  - urutan: 2–4 langkah {icon?, title, description?}
  - alasan: 2–4 poin {icon (emoji), title, description?}
  - atribut: tabel {kolom[], baris[{label, values[]}]} (+ sorot: indeks kolom)
  - simulasi: {baris[{label, value, negative?}], total{label, value}}
  - kesimpulan: 1–2 baris teks besar
  - lokasi: pin kota [{place, label?, value?}]
  (Bentuk khusus bila perlu: kutipan {teks, oleh}, kata (satu kata per ketukan), foto (file yang akan saya siapkan).)
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
  - kartu?: angka/kutipan + SUMBER (hanya dari brief); boleh berisi daftar putusan ✓/✕ (untuk kesimpulan)
  - data?: strip angka di bawah bab + lencana jenis bukti: DATA (sumber + tahun) / ILUSTRASI / HITUNGAN KAMI (tulis asumsinya).
    Boleh menghitung (mis. 400 → 8.000 km) saat kata apa. Bertahan sampai diganti.
  - meter?: panel 1–3 batang (naik/turun atau A vs B) + nilai tertulis + catatan; saat kata apa bergerak
  - ukur?: penanda ukuran di benda (mis. "0,8 mm"), dari titik mana ke mana
  - cap?: cap putusan ≤ 2 kata (mis. IMPAS, MITOS), saat kata apa
  - selingan?: grafik/angka/teks besar di antara adegan 3D
  - irisan?: saat "masuk ke dalam" benda, adegan boleh berganti ke IRISAN TEKNIS 2D (gambar belah gaya buku teknik):
    sebutkan bagian-bagiannya + bahannya (batu, tanah, pasir, magma, air, logam, beton…), apa yang bergerak saat kata apa
  - panel?: panel gelap gaya layar mesin (baris label + angka yang menghitung), mis. harga/liter/korban + sumber
  - kartu putusan?: kartu kuning besar untuk kesimpulan; kartu kutipan untuk kutipan + sumber (kata kunci disorot)
- cta: {title, highlight?, button, url?}
- narasi (opsional, bila ingin bersuara): kalimat untuk hook, masalah, solusi, tiap layar, fitur, bukti, cta

=== ATURAN ===
- Bahasa Indonesia sehari-hari, kalimat pendek. Judul ≤ ±8 kata, deskripsi ≤ ±8 kata.
- Hook harus menghentikan scroll dalam 2 detik: pilih SATU pola hook (angka-konsekuensi · asumsi-dibantah · kontras ·
  kesalahan-umum · pertanyaan). Teksnya ≤ 7 kata terbaca (≤ 3 detik). Tanpa clickbait: jawabannya harus ada di video.
- Tulis maksud tiap bagian, bukan jenis visualnya. Dua nilai = dua-nilai (bukan grafik 2 batang); 3–6 nilai sejenis =
  peringkat; rantai "memicu/menyebabkan" = sebab-akibat (bukan urutan). Jangan maksud yang sama dua kali berturut-turut.
- Alur: hook → konteks → konflik → bukti data → penjelasan → putusan → ajakan; beri "re-hook" di tengah.
- Di narasi bagian data, sebut label item persis seperti di layar dan berurutan (isi muncul saat labelnya diucapkan).
- Teks layar ≤ 4 kata per detik tampil; label grafik ≤ 22 huruf, sel tabel ≤ 16 huruf, label angka ≤ 40 huruf.
- Narasi total 60–110 kata untuk video 30–45 detik (±2,7 kata/detik). Tulis angka di narasi dengan cara dibaca
  ("5,47 persen"). Singkatan yang dieja: daftar di "lexicon" (mis. PDB = Pe De Be).
- Angka/fakta harus dari brief atau sumber yang saya sebut. Tidak ada → tulis [ISI ANGKA], jangan mengarang.
- highlight harus persis ada di kalimatnya.
- Khusus bedah3D (gaya acuan: docs/REFERENSI.md): tiap kalimat harus mengubah gambar (kamera / benda / data);
  bab = kesimpulan bab itu (≤ 4 kata), label kecil bab = jenis buktinya; urutan pertanyaan → cara kerja → klaim diuji →
  dihitung dalam rupiah → pengecualian → putusan satu kalimat; adegan terakhir boleh kembali ke gambar pembuka (loop).
  Tampilan (R2): dunia netral krem, warna kuat hanya untuk yang dibahas; detail lewat bagian kecil benda yang dikenal.

=== CARA KERJA ===
1. Tulis storyboard ringkas untuk saya review: tabel No | Maksud (atau pola hook) | Teks di layar | Narasi.
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
  - slug: SpreadEmas · topik: Emas
  - hook: angka-konsekuensi — angka "Rp400.000", akibat "hilang saat dijual lagi"
  - bagian 1 (dua-nilai) "Harga beli vs buyback" (highlight: buyback), label "Antam LM · 1 gram · 22 Nov 2026":
    a Harga beli 2.495.000 · b Buyback 2.095.000 · prefix Rp · selisihLabel Spread · catatan "Data referensi · perlu verifikasi"
    narasi: Harga belinya dua juta empat ratus sembilan puluh lima ribu. Harga jual kembalinya cuma dua juta sembilan puluh lima ribu. Selisih inilah spread.
  - bagian 2 (peringkat, terbaik: rendah, suffix %) "Spread 1 gram, 22 Nov": Antam LM 16,03 · UBS 7,89 · Hartadinata 6,02 · Galeri24 5,96
    narasi: Spread terendah Galeri24, lalu Hartadinata, UBS hampir delapan persen, dan Antam LM lebih dari enam belas persen.
  - bagian 3 (perubahan, skala persen) "Emas dunia terkoreksi": Emas dunia 16 Nov 3.869,30 → 20 Nov 3.543,60;
    Antam LM 16 Nov 2.522.000 → 22 Nov 2.495.000 · cap saat "delapan"
    narasi: Emas dunia turun sekitar delapan persen dalam sepekan. Tapi Antam hanya turun sekitar satu persen.
  - bagian 4 (sebab-akibat) "Kenapa harga lokal beda?": 🌍 Emas dunia (US$) → 💱 Harga dalam rupiah (panah: kurs)
    → 🏷️ Harga beli lokal (panah: + premi); cabang dari simpul 2: 💰 Harga buyback (panah: kebijakan)
  - bagian 5 (kesimpulan): Sebelum beli emas, / cek spread-nya.
- lexicon: Galeri24 = Galeri dua empat, UBS = U B S
Tulis satu file config, render narasi, jalankan npm run cek. Jangan render video.
```
Hasilnya di repo: `src/projects/_demos/maksud.ts` (`Demo-Maksud`).

> Bila menambah template/jenis bagian di repo, perbarui prompt ini
> (sumber kebenaran: `src/templates/KontenHarian.ts`, `src/templates/PromoProyek.ts`).
> Visual 3D mendekati nyata (kamera masuk ke dalam benda, label menempel): scene manual `world` — tulis di brief
> "pakai scene world", sebutkan benda apa saja yang tampil (model `.glb` yang tersedia: `public/models/`) dan urutan kamera (lihat *Dunia 3D* di `docs/KATALOG-SCENE.md`).
> Gaya komik bergaris tinta (kota isometrik, gedung seperti gambar): tulis "gaya tinta"; kota sungguhan: sebutkan tempat
> + koordinat agar dibuat dari peta OSM (`kotaDariPeta`, `docs/PUSTAKA-VISUAL.md`).
> Scene manual & template lama (appLaunch, socialMediaShort, dst.): lihat `docs/MEMBUAT-VIDEO.md`.
