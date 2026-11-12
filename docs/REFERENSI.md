# Referensi Gaya Video

Video orang lain yang gayanya disukai pemilik repo, dibedah jadi **pola yang bisa ditiru** + cara membuatnya di Motion Studio.
Dipakai saat menulis naskah/storyboard dan saat memilih animasi. Yang ditiru **tekniknya** — bukan brand, naskah, atau asetnya
(file video referensi tidak disimpan di repo).

Menambah referensi baru: beri videonya ke Claude Code, minta "jadikan referensi", lalu tambahkan bagian baru di bawah
dengan susunan yang sama (ringkasan → alur → pola → cara membuat → yang belum ada).

---

## R1 — Bedah benda 3D: "busi standar atau iridium?" (TikTok, ±82 dtk, 9:16)

**Kenapa betah ditonton:** satu pertanyaan uang di detik pertama, dijawab lewat satu benda yang dibedah makin dalam; tiap
kalimat punya gambar sendiri; tiap angka punya sumber; jawabannya baru keluar di akhir, lalu video menyambung ke awal.

### Alur (per kalimat narasi ≈ 2–4 dtk)
| Waktu | Bab di layar | Yang terlihat |
|---|---|---|
| 0–6 dtk | Pertanyaan: A atau B? | Dua benda berdampingan, harga tertempel di bendanya, pil pertanyaan "hemat bensin: Rp ?" |
| 6–11 | (sama) | Kamera menyapu ke konteks (motor di bengkel), label klaim "irit bensin?" "tarikan enteng?", lalu "Kita bedah." |
| 11–18 | Cara kerja | Kamera masuk ke bagian; label nama bagian; panel batang "tegangan koil" berdenyut; penanda ukuran "0,8 mm" |
| 18–25 | Ilustrasi | Angka km menghitung naik (400 → 8.000 km) sambil benda aus; batang "tegangan yang dibutuhkan" ikut naik |
| 25–33 | A vs B | Benda kedua masuk; batang kedua (hijau, lebih pendek) muncul di panel yang sama |
| 33–42 | Klaim 1, klaim 2 | Panel dua batang hampir sama panjang + angka + catatan "kata pabrik, bukan tes kami" |
| 42–59 | Hitungan kami | Uang jadi tumpukan koin ("1 koin = Rp1.000"); tumpukan A vs B; cap besar "IMPAS" |
| 59–72 | Tapi… / Awas | Pengecualian & peringatan (penyebab lain, barang palsu) dengan label di benda |
| 72–80 | Jadi | Kartu putusan: ✓ awet · ✕ irit, + satu angka ringkasan |
| 80–82 | (bab pembuka lagi) | Gambar pembuka kembali; kalimat menggantung "Ingat itu, waktu…" → menyambung ke detik 0 |

### Pola yang ditiru → cara membuatnya di sini
Semua di template `bedah3D` (per adegan) / scene `world`.

| Pola | Cara membuat |
|---|---|
| Hook = pilihan + harga + pertanyaan terbuka | Adegan 1: dua objek, `label` harga di tiap objek, satu `label` pertanyaan ("hemat: Rp ?"). Bab = pertanyaannya |
| Satu dunia, kamera makin dekat | `kamera` per adegan: lebar → benda → bagian → celah; `xray` untuk melihat isi |
| Bab berganti tiap 2–3 kalimat; label kecil bab menyebut **jenis buktinya** | `bab: { label: 'Uji dyno · 2023', judul: 'Tenaga +0,7 %', highlight: '+0,7 %' }`. Judul bab = kesimpulan, bukan topik |
| Strip data + lencana sumber di tiap angka | `data: { text / value→to, source, tone }` — `tone`: `data` (pihak lain, biru) · `ilustrasi` (kuning) · `hitungan` (asumsi/hitungan sendiri) |
| Angka menghitung saat benda berubah (odometer) | `data: { value: 400, to: 8000, suffix: ' km', at: 'kata' }` bersamaan `gerak` objeknya |
| Panel batang yang naik / membandingkan | `meter: { title, tag, rows: [{ label, value, to, at, text }], note }`; baris pembanding menyusul dengan `showAt` |
| Penanda ukuran di benda | `ukur: [{ from, to, text: '0,8 mm', at }]` (titik = id objek/jangkar atau koordinat) |
| Nama bagian menempel | `label` (sudah ada), `tetap: true` bila perlu bertahan |
| Uang jadi benda yang bisa dihitung | objek `coins` (`count`) tersembunyi → `muncul`; tulis kursnya di `data: { text: '1 koin = Rp1.000', tone: 'hitungan' }` |
| Cap putusan | `cap: { text: 'IMPAS', at: 'impas' }` |
| Kartu kesimpulan ✓/✕ | `kartu: [{ text, points: [{ text, ok: true }, { text, ok: false }] }]` |
| Subtitle karaoke 1–2 baris, kata aktif berkotak | otomatis (video bernarasi) |
| Selingan konteks | kamera ke sudut lain dunia yang sama (bukan pindah scene), atau `sisip` scene biasa |
| Akhir menyambung ke awal (loop) | Adegan terakhir: `kamera` = view pembuka, `bab` = bab pembuka, kalimat menggantung. Pakai `penutup: false` |

### Aturan naskah dari referensi ini
- **Satu kalimat = satu gambar baru** (kamera pindah, benda berubah, atau HUD berubah). Tidak ada kalimat tanpa perubahan.
- **Tiap angka punya asal**: data pihak lain → sebut sumber + tahun; hitungan sendiri → tulis asumsinya; gambaran → tandai "Ilustrasi".
  Tetap berlaku: angka hanya dari pengguna/sumber yang disebut.
- Urutan: pertanyaan → cara kerja → klaim diuji satu per satu → dihitung dalam rupiah → pengecualian/peringatan → putusan satu kalimat.
- Putusan jujur dan spesifik ("awet, bukan irit"), bukan "tergantung".
- Kalimat lisan sehari-hari, 5–9 kata; bab ≤ 4 kata dan berisi kesimpulan bab itu.

### Belum ada di framework (ide lanjutan)
- Dunia dalam ruangan (bengkel, meja kerja) dan benda kecil detail — sekarang baru kit `jalanRaya()`; rakit dari bentuk dasar atau model `.glb`.
- Tumpukan koin yang **tumbuh** sekeping demi sekeping + garis bayangan "target" tumpukan.
- Percikan/kilat listrik dan benda yang aus bertahap (sekarang: `flow`, `scale`, `color`).
- Tulisan/harga yang menempel di permukaan benda 3D (sekarang lewat `label`).
- Sapuan kamera cepat antar sudut (whip pan) — sekarang terbang halus + blur gerak.

Contoh pemakaian semua properti di atas: `src/projects/_demos/bedah3d.ts`.

---

## R2 — Bedah benda 3D: "Pertalite atau Pertamax: yang mana?" (TikTok, ±82 dtk, 9:16)

Kanal yang sama dengan R1. Dikirim pemilik sebagai **acuan tingkat detail visual**: "menurutku detail". Bedahan ini fokus
ke **tampilan** (R1 sudah membahas alur & HUD data). Yang ditiru tekniknya, bukan brand/isinya.

**Kenapa terasa detail (bukan "pemula"):** benda yang dikenal penonton digambar lengkap dengan bagian kecilnya; satu palet
netral hangat yang konsisten; tiap info punya "wadah" khas (layar pompa, kartu kutipan, kartu putusan kuning); dan saat masuk
ke dalam benda, gambar berganti ke **irisan teknis** (cutaway) yang rapi seperti buku teknik.

### Alur (ringkas)
| Waktu | Bab (label kecil · judul) | Yang terlihat |
|---|---|---|
| 0–10 dtk | BENSIN MOBIL · Pertalite atau Pertamax: *yang mana?* | Mobil di SPBU (isometrik), pompa merah-putih dengan selang & nozzle, beton pembatas belang hitam-putih. Panel gelap gaya layar pompa: liter + harga dua bensin menghitung, baris SELISIH muncul belakangan. Pil berwarna (hijau PERTALITE, biru PERTAMAX) menunjuk nozzle masing-masing |
| 10–13 | (sama) | "Kita bedah." → sapuan kamera cepat dengan blur gerak |
| 13–17 | KATA MONTIR · … bikin mesin *ngelitik*? | Kap mobil dipotong (lencana "ILUSTRASI · KAP DIPOTONG"), mesin terlihat dari atas |
| 17–40 | DI DALAM SILINDER / NGELITIK / ANGKA OKTAN / SENSOR KETUKAN | **Irisan silinder 2D**: dinding beraksir (garis miring), piston, katup, pegas, busi, saluran pendingin pink, oli kuning di bawah. Api oranye merambat, butiran bahan bakar. Lencana "ILUSTRASI · SILINDER 4 · GERAK LAMBAT". Label kuning (PISTON, BUSI, SENSOR KETUKAN, KOMPUTER MESIN), merah (SISA CAMPURAN). Kotak ECU + kabel. Panel "Waktu pengapian" dengan penanda geser |
| 40–56 | UJI ORANG LAIN · Pertamax lebih irit *seberapa?* | Kartu putih bertumpuk: tiap uji (mobil · jenis uji, hasil, sumber + tanggal), batang kecil pembanding, baris kesimpulan bersorot kuning |
| 56–63 | HARGA VS IRIT · harga *+59,5 %*, irit *+1–8 %* | Kembali ke SPBU; panel dua batang (harga panjang biru vs irit pendek hijau) |
| 63–74 | BUKU MANUAL · Avanza: oktan *90 atau lebih* | Kartu kutipan berpinggir hijau: kutipan dengan kata penting disorot kuning + sumber (buku manual, pejabat, dealer) |
| 74–82 | JADI · *ikuti buku manualmu* | Kartu putusan kuning besar ("Bukumu bilang 90?") + pil hijau di nozzle; lalu kembali ke gambar pembuka (loop) |

### Pola tampilan → cara membuatnya di sini
| Pola | Status / cara |
|---|---|
| Latar **krem hangat netral** (±`#ece8e1`), lantai abu muda, objek abu/putih, warna kuat hanya untuk penanda | `themeOverrides` + `sky`/`ground`. "Cerah" di gaya ini = terang & bersih, bukan langit biru jenuh |
| Kamera **isometrik**: sudut tinggi, lensa sempit, nyaris tanpa perspektif | `fov` kecil (±12–18) + `distance` besar + `elevation` 30–40 |
| Benda nyata yang dikenal (mobil, pompa bensin) dengan **detail kecil**: selang, nozzle, lampu, pelek, belang pembatas | Model `.glb` (render lambat) atau rakitan bentuk dasar yang lebih banyak bagian. Kit dunia baru per tempat (SPBU, kota, pantai) |
| **Irisan teknis** (cutaway) saat masuk ke dalam benda: dinding beraksir, warna per bahan, gerak lambat | **Belum ada** → scene/komponen irisan 2D (SVG) beranimasi |
| Lencana jenis gambar di atas objek ("ILUSTRASI · KAP DIPOTONG", "… · GERAK LAMBAT") | `catatan` sudah ada, tetapi posisinya di bawah → perlu opsi di atas objek |
| Panel gelap gaya **layar mesin** (font mesin tik, angka menghitung, baris SELISIH menyusul) | `data`/`meter` ada (gaya terang) → perlu varian gelap berbaris banyak |
| Pil label **berwarna per pihak** (hijau = A, biru = B) | `label` + `color` (sudah ada) |
| Label nama bagian **kuning** berujung titik | `label` + `color` (sudah ada) |
| Kartu kutipan/uji bertumpuk (pinggir berwarna, kata kunci disorot, sumber kecil) | `kartu` ada (satu kartu) → perlu tumpukan + sorotan kata di dalam teks |
| Kartu putusan kuning besar dengan batang "target vs hasil" | Sebagian: `kartu` + `meter` → perlu varian kuning |
| Judul bab: label kecil huruf mesin tik + judul tebal dengan **sorotan miring** | Sudah ada (`bab`) |
| Subtitle 2 baris, kotak hitam, kata aktif **kuning** | Sudah ada; set `accent` tema ke kuning |
| Sapuan kamera cepat + blur gerak antar bagian | Belum ada (sekarang terbang halus) |
| Logo kanal kecil di kanan atas | `watermark` |

### Pelajaran untuk video kita
- Detail datang dari **benda yang dikenal + bagian kecilnya**, bukan dari banyaknya efek. Satu tempat yang digarap rapi
  (SPBU) lebih "mahal" daripada banyak tempat yang kasar.
- Warna diirit: dunia netral, warna kuat hanya untuk yang sedang dibahas (pil, api, label).
- Penjelasan "di dalam" pakai irisan 2D bersih, bukan 3D tembus pandang.

### Belum ada di framework (urutan prioritas untuk menyamai R2)
1. Scene **irisan teknis 2D** (SVG): bagian berwarna per bahan, aksir, label, gerak lambat.
2. **Kit dunia detail** dari bentuk dasar yang lebih kaya (tepi membulat, bagian kecil, bayangan lembut) per tempat.
3. Panel HUD **gelap** gaya layar mesin + kartu kutipan bertumpuk + kartu putusan kuning.
4. Lencana jenis gambar di atas objek, dan sapuan kamera cepat.
