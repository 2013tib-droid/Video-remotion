# Katalog Scene

Sumber kebenaran: `src/scenes/types.ts`. Semua scene menerima properti dasar:

| Properti | Keterangan |
|---|---|
| `duration` | detik; default per tipe (lihat `src/config/scenes.ts`) |
| `transition` | transisi masuk: `fade` `zoom` `slideLeft` `slideRight` `slideUp` `slideDown` `wipe` `wipeUp` `flip` `flipUp` `cube` `clockWipe` `iris` `pushCut` `mix` `none`. `mix` = bergiliran otomatis per scene (deterministik); bisa dipasang sekali di config `transition: 'mix'` |
| `background` | `gradient` `particles` `pattern` `solid` |
| `camera` | gerak kamera pelan sepanjang scene: `auto` (default, bergiliran) `zoomIn` `zoomOut` `panLeft` `panRight` `none` |
| `exit` | `false` = elemen tidak keluar bergiliran di akhir scene (default `true`; scene terakhir tidak pernah keluar) |
| `textAnimation` | gaya muncul kata judul: `rise` `pop` `blur` `typewriter` `slam` (default dari tema) |
| `highlightStyle` | aksen kata sorotan: `mix` (default) `marker` `underline` `circle` `punch` `none` |
| `sfx` | `false` = scene ini tanpa efek suara elemen (pop/ting/tick/dentum). Whoosh transisi diatur `sfx` di config video |

Sebagian besar scene juga menerima **judul standar**: `eyebrow`, `title`, `highlight` (kata bergradien), `subtitle`.

| Tipe | Properti utama | Kegunaan |
|---|---|---|
| `logo` | `logo?` `name?` `tagline?` | Pembuka brand (default ambil dari `brand`) |
| `hero` | `title` `button?` `illustration?` | Judul besar pembuka / hook |
| `mascot` | `mascot` `speech?` `name?` | Karakter + balon ucapan |
| `features` | `features[] {icon,title,description}` `columns?` | Daftar/grid fitur, kartu belajar |
| `stats` | `stats[] {value,prefix,suffix,decimals,label}` | Angka menghitung naik |
| `chart` | `data[] {label,value}` `highlightBar?` `highlightLabel?` `orientation?` `prefix?` `suffix?` | Perbandingan harga, pertumbuhan |
| `comparison` | `columns[]` `rows[] {label, values[]}` `highlightColumn?` | Tabel ✓/✕ vs kompetitor |
| `timeline` | `steps[] {icon?,title,description?}` | Cara kerja, roadmap |
| `device` | `screen` `device?` `bullets?` `notifications[]?` `url?` | Mockup ponsel/browser |
| `calculation` | `lines[] {label,value,negative?}` `total {label,value}` `prefix?` `note?` | Kalkulasi hemat/ROI |
| `testimonial` | `quote` `author` `role?` `avatar?` `badges?` | Bukti sosial & kepercayaan |
| `cta` | `title` `button` `url?` `badges?` `showLogo?` | Penutup |
| `question` | `label?` `question` `options[]` `countdown?` `initial?` `steps[] {action: select/wrong/strike/correct, option, note?, at?}` `enter?` | Bedah soal pilihan ganda (explainer) |
| `relation` | `rows[] {left, verb, right, at?}` `formula?` `formulaAt?` | Analogi / hubungan A → B |
| `statement` | `lines[] {text, highlight?, at?}` `style?: 'stack' \| 'replace'` | Teks besar ala Reels/TikTok. `stack` = baris bertumpuk satu per satu; `replace` = satu frasa memenuhi layar lalu diganti berikutnya. Ukuran font otomatis pas di area aman. Tanpa eyebrow/title/subtitle. |
| `words` | `words` (kalimat atau `[{text, highlight?, at?}]`) `accent?[]` `interval?` `flash?` `caption?` | **Satu kata per ketukan** memenuhi layar: menghentak masuk (skala + blur), dorongan pelan, dipotong kata berikutnya; kata sorotan (`accent`) bergradien + latar berkedip warna brand (`flash: false` = mati). Bernarasi → tiap kata muncul **tepat saat diucapkan** (otomatis dicocokkan). Default dibagi rata sepanjang `duration` (≈ 1 kata/dtk bila durasi = jumlah kata). Bunyi tick per kata, dentum untuk kata sorotan. |
| `broll` | `src` atau `shots[] {src, move?, focus?, caption?, duration?, startFrom?}` `move?` `textPosition?` `dim?` `volume?` + judul standar | **Foto/video b-roll layar penuh** dengan gerak kamera Ken Burns: `zoomIn` `zoomOut` `panLeft` `panRight` `panUp` `panDown` `none` atau `auto` (bergiliran). `focus: [x, y]` (0..1) = titik pusat zoom. Beberapa `shots` = montase dengan crossfade + swipe. Judul putih di atas scrim gelap (`dim` 0..1, `textPosition` `bottom`/`center`/`top`); `caption` = label lokasi kiri atas. Video (mp4/webm/mov) senyap kecuali `volume`. |
| `map` | `region?` `points[] {place? \| lat+lon, label?, value?, icon?, at?}` `routes[] {from, to, at?}` `countries?[]` `zoomToPoints?` + judul standar | **Peta beranimasi** (Natural Earth): daratan tersingkap melingkar, kamera terbang ke area pin, pin jatuh memantul + denyut, label (anti-tabrakan) dengan nilai, rute melengkung tergambar + titik mengalir. `region`: `indonesia` (default) `sumatra` `jawa` `kalimantan` `sulawesi` `bali-nusra` `maluku` `papua` `asean` `asia` `world` atau bbox `[barat, selatan, timur, utara]`. `place` = kota bawaan (±100: semua ibu kota provinsi & kota besar Indonesia, ASEAN, kota dunia — `src/components/map/places.ts`). `countries` = negara diwarnai (nama Inggris, mis. `'Malaysia'`); wilayah Indonesia otomatis menyorot Indonesia. |
| `world` | `objects[]` `views?` `shots[]` `labels?[]` `cards?[]` `readout?` `meters?[]` `measures?[]` `stamp?` `ground?` `sky?` `note?` + judul standar | **Dunia 3D** (WebGL): objek nyata + kamera yang terbang antar sudut pandang, tembus pandang ke dalam objek, bagian bergerak, label menempel. Lihat bagian *Dunia 3D* di bawah. |

Semua scene juga menerima `narration` (teks voice-over), `emphasis[]` (kata disorot di subtitle) dan `chapter {label?, title, highlight?}` (header bab). `at` = detik **atau kata narasi** (mis. `'higrometer'`, `'alat#2'`). Lihat `docs/EXPLAINER.md`.

## Isi layar (`device.screen`)

| `kind` | Properti | Tampilan |
|---|---|---|
| `image` | `src` | Screenshot asli |
| `receipt` | `store` `items[] {name,price}` `scanning?` | Struk + animasi pindai |
| `qr` | `merchant` `amount?` `caption?` | Pembayaran QR |
| `list` | `items[] {icon,title,subtitle,value}` | Daftar transaksi/pelajaran |
| `quiz` | `question` `options[]` `correct` `reward?` | Game kuis |
| `dashboard` | `kpis[]` `chart[]?` | Dashboard SaaS (otomatis di browser) |

`notifications[]`: `{ icon?, app?, title, body?, time? }` — muncul berurutan di atas perangkat.

## Durasi default (detik)
logo 3 · hero 4 · mascot 4 · features 5 · stats 4 · chart 5 · comparison 5 · timeline 5 · device 5 · calculation 5 · testimonial 4.5 · cta 4 · question 5 · relation 5 · statement 5 · words 4 · broll 5 · map 6 · world 8 (scene bernarasi: mengikuti panjang suara)

## Efek suara (SFX)
Semua video otomatis punya efek suara halus (file sintetis di `public/sfx/`, dibuat `node scripts/build-sfx.mjs`):

| Kapan | Suara |
|---|---|
| Transisi antar scene | `whoosh` (slide/flip/cube/pushCut), `whooshSoft` (fade/zoom/iris), `swipe` (wipe/clockWipe); `none` senyap |
| Kartu/ikon/badge/angka muncul (`<Reveal idle>`) | `pop` (3 nada bergiliran) |
| Angka selesai menghitung (`stats`, `calculation`, KPI pertama dashboard) | `ting` |
| Soal: pilih / salah / coret / benar | `tick` / `impact` / `swipe` / `ting` |
| Baris `statement`, kata `words` | `tick` (gaya `slam` & kata sorotan: `impact`) |
| Pin `map` jatuh / rute tergambar; ganti shot `broll` | `pop` / `swipe` |

- Atur per video: `sfx: false` (senyap) atau `sfx: { volume: 0.7, transitions: true, elements: true, counters: true }`. Per scene: `sfx: false`.
- Video bernarasi otomatis dikecilkan (×0,6) agar suara narator tetap jelas. Volume & pemetaan: `src/config/sfx.ts`.
- Komponen baru: `<Sfx name="pop" at={detik} />` (`src/motion/sfx.tsx`), atau `<Reveal idle>` (otomatis pop) / `<Reveal sfx="tick">`.

## Musik latar
Opsional, lewat `audio` di seri (semua video ikut) atau di config video. Trek bawaan disintesis dari nol
(`node scripts/build-music.mjs` → `public/music/`, tanpa lisensi pihak ketiga) dan di-loop mulus sepanjang video:

| Nama | Karakter | Cocok untuk |
|---|---|---|
| `tenang` | Pad hangat + arpeggio pelan, 60 bpm | Penjelasan, edukasi, data |
| `semangat` | Ketukan ringan + bass + pluck, 120 bpm | Iklan, tips cepat, promo |
| `korporat` | Petikan redam + pad, 100 bpm | Profil produk, laporan |

- `audio: 'tenang'` atau `audio: { src: 'tenang', volume: 0.4 }`. File sendiri: `audio: { src: 'brands/x/musik.mp3', volume?, loop? }`.
- Otomatis memudar masuk (0,5 dtk) dan keluar (1,5 dtk terakhir); atur dengan `fadeIn`/`fadeOut`.
- Video bernarasi otomatis dikecilkan (×0,35) agar suara narator tetap jelas. Preset: `src/config/music.ts`.
- Template seri: `audio: false` di file video = video itu tanpa musik.

## Watermark
Opsional, lewat `watermark` di seri atau config video: pil kecil logo + nama brand yang tetap di luar area konten.
- `watermark: true` (logo + nama brand) · `watermark: '@namakanal'` (teks sendiri) ·
  `watermark: { text?, logo?, position?, opacity?, outro? }`.
- `position`: `top-left` `top` `top-right` `bottom-left` `bottom` `bottom-right`. Default `top-right`; video dengan
  `overlay` (HUD di atas) → `bottom` (di bawah subtitle).
- Memudar masuk di awal dan hilang di scene penutup `cta` (kecuali `outro: true`). Template seri: `watermark: false` per video.

## Gerak sepanjang scene
Semua video otomatis punya: **kamera** (zoom/geser pelan + background parallax), **idle** (kartu, ikon, angka, badge "bernapas" setelah muncul) dan **keluar** (elemen memudar ke atas bergiliran sebelum transisi).
- Kekuatan diatur `energy`: `calm` · `normal` · `lively`. Default dari tema (ApplePremium/Corporate/IslamicWarm = calm, ModernDark/ModernSaaS = normal, PlayfulKids = lively); video dengan `overlay` (explainer) otomatis `calm`.
- Per video: `motion: { energy?, camera?, exit? }` di config. Per tema: `themeOverrides: { motion: { energy: 'lively' } }`. Per scene: `camera`, `exit`.
- Angka preset: `MOTION_ENERGY` & `SCENE_MOTION_TIMING` di `src/config/animation.ts`.

## Tipografi kinetik (judul)
Semua judul (`hero`, `title` scene, baris `statement`) muncul kata per kata dengan gaya dari tema, tanpa perlu config:
- **Gaya muncul** (`textAnimation`): `rise` naik dari balik garis · `pop` membesar melewati ukuran lalu kembali · `blur` dari kabur · `typewriter` huruf per huruf + kursor berkedip · `slam` turun dari ukuran besar lalu menghentak. Default tema: ApplePremium/IslamicWarm `blur`, Corporate/ModernSaaS `rise`, ModernDark `slam`, PlayfulKids `pop`. Judul kecil (h2) tidak memakai `slam` (otomatis `rise`). Per tema: `themeOverrides: { motion: { text: 'pop' } }`.
- **Subtitle** selalu kalem: fade naik **per baris**, menyusul setelah kata terakhir judul.
- **Aksen kata sorotan** (kata di `highlight`, plus kata `emphasis[]` yang ada di judul): ±0,26 dtk setelah muncul kata membesar ±8% lalu kembali (punch), warna gradien menyapu kiri → kanan, dan satu coretan tergambar di belakang kata. `mix` menggilir coretan per kata sorotan sepanjang video: marker → underline → circle → marker (urutan scene & kata, selalu sama). Kata `emphasis` mendapat aksen tepat saat diucapkan.
- **Sinkron narasi**: scene ber-`narration` → kata judul muncul tepat saat diucapkan; kata yang tidak diucapkan memakai jeda bergiliran biasa.
- Tiap kata diam penuh ≤ 0,5 dtk setelah muncul; teks tidak melayang (idle) tetapi ikut animasi keluar. Angka preset: `TEXT_ANIMATIONS`, `TYPEWRITER`, `ACCENT_TIMING` di `src/config/animation.ts`.

## Ikon & ilustrasi beranimasi
Setiap field ikon (`features[].icon`, `timeline.steps[].icon`, `list.items[].icon`, `notifications[].icon`,
`logo`, `mascot`, `avatar`, `hero.illustration`) menerima:

| Nilai | Hasil |
|---|---|
| emoji (`'🛒'`) | emoji yang dikenal **otomatis jadi ikon garis yang tergambar** (garis demi garis → isian duotone tipis → gerak idle khas: lonceng berayun, hati berdenyut, gear berputar, panah menyenggol). Emoji lain tetap emoji + goyang halus |
| `'line:<nama>'` | ikon garis dari pustaka, warna gradien tema |
| `'draw:brands/x/ikon.svg'` | file SVG yang tergambar: garis digambar berurutan, bentuk berisi disketsa lalu warnanya memudar masuk |
| `'brands/x/anim.json'` atau `'lottie:...'` | animasi **Lottie** (LottieFiles/After Effects), diputar berulang mulai saat elemen muncul |
| path/URL gambar lain | gambar biasa |

- Ikon mulai tergambar bersamaan dengan kartu/elemen pembungkusnya (`<Reveal>`), ±0,6–1 dtk.
- Matikan pemetaan emoji per video: `motion: { icons: 'emoji' }`; per tema: `themeOverrides: { motion: { icons: 'emoji' } }`.
- `hero.illustration`: ikon/ilustrasi besar di atas judul (mis. `'line:rocket'` atau `'brands/x/hero.json'`).
- Nama ikon garis: `check` `check-circle` `x` `x-circle` `arrow-right` `cart` `bag` `bank` `crane` `factory` `target` `bell` `search` `bar-chart` `trending-up` `edit` `file` `receipt` `wallet` `heart` `bot` `flask` `hash` `link` `lock` `phone` `book` `briefcase` `lightbulb` `users` `user` `film` `palette` `scissors` `zap` `coffee` `star` `sparkles` `rocket` `shield` `clock` `calendar` `gift` `mail` `home` `settings` `globe` `money` `dollar` `percent` `tag` `truck` `camera` `chat` `megaphone` `trophy` `flame` `play` `download` `eye` `map-pin` `smile` `thumbs-up` `info` `alert` `question` `sun` `moon` `leaf` `cloud` `graduation` `music` `package` `scan` `calculator`.
- Pemetaan emoji: `EMOJI_ICONS` di `src/components/icons/library.ts`. Waktu & amplitudo: `ICON_ANIMATION`, `ICON_IDLE` di `src/config/animation.ts`.
- Contoh: video `Demo-Ikon` (`src/projects/_demos/index.ts`); contoh Lottie `public/lottie/pulse.json`.

## Dunia 3D (`world`)
**Untuk video baru pakai template `bedah3D`** (`docs/MEMBUAT-VIDEO.md` → *Penjelasan 3D 1–2 menit*): ia merangkai scene `world`
bersambung dan membawa semua perubahan ke adegan berikutnya. Bagian ini adalah rujukan bentuk, gerak, dan kamera yang dipakainya.
Untuk penjelasan "cara kerja" yang butuh visual mendekati nyata: satu dunia berisi objek, kamera masuk ke dalamnya.
Contoh lengkap bernarasi: `src/projects/_demos/dunia.ts` (video `Demo-Dunia3D`). Satuan **meter**; sumbu `[x kanan, y atas, z ke penonton]`.

- **`objects[]`** — tiap objek: `shape` + `id?` `pos?` `rotate?` (derajat) `scale?` `color?` (hex atau token tema: `primary` `accent`
  `muted` `surface` `danger` `success` …) `opacity?` `hidden?` `showAt?` `hideAt?` `motion?[]` `children?[]` (anak ikut induk).

| `shape` | Properti | Catatan |
|---|---|---|
| `box` `cylinder` `sphere` `cone` `torus` `tube` | `size` / `radius` `height` `radiusTop?` / `tube` `arc?` / `path[]`; `axis?` | bentuk dasar untuk merakit benda apa pun |
| `gear` `fan` | `radius` `teeth?` `thickness?` / `blades?`; `axis?` | bagian mesin; beri `motion: [{ type: 'spin' }]` |
| `flow` | `path[]` `count?` `speed?` `size?` `closed?` `at?` `stopAt?` | butiran mengalir sepanjang jalur (oli, uang, data, listrik) |
| `car` | `variant?: 'suv' \| 'sedan'` `brake?` | ±4,4 m, depan = +z |
| `road` | `length` `lanes?` `laneWidth?` `curb?` | memanjang sumbu z, trotoar bergaris |
| `trafficLight` | `light?` `changes?[] {to, at}` | lampu berganti saat cue |
| `building` `house` `tree` `person` `coins` | `size` (building) · `count?` (coins) | ukuran nyata; atur dengan `scale` |
| `model` | `src` (`.glb` di `public/`) `size?` `ground?` `parts?[]` | **model 3D nyata** — lihat *Model `.glb`* di bawah |
| `group` | — | hanya pembungkus `children` |

- **`motion[]`** — `spin {axis?, speed? (putaran/dtk), at?, stopAt?}` · `bob {amount?, period?}` · dan perubahan saat cue:
  `move {to, at}` `turn {to, at}` `scale {to, at}` `fade {to, at}` `color {to, at}` (`duration?` default 0,7 dtk).
- **`views`** + **`shots[]`** — `view`: `{ target (id objek atau [x,y,z]), distance, azimuth? (0 = depan, 90 = kanan), elevation?, fov? }`.
  Shot pertama = posisi awal; shot berikutnya kamera **terbang** saat `at` (`duration?` 1,2 dtk, blur gerak otomatis).
  `drift?` = ayunan orbit pelan (default 7°, bersambung lintas scene). `xray: ['id']` = badan objek itu tembus pandang selama shot (anaknya tetap utuh).
- **`labels[]`** — `{ target, text, color?, at?, hideAt?, side? }`: pil + garis penunjuk yang menempel di objek dan ikut kamera.
- **`cards[]`** — `{ tag?, text, source?, points?, color?, at?, hideAt? }`: kartu keterangan/sumber di bawah judul.
  `points: [{ text, ok?, at? }]` = daftar putusan di dalam kartu (`ok: true` ✓ hijau, `false` ✕ merah), muncul bergiliran.
- **`readout`** — strip data di bawah judul: teks/angka huruf mesin tik di kiri + lencana sumber di kanan.
  `{ text }` atau `{ value, to?, prefix?, suffix?, decimals?, at?, duration? }` (angka **menghitung** dari `value` ke `to` saat `at`),
  `source?` + `tone?`: `data` (pihak lain, warna primary) · `ilustrasi` (kuning) · `hitungan` (hitungan/asumsi sendiri, netral).
- **`meters[]`** — panel batang ukur (HUD): `{ title?, tag?, tone?, max?, rows[], note?, at?, hideAt? }`,
  `rows: [{ label, value, to?, at?, duration?, text?, color?, showAt? }]` — batang bergerak dari `value` ke `to` saat `at`;
  `showAt` = baris pembanding yang muncul belakangan; `text` = nilai tertulis di kanan.
- **`measures[]`** — `{ from, to, text, color?, at?, hideAt? }`: penanda ukuran (garis berujung + teks) antara dua titik 3D, ikut kamera.
- **`stamp`** — `{ text, target?, color?, rotate?, at?, hideAt? }`: cap putusan besar miring yang menghentak masuk (≤ 2 kata).
- `ground` (`true`/`false`/warna), `sky` (warna latar), `note` (strip kecil, mis. "Ilustrasi · bukan skala").
- **Dunia bersambung lintas scene** (tiap scene satu kalimat narasi): simpan `objects` + `views` di satu konstanta, pakai di semua
  scene dengan `transition: 'none'`, dan mulai tiap scene dari `view` terakhir scene sebelumnya. Putaran/aliran tanpa `at` tetap mulus.
- Suara otomatis: `whooshSoft` saat kamera terbang, `pop` per label/penanda ukuran, `tick` per kartu/panel batang, `impact` untuk cap.
- Render memakai WebGL perangkat lunak (`swangle`, sudah diatur). Mesin ber-GPU: `REMOTION_GL=angle`.
- Tema terang paling cocok.

### Model `.glb`
`{ shape: 'model', src: 'models/car-concept.glb', size: 4.5 }` — benda nyata dari file glTF biner. `size` = sisi terpanjang
dalam meter (mobil ±4,5); model otomatis ditaruh di tengah dengan alas di lantai (`ground: false` = titik asal asli).
- **Model bawaan**: `models/car-concept.glb` (mobil konsep, depan = +z, CC BY 4.0 — kredit di `public/models/CREDITS.md`).
- **Lihat isi model**: `npm run model -- public/models/<file>.glb` → nama bagian (node) + material, dan peringatan bila
  memakai kompresi yang tidak didukung (Draco, KTX2). Meshopt didukung.
- **`parts[]`** — atur bagian lewat `name` (nama node, anak ikut) dan/atau `material` (nama material); `*` = bebas:
  `{ material: 'Paint 1*', color: '#3d5a80' }` ganti cat · `{ name: 'License Plate', hidden: true }` ·
  `{ name: 'Engine', solid: true }` tetap utuh saat model di-`xray` · `opacity` ·
  `motion` per bagian: `{ name: 'BodyHood', motion: [{ type: 'move', to: [0, 0.55, 0], at: 'kap' }] }` (`move`/`turn`/`scale`
  relatif posisi asli dalam satuan model; juga `spin` `fade` `color`). Entri belakang menimpa entri depan.
- Label/kamera ke bagian model: beri anak `{ id: 'mesin', shape: 'group', pos: [...] }` sebagai jangkar.
- Kaca `transmission` dirender sebagai transparansi biasa. File masuk git biasa (jangan di `media/`); model besar memperlambat
  render — lihat *Kecepatan render* di bawah. Model baru: catat sumber & lisensi di `public/models/CREDITS.md`.

### Kecepatan render (terukur, sesi cloud tanpa GPU, skala 0,5)
| Isi dunia | Video | Waktu render |
|---|---|---|
| Objek sederhana saja (kotak, `car`, `road`, …) | 14,5 dtk | ±3 menit |
| 3 × `car-concept.glb` | 14,5 dtk | ±27 menit |
| 1 × `car-concept.glb` + objek sederhana, bernarasi | 16 dtk | ±26 menit |

- Yang berat adalah **model detail itu sendiri** (poligon + tekstur), bukan jumlah salinannya: mengurangi 3 mobil jadi 1 tidak mempercepat.
- Belum dikerjakan: mengecilkan model (tekstur lebih kecil, poligon lebih sedikit) — langkah berikutnya bila render perlu cepat.
- Selama itu: render scene `world` ber-model di latar dengan batas waktu panjang, dan uji tata letak dulu dengan
  `npx remotion still <ID> out/x.jpg --frame=<n> --scale=0.5` (±15 dtk per frame).

### Status & catatan (2026-11-11)
- **Sudah di-merge** ke branch default (PR #15 scene `world`, #16 model `.glb`, #17 template `bedah3D` + kit dunia).
- Template `bedah3D`: perubahan antar-adegan terbukti terbawa (diperiksa di config + dua frame uji); `Demo-Bedah3D` belum pernah
  dirender sebagai video utuh.
- Sudah terbukti di `Demo-Dunia3D`: kamera terbang, tembus pandang dengan bagian `solid`, ganti cat lewat `material`,
  gerak bagian (`move` kap), label + kartu, dan **cue kata narasi** untuk `shots[].at`, `labels[].at`, `cards[].at`, `parts[].motion[].at`.
- Belum diuji: `spin` pada bagian model (roda), `turn` pada bagian yang pivotnya di titik asal model (kap `car-concept` — pakai `move`).
- Label hanya bisa menunjuk `id` objek atau koordinat; untuk bagian model beri anak `group` ber-`id` sebagai jangkar.
- HUD data (strip data, panel batang, penanda ukuran, cap, daftar putusan) diperiksa lewat frame uji `Demo-Bedah3D`; belum dirender sebagai video utuh.
- Belum ada: HUD berbentuk khusus (mis. indikator P-R-N-D), model mobil harian, pengecilan model, kit dunia selain `jalanRaya()`.
- Percobaan mempercepat render dengan `--concurrency=4` gagal (timeout 33 dtk saat memuat model) — jangan dipakai untuk scene ber-model.
