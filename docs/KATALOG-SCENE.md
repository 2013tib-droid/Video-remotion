# Katalog Scene

Sumber kebenaran: `src/scenes/types.ts`. Semua scene menerima properti dasar:

| Properti | Keterangan |
|---|---|
| `duration` | detik; default per tipe (lihat `src/config/scenes.ts`) |
| `transition` | transisi masuk: `fade` `zoom` `slideLeft` `slideUp` `wipe` `none` |
| `background` | `gradient` `particles` `pattern` `solid` |

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
logo 3 · hero 4 · mascot 4 · features 5 · stats 4 · chart 5 · comparison 5 · timeline 5 · device 5 · calculation 5 · testimonial 4.5 · cta 4 · question 5 · relation 5 (scene bernarasi: mengikuti panjang suara)
