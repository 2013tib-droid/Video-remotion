/**
 * Skala tipografi (px pada basis 1080 untuk sisi terpendek).
 * Ukuran sebenarnya = nilai * scale (lihat useTheme().type).
 */
export const TYPE_SCALE = {
  display: 128,
  h1: 96,
  h2: 72,
  h3: 52,
  subtitle: 40,
  body: 32,
  caption: 26,
  label: 22,
} as const;

export type TypeSize = keyof typeof TYPE_SCALE;

/** Pengali ukuran teks untuk format portrait/vertikal. */
export const PORTRAIT_TYPE_BOOST = 1.12;

/**
 * Keterbacaan `legibility: 'mobile'` (opsional per video/seri).
 * - `typeFloor`: ukuran minimum (px basis 1080, SETELAH boost portrait) untuk teks pendukung.
 *   Standar: label ±25 px, caption ±29 px, body ±36 px — terlalu kecil untuk tabel/HUD di layar ponsel.
 * - `readHold`: detik tambahan setelah narasi selesai sebelum elemen mulai keluar
 *   (standar: elemen keluar tepat saat kalimat terakhir selesai).
 * - `minFontQc`: di bawah ini `npm run pratinjau` memperingatkan "teks kecil".
 */
export const LEGIBILITY = {
  typeFloor: { label: 32, caption: 36, body: 38 } as Partial<Record<'label' | 'caption' | 'body', number>>,
  /** Teks kecil HUD/catatan (label × faktor < 1) tidak lebih kecil dari ini (px basis 1080). */
  smallFloor: 30,
  readHold: 0.6,
  minFontQc: 30,
} as const;

export const LINE_HEIGHT = {
  tight: 1.05,
  heading: 1.12,
  body: 1.4,
} as const;
