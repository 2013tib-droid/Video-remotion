/**
 * Sintesis efek suara (SFX) → public/sfx/*.wav
 *
 * Semua suara dibuat dari nol (tanpa sampel berlisensi), deterministik (PRNG ber-seed),
 * mono 44,1 kHz 16-bit. Jalankan ulang bila ingin mengubah karakter suara:
 *   node scripts/build-sfx.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const OUT = path.resolve('public/sfx');

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Filter state-variable (bandpass/lowpass/highpass) dengan frekuensi per sampel. */
function svf(input, freqAt, q, mode = 'band') {
  const out = new Float32Array(input.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < input.length; i++) {
    const f = 2 * Math.sin((Math.PI * Math.min(freqAt(i / SR), SR / 6)) / SR);
    const high = input[i] - low - band / q;
    band += f * high;
    low += f * band;
    out[i] = mode === 'band' ? band : mode === 'low' ? low : high;
  }
  return out;
}

function noise(sec, seed) {
  const r = rng(seed);
  const a = new Float32Array(Math.round(sec * SR));
  for (let i = 0; i < a.length; i++) a[i] = r() * 2 - 1;
  return a;
}

/** Envelope attack/decay eksponensial. */
const env = (t, attack, decay) => (t < attack ? Math.sin(((t / attack) * Math.PI) / 2) : Math.exp(-(t - attack) / decay));

function normalize(a, peak = 0.8) {
  let m = 0;
  for (const v of a) m = Math.max(m, Math.abs(v));
  const k = m > 0 ? peak / m : 1;
  // Fade-out 5 ms di ujung agar tidak "klik".
  const fade = Math.round(0.005 * SR);
  return a.map((v, i) => v * k * Math.min(1, (a.length - 1 - i) / fade));
}

function wav(name, data) {
  const pcm = Buffer.alloc(data.length * 2);
  data.forEach((v, i) => pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(path.join(OUT, `${name}.wav`), Buffer.concat([h, pcm]));
  console.log(`✓ sfx/${name}.wav  ${(data.length / SR).toFixed(2)} dtk`);
}

/** Whoosh: noise lewat bandpass yang menyapu naik lalu turun (benda lewat cepat). */
function whoosh(sec, lo, hi, peakAt, seed, q = 1.6) {
  const n = noise(sec, seed);
  const sweep = (t) => {
    const u = t / sec;
    const k = u < peakAt ? Math.sin(((u / peakAt) * Math.PI) / 2) : Math.cos((((u - peakAt) / (1 - peakAt)) * Math.PI) / 2);
    return lo + (hi - lo) * k * k;
  };
  const a = svf(n, sweep, q);
  const b = svf(n, (t) => sweep(t) * 1.9, q * 1.4);
  return normalize(
    a.map((v, i) => {
      const t = i / SR;
      const u = t / sec;
      const e = u < peakAt ? Math.pow(u / peakAt, 1.6) : Math.pow(1 - (u - peakAt) / (1 - peakAt), 2.2);
      return (v + 0.45 * b[i]) * e;
    }),
    0.75,
  );
}

/** Pop: sinus dengan pitch turun cepat + transien kecil (gelembung/bubble). */
function pop(f0, seed) {
  const sec = 0.16;
  const n = noise(sec, seed);
  const click = svf(n, () => 3800, 0.9);
  let ph = 0;
  const a = new Float32Array(Math.round(sec * SR));
  for (let i = 0; i < a.length; i++) {
    const t = i / SR;
    const f = f0 * (0.55 + 0.45 * Math.exp(-t / 0.018)) * (1 + 0.6 * Math.exp(-t / 0.004));
    ph += (2 * Math.PI * f) / SR;
    a[i] = Math.sin(ph) * env(t, 0.002, 0.035) + 0.25 * click[i] * Math.exp(-t / 0.004);
  }
  return normalize(a, 0.7);
}

/** Ting: lonceng kecil (parsial tak-harmonik meluruh). */
function ting(f0, sec = 1.3) {
  const partials = [
    [1, 1, 0.5],
    [2.0, 0.42, 0.32],
    [2.76, 0.3, 0.2],
    [5.4, 0.16, 0.09],
    [8.93, 0.08, 0.05],
  ];
  const a = new Float32Array(Math.round(sec * SR));
  for (let i = 0; i < a.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const [r, amp, dec] of partials) v += amp * Math.sin(2 * Math.PI * f0 * r * t + r) * Math.exp(-t / dec);
    // Shimmer halus (tremolo pelan) agar terasa "berkilau".
    a[i] = v * (t < 0.003 ? t / 0.003 : 1) * (1 + 0.06 * Math.sin(2 * Math.PI * 6 * t));
  }
  return normalize(a, 0.72);
}

/** Tick: ketukan pendek untuk teks kata per kata (klik + dentum kecil). */
function tick(seed) {
  const sec = 0.12;
  const n = noise(sec, seed);
  const hp = svf(n, () => 5200, 1.2, 'band');
  let ph = 0;
  const a = new Float32Array(Math.round(sec * SR));
  for (let i = 0; i < a.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (180 * (0.6 + 0.4 * Math.exp(-t / 0.01)))) / SR;
    a[i] = 0.9 * hp[i] * Math.exp(-t / 0.006) + 0.7 * Math.sin(ph) * env(t, 0.001, 0.03);
  }
  return normalize(a, 0.7);
}

/** Impact: dentum rendah (pin jatuh, kata menghentak). */
function impact(seed) {
  const sec = 0.6;
  const n = noise(sec, seed);
  const body = svf(n, (t) => 900 * Math.exp(-t / 0.05) + 120, 0.8, 'low');
  let ph = 0;
  const a = new Float32Array(Math.round(sec * SR));
  for (let i = 0; i < a.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (48 + 70 * Math.exp(-t / 0.04))) / SR;
    a[i] = Math.sin(ph) * env(t, 0.003, 0.16) + 0.5 * body[i] * env(t, 0.001, 0.05);
  }
  return normalize(a, 0.8);
}

/** Riser pendek: noise menanjak (sebelum reveal besar / CTA). */
function riser(seed) {
  const sec = 1.0;
  const n = noise(sec, seed);
  const a = svf(n, (t) => 300 + 4200 * Math.pow(t / sec, 2), 2.2);
  return normalize(a.map((v, i) => v * Math.pow(i / a.length, 2.2)), 0.6);
}

/** Bip pemindai QR: dua nada sinus pendek bersih. */
function beep() {
  const sec = 0.32;
  const a = new Float32Array(Math.round(sec * SR));
  for (let i = 0; i < a.length; i++) {
    const t = i / SR;
    const f = t < 0.12 ? 1975.5 : 2637;
    const local = t < 0.12 ? t : t - 0.13;
    const e = t < 0.12 ? env(local, 0.004, 0.06) : t < 0.13 ? 0 : env(local, 0.004, 0.07);
    a[i] = Math.sin(2 * Math.PI * f * t) * e * 0.8 + 0.15 * Math.sin(4 * Math.PI * f * t) * e;
  }
  return normalize(a, 0.6);
}

/** Kicau burung pagi: sapuan nada FM pendek bergerombol (sintetis), di atas desir angin lembut. */
function burung(seed) {
  const sec = 6;
  const r = rng(seed);
  const a = new Float32Array(Math.round(sec * SR));
  const wind = svf(noise(sec, seed + 1), (t) => 380 + 120 * Math.sin(t * 0.7), 0.7, 'low');
  for (let i = 0; i < a.length; i++) a[i] = wind[i] * 0.05 * Math.min(1, i / SR / 0.8, (sec - i / SR) / 0.8);
  let at = 0.2;
  while (at < sec - 0.6) {
    const base = 2600 + r() * 1800;
    const notes = 2 + Math.floor(r() * 4);
    const len = 0.05 + r() * 0.07;
    const amp = 0.25 + r() * 0.35;
    for (let n = 0; n < notes; n++) {
      const t0 = at + n * (len + 0.03 + r() * 0.04);
      const up = r() > 0.5;
      const s0 = Math.round(t0 * SR);
      for (let k = 0; k < len * SR; k++) {
        const u = k / (len * SR);
        const f = base * (up ? 0.8 + 0.5 * u : 1.3 - 0.5 * u) * (1 + 0.04 * Math.sin(2 * Math.PI * 40 * k / SR));
        const ph = 2 * Math.PI * f * (k / SR);
        if (s0 + k < a.length) a[s0 + k] += Math.sin(ph) * Math.sin(Math.PI * u) * amp;
      }
    }
    at += 0.35 + r() * 0.9;
  }
  return normalize(a, 0.55);
}

/** Langkah kaki di jalan: ketukan lembut berselang (sandal di paving). */
function langkah(seed) {
  const sec = 4;
  const r = rng(seed);
  const a = new Float32Array(Math.round(sec * SR));
  for (let s = 0; s < 7; s++) {
    const t0 = 0.15 + s * 0.55 + r() * 0.05;
    const n = svf(noise(0.12, seed + s), () => 900 + r() * 300, 1.1);
    const s0 = Math.round(t0 * SR);
    for (let k = 0; k < n.length; k++) {
      const t = k / SR;
      if (s0 + k < a.length) a[s0 + k] += n[k] * env(t, 0.002, 0.03) * (s % 2 ? 0.8 : 1);
    }
  }
  return normalize(a, 0.5);
}

/** Lembar halaman dibalik: desir kertas. */
function halaman(seed) {
  const sec = 0.7;
  const n = noise(sec, seed);
  const a = svf(n, (t) => 1800 + 2600 * Math.sin((t / sec) * Math.PI), 0.9);
  return normalize(a.map((v, i) => {
    const t = i / SR;
    const e = Math.sin(Math.PI * Math.min(1, t / sec)) * (1 + 0.6 * Math.sin(t * 60));
    return v * Math.max(0, e);
  }), 0.5);
}

fs.mkdirSync(OUT, { recursive: true });
wav('whoosh', whoosh(0.6, 260, 2600, 0.42, 11));
wav('whoosh-soft', whoosh(0.5, 500, 3400, 0.5, 23, 1.2));
wav('swipe', whoosh(0.32, 900, 5200, 0.35, 37, 2));
wav('pop-1', pop(620, 41));
wav('pop-2', pop(740, 43));
wav('pop-3', pop(540, 47));
wav('ting', ting(1567.98));
wav('tick', tick(53));
wav('impact', impact(59));
wav('riser', riser(61));
wav('beep', beep());
wav('burung', burung(71));
wav('langkah', langkah(73));
wav('halaman', halaman(79));
