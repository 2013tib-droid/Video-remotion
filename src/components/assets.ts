import { staticFile } from 'remotion';

/** True bila string adalah path/URL gambar (bukan emoji/teks). */
export function isImageSrc(src: string): boolean {
  return /^(https?:|data:)/.test(src) || /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(src);
}

/** True bila string adalah animasi Lottie (.json). */
export function isLottieSrc(src: string): boolean {
  return /\.json$/i.test(src.replace(/^lottie:/, '')) || src.startsWith('lottie:');
}

/** Path relatif → file di folder public/. URL absolut dibiarkan. */
export function resolveSrc(src: string): string {
  return /^(https?:|data:)/.test(src) ? src : staticFile(src.replace(/^\/+/, ''));
}

/** True bila string adalah file video (b-roll). */
export function isVideoSrc(src: string): boolean {
  return /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(src);
}
