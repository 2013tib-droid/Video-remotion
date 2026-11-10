# Catatan Perubahan

Perubahan framework yang memengaruhi semua video. Entri terbaru di atas.

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
