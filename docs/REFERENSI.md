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

## R4 — Diorama dalam kartu, gaya editorial: "Bagaimana hujan turun?" (±14 dtk, 9:16)

Dikirim pemilik: "versi simple tapi elegan dan detil menarik. Aku suka." Rencana pemilik: tiap topik dibuat **dua versi —
panjang dan pendek** (lihat di bawah). Yang ditiru tekniknya, bukan isinya.

**Kenapa terasa elegan:** satu layar yang **tidak pernah ganti tata letak** — latar krem polos, satu kartu sudut membulat
berisi **diorama 3D kecil** (pulau bundar melayang: laut, pantai, hutan cemara low-poly, gunung bersalju, sungai), teks di
bawahnya. Yang berubah hanya **suasana di dalam kartu** dan **teks tahap**. Tidak ada transisi potong, tidak ada kamera
terbang, tidak ada ikon/emoji — semua gerak "kecil tapi hidup".

**Kenapa detailnya menarik:** tiap tahap punya **gerak alam sendiri** di diorama, dan **warna latar kartu** ikut bercerita:
hijau mint cerah (panas) → biru muda (mendingin) → biru tua (hujan) → kembali mint (siklus selesai). Matahari mengecil &
meredup saat mendung, awan tumbuh lalu menggelap, ada riak lingkaran di laut saat hujan, sungai mengalir. Satu pil label
kecil ("● Tetes hujan") menempel pada benda yang sedang dibahas.

### Tata letak tetap (atas → bawah)
| Bagian | Isi | Gaya |
|---|---|---|
| Eyebrow | "○ SIKLUS AIR" | huruf kapital kecil, spasi lebar, lingkaran garis hijau tua |
| Judul 2 baris | "**Bagaimana**" / "*hujan turun?*" | baris 1 sans tebal hitam; baris 2 **serif miring hijau** (kontras dua huruf) |
| Kartu diorama | ±60% tinggi layar, sudut membulat besar, kisi halus samar di latar | latar gradasi berganti per tahap |
| Penanda tahap | "TAHAP 3 DARI 4" | kapital kecil hijau, spasi lebar |
| Nama tahap | "Presipitasi" | sans tebal besar |
| Deskripsi | 1–2 kalimat pendek, ±12 kata | sans biasa abu tua |
| Progres bersegmen | 4 garis + nama pendek di bawahnya (Penguapan · Awan terbentuk · Hujan turun · Air kembali) | segmen aktif **terisi bertahap** sepanjang tahap, nama aktif tebal hijau; segmen lewat tetap penuh |

### Alur (4 tahap × ±3,4 dtk)
| Waktu | Diorama | Teks tahap |
|---|---|---|
| 0–3,5 | Latar mint terang, matahari besar bersinar; **titik-titik uap naik** berkelok dari laut ke atas; pil "Uap air"; awan kecil mulai muncul | Tahap 1 · Evaporasi · "Panas matahari membuat air laut menguap dan naik ke udara." |
| 3,5–7 | Latar bergeser ke **biru muda**; awan **tumbuh** jadi gumpalan putih; jejak uap masih naik; pil "Butiran air" pindah ke awan | Tahap 2 · Kondensasi · "Uap air mendingin dan berubah jadi butiran kecil yang membentuk awan." |
| 7–10,5 | Latar **biru tua**, matahari hilang, awan menggelap & membesar; **hujan garis-garis** jatuh; **riak lingkaran** di laut; pil "Tetes hujan" | Tahap 3 · Presipitasi · "Butiran air bergabung. Saat cukup besar, butiran itu jatuh sebagai hujan." |
| 10,5–14 | Langit cerah kembali ke mint, awan memutih & mengecil, matahari muncul lagi; **sungai berkilau mengalir** ke laut; pil "Aliran sungai" | Tahap 4 · Air kembali ke laut · "…Siklus pun berulang." |

Pergantian teks tahap: teks lama **memudar** (±0,3 dtk), teks baru muncul — judul atas, kartu, dan progres tidak bergerak.
Suasana kartu berubah **menyatu** (warna & benda), bukan dipotong.

### Pola → cara membuatnya di sini
| Pola | Status / cara |
|---|---|
| Tata letak editorial tetap: eyebrow + judul 2 gaya + kartu dunia + panel tahap + progres bersegmen | **Belum ada** → mode tata letak `world` baru (mis. `layout: 'kartu'`): dunia digambar di kartu membulat, teks tahap di bawah |
| Judul dua huruf: sans tebal + **serif miring** berwarna | **Belum ada** → `highlight` bergaya `serif` (font serif miring dari tema) |
| Progres bersegmen bernama, terisi sepanjang tahap | **Belum ada** → `langkah: ['Penguapan', …]` di level adegan/template |
| "TAHAP n DARI N" + nama + deskripsi yang memudar berganti | Sebagian (`cards[]` + `at`) → panel tahap otomatis dari daftar tahap |
| Diorama pulau melayang (cakram laut, pantai, hutan cemara, gunung salju, sungai) | Sebagian (`pohon`, bentuk dasar di `src/worlds/benda.ts`) → kit `src/worlds/alam.ts`: `pulau()`, `gunung()`, `cemara()`, `sungai()` |
| **Warna latar berganti per tahap** (gradasi, menyatu) | `sky` ada (satu warna) → `sky` per shot/tahap dengan peralihan halus |
| Partikel di dunia: uap naik, hujan jatuh, riak di air | **Belum ada** di 3D (`particles` hanya latar 2D) → objek `partikel` (`naik` · `hujan` · `riak`) deterministik dari frame |
| Awan tumbuh/menggelap, matahari mengecil/meredup | `muncul` + `motion` ada untuk posisi/ukuran → perlu animasi **warna/kecerahan** objek |
| Pil label kecil berpindah benda | `labels[]` + `at` (sudah ada) |
| Kamera nyaris diam, putar pelan | `shots[]` dengan geser kecil (sudah ada) |

### Versi panjang & pendek (rencana pemilik)
Satu topik → **dua file config dari satu daftar tahap** yang sama (dunia, tahap, label dipakai bersama; beda di narasi & durasi):
- **Pendek (±15–25 dtk, Reels/Shorts):** persis gaya R4 — 3–5 tahap, ±3–5 dtk per tahap, tanpa narasi atau narasi sangat
  singkat, musik `tenang`. Teks tahap yang menjelaskan; penonton bisa baca dalam satu tarikan napas.
- **Panjang (±60–120 dtk):** tata letak sama, tapi tiap tahap dipecah jadi 2–4 kalimat narasi (≈ 4 dtk/kalimat, aturan
  `bedah3D`); kamera boleh mendekat ke bagian yang dibahas lalu kembali; tambah 1–2 angka bersumber per tahap (`data`/kartu);
  progres tetap 4 segmen agar penonton tahu posisinya. Hook di awal + penutup seri.
- Cara membuatnya nanti: template baru (mis. `tahapan3D`) yang menerima `tahap[]` dan `versi: 'pendek' | 'panjang'`, atau
  satu file tahap bersama yang diimpor oleh `<topik>-pendek.ts` dan `<topik>-panjang.ts`.

### Aturan naskah dari referensi ini
- Judul = pertanyaan sederhana yang anak SD pun penasaran ("Bagaimana hujan turun?"); kata kuncinya di baris serif miring.
- Proses dipecah **3–5 tahap** bernama istilah resmi (Evaporasi) + nama awam di progres (Penguapan). Deskripsi 1–2 kalimat,
  sebab → akibat, tanpa kata sifat.
- Satu tahap = satu perubahan yang **terlihat** di diorama. Kalau tidak bisa digambar, gabungkan dengan tahap lain.
- Penutup menyambung ke awal ("Siklus pun berulang") — cocok untuk video yang di-loop.

### Pelajaran untuk video kita
- Elegan = **satu tata letak tetap + sedikit warna + banyak ruang kosong**; detail ditaruh di gerak kecil, bukan di teks.
- Warna latar adalah alat cerita yang murah: pergantian suasana terasa tanpa satu potongan pun.
- Progres bersegmen membuat video pendek terasa "selesai" dan memancing tonton ulang.

### Status (2026-11-20)
- **Belum dibuat:** semua bagian di atas (tata letak kartu, judul serif, progres bersegmen, kit alam, partikel 3D, `sky` per tahap,
  template panjang/pendek).
