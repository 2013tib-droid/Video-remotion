# Hemat Token Saat Bekerja dengan AI

Motion Studio dirancang agar AI cukup **menulis data**, bukan kode animasi.

## Contoh prompt yang efisien

> Buat Instagram Reel 20 detik untuk PriceAtlas pakai Motion Studio. Tema ApplePremium. Pakai template socialMediaShort. Sorot 3 fitur: bandingkan harga, pindai struk, alert harga turun. CTA "Unduh Gratis".

AI hanya perlu: membaca `CLAUDE.md` + `src/templates/SocialMediaShort.ts` (±40 baris), menulis 1 file config (±30 baris), menambah 2 baris di `src/projects/index.ts`.

## Praktik terbaik

1. **Sebut template dan tema secara eksplisit** di prompt — AI tidak perlu menjelajah.
2. **Sebut file brand yang sudah ada** ("pakai `brand.ts` PriceAtlas") — hindari penulisan ulang data brand.
3. **Satu brand = satu folder** di `src/projects/` dengan `brand.ts` bersama.
4. **Berikan konten final** (judul, fitur, angka) di prompt; jangan minta AI "mengarang lalu revisi".
5. **Ubah dengan diff kecil**: "Di `PriceAtlas-Reel20`, ganti hook menjadi …" — AI cukup mengedit satu baris.
6. **Jangan minta komponen baru** kecuali scene yang ada benar-benar tidak cukup; cek `docs/KATALOG-SCENE.md` dulu.
7. **Variasi format** = salin config dengan `format` berbeda, bukan scene baru.
8. **Revisi gaya** (warna, kecepatan) lewat `themeOverrides` atau token di `src/config`, bukan per komponen.
9. Validasi dengan `npm run typecheck` (murah) sebelum render (mahal).
10. Minta AI membaca `src/scenes/types.ts` saja, bukan folder `components/`.

## Storyboard dari AI lain

Tulis naskah/storyboard di chat AI biasa (ChatGPT, Gemini, Claude.ai) dengan prompt di [`PROMPT-STORYBOARD.md`](PROMPT-STORYBOARD.md), lalu kirim hanya hasil final ke Claude Code.

## Template prompt

```
Pakai Motion Studio (baca CLAUDE.md). Buat video:
- ID: <Brand>-<Jenis>
- Brand: <nama / file brand.ts yang ada>
- Tema: <ApplePremium|ModernSaaS|PlayfulKids|Corporate|IslamicWarm>
- Format: <vertical|landscape|square|portrait>, durasi <N> detik
- Template: <nama template / "scene manual">
- Konten:
  - Hook/judul: ...
  - Fitur: ...
  - CTA: ...
Hanya tulis config + daftarkan di projects/index.ts. Jalankan typecheck.
```
