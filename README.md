# Motion Studio

Design system animasi berbasis **React + TypeScript + Remotion** untuk video promosi produk — SaaS, edukasi, aplikasi mobile, peluncuran startup, dan konten media sosial.

> Video baru = **file config**, bukan kode animasi baru.

```ts
// src/projects/harian/tips-gaji.ts — otomatis terdaftar sebagai "Harian-TipsGaji"
export default kontenHarian(harian, {
  slug: 'TipsGaji',
  topik: 'Keuangan',
  hook: 'Gaji selalu numpang lewat?',
  bagian: [
    { judul: 'Pisahkan di hari gajian', langkah: [...], narasi: 'Pertama, ...' },
    { teks: ['Catat pengeluaran.', 'Sekecil apa pun.'], narasi: 'Kedua, ...' },
  ],
  kesimpulan: 'Kecil, tapi konsisten.',
});
```

Tema, suara narator, transisi, subtitle, dan penutup datang dari **seri** (`series.ts`) milik brand — ditulis sekali.

## Mulai cepat

```bash
npm install
npm run studio                                       # pratinjau semua video
npx remotion render PriceAtlas-Promo out/promo.mp4   # render satu video
npm run render:list                                  # daftar semua video
npm run render:all                                   # render semua → out/<ID>.mp4
npm run render:all -- PriceAtlas --scale=0.5         # filter ID + pratinjau cepat
npm run cek                                          # typecheck + periksa isi semua video
npm run narasi -- <ID video>                         # render suara narasi (Azure)
```

## Arsitektur singkat

```
src/
├── config/        Token desain: animasi (spring, easing, entrance), tipografi,
│                  spasi, format (9:16, 16:9, 1:1, 4:5), transisi, font
├── themes/        ApplePremium · ModernSaaS · ModernDark · PlayfulKids · Corporate · IslamicWarm
├── motion/        useSpring, useEntrance, <Reveal>, useStagger, kamera/idle/keluar, teks kinetik
├── components/    Komponen visual reusable (LogoReveal, HeroSection, PhoneMockup, ...)
├── scenes/        Kontrak data scene (types.ts) + renderer per tipe scene
├── core/          MotionVideo (mesin), timeline, VideoConfig
├── templates/     Seri (defineSeries) + kontenHarian · promoProyek ·
│                  AppLaunch · SaaSProductPromo · MobileAppPromo · EducationalProductPromo · SocialMediaShort
└── projects/      ← SATU-SATUNYA tempat menulis video baru (registry otomatis)
    ├── harian/               (seri konten harian — contoh kontenHarian bernarasi)
    ├── price-atlas/          (ApplePremium — premium technology)
    ├── petualangan-pintar/   (PlayfulKids — edukasi ceria)
    ├── wadah-qris/           (IslamicWarm — dampak sosial)
    └── _demos/               (demo tiap template)
```

Alur data: **Config → Tema → Timeline → Scene → Komponen → Primitif motion → Token**.

## Contoh yang disertakan

| ID | Tema | Isi |
|---|---|---|
| `Harian-TipsGaji` | ModernDark | Template `kontenHarian`: konten harian bernarasi + subtitle |
| `PriceAtlas-Iklan30` | ApplePremium | Template `promoProyek`: iklan proyek 30 detik |
| `PriceAtlas-Promo` | ApplePremium | Hero → perbandingan harga → pindai struk → kalkulasi hemat → CTA |
| `PriceAtlas-Reel20` | ApplePremium | Reel 20 detik dari template `socialMediaShort` |
| `PetualanganPintar-Promo` | PlayfulKids | Maskot → kartu belajar → game kuis → CTA |
| `WadahQRIS-Promo` | IslamicWarm | Logo → alur donasi QRIS → dampak → cara kerja → testimoni → CTA |
| `Demo-AppLaunch` | Corporate | Template AppLaunch |
| `Demo-SaaS-Landscape` | ModernSaaS | Template SaaS, format 16:9 |
| `Demo-MobileApp` | ModernSaaS | Template MobileAppPromo |
| `Demo-Statement` | ModernDark | Scene `statement` (teks besar): stack, replace, typewriter |

## Dokumentasi

- [docs/MEMBUAT-VIDEO.md](docs/MEMBUAT-VIDEO.md) — cara membuat video baru (langkah demi langkah)
- [docs/KATALOG-SCENE.md](docs/KATALOG-SCENE.md) — semua tipe scene & propertinya
- [docs/ARSITEKTUR.md](docs/ARSITEKTUR.md) — lapisan sistem, token, sistem animasi
- [docs/MEMPERLUAS.md](docs/MEMPERLUAS.md) — menambah tema, komponen, tipe scene, template
- [docs/HEMAT-TOKEN-AI.md](docs/HEMAT-TOKEN-AI.md) — praktik terbaik memakai AI dengan biaya token minimal
- [docs/PROMPT-STORYBOARD.md](docs/PROMPT-STORYBOARD.md) — prompt siap tempel untuk menulis storyboard di ChatGPT/Gemini
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — catatan perubahan framework
- [CLAUDE.md](CLAUDE.md) — aturan kerja untuk asisten AI

## Aset besar (Git LFS)

Repo memakai **Git LFS** untuk audio, video, dan file desain (lihat `.gitattributes`): `mp3 wav m4a aac mp4 mov webm psd ai fig zip`, serta semua isi folder `public/**/media/`.

```bash
git lfs install          # sekali per komputer, sebelum clone/commit aset
```

- Logo/ikon SVG & PNG kecil → `public/brands/<brand>/` (biasa, tanpa LFS).
- Screenshot/foto resolusi tinggi → `public/brands/<brand>/media/` (otomatis LFS).
- Hasil render (`out/`) tidak pernah di-commit.

## Catatan
- Font dibundel lokal via `@fontsource` — render tidak butuh internet.
- Logo PriceAtlas & WadahQRIS di `public/brands/` adalah placeholder SVG; ganti dengan file asli memakai path yang sama.
- Lisensi Remotion: gratis untuk individu & tim kecil; perusahaan di atas batas tertentu memerlukan lisensi perusahaan (lihat remotion.dev/license).
