import * as THREE from 'three';
import { EASINGS } from '../../config';
import type { Cue, Vec3, WorldMotion, WorldObject, WorldShot, WorldView } from '../../scenes/types';

/** Angka gerak dunia 3D (detik / derajat). */
export const WORLD_TIMING = {
  tween: 0.7,
  show: 0.45,
  hide: 0.25,
  spinRamp: 0.5,
  flight: 1.2,
  drift: 7,
  xrayOpacity: 0.13,
} as const;

export const WORLD_VIEW_DEFAULT = { azimuth: 35, elevation: 28, fov: 32 } as const;

export type CueFn = (at: Cue | undefined, fallback: number) => number;
export type ColorFn = (c: string | undefined) => string | undefined;

export interface WorldNode {
  key: string;
  id?: string;
  object: WorldObject;
  position: Vec3;
  /** Radian. */
  rotation: Vec3;
  scale: Vec3;
  color?: string;
  opacity: number;
  /** Nilai turunan per bentuk (fase aliran, lampu menyala). */
  extra: { phase?: number; light?: string };
  children: WorldNode[];
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const rad = (d: number) => (d * Math.PI) / 180;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
const AXIS = { x: 0, y: 1, z: 2 } as const;

/** Integral dari ramp 0→1 selama `r` detik: gerak mulai/berhenti halus. */
function ramped(x: number, r: number): number {
  if (x <= 0) return 0;
  return x < r ? (x * x) / (2 * r) : r / 2 + (x - r);
}

/** Detik efektif sebuah gerak terus-menerus (dengan mulai/berhenti halus). Tanpa `at` → waktu video (bersambung lintas scene). */
function running(t: number, abs: number, cue: CueFn, at?: Cue, stopAt?: Cue): number {
  const r = WORLD_TIMING.spinRamp;
  const base = at === undefined ? abs : ramped(t - cue(at, 0), r);
  return stopAt === undefined ? base : base - ramped(t - cue(stopAt, Infinity), r);
}

function easeOutBack(p: number): number {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
}

type Tween = Extract<WorldMotion, { at: Cue; to: unknown }>;

/** Jalankan tween bertipe `type` berurutan dari nilai `base`. */
function tween<T>(
  motions: WorldMotion[],
  type: Tween['type'],
  base: T,
  t: number,
  cue: CueFn,
  mix: (a: T, b: T, p: number) => T,
  map: (to: never) => T,
): T {
  const list = motions
    .filter((m): m is Tween => m.type === type)
    .map((m) => ({ m, start: cue(m.at, 0) }))
    .sort((a, b) => a.start - b.start);
  let value = base;
  for (const { m, start } of list) {
    const p = EASINGS.emphasized(clamp01((t - start) / (m.duration ?? WORLD_TIMING.tween)));
    if (p > 0) value = mix(value, map(m.to as never), p);
  }
  return value;
}

const mixColor = (a: string | undefined, b: string | undefined, p: number) =>
  a && b ? `#${new THREE.Color(a).lerp(new THREE.Color(b), p).getHexString()}` : (b ?? a);

/**
 * Hitung keadaan semua objek pada waktu `t` (detik scene) / `abs` (detik video).
 * Murni & deterministik; juga mengisi `positions` (posisi dunia tiap `id`) untuk kamera dan label.
 */
export function evaluateWorld(
  objects: WorldObject[],
  t: number,
  abs: number,
  cue: CueFn,
  color: ColorFn,
  positions: Map<string, THREE.Vector3>,
  parent: THREE.Matrix4 = new THREE.Matrix4(),
  prefix = '',
): WorldNode[] {
  const out: WorldNode[] = [];
  objects.forEach((o, i) => {
    const motions = o.motion ?? [];
    let show = 1;
    if (o.showAt !== undefined) show *= easeOutBack(clamp01((t - cue(o.showAt, 0)) / WORLD_TIMING.show));
    if (o.hideAt !== undefined) show *= 1 - EASINGS.accelerate(clamp01((t - cue(o.hideAt, Infinity)) / WORLD_TIMING.hide));
    if (o.showAt !== undefined && t < cue(o.showAt, 0)) show = 0;
    if (show <= 0.001) return;

    const position = tween<Vec3>(motions, 'move', o.pos ?? [0, 0, 0], t, cue, lerp3, (v: Vec3) => v);
    const deg = tween<Vec3>(motions, 'turn', o.rotate ?? [0, 0, 0], t, cue, lerp3, (v: Vec3) => v);
    const rotation: Vec3 = [rad(deg[0]), rad(deg[1]), rad(deg[2])];
    const s0 = o.scale ?? 1;
    const k = tween<number>(motions, 'scale', 1, t, cue, lerp, (v: number) => v) * show;
    const scale: Vec3 = typeof s0 === 'number' ? [s0 * k, s0 * k, s0 * k] : [s0[0] * k, s0[1] * k, s0[2] * k];
    const opacity = tween<number>(motions, 'fade', o.opacity ?? 1, t, cue, lerp, (v: number) => v);
    const col = tween<string | undefined>(motions, 'color', color(o.color), t, cue, mixColor, (v: string) => color(v));

    for (const m of motions) {
      if (m.type === 'spin') {
        const axis = m.axis ?? ('axis' in o && o.axis ? o.axis : 'y');
        rotation[AXIS[axis]] += running(t, abs, cue, m.at, m.stopAt) * (m.speed ?? 0.5) * Math.PI * 2;
      } else if (m.type === 'bob') {
        position[1] += (m.amount ?? 0.08) * Math.sin((abs / (m.period ?? 2.4)) * Math.PI * 2 + i * 2.399);
      }
    }

    const extra: WorldNode['extra'] = {};
    if (o.shape === 'flow') extra.phase = running(t, abs, cue, o.at, o.stopAt) * (o.speed ?? 0.25);
    if (o.shape === 'trafficLight') {
      extra.light = o.light ?? 'red';
      [...(o.changes ?? [])]
        .map((c) => ({ c, start: cue(c.at, 0) }))
        .sort((a, b) => a.start - b.start)
        .forEach(({ c, start }) => {
          if (t >= start) extra.light = c.to;
        });
    }

    const local = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale),
    );
    const world = parent.clone().multiply(local);
    if (o.id) positions.set(o.id, new THREE.Vector3().setFromMatrixPosition(world));
    const key = `${prefix}${i}`;
    out.push({
      key,
      id: o.id,
      object: o,
      position,
      rotation,
      scale,
      color: col,
      opacity,
      extra,
      children: o.children ? evaluateWorld(o.children, t, abs, cue, color, positions, world, `${key}.`) : [],
    });
  });
  return out;
}

export interface CameraPose {
  target: THREE.Vector3;
  distance: number;
  azimuth: number;
  elevation: number;
  fov: number;
  /** 0..1 per id objek. */
  xray: Record<string, number>;
  /** Waktu mulai tiap shot (detik) — untuk efek suara. */
  starts: number[];
}

/** Posisi kamera pada waktu `t`: shot pertama = awal, berikutnya terbang (bisa dipotong shot selanjutnya). */
export function cameraAt(
  shots: WorldShot[],
  views: Record<string, WorldView>,
  t: number,
  sceneSec: number,
  cue: CueFn,
  positions: Map<string, THREE.Vector3>,
): CameraPose {
  const resolved = shots.map((s, i) => {
    const v = { ...(s.view ? views[s.view] : undefined), ...s };
    if (s.view && !views[s.view]) console.warn(`[world] view "${s.view}" tidak ada di \`views\`.`);
    return { v, start: i === 0 ? 0 : cue(s.at, (sceneSec * i) / shots.length), duration: s.duration ?? WORLD_TIMING.flight };
  });
  const point = (target: WorldView['target'] | undefined) => {
    if (Array.isArray(target)) return new THREE.Vector3(...target);
    const p = target ? positions.get(target) : undefined;
    if (target && !p) console.warn(`[world] target "${target}" tidak ditemukan (id objek).`);
    return p ? p.clone() : new THREE.Vector3();
  };
  const pose: CameraPose = { target: new THREE.Vector3(), distance: 10, azimuth: 0, elevation: 0, fov: 32, xray: {}, starts: resolved.map((r) => r.start) };
  resolved.forEach(({ v, start, duration }, i) => {
    const p = i === 0 ? 1 : EASINGS.emphasized(clamp01((t - start) / duration));
    if (p <= 0) return;
    const end = resolved[i + 1]?.start ?? sceneSec;
    const hold = clamp01((t - start) / Math.max(0.01, end - start));
    const azimuth = (v.azimuth ?? WORLD_VIEW_DEFAULT.azimuth) + (v.drift ?? WORLD_TIMING.drift) * (hold - 0.5);
    pose.target.lerp(point(v.target), p);
    pose.distance = Math.exp(lerp(Math.log(pose.distance), Math.log(Math.max(0.05, v.distance ?? 10)), p));
    pose.azimuth = lerp(pose.azimuth, azimuth, p);
    pose.elevation = lerp(pose.elevation, v.elevation ?? WORLD_VIEW_DEFAULT.elevation, p);
    pose.fov = lerp(pose.fov, v.fov ?? WORLD_VIEW_DEFAULT.fov, p);
    const ids = new Set(v.xray ?? []);
    for (const id of new Set([...Object.keys(pose.xray), ...ids])) pose.xray[id] = lerp(pose.xray[id] ?? 0, ids.has(id) ? 1 : 0, p);
  });
  return pose;
}

/** Posisi kamera di dunia dari pose orbit. */
export function cameraPosition(pose: CameraPose): THREE.Vector3 {
  const az = rad(pose.azimuth);
  const el = rad(pose.elevation);
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(pose.distance).add(pose.target);
}
