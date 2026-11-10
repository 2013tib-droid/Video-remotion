# Membuat Video Baru

Setiap video adalah satu objek `VideoConfig`. Ada dua cara menulisnya.

## Cara A — Pakai template (paling cepat)

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

## Daftarkan

```ts
// src/projects/index.ts
import brandXPromo from './brand-x/promo';
export const PROJECTS = {
  // ...
  BrandX: [brandXPromo],
};
```

Lalu `npm run typecheck` dan `npm run studio`.

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
- Musik: `audio: { src: 'brands/x/music.mp3', volume: 0.6 }` (file `.mp3` otomatis lewat Git LFS).
- Screenshot/foto besar: simpan di `public/brands/x/media/` agar disimpan via Git LFS.

## Render

```bash
npm run render:all -- BrandX                                   # semua video BrandX
npx remotion render BrandX-Promo out/brandx-promo.mp4
npx remotion render BrandX-Promo out/preview.mp4 --scale=0.5   # pratinjau cepat
npx remotion still BrandX-Promo out/thumb.png --frame=90       # thumbnail
```
