#!/usr/bin/env node
/**
 * Periksa ISI semua config video (yang tidak tertangkap typecheck).
 *
 *   npm run cek                 # semua video
 *   npm run cek -- Harian       # ID yang mengandung "Harian" (atau path file)
 *
 * ✗ galat (exit 1): ID ganda/tidak valid, aset/musik tidak ada di public/, cue `at` tidak ada di narasi,
 *   scene bernarasi tanpa `voice`, scene data kosong (juga `selisih` tanpa angka, `tren` < 2 titik, `alur`
 *   tanpa simpul), timeline gagal dihitung.
 * ! peringatan: `highlight`/`emphasis` tidak ditemukan di teksnya, teks terlalu panjang (judul, label
 *   grafik/tabel/angka/langkah, selisih, garis tren, simpul & panah alur, pembanding, catatan), narasi belum dirender / waktu kata basi, scene tanpa narasi di
 *   video bernarasi, terlalu banyak item, hook > ±3 dtk, dua scene bertipe sama berturut-turut,
 *   teks layar terlalu banyak untuk lama tampilnya.
 * Tata letak hasil render (terpotong, bertumpuk, zona UI, huruf kecil) → `npm run pratinjau -- <ID>`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listConfigFiles, loadConfigFile, resolveTargets } from './lib/configs.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const files = args.length ? await resolveTargets(args) : listConfigFiles();

const LIMIT = {
  title: 70,
  subtitle: 110,
  itemTitle: 34,
  itemDescription: 60,
  items: 4,
  statementLine: 28,
  // Label data (huruf): lebih dari ini akan terbungkus/mengecil di layar ponsel.
  chartLabel: 22,
  tableCell: 16,
  tableColumn: 14,
  statLabel: 40,
  calcLabel: 30,
  note: 40,
  // Visualisasi data (Fase 2).
  selisihLabel: 22,
  trenLabel: 18,
  trenTitik: 12,
  alurWords: 4,
  alurText: 28,
  alurPanah: 14,
  pembanding: 32,
  // Hook: detik maksimal sebelum masuk isi (narasi hook / durasi scene pertama).
  hookSec: 3.5,
  // Kata layar per detik tampil (judul + isi) yang masih nyaman dibaca sambil mendengar narasi.
  readWps: 4,
};
// Tipe yang memang dirangkai bersambung (template bedah3D) — boleh berturut-turut.
const CONTINUOUS = new Set(['world', 'irisan', 'words', 'statement', 'question']);
/** Teks yang tampil di layar sebuah scene (untuk perkiraan waktu baca). */
function screenText(s) {
  const parts = [s.eyebrow, s.title, s.subtitle];
  for (const f of s.features ?? []) parts.push(f.title, f.description);
  for (const x of s.stats ?? []) parts.push(x.label, x.pembanding);
  if (s.type === 'selisih') parts.push(s.a?.label, s.b?.label, s.selisihLabel ?? 'Selisih');
  for (const sr of s.type === 'tren' ? s.seri ?? [] : []) parts.push(sr.label);
  for (const n of s.type === 'alur' ? [...(s.simpul ?? []), ...(s.cabang ? [s.cabang] : [])] : []) parts.push(n.text, n.panah);
  if (['selisih', 'tren', 'alur', 'stats'].includes(s.type)) parts.push(s.note);
  for (const d of s.data ?? []) parts.push(d.label);
  for (const r of s.rows ?? []) parts.push(r.label, ...(r.values ?? []).filter((v) => typeof v === 'string'));
  for (const st of s.steps ?? []) parts.push(st.title, st.description);
  for (const l of s.lines ?? []) parts.push(l.label ?? l.text);
  if (Array.isArray(s.columns)) parts.push(...s.columns);
  return parts.filter((p) => typeof p === 'string').join(' ');
}
const countWords = (t) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
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
  const { configs, narrationKey, splitWords, computeTimeline, jsonPath } = await loadConfigFile(file);
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
        else if (clip.words?.length !== splitWords(s.narration).length || !(clip.duration > 0)) {
          warn.push(`${at(i, s)}: waktu kata narasi tidak cocok dengan teksnya → npm run narasi -- ${config.id} --retime`);
        }
      } else if (narrated) {
        warn.push(`${at(i, s)}: tanpa narasi di video bernarasi (akan hening)`);
      }

      // Isi scene data tidak boleh kosong.
      const content = { features: s.features, stats: s.stats, chart: s.data, comparison: s.rows, timeline: s.steps, calculation: s.lines, statement: s.lines }[s.type];
      if (Array.isArray(content) && content.length === 0) err.push(`${at(i, s)}: isi kosong`);
      if (s.type === 'words' && !(typeof s.words === 'string' ? s.words.trim() : s.words?.length)) err.push(`${at(i, s)}: isi kosong`);
      if (s.type === 'selisih' && !(Number.isFinite(s.a?.value) && Number.isFinite(s.b?.value))) err.push(`${at(i, s)}: \`a\` dan \`b\` harus berisi angka`);
      if (s.type === 'tren') {
        if (!s.seri?.length) err.push(`${at(i, s)}: isi kosong (\`seri\`)`);
        for (const sr of s.seri ?? []) if (!(sr.titik?.length >= 2)) err.push(`${at(i, s)}: seri "${sr.label}" butuh ≥ 2 titik data (tanpa titik rekaan)`);
        if ((s.seri?.length ?? 0) > 3) warn.push(`${at(i, s)}: ${s.seri.length} garis (maks 3 — sisanya tidak digambar)`);
      }
      if (s.type === 'alur') {
        if (!s.simpul?.length) err.push(`${at(i, s)}: isi kosong (\`simpul\`)`);
        else if (s.simpul.length < 2 || s.simpul.length > 4) warn.push(`${at(i, s)}: ${s.simpul.length} simpul (2–4; lebih dari 4 tidak digambar)`);
      }

      // Label data yang terlalu panjang untuk layar ponsel.
      const long = (label, text, max) => {
        if (typeof text === 'string' && text.length > max) warn.push(`${at(i, s)}: ${label} "${text}" ${text.length} huruf (maks ±${max})`);
      };
      for (const d of s.type === 'chart' ? s.data : []) long('label grafik', d.label, LIMIT.chartLabel);
      if (s.type === 'comparison') {
        for (const c of s.columns) long('kolom tabel', c, LIMIT.tableColumn);
        for (const r of s.rows) [r.label, ...r.values].forEach((v) => long('sel tabel', v, LIMIT.tableCell));
      }
      for (const x of s.stats ?? []) long('label angka', x.label, LIMIT.statLabel);
      for (const st of s.steps ?? []) long('judul langkah', st.title, LIMIT.itemTitle);
      for (const l of s.type === 'calculation' ? s.lines : []) long('label kalkulasi', l.label, LIMIT.calcLabel);
      long('catatan', s.note, LIMIT.note);
      for (const x of s.stats ?? []) long('pembanding', x.pembanding, LIMIT.pembanding);
      if (s.type === 'selisih') {
        long('label selisih', s.a?.label, LIMIT.selisihLabel);
        long('label selisih', s.b?.label, LIMIT.selisihLabel);
        long('label selisih', s.selisihLabel, LIMIT.selisihLabel);
      }
      for (const sr of s.type === 'tren' ? s.seri ?? [] : []) {
        long('label garis', sr.label, LIMIT.trenLabel);
        for (const p of sr.titik ?? []) long('label titik', p.label, LIMIT.trenTitik);
      }
      for (const n of s.type === 'alur' ? [...(s.simpul ?? []), ...(s.cabang ? [s.cabang] : [])] : []) {
        long('simpul', n.text, LIMIT.alurText);
        if (countWords(n.text ?? '') > LIMIT.alurWords) warn.push(`${at(i, s)}: simpul "${n.text}" > ${LIMIT.alurWords} kata`);
        long('label panah', n.panah, LIMIT.alurPanah);
      }

      // Ritme: dua scene bertipe sama berturut-turut terasa seperti slide yang diulang.
      const prev = config.scenes[i - 1];
      if (prev && prev.type === s.type && !CONTINUOUS.has(s.type)) {
        warn.push(`${at(i, s)}: tipe sama dengan scene sebelumnya — ganti komposisi (docs/PROMPT-STORYBOARD.md → Komposisi)`);
      }
    });
    if (missing) warn.push(`${missing} klip narasi belum dirender → npm run narasi -- ${config.id}`);

    // Durasi nyata (mengikuti audio bila sudah dirender): hook & waktu baca.
    let tl = null;
    try {
      tl = computeTimeline({ ...config, narration: config.narration ?? data });
    } catch (e) {
      err.push(`timeline gagal dihitung: ${e.message}`);
    }
    if (tl && !missing) {
      // Hook bernarasi: penonton memutuskan lanjut/geser saat kalimat pertama masih diucapkan.
      const first = config.scenes[0];
      const hookSec = first.narration ? data.clips?.[narrationKey(first.narration, config.voice)]?.duration ?? 0 : 0;
      if (hookSec > LIMIT.hookSec) {
        warn.push(`scene 1 (hook): ${hookSec.toFixed(1)} dtk — hook ideal ≤ ${LIMIT.hookSec - 0.5} dtk (perpendek kalimat pembuka)`);
      }
      config.scenes.forEach((s, i) => {
        const secs = tl.entries[i].frames / tl.fps;
        const n = countWords(screenText(s));
        if (n && n / secs > LIMIT.readWps) {
          warn.push(`${at(i, s)}: ${n} kata di layar dalam ${secs.toFixed(1)} dtk — terlalu padat untuk dibaca (kurangi teks atau perpanjang)`);
        }
      });
    }

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
