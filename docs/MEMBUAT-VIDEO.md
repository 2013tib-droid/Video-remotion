# Membuat Video Baru

Setiap video adalah satu file di `src/projects/<brand>/` yang `export default` sebuah `VideoConfig`.
File itu **otomatis terdaftar** (tidak ada daftar yang perlu diedit).

## Cara cepat — Seri + template (disarankan)

**Seri** (`src/projects/<brand>/series.ts`) menyimpan semua yang sama di tiap video: brand, tema, suara, transisi, penutup.
Ditulis sekali per brand/kanal:

```ts
import { defineSeries } from '../../templates';

export const harian = defineSeries({
  brand: { name: 'Harian', logo: '📰' },
  theme: 'ModernDark',
  outro: { title: 'Follow biar nggak ketinggalan.', highlight: 'Follow', button: 'Follow', narasi: 'Follow untuk bahasan lainnya.' },
});
```

Opsi seri lain: `idPrefix`, `themeOverrides`, `format`, `transition` (default `mix`), `motion`, `sfx`, `audio` (musik: `'tenang'` · `'semangat'` · `'korporat'`),
`watermark` (`true` atau teks seperti `'@namakanal'`),
`voice` (default Ardi HD +10%; `lexicon` berlaku semua video), `overlay: false` (tanpa HUD/subtitle), `backgrounds`.

Lalu video baru hanya berisi topik:

| Template | Untuk | Alur |
|---|---|---|
| `kontenHarian(seri, {...})` | Konten harian topik apa pun | Hook → bagian-bagian → (Kesimpulan) → Penutup seri |
| `promoProyek(seri, {...})` | Iklan aplikasi/website/proyek | Hook → (Keluhan) → Solusi → Tampilan produk → Fitur → (Bukti) → CTA |

```ts
// src/projects/harian/inflasi-okt26.ts  →  ID: Harian-Inflasi-Okt26
import { kontenHarian } from '../../templates';
import { harian } from './series';

export default kontenHarian(harian, {
  slug: 'Inflasi-Okt26',
  topik: 'Ekonomi',
  hook: 'Harga naik lagi?',
  highlight: 'naik lagi',
  bagian: [
    { judul: 'Inflasi Oktober', angka: [{ value: 0, suffix: '%', decimals: 2, label: 'yoy' }], narasi: '...' },
    { judul: 'Penyumbang terbesar', poin: [{ icon: '🍚', title: 'Beras' }, { icon: '⛽', title: 'BBM' }], narasi: '...' },
    { teks: ['Dampaknya ke', 'dompet kamu?'], narasi: '...' },
  ],
  kesimpulan: 'Pantau terus harganya.',
  sumber: 'BPS',
});
```

Jenis isi `bagian` (tepat satu per bagian): `angka` · `poin` · `langkah` · `grafik` · `banding` · `kutipan` · `teks` · `kata` ·
`foto` · `peta` · `hitung` · `scene` (scene mentah apa pun). Detail field: `src/templates/KontenHarian.ts`.
Contoh lengkap: `src/projects/harian/tips-gaji.ts` (bernarasi), `src/projects/price-atlas/iklan.ts` (iklan).

- **Bersuara**: isi `narasi` → `AZURE_SPEECH_KEY=proxy-injected npm run narasi -- Harian-Inflasi-Okt26`. Subtitle & HUD otomatis.
- **Periksa**: `npm run cek` (typecheck + highlight, aset, cue, narasi yang belum dirender, teks kepanjangan).

## Penjelasan 3D 1–2 menit — template `bedah3D`

Untuk video "cara kerja" dengan visual mendekati nyata: satu dunia 3D yang bersambung, tiap **adegan** = satu kalimat narasi.
Acuan lengkap: `src/projects/_demos/bedah3d.ts` (salin file itu).

```ts
import { bedah3D } from '../../templates';
import { jalanRaya } from '../../worlds';
import { seri } from './series';

export default bedah3D(seri, {
  slug: 'LampuMerah',
  topik: 'Otomotif',
  dunia: jalanRaya(),                       // kit dunia siap pakai
  adegan: [
    { bab: 'judul bab', narasi: 'Kalimat hook.', kamera: 'jalan' },
    { narasi: 'Kita lihat mesinnya.', kamera: { view: 'mesin', at: 'mesinnya' }, xray: ['mobil'],
      label: [{ target: 'mesin', text: 'Mesin', at: 'mesinnya', tetap: true }] },
  ],
});
```

- **Per adegan**: `narasi` (wajib) · `bab` · `emphasis` · `kamera` (nama view / `{ view, at }` / beberapa) · `xray` · `label` (`tetap: true`
  = bertahan; `labelBersih` menghapus) · `kartu` · `gerak` (per id objek) · `bagian` (bagian model `.glb`) · `muncul` / `hilang` ·
  `lampu` · `ubah` · `catatan`. Detail: `src/templates/Bedah3D.ts`.
- **Semua perubahan menetap**: mobil yang maju tetap di posisi barunya, kap yang terbuka tetap terbuka, lampu tetap hijau, kamera
  mulai dari posisi terakhir. Tidak perlu mengulang apa pun di adegan berikutnya.
- **Durasi** (terukur): satu adegan ≈ 4 detik → **1 menit ≈ 15 adegan, 2 menit ≈ 30 adegan**. Adegan pertama = hook (≤ 2–3 detik).
- **Selingan**: `{ sisip: { type: 'chart', ... } }` menyisipkan scene biasa (grafik, angka, teks besar) di antara adegan 3D.
- **Kit dunia** (`src/worlds/`): `jalanRaya({ mobil?, warna?, antrean?, lampu?, kota?, tambahan?, isiMobil? })` — id `mobil` `lampu` `orang`,
  jangkar `mesin` `roda-depan` `kabin` `bagasi`, view `jalan` `lampu` `mobil` `depan` `samping` `mesin` `kabin` `atas`.
  Topik lain: rakit `{ objects, views }` sendiri di file video (bentuk & model: *Dunia 3D* di `docs/KATALOG-SCENE.md`),
  atau tambah kit baru di `src/worlds/` bila akan dipakai berulang.
- Objek yang baru muncul di tengah video: beri `hidden: true` di dunia, lalu `muncul: { id: 'kata' }` di adegannya.
- Render lambat bila memakai model `.glb` (lihat *Kecepatan render* di katalog); `jalanRaya({ mobil: 'sederhana' })` untuk draf cepat.

## Cara A — Template promo lama

Cocok bila struktur video standar. Pilih template:

| Template | Fungsi | Alur scene | Tema default |
|---|---|---|---|
| AppLaunch | `appLaunch()` | Logo → Hero → Fitur → (Statistik) → CTA | ApplePremium |
| SaaSProductPromo | `saasProductPromo()` | Hero → Dashboard → Fitur → (Perbandingan) → CTA | ModernSaaS |
| MobileAppPromo | `mobileAppPromo()` | Logo → Hero → Ponsel+notifikasi → Fitur → CTA | ModernSaaS |
| EducationalProductPromo | `educationalProductPromo()` | Maskot → Kartu belajar → Kuis → (Statistik) → CTA | PlayfulKids |
| SocialMediaShort | `socialMediaShort()` | Hook → Poin → (Bukti) → CTA | ModernSaaS, 15 dtk, 9:16 |

```ts
// src/projects/brand-x/launch.ts
import { appLaunch } from '../../templates';

export default appLaunch({
  id: 'BrandX-Launch',
  brand: { name: 'BrandX', logo: 'brands/brandx/logo.svg', url: 'brandx.id' },
  theme: 'ModernSaaS',
  duration: 20,
  title: 'Kerja tim jadi lebih ringan.',
  highlight: 'ringan',
  features: [
    { icon: '⚡', title: 'Cepat', description: 'Siap dalam 1 menit' },
    { icon: '🔒', title: 'Aman', description: 'Enkripsi penuh' },
  ],
  cta: { title: 'Coba gratis hari ini.', button: 'Mulai' },
});
```

## Cara B — Susun scene sendiri

Untuk alur cerita khusus. Daftar tipe scene ada di [KATALOG-SCENE.md](KATALOG-SCENE.md).

```ts
import { defineVideo } from '../../core';

export default defineVideo({
  id: 'BrandX-Promo',
  brand: { name: 'BrandX' },
  theme: 'Corporate',
  format: 'vertical',      // vertical | landscape | square | portrait
  duration: 25,            // opsional: skala otomatis semua scene
  scenes: [
    { type: 'hero', title: 'Judul besar', highlight: 'besar' },
    { type: 'stats', stats: [{ value: 12000, suffix: '+', label: 'pengguna' }] },
    { type: 'cta', title: 'Ayo mulai', button: 'Daftar' },
  ],
});
```

## Menyesuaikan brand tanpa tema baru

```ts
themeOverrides: {
  colors: { primary: '#e11d48', secondary: '#f97316' },
  gradient: 'linear-gradient(120deg, #e11d48, #f97316)',
},
```

## Format lain dari config yang sama

Ubah `format: 'landscape'` — semua komponen menyesuaikan layout (mis. scene `device` menjadi dua kolom). Untuk banyak format sekaligus:

```ts
const base = appLaunch({...});
export const square = { ...base, id: 'BrandX-Launch-Square', format: 'square' as const };
```

## Aset
- Taruh file di `public/brands/<brand>/`, rujuk dengan path relatif: `'brands/<brand>/logo.svg'`.
- Ikon fitur boleh emoji (`'⚡'`, otomatis jadi ikon garis yang tergambar), `'line:rocket'`, `'draw:brands/x/ikon.svg'`, file Lottie `.json`, atau path gambar.
- Screenshot aplikasi: `screen: { kind: 'image', src: 'brands/x/home.png' }` (rasio ±9:19.5).
- Musik: trek bawaan `audio: 'tenang'` (juga `'semangat'`, `'korporat'`), atau file sendiri
  `audio: { src: 'brands/x/music.mp3', volume: 0.6, loop: true }` (file `.mp3` otomatis lewat Git LFS).
- Watermark: `watermark: true` (logo + nama brand) atau `watermark: '@namakanal'`. Lihat `docs/KATALOG-SCENE.md`.
- Screenshot/foto besar: simpan di `public/brands/x/media/` agar disimpan via Git LFS.

## Render

```bash
npm run render:all -- BrandX                                   # semua video BrandX
npx remotion render BrandX-Promo out/brandx-promo.mp4
npx remotion render BrandX-Promo out/preview.mp4 --scale=0.5   # pratinjau cepat
npx remotion still BrandX-Promo out/thumb.png --frame=90       # thumbnail
```
