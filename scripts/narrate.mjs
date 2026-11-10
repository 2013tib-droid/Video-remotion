#!/usr/bin/env node
/**
 * Render narasi (voice-over) video jadi MP3 + waktu tiap kata (Azure Speech).
 *
 *   npm run narasi -- src/projects/soal-skd/bedah-analogi.ts
 *   npm run narasi -- Harian-TipsGaji          # atau cukup ID video (boleh sebagian)
 *   npm run narasi -- <config.ts> --dry-run     # lihat apa yang akan dirender
 *   npm run narasi -- <config.ts> --redo        # render ulang semua klip
 *   npm run narasi -- <config.ts> --retime      # hitung ulang waktu kata saja (tanpa Azure)
 *
 * Yang dibaca dari config: `id`, `voice` ({ name, rate, lexicon }) dan
 * `scene.narration` setiap scene. Hasil:
 *   - public/narration/<id>/<kunci>.mp3        (satu klip per scene)
 *   - <config>.narration.json                  (otomatis dipasang registry ke `narration`)
 * Klip yang teksnya tidak berubah dilewati (kunci = hash teks + suara).
 *
 * KREDENSIAL: AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (default southeastasia),
 * dari env atau file .env. Di sesi cloud Claude, key disuntikkan proxy:
 * isi AZURE_SPEECH_KEY=proxy-injected.
 *
 * WAKTU PER KATA: REST API Azure hanya mengirim audio. Waktu kata dihitung
 * dari audio: jeda (hening) dideteksi, dicocokkan dengan tanda baca naskah,
 * lalu kata di antara jeda dibagi menurut jumlah suku kata (akurasi ±0,1–0,2 dtk).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfigFile, resolveTargets } from './lib/configs.mjs';

// fetch bawaan Node baru memakai HTTPS_PROXY bila NODE_USE_ENV_PROXY=1.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const targets = args.filter((a) => !a.startsWith('--'));
if (!targets.length) {
  console.error('Pakai: npm run narasi -- <path config.ts | ID video> [--dry-run] [--redo]');
  process.exit(1);
}

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const KEY = process.env.AZURE_SPEECH_KEY ?? '';
const REGION = process.env.AZURE_SPEECH_REGION || 'southeastasia';
/** Jeda antar permintaan: tier gratis F0 = 20 permintaan/menit. */
const GAP_MS = Number(process.env.AZURE_TTS_GAP_MS ?? 3200);

/* ---------- Azure ---------- */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function applyLexicon(text, lexicon = {}) {
  let out = text;
  for (const [word, spoken] of Object.entries(lexicon)) {
    out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${word}(?![\\p{L}\\p{N}])`, 'giu'), spoken);
  }
  return out;
}

async function synthesize(text, voice) {
  const lang = voice.name.slice(0, 5);
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">` +
    `<voice name="${voice.name}"><prosody rate="${voice.rate ?? '0%'}">${esc(applyLexicon(text, voice.lexicon))}</prosody></voice></speak>`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'motion-studio-narasi',
      },
      body: ssml,
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) throw new Error('Audio kosong dari Azure.');
      return buf;
    }
    if (res.status === 429 && attempt < 4) {
      await sleep(15000 * attempt);
      continue;
    }
    throw new Error(`Azure ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Analisis audio ---------- */

function decodeToSamples(mp3Path) {
  const wav = mp3Path.replace(/\.mp3$/, '.tmp.wav');
  const r = spawnSync('npx', ['remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-i', mp3Path, '-ac', '1', '-c:a', 'pcm_s16le', wav], {
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`ffmpeg gagal: ${r.stderr}`);
  const buf = readFileSync(wav);
  rmSync(wav, { force: true });
  // Cari chunk "fmt " dan "data".
  let off = 12;
  let rate = 24000;
  let data = null;
  while (off < buf.length - 8) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') rate = buf.readUInt32LE(off + 12);
    if (id === 'data') {
      data = buf.subarray(off + 8, off + 8 + size);
      break;
    }
    off += 8 + size + (size % 2);
  }
  if (!data) throw new Error('WAV tanpa data.');
  const samples = new Float32Array(data.length / 2);
  for (let i = 0; i < samples.length; i++) samples[i] = data.readInt16LE(i * 2) / 32768;
  return { samples, rate };
}

/**
 * Bobot kata ≈ jumlah suku kata yang DIUCAPKAN (setelah lexicon): tiap vokal
 * satu suku kata, kecuali diftong ai/au/oi di akhir suku kata; angka per digit.
 */
function weight(spoken) {
  const w = spoken.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '');
  const vowels = (w.match(/[aiueoéè]/g) ?? []).length;
  const diphthongs = (w.match(/(ai|au|oi)(?![aiueo])/g) ?? []).length;
  const digits = (w.match(/\d/g) ?? []).length * 2;
  return Math.max(1, vowels - diphthongs + digits);
}

function wordTimings(words, samples, rate, lexicon) {
  const win = Math.round(rate * 0.01); // 10 ms
  const rms = [];
  for (let i = 0; i + win <= samples.length; i += win) {
    let s = 0;
    for (let k = i; k < i + win; k++) s += samples[k] * samples[k];
    rms.push(Math.sqrt(s / win));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const peak = sorted[Math.floor(sorted.length * 0.98)] || 1e-6;
  const floor = sorted[Math.floor(sorted.length * 0.1)] || 0;
  const thr = Math.max(floor * 3, peak * 0.07);
  const speech = rms.map((v) => v > thr);
  const first = speech.indexOf(true);
  const last = speech.lastIndexOf(true);
  const duration = samples.length / rate;
  if (first < 0) return { duration, words: words.map((w) => ({ w, start: 0, end: 0 })) };
  const t0 = first * 0.01;
  const t1 = (last + 1) * 0.01;

  // Jeda ≥ 90 ms di dalam ucapan.
  const pauses = [];
  for (let i = first; i <= last; ) {
    if (!speech[i]) {
      let j = i;
      while (j <= last && !speech[j]) j++;
      if ((j - i) * 0.01 >= 0.09) pauses.push({ start: i * 0.01, end: j * 0.01 });
      i = j;
    } else i++;
  }

  const wts = words.map((w) => weight(applyLexicon(w, lexicon)));
  const out = new Array(words.length);

  /**
   * Isi waktu kata i0..i1 di rentang ucapan [ta, tb]. Batas kalimat (. ? !)
   * dicocokkan ke jeda lebih dulu, lalu batas klausa (, ; :) di dalam tiap
   * kalimat; kata di antara dua jeda terpilih dibagi menurut bobot.
   */
  const LEVELS = [
    { re: /[.?!]$/, minPause: 0.15 },
    { re: /[,;:]$/, minPause: 0.09 },
  ];
  function fill(i0, i1, ta, tb, level) {
    for (let L = level; L < LEVELS.length; L++) {
      const { re, minPause } = LEVELS[L];
      const bounds = [];
      for (let k = i0; k < i1; k++) if (re.test(words[k])) bounds.push(k);
      if (!bounds.length) continue;
      const cands = pauses.filter((p) => p.start > ta && p.end < tb && p.end - p.start >= minPause);
      const sum = wts.slice(i0, i1 + 1).reduce((x, y) => x + y, 0);
      const anchors = [];
      let last = -1;
      for (const k of bounds) {
        const acc = wts.slice(i0, k + 1).reduce((x, y) => x + y, 0);
        const expected = ta + (acc / sum) * (tb - ta);
        let best = -1;
        let bestD = Infinity;
        cands.forEach((p, c) => {
          if (c <= last) return;
          const d = Math.abs((p.start + p.end) / 2 - expected);
          if (d < bestD) [best, bestD] = [c, d];
        });
        if (best >= 0 && bestD < 0.8) {
          anchors.push({ k, p: cands[best] });
          last = best;
        }
      }
      if (!anchors.length) continue;
      let s0 = i0;
      let t = ta;
      for (const { k, p } of anchors) {
        fill(s0, k, t, p.start, L + 1);
        s0 = k + 1;
        t = p.end;
      }
      fill(s0, i1, t, tb, L + 1);
      return;
    }
    const sum = wts.slice(i0, i1 + 1).reduce((x, y) => x + y, 0);
    let t = ta;
    for (let k = i0; k <= i1; k++) {
      const d = (wts[k] / sum) * (tb - ta);
      out[k] = { w: words[k], start: +t.toFixed(3), end: +(t + d).toFixed(3) };
      t += d;
    }
  }
  fill(0, words.length - 1, t0, t1, 0);
  return { duration: +duration.toFixed(3), words: out };
}

/* ---------- Utama ---------- */

let requests = 0;
const files = await resolveTargets(targets);
if (!files.length) {
  console.error(`Tidak ada config yang cocok dengan: ${targets.join(', ')}`);
  process.exit(1);
}
for (const file of files) {
  const { configs, narrationKey, splitWords, jsonPath } = await loadConfigFile(file);
  const config = configs[0];
  if (!config?.voice) {
    console.error(`${file}: config tidak punya \`voice\` (tidak ada scene bernarasi) — lewati.`);
    continue;
  }
  if (!existsSync(jsonPath)) writeFileSync(jsonPath, '{\n  "clips": {}\n}\n');
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const outDir = join('public', 'narration', config.id);
  mkdirSync(outDir, { recursive: true });
  const wanted = new Set();
  const scenes = config.scenes.filter((s) => s.narration);
  console.log(`\n${config.id}: ${scenes.length} klip narasi, suara ${config.voice.name} ${config.voice.rate ?? ''}`);

  for (const [i, scene] of scenes.entries()) {
    const text = scene.narration.trim();
    const key = narrationKey(text, config.voice);
    wanted.add(key);
    const mp3 = join(outDir, `${key}.mp3`);
    const label = `[${i + 1}/${scenes.length}] ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}`;
    if (has('retime') && existsSync(mp3)) {
      const { samples, rate } = decodeToSamples(mp3);
      data.clips[key] = { src: `narration/${config.id}/${key}.mp3`, ...wordTimings(splitWords(text), samples, rate, config.voice.lexicon) };
      console.log(`  ~ ${label} (waktu kata dihitung ulang)`);
      continue;
    }
    if (!has('redo') && data.clips[key] && existsSync(mp3)) {
      console.log(`  = ${label}`);
      continue;
    }
    if (has('dry-run')) {
      console.log(`  + ${label}`);
      continue;
    }
    if (!KEY) {
      console.error('AZURE_SPEECH_KEY belum diisi (lihat komentar di atas skrip).');
      process.exit(1);
    }
    if (requests++) await sleep(GAP_MS);
    writeFileSync(mp3, await synthesize(text, config.voice));
    const { samples, rate } = decodeToSamples(mp3);
    const timing = wordTimings(splitWords(text), samples, rate, config.voice.lexicon);
    data.clips[key] = { src: `narration/${config.id}/${key}.mp3`, ...timing };
    console.log(`  ✓ ${label} (${timing.duration.toFixed(1)} dtk)`);
  }

  if (!has('dry-run')) {
    for (const key of Object.keys(data.clips)) if (!wanted.has(key)) delete data.clips[key];
    for (const f of readdirSync(outDir)) if (f.endsWith('.mp3') && !wanted.has(f.replace(/\.mp3$/, ''))) rmSync(join(outDir, f));
    writeFileSync(jsonPath, JSON.stringify(data, null, 1) + '\n');
    const total = Object.values(data.clips).reduce((a, c) => a + c.duration, 0);
    console.log(`  → ${jsonPath} (${total.toFixed(1)} dtk suara)`);
  }
}
