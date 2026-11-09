# Motion Studio — Aturan untuk AI

Repo ini adalah **framework animasi**, bukan satu video. Saat diminta membuat/mengubah video:

## Yang BOLEH diubah (99% tugas)
1. `src/projects/<brand>/*.ts` — config video (data saja).
2. `src/projects/index.ts` — daftarkan config baru (1 baris import + 1 entri).
3. `public/brands/<brand>/` — aset (logo, screenshot, musik).
4. `themeOverrides` di config — untuk warna/font brand.

## Yang TIDAK perlu dibaca/diubah
`src/components`, `src/scenes/*View*`, `src/core`, `src/motion`. Animasi sudah selesai.

## Alur kerja minimal (hemat token)
1. Baca **hanya** `src/scenes/types.ts` (kontrak semua scene) — atau `docs/KATALOG-SCENE.md`.
2. Bila cocok, pakai template di `src/templates/*.ts` (baca interface props-nya saja).
3. Salin pola dari `src/projects/price-atlas/reel.ts` (template) atau `promo.ts` (scene manual).
4. Jalankan `npm run typecheck`. Selesai.

## Aturan
- Teks konten dalam Bahasa Indonesia kecuali diminta lain.
- Durasi total: isi `duration` di config, jangan hitung frame manual.
- Ikon: emoji, atau path di `public/` (mis. `brands/x/icon.svg`).
- Jangan menambah komponen baru bila scene yang ada bisa dipakai. Bila memang perlu tipe scene baru, ikuti `docs/MEMPERLUAS.md`.
- ID video: `Brand-Jenis` (mis. `PriceAtlas-Reel20`), unik.

## Perintah
- `npm run studio` — pratinjau
- `npx remotion render <ID> out/<ID>.mp4` — render
- `npm run typecheck` — validasi config
- `npm run render:list` — daftar video; `npm run render:all -- <filter> [--scale=0.5]` — render banyak sekaligus

## Aset
- Audio/video/file desain otomatis Git LFS (`.gitattributes`). Screenshot besar taruh di `public/brands/<brand>/media/`.
- Jangan render kecuali diminta pengguna.
