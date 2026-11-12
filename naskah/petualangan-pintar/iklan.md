---
status: dibuat       # ide | draf | final | dibuat
id: PetualanganPintar-Iklan
template: promoProyek
seri: baru
file: src/projects/petualangan-pintar/iklan.ts
durasi: ±40 dtk (narasi 38,8 dtk)
---

# Iklan Petualangan Pintar — "Belum bisa baca? Tetap bisa belajar."

Sumber: `docs/promo/brief.md` di repo `2013tib-droid/game-edukasi-anak` (commit `9f10d75`, 2026-11-12).
Aset sudah disalin ke `public/brands/petualangan-pintar/` (5 screenshot, `logo.svg`, `petualang.webp`).

## 1. Konsep
- **Tujuan:** orang tua membuka petualanganpintar.com dan menekan "Coba Gratis".
- **Penonton:** orang tua anak Playgroup, TK, dan SD kelas 1–4 (4–10 th) yang mencari tontonan HP yang bermanfaat dan aman.
- **Pesan utama (1 kalimat):** Anak yang belum lancar membaca pun bisa belajar sendiri, karena semua soal dibacakan, tanpa iklan, dan salah itu boleh.
- **Kenapa ditonton sampai habis:** hook menyentuh kekhawatiran orang tua, lalu gameplay nyata (menulis huruf, "Hebat kamu benar!", maskot jadi naga).
- **Gaya acuan:** ceria dan hangat. Warna mengikuti brand (kuning krem, merah muda, biru muda, oranye). **Tanpa ungu.**

### Data & sumber
| Angka / fakta | Sumber + tahun | Jenis |
|---|---|---|
| 47 game (TK 14 · SD 1–2: 15 · SD 3–4: 18) | `src/games/registry.ts`, 2026-11 | data |
| 565 level | config `src/games/{tk,sd1,sd2}/*.ts`, 2026-11 | hitungan repo |
| ±2.600 variasi soal (2.646) | idem, kolam soal per level | hitungan repo |
| 20 tahap maskot (telur → Naga Legenda) | `src/engine/core/mascot.ts` | data |
| Semua instruksi dibacakan suara Bahasa Indonesia | CLAUDE.md + `scripts/narration-lines.json` | fitur |
| Tanpa iklan, tanpa tautan keluar di area anak | CLAUDE.md game | fitur |
| Playgroup & TK: Rp19.000, sekali bayar (harga tetap) | pemilik, 2026-11-12 | harga |

**Tidak boleh diklaim:** bisa offline, ada di Play Store/App Store, rating/jumlah pemain, testimoni, "update gratis selamanya".

### Seri baru
- Brand: **Petualangan Pintar** · logo `brands/petualangan-pintar/logo.svg` · url **petualanganpintar.com**
- Tema: `PlayfulKids` (koral, kuning, toska, tanpa ungu). Bisa disesuaikan ke warna brand dari brief.
- Musik: `semangat` · Watermark: `true` (handle medsos **belum ada**)
- Suara: default seri (Ardi, pria). **Alternatif:** `id-ID-Gadis:DragonHDLatestNeural` agar sama dengan suara di dalam game.
- Penutup baku: judul **"Coba gratis sekarang."** · tombol **"Coba Gratis"** · url petualanganpintar.com
  · narasi "Coba gratis sekarang di petualangan pintar titik kom."

## 2. Alur & narasi
Total narasi ±90 kata ≈ 33–38 dtk.

### 0 · Hook (≤ 3 dtk)
- **Layar:** Belum bisa baca? Tetap bisa belajar. _(highlight: Tetap bisa belajar)_
- **Narasi:** Anak belum lancar membaca? Tetap bisa belajar sendiri.

### 1 · Keluhan (teks bertumpuk)
- **Layar:** "Game penuh iklan." · "Belajar bikin bosan." · "Takut salah."
- **Narasi:** Bukan game penuh iklan, bukan belajar yang membosankan.

### 2 · Solusi
- **Layar:** eyebrow "Kenalkan Petualangan Pintar" · **Belajar seru, tanpa terasa belajar.** _(highlight: tanpa terasa belajar)_
- **Tagline:** Game edukasi untuk Playgroup, TK, dan SD.
- **Narasi:** Kenalkan Petualangan Pintar, game edukasi untuk anak Playgroup, TK, dan SD.

### 3 · Layar — `03-gameplay-benar.jpg` (HP)
- **Judul:** Setiap soal dibacakan suara. _(highlight: dibacakan)_
- **Narasi:** Setiap soal dibacakan, jadi anak yang belum bisa membaca tetap bisa main.

### 4 · Layar — `04-gameplay-tulis.jpg` (HP)
- **Judul:** Menulis huruf mengikuti jalur. _(highlight: mengikuti jalur)_
- **Narasi:** Jarinya menyusuri jalur, belajar menulis huruf dengan urutan yang benar.

### 5 · Layar — `05-selamat.jpg` (HP)
- **Judul:** Kumpulkan bintang, maskot tumbuh. _(highlight: maskot tumbuh)_
- **Narasi:** Kumpulkan bintang, dan teman belajarnya tumbuh sampai jadi naga.
- _Catatan: progres di screenshot ini diisi khusus (622 ⭐), tapi tampilannya asli._

### 6 · Fitur — "Aman dan bikin betah" _(4 item)_
- 🎮 **Banyak cara main** — Hitung, labirin, coding, cerita
- 💛 **Salah itu boleh** — Tanpa hukuman, berani coba lagi
- 🛡️ **Tanpa iklan** — Aman, tanpa tautan keluar
- 💳 **Sekali bayar** — Tanpa langganan bulanan
- 💳 deskripsi diganti: **Playgroup & TK cuma Rp19.000**
- **Narasi:** Tanpa iklan, tanpa hukuman saat salah. Untuk Playgroup dan TK, cukup sekali bayar sembilan belas ribu rupiah.

### 7 · Bukti (angka)
- **Layar:** **47** game · **565** level · **2.600+** variasi soal
- **Narasi:** Ada empat puluh tujuh game, lima ratus enam puluh lima level, dan lebih dari dua ribu enam ratus variasi soal.

### CTA (penutup seri)
- **Layar:** Coba gratis sekarang. · tombol "Coba Gratis" · petualanganpintar.com
- **Narasi:** Coba gratis sekarang di petualangan pintar titik kom.

**Lexicon:** TK → "té-ka" · SD → "és-dé" · Playgroup → "plé-grup"

## 3. Catatan revisi
- 2026-11-12 — draf pertama dari brief repo game. Perlu keputusan pemilik:
  1. Handle TikTok/Instagram untuk watermark & penutup (belum ada).
  2. Suara narator: Ardi (default) atau Gadis (sama dengan suara di dalam game)?
  3. Tampilkan harga ("mulai Rp19.000, sekali bayar") di penutup? Ini harga perkenalan, jadi video bisa cepat basi.
  4. `src/projects/petualangan-pintar/promo.ts` (video lama, contoh awal framework) berisi data karangan: maskot burung hantu,
     domain `.id`, badge App Store/Google Play. Usul: hapus setelah iklan ini dibuat.
- 2026-11-12 — keputusan pemilik: suara Ardi; Rp19.000 untuk Playgroup & TK adalah harga tetap → masuk fitur & narasi;
  `promo.ts` lama dihapus; watermark logo + nama brand sampai ada akun medsos. Config dibuat → revisi berikutnya di `.ts`.
