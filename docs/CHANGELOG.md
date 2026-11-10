# Catatan Perubahan

Perubahan framework yang memengaruhi semua video. Entri terbaru di atas.

## 2026-11-10 — Ikon & ilustrasi beranimasi

Ikon tidak lagi emoji statis. Berlaku otomatis untuk semua video tanpa mengubah config.

### Baru
- **Ikon garis tergambar (SVG path draw)** — pustaka ±75 ikon garis 24×24 (`src/components/icons/library.ts`).
  Ikon digambar garis demi garis, lalu isian duotone tipis memudar masuk, lalu gerak idle khas per ikon
  (`tilt` `swing` `beat` `spin` `bob` `nudge`), amplitudo ikut `energy`.
- **Emoji → ikon garis otomatis** — emoji yang dikenal (🛒 🔔 📈 🔒 ✅ 💡 …) dipetakan ke ikon garis.
  Emoji lain tetap tampil, kini dengan goyang halus. Matikan: `motion: { icons: 'emoji' }` (config) atau tema.
- **`line:<nama>`** — pakai ikon garis langsung di field ikon mana pun.
- **`draw:<file.svg>`** — file SVG di `public/` tergambar: garis digambar berurutan, bentuk berisi disketsa lalu diisi.
- **Lottie** — file `.json` (atau `lottie:...`) di field ikon/maskot/ilustrasi diputar via `@remotion/lottie`.
- **`hero.illustration`** — ikon/ilustrasi beranimasi di atas judul hero.
- Ikon di dalam `<Reveal>` otomatis mulai bersamaan dengan pembungkusnya (`useRevealDelay`).
- Video etalase `Demo-Ikon`; contoh Lottie `public/lottie/pulse.json`.

## 2026-11-10 — Transisi bervariasi (PR #9)

Pilihan transisi antar scene diperluas dengan efek dari `@remotion/transitions`. Video lama **tidak berubah**
(default tema tetap); variasi baru dipakai bila dipilih di config.

### Baru
- **Transisi baru** untuk properti `transition` (per scene, atau sekali di config video):
  - `flip` / `flipUp` — balik halaman 3D dari kanan / dari bawah.
  - `cube` — dua scene berputar sebagai sisi kubus 3D.
  - `clockWipe` — scene baru tersapu masuk seperti jarum jam.
  - `iris` — lingkaran membesar dari tengah.
  - `pushCut` — dorongan zoom + kilatan singkat.
  - `slideRight`, `slideDown`, `wipeUp` — arah tambahan untuk slide/wipe.
- **Mode `mix`** — transisi bergiliran otomatis per scene, deterministik dari indeks scene:
  slideLeft → iris → fade → flip → zoom → clockWipe → wipe → cube → pushCut (lalu ulang).
  Efek besar diselingi efek ringan agar tidak berlebihan. Contoh: `transition: 'mix'` di config.
- Durasi `flip`/`flipUp`/`cube`/`clockWipe`/`iris` ±35% lebih lama dari transisi biasa (±0,8 dtk vs 0,6 dtk)
  agar gerakannya terbaca.

### Kode
- `src/config/transitions.tsx` — `TRANSITION_NAMES`, `TRANSITION_MIX`, `resolveTransition()`, `getPresentation(name, { width, height })`.
- `src/core/timeline.ts` — `mix` di-resolve menjadi transisi konkret per scene sebelum durasi dihitung.
- `src/core/MotionVideo.tsx` — meneruskan ukuran video (dibutuhkan `clockWipe` & `iris`).

### Catatan
- Efek berbasis shader (dissolve, film burn, ripple, cross zoom, dll.) sengaja **tidak** dipakai: masih
  eksperimental di Remotion dan rawan gagal saat render.
- Dokumentasi: `docs/KATALOG-SCENE.md`, `docs/PROMPT-STORYBOARD.md`, `CLAUDE.md`.

## 2026-11-10 — Tipografi kinetik (PR #7)

Teks yang "bicara", bukan sekadar muncul. Semua video lama ikut otomatis tanpa mengubah config.

### Baru
- **Gaya muncul kata judul** (`TEXT_ANIMATIONS` di `src/config/animation.ts`):
  `rise` (naik dari balik garis), `pop` (membesar melewati ukuran lalu kembali), `blur` (dari kabur),
  `typewriter` (huruf per huruf + kursor berkedip), `slam` (turun dari ukuran besar lalu menghentak).
  - Default dari tema (`theme.motion.text`): ApplePremium/IslamicWarm `blur`, Corporate/ModernSaaS `rise`,
    ModernDark `slam`, PlayfulKids `pop`.
  - Override per scene: `textAnimation`. Judul h2 tidak memakai `slam` (otomatis `rise`).
- **Subtitle kalem**: fade naik per baris (`<LineText>`), menyusul setelah kata terakhir judul muncul.
- **Aksen kata sorotan** (kata `highlight` + kata `emphasis[]` yang ada di judul): punch ±8%, sapuan
  gradien kiri → kanan, dan satu coretan di belakang kata. Mode `mix` menggilir coretan
  marker → underline → circle per kata sorotan sepanjang video, berdasarkan urutan scene & kata (selalu sama).
  - Properti per scene: `highlightStyle` = `mix` (default) | `marker` | `underline` | `circle` | `punch` | `none`.
  - Waktu: `ACCENT_TIMING` (punch 0,26 dtk setelah muncul; kata emphasis 0,08 dtk setelah diucapkan).
- **Sinkron narasi**: di scene ber-`narration`, kata judul muncul tepat saat diucapkan (cue kata);
  kata yang tidak diucapkan memakai jeda bergiliran biasa.
- **Scene `statement`** — teks besar ala Reels/TikTok: `lines[] { text, highlight?, at? }`,
  `style: 'stack' | 'replace'`. Ukuran font dihitung otomatis agar pas di area aman
  (`stack` memakai satu ukuran seragam untuk semua baris). Durasi default 5 dtk.
- **Video demo** `Demo-Statement` (`src/projects/_demos/index.ts`): contoh `stack`, `replace`, dan `typewriter` + `circle`.

### Kode
- `src/components/KineticText.tsx` — `KineticText`, `LineText`, `planWords`, coretan & kursor.
- `src/motion/text.tsx` — konteks teks per scene (`SceneTextProvider`), `useTextAnimation`, `useFontReady`, `measureText`.
- `src/scenes/StatementScene.tsx`, `src/scenes/accents.ts` (hitung giliran aksen per scene).
- `Heading`, `HeroSection`, `SceneTitle` kini memakai sistem di atas.

### Batasan yang dijaga
- Gerak tiap kata (masuk + punch) selesai ≤ 0,5 dtk setelah muncul; sapuan warna & coretan selesai ±0,8 dtk.
- Teks tidak ikut melayang (idle), tetapi tetap ikut animasi keluar di akhir scene.
- Deterministik (tanpa `Math.random()`); pengukuran teks menunggu font termuat (`delayRender`).

### Catatan
- Lingkaran coretan melebar ±0,2em di sisi kata; pada kata di tepi judul bisa sedikit masuk padding area aman.
- Dokumentasi: `docs/KATALOG-SCENE.md` (bagian *Tipografi kinetik*), `docs/MEMPERLUAS.md`, `CLAUDE.md`.

## Sebelumnya
- **PR #6** — Gerak sepanjang scene: kamera pelan + parallax, idle (`<Reveal idle>`), animasi keluar bergiliran,
  tingkat energi `calm`/`normal`/`lively`. Detail: `docs/KATALOG-SCENE.md` bagian *Gerak sepanjang scene*.
