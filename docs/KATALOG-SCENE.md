# Katalog Scene

Sumber kebenaran: `src/scenes/types.ts`. Semua scene menerima properti dasar:

| Properti | Keterangan |
|---|---|
| `duration` | detik; default per tipe (lihat `src/config/scenes.ts`) |
| `transition` | transisi masuk: `fade` `zoom` `slideLeft` `slideUp` `wipe` `none` |
| `background` | `gradient` `particles` `pattern` `solid` |
| `camera` | gerak kamera pelan sepanjang scene: `auto` (default, bergiliran) `zoomIn` `zoomOut` `panLeft` `panRight` `none` |
| `exit` | `false` = elemen tidak keluar bergiliran di akhir scene (default `true`; scene terakhir tidak pernah keluar) |
| `textAnimation` | gaya muncul kata judul: `rise` `pop` `blur` `typewriter` `slam` (default dari tema) |
| `highlightStyle` | aksen kata sorotan: `mix` (default) `marker` `underline` `circle` `punch` `none` |

Sebagian besar scene juga menerima **judul standar**: `eyebrow`, `title`, `highlight` (kata bergradien), `subtitle`.

| Tipe | Properti utama | Kegunaan |
|---|---|---|
| `logo` | `logo?` `name?` `tagline?` | Pembuka brand (default ambil dari `brand`) |
| `hero` | `title` `button?` | Judul besar pembuka / hook |
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
logo 3 · hero 4 · mascot 4 · features 5 · stats 4 · chart 5 · comparison 5 · timeline 5 · device 5 · calculation 5 · testimonial 4.5 · cta 4 · question 5 · relation 5 · statement 5 (scene bernarasi: mengikuti panjang suara)

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
