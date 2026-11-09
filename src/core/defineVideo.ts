import type { VideoConfig } from './types';

/**
 * Helper identitas untuk autocompletion & type-check config video.
 *
 * export default defineVideo({ id: 'X', brand: {...}, theme: 'ModernSaaS', scenes: [...] });
 */
export function defineVideo(config: VideoConfig): VideoConfig {
  return config;
}
