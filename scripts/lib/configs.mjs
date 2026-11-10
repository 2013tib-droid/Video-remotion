/**
 * Muat config video (TypeScript) di Node lewat esbuild — dipakai `narasi` dan `cek`.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PROJECTS_DIR = 'src/projects';
let seq = 0;
const isVideo = (v) => Boolean(v) && typeof v === 'object' && typeof v.id === 'string' && Array.isArray(v.scenes);

/** Semua file `src/projects/<folder>/<nama>.ts` (sama dengan registry otomatis). */
export function listConfigFiles() {
  const out = [];
  for (const dir of readdirSync(PROJECTS_DIR).sort()) {
    const p = join(PROJECTS_DIR, dir);
    if (!statSync(p).isDirectory()) continue;
    for (const f of readdirSync(p).sort()) if (/\.ts$/.test(f) && !/\.d\.ts$/.test(f)) out.push(join(p, f));
  }
  return out;
}

export const narrationJsonPath = (file) => resolve(file).replace(/\.tsx?$/, '.narration.json');

/**
 * → { configs: VideoConfig[], narrationKey, splitWords, computeTimeline, jsonPath }.
 * `configs` kosong bila file tidak meng-`export default` video (brand.ts, series.ts).
 */
export async function loadConfigFile(file) {
  const { build } = await import('esbuild');
  const abs = resolve(file);
  const entry = `import * as mod from ${JSON.stringify(abs)};
export const def = mod.default;
export { narrationKey, splitWords } from ${JSON.stringify(resolve('src/core/narration.ts'))};`;
  const out = await build({
    stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' },
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
    external: ['remotion', '@remotion/*', 'react', 'react-dom', 'react/*'],
    loader: { '.css': 'empty', '.woff': 'empty', '.woff2': 'empty', '.png': 'empty', '.svg': 'empty', '.jpg': 'empty' },
  });
  const cache = join('node_modules', '.cache');
  mkdirSync(cache, { recursive: true });
  const tmp = resolve(cache, `cfg-${process.pid}-${seq++}-${basename(file)}.mjs`);
  writeFileSync(tmp, out.outputFiles[0].text);
  try {
    const mod = await import(pathToFileURL(tmp).href);
    const configs = (Array.isArray(mod.def) ? mod.def : [mod.def]).filter(isVideo);
    return { configs, narrationKey: mod.narrationKey, splitWords: mod.splitWords, jsonPath: narrationJsonPath(file) };
  } finally {
    rmSync(tmp, { force: true });
  }
}

/**
 * Argumen CLI → file config. Argumen boleh path file, atau (potongan) ID video
 * (mis. `Harian-TipsGaji` atau `Harian`).
 */
export async function resolveTargets(args) {
  const files = new Set();
  const ids = args.filter((a) => !existsSync(a));
  for (const a of args) if (existsSync(a)) files.add(a);
  if (ids.length) {
    for (const f of listConfigFiles()) {
      const { configs } = await loadConfigFile(f);
      if (configs.some((c) => ids.some((id) => c.id.includes(id)))) files.add(f);
    }
  }
  return [...files];
}
