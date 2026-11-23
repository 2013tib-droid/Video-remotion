#!/usr/bin/env node
/**
 * PRATINJAU + QC TATA LETAK — cek visual sebelum render penuh (jauh lebih cepat dari render video).
 *
 *   npm run pratinjau -- <ID video | config.ts>          # skala 0,5 (default)
 *   npm run pratinjau -- Harian-SpreadEmas --scale=0.25  # lebih cepat
 *   npm run pratinjau -- <ID> --ketat                    # exit 1 juga untuk peringatan
 *
 * Per video: 1 still "hook" (0,6 dtk pertama — yang dilihat penonton saat memutuskan lanjut/geser)
 * + 1 still per scene tepat sebelum elemen keluar (semua isi sudah tampil). Saat merender, detektor
 * `src/core/QualityCheck.tsx` mengukur setiap teks yang terlihat:
 *   ✗ tepi (keluar frame) · wadah (terpotong) · tumpuk (teks saling menimpa)      → exit 1
 *   ! aman (zona UI Reels/TikTok/Shorts) · kecil (huruf < LEGIBILITY.minFontQc)    → peringatan
 * Juga memeriksa resolusi/rasio (vertikal harus 1080×1920 pada skala render 1), dan HOOK LAMBAT: elemen utama
 * hook (teks konten terbesar di akhir scene 1) harus sudah tampil penuh (opasitas ≥ 0,9) pada still 0,6 dtk → peringatan.
 *
 * Hasil: out/pratinjau/<ID>/  — NN-<tipe>.jpg, laporan.md, index.html (lembar kontak).
 * Browser: REMOTION_BROWSER_EXECUTABLE (sesi cloud: /opt/pw-browsers/chromium).
 * Estetika (daya tarik hook, ritme, warna, kebenaran data) tetap perlu dilihat manusia.
 */
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfigFile, resolveTargets } from './lib/configs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flagValue = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const targets = args.filter((a) => !a.startsWith('--'));
const scale = Number(flagValue('scale') ?? 0.5);
const strict = args.includes('--ketat');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;

if (!targets.length) {
  console.error('Pakai: npm run pratinjau -- <ID video | config.ts> [--scale=0.5] [--ketat]');
  process.exit(1);
}

const EXPECTED = { vertical: [1080, 1920], landscape: [1920, 1080], square: [1080, 1080], portrait: [1080, 1350] };
const ERROR_KINDS = new Set(['tepi', 'wadah', 'tumpuk']);
const LABEL = {
  tepi: 'keluar frame',
  wadah: 'terpotong wadah',
  tumpuk: 'teks bertumpuk',
  aman: 'di zona UI platform',
  kecil: 'teks kecil',
  lambat: 'hook lambat',
};
/** Elemen utama hook: teks ≥ 85% ukuran teks terbesar di akhir scene 1; harus tampil (opasitas ≥ 0,9) pada 0,6 dtk. */
const HOOK_MAIN = 0.85;
const HOOK_OPACITY = 0.9;
// Angka yang sedang menghitung naik ("Rp123.456" → "Rp400.000") dianggap teks yang sama.
const hookKey = (t) => t.toLowerCase().replace(/[\d.,\s]+/g, '#');
function slowHook(hookTexts, endTexts) {
  const visible = endTexts.filter((x) => x.o >= HOOK_OPACITY);
  if (!visible.length) return [];
  const max = Math.max(...visible.map((x) => x.s));
  const main = visible.filter((x) => x.s >= max * HOOK_MAIN);
  const late = [];
  for (const m of main) {
    const o = Math.max(0, ...hookTexts.filter((x) => hookKey(x.t) === hookKey(m.t)).map((x) => x.o));
    if (o < HOOK_OPACITY) late.push({ t: m.t, o });
  }
  if (!late.length) return [];
  // Satu temuan per video (judul kinetik = satu elemen per kata).
  const text = late.map((x) => x.t).join(' ').slice(0, 60);
  const o = Math.min(...late.map((x) => x.o));
  return [{ kind: 'lambat', text, detail: `${late.length}/${main.length} teks utama belum tampil penuh pada 0,6 dtk (opasitas terendah ${o.toFixed(2)}) — pakai pola hook / masuk: 'cepat'` }];
}

// 1) Video yang diminta + frame yang dipotret (dari timeline yang sama dengan mesin).
const jobs = [];
for (const file of await resolveTargets(targets)) {
  const { configs, computeTimeline, SCENE_MOTION_TIMING, jsonPath } = await loadConfigFile(file);
  for (const config of configs) {
    if (!targets.some((t) => existsSync(t) || config.id.includes(t))) continue;
    if (!config.narration && existsSync(jsonPath)) config.narration = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const tl = computeTimeline(config);
    const exitLead = Math.round(SCENE_MOTION_TIMING.exitLead * tl.fps);
    const shots = [{ name: 'hook', scene: 0, frame: Math.min(Math.round(0.6 * tl.fps), tl.entries[0].frames - 1) }];
    tl.entries.forEach((e, i) => {
      const next = tl.entries[i + 1];
      const end = next ? e.from + e.frames - next.transitionFrames - exitLead - 2 : e.from + e.frames - 1;
      shots.push({ name: config.scenes[i].type, scene: i, frame: Math.max(e.from + e.transitionFrames, end) });
    });
    jobs.push({ config, tl, shots });
  }
}
if (!jobs.length) {
  console.error(`Tidak ada video yang cocok dengan: ${targets.join(', ')}`);
  process.exit(1);
}

// 2) Bundle sekali, satu browser untuk semua still.
console.log('📦 Bundling…');
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const browser = await openBrowser('chrome', { browserExecutable, logLevel: 'error', chromiumOptions: { gl: process.env.REMOTION_GL ?? 'swangle' } });

let totalErrors = 0;
let totalWarnings = 0;
const pad = (n) => String(n).padStart(2, '0');

try {
  for (const { config, tl, shots } of jobs) {
    const outDir = path.join(root, 'out', 'pratinjau', config.id);
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
    const composition = await selectComposition({ serveUrl, id: config.id, inputProps: { qc: true }, puppeteerInstance: browser, logLevel: 'error' });
    const fmt = config.format ?? 'vertical';
    const [ew, eh] = EXPECTED[fmt];
    const res = [];
    if (composition.width !== ew || composition.height !== eh) res.push(`resolusi ${composition.width}×${composition.height}, seharusnya ${ew}×${eh}`);
    console.log(`\n🖼  ${config.id}  (${composition.width}×${composition.height} → still ×${scale}, ${(tl.durationInFrames / tl.fps).toFixed(1)} dtk, ${shots.length} frame)`);

    const rows = [];
    for (const [k, shot] of shots.entries()) {
      const file = `${pad(k)}-${shot.name}.jpg`;
      let issues = [];
      let texts = [];
      await renderStill({
        composition,
        serveUrl,
        frame: shot.frame,
        output: path.join(outDir, file),
        imageFormat: 'jpeg',
        jpegQuality: 80,
        scale,
        inputProps: { qc: true },
        puppeteerInstance: browser,
        logLevel: 'error',
        onBrowserLog: ({ text }) => {
          const i = text.indexOf('QC|');
          if (i >= 0) {
            try {
              const qc = JSON.parse(text.slice(i + 3));
              issues = qc.issues;
              texts = qc.texts ?? [];
            } catch {
              /* abaikan log rusak */
            }
          }
        },
      });
      // Frame hook diambil saat animasi masuk masih berjalan: huruf yang naik dari balik masker
      // atau kartu yang sedang lewat bukan cacat tata letak.
      if (shot.name === 'hook') issues = issues.filter((x) => x.kind !== 'wadah' && x.kind !== 'tumpuk');
      // "Teks kecil" sering banyak sekaligus (satu tabel) → digabung jadi satu temuan per frame.
      const small = issues.filter((x) => x.kind === 'kecil');
      if (small.length > 1) {
        const sizes = small.map((x) => Number.parseInt(x.detail, 10)).filter(Number.isFinite);
        const sample = small.slice(0, 3).map((x) => `"${x.text}"`).join(', ');
        issues = [
          ...issues.filter((x) => x.kind !== 'kecil'),
          { kind: 'kecil', text: `${small.length} teks`, detail: `terkecil ${Math.min(...sizes)} px, mis. ${sample}${small.length > 3 ? ', …' : ''} (legibility: 'mobile' menaikkannya)` },
        ];
      }
      const errs = issues.filter((x) => ERROR_KINDS.has(x.kind));
      const warns = issues.filter((x) => !ERROR_KINDS.has(x.kind));
      totalErrors += errs.length;
      totalWarnings += warns.length;
      const mark = errs.length ? '✗' : warns.length ? '!' : '✓';
      const t = (shot.frame / tl.fps).toFixed(1);
      console.log(`  ${mark} ${file}  (dtk ${t})`);
      for (const x of [...errs, ...warns]) console.log(`      ${ERROR_KINDS.has(x.kind) ? '✗' : '!'} ${LABEL[x.kind]}: "${x.text}" — ${x.detail}`);
      rows.push({ file, shot, t, issues, mark, texts });
    }
    // Hook lambat: bandingkan still 0,6 dtk dengan still akhir scene 1 (elemen utama sudah tampil penuh di sana).
    if (rows.length > 1) {
      const slow = slowHook(rows[0].texts, rows[1].texts);
      if (slow.length) {
        rows[0].issues.push(...slow);
        if (rows[0].mark === '✓') rows[0].mark = '!';
        totalWarnings += slow.length;
        for (const x of slow) console.log(`  ! ${rows[0].file} → ${LABEL.lambat}: "${x.text}" — ${x.detail}`);
      }
    }
    for (const r of res) console.log(`  ✗ ${r}`);
    totalErrors += res.length;

    // Laporan + lembar kontak.
    const md = [
      `# Pratinjau ${config.id}`,
      '',
      `${composition.width}×${composition.height} · ${(tl.durationInFrames / tl.fps).toFixed(1)} dtk · ${config.scenes.length} scene · still ×${scale}`,
      ...res.map((r) => `- ✗ ${r}`),
      '',
      '| Frame | Detik | Status | Temuan |',
      '|---|---|---|---|',
      ...rows.map(
        (r) =>
          `| ${r.file} | ${r.t} | ${r.mark} | ${r.issues.map((x) => `${LABEL[x.kind]}: ${x.text} — ${x.detail}`.replace(/\|/g, '/')).join('<br>') || '—'} |`,
      ),
      '',
      'Otomatis: tepi, terpotong, bertumpuk, zona UI platform, ukuran huruf, resolusi.',
      'Perlu mata manusia: daya tarik hook, kejelasan cerita, ritme, warna, kebenaran data.',
    ].join('\n');
    writeFileSync(path.join(outDir, 'laporan.md'), md);
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pratinjau ${esc(config.id)}</title>
<style>body{margin:0;padding:16px;font:14px/1.4 system-ui,sans-serif;background:#111;color:#eee}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
figure{margin:0;background:#1c1c1c;border-radius:8px;overflow:hidden}img{width:100%;display:block}
figcaption{padding:6px 8px}.e{color:#ff6b6b}.w{color:#ffd166}</style>
<h1>${esc(config.id)}</h1><p>${composition.width}×${composition.height} · ${(tl.durationInFrames / tl.fps).toFixed(1)} dtk</p><div class="g">
${rows
  .map(
    (r) => `<figure><img src="${r.file}" loading="lazy"><figcaption>${r.mark} ${esc(r.file)} · ${r.t} dtk${r.issues
      .map((x) => `<br><span class="${ERROR_KINDS.has(x.kind) ? 'e' : 'w'}">${LABEL[x.kind]}: ${esc(x.text)}</span>`)
      .join('')}</figcaption></figure>`,
  )
  .join('\n')}
</div>`;
    writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`  → ${path.relative(root, outDir)}/index.html`);
  }
} finally {
  await browser.close({ silent: true });
}

console.log(`\nQC tata letak: ${totalErrors} galat, ${totalWarnings} peringatan.`);
process.exit(totalErrors || (strict && totalWarnings) ? 1 : 0);
