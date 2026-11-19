/**
 * Sintesis musik latar → public/music/*.wav
 *
 * Semua trek dibuat dari nol (tanpa sampel/lisensi pihak ketiga), deterministik,
 * mono 22,05 kHz 16-bit, dan LOOP MULUS: setiap nota ditulis melingkar (ekor nota di
 * akhir file menyambung ke awal). Panjang trek harus sama dengan `MUSIC_TRACKS` di
 * `src/config/music.ts`. Jalankan ulang bila ingin mengubah karakter musik:
 *   node scripts/build-music.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const SR = 22050;
const OUT = path.resolve('public/music');

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

/** Nomor nota MIDI → Hz. */
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** Trek = buffer melingkar; `add` menulis suara mulai `at` detik dan membungkus di ujung. */
function track(sec) {
  const buf = new Float32Array(Math.round(sec * SR));
  return {
    buf,
    sec,
    add(at, len, fn) {
      const n = Math.round(len * SR);
      const start = Math.round(at * SR);
      for (let i = 0; i < n; i++) buf[(((start + i) % buf.length) + buf.length) % buf.length] += fn(i / SR, i);
    },
  };
}

/** Pad: beberapa harmonik sinus, dua lapis sedikit sumbang, masuk & lepas pelan. */
function pad(tr, at, len, midi, amp, bright = 0.5) {
  const f = hz(midi);
  const attack = Math.min(0.9, len * 0.3);
  const release = 1.2;
  tr.add(at, len + release, (t) => {
    const e = t < attack ? Math.sin(((t / attack) * Math.PI) / 2) : t > len ? Math.pow(1 - (t - len) / release, 2) : 1;
    let v = 0;
    for (let h = 1; h <= 5; h++) {
      const a = Math.pow(bright, h - 1) / h;
      v += a * (Math.sin(2 * Math.PI * f * h * t) + Math.sin(2 * Math.PI * f * 1.004 * h * t + h));
    }
    return v * 0.5 * e * amp * (1 + 0.08 * Math.sin(2 * Math.PI * 0.35 * t));
  });
}

/** Pluck: nada lembut meluruh (mirip piano elektrik / marimba). `decay` kecil = redam. */
function pluck(tr, at, midi, amp, decay = 0.5) {
  const f = hz(midi);
  tr.add(at, Math.min(decay * 6, 3.5), (t) => {
    const a = t < 0.004 ? t / 0.004 : 1;
    return (
      a *
      amp *
      (Math.sin(2 * Math.PI * f * t) * Math.exp(-t / decay) +
        0.35 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t / (decay * 0.45)) +
        0.12 * Math.sin(2 * Math.PI * 4 * f * t) * Math.exp(-t / (decay * 0.2)))
    );
  });
}

/** Pluck + dua gema yang makin pelan. */
function echoPluck(tr, at, midi, amp, decay, delay) {
  pluck(tr, at, midi, amp, decay);
  pluck(tr, at + delay, midi, amp * 0.35, decay * 0.9);
  pluck(tr, at + delay * 2, midi, amp * 0.14, decay * 0.8);
}

function bass(tr, at, midi, amp, decay = 0.35) {
  const f = hz(midi);
  tr.add(at, decay * 5, (t) => {
    const a = t < 0.006 ? t / 0.006 : 1;
    return a * amp * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t / 0.08)) * Math.exp(-t / decay);
  });
}

function kick(tr, at, amp) {
  let ph = 0;
  tr.add(at, 0.3, (t) => {
    ph += (2 * Math.PI * (46 + 90 * Math.exp(-t / 0.03))) / SR;
    return amp * Math.sin(ph) * Math.exp(-t / 0.09) * (t < 0.002 ? t / 0.002 : 1);
  });
}

/** Hi-hat/shaker: noise yang di-highpass sederhana (selisih antar sampel). */
function hat(tr, at, amp, decay, r) {
  let prev = 0;
  tr.add(at, decay * 6, (t) => {
    const n = r() * 2 - 1;
    const v = n - prev;
    prev = n;
    return amp * v * 0.5 * Math.exp(-t / decay) * (t < 0.002 ? t / 0.002 : 1);
  });
}

/** Tepuk lembut: noise pita tengah. */
function clap(tr, at, amp, r) {
  let lp = 0;
  let prev = 0;
  tr.add(at, 0.22, (t) => {
    const n = r() * 2 - 1;
    lp += 0.35 * (n - lp);
    const v = lp - prev * 0.6;
    prev = lp;
    return amp * v * Math.exp(-t / 0.05);
  });
}

function finish(name, tr, peak = 0.7) {
  const a = tr.buf;
  // Lowpass satu kutub dua arah putaran (hangat, tetap mulus di titik loop).
  let lp = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < a.length; i++) {
      lp += 0.55 * (a[i] - lp);
      if (pass === 1) a[i] = lp;
    }
  }
  let m = 0;
  for (const v of a) m = Math.max(m, Math.abs(v));
  const k = m > 0 ? peak / m : 1;
  const pcm = Buffer.alloc(a.length * 2);
  for (let i = 0; i < a.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, a[i] * k)) * 32767), i * 2);
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
  console.log(`✓ music/${name}.wav  ${tr.sec.toFixed(1)} dtk  ${(pcm.length / 1024).toFixed(0)} KB`);
}

/** TENANG — 60 bpm, 4 birama (16 dtk). Pad hangat + arpeggio pelan. Cmaj7 · Am7 · Fmaj7 · G6. */
function tenang() {
  const tr = track(16);
  const beat = 1;
  const chords = [
    { root: 36, notes: [60, 64, 67, 71] },
    { root: 33, notes: [57, 60, 64, 67] },
    { root: 29, notes: [53, 57, 60, 64] },
    { root: 31, notes: [55, 59, 62, 64] },
  ];
  const order = [0, 2, 1, 3, 2, 1, 3, 2];
  chords.forEach((c, bar) => {
    const t0 = bar * 4 * beat;
    c.notes.forEach((n) => pad(tr, t0, 4 * beat, n, 0.11, 0.42));
    pad(tr, t0, 4 * beat, c.root + 12, 0.16, 0.3);
    bass(tr, t0, c.root, 0.5, 0.9);
    order.forEach((k, i) => echoPluck(tr, t0 + i * 0.5 * beat, c.notes[k] + 12, i % 4 === 0 ? 0.2 : 0.14, 0.6, 0.75 * beat));
  });
  finish('tenang', tr);
}

/** SEMANGAT — 120 bpm, 8 birama (16 dtk). Ketukan ringan + bass + pluck sinkop. F · G · Am · C. */
function semangat() {
  const tr = track(16);
  const r = rng(7);
  const beat = 0.5;
  const chords = [
    { root: 41, notes: [65, 69, 72] },
    { root: 43, notes: [67, 71, 74] },
    { root: 45, notes: [69, 72, 76] },
    { root: 48, notes: [67, 72, 76] },
  ];
  // Posisi dalam birama (satuan 1/8) → indeks nota akor.
  const riff = [
    [0, 0],
    [1.5, 1],
    [3, 2],
    [4, 1],
    [5.5, 2],
    [7, 0],
  ];
  for (let bar = 0; bar < 8; bar++) {
    const c = chords[bar % 4];
    const t0 = bar * 4 * beat;
    c.notes.forEach((n) => pad(tr, t0, 4 * beat, n - 12, 0.07, 0.5));
    for (let b = 0; b < 4; b++) {
      kick(tr, t0 + b * beat, 0.55);
      hat(tr, t0 + (b + 0.5) * beat, 0.16, 0.03, r);
      if (b % 2 === 1) clap(tr, t0 + b * beat, 0.22, r);
    }
    for (let e = 0; e < 8; e++) bass(tr, t0 + e * 0.5 * beat, e === 6 ? c.root + 7 : c.root, e % 2 ? 0.3 : 0.42, 0.16);
    riff.forEach(([pos, k], i) => {
      const oct = bar >= 4 && i % 3 === 2 ? 12 : 0;
      echoPluck(tr, t0 + pos * 0.5 * beat, c.notes[k] + oct, 0.2, 0.28, 0.75 * beat);
    });
  }
  finish('semangat', tr);
}

/** KORPORAT — 100 bpm, 8 birama (19,2 dtk). Petikan redam per 1/8 + pad + ketukan halus. D · A · Bm · G. */
function korporat() {
  const tr = track(19.2);
  const r = rng(19);
  const beat = 0.6;
  const chords = [
    { root: 38, notes: [62, 66, 69] },
    { root: 33, notes: [61, 64, 69] },
    { root: 35, notes: [62, 66, 71] },
    { root: 31, notes: [62, 67, 71] },
  ];
  const pattern = [0, 0, 2, 0, 1, 0, 2, 1];
  for (let bar = 0; bar < 8; bar++) {
    const c = chords[bar % 4];
    const t0 = bar * 4 * beat;
    c.notes.forEach((n) => pad(tr, t0, 4 * beat, n, 0.075, 0.45));
    bass(tr, t0, c.root, 0.46, 0.5);
    bass(tr, t0 + 2.5 * beat, c.root, 0.3, 0.3);
    kick(tr, t0, 0.42);
    kick(tr, t0 + 2 * beat, 0.34);
    pattern.forEach((k, e) => {
      pluck(tr, t0 + e * 0.5 * beat, c.notes[k] - 12, e % 2 ? 0.15 : 0.2, 0.11);
      hat(tr, t0 + e * 0.5 * beat, e % 2 ? 0.1 : 0.05, 0.02, r);
    });
    if (bar >= 4) echoPluck(tr, t0 + 2 * beat, c.notes[1] + 12, 0.13, 0.7, 0.75 * beat);
    else echoPluck(tr, t0, c.notes[2] + 12, 0.11, 0.7, 0.75 * beat);
  }
  finish('korporat', tr);
}

/** Piano lembut: parsial sedikit tak-harmonik, meluruh pelan, attack palu halus. */
function piano(tr, at, midi, amp, decay = 1.8) {
  const f = hz(midi);
  tr.add(at, decay * 3.2, (t) => {
    const a = t < 0.004 ? t / 0.004 : 1;
    let v = 0;
    for (let h = 1; h <= 6; h++) {
      const fh = f * h * Math.sqrt(1 + 0.0004 * h * h);
      v += (Math.sin(2 * Math.PI * fh * t) / Math.pow(h, 1.5)) * Math.exp(-t / (decay / Math.pow(h, 0.7)));
    }
    return a * amp * v;
  });
}

/** Oud: Karplus-Strong (derau dalam saluran tunda) — petikan hangat bersenar ganda. */
function oud(tr, at, midi, amp, sec = 1.6, seed = 1) {
  const r = rng(seed);
  const strings = [hz(midi), hz(midi) * 1.003];
  const lines = strings.map((f) => {
    const n = Math.max(2, Math.round(SR / f));
    const buf = new Float32Array(n);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      lp += 0.5 * (r() * 2 - 1 - lp);
      buf[i] = lp;
    }
    return { buf, n, i: 0 };
  });
  tr.add(at, sec, (t) => {
    let v = 0;
    for (const L of lines) {
      const a = L.buf[L.i % L.n];
      const b = L.buf[(L.i + 1) % L.n];
      const y = 0.5 * (a + b) * 0.996;
      L.buf[L.i % L.n] = y;
      L.i++;
      v += y;
    }
    const fade = t > sec - 0.3 ? (sec - t) / 0.3 : 1;
    return v * amp * fade;
  });
}

/**
 * KHIDMAT — 66,7 bpm, 8 birama (28,8 dtk). Piano lembut + string + petikan oud bernuansa Hijaz.
 * Dm(add9) · B♭maj7 · Gm7 · A7 — haru, hangat, tidak dramatis berlebihan.
 */
function khidmat() {
  const tr = track(28.8);
  const beat = 0.9;
  const chords = [
    { root: 38, notes: [62, 65, 69, 76], arp: [62, 69, 74, 76, 77, 76, 74, 69] },
    { root: 34, notes: [62, 65, 69, 70], arp: [58, 65, 69, 74, 72, 69, 65, 62] },
    { root: 31, notes: [62, 65, 67, 70], arp: [55, 62, 65, 70, 69, 67, 65, 62] },
    { root: 33, notes: [61, 64, 67, 69], arp: [57, 64, 67, 73, 72, 69, 67, 64] },
  ];
  // Frasa oud (Hijaz di D: D E♭ F♯ G A B♭ C) — muncul di birama genap.
  const oudPhrases = [
    [[0, 69], [0.5, 70], [1, 69], [1.5, 67], [2, 66], [3, 67]],
    [[0, 74], [0.33, 75], [0.66, 74], [1.25, 72], [2, 70], [2.5, 69], [3, 69]],
  ];
  for (let bar = 0; bar < 8; bar++) {
    const c = chords[bar % 4];
    const t0 = bar * 4 * beat;
    c.notes.forEach((n) => pad(tr, t0, 4 * beat, n - 12, 0.075, 0.35));
    pad(tr, t0, 4 * beat, c.root, 0.13, 0.25);
    pad(tr, t0, 4 * beat, c.root + 12, 0.05, 0.3);
    piano(tr, t0, c.root + 12, 0.22, 2.4);
    c.arp.forEach((n, i) => {
      if (bar < 2 && i % 2) return;
      piano(tr, t0 + i * 0.5 * beat, n + 12, i === 0 ? 0.2 : 0.13, 1.6);
    });
    if (bar % 2 === 1) {
      oudPhrases[(bar >> 1) % 2].forEach(([b, n], k) => oud(tr, t0 + b * beat, n - 12, k === 0 ? 0.32 : 0.26, 1.4, bar * 10 + k));
    }
  }
  finish('khidmat', tr, 0.65);
}

fs.mkdirSync(OUT, { recursive: true });
tenang();
semangat();
korporat();
khidmat();
