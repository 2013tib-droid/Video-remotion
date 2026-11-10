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
