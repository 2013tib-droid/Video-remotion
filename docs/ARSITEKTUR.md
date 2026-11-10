# Arsitektur

## Lapisan

```
VideoConfig (data)          src/projects/*        ← ditulis per video
   │
   ▼
Template (opsional)         src/templates/*       props sederhana → VideoConfig
   │
   ▼
MotionVideo (mesin)         src/core/MotionVideo  tema + timeline + TransitionSeries
   │
   ├─ computeTimeline       src/core/timeline     durasi, skala ke target, transisi
   ├─ ThemeProvider         src/themes            token terskala per format
   ▼
Scene views                 src/scenes/*          tipe scene → tata letak
   ▼
Komponen                    src/components/*      blok visual reusable
   ▼
Primitif motion             src/motion/*          useSpring, useEntrance, <Reveal>...
   ▼
Token                       src/config/*          spring, easing, durasi, tipografi, spasi
```

Setiap lapisan hanya bergantung pada lapisan di bawahnya. Konten tidak pernah berada di komponen; animasi tidak pernah berada di config.

## Token desain (`src/config`)

| File | Isi |
|---|---|
| `animation.ts` | `SPRINGS` (smooth, gentle, snappy, bouncy, heavy), `DURATIONS` (fast/normal/slow), `EASINGS`, `STAGGER`, `ENTRANCES` (fadeUp, blurUp, pop, ...), `ICON_ANIMATION` & `ICON_IDLE` (ikon tergambar) |
| `typography.ts` | `TYPE_SCALE` (display → label), `LINE_HEIGHT`, `PORTRAIT_TYPE_BOOST` |
| `spacing.ts` | `SPACING` xs → xxl |
| `formats.ts` | `FORMATS` + `SAFE_AREA` per format |
| `transitions.tsx` | Nama transisi → presentasi `@remotion/transitions` (fade, zoom, slide, wipe, flip, cube, clockWipe, iris, pushCut) + `mix` bergiliran (`resolveTransition`) |
| `scenes.ts` | Durasi default per tipe scene |
| `fonts.ts` | Font lokal (@fontsource) |

Semua ukuran ditulis dalam **px basis 1080** (sisi terpendek). `ThemeProvider` mengalikan dengan `scale` sehingga satu config dapat dirender di 9:16, 16:9, 1:1, dan 4:5.

## Tema (`src/themes`)

Tema = objek `Theme`: warna, gradien, font, bobot, tracking, radius, bayangan, **kepribadian gerak** (`motion.spring`, `motion.entrance`, `motion.stagger`, `motion.transition`, `motion.icons`), dan jenis background. Karena gerak juga bagian tema, mengganti `ApplePremium` → `PlayfulKids` mengubah tampilan **dan** rasa animasi (halus → memantul) tanpa menyentuh komponen.

## Sistem animasi (`src/motion`)

- `useSpring({ delay, spring })` → progres 0..1. Fondasi semuanya.
- `useEntrance({ preset, delay })` / `<Reveal>` → animasi masuk konsisten dari preset.
- `useStagger()` → delay berurutan sesuai tema.
- `useCountUp`, `useFloat`, `useProgress`, `useSec` → kebutuhan umum lainnya.
- `useCamera`, `useIdle`, `useSceneExit` (`scene.tsx`) → kamera pelan, idle, dan animasi keluar bergiliran sepanjang scene.
- `useTextAnimation`, `SceneTextProvider` (`text.tsx`) + `<KineticText>`/`<LineText>` (`src/components/KineticText.tsx`) →
  tipografi kinetik: gaya muncul kata, aksen kata sorotan, sinkron cue narasi (`useCue`, `useCueWords`).
- `useIconDraw`, `useIconIdle` (`icon.ts`) + `useRevealDelay` (`Reveal.tsx`) → ikon tergambar: jadwal gambar garis
  (`stroke-dashoffset` dengan `pathLength=1`), isian duotone, lalu idle khas per ikon. Ikon di dalam `<Reveal>` otomatis
  memakai delay pembungkusnya.

## Ikon (`src/components/icons`)

`<Icon src>` (`primitives.tsx`) memilih renderer dari nilai `src`:

| `src` | Renderer |
|---|---|
| emoji dikenal (tema `motion.icons: 'line'`, default) | `LineIcon` — pemetaan `EMOJI_ICONS` → `LINE_ICONS` |
| `line:<nama>` | `LineIcon` (pustaka 75 ikon garis 24×24) |
| `draw:<file.svg>` | `DrawSvg` — SVG di-fetch & disisipkan, tiap bentuk digambar; bentuk berisi disketsa lalu diisi |
| `.json` / `lottie:` | `LottieIcon` — `@remotion/lottie`, diputar dalam `<Sequence>` mulai saat delay |
| path/URL gambar | `<Img>` |
| emoji lain | emoji + idle `tilt` |

File (`draw:`/Lottie) dimuat dengan `delayRender` agar render menunggu aset. Semua gerak deterministik dari frame.

Prinsip: animasi masuk ditangani `<Reveal>` (teks judul: `<Heading>`), animasi keluar ditangani `useSceneExit` lalu **transisi scene** — sehingga semua scene keluar dengan cara yang sama. Riwayat perubahan: `docs/CHANGELOG.md`.

## Timeline

`computeTimeline(config)`:
1. Durasi tiap scene = `scene.duration` ?? default tipe.
2. Transisi masuk tiap scene (kecuali pertama) tumpang tindih dengan scene sebelumnya. `mix` di-resolve dulu menjadi transisi konkret per indeks scene.
3. Bila `config.duration` diisi, semua scene diskalakan proporsional (min 1,5 dtk) dan sisa pembulatan diserap scene terpanjang → total **tepat** sesuai target.

`Root.tsx` mendaftarkan semua config dari `src/projects/index.ts` sebagai `<Composition>`, dengan `calculateMetadata` agar perubahan props di Studio langsung memperbarui durasi.
