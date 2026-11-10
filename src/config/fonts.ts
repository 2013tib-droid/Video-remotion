/**
 * Font dibundel lokal via @fontsource (tidak butuh internet saat render).
 * Menambah font baru: `npm i @fontsource/<nama>` lalu import bobot yang dibutuhkan di sini.
 */
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/lora/500.css';
import '@fontsource/lora/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';

export const FONT_STACKS = {
  inter: '"Inter", -apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  jakarta: '"Plus Jakarta Sans", "Inter", Arial, sans-serif',
  fredoka: '"Fredoka", "Nunito", "Comic Sans MS", sans-serif',
  plex: '"IBM Plex Sans", "Inter", Arial, sans-serif',
  lora: '"Lora", Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
} as const;
