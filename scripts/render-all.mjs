#!/usr/bin/env node
/**
 * Render banyak video sekaligus (bundle sekali, render berurutan).
 *
 *   npm run render:all                       # semua video
 *   npm run render:all -- PriceAtlas         # ID yang mengandung "PriceAtlas"
 *   npm run render:all -- --scale=0.5        # pratinjau cepat setengah resolusi
 *   npm run render:all -- --list             # tampilkan daftar saja, tanpa render
 *   npm run render:all -- --skip-demos       # lewati folder Demo-*
 *
 * Output: out/<ID>.mp4
 * Browser kustom (opsional): REMOTION_BROWSER_EXECUTABLE=/path/ke/chrome
 */
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const flagValue = (name) => flag(name)?.split('=')[1];
const filters = args.filter((a) => !a.startsWith('--'));

const scale = Number(flagValue('scale') ?? 1);
const listOnly = Boolean(flag('list'));
const skipDemos = Boolean(flag('skip-demos'));
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;

const outDir = path.join(root, 'out');
mkdirSync(outDir, { recursive: true });

console.log('📦 Bundling…');
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const all = await getCompositions(serveUrl, { browserExecutable });

const selected = all.filter(
  (c) => (!filters.length || filters.some((f) => c.id.includes(f))) && !(skipDemos && c.id.startsWith('Demo-')),
);

if (!selected.length) {
  console.error(`Tidak ada video yang cocok. Tersedia: ${all.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

const fmt = (c) => `${c.id}  (${c.width}x${c.height}, ${(c.durationInFrames / c.fps).toFixed(1)} dtk)`;
if (listOnly) {
  selected.forEach((c) => console.log(`• ${fmt(c)}`));
  process.exit(0);
}

const failed = [];
for (const [i, composition] of selected.entries()) {
  const output = path.join(outDir, `${composition.id}.mp4`);
  console.log(`\n🎬 [${i + 1}/${selected.length}] ${fmt(composition)}`);
  try {
    let last = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: output,
      scale,
      browserExecutable,
      chromiumOptions: { gl: process.env.REMOTION_GL ?? 'swangle' },
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 10) * 10;
        if (pct !== last) process.stdout.write(`${(last = pct)}% `);
      },
    });
    console.log(`\n✅ ${path.relative(root, output)}`);
  } catch (err) {
    console.error(`\n❌ ${composition.id}: ${err.message}`);
    failed.push(composition.id);
  }
}

console.log(`\nSelesai: ${selected.length - failed.length} berhasil, ${failed.length} gagal.`);
if (failed.length) process.exit(1);
