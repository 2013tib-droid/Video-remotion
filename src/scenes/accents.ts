import { countAccents } from '../motion';
import type { SceneConfig } from './types';

/**
 * Jumlah kata sorotan (highlight + emphasis di judul) pada satu scene.
 * Dipakai untuk giliran coretan marker → underline → circle yang tetap sama setiap render.
 */
export function sceneAccentCount(scene: SceneConfig): number {
  const emphasis = scene.emphasis ?? [];
  if (scene.type === 'statement') return scene.lines.reduce((n, l) => n + countAccents(l.text, l.highlight, emphasis), 0);
  if ('title' in scene && typeof scene.title === 'string') {
    return countAccents(scene.title, 'highlight' in scene ? scene.highlight : undefined, emphasis);
  }
  return 0;
}
