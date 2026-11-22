/**
 * EDGE TTS — suara "Read Aloud" Microsoft Edge, gratis, tanpa key.
 *
 * ⚠ INTEGRASI TIDAK RESMI. Layanan ini bukan API publik: Microsoft dapat mengubah
 * protokol, membatasi (throttle/blokir IP), atau mematikannya kapan saja tanpa
 * pemberitahuan. Pakai untuk percobaan/konten harian; untuk produksi yang harus
 * pasti jalan, siapkan Azure (`TTS_PROVIDER=azure` atau `TTS_FALLBACK=azure`).
 *
 * Protokolnya (token Sec-MS-GEC, versi Chromium, dll.) sering berubah, jadi
 * TIDAK diimplementasikan ulang di sini: skrip memanggil CLI `edge-tts`
 * (paket Python kecil, https://github.com/rany2/edge-tts). Bila tiba-tiba gagal
 * dengan 403/"Invalid Request", biasanya cukup: `pip install -U edge-tts`.
 *
 * Pasang:   pip install edge-tts          (GitHub Actions: otomatis di workflow)
 * Env:      EDGE_TTS_VOICE  — paksa suara, mis. id-ID-GadisNeural (default: dari voice.name)
 *           EDGE_TTS_BIN    — path CLI kustom (default: `edge-tts`, lalu `python3 -m edge_tts`)
 * Suara Indonesia yang tersedia: id-ID-ArdiNeural (pria), id-ID-GadisNeural (wanita).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** "id-ID-Ardi:DragonHDLatestNeural" (Azure) → "id-ID-ArdiNeural" (Edge). */
export function edgeVoiceFor(voice) {
  if (process.env.EDGE_TTS_VOICE) return process.env.EDGE_TTS_VOICE;
  const base = voice.name.split(':')[0].replace(/Neural$/, '');
  return `${base}Neural`;
}

/** edge-tts mewajibkan tanda: "10%" → "+10%". */
export function edgeRate(rate) {
  const r = String(rate ?? '0%').trim() || '0%';
  return /^[+-]/.test(r) ? r : `+${r}`;
}

let cmd;
/** → ['edge-tts'] / ['python3', '-m', 'edge_tts'] / null bila tidak terpasang. */
export function edgeCommand() {
  if (cmd !== undefined) return cmd;
  const candidates = process.env.EDGE_TTS_BIN
    ? [[process.env.EDGE_TTS_BIN]]
    : [['edge-tts'], ['python3', '-m', 'edge_tts'], ['python', '-m', 'edge_tts']];
  cmd = candidates.find(([bin, ...pre]) => spawnSync(bin, [...pre, '--help'], { encoding: 'utf8' }).status === 0) ?? null;
  return cmd;
}

/** Ringkas stderr Python (traceback panjang) jadi satu sebab + saran. */
function explain(stderr) {
  const lines = stderr.trim().split('\n').filter(Boolean);
  const last = lines.at(-1) ?? 'tanpa keterangan';
  const s = stderr;
  if (/403|Invalid Request|WSServerHandshakeError/i.test(s))
    return `${last}\n    → Layanan Edge menolak permintaan. Protokol tidak resmi kemungkinan berubah: jalankan \`pip install -U edge-tts\`.`;
  if (/NoAudioReceived/i.test(s))
    return `${last}\n    → Tidak ada audio. Periksa nama suara (EDGE_TTS_VOICE, mis. id-ID-ArdiNeural) dan teks narasinya.`;
  if (/429|Too Many|throttl/i.test(s)) return `${last}\n    → Dibatasi (rate limit). Tunggu beberapa menit atau perbesar EDGE_TTS_GAP_MS.`;
  if (/DNS|Cannot connect|ClientConnector|Timeout|timed out/i.test(s))
    return `${last}\n    → Tidak bisa menjangkau speech.platform.bing.com (jaringan/proxy/allowlist host).`;
  return last;
}

/** Sintesis satu klip → Buffer MP3. Melempar Error berpesan jelas bila gagal. */
export function synthesizeEdgeOnce(text, voice) {
  const c = edgeCommand();
  if (!c) {
    throw new Error(
      'CLI `edge-tts` tidak ditemukan. Pasang dengan `pip install edge-tts` (atau set EDGE_TTS_BIN), atau pakai TTS_PROVIDER=azure.',
    );
  }
  const dir = mkdtempSync(join(tmpdir(), 'edge-tts-'));
  const out = join(dir, 'clip.mp3');
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const [bin, ...pre] = c;
  try {
    const r = spawnSync(
      bin,
      [
        ...pre,
        '--voice',
        edgeVoiceFor(voice),
        `--rate=${edgeRate(voice.rate)}`,
        `--text=${text}`,
        '--write-media',
        out,
        ...(proxy ? ['--proxy', proxy] : []),
      ],
      { encoding: 'utf8', timeout: 90_000 },
    );
    if (r.error) throw new Error(`edge-tts tidak bisa dijalankan: ${r.error.message}`);
    if (r.status !== 0) throw new Error(explain(r.stderr || r.stdout || ''));
    const buf = readFileSync(out);
    if (buf.length < 500) throw new Error('Audio kosong dari Edge TTS.');
    return buf;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
