#!/usr/bin/env node
/**
 * Periksa ISI semua config video (yang tidak tertangkap typecheck).
 *
 *   npm run cek                 # semua video
 *   npm run cek -- Harian       # ID yang mengandung "Harian" (atau path file)
 *
 * ✗ galat (exit 1): ID ganda/tidak valid, aset/musik tidak ada di public/, cue `at` tidak ada di narasi,
 *   scene bernarasi tanpa `voice`.
 * ! peringatan: `highlight`/`emphasis` tidak ditemukan di teksnya, teks terlalu panjang,
 *   narasi belum dirender, scene tanpa narasi di video bernarasi, terlalu banyak item.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listConfigFiles, loadConfigFile, resolveTargets } from './lib/configs.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const files = args.length ? await resolveTargets(args) : listConfigFiles();

const LIMIT = { title: 70, subtitle: 110, itemTitle: 34, itemDescription: 60, items: 4, statementLine: 28 };
const ASSET = /\.(png|jpe?g|webp|gif|svg|mp4|webm|mov|mp3|wav|m4a|json|glb)$/i;
const norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const words = (t) => t.split(/\s+/).map(norm).filter(Boolean);
const hasPhrase = (text, phrase) => {
  const a = words(text);
  const b = words(phrase);
  return b.length > 0 && a.some((_, i) => b.every((w, j) => a[i + j] === w));
};

/** Telusuri semua nilai di sebuah objek: cb(key, value, parent). */
function walk(node, cb, key = '') {
  if (Array.isArray(node)) return node.forEach((v) => walk(v, cb, key));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      cb(k, v, node);
      walk(v, cb, k);
    }
  }
}

const ids = new Map();
let errors = 0;
let warnings = 0;
let count = 0;

for (const file of files) {
  const { configs, narrationKey, jsonPath } = await loadConfigFile(file);
  for (const config of configs) {
    count++;
    const err = [];
    const warn = [];
    const at = (i, s) => `scene ${i + 1} (${s.type})`;

    if (!/^[A-Za-z0-9-]+$/.test(config.id)) err.push(`ID "${config.id}" hanya boleh huruf, angka, tanda -`);
    if (ids.has(config.id)) err.push(`ID ganda, juga dipakai di ${ids.get(config.id)}`);
    ids.set(config.id, file);

    // Aset
    walk({ brand: config.brand, audio: config.audio, scenes: config.scenes }, (k, v) => {
      if (typeof v !== 'string' || k === 'narration' || /^https?:|^data:/.test(v)) return;
      const path = v.replace(/^(draw|lottie):/, '');
      if (ASSET.test(path) && !/\s/.test(path) && !existsSync(join('public', path))) err.push(`aset tidak ada: public/${path}`);
    });

    // Musik: nama trek bawaan (public/music/<nama>.wav) atau path file.
    const music = typeof config.audio === 'string' ? config.audio : config.audio ? config.audio.src : null;
    if (music && !/^https?:/.test(music) && !ASSET.test(music) && !existsSync(join('public', 'music', `${music}.wav`))) {
      err.push(`musik "${music}" tidak dikenal (trek bawaan: tenang, semangat, korporat; atau path file di public/)`);
    }

    const narrated = config.scenes.some((s) => s.narration);
    if (narrated && !config.voice) err.push('ada scene bernarasi tetapi `voice` kosong');
    const data = config.narration ?? (existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath, 'utf8')) : { clips: {} });
    let missing = 0;

    config.scenes.forEach((s, i) => {
      if (s.highlight && s.title && !s.title.includes(s.highlight)) warn.push(`${at(i, s)}: highlight "${s.highlight}" tidak ada di judul`);
      if (s.title && s.title.length > LIMIT.title) warn.push(`${at(i, s)}: judul ${s.title.length} huruf (maks ±${LIMIT.title})`);
      if (s.subtitle && s.subtitle.length > LIMIT.subtitle) warn.push(`${at(i, s)}: subtitle ${s.subtitle.length} huruf (maks ±${LIMIT.subtitle})`);
      const items = s.features ?? s.steps?.filter((x) => x.title) ?? s.stats;
      if (Array.isArray(items) && items.length > LIMIT.items && s.type !== 'question') {
        warn.push(`${at(i, s)}: ${items.length} item (maks ${LIMIT.items} agar terbaca)`);
      }
      for (const f of s.features ?? []) {
        if (f.title.length > LIMIT.itemTitle) warn.push(`${at(i, s)}: judul item "${f.title}" terlalu panjang`);
        if ((f.description ?? '').length > LIMIT.itemDescription) warn.push(`${at(i, s)}: deskripsi item "${f.title}" terlalu panjang`);
      }
      if (s.type === 'statement') {
        for (const l of s.lines) {
          if (l.highlight && !l.text.includes(l.highlight)) warn.push(`${at(i, s)}: highlight "${l.highlight}" tidak ada di baris "${l.text}"`);
          if (l.text.length > LIMIT.statementLine) warn.push(`${at(i, s)}: baris "${l.text}" panjang (${l.text.length} huruf) — font akan mengecil`);
        }
      }
      if (s.narration) {
        for (const e of s.emphasis ?? []) if (!hasPhrase(s.narration, e)) warn.push(`${at(i, s)}: emphasis "${e}" tidak ada di narasi`);
        walk(s, (k, v) => {
          if (k !== 'at' && !/At$/.test(k)) return;
          if (typeof v === 'string' && !hasPhrase(s.narration, v.replace(/#\d+$/, ''))) err.push(`${at(i, s)}: cue "${v}" tidak ada di narasi scene ini`);
        });
        const clip = config.voice ? data.clips?.[narrationKey(s.narration, config.voice)] : null;
        if (!clip || !existsSync(join('public', clip.src))) missing++;
      } else if (narrated) {
        warn.push(`${at(i, s)}: tanpa narasi di video bernarasi (akan hening)`);
      }
    });
    if (missing) warn.push(`${missing} klip narasi belum dirender → AZURE_SPEECH_KEY=proxy-injected npm run narasi -- ${config.id}`);

    errors += err.length;
    warnings += warn.length;
    const mark = err.length ? '✗' : warn.length ? '!' : '✓';
    console.log(`${mark} ${config.id}  (${config.scenes.length} scene${narrated ? ', bernarasi' : ''})`);
    err.forEach((m) => console.log(`    ✗ ${m}`));
    warn.forEach((m) => console.log(`    ! ${m}`));
  }
}

console.log(`\n${count} video diperiksa: ${errors} galat, ${warnings} peringatan.`);
process.exit(errors ? 1 : 0);
