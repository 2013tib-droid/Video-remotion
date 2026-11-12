---
status: draf         # ide | draf | final | dibuat
id: BagaimanaJika-ListrikPadam
template: kontenHarian
seri: baru           # src/projects/bagaimana-jika/series.ts (lihat "Seri baru")
file: src/projects/bagaimana-jika/listrik-padam.ts  # diisi saat dibuat
durasi: 45–55 dtk
---

# Bagaimana Jika Listrik Jawa–Bali Padam 3 Hari?

## 1. Konsep
- **Tujuan:** penonton sadar betapa rapuhnya kota tanpa listrik, dan tahu apa yang perlu disiapkan di rumah.
- **Penonton:** warga kota Jawa–Bali usia 17–35, pengguna KRL/MRT, serba digital.
- **Pesan utama (1 kalimat):** Tahun 2019 listrik padam sekitar sehari saja dan kota sudah lumpuh. Kalau tiga hari, yang paling cepat habis adalah hal-hal yang tidak kita sadari butuh listrik.
- **Kenapa ditonton sampai habis:** alurnya hitung mundur per jam/hari ("jam ke-1 → hari ke-3"), jadi penonton penasaran apa yang tumbang berikutnya.
- **Gaya acuan:** HUD data bersumber (`docs/REFERENSI.md`). Bagian berandai-andai **wajib** diberi label "skenario", bukan "data".

### Data & sumber
Angka hanya dari sini. Bagian hari ke-2 dan ke-3 adalah **logika/skenario**, tanpa angka.

| Angka / fakta | Sumber + tahun | Jenis |
|---|---|---|
| 4 Agustus 2019, padam mulai ±11.48 WIB (Jakarta, Banten, Jabar) | [Wikipedia: 2019 Java blackout](https://en.wikipedia.org/wiki/2019_Java_blackout); Tempo 2019 | data |
| Sebagian wilayah baru menyala 5 Agustus ±22.00 WIB | [Info Singkat DPR, Agustus 2019](https://berkas.dpr.go.id/pusaka/files/info_singkat/Info%20Singkat-XI-15-I-P3DI-Agustus-2019-230.pdf) | data |
| 21,9 juta pelanggan terdampak (laporan awal: 21,3 juta) | PLN di RDP DPR, 6 Agustus 2019; [Info Singkat DPR](https://berkas.dpr.go.id/pusaka/files/info_singkat/Info%20Singkat-XI-15-I-P3DI-Agustus-2019-230.pdf) | data |
| 4 kereta MRT tertahan di bawah tanah, penumpang dievakuasi | [CNN Indonesia, 4 Agustus 2019](https://www.cnnindonesia.com/nasional/20190804125114-20-418180/listrik-padam-empat-kereta-mrt-tertahan-di-bawah-tanah) | data |
| 240 perjalanan KRL batal | [CNN Indonesia, 4 Agustus 2019](https://www.cnnindonesia.com/nasional/20190804183747-20-418274/total-240-perjalanan-commuter-line-batal-karena-listrik-padam) | data |
| Lampu lalu lintas Jakarta mati, diatur manual; sinyal XL & Telkomsel terganggu | Tirto, Indonesia Expat, 2019 | data |
| Kompensasi PLN ±Rp 839 miliar | PLN di RDP DPR, 6 Agustus 2019 | data |
| Pompa air, ATM, SPBU, kulkas, dan BTS butuh listrik | logika umum | skenario |

### Seri baru
- Brand: **Bagaimana Jika?** · idPrefix `BagaimanaJika` · Tema: `ModernDark` · Musik: `semangat` · Watermark: `true` (ganti `@handle` bila sudah ada)
- Penutup baku: judul "Mau skenario apa lagi?" · highlight "skenario" · tombol "Follow" ·
  narasi "Tulis skenario 'bagaimana jika' versimu di komentar. Follow untuk jawabannya."

## 2. Alur & narasi
±125 kata ≈ 47 dtk.

### 0 · Hook (≤ 3 dtk)
- **Layar:** `kata` — "Jawa–Bali gelap 3 hari." _(highlight: 3 hari)_
- **Narasi:** Bagaimana jika listrik Jawa dan Bali padam tiga hari?

### 1 · angka — Ini pernah terjadi, 2019
- **Layar:** angka "21,9 juta pelanggan" + "4 Agustus 2019" _(highlight: 2019)_ · sumber: PLN/DPR 2019
- **Narasi:** Ini bukan khayalan. Empat Agustus dua ribu sembilan belas, dua puluh satu koma sembilan juta pelanggan PLN mendadak gelap.

### 2 · poin — Jam pertama: kota berhenti
- **Layar:** _(highlight: Jam pertama)_
- **Isi:** 🚇 4 MRT tertahan di bawah tanah · 🚆 240 perjalanan KRL batal · 🚦 Lampu lalu lintas mati · 📶 Sinyal seluler terganggu
- **Narasi:** Dalam hitungan jam, empat kereta MRT tertahan di bawah tanah, dua ratus empat puluh perjalanan KRL batal, lampu lalu lintas mati, dan sinyal ponsel terganggu.

### 3 · teks — Itu baru sehari
- **Layar:** "Itu baru ±34 jam." / "Bayangkan 72 jam." _(highlight: 72 jam)_
- **Narasi:** Itu pun sebagian wilayah baru menyala lagi besok malamnya. Sekarang bayangkan tiga hari penuh.

### 4 · langkah — Skenario hari ke-2 dan ke-3
- **Layar:** label kecil "SKENARIO" _(highlight: Hari ke-2)_
- **Isi:** 1. Hari ke-2: air keran berhenti (pompa butuh listrik) · 2. Hari ke-2: ATM & QRIS mati, uang tunai jadi raja · 3. Hari ke-3: SPBU sulit memompa bensin · 4. Hari ke-3: isi kulkas mulai basi
- **Narasi:** Hari kedua, pompa air berhenti dan keran kering. ATM dan QRIS tidak jalan, uang tunai jadi raja. Hari ketiga, SPBU sulit memompa bensin, dan isi kulkas mulai basi.

### 5 · banding — Yang selamat vs yang tumbang
- **Layar:** tabel 2 kolom _(highlight: selamat)_
- **Isi:** Punya uang tunai ↔ Hanya dompet digital · Stok air galon ↔ Bergantung pompa · Senter & power bank ↔ Hanya lampu rumah
- **Narasi:** Yang bertahan bukan yang paling kaya, tapi yang punya uang tunai, stok air, dan senter.

### Kesimpulan
- **Layar:** `kata` — "Siapkan sebelum gelap." _(highlight: sebelum gelap)_
- **Narasi:** Listrik padam tidak bisa kita cegah, tapi bisa kita siapkan. Mulai dari tiga hal tadi.

→ disusul penutup seri.

**Lexicon:** PLN → "Pe El En" · KRL → "Ka Er El" · MRT → "Em Er Te" · QRIS → "kris" · ATM → "A Te Em" · SPBU → "Es Pe Be U"

## 3. Catatan revisi
- (2026-11-12) Draf pertama. Angka 2019 sudah dicek ke sumber di tabel. Bagian 4 murni skenario, jadi beri label di layar.
- Bila mau versi 3D (`bedah3D`): adegan kota malam → lampu padam per blok → kamera turun ke stasiun MRT. Lebih memikat tapi lebih lama dirender.
