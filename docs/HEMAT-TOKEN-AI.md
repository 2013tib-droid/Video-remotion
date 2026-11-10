# Hemat Token Saat Bekerja dengan AI

Motion Studio dirancang agar AI cukup **menulis data**, bukan kode animasi.

## Contoh prompt yang efisien

> Buat konten harian (kontenHarian, seri `harian`): topik Keuangan, hook "Gaji selalu numpang lewat?", 3 bagian: … Narasi: …

AI hanya perlu: `CLAUDE.md` + interface props template (±70 baris) + menulis 1 file (±30 baris). Tidak ada pendaftaran,
tidak ada impor narasi, tidak ada pengaturan tema/suara/transisi (semua dari seri).

## Praktik terbaik

1. **Sebut template dan seri** di prompt (`kontenHarian`/`promoProyek`, seri mana) — AI tidak perlu menjelajah.
2. **Satu brand = satu `series.ts`** — tema, suara, CTA baku ditulis sekali, tidak diulang per video.
3. **Satu brand = satu folder** di `src/projects/`; satu video = satu file.
4. **Berikan konten final** (judul, fitur, angka) di prompt; jangan minta AI "mengarang lalu revisi".
5. **Ubah dengan diff kecil**: "Di `PriceAtlas-Reel20`, ganti hook menjadi …" — AI cukup mengedit satu baris.
6. **Jangan minta komponen baru** kecuali scene yang ada benar-benar tidak cukup; cek `docs/KATALOG-SCENE.md` dulu.
7. **Variasi format** = salin config dengan `format` berbeda, bukan scene baru.
8. **Revisi gaya** (warna, kecepatan) lewat `themeOverrides` atau token di `src/config`, bukan per komponen.
9. Validasi dengan `npm run cek` (murah) sebelum render (mahal).
10. Minta AI membaca `src/scenes/types.ts` saja, bukan folder `components/`.

## Storyboard dari AI lain

Tulis naskah/storyboard di chat AI biasa (ChatGPT, Gemini, Claude.ai) dengan prompt di [`PROMPT-STORYBOARD.md`](PROMPT-STORYBOARD.md), lalu kirim hanya hasil final ke Claude Code.

## Template prompt

```
Pakai Motion Studio (baca CLAUDE.md). Buat video:
- Template: <kontenHarian | promoProyek>
- Seri: <src/projects/<brand>/series.ts | buat seri baru: nama, tema, CTA baku>
- Isi: slug, hook, bagian/fitur, narasi, kesimpulan/CTA …
Tulis satu file config, render narasi, jalankan npm run cek. Jangan render video.
```
