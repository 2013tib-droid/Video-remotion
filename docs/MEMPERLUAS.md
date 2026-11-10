# Memperluas Sistem

Lakukan ini **jarang**. Sebagian besar kebutuhan bisa dipenuhi config.

## Tema baru
1. Salin `src/themes/ModernSaaS.ts` → `src/themes/NamaTema.ts`, ubah nilai.
2. Daftarkan di `THEMES` pada `src/themes/index.ts`.
3. Font baru: `npm i @fontsource/<font>` lalu import bobotnya di `src/config/fonts.ts` dan tambahkan ke `FONT_STACKS`.

Catatan: `colors.primary` sebaiknya hex 6 digit (dipakai dengan suffix alpha, mis. `#6366f114`).

## Komponen baru
- Ambil semua warna/font/radius dari `useTheme()`; ukuran via `px()`/`type`/`space`.
- Animasi via `<Reveal>`, `useSpring`, `useStagger` — jangan menulis angka spring.
- Elemen non-teks (kartu, ikon, badge) beri `<Reveal idle>` agar tetap bergerak setelah muncul. `Reveal` otomatis ikut animasi keluar (matikan dengan `exit={false}`). Hook lain: `useIdle`, `useSceneExit`, `useCamera` (`src/motion/scene.tsx`).
- Teks judul: pakai `<Heading>` (tipografi kinetik + aksen otomatis) atau `<KineticText>`; subtitle/paragraf: `<LineText>` (fade per baris). Jangan beri teks `idle`.
- Ikon: pakai `<Icon src>` (emoji/`line:`/`draw:`/Lottie otomatis beranimasi). Di dalam `<Reveal>` ikon ikut delay pembungkus; di luar, beri `delay`. Ikon garis baru: tambah path 24×24 di `LINE_ICONS` (+ emoji di `EMOJI_ICONS`).
- Suara: `<Reveal idle>` otomatis berbunyi `pop`; suara lain lewat `<Sfx name="ting" at={detik} />` (`src/motion/sfx.tsx`), volume dari `SFX_VOLUME`. File baru: tambah di `scripts/build-sfx.mjs` + `SFX_FILES`.
- Terima `delay` (detik) sebagai prop.
- Ekspor dari `src/components/index.ts`.

## Tipe scene baru
1. Tambah interface `XScene extends SceneBase, SceneHeading { type: 'x'; ... }` di `src/scenes/types.ts` dan masukkan ke union `SceneConfig`.
2. Buat `XSceneView` memakai `SceneLayout` + `SceneTitle` + komponen.
3. Daftarkan di `REGISTRY` (`src/scenes/registry.tsx`) — TypeScript akan error bila terlewat.
4. Tambah durasi default di `src/config/scenes.ts` dan baris di `docs/KATALOG-SCENE.md`.

## Template baru
Buat `src/templates/Nama.ts`: fungsi `(props) => VideoConfig` yang menyusun scene. Gunakan `baseConfig()` dan `compact()` dari `templates/types.ts`. Ekspor dari `templates/index.ts`.

## Isi layar ponsel baru
Tambah varian di `ScreenConfig` (`scenes/types.ts`), komponen di `components/screens/`, dan `case` di `Screen` (`scenes/DeviceScene.tsx`).
