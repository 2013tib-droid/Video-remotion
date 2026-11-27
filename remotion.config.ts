import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
// Scene 3D (`world`) butuh WebGL. `swangle` = perangkat lunak (jalan tanpa GPU, mis. sesi cloud); mesin ber-GPU: REMOTION_GL=angle.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'angle' | 'swangle' | undefined) ?? 'swangle');
// Satu tab browser per render: dengan beberapa tab paralel di resolusi penuh, Chromium kadang memotret frame sebelum
// grafik besar (selisih, tren, alur, irisan) selesai digambar → elemen hilang-muncul per frame (kedip). Lebih lambat ±2×,
// tapi hasilnya stabil. Ganti per perintah dengan `--concurrency=<n>` bila perlu.
Config.setConcurrency(1);
