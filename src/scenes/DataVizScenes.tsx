import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { GradientText, Icon } from '../components';
import { WorldStampView } from '../components/world/Hud';
import { DATAVIZ_TIMING, EASINGS, SFX_TIMING } from '../config';
import { Reveal, Sfx, formatNumber, formatValue, useCountUp, useCue, useItemTimes } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { CONTENT_DELAY, SceneLayout, SceneTitle } from './SceneLayout';
import type { AlurScene, AlurSimpul, SceneHeading, SelisihScene, StatsScene, TrenScene } from './types';

/*
 * Visualisasi data 2D: `selisih` (dua nilai), `tren` (garis dari titik data), `alur` (sebab-akibat),
 * dan angka hero `stats` 1 item. SVG/DOM saja — ringan, tanpa WebGL. Semua waktu dari frame (deterministik).
 */

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Progres 0..1 dari `start` selama `dur` detik (ease). Murni — aman dipanggil dalam loop. */
const progress = (t: number, start: number, dur: number, easing = EASINGS.emphasized) =>
  interpolate(t, [start, start + Math.max(0.01, dur)], [0, 1], { ...clamp, easing });

/** Token warna tema (`danger`, `primary`, …) atau warna apa adanya. */
function useColor() {
  const { theme } = useTheme();
  const c = theme.colors;
  return (v: string | undefined, fallback: string) => (v ? (v in c ? (c[v as keyof typeof c] as string) : v) : fallback);
}

/** Teks gelap/terang di atas warna latar `hex` (#rgb / #rrggbb); selain hex → putih. */
function onColor(hex: string): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#ffffff';
  const h = m[1].length === 3 ? m[1].replace(/./g, (x) => x + x) : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? '#111111' : '#ffffff';
}

/** "−", "+" atau "" untuk angka bertanda (minus tipografis). */
const sign = (v: number) => (v < 0 ? '−' : v > 0 ? '+' : '');

/** Apakah perubahan `diff` (b − a) buruk menurut `arah`. */
const isBad = (diff: number, arah: 'turun-buruk' | 'naik-buruk' = 'turun-buruk') => (arah === 'naik-buruk' ? diff > 0 : diff < 0);

/** Perkiraan tinggi judul standar (px) — untuk membagi sisa tinggi area aman ke grafik. */
function useHeadingHeight(h: SceneHeading): number {
  const { type, space, px } = useTheme();
  let n = 0;
  if (h.eyebrow) n += px(60) + space.sm;
  if (h.title) n += type.h2 * 1.2 * (h.title.length > 24 ? 2 : 1) + space.sm;
  if (h.subtitle) n += type.body * 1.45 * (h.subtitle.length > 40 ? 2 : 1) + space.sm;
  return n ? n + space.lg : 0;
}

/** Catatan sumber kecil (gaya catatan `irisan`), satu baris di bawah konten. */
const DataNote: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const { theme, type, px, small, mobile } = useTheme();
  return (
    <Reveal delay={delay} preset="fadeIn">
      <div
        style={{
          padding: `${px(8)}px ${px(20)}px`,
          borderRadius: px(8),
          background: theme.colors.surface,
          border: `${px(2)}px solid ${theme.colors.border}`,
          color: theme.colors.muted,
          fontFamily: theme.fonts.mono,
          fontSize: small(type.label * 0.75),
          letterSpacing: mobile ? '0.02em' : '0.12em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </Reveal>
  );
};

/* ============================================================
 * SELISIH — dua batang proporsional + celah yang disorot.
 * ============================================================ */

export const SelisihSceneView: React.FC<SceneProps<SelisihScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { theme, type, px, safe, isPortrait } = useTheme();
  const cue = useCue();
  const c = theme.colors;
  const t = frame / fps;
  const T = DATAVIZ_TIMING;
  const head = useHeadingHeight(scene);

  const label = scene.selisihLabel ?? 'Selisih';
  const times = useItemTimes(
    [
      { at: scene.a.at, text: scene.a.label },
      { at: scene.b.at, text: scene.b.label },
    ],
    (i) => CONTENT_DELAY + 0.1 + i * T.barGap,
  );
  const ta = times?.[0] ?? CONTENT_DELAY + 0.1;
  const tb = Math.max(times?.[1] ?? ta + T.barGap, ta + 0.15);
  const tg = scene.selisihAt !== undefined ? cue(scene.selisihAt, tb + T.gapAfter) : tb + T.gapAfter;

  const a = Math.max(0, scene.a.value);
  const b = Math.max(0, scene.b.value);
  const diff = scene.b.value - scene.a.value;
  const pct = scene.a.value !== 0 ? (diff / scene.a.value) * 100 : null;
  const tone = diff === 0 ? c.muted : isBad(diff, scene.arah) ? c.danger : c.success;
  const fmt = { prefix: scene.prefix, suffix: scene.suffix, decimals: scene.decimals };
  const withSign = scene.tanda !== false;

  // Ukuran: grafik mengisi sisa tinggi area aman setelah judul, baris hasil, dan catatan.
  const Wc = Math.min(W - safe.x * 2, px(isPortrait ? 880 : 1100));
  const avail = H - safe.top - safe.bottom;
  const resultH = px(isPortrait ? 110 : 100);
  const noteH = scene.note ? px(60) : 0;
  // Di bawah garis dasar: label + nilai (menghitung) tiap batang — ruang di atas batang hanya untuk celah.
  const labelH = px(isPortrait ? 130 : 110);
  const Hc = Math.max(px(300), Math.min(px(isPortrait ? 720 : 520), avail - head - resultH - noteH - labelH - px(60)));
  const plotH = Hc - px(16);
  const max = Math.max(a, b, 1e-9);
  const barW = Wc * 0.32;
  const cols = [Wc * 0.12, Wc * 0.56];
  const pA = progress(t, ta, T.grow);
  const pB = progress(t, tb, T.grow);
  const hA = (plotH * a) / max;
  const hB = (plotH * b) / max;
  const bars = [
    { v: scene.a.value, h: hA, p: pA, x: cols[0], fill: c.primary, opacity: 1, label: scene.a.label },
    { v: scene.b.value, h: hB, p: pB, x: cols[1], fill: c.primary, opacity: 0.6, label: scene.b.label },
  ];
  const gapP = progress(t, tg, T.reveal);
  const small = hA <= hB ? 0 : 1;
  const big = 1 - small;
  const gapTop = Hc - Math.max(hA, hB);
  const gapH = Math.abs(hA - hB);
  const midX = (cols[0] + barW + cols[1]) / 2;

  const diffNow = useCountUp(Math.abs(diff), { delay: tg });
  const diffText = `${withSign ? sign(diff) : ''}${formatValue(diffNow, fmt)}`;
  const pctText = pct === null ? null : `${withSign ? sign(pct) : ''}${formatNumber(Math.abs(pct), scene.persenDecimals ?? 2)}%`;

  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} />
      <Reveal delay={CONTENT_DELAY - 0.2} preset="fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(24) }}>
        <div style={{ position: 'relative', width: Wc, height: Hc + labelH }}>
          {/* Garis dasar (nol). */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: Hc - px(2), height: px(4), borderRadius: px(2), background: c.border }} />
          {bars.map((bar, i) => {
            const h = bar.h * bar.p;
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    position: 'absolute',
                    left: bar.x,
                    width: barW,
                    top: Hc - h,
                    height: h,
                    borderRadius: `${px(18)}px ${px(18)}px ${px(4)}px ${px(4)}px`,
                    background: bar.fill,
                    opacity: bar.opacity,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: bar.x + barW / 2 - Wc * 0.22,
                    width: Wc * 0.44,
                    top: Hc + px(14),
                    opacity: interpolate(t, [i ? tb : ta, (i ? tb : ta) + 0.3], [0, 1], clamp),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: px(4),
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: theme.fonts.body, fontWeight: theme.fontWeights.strong, fontSize: type.body, lineHeight: 1.15, color: c.muted }}>
                    {bar.label}
                  </div>
                  <div
                    style={{
                      fontFamily: theme.fonts.heading,
                      fontWeight: theme.fontWeights.heading,
                      fontSize: type.subtitle,
                      color: c.text,
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatValue(bar.v * bar.p, fmt)}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          {/* Celah: bagian yang hilang/bertambah di batang yang lebih pendek + garis acuan dari batang tinggi. */}
          {gapH > 0.5 ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: bars[small].x,
                  width: barW,
                  top: gapTop,
                  height: gapH,
                  transformOrigin: 'bottom',
                  transform: `scaleY(${gapP})`,
                  borderRadius: `${px(14)}px ${px(14)}px 0 0`,
                  border: `${px(3)}px dashed ${tone}`,
                  background: `repeating-linear-gradient(45deg, ${tone} 0 ${px(9)}px, transparent ${px(9)}px ${px(18)}px)`,
                  opacity: 0.9 * Math.min(1, gapP * 2),
                }}
              />
              <svg width={Wc} height={Hc} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
                <line
                  x1={bars[big].x + (big === 0 ? barW : 0)}
                  x2={bars[big].x + (big === 0 ? barW : 0) + (big === 0 ? 1 : -1) * (cols[1] - cols[0]) * gapP}
                  y1={gapTop}
                  y2={gapTop}
                  stroke={tone}
                  strokeWidth={px(4)}
                  strokeDasharray={`${px(12)} ${px(10)}`}
                />
                {gapH > px(28) ? (
                  <g opacity={gapP} stroke={tone} strokeWidth={px(5)} strokeLinecap="round">
                    <line x1={midX} x2={midX} y1={gapTop + px(4)} y2={gapTop + gapH * gapP - px(4)} />
                    <line x1={midX - px(14)} x2={midX + px(14)} y1={gapTop + px(4)} y2={gapTop + px(4)} />
                    <line x1={midX - px(14)} x2={midX + px(14)} y1={gapTop + gapH * gapP - px(4)} y2={gapTop + gapH * gapP - px(4)} />
                  </g>
                ) : null}
              </svg>
            </>
          ) : null}
        </div>
        {/* Baris hasil: label · selisih (menghitung) · persen. */}
        <Reveal delay={tg} idle style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: px(22), minHeight: resultH }}>
          <span style={{ fontFamily: theme.fonts.body, fontWeight: theme.fontWeights.strong, fontSize: type.body, color: c.muted }}>{label}</span>
          <span
            style={{
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.heading,
              fontSize: type.h3,
              color: tone,
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {diffText}
          </span>
          {pctText && scene.persen !== false ? (
            <span
              style={{
                padding: `${px(8)}px ${px(20)}px`,
                borderRadius: px(theme.radius.pill),
                background: tone,
                color: onColor(tone),
                fontFamily: theme.fonts.heading,
                fontWeight: theme.fontWeights.heading,
                fontSize: type.body,
                whiteSpace: 'nowrap',
              }}
            >
              {pctText}
            </span>
          ) : null}
        </Reveal>
        {scene.note ? <DataNote text={scene.note} delay={CONTENT_DELAY + 0.3} /> : null}
      </Reveal>
      <Sfx name="pop" at={ta} seed={1} />
      <Sfx name="pop" at={tb} seed={2} />
      <Sfx name="ting" at={tg + SFX_TIMING.counterDone} />
    </SceneLayout>
  );
};

/* ============================================================
 * TREN — garis dari titik data yang diberikan saja.
 * ============================================================ */

const SERIES_TOKENS = ['primary', 'danger', 'accent'] as const;

export const TrenSceneView: React.FC<SceneProps<TrenScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { theme, type, px, safe, small, isPortrait } = useTheme();
  const cue = useCue();
  const color = useColor();
  const c = theme.colors;
  const t = frame / fps;
  const T = DATAVIZ_TIMING;
  const head = useHeadingHeight(scene);
  const persen = scene.skala === 'persen';
  const seri = scene.seri.filter((s) => s.titik.length >= 1).slice(0, 3);

  const times = useItemTimes(
    seri.map((s) => ({ at: s.at, text: s.label })),
    (i) => CONTENT_DELAY + 0.2 + i * T.seriesGap,
  );
  const starts = seri.map((_, i) => times?.[i] ?? CONTENT_DELAY + 0.2 + i * T.seriesGap);

  // Ukuran & domain.
  const Wc = Math.min(W - safe.x * 2, px(isPortrait ? 940 : 1500));
  const avail = H - safe.top - safe.bottom;
  const noteH = scene.note ? px(60) : 0;
  const Hc = Math.max(px(340), Math.min(px(isPortrait ? 760 : 560), avail - head - noteH - px(40)));
  const pad = { l: persen ? px(84) : px(30), r: px(30), t: px(80), b: px(70) };
  const plotW = Wc - pad.l - pad.r;
  const plotH = Hc - pad.t - pad.b;
  const series = seri.map((s, si) => {
    const first = s.titik[0].value;
    const vals = s.titik.map((p) => (persen ? (first !== 0 ? (p.value / first - 1) * 100 : 0) : p.value));
    return {
      s,
      si,
      vals,
      xs: s.titik.map((p, i) => p.x ?? i),
      col: color(s.warna, color(SERIES_TOKENS[si % SERIES_TOKENS.length], c.primary)),
      fmt: persen ? { suffix: '%', decimals: s.decimals ?? scene.decimals ?? 2 } : { prefix: s.prefix ?? scene.prefix, suffix: s.suffix ?? scene.suffix, decimals: s.decimals ?? scene.decimals },
    };
  });
  const allX = series.flatMap((s) => s.xs);
  const allV = series.flatMap((s) => s.vals).concat(persen ? [0] : []);
  const x0 = Math.min(...allX);
  const x1 = Math.max(...allX);
  let lo = Math.min(...allV);
  let hi = Math.max(...allV);
  const span = hi - lo || Math.abs(hi) || 1;
  lo -= span * 0.12;
  hi += span * 0.12;
  const X = (x: number) => pad.l + (x1 === x0 ? plotW / 2 : ((x - x0) / (x1 - x0)) * plotW);
  const Y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * plotH;

  const lines = series.map((sr, k) => {
    const pts = sr.vals.map((v, i) => ({ x: X(sr.xs[i]), y: Y(v) }));
    const segs = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
    const total = segs.reduce((m, n) => m + n, 0) || 1;
    const at = [0];
    segs.forEach((d) => at.push(at[at.length - 1] + d / total));
    const p = progress(t, starts[k], T.draw, EASINGS.standard);
    const last = sr.vals[sr.vals.length - 1];
    const change = sr.vals.length > 1 ? (persen ? last : sr.vals[0] !== 0 ? (last / sr.vals[0] - 1) * 100 : 0) : 0;
    return { ...sr, pts, at, p, end: pts[pts.length - 1], last, change, done: starts[k] + T.draw };
  });

  // Anotasi titik akhir: di bawah untuk garis turun, di atas untuk garis naik; tidak saling menimpa.
  const pillH = small(type.label * 0.92) * 1.25 + px(22);
  const notes = lines
    .map((l) => {
      const down = l.pts.length > 1 && l.end.y > l.pts[0].y + 1;
      return { l, y: down ? l.end.y + px(26) : l.end.y - px(26) - pillH };
    })
    .sort((m, n) => m.y - n.y);
  for (let i = 1; i < notes.length; i++) notes[i].y = Math.max(notes[i].y, notes[i - 1].y + pillH + px(10));
  for (const n of notes) n.y = Math.min(Math.max(n.y, 0), Hc - pad.b - pillH);

  // Label sumbu: x paling awal & akhir tiap seri (yang berlabel), tidak berdempetan.
  const ticks: { x: number; text: string }[] = [];
  for (const l of lines) {
    for (const i of [0, l.s.titik.length - 1]) {
      const text = l.s.titik[i].label;
      const x = X(l.xs[i]);
      if (text && !ticks.some((k) => Math.abs(k.x - x) < px(150))) ticks.push({ x, text });
    }
  }

  // Cap % perubahan: kotak cap diuji di kisi posisi; pilih yang paling sedikit menimpa anotasi, label sumbu, lalu garis.
  const capCfg = scene.cap === true ? {} : scene.cap;
  const capLine = capCfg ? lines[Math.min(lines.length - 1, Math.max(0, capCfg.seri ?? 0))] : undefined;
  const capTextRaw = capLine ? capCfg?.text ?? `${sign(capLine.change)}${formatNumber(Math.abs(capLine.change), 2)}%` : '';
  let capSize = Math.min(px(150), (Wc * 0.6) / Math.max(3, capTextRaw.length * 0.62));
  let capXY = { x: Wc / 2, y: pad.t + plotH * 0.7 };
  if (capLine) {
    type Box = { x0: number; y0: number; x1: number; y1: number };
    const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
    const pillW = (l: (typeof lines)[number]) => (l.s.label.length + 9) * small(type.label * 0.92) * 0.62 + px(44);
    const texts: Box[] = [
      ...notes.map(({ l, y }) => ({ x0: l.end.x + px(24) - pillW(l), y0: y, x1: l.end.x + px(24), y1: y + pillH })),
      ...ticks.map((k) => ({ x0: k.x - px(80), y0: Hc - pad.b, x1: k.x + px(80), y1: Hc })),
    ];
    const samples = lines.flatMap((l) =>
      l.pts.slice(1).flatMap((q, i) => Array.from({ length: 12 }, (_, k) => ({ x: l.pts[i].x + ((q.x - l.pts[i].x) * k) / 11, y: l.pts[i].y + ((q.y - l.pts[i].y) * k) / 11 }))),
    );
    // Kotak cap konservatif: huruf tebal ±0,68 em, garis tepi, kemiringan 4°, + margin.
    const fit = (size: number) => {
      const bw = capTextRaw.length * 0.68 * size + px(30);
      const bh = size * 1.15 + bw * 0.07 + px(24);
      let best = { score: Infinity, hit: Infinity, q: capXY };
      for (const fy of [0.2, 0.35, 0.5, 0.65, 0.8]) {
        for (const fx of [0.3, 0.4, 0.5, 0.6, 0.7]) {
          const q = { x: pad.l + plotW * fx, y: pad.t + plotH * fy };
          const box = { x0: q.x - bw / 2, y0: q.y - bh / 2, x1: q.x + bw / 2, y1: q.y + bh / 2 };
          const hit = texts.reduce((m, b) => m + overlap(box, b), 0) + Math.max(0, box.y1 - (Hc - pad.b)) * bw;
          const hitLine = samples.filter((p) => p.x > box.x0 && p.x < box.x1 && p.y > box.y0 && p.y < box.y1).length;
          const score = hit * 10 + hitLine * px(400) + Math.max(0, pad.t * 0.5 - box.y0) * px(200) + Math.abs(fx - 0.5) * px(50);
          if (score < best.score) best = { score, hit, q };
        }
      }
      return best;
    };
    // Tidak ada tempat bebas teks → cap dikecilkan bertahap (garis boleh tertimpa, teks tidak).
    for (const k of [1, 0.82, 0.66, 0.54]) {
      const r = fit(capSize * k);
      capXY = r.q;
      if (r.hit === 0) {
        capSize *= k;
        break;
      }
      if (k === 0.54) capSize *= k;
    }
  }
  const capStart = capLine ? (capCfg?.at !== undefined ? cue(capCfg.at, capLine.done + 0.2) : capLine.done + 0.2) : 0;
  const capText = capTextRaw;
  const capColor = capLine ? color(capCfg?.color, isBad(capLine.change, scene.arah) ? c.danger : c.success) : c.text;

  const lw = px(10);
  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} />
      <Reveal delay={CONTENT_DELAY - 0.2} preset="fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(20) }}>
        <div style={{ position: 'relative', width: Wc, height: Hc }}>
          <svg width={Wc} height={Hc} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {/* Garis bantu (tanpa angka sumbu — nilai ada di anotasi). */}
            {[0, 0.5, 1].map((f) => (
              <line key={f} x1={pad.l} x2={pad.l + plotW} y1={pad.t + plotH * f} y2={pad.t + plotH * f} stroke={c.border} strokeWidth={px(2)} opacity={f === 1 ? 0.9 : 0.5} />
            ))}
            {persen ? (
              <line x1={pad.l} x2={pad.l + plotW} y1={Y(0)} y2={Y(0)} stroke={c.muted} strokeWidth={px(3)} strokeDasharray={`${px(10)} ${px(10)}`} opacity={0.8} />
            ) : null}
            {lines.map((l, k) => (
              <g key={k}>
                {l.pts.length > 1 ? (
                  <path
                    d={l.pts.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join(' ')}
                    fill="none"
                    stroke={l.col}
                    strokeWidth={lw}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - l.p}
                    opacity={l.p > 0 ? 1 : 0}
                  />
                ) : null}
                {/* Titik data asli: muncul saat garis melewatinya. */}
                {l.pts.map((q, i) => {
                  const shown = interpolate(l.p, [l.at[i] - 0.001, Math.min(1, l.at[i] + 0.08)], [0, 1], clamp);
                  const end = i === l.pts.length - 1;
                  return shown > 0 ? (
                    <g key={i} opacity={shown}>
                      {end ? <circle cx={q.x} cy={q.y} r={px(30) * (0.6 + 0.4 * shown)} fill={l.col} opacity={0.22} /> : null}
                      <circle cx={q.x} cy={q.y} r={end ? px(17) : px(12)} fill={end ? l.col : c.background} stroke={l.col} strokeWidth={px(5)} />
                    </g>
                  ) : null;
                })}
              </g>
            ))}
          </svg>
          {persen ? (
            <div style={{ position: 'absolute', right: Wc - pad.l + px(22), top: Y(0), transform: 'translateY(-50%)', fontFamily: theme.fonts.mono, fontSize: small(type.label * 0.8), color: c.muted }}>
              0%
            </div>
          ) : null}
          {ticks.map((k, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: Math.min(Math.max(k.x, pad.l + px(60)), Wc - pad.r - px(60)),
                top: Hc - pad.b + px(18),
                transform: 'translateX(-50%)',
                fontFamily: theme.fonts.body,
                fontWeight: theme.fontWeights.strong,
                fontSize: type.label,
                color: c.muted,
                whiteSpace: 'nowrap',
              }}
            >
              {k.text}
            </div>
          ))}
          {notes.map(({ l, y }, i) => {
            const p = progress(t, l.done - 0.15, 0.35);
            if (p <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  right: Math.max(0, Wc - l.end.x - px(24)),
                  top: y,
                  height: pillH,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${px(20)}px`,
                  borderRadius: theme.radius.pill,
                  background: l.col,
                  color: onColor(l.col),
                  opacity: p,
                  transform: `scale(${0.7 + 0.3 * p})`,
                  transformOrigin: 'right center',
                  fontFamily: theme.fonts.heading,
                  fontWeight: theme.fontWeights.heading,
                  fontSize: small(type.label * 0.92),
                  whiteSpace: 'nowrap',
                }}
              >
                {l.s.label} · {persen ? sign(l.last) : l.last < 0 ? '−' : ''}
                {formatValue(Math.abs(l.last), l.fmt)}
              </div>
            );
          })}
          {capLine ? (
            <WorldStampView
              stamp={{ text: capText, color: capColor, rotate: -4, target: 'cap' }}
              exit={0}
              project={() => capXY}
              color={(v) => v}
              W={Wc}
              H={Hc}
              start={capStart}
              size={capSize}
            />
          ) : null}
        </div>
        {scene.note ? <DataNote text={scene.note} delay={CONTENT_DELAY + 0.3} /> : null}
      </Reveal>
      {lines.map((_, k) => (
        <Sfx key={k} name="swipe" at={starts[k]} seed={k} />
      ))}
      {lines.map((l, k) => (
        <Sfx key={`e${k}`} name="pop" at={l.done - 0.15} seed={k + 3} />
      ))}
      {capLine ? <Sfx name="impact" at={capStart} /> : null}
    </SceneLayout>
  );
};

/* ============================================================
 * ALUR — sebab-akibat 2–4 simpul, satu cabang opsional.
 * ============================================================ */

interface NodeBox {
  n: AlurSimpul;
  x: number;
  y: number;
  w: number;
  h: number;
  from: number | null;
}

export const AlurSceneView: React.FC<SceneProps<AlurScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { theme, type, px, safe, small, isPortrait } = useTheme();
  const color = useColor();
  const c = theme.colors;
  const t = frame / fps;
  const T = DATAVIZ_TIMING;
  const head = useHeadingHeight(scene);
  const chain = scene.simpul.slice(0, 4);
  const branch = scene.cabang && chain.length ? scene.cabang : undefined;
  const from = branch ? Math.min(chain.length - 1, Math.max(0, branch.dari ?? 0)) : 0;
  const all = branch ? [...chain, branch] : chain;

  const times = useItemTimes(
    all.map((n) => ({ at: n.at, text: n.text })),
    (i) => CONTENT_DELAY + 0.1 + i * T.nodeGap,
  );
  const show = all.map((_, i) => times?.[i] ?? CONTENT_DELAY + 0.1 + i * T.nodeGap);

  // Baris (portrait) / kolom (landscape): simpul i di langkah i; cabang di langkah dari+1, berdampingan.
  const branchStep = from + 1;
  const steps = Math.max(chain.length, branch ? branchStep + 1 : 0);
  const pairStep = branch && branchStep < chain.length ? branchStep : -1;
  const avail = H - safe.top - safe.bottom;
  const noteH = scene.note ? px(60) : 0;
  const boxes: NodeBox[] = [];
  let Wc: number;
  let Hc: number;
  if (isPortrait) {
    Wc = Math.min(W - safe.x * 2, px(900));
    const room = Math.max(px(400), avail - head - noteH - px(30));
    let gap = px(84);
    let nh = Math.min(px(150), (room - (steps - 1) * gap) / steps);
    if (nh < px(112)) {
      gap = px(64);
      nh = Math.max(px(104), (room - (steps - 1) * gap) / steps);
    }
    const single = Math.min(Wc, px(760));
    const half = (Wc - px(36)) / 2;
    for (let s = 0; s < steps; s++) {
      const y = s * (nh + gap);
      const pair = s === pairStep;
      if (s < chain.length) boxes.push({ n: chain[s], x: pair ? 0 : (Wc - single) / 2, y, w: pair ? half : single, h: nh, from: s ? s - 1 : null });
      if (branch && s === branchStep) boxes.push({ n: branch, x: pair ? Wc - half : (Wc - single) / 2, y, w: pair ? half : single, h: nh, from });
    }
    Hc = steps * nh + (steps - 1) * gap;
  } else {
    Wc = Math.min(W - safe.x * 2, px(1640));
    const gap = px(110);
    const nw = Math.min(px(420), (Wc - (steps - 1) * gap) / steps);
    const nh = px(170);
    const pairH = px(150);
    Hc = pairStep >= 0 ? pairH * 2 + px(40) : nh;
    const x0 = (Wc - (steps * nw + (steps - 1) * gap)) / 2;
    for (let s = 0; s < steps; s++) {
      const x = x0 + s * (nw + gap);
      const pair = s === pairStep;
      const yMid = (Hc - nh) / 2;
      if (s < chain.length) boxes.push({ n: chain[s], x, y: pair ? 0 : yMid, w: nw, h: pair ? pairH : nh, from: s ? s - 1 : null });
      if (branch && s === branchStep) boxes.push({ n: branch, x, y: pair ? Hc - pairH : yMid, w: nw, h: pair ? pairH : nh, from });
    }
  }
  // Urutan `boxes` mengikuti langkah; waktu muncul mengikuti urutan `all` (rantai lalu cabang).
  const timeOf = (box: NodeBox) => show[all.indexOf(box.n)];
  const iconSize = isPortrait ? 64 : 60;

  const arrows = boxes
    .filter((bx) => bx.from !== null)
    .map((bx) => {
      const src = boxes.find((o) => o.n === chain[bx.from as number])!;
      const a = isPortrait ? { x: src.x + src.w / 2, y: src.y + src.h + px(10) } : { x: src.x + src.w + px(10), y: src.y + src.h / 2 };
      const b = isPortrait ? { x: bx.x + bx.w / 2, y: bx.y - px(12) } : { x: bx.x - px(12), y: bx.y + bx.h / 2 };
      const end = timeOf(bx);
      const start = Math.max(timeOf(src) + 0.25, end - T.arrowLead);
      return { bx, a, b, start, p: progress(t, start, T.arrow, EASINGS.standard) };
    });

  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(28) }}>
        <div style={{ position: 'relative', width: Wc, height: Hc }}>
          <Reveal delay={CONTENT_DELAY} preset="fadeIn" style={{ position: 'absolute', inset: 0 }}>
            <svg width={Wc} height={Hc} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              {arrows.map(({ a, b, p }, i) => {
                if (p <= 0) return null;
                const tip = { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
                const ang = Math.atan2(b.y - a.y, b.x - a.x);
                const s = px(20);
                const head = [
                  [tip.x, tip.y],
                  [tip.x - s * Math.cos(ang - 0.5), tip.y - s * Math.sin(ang - 0.5)],
                  [tip.x - s * Math.cos(ang + 0.5), tip.y - s * Math.sin(ang + 0.5)],
                ];
                return (
                  <g key={i} stroke={c.muted} fill={c.muted}>
                    <line x1={a.x} y1={a.y} x2={tip.x - px(6) * Math.cos(ang)} y2={tip.y - px(6) * Math.sin(ang)} strokeWidth={px(5)} strokeLinecap="round" />
                    <polygon points={head.map((q) => q.join(',')).join(' ')} strokeWidth={px(2)} strokeLinejoin="round" />
                  </g>
                );
              })}
            </svg>
            {arrows.map(({ bx, a, b, p }, i) => {
              if (!bx.n.panah || p < 0.6) return null;
              const q = interpolate(p, [0.6, 1], [0, 1], clamp);
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
              // Label di sisi luar panah: kanan untuk panah lurus/ke kanan, kiri untuk panah ke kiri.
              const left = isPortrait ? b.x < a.x - 1 : false;
              const style: React.CSSProperties = isPortrait
                ? { left: left ? undefined : mid.x + px(22), right: left ? Wc - mid.x + px(22) : undefined, top: mid.y, transform: 'translateY(-50%)' }
                : { left: mid.x, top: mid.y - px(18), transform: 'translate(-50%, -100%)' };
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    ...style,
                    opacity: q,
                    padding: `${px(6)}px ${px(16)}px`,
                    borderRadius: theme.radius.pill,
                    background: c.background,
                    border: `${px(2)}px solid ${c.border}`,
                    color: c.muted,
                    fontFamily: theme.fonts.body,
                    fontWeight: theme.fontWeights.strong,
                    fontSize: small(type.label * 0.9),
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bx.n.panah}
                </div>
              );
            })}
          </Reveal>
          {boxes.map((bx, i) => {
            const col = color(bx.n.warna, c.primary);
            return (
              <Reveal
                key={i}
                delay={timeOf(bx)}
                idle
                preset="pop"
                style={{ position: 'absolute', left: bx.x, top: bx.y, width: bx.w, height: bx.h }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    gap: px(20),
                    padding: `0 ${px(26)}px`,
                    borderRadius: px(theme.radius.md),
                    background: c.surface,
                    border: `${px(3)}px solid ${col}`,
                    boxShadow: theme.shadow.card,
                  }}
                >
                  {bx.n.icon ? <Icon src={bx.n.icon} size={iconSize} /> : null}
                  <div
                    style={{
                      flex: 1,
                      fontFamily: theme.fonts.heading,
                      fontWeight: theme.fontWeights.heading,
                      fontSize: type.subtitle,
                      lineHeight: 1.12,
                      color: c.text,
                      textAlign: bx.n.icon ? 'left' : 'center',
                    }}
                  >
                    {bx.n.text}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        {scene.note ? <DataNote text={scene.note} delay={CONTENT_DELAY + 0.3} /> : null}
      </div>
      {arrows.map(({ start }, i) => (
        <Sfx key={i} name="swipe" at={start} seed={i} volume={0.6} />
      ))}
    </SceneLayout>
  );
};

/* ============================================================
 * STATS 1 item — angka hero layar penuh + konteks.
 * ============================================================ */

export const StatHeroView: React.FC<{ scene: StatsScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width: W } = useVideoConfig();
  const { theme, type, px, safe, space } = useTheme();
  const stat = scene.stats[0];
  const times = useItemTimes([{ at: stat.at, text: stat.label }], () => CONTENT_DELAY);
  const delay = times?.[0] ?? CONTENT_DELAY;
  const current = useCountUp(stat.value, { delay });
  const fmt = { prefix: stat.prefix, suffix: stat.suffix, decimals: stat.decimals };
  const final = formatValue(stat.value, fmt);
  // Ukuran angka: sebesar mungkin tanpa keluar area aman (±0,6 em per karakter).
  const size = Math.min(px(280), (W - safe.x * 2) * 0.9 / Math.max(3, final.length * 0.68));
  const line = progress(frame / fps, delay + 0.3, DATAVIZ_TIMING.heroLine);
  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} />
      <Reveal delay={delay} idle style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.sm }}>
        <div
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: theme.fontWeights.heading,
            fontSize: size,
            letterSpacing: `${theme.headingTracking}em`,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            fontVariantNumeric: theme.tabularNumbers ? 'tabular-nums' : undefined,
          }}
        >
          <GradientText>{formatValue(current, fmt)}</GradientText>
        </div>
        <div style={{ width: px(260) * line, height: px(8), borderRadius: px(4), background: theme.gradient }} />
      </Reveal>
      <Sfx name="ting" at={delay + SFX_TIMING.counterDone} />
      <Reveal delay={delay + 0.35}>
        <div
          style={{
            maxWidth: px(900),
            fontFamily: theme.fonts.body,
            fontWeight: theme.fontWeights.strong,
            fontSize: type.subtitle,
            lineHeight: 1.25,
            color: theme.colors.text,
            textAlign: 'center',
          }}
        >
          {stat.label}
        </div>
      </Reveal>
      {stat.pembanding ? (
        <Reveal delay={delay + 0.8} preset="pop" idle>
          <div
            style={{
              padding: `${px(12)}px ${px(28)}px`,
              borderRadius: px(theme.radius.pill),
              background: theme.colors.surface,
              border: `${px(2)}px solid ${theme.colors.border}`,
              fontFamily: theme.fonts.body,
              fontWeight: theme.fontWeights.strong,
              fontSize: type.body,
              color: theme.colors.muted,
              whiteSpace: 'nowrap',
            }}
          >
            {stat.pembanding}
          </div>
        </Reveal>
      ) : null}
      {scene.note ? <DataNote text={scene.note} delay={delay + 0.3} /> : null}
    </SceneLayout>
  );
};

export { DataNote };
