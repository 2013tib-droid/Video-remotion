/**
 * REGISTRY VIDEO — OTOMATIS. Tidak perlu diubah saat menambah video.
 *
 * Setiap file `src/projects/<folder>/<nama>.ts` yang `export default` sebuah VideoConfig
 * (atau array VideoConfig) langsung terdaftar di Remotion Studio, dikelompokkan per folder.
 * File tanpa default export (brand.ts, series.ts) dilewati.
 *
 * Narasi: `<nama>.narration.json` di sebelah config (hasil `npm run narasi`) otomatis
 * dipasang ke `config.narration` — tidak perlu diimpor manual.
 */
import type { NarrationData, VideoConfig } from '../core';

const configs = require.context('./', true, /^\.\/[^/]+\/[^/]+\.ts$/);
const narrations = require.context('./', true, /^\.\/[^/]+\/[^/]+\.narration\.json$/);

const isVideo = (v: unknown): v is VideoConfig =>
  Boolean(v) && typeof v === 'object' && typeof (v as VideoConfig).id === 'string' && Array.isArray((v as VideoConfig).scenes);

const pascal = (folder: string) =>
  folder
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

export const PROJECTS: Record<string, VideoConfig[]> = {};
const seen = new Map<string, string>();

for (const key of configs.keys().sort()) {
  const def = (configs(key) as { default?: unknown }).default;
  const list = (Array.isArray(def) ? def : [def]).filter(isVideo);
  if (!list.length) continue;
  const jsonKey = key.replace(/\.ts$/, '.narration.json');
  const data = narrations.keys().includes(jsonKey) ? (narrations(jsonKey) as NarrationData & { default?: NarrationData }) : undefined;
  const folder = pascal(key.split('/')[1]);
  for (const config of list) {
    if (seen.has(config.id)) throw new Error(`ID video ganda "${config.id}": ${seen.get(config.id)} dan ${key}`);
    seen.set(config.id, key);
    (PROJECTS[folder] ??= []).push(config.narration || !data ? config : { ...config, narration: data.default ?? data });
  }
}
