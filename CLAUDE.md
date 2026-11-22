# Motion Studio — Aturan untuk AI

Repo ini **framework animasi**, bukan satu video. Video baru = **satu file data**; jangan menulis kode animasi.

## Membuat video (99% tugas) — alur hemat token
0. Bila diberi `naskah/<brand>/<video>.md` (konsep + alur + narasi, lihat `naskah/README.md`): itu sumber isinya. Setelah config
   dibuat, ubah `status: dibuat` + isi `file:`; revisi narasi berikutnya di `.ts`, bukan di naskah.
1. Pilih template, baca **hanya** interface props-nya:
   - Iklan sebuah proyek/aplikasi → `promoProyek` (`src/templates/PromoProyek.ts`), contoh `src/projects/price-atlas/iklan.ts`.
   - Konten harian topik apa pun (keuangan, politik, sosial, tips, data) → `kontenHarian` (`src/templates/KontenHarian.ts`),
     contoh `src/projects/harian/tips-gaji.ts`.
   - Penjelasan "cara kerja" 1–2 menit dengan visual 3D mendekati nyata → `bedah3D` (`src/templates/Bedah3D.ts`) + kit dunia
     `src/worlds/`; acuan `src/projects/_demos/bedah3d.ts`. Satu adegan = satu kalimat ≈ 4 dtk (1 menit ≈ 15 adegan).
     Gaya yang disukai pemilik (alur, data bersumber, HUD) → baca `docs/REFERENSI.md` sebelum menulis naskahnya.
     Benda 3D, irisan 2D & resep adegan yang sudah jadi → `docs/PUSTAKA-VISUAL.md` (impor dari `src/worlds/`); tambahkan yang baru tiap selesai video.
   - Alur khusus → scene manual `defineVideo` (kontrak: `src/scenes/types.ts`; contoh `src/projects/soal-skd/bedah-analogi.ts`).
2. Tulis `src/projects/<brand>/<video>.ts` yang `export default` hasil template. **Tidak perlu mendaftarkan** (registry otomatis)
   dan **tidak perlu mengimpor** `*.narration.json` (dipasang otomatis).
3. Brand baru: buat `src/projects/<brand>/series.ts` (`defineSeries`: brand, tema, penutup baku — salin dari `harian/series.ts`).
   Semua yang sama antar video (tema, suara, transisi, CTA, musik `audio: 'tenang'|'semangat'|'korporat'`,
   `watermark: true|'@kanal'`) tinggal di seri, bukan di file video.
4. Bila ada `narasi`: `npm run narasi -- <ID video>` (default Edge TTS, butuh `pip install edge-tts`), lalu commit
   `public/narration/<ID>/` + `<video>.narration.json`. Tanpa langkah ini video bisu. Atau jalankan workflow GitHub
   **Narasi & Render** (`.github/workflows/narasi-render.yml`) — narasi + render + MP4 di Actions.
5. `npm run cek` (typecheck + periksa isi: highlight, aset, cue, narasi, panjang label, hook, ritme, waktu baca), lalu
   `npm run pratinjau -- <ID>` (still per scene + QC tata letak, ±20 dtk; sesi cloud: `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium`)
   dan lihat gambarnya. Perbaiki semua ✗. Selesai. **Jangan render kecuali diminta.**

Yang boleh diubah untuk tugas video: `src/projects/**`, `naskah/**`, `public/brands/<brand>/`. Jangan membaca `src/components`,
`src/scenes/*Scene*`, `src/core`, `src/motion` — tidak diperlukan.

## Aturan isi
- Bahasa Indonesia kecuali diminta lain. Kalimat pendek: judul ≤ ±8 kata, deskripsi ≤ ±8 kata, maks 4 item per scene.
- Hook ≤ 2–3 detik dan memancing; ganti-ganti jenis bagian (jangan tipe yang sama berturut-turut). Pilih komposisi dari
  maksud informasinya: `docs/PROMPT-STORYBOARD.md` → *Komposisi*.
- Video bernarasi vertikal: pasang di seri `motion: { sync: 'auto' }` (isi muncul saat disebut — sebut label persis seperti
  di layar) dan `legibility: 'mobile'` (teks pendukung terbaca di ponsel + jeda baca).
- Angka/fakta harus dari pengguna atau sumber yang disebut; jangan mengarang.
- `highlight` harus persis ada di judulnya. ID video: `Brand-Jenis`, unik (template seri: `<idPrefix>-<slug>`).
- Ikon: emoji (otomatis jadi ikon garis beranimasi), `line:<nama>`, `draw:<file.svg>`, Lottie `.json`, atau path gambar.
- Durasi: isi `duration` (detik); video bernarasi otomatis mengikuti panjang suara.
- Suara default: `id-ID-Ardi:DragonHDLatestNeural`, rate `+10%` (sudah default di seri). `lexicon` untuk singkatan (PDB → "Pe De Be").

## Narasi & render di sesi cloud
- Penyedia: env `TTS_PROVIDER=edge` (default, gratis, **tidak resmi** — bisa berubah/dibatasi; gagal 403 → `pip install -U edge-tts`)
  atau `azure`. `TTS_FALLBACK=azure` hanya bila diminta (memakai kuota). Suara Edge dipetakan dari `voice.name`
  (`id-ID-Ardi:…` → `id-ID-ArdiNeural`; paksa dengan `EDGE_TTS_VOICE=id-ID-GadisNeural`). Klip lama tidak dibuat ulang
  saat ganti penyedia kecuali `--redo`. Narasi gagal → exit 1 dengan pesan jelas; jangan render video tanpa narasi.
- Key Azure (region `southeastasia`) adalah network secret di environment cloud **video-remotion**; `proxy-injected` hanya
  placeholder. Di environment lain → 401: minta pengguna pindah environment (jangan minta key ditempel di chat).
- ElevenLabs (opsional): `voice.name: 'elevenlabs:<voiceId>'` + `ELEVENLABS_API_KEY=proxy-injected` (key via network secret
  `api.elevenlabs.io`, minta lewat formulir kredensial). Rincian: komentar atas `scripts/narrate.mjs`.
- Render: tambahkan `--browser-executable=/opt/pw-browsers/chromium` (unduhan Chrome diblokir).
- Scene `world` ber-model `.glb` lambat dirender (16 dtk video ≈ 26 menit di skala 0,5): jalankan di latar dengan batas waktu
  panjang, dan cek tata letak dulu dengan `npx remotion still` (angka & status: `docs/KATALOG-SCENE.md` → *Kecepatan render*).

## Aset
- Audio/video/file desain dan isi `public/**/media/` otomatis Git LFS — **upload LFS diblokir dari sesi cloud**.
  Aset kecil yang harus ikut push taruh di luar `media/`. `public/narration/**`, `public/sfx/**`, `public/music/**` file git biasa.

## Perintah
`npm run cek` · `npm run pratinjau -- <ID> [--scale=0.5] [--ketat]` · `npm run typecheck` · `npm run narasi -- <ID|config.ts>` · `npm run model -- <file.glb>` (nama bagian model 3D) · `npm run peta -- <nama> <lat> <lon> [radius]` (kota dari OSM) · `npm run studio` · `npm run render:list` ·
`npm run render:all -- <filter> [--scale=0.5]` · `npx remotion render <ID> out/<ID>.mp4`

## Mengubah framework (hanya bila diminta animasi/efek/scene/template baru)
Framework sudah punya: kamera + idle + animasi keluar, tipografi kinetik, 15 transisi + `mix`, ikon tergambar/Lottie, SFX otomatis, musik latar, watermark,
20 tipe scene (termasuk `world` = dunia 3D: kamera terbang, tembus pandang, label menempel, model `.glb`, HUD data: strip angka
bersumber, panel batang, panel layar gelap, penanda ukuran, cap putusan, kartu putusan; dan `irisan` = irisan teknis 2D beraksir
per bahan), narasi + subtitle, sinkron isi ke narasi (`sync`/`at`), keterbacaan ponsel (`legibility`), QC otomatis (`cek`,
`pratinjau`). Sebelum menambah apa pun baca `docs/KATALOG-SCENE.md` (apa yang ada) dan `docs/MEMPERLUAS.md` (cara menambah).
- Pasang di level framework agar semua video ikut; properti baru harus **opsional** dengan default aman (config lama tetap valid).
- Warna dari `useTheme()`, ukuran via `px()`, tanpa angka spring mentah, waktu dalam detik, deterministik dari `useCurrentFrame()`
  (tanpa `Math.random()`/`Date`), tidak mengganggu keterbacaan teks. Hindari transisi shader (rawan gagal render).
  Teks kecil (label × faktor < 1) lewat `small()` dari `useTheme()`; isi berurutan menerima `delays` dari `useItemTimes()`.
- Uji regresi: `npm run pratinjau` video yang ada sebelum & sesudah perubahan — still harus identik bila properti baru tidak dipakai.
- Video referensi baru dari pemilik → bedah jadi bagian baru di `docs/REFERENSI.md` (pola → cara membuat → yang belum ada).
- Template/scene/properti baru → perbarui `docs/KATALOG-SCENE.md`, `docs/PROMPT-STORYBOARD.md`, `docs/CHANGELOG.md`.
