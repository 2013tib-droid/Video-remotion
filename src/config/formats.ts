/**
 * Format/aspect ratio video. Semua komponen menyesuaikan ukuran berdasarkan
 * sisi terpendek (lihat `scale` di ThemeProvider), jadi format bisa diganti
 * tanpa mengubah komponen.
 */
export const FORMATS = {
  /** 9:16 — Instagram Reels, TikTok, YouTube Shorts */
  vertical: { width: 1080, height: 1920 },
  /** 16:9 — YouTube, website, presentasi */
  landscape: { width: 1920, height: 1080 },
  /** 1:1 — feed Instagram / LinkedIn */
  square: { width: 1080, height: 1080 },
  /** 4:5 — feed Instagram portrait */
  portrait: { width: 1080, height: 1350 },
} as const;

export type FormatName = keyof typeof FORMATS;

export const DEFAULT_FORMAT: FormatName = 'vertical';
export const DEFAULT_FPS = 30;

/**
 * Area aman (dalam px pada basis 1080) agar teks tidak tertutup UI platform
 * (tombol like, caption, dsb).
 */
export const SAFE_AREA: Record<FormatName, { top: number; bottom: number; x: number }> = {
  vertical: { top: 220, bottom: 340, x: 80 },
  landscape: { top: 90, bottom: 90, x: 140 },
  square: { top: 90, bottom: 90, x: 90 },
  portrait: { top: 110, bottom: 130, x: 90 },
};
