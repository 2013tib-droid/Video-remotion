import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { EASINGS, SPRINGS } from '../config';
import { WorldCardView, WorldMeterView, WorldPanelView, WorldReadoutView, WorldStampView } from '../components/world/Hud';
import { Sfx, useCue, useSceneExit, useSceneMotion } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneTitle } from './SceneLayout';
import type { Cue, IrisanBahan, IrisanMotion, IrisanPart, IrisanScene, Vec2 } from './types';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Angka gerak irisan (detik / satuan kanvas). */
export const IRISAN_TIMING = {
  tween: 0.8,
  hide: 0.3,
  /** Ayunan perbesaran pelan sepanjang scene (gerak lambat). */
  drift: 0.035,
  strokeWidth: 3,
} as const;

/** Warna + tekstur per bahan (gaya ilustrasi teknik: kalem, isi diaksir). */
export const IRISAN_BAHAN: Record<IrisanBahan, { fill: string; hatch: boolean | 'titik'; glow?: boolean; opacity?: number }> = {
  batu: { fill: '#bdb6aa', hatch: true },
  tanah: { fill: '#c9a37d', hatch: true },
  pasir: { fill: '#e9d6a3', hatch: 'titik' },
  magma: { fill: '#f0732b', hatch: false, glow: true },
  air: { fill: '#8fcfe8', hatch: false, opacity: 0.92 },
  logam: { fill: '#c8cdd3', hatch: false },
  beton: { fill: '#d9d4ca', hatch: true },
  abu: { fill: '#a9a49c', hatch: 'titik' },
  udara: { fill: '#f4f0e8', hatch: false },
  kayu: { fill: '#c99c66', hatch: true },
  karet: { fill: '#3b3f45', hatch: false },
  rumput: { fill: '#9cc77a', hatch: false },
};

const darken = (hex: string, k: number) => `#${new THREE.Color(hex).lerp(new THREE.Color('#1a1a1a'), k).getHexString()}`;
const mixColor = (a: string, b: string, p: number) => `#${new THREE.Color(a).lerp(new THREE.Color(b), p).getHexString()}`;

type CueFn = (at: Cue | undefined, fallback: number) => number;

interface PartState {
  dx: number;
  dy: number;
  turn: number;
  sx: number;
  sy: number;
  opacity: number;
  fill?: string;
}

/** Keadaan gerak sebuah bagian pada waktu `t`. Murni & deterministik. */
function evaluateMotion(motions: IrisanMotion[] | undefined, t: number, cue: CueFn, color: (c?: string) => string | undefined): PartState {
  const s: PartState = { dx: 0, dy: 0, turn: 0, sx: 1, sy: 1, opacity: 1 };
  const tweens = (motions ?? [])
    .filter((m): m is Extract<IrisanMotion, { at: Cue; to: unknown }> => 'to' in m)
    .map((m) => ({ m, start: cue(m.at, 0) }))
    .sort((a, b) => a.start - b.start);
  for (const { m, start } of tweens) {
    const p = EASINGS.emphasized(clamp01((t - start) / (m.duration ?? IRISAN_TIMING.tween)));
    if (p <= 0) continue;
    if (m.type === 'move') {
      s.dx += (m.to[0] - s.dx) * p;
      s.dy += (m.to[1] - s.dy) * p;
    } else if (m.type === 'turn') s.turn += (m.to - s.turn) * p;
    else if (m.type === 'scale') {
      const [tx, ty] = Array.isArray(m.to) ? m.to : [m.to, m.to];
      s.sx += (tx - s.sx) * p;
      s.sy += (ty - s.sy) * p;
    } else if (m.type === 'fade') s.opacity += (m.to - s.opacity) * p;
    else if (m.type === 'color') s.fill = s.fill ? mixColor(s.fill, color(m.to) ?? m.to, p) : (p >= 0.5 ? color(m.to) ?? m.to : undefined);
  }
  for (const m of motions ?? []) {
    if (m.type === 'spin') {
      const a = m.at === undefined ? -Infinity : cue(m.at, 0);
      const b = m.stopAt !== undefined ? cue(m.stopAt, Infinity) : Infinity;
      // Mulai/berhenti halus (0,4 dtk) — sudut = integral kecepatan.
      const ramp = (x: number) => (x <= 0 ? 0 : x < 0.4 ? (x * x) / 0.8 : x - 0.2);
      const run = (Number.isFinite(a) ? ramp(t - a) : t) - ramp(t - b);
      s.turn += run * (m.speed ?? 1) * 360;
    }
    if (m.type === 'bob') s.dy += Math.sin((t / (m.period ?? 2)) * Math.PI * 2) * (m.amount ?? 6);
    if (m.type === 'shake') {
      const a = cue(m.at, 0);
      const b = m.stopAt !== undefined ? cue(m.stopAt, Infinity) : Infinity;
      const on = clamp01((t - a) / 0.15) * (1 - clamp01((t - b) / 0.3));
      const amt = (m.amount ?? 8) * on;
      s.dx += Math.sin(t * 53) * Math.cos(t * 31) * amt;
      s.dy += Math.sin(t * 47 + 1.3) * amt * 0.6;
    }
  }
  return s;
}

/** Tengah bentuk (sebelum gerak). */
function centerOf(p: IrisanPart): Vec2 {
  switch (p.shape) {
    case 'rect':
      return [p.x + p.w / 2, p.y + p.h / 2];
    case 'circle':
    case 'ellipse':
      return [p.x, p.y];
    case 'wave':
      return [p.x + p.w / 2, p.y + p.h / 2];
    case 'poly':
    case 'flow': {
      const pts = p.shape === 'poly' ? p.points : p.path;
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    }
    case 'group': {
      const cs = p.children.map(centerOf);
      return cs.length ? [cs.reduce((a, c) => a + c[0], 0) / cs.length, cs.reduce((a, c) => a + c[1], 0) / cs.length] : [0, 0];
    }
    default:
      return [0, 0];
  }
}

/** Path SVG dari titik; `smooth` = lekuk Catmull-Rom. */
function polyPath(points: Vec2[], smooth?: boolean, closed = true): string {
  if (points.length < 2) return '';
  if (!smooth) return `M${points.map((q) => q.join(',')).join(' L')}${closed ? ' Z' : ''}`;
  const n = points.length;
  const at = (i: number) => (closed ? points[(i + n) % n] : points[Math.min(n - 1, Math.max(0, i))]);
  let d = `M${points[0][0]},${points[0][1]}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1: Vec2 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Vec2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return closed ? `${d} Z` : d;
}

/** Titik pada polyline di pecahan panjang u (0..1). */
function pointAt(path: Vec2[], u: number, closed?: boolean): Vec2 {
  const pts = closed ? [...path, path[0]] : path;
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  let d = u * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? clamp01(d / seg[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
}

/** Kumpulan pola aksir yang dipakai (satu per warna isi). */
type Patterns = Map<string, { id: string; fill: string; ink: string; kind: true | 'titik' }>;

interface DrawCtx {
  t: number;
  abs: number;
  cue: CueFn;
  color: (c?: string) => string | undefined;
  patterns: Patterns;
  /** Posisi (tengah + geser) tiap id → dipakai label. */
  anchors: Map<string, Vec2>;
  fps: number;
  frame: number;
}

const PartView: React.FC<{ part: IrisanPart; ctx: DrawCtx; offset: Vec2; k: string }> = ({ part, ctx, offset, k }) => {
  const { t, cue, color, patterns } = ctx;
  const st = evaluateMotion(part.motion, t, cue, color);
  // Muncul / hilang.
  let appear = 1;
  if (part.hidden && part.showAt === undefined) return null;
  if (part.showAt !== undefined) {
    const s = cue(part.showAt, 0);
    appear = t < s ? 0 : spring({ frame: ctx.frame - s * ctx.fps, fps: ctx.fps, config: SPRINGS.snappy });
  }
  if (part.hideAt !== undefined) appear *= 1 - interpolate(t, [cue(part.hideAt, Infinity), cue(part.hideAt, Infinity) + IRISAN_TIMING.hide], [0, 1], clamp);
  if (appear <= 0.001) return null;

  const pos = part.pos ?? [0, 0];
  const c0 = centerOf(part);
  const origin: Vec2 = part.origin ?? [c0[0] + pos[0], c0[1] + pos[1]];
  const here: Vec2 = [origin[0] + offset[0] + st.dx, origin[1] + offset[1] + st.dy];
  if (part.id) ctx.anchors.set(part.id, here);

  const preset = part.bahan ? IRISAN_BAHAN[part.bahan] : undefined;
  const baseFill = color(part.fill) ?? preset?.fill ?? '#d6d1c7';
  const fill = st.fill ?? baseFill;
  const glow = part.glow ?? preset?.glow ?? false;
  const hatch = part.hatch ?? preset?.hatch ?? false;
  const stroke = part.stroke === false ? 'none' : (color(part.stroke) ?? darken(fill, 0.45));
  const sw = part.strokeWidth ?? IRISAN_TIMING.strokeWidth;
  const opacity = (part.opacity ?? preset?.opacity ?? 1) * st.opacity * Math.min(1, appear * 1.4);
  const pat = hatch ? patterns.get(`${fill}-${hatch}`) : undefined;
  const paint = pat ? `url(#${pat.id})` : fill;
  const pop = part.showAt !== undefined ? 0.7 + 0.3 * Math.min(1, appear) : 1;
  const transform = [
    `translate(${pos[0] + st.dx} ${pos[1] + st.dy})`,
    `translate(${origin[0] - pos[0]} ${origin[1] - pos[1]})`,
    `rotate(${st.turn})`,
    `scale(${st.sx * pop} ${st.sy * pop})`,
    `translate(${-(origin[0] - pos[0])} ${-(origin[1] - pos[1])})`,
  ].join(' ');
  const common = {
    fill: paint,
    stroke,
    strokeWidth: sw,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
    filter: glow ? 'url(#ir-glow)' : undefined,
  };

  let body: React.ReactNode = null;
  switch (part.shape) {
    case 'rect':
      body = <rect x={part.x} y={part.y} width={part.w} height={part.h} rx={part.r ?? 0} {...common} />;
      break;
    case 'circle':
      body = <circle cx={part.x} cy={part.y} r={part.r} {...common} />;
      break;
    case 'ellipse':
      body = <ellipse cx={part.x} cy={part.y} rx={part.rx} ry={part.ry} {...common} />;
      break;
    case 'poly':
      body = <path d={polyPath(part.points, part.smooth, part.closed !== false)} {...common} fill={part.closed === false ? 'none' : paint} />;
      break;
    case 'path':
      body = <path d={part.d} {...common} />;
      break;
    case 'wave': {
      const amp = part.amp ?? 10;
      const len = part.length ?? 160;
      const phase = ctx.abs * (part.speed ?? 0.4) * Math.PI * 2;
      const steps = Math.max(12, Math.ceil(part.w / 12));
      const top: Vec2[] = Array.from({ length: steps + 1 }, (_, i) => {
        const x = part.x + (part.w * i) / steps;
        return [x, part.y + Math.sin(((x - part.x) / len) * Math.PI * 2 - phase) * amp];
      });
      const d = `M${top.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L')} L${part.x + part.w},${part.y + part.h} L${part.x},${part.y + part.h} Z`;
      body = (
        <>
          <path d={d} {...common} stroke="none" />
          <path d={`M${top.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L')}`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
      break;
    }
    case 'flow': {
      const count = part.count ?? 10;
      const start = cue(part.at, 0);
      const stop = part.stopAt !== undefined ? cue(part.stopAt, Infinity) : Infinity;
      if (t < start) return null;
      const run = Math.min(t, stop) - start;
      const fade = 1 - clamp01((t - stop) / 0.5);
      const phase = run * (part.speed ?? 0.3);
      body = Array.from({ length: count }, (_, i) => {
        const u = (((i / count + phase) % 1) + 1) % 1;
        const [x, y] = pointAt(part.path, u, part.closed);
        const edge = part.closed ? 1 : Math.min(1, u * 8, (1 - u) * 8);
        return <circle key={i} cx={x} cy={y} r={(part.size ?? 8) * edge} fill={fill} stroke={stroke} strokeWidth={sw * 0.6} opacity={fade} filter={common.filter} />;
      });
      break;
    }
    case 'group':
      body = part.children.map((ch, i) => <PartView key={`${k}-${i}`} part={ch} ctx={ctx} offset={[offset[0] + pos[0] + st.dx, offset[1] + pos[1] + st.dy]} k={`${k}-${i}`} />);
      break;
  }
  return (
    <g transform={transform} opacity={opacity}>
      {body}
    </g>
  );
};

/** Irisan teknis 2D (cutaway): bagian beraksir per bahan, gerak saat kata narasi, label menempel, HUD seperti `world`. */
export const IrisanSceneView: React.FC<SceneProps<IrisanScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { theme, safe, px, type, space } = useTheme();
  const motion = useSceneMotion();
  const cue = useCue();
  const exit = useSceneExit(0.4);
  const c = theme.colors;
  const t = frame / fps;
  const abs = ((motion?.from ?? 0) + frame) / fps;
  const sceneSec = motion ? motion.frames / fps : 6;
  const color = (v: string | undefined) => (v && v in c ? c[v as keyof typeof c] : v);
  const [VW, VH] = scene.size ?? [1000, 1000];

  // "Kamera": tengah + perbesaran, bergeser halus antar shot; ayunan pelan sepanjang scene.
  const shots = scene.shots?.length ? scene.shots : [{}];
  let center: Vec2 = shots[0].center ?? [VW / 2, VH / 2];
  let zoom = shots[0].zoom ?? 1;
  for (const s of shots.slice(1)) {
    const start = cue(s.at, 0);
    const p = EASINGS.emphasized(clamp01((t - start) / (s.duration ?? 1.1)));
    const to = s.center ?? center;
    center = [center[0] + (to[0] - center[0]) * p, center[1] + (to[1] - center[1]) * p];
    zoom = zoom + ((s.zoom ?? zoom) - zoom) * p;
  }
  zoom *= 1 + IRISAN_TIMING.drift * (t / Math.max(1, sceneSec));
  const vw = VW / zoom;
  const vh = VH / zoom;
  const viewBox = `${center[0] - vw / 2} ${center[1] - vh / 2} ${vw} ${vh}`;

  // Area gambar: di bawah header bab, di atas subtitle.
  const box = { left: safe.x * 0.45, top: H * 0.21, width: W - safe.x * 0.9, height: H * 0.55 };
  const fit = Math.min(box.width / vw, box.height / vh);
  const drawW = vw * fit;
  const drawH = vh * fit;
  const ox = box.left + (box.width - drawW) / 2;
  const oy = box.top + (box.height - drawH) / 2;
  const toScreen = (q: Vec2) => ({ x: ox + (q[0] - (center[0] - vw / 2)) * fit, y: oy + (q[1] - (center[1] - vh / 2)) * fit });

  // Pola aksir dikumpulkan dulu (sebelum menggambar) agar <defs> lengkap.
  const patterns: Patterns = new Map();
  const collect = (list: IrisanPart[]) => {
    for (const part of list) {
      const preset = part.bahan ? IRISAN_BAHAN[part.bahan] : undefined;
      const hatch = part.hatch ?? preset?.hatch ?? false;
      if (hatch) {
        const fill = color(part.fill) ?? preset?.fill ?? '#d6d1c7';
        const key = `${fill}-${hatch}`;
        if (!patterns.has(key)) patterns.set(key, { id: `ir-pat-${patterns.size}`, fill, ink: darken(fill, 0.22), kind: hatch });
      }
      if (part.shape === 'group') collect(part.children);
    }
  };
  collect(scene.parts);
  const anchors = new Map<string, Vec2>();
  const ctx: DrawCtx = { t, abs, cue, color, patterns, anchors, fps, frame };
  const drawn = scene.parts.map((p, i) => <PartView key={i} part={p} ctx={ctx} offset={[0, 0]} k={`p${i}`} />);
  const appear = spring({ frame, fps, config: SPRINGS.gentle }) * (1 - exit);

  const project = (target: string | Vec2 | [number, number, number]) => {
    const q = typeof target === 'string' ? anchors.get(target) : ([target[0], target[1]] as Vec2);
    return q ? toScreen(q) : null;
  };
  const labels = (scene.labels ?? []).map((l, i) => {
    const start = cue(l.at, 0.6 + i * 0.5);
    const end = l.hideAt !== undefined ? cue(l.hideAt, Infinity) : Infinity;
    const inP = spring({ frame: frame - start * fps, fps, config: SPRINGS.snappy });
    const outP = Number.isFinite(end) ? interpolate(t, [end, end + 0.25], [0, 1], clamp) : 0;
    return { l, i, start, p: Math.max(0, inP * (1 - outP) * (1 - exit)), xy: project(l.target) };
  });
  const cards = (scene.cards ?? []).map((card, i) => {
    const start = cue(card.at, 0.8 + i * 0.6);
    const end = card.hideAt !== undefined ? cue(card.hideAt, Infinity) : Infinity;
    const inP = spring({ frame: frame - start * fps, fps, config: SPRINGS.gentle });
    const outP = Number.isFinite(end) ? interpolate(t, [end, end + 0.3], [0, 1], clamp) : 0;
    return { card, i, start, p: Math.max(0, inP * (1 - outP) * (1 - exit)), gone: t > end + 0.3 || t < start };
  });
  const meters = scene.meters ?? [];
  const stampStart = scene.stamp ? cue(scene.stamp.at, 1) : 0;
  const bg = color(scene.latar) ?? c.background;
  const lift = px(90);
  const pillH = px(58);

  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg
        width={drawW}
        height={drawH}
        viewBox={viewBox}
        style={{ position: 'absolute', left: ox, top: oy, opacity: appear, overflow: 'visible', filter: `drop-shadow(0 ${px(14)}px ${px(22)}px rgba(60,50,30,0.18))` }}
      >
        <defs>
          {[...patterns.values()].map((pt) =>
            pt.kind === 'titik' ? (
              <pattern key={pt.id} id={pt.id} width={14} height={14} patternUnits="userSpaceOnUse">
                <rect width={14} height={14} fill={pt.fill} />
                <circle cx={4} cy={4} r={1.6} fill={pt.ink} />
                <circle cx={11} cy={10} r={1.3} fill={pt.ink} />
              </pattern>
            ) : (
              <pattern key={pt.id} id={pt.id} width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width={12} height={12} fill={pt.fill} />
                <line x1={0} y1={0} x2={0} y2={12} stroke={pt.ink} strokeWidth={2} />
              </pattern>
            ),
          )}
          <filter id="ir-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={6} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {drawn}
      </svg>

      {scene.badge ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: box.top + px(4), display: 'flex', justifyContent: 'center', opacity: appear }}>
          <div
            style={{
              padding: `${px(8)}px ${px(20)}px`,
              borderRadius: px(8),
              background: 'rgba(30,30,30,0.85)',
              color: '#ffffff',
              fontFamily: theme.fonts.mono,
              fontSize: type.label * 0.75,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {scene.badge}
          </div>
        </div>
      ) : null}

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {labels.map(({ l, i, p, xy }) => {
          if (!xy || p <= 0.01) return null;
          const right = l.side ? l.side === 'right' : xy.x < W * 0.5;
          const col = color(l.color) ?? c.accent;
          return (
            <g key={i} opacity={Math.min(1, p * 1.5)}>
              <line x1={xy.x} y1={xy.y} x2={xy.x + (right ? 1 : -1) * px(60) * p} y2={xy.y - lift * p} stroke="#1a1a1a" strokeWidth={px(3)} strokeLinecap="round" />
              <circle cx={xy.x} cy={xy.y} r={px(9)} fill={col} stroke="#1a1a1a" strokeWidth={px(3)} />
            </g>
          );
        })}
      </svg>
      {labels.map(({ l, i, p, xy }) => {
        if (!xy || p <= 0.01) return null;
        const right = l.side ? l.side === 'right' : xy.x < W * 0.5;
        const col = color(l.color) ?? c.accent;
        const x = Math.min(W - safe.x * 0.5, Math.max(safe.x * 0.5, xy.x + (right ? 1 : -1) * px(60)));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: xy.y - lift - pillH / 2,
              height: pillH,
              transform: `translate(${right ? '-12%' : '-88%'}, 0) scale(${0.6 + 0.4 * p})`,
              opacity: Math.min(1, p * 1.5),
              padding: `0 ${px(22)}px`,
              display: 'flex',
              alignItems: 'center',
              borderRadius: theme.radius.pill,
              background: col,
              color: new THREE.Color(col).getHSL({ h: 0, s: 0, l: 0 }).l > 0.6 ? '#111111' : '#ffffff',
              border: `${px(3)}px solid #1a1a1a`,
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.heading,
              fontSize: type.label * 0.92,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {l.text}
          </div>
        );
      })}

      <AbsoluteFill style={{ padding: `${safe.top}px ${safe.x}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: space.sm }}>
        <SceneTitle eyebrow={scene.eyebrow} title={scene.title} highlight={scene.highlight} subtitle={scene.subtitle} align="left" />
        {scene.readout ? <WorldReadoutView readout={scene.readout} sceneSec={sceneSec} exit={exit} /> : null}
        {scene.panel ? <WorldPanelView panel={scene.panel} sceneSec={sceneSec} exit={exit} color={color} /> : null}
        {meters.map((m, i) => (
          <WorldMeterView key={i} meter={m} index={i} exit={exit} color={color} />
        ))}
        {cards.map(({ card, i, p, start, gone }) => (gone ? null : <WorldCardView key={i} card={card} p={p} start={start} color={color} />))}
      </AbsoluteFill>

      {scene.stamp ? (
        <WorldStampView stamp={{ ...scene.stamp, target: scene.stamp.target ? 'irisan' : undefined }} exit={exit} project={() => (scene.stamp?.target ? project(scene.stamp.target) : null)} color={color} W={W} H={H} start={stampStart} />
      ) : null}

      {scene.note ? (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: safe.bottom, display: 'flex', justifyContent: 'center', opacity: interpolate(t, [0.4, 0.9], [0, 0.85], clamp) * (1 - exit) }}>
          <div style={{ padding: `${px(8)}px ${px(20)}px`, borderRadius: px(8), background: 'rgba(20,20,20,0.78)', color: '#ffffff', fontFamily: theme.fonts.mono, fontSize: type.label * 0.75, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {scene.note}
          </div>
        </div>
      ) : null}

      {shots.slice(1).map((s, i) => (
        <Sfx key={`shot-${i}`} name="whooshSoft" at={cue(s.at, 0)} seed={i} category="elements" />
      ))}
      {labels.map(({ i, start }) => (
        <Sfx key={`label-${i}`} name="pop" at={start} seed={i} />
      ))}
      {cards.map(({ i, start }) => (
        <Sfx key={`card-${i}`} name="tick" at={start} seed={i} />
      ))}
      {scene.stamp && stampStart >= 0 ? <Sfx name="impact" at={stampStart} /> : null}
    </AbsoluteFill>
  );
};
