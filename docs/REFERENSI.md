# Referensi Gaya Video

Video orang lain yang gayanya disukai pemilik repo, dibedah jadi **pola yang bisa ditiru** + cara membuatnya di Motion Studio.
Dipakai saat menulis naskah/storyboard dan saat memilih animasi. Yang ditiru **tekniknya** — bukan brand, naskah, atau asetnya
(file video referensi tidak disimpan di repo).

Komponen yang sudah dibuat dari gaya-gaya ini (benda 3D, irisan 2D, HUD, resep adegan) dikumpulkan di `docs/PUSTAKA-VISUAL.md`.

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

### Status (2026-11-12)
- **Sudah dibuat:** scene irisan teknis 2D (`irisan` + `gambar` di `bedah3D`), panel gelap `panel`, kartu `kutipan`/`putusan`
  + `sorot`, kotak bersudut membulat, lencana gambar di irisan, warna sorotan subtitle di tema. Contoh: `src/projects/bagaimana-jika/`.
- **Belum:** kit dunia detail siap pakai per tempat (SPBU, kota, pantai — sekarang dirakit di file video), lencana di atas
  objek 3D, sapuan kamera cepat (whip pan), aksir/tekstur pada objek 3D.

---

## R3 — Kota isometrik bergaya komik: "SCBD jadi sirkuit F1?" (TikTok, ±64 dtk, 9:16)

Dikirim pemilik: "gedungnya kelihatan real walaupun kayak gambar, detail juga. Tulisannya juga bukan AI slop."
Kanal lain dari R1/R2. Fokus bedahan: **gaya gambar kota** dan **gaya tulisan**. Yang ditiru tekniknya, bukan brand/isinya.

**Kenapa terasa nyata walau berupa gambar:** kotanya **dirakit dari peta asli** (OpenStreetMap, tertulis di sumber), jadi
tata jalan, bundaran, dan letak gedung cocok dengan yang dikenal penonton; tiap gedung punya **ciri bentuknya sendiri**
(menara silinder, kaca biru bersegi, kotak bertingkat) dan detail kecil di atap. Semuanya digambar dengan **garis tinta
gelap + warna rata + satu bayangan**, jadi tetap bersih seperti ilustrasi, bukan render 3D "plastik".

**Kenapa tulisannya bukan AI slop:** kalimatnya lisan dan pendek ("Mau lewat mana?", "Siap-siap."), angkanya spesifik dan
bersumber (3,34 km · ±4,5 km · 9 m · ±8–10 m · 6 minggu), tiap label hanya **fakta pendek gaya catatan** ("garis start:
Jl. Sudirman", "Sudirman buka tutup"), dan ada sejarah nyata bertanggal (2021, 2025) sebagai bukti "bukan khayalan".
Tidak ada kata sifat kosong ("luar biasa", "revolusioner"), tidak ada daftar tiga poin generik, tidak ada pertanyaan retoris berderet.

### Alur (12 potongan, ±5 dtk per potongan)
| Waktu | Yang terlihat | Kalimat (gaya) |
|---|---|---|
| 0–5 dtk | Atas-bawah: jalan lurus, deretan mobil F1 di grid, lampu start, tribun, pohon bulat. Label "garis start: Jl. Sudirman" | "Gimana kalau SCBD jadi sirkuit jalan raya, kaya di Monaco?" |
| 5–6 | Kota isometrik, mobil menikung di jalan layang. HUD gim: peta lintasan mini + "LAP 1" + "295 km/h" | (lanjutan) |
| 6–9 | Sudut pandang **pengemudi** (mobil di depan kamera), masuk terowongan. Label "di dalam underpass SCBD" | "Ternyata ukurannya masuk." |
| 9–17 | Kawasan SCBD dari atas, **lintasan merah** tergambar mengitari gedung; label nama gedung; **dua batang** (Monaco 3,34 km vs keliling SCBD ±4,5 km) | "Sirkuit Monaco cuma tiga koma tiga empat kilometer…" |
| 17–21 | Jalan dari atas, **tiga pil ukuran** (Singapura & Baku 9 m / SCBD ±8–10 m / Sudirman ±14 m) + penanda lebar di aspal; mobil lewat | "Selebar sembilan meter." |
| 21–28 | Jalan menikung, pagar & kerb **terpasang bertahap**; teks kecil "minggu ke-3 … ke-6" | "Monaco butuh enam minggu buat masang." |
| 28–36 | Dekat jalan: barikade, marshal, mobil antre. Pil "Sudirman buka tutup" | "Bayangin Sudirman buka tutup sebulan lebih… Mau lewat mana?" |
| 36–51 | **Peta skematik** dalam bingkai ("peta skematis, bukan skala"): garis jalan, pin Bundaran HI → Ratu Plaza, jalur merah putus-putus; pin Ancol, PIK, Kemayoran menyusul; lencana tahun ("2021: kandidat sirkuit Formula E") | "Dan ini bukan khayalan doang. Tahun 2021…" |
| 51–55 | Kembali ke kota, mobil menikung + HUD lap | "Jadi kalau kantor kamu di SCBD, siap-siap." |
| 55–60 | **Dilihat dari jendela kantor** (bingkai jendela + pot tanaman), maskot menoleh. Pil "tribun VIP: jendela kantor" | "Jendelanya bisa jadi tribun." |
| 60–64 | Kartu kanal kuning (maskot + "follow for more") | — |

### Pola → cara membuatnya di sini
| Pola | Status / cara |
|---|---|
| **Garis tinta** di tepi tiap benda 3D + warna rata + bayangan tunggal (gaya komik / toon) | **Belum ada** → mode gambar dunia `gaya: 'tinta'` (garis tepi + bayangan bertingkat) di scene `world` |
| Kota dari **peta asli** (jalan, bundaran, tapak gedung) | **Belum ada** → kit `kotaDariPeta()`: tapak gedung + jalan dari data OSM yang disimpan sebagai JSON kecil; kredit "© OpenStreetMap contributors" otomatis di sumber |
| Gedung berkarakter: menara silinder berjendela pita, kaca biru bersegi, podium + menara, kotak kecil ber-AC di atap | Sebagian (`gedungBerjendela`) → perlu jenis gedung (silinder, kaca, podium) + **detail atap** (AC, tangki air, tepi atap) |
| Pohon bulat bergerombol, palem, taman hijau, tribun penonton berwarna | Sebagian (`pohon`) → tambah palem & tribun |
| **Lintasan tergambar** mengitari gedung (garis merah tebal yang memanjang) | **Belum ada** di 3D → garis jalur yang tumbuh mengikuti titik-titik (seperti rute `map`, tapi di dunia 3D) |
| HUD gim: peta lintasan mini + titik berjalan, "LAP 1", kecepatan | **Belum ada** → HUD `minimap` + pil angka (bisa memakai `panel`) |
| Sudut pandang pengemudi / dari jendela kantor (bingkai di depan kamera) | **Belum ada** → `bingkai: 'jendela' \| 'kokpit'` (lapisan 2D di depan dunia) |
| Pil label krem/kuning/merah muda bergaris tepi gelap, huruf tangan, kadang miring sedikit | `label` + `color` ada → perlu varian gaya **pil komik** (garis tepi tebal, bayangan keras, sedikit miring) |
| Dua batang pembanding di atas (merah vs kuning, garis tepi tebal) | `meter` ada → varian gaya komik |
| Penanda lebar di aspal + tiga pil ukuran | `ukur` + `label` (sudah ada) |
| Benda dipasang bertahap + penghitung "minggu ke-N" | `muncul` per objek + `data` menghitung (sudah ada) |
| Peta skematik dalam bingkai berlabel "bukan skala", pin bertahap, jalur putus-putus | `map` ada (peta dunia) → perlu **peta skematik bebas** (garis jalan sederhana + pin) di dalam kartu |
| Lencana tahun di bawah ("2021: …", "2025: …") yang ganti tiap kalimat | `data` / `catatan` (sudah ada) |
| Judul tetap di atas sepanjang video, kata kunci di **kotak kuning** | `bab` + sorotan kuning (sudah ada) |
| Subtitle **huruf besar, putih bergaris tepi hitam, kata kunci kuning-hijau**, 2 baris di tengah | Subtitle ada (kotak hitam) → varian gaya `tepi` (tanpa kotak, garis tepi tebal) |
| Strip sumber kecil di bawah tiap potongan (berganti sesuai isi) | Sudah ada (`source` di `data`/adegan) |
| Penutup kartu kanal dengan maskot | `penutup` seri |

### Aturan naskah dari referensi ini
- **Pertanyaan "gimana kalau" tentang tempat yang dikenal** penonton → dijawab dengan ukuran nyata dibanding tempat lain
  (panjang, lebar, lama pasang), lalu dampaknya ke penonton ("mau lewat mana?"), lalu bukti sejarah, lalu penutup yang
  menyentil kehidupan penonton ("kalau kantor kamu di SCBD…").
- Label di layar = **catatan fakta** 2–5 kata dengan titik dua ("Monaco: 6 minggu masang"), bukan judul promosi.
- Bahasa lisan Jakarta yang wajar ("doang", "bayangin", "kaya"), tanpa kata sifat bombastis dan tanpa penutup klise.
- Akui keterbatasan di layar bila perlu: "peta skematis, bukan skala", "estimasi" di sumber.

### Pelajaran untuk video kita
- Rasa "nyata" datang dari **tata letak yang benar** (peta asli) + **siluet gedung yang khas**, bukan dari tekstur fotorealistis.
- Garis tinta menyatukan semua benda jadi satu gaya — ini yang membuat rakitan bentuk dasar terlihat sengaja, bukan kasar.
- Satu dunia, banyak sudut: atas-bawah, isometrik, pengemudi, jendela kantor — penonton tetap di tempat yang sama.

### Status (2026-11-15)
- **Sudah dibuat:** gaya tinta (`style: 'ink'` / `gaya: 'tinta'`), gedung dari tapak (`prism`: pita, kisi, kaca, detail atap),
  pita jalan (`strip`), kit `src/worlds/kota.ts` + `kotaDariPeta()` + `npm run peta` (OSM). Demo: `Demo-KotaTinta`.
- **Belum:** lintasan yang tergambar memanjang, HUD gim (peta mini, LAP, km/h), bingkai jendela/kokpit, pil & panel gaya komik,
  peta skematik ber-pin, subtitle bergaris tepi.

---

## R4 — Makro 3D sehari-hari: "Laron: badannya ke mana?" (TikTok, ±78 dtk + logo, 9:16)

Dikirim pemilik: "detil, ga banyak tulisan, jelas juga penyampaiannya." Fokus bedahan: **cara menjelaskan dengan gambar,
bukan tulisan**. Yang ditiru tekniknya, bukan brand/isinya.

**Kenapa jelas walau hampir tanpa tulisan:** pertanyaannya muncul dari pemandangan yang semua orang pernah lihat (lantai
teras penuh sayap habis hujan). Tiap kalimat narasi punya **satu gambar yang menjawabnya sendiri** — kalau suaranya
dimatikan, alurnya masih bisa ditebak. Tulisan di layar cuma subtitle + label 1–3 kata; judul besar hanya dua kali
(pertanyaan di awal, tindakan di akhir). Konsep sulit dijelaskan lewat **benda yang dikenal** (garis lepas sayap = "kayak
garis sobekan di bungkus snack", lebar jalur = "selebar pensil").

**Kenapa terasa detail:** kamera makro setinggi serangga; serangga digambar lengkap (ruas badan, kaki beruas, antena,
sayap berurat tembus cahaya); lingkungan nyata dengan teksturnya (keramik bernat, tanah berkerikil + akar, dinding
bercat, pintu, lampu teras); cahaya hangat lembut, **latar kabur** (kedalaman bidang), **debu melayang**, dan **ratusan**
sayap/laron sekaligus (bukan tiga-empat).

### Alur (kalimat dipotong per frase 3–5 kata, ±2–4 dtk per gambar)
| Waktu | Yang terlihat | Kalimat (gaya) |
|---|---|---|
| 0–3 dtk | Lantai teras penuh sayap, satu laron berjalan. Judul besar **"Badannya *ke mana?*"** (kata tanya bergaris bawah oranye) | "Habis hujan, lantai teras penuh sayap laron. Badannya ke mana?" |
| 3–9 | **Irisan tanah 3D**: sarang + terowongan; **lingkaran lup** memperbesar satu ekor ("rayap bersayap"); terowongan berisi laron berlabel "calon ratu / calon raja"; di permukaan, **ikon mahkota** kecil di atas kepala | "Laron itu rayap dewasa bersayap, calon raja dan ratu, yang keluar buat bikin sarang baru." |
| 9–14 | Halaman: keran + selang, hujan turun, laron beterbangan; irisan tanah basah + **catatan kecil bersumber** ("tanah lembap, enak digali · Watson dkk. 2011, PLoS One") | "Hujan sering jadi aba-aba terbang, soalnya tanah jadi lembap, enak digali." |
| 14–20 | Dinding teras, lampu menyala dikerubungi kawanan; lalu pagi: keramik penuh sayap | "Banyak yang ketarik lampu teras. Paginya, sayap numpuk di situ." |
| 20–26 | Pil waktu **"🌙 semalam"**; laron mendarat, sayap terlepas; sayap patah **dicoret X merah** | "Semalam, habis mendarat, sayapnya dibuang. Bukan patah, ngelepas." |
| 26–37 | Makro pangkal sayap: **garis putus-putus merah** + label "garis lepas"; **kartu gambar sisipan** bungkus snack bergaris sobek; laron menekuk perut (**panah lengkung**) menekan pangkal, sayap copot, label "sisa pangkal"; catatan "diamati di rayap Jepang · Matsuura & Nishida 2002" | "Di pangkal tiap sayap udah ada garis lepasnya, kayak garis sobekan di bungkus snack…" |
| 37–45 | Tanah berkerikil + daun: laron bersayap diserang semut; **layar terbagi** dua sisi, tiap sisi bercatatan bersumber ("ketangkep semut", "sayap ngalangin jantan") | "Kenapa dibuang? Di tanah, sayap bikin repot. Gampang ketangkep semut, dan jantan susah nempel ke betina." |
| 45–53 | Dua laron beriringan, label **warna per pihak** (jantan gelap, betina merah muda); **aura bau** merah muda berdenyut di sekitar betina + penanda jarak "± beberapa cm · Mizumoto & Dobata 2019" | "Betina jalan di depan, jantan nempel di belakang. Bau betinanya cuma kecium beberapa senti…" |
| 53–60 | Irisan tanah: mereka menggali, masuk, pintu tertutup; ruang kecil terang, mahkota muncul | "Mereka gali ruang kecil di tanah lembap, terus pintunya ditutup. Di dalam, mereka jadi raja dan ratu." |
| 60–68 | Kembali ke lantai (judul pertanyaan diulang di narasi); **tiga kartu gambar** muncul satu-satu: semut, laba-laba, burung | "Jadi, badannya ke mana? Banyak yang dimakan semut, laba-laba, dan burung." |
| 68–70 | Ruang bawah tanah + catatan "± 75 ekor setelah setahun · UC IPM" dengan garis penunjuk ke telur | "Yang beruntung udah berdua di bawah tanah." |
| 70–76 | Celah dinding dengan laron keluar, label "celah"; kartu sisipan lampu **dicoret X** | "Kalau laron keluar dari celah dinding, bukan ke lampu, biasanya ada rayap." |
| 76–80 | Judul besar kedua **"Cek *jalur tanah*"**; jalur tanah di dinding + **pensil** sebagai pembanding ukuran, catatan "selebar pensil · UC IPM, UKy" | "Cek jalur tanah selebar pensil." |

### Pola → cara membuatnya di sini
| Pola | Status / cara |
|---|---|
| **Hampir tanpa tulisan**: tanpa header bab per adegan; judul besar hanya di hook & tindakan akhir | `bedah3D`: isi `bab` hanya di adegan 1 & adegan tindakan (kosong = lanjut). Perlu opsi **sembunyikan bab** di adegan tengah (sekarang bab sebelumnya tetap tampil) |
| Subtitle 1 baris di tengah layar, putih tebal berbayang, kata aktif di **kotak oranye** | Subtitle ada (kotak hitam 2 baris) → varian `polos` (tanpa kotak, 1 baris, di tengah); warna kata aktif via `colors.highlight` |
| Label 1–3 kata berujung titik + garis penunjuk; warna per pihak | `label` + `color` (sudah ada) |
| **Catatan kecil bersumber** menempel dekat benda (teks tebal + baris sumber huruf mesin tik) | Sebagian: `data` (strip di atas) / `kartu` (di bawah) → perlu label ber-`source` yang menempel di objek |
| **Ikon menempel** tanpa teks (mahkota di atas kepala) | **Belum ada** → `label` dengan `icon` saja (emoji/`line:`), tanpa pil |
| **Lingkaran lup** yang memperbesar satu bagian (lingkaran putih + garis ke label) | **Belum ada** → HUD `lup: { target, zoom, radius, text }` (render ulang view kedua di dalam lingkaran, atau irisan 2D) |
| **Kartu gambar sisipan** (sudut membulat, bisa **dicoret X**), sampai tiga berjajar muncul bergiliran | **Belum ada** → HUD `sisipan: [{ src, label?, coret?, at }]` (gambar/`view` lain di kartu kecil) |
| Coretan X merah di atas benda yang salah ("bukan patah") | **Belum ada** di 3D → `cap` varian `silang` / tanda ✕ menempel di objek |
| Garis putus-putus merah di bagian benda (garis lepas) + panah lengkung gerak | `tube`/`flow` bisa dipakai; perlu garis putus-putus & panah lengkung siap pakai |
| **Aura** berdenyut (bau, panas, sinyal) di sekitar objek | **Belum ada** → objek `aura` (cincin/gradasi radial berdenyut) |
| Penanda jarak dari objek ke titik + catatan bersumber | `ukur` (sudah ada) |
| **Irisan tanah 3D** (balok tanah terpotong: terowongan, ruang, akar, kerikil) | 2D sudah ada (`irisan`, bahan `tanah`) → versi 3D: balok tanah berlubang belum ada |
| **Layar terbagi** dua sisi untuk membandingkan | **Belum ada** → `bagi: [view A, view B]` di scene `world` |
| Pil waktu kecil ("🌙 semalam") untuk lompatan waktu | `data: { text }` / `label` (sudah ada) |
| Pembanding ukuran dari **benda sehari-hari** (pensil, bungkus snack) | Rakit dari bentuk dasar / model `.glb` |
| Serangga & hewan kecil detail (ruas, kaki, antena, sayap berurat) | **Belum ada** → model `.glb` (render lambat) atau kit `serangga()` dari bentuk dasar |
| **Kawanan / ratusan** benda kecil (sayap berserakan, laron mengerubungi lampu) | `flow` untuk yang bergerak; **belum ada** objek "sebar" (banyak salinan acak-deterministik di satu area) |
| Kedalaman bidang (latar kabur), debu melayang, cahaya hangat | **Belum ada** → opsi dunia `fokus` (blur kedalaman) + `debu` (partikel) |
| Hujan | **Belum ada** → efek cuaca `hujan` |

### Aturan naskah dari referensi ini
- **Uji bisu:** tiap kalimat harus terjawab oleh gambarnya sendiri. Kalau butuh tulisan untuk paham, ganti gambarnya.
- Mulai dari **pemandangan sehari-hari yang membingungkan** → jelaskan asalnya → urutan kejadian (semalam → pagi) →
  "kenapa" → nasib akhir (jawab pertanyaan hook dengan kalimat yang sama: "Jadi, badannya ke mana?") → **satu tindakan**
  yang bisa dilakukan penonton ("Cek jalur tanah").
- Konsep sulit dibandingkan dengan **benda yang ada di rumah** (bungkus snack, pensil), bukan istilah.
- Bantah salah kaprah secara visual: tunjukkan yang salah lalu coret ("bukan patah", "bukan ke lampu").
- Angka/fakta tetap bersumber, tetapi ditaruh **kecil di dekat bendanya**, bukan sebagai panel besar.
- Kalimat lisan santai ("ketarik", "nggak boleh jauh-jauh", "bikin repot"), dipotong per frase pendek.

### Pelajaran untuk video kita
- Lebih sedikit tulisan = lebih jelas, **asal** tiap kalimat punya gambar yang tepat. HUD data (R1/R2) dipakai seperlunya.
- Detail datang dari skala makro + tekstur lingkungan + jumlah benda yang banyak + cahaya/fokus, bukan dari efek.
- Satu benda kecil diikuti dari dekat (satu ekor laron) lebih mudah diikuti daripada banyak tokoh.

### Status (2026-11-21)
- **Sudah bisa:** label berwarna per pihak, penanda ukuran, pil waktu (`data`), irisan tanah 2D, warna kata aktif subtitle,
  dunia bersambung antar adegan.
- **Belum:** bab tersembunyi di adegan tengah, subtitle 1 baris tanpa kotak, label bersumber & ikon menempel, lingkaran lup,
  kartu gambar sisipan + coretan X, aura, layar terbagi, irisan tanah 3D, objek sebar (ratusan salinan), fokus/debu/hujan,
  kit serangga.
