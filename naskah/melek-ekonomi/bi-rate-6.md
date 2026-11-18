---
status: dibuat
id: MelekEkonomi-BIRate6
template: bedah3D
seri: src/projects/melek-ekonomi/series.ts
file: src/projects/melek-ekonomi/bi-rate-6.ts
durasi: ±65 dtk
---

# BI naikkan suku bunga jadi 6% — siapa untung, siapa rugi?

> Narasi kini direvisi di file `.ts` (sumber suara & subtitle). File ini tinggal catatan konsep.

## 1. Konsep
- **Tujuan:** penonton paham dampak kenaikan BI Rate ke debitur, bank, SBN, dan saham.
- **Penonton:** umum, investor pemula, mahasiswa, karyawan (18–45 th).
- **Pesan utama:** kenaikan bunga bukan selalu kabar buruk — dampaknya beda untuk tiap pihak.
- **Gaya:** dunia 3D semi-isometrik, fintech premium (abu-abu dingin; biru = institusi, merah = negatif/kenaikan bunga,
  hijau = untung, kuning = perhatian). Template `bedah3D`, satu dunia: BI di tengah, 4 zona dampak di sekelilingnya.

### Data & sumber
| Angka / fakta | Sumber | Jenis |
|---|---|---|
| BI Rate 5,75% → 6,00% | brief pengguna (Bank Indonesia) | data |
| Cicilan Rp4.000.000 → Rp4.400.000 | brief pengguna | ilustrasi |
| Kupon obligasi lama 5% | brief pengguna | ilustrasi |
| Arah inflasi/permintaan/harga obligasi/saham | logika umum kebijakan moneter | ilustrasi ("Arah umum") |

## 2. Alur (16 scene · versi 2 infografis)
Versi 1 (dunia 3D) dinilai pemilik 50/100: membingungkan, benda kecil abstrak bergerak bersamaan. Versi 2: satu kalimat = satu layar
dengan satu pesan. Narasi tidak berubah.

| # | Narasi (ringkas) | Layar |
|---|---|---|
| 1 | Breaking! … jadi 6 persen. | `words`: BREAKING · BI Rate · naik · 6% (caption 5,75% → 6,00%) |
| 2 | Tapi, siapa … paling terdampak? | `features` 2×2: Debitur · Bank · SBN · Saham |
| 3 | BI … menahan inflasi dan menjaga nilai rupiah. | `relation`: Bunga ↑ → menahan → Inflasi; → menjaga → Nilai rupiah |
| 4 | Caranya, mengurangi uang yang beredar… | `timeline`: Bunga naik → Uang beredar berkurang → Harga stabil |
| 5 | …pinjaman berbunga mengambang, cicilan bisa naik. | `device`: aplikasi "Pinjaman saya" (KPR, mobil, kartu kredit ▲) + notifikasi |
| 6 | Beban … ikut bertambah. | `calculation`: Rp4.000.000 + Rp400.000 = Rp4.400.000 (ilustrasi) |
| 7 | Bank … pendapatan bunga lebih besar. | `hero` ikon bank: "Pendapatan bunga bank naik" |
| 8 | Namun risikonya juga meningkat… | `features`: Pendapatan bunga ↑ · Risiko gagal bayar ↑ |
| 9 | …harga obligasi lama biasanya turun. | `relation`: Suku bunga ↑ → Harga obligasi lama ↓ |
| 10 | …SBN baru … imbal hasil lebih menarik. | `comparison`: Obligasi lama (kupon 5%) vs SBN baru |
| 11 | Pasar saham sering tertekan… | `device`: "Pasar hari ini" saham ▼ / obligasi ▲ + notifikasi dana pindah |
| 12 | …perbankan bisa lebih tahan… | `features`: Perbankan tahan · Properti tertekan · Growth sensitif |
| 13 | Jadi … bukan selalu kabar buruk. | `statement` |
| 14 | Dampaknya berbeda untuk setiap pihak. | `comparison` Untung/Rugi per pihak |
| 15 | Memahami hubungan ini… | `hero` ikon lampu: "Pahami arah bunga" |
| 16 | Follow untuk belajar… | penutup seri |
