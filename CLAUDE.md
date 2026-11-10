# Motion Studio — Aturan untuk AI

Repo ini adalah **framework animasi**, bukan satu video. Saat diminta membuat/mengubah video:

## Yang BOLEH diubah (99% tugas)
1. `src/projects/<brand>/*.ts` — config video (data saja).
2. `src/projects/index.ts` — daftarkan config baru (1 baris import + 1 entri).
3. `public/brands/<brand>/` — aset (logo, screenshot, musik).
4. `themeOverrides` di config — untuk warna/font brand.

## Yang TIDAK perlu dibaca/diubah (saat membuat video)
`src/components`, `src/scenes/*View*`, `src/core`, `src/motion`. Untuk tugas membuat/mengubah video, cukup config.

## Pengecualian: tugas meningkatkan animasi
Bila pengguna meminta animasi/efek/transisi baru atau video "lebih hidup", framework **boleh** diubah:
- Primitif gerak baru → `src/motion/` (hook/komponen) + preset di `src/config/animation.ts`.
- Pasang di level framework (`SceneLayout`, `Background`, `Reveal`, komponen) agar **semua video ikut** tanpa mengubah config.
- Bila perlu kontrol per video/scene, tambah properti **opsional** di `src/scenes/types.ts` / tema dengan default yang aman; config lama harus tetap valid.
- Ikuti `docs/MEMPERLUAS.md` (warna dari `useTheme()`, ukuran via `px()`, tanpa angka spring mentah, waktu dalam detik).
- Gerakan harus deterministik dari `useCurrentFrame()` (tanpa `Math.random()`/`Date`), halus, dan tidak mengganggu keterbacaan teks.
- Perbarui `docs/KATALOG-SCENE.md` bila ada properti baru. Jalankan `npm run typecheck`.

## Gerak sepanjang scene (sudah ada)
Semua video otomatis punya kamera pelan + parallax, idle (`<Reveal idle>`), dan animasi keluar bergiliran.
Kekuatan: `energy` `calm`/`normal`/`lively` (default dari tema; explainer otomatis `calm`). Atur via
`motion: { energy, camera, exit }` di config, atau `camera`/`exit` per scene. Detail: `docs/KATALOG-SCENE.md`.

## Tipografi kinetik (sudah ada)
Judul muncul kata per kata dengan gaya dari tema (`rise`/`pop`/`blur`/`typewriter`/`slam`), kata `highlight` mendapat
punch + sapuan gradien + coretan bergiliran (marker → underline → circle), dan bila scene bernarasi kata judul muncul
tepat saat diucapkan. Subtitle fade per baris. Per scene: `textAnimation`, `highlightStyle` (`mix`/`marker`/`underline`/
`circle`/`punch`/`none`). Untuk teks besar ala Reels pakai scene `statement` (`lines[]`, `style: 'stack' | 'replace'`).
Kode: `src/components/KineticText.tsx`, `src/motion/text.tsx`, preset di `src/config/animation.ts`.

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
- `npm run narasi -- <config.ts>` — render suara narasi (video explainer, lihat `docs/EXPLAINER.md`)
- `npm run render:list` — daftar video; `npm run render:all -- <filter> [--scale=0.5]` — render banyak sekaligus

## Video bersuara (narasi / voice-over)
Video **tidak bersuara** kecuali config punya `audio` (musik) atau narasi. Bila pengguna ingin suara/narasi:
1. Baca `docs/EXPLAINER.md`; contoh lengkap `src/projects/soal-skd/bedah-analogi.ts`.
2. Isi `voice`, `narration` (impor `<video>.narration.json`), `overlay`, dan `narration` teks per scene.
3. Render suara **sebelum** render video: `AZURE_SPEECH_KEY=proxy-injected npm run narasi -- <config.ts>`
   (lalu commit `public/narration/<ID>/` + `<video>.narration.json`). Tanpa langkah ini video tetap bisu.
- Suara default pilihan pengguna: **`id-ID-Ardi:DragonHDLatestNeural`, rate `+10%`**.
- Key Azure (region `southeastasia`) tersimpan sebagai network secret di environment cloud **video-remotion**;
  `proxy-injected` hanya placeholder, proxy yang menyuntikkan key. Di environment lain → 401: minta pengguna
  pindah ke environment video-remotion (jangan minta key ditempel di chat).
- Render di sesi cloud: tambahkan `--browser-executable=/opt/pw-browsers/chromium` (unduhan Chrome diblokir).

## Aset
- Audio/video/file desain otomatis Git LFS (`.gitattributes`). Screenshot besar taruh di `public/brands/<brand>/media/`.
- Pengecualian: `public/narration/**` disimpan sebagai file git biasa. Upload Git LFS diblokir dari sesi cloud, jadi aset kecil yang harus ikut push taruh di luar folder `media/`.
- Jangan render kecuali diminta pengguna.
