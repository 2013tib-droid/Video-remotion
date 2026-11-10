# Motion Studio

Design system animasi berbasis **React + TypeScript + Remotion** untuk video promosi produk — SaaS, edukasi, aplikasi mobile, peluncuran startup, dan konten media sosial.

> Video baru = **file config**, bukan kode animasi baru.

```ts
// src/projects/price-atlas/reel.ts
export default socialMediaShort({
  id: 'PriceAtlas-Reel20',
  brand: priceAtlas,
  theme: 'ApplePremium',
  duration: 20,
  hook: 'Masih bayar lebih mahal untuk barang yang sama?',
  points: [
    { icon: '🔍', title: 'Bandingkan harga', description: 'Ratusan toko dalam satu pencarian' },
    // ...
  ],
  cta: { title: 'Belanja cerdas mulai sekarang.', button: 'Unduh Gratis' },
});
```

## Mulai cepat

```bash
npm install
npm run studio                                       # pratinjau semua video
npx remotion render PriceAtlas-Promo out/promo.mp4   # render satu video
npm run render:list                                  # daftar semua video
npm run render:all                                   # render semua → out/<ID>.mp4
npm run render:all -- PriceAtlas --scale=0.5         # filter ID + pratinjau cepat
npm run typecheck                                    # validasi config
```

## Arsitektur singkat

```
src/
├── config/        Token desain: animasi (spring, easing, entrance), tipografi,
│                  spasi, format (9:16, 16:9, 1:1, 4:5), transisi, font
├── themes/        ApplePremium · ModernSaaS · PlayfulKids · Corporate · IslamicWarm
├── motion/        useSpring, useEntrance, <Reveal>, useStagger, kamera/idle/keluar, teks kinetik,
│                  ikon tergambar (useIconDraw/useIconIdle)
├── components/    Komponen visual reusable (LogoReveal, HeroSection, PhoneMockup, ...)
│   └── icons/     Ikon garis tergambar (75 ikon), SVG tergambar, Lottie
├── scenes/        Kontrak data scene (types.ts) + renderer per tipe scene
├── core/          MotionVideo (mesin), timeline, VideoConfig
├── templates/     AppLaunch · SaaSProductPromo · MobileAppPromo ·
│                  EducationalProductPromo · SocialMediaShort
└── projects/      ← SATU-SATUNYA tempat menulis video baru
    ├── price-atlas/          (ApplePremium — premium technology)
    ├── petualangan-pintar/   (PlayfulKids — edukasi ceria)
    ├── wadah-qris/           (IslamicWarm — dampak sosial)
    └── _demos/               (demo tiap template)
```

Alur data: **Config → Tema → Timeline → Scene → Komponen → Primitif motion → Token**.

## Contoh yang disertakan

| ID | Tema | Isi |
|---|---|---|
| `PriceAtlas-Promo` | ApplePremium | Hero → perbandingan harga → pindai struk → kalkulasi hemat → CTA |
| `PriceAtlas-Reel20` | ApplePremium | Reel 20 detik dari template `socialMediaShort` |
| `PetualanganPintar-Promo` | PlayfulKids | Maskot → kartu belajar → game kuis → CTA |
| `WadahQRIS-Promo` | IslamicWarm | Logo → alur donasi QRIS → dampak → cara kerja → testimoni → CTA |
| `Demo-AppLaunch` | Corporate | Template AppLaunch |
| `Demo-SaaS-Landscape` | ModernSaaS | Template SaaS, format 16:9 |
| `Demo-MobileApp` | ModernSaaS | Template MobileAppPromo |
| `Demo-Statement` | ModernDark | Scene `statement` (teks besar): stack, replace, typewriter |
| `Demo-Ikon` | ModernSaaS | Ikon beranimasi: emoji → ikon garis tergambar, `line:`, SVG tergambar (`draw:`), Lottie |

## Ikon beranimasi

Ikon tidak statis: emoji yang dikenal (🛒 🔔 📈 🔒 ✅ …) otomatis menjadi **ikon garis yang tergambar** garis demi garis,
lalu terisi warna tipis dan terus bergerak halus (berayun, berdenyut, berputar). Field ikon juga menerima
`'line:rocket'`, `'draw:brands/x/ikon.svg'` (SVG tergambar), dan animasi **Lottie** `.json`. Scene `hero` punya
`illustration`. Kembali ke emoji asli: `motion: { icons: 'emoji' }`. Detail: [docs/KATALOG-SCENE.md](docs/KATALOG-SCENE.md).

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
