# Catatan Perubahan

Perubahan framework yang memengaruhi semua video. Entri terbaru di atas.

## 2026-11-12 — Folder `naskah/`

- **`naskah/`** — rancangan video sebelum jadi config: satu file per video (konsep, data & sumber, alur, narasi) +
  `status:` (`ide` → `draf` → `final` → `dibuat`). Template `naskah/_template/video.md`, contoh `naskah/harian/tips-gaji.md`.
- Setelah dibuat, narasi tetap bersumber di file `.ts` (naskah tidak dibaca build/narasi). Tidak ada perubahan kode.

## 2026-11-11 — Referensi gaya + HUD data di dunia 3D

Sumber: bedah video referensi "busi standar atau iridium?" (`docs/REFERENSI.md`, R1).

### Baru
- **`docs/REFERENSI.md`** — video referensi dibedah jadi pola + cara membuatnya di sini + daftar yang belum ada.
- Scene `world` (semua opsional, config lama tetap valid):
  - **`readout`** — strip data: teks/angka (bisa menghitung saat cue) + lencana sumber ber-`tone` (`data` · `ilustrasi` · `hitungan`).
  - **`meters[]`** — panel batang ukur; batang bergerak `value` → `to` saat cue, baris pembanding lewat `showAt`.
  - **`measures[]`** — penanda ukuran antara dua titik 3D.
  - **`stamp`** — cap putusan besar.
  - **`cards[].points`** — daftar putusan ✓/✕ di dalam kartu.
- Template `bedah3D`: `data`, `meter` (keduanya bertahan lintas adegan di nilai akhirnya; `false` menghapus), `ukur` (bisa `tetap`), `cap`.
- Komponen: `src/components/world/Hud.tsx` (angka waktu: `WORLD_HUD_TIMING`). Acuan `Demo-Bedah3D` memakai semuanya (narasi tidak berubah).

## Status merge — dunia 3D (2026-11-11)

Seluruh pekerjaan dunia 3D sudah masuk branch default lewat tiga PR:

| PR | Isi |
|---|---|
| #15 | Scene `world`: dunia 3D, kamera terbang, tembus pandang, label menempel |
| #16 | Model `.glb` + pengaturan per bagian + model bawaan `car-concept.glb` |
| #17 | Template `bedah3D`, kit dunia `jalanRaya()`, acuan bernarasi, dokumentasi |

Pekerjaan lanjutan (belum dikerjakan): render `Demo-Bedah3D` utuh, mempercepat render model `.glb`, kit dunia selain
jalan raya, HUD khusus topik, model mobil harian. Rincian: `docs/KATALOG-SCENE.md` → *Status & catatan*.

## 2026-11-11 — Template `bedah3D` + kit dunia

Tujuan: video penjelasan 3D 1–2 menit = satu file data, tanpa menyusun scene `world` satu per satu.

### Baru
- **Template `bedah3D`** (`src/templates/Bedah3D.ts`) — daftar `adegan` (satu kalimat narasi per adegan) di satu dunia: `kamera`,
  `xray`, `label` (bisa `tetap`), `kartu`, `gerak`, `bagian`, `muncul`/`hilang`, `lampu`, `ubah`, `sisip`. Semua perubahan
  menetap ke adegan berikutnya; id/view yang salah langsung jadi galat yang jelas.
- **Kit dunia** `src/worlds/` — `jalanRaya()` (jalan, lampu, antrean mobil, gedung, mobil utama model/sederhana, jangkar & view bernama).
- **Acuan** `src/projects/_demos/bedah3d.ts` (`Demo-Bedah3D`, 11 scene, narasi 38,6 dtk) — belum dirender jadi video.
- Objek dunia: `hidden` (tersembunyi sampai dimunculkan).

### Berubah
- Orbit pelan kamera `world` kini berayun memakai waktu video, sehingga tidak melompat di potongan antar scene.

## 2026-11-11 — Model `.glb` di scene `world`

### Baru
- **`shape: 'model'`** — memuat model 3D glTF biner (`src`, `size`, `ground`); dinormalkan ke meter, berbayang, ikut `xray`.
- **`parts[]`** — atur bagian model lewat nama node/material: warna, opasitas, sembunyikan, `solid` (tetap utuh saat xray),
  dan `motion` per bagian (kap terbuka, roda berputar) yang bisa dipicu kata narasi.
- **Model bawaan** `public/models/car-concept.glb` (CC BY 4.0, kredit di `public/models/CREDITS.md`).
- `npm run model -- <file.glb>` — daftar nama bagian & material; `npm run cek` memeriksa file `.glb` ada.
- Pantulan lingkungan netral di semua scene `world` agar bahan mengilap tidak tampak hitam.

### Catatan
- `Demo-Dunia3D` kini bernarasi (Ardi HD): kamera, tembus pandang, gerak kap dan label dipicu kata narasi.
- Kecepatan render terukur ada di `docs/KATALOG-SCENE.md` → *Kecepatan render*: model detail ±9× lebih lambat dari objek
  sederhana, dan mengurangi jumlah salinan model tidak membantu. Pengecilan model belum dikerjakan.

## 2026-11-11 — Scene `world`: dunia 3D

Tujuan: visual mendekati nyata untuk penjelasan "cara kerja" — kamera masuk ke dalam benda, bukan kartu berganti.

### Baru
- **Scene `world`** (WebGL, `three` + `@remotion/three`) — dunia 3D dari data: bentuk dasar (`box` `cylinder` `sphere` `cone`
  `torus` `tube`), bagian mesin (`gear` `fan` `flow`), objek jadi (`car` `road` `trafficLight` `building` `house` `tree`
  `person` `coins`), objek bersarang (`children`).
- **Kamera terbang** antar `shots` (orbit: target, jarak, azimuth, elevasi) dengan blur gerak dan orbit pelan saat diam;
  `xray` menembuskan badan objek untuk melihat isinya.
- **Gerak objek** lewat `motion`: `spin` `bob` `move` `turn` `scale` `fade` `color`, semuanya bisa dipicu kata narasi (`at`).
- **Label menempel** pada objek (`labels`) + **kartu keterangan/sumber** (`cards`) + `note`.
- Dunia bersambung lintas scene: `transition: 'none'` + `views` bersama; gerak tanpa `at` memakai waktu video.
- Demo: `Demo-Dunia3D` (`src/projects/_demos/dunia.ts`).

### Berubah
- Render memakai `--gl=swangle` secara default (`remotion.config.ts`, `scripts/render-all.mjs`); ganti dengan `REMOTION_GL=angle`.

## 2026-11-10 — Musik latar + watermark

### Baru
- **Musik latar bawaan** — `audio: 'tenang' | 'semangat' | 'korporat'` (seri atau config). Trek disintesis dari nol
  (`scripts/build-music.mjs` → `public/music/`, git biasa, ±2,2 MB), loop mulus sepanjang video, memudar masuk/keluar,
  otomatis dikecilkan ×0,35 bila bernarasi. File sendiri: `audio: { src, volume?, loop?, fadeIn?, fadeOut? }`.
- **Watermark** — `watermark: true | '@teks' | { text, logo, position, opacity, outro }`: pil logo + nama brand di luar
  area konten; default kanan atas (video ber-HUD: bawah), hilang di scene penutup `cta`.
- Seri: properti `audio` & `watermark`; per video bisa diganti atau dimatikan (`false`).
- `npm run cek` — nama musik yang tidak dikenal menjadi galat.
- Seri `harian` (musik `tenang`) dan `price-atlas` (musik `semangat`) kini bermusik dan ber-watermark.

### Berubah
- `audio` dengan file sendiri kini ikut memudar masuk/keluar dan dikecilkan bila bernarasi (config lama tetap valid).

## 2026-11-10 — Seri + template konten harian & iklan proyek

Tujuan: video baru = satu file berisi topik saja.

### Baru
- **Seri** (`defineSeries`, `src/templates/series.ts`) — brand, tema, suara (default Ardi HD +10%), transisi (default `mix`),
  musik, penutup baku; ditulis sekali di `src/projects/<brand>/series.ts`.
- **Template `kontenHarian`** — Hook → bagian (`angka` `poin` `langkah` `grafik` `banding` `kutipan` `teks` `kata` `foto` `peta`
  `hitung` `scene`) → kesimpulan → penutup. `narasi` per bagian → otomatis bersuara + HUD + subtitle. Latar bergiliran per scene.
- **Template `promoProyek`** — Hook → keluhan → solusi → tampilan produk → fitur → bukti → CTA; narasi opsional.
- **Registry otomatis** — file `src/projects/<folder>/*.ts` ber-`export default` VideoConfig langsung terdaftar;
  `<video>.narration.json` di sebelahnya otomatis dipasang (impor manual lama tetap jalan). ID ganda → galat.
- **`npm run cek`** — typecheck + periksa isi: ID, aset di `public/`, cue `at`, `highlight`/`emphasis`, panjang teks, narasi belum dirender.
- `npm run narasi -- <ID video>` — menerima ID (boleh sebagian) selain path file.
- Contoh: `Harian-TipsGaji` (konten harian bernarasi), `PriceAtlas-Iklan30` (iklan proyek).

### Dokumen
- `CLAUDE.md` dirampingkan (87 → 50 baris); `PROMPT-STORYBOARD.md` ditulis ulang untuk dua template baru + narasi.

## 2026-11-10 — Efek suara + scene `words`, `broll`, `map`

### Baru
- **Efek suara (SFX) otomatis di semua video** — whoosh saat transisi (jenis suara mengikuti transisi), pop saat
  elemen `<Reveal idle>` muncul (3 nada bergiliran), "ting" saat angka selesai menghitung, tick/dentum untuk
  `statement`, suara aksi soal (pilih/salah/coret/benar). Video bernarasi otomatis dikecilkan (×0,6).
  Atur: `sfx: false | { volume, transitions, elements, counters }` (config), `sfx: false` (scene).
  File disintesis dari nol (`scripts/build-sfx.mjs`, deterministik, tanpa lisensi pihak ketiga) → `public/sfx/` (git biasa, < 0,5 MB).
- **Scene `words`** — satu kata per ketukan memenuhi layar (hentakan skala + blur, latar berkedip untuk kata sorotan,
  titik progres). Sinkron otomatis dengan narasi.
- **Scene `broll`** — foto/video layar penuh dengan gerak kamera Ken Burns (zoom/pan + titik fokus), montase beberapa
  shot dengan crossfade, judul putih di atas scrim, label lokasi.
- **Scene `map`** — peta Natural Earth (detail 1:50m untuk Asia Tenggara): daratan tersingkap, kamera terbang ke area pin,
  pin jatuh + denyut, label anti-tabrakan, rute melengkung tergambar. ±100 kota bawaan, wilayah bawaan, negara diwarnai.
  Data: `src/components/map/geo-data.ts` (dibangun `scripts/build-geo.mjs`).
- `ThemeColors` — ganti sebagian warna tema untuk sub-pohon (teks putih di atas foto).
- Video etalase `Demo-SceneBaru`.

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
