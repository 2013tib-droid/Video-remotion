import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Vec2 } from '../../scenes/types';

/** Geometri gedung-dari-tapak & pita jalan. Murni dari angka masukan (deterministik), dibangun sekali per objek. */

type P = [number, number];

export function pointInPolygon([x, z]: P, poly: P[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Bilangan acak semu dari isi denah (sama setiap render). */
function seeded(points: P[]): () => number {
  let h = 2166136261;
  for (const [x, z] of points) {
    h = Math.imul(h ^ Math.round(x * 10), 16777619);
    h = Math.imul(h ^ Math.round(z * 10), 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Kotak `w × h × d` diputar `angle` (radian, sumbu y) lalu digeser ke `at`. */
function box(w: number, h: number, d: number, angle: number, at: [number, number, number]): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.rotateY(angle);
  g.translate(...at);
  return g;
}

function merge(list: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (!list.length) return null;
  const out = mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)));
  list.forEach((g) => g.dispose());
  return out;
}

/** Buang titik penutup ganda & pastikan minimal 3 titik. */
function clean(points: Vec2[]): P[] {
  const pts = points.map(([x, z]) => [x, z] as P);
  if (pts.length > 1) {
    const [a, b] = [pts[0], pts[pts.length - 1]];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.01) pts.pop();
  }
  return pts;
}

export interface PrismGeometry {
  /** Grup 0 = atap/alas, grup 1 = dinding. */
  body: THREE.BufferGeometry;
  windows: THREE.BufferGeometry | null;
  roof: THREE.BufferGeometry | null;
}

export function prismGeometry(points: Vec2[], height: number, facade: 'pita' | 'kisi' | 'kaca' | 'polos', floor: number, roofDetail: boolean): PrismGeometry {
  const pts = clean(points);
  // Denah [x, z] → bentuk 2D (x, -z); setelah diputar -90° di sumbu x, ekstrusi naik ke +y dan z kembali benar.
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const body = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 1 });
  body.rotateX(-Math.PI / 2);

  const n = pts.length;
  const floors = Math.max(1, Math.min(70, Math.floor(height / floor)));
  const fh = height / floors;
  const parts: THREE.BufferGeometry[] = [];

  // Belokan di tiap titik (derajat): sudut tajam dapat jarak dari jendela, lengkungan (menara bulat) tidak.
  const turn = pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    const a1 = Math.atan2(p[1] - a[1], p[0] - a[0]);
    const a2 = Math.atan2(b[1] - p[1], b[0] - p[0]);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    return (d * 180) / Math.PI;
  });

  if (facade !== 'polos') {
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const L = Math.hypot(dx, dz);
      if (L < 0.8) continue;
      const ux = dx / L;
      const uz = dz / L;
      // Normal ke luar: uji titik sedikit di luar tengah sisi.
      let nx = uz;
      let nz = -ux;
      if (pointInPolygon([(a[0] + b[0]) / 2 + nx * 0.05, (a[1] + b[1]) / 2 + nz * 0.05], pts)) {
        nx = -nx;
        nz = -nz;
      }
      const angle = Math.atan2(-dz, dx);
      const ia = turn[i] > 25 ? Math.min(0.7, L * 0.12) : -0.03;
      const ib = turn[(i + 1) % n] > 25 ? Math.min(0.7, L * 0.12) : -0.03;
      const along = (s: number): [number, number] => [a[0] + ux * s + nx * 0.05, a[1] + uz * s + nz * 0.05];

      if (facade === 'pita') {
        const len = L - ia - ib;
        if (len < 0.4) continue;
        const [cx, cz] = along(ia + len / 2);
        for (let f = 0; f < floors; f++) parts.push(box(len, fh * 0.42, 0.14, angle, [cx, f * fh + fh * 0.52, cz]));
      } else if (facade === 'kisi') {
        const cols = Math.max(1, Math.floor((L - 0.6) / 3.2));
        const w = Math.min(1.7, (L / cols) * 0.58);
        for (let c = 0; c < cols; c++) {
          const [cx, cz] = along((L / cols) * (c + 0.5));
          for (let f = 0; f < floors; f++) parts.push(box(w, fh * 0.46, 0.14, angle, [cx, f * fh + fh * 0.55, cz]));
        }
      } else {
        // Kaca: garis lantai terang + tiang tipis tiap ±4,5 m.
        const [cx, cz] = along(L / 2);
        for (let f = 1; f <= floors; f++) parts.push(box(L + 0.06, 0.32, 0.1, angle, [cx, f * fh - 0.16, cz]));
        const cols = Math.floor(L / 4.5);
        for (let c = 1; c < cols; c++) {
          const [mx, mz] = along((L / cols) * c);
          parts.push(box(0.16, height, 0.1, angle, [mx, height / 2, mz]));
        }
      }
    }
  }

  // Detail atap: unit AC, tangki air, ruang mesin — posisi acak semu di dalam denah.
  const roofParts: THREE.BufferGeometry[] = [];
  if (roofDetail) {
    const xs = pts.map((p) => p[0]);
    const zs = pts.map((p) => p[1]);
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    const span = Math.min(x1 - x0, z1 - z0);
    if (span > 5) {
      const rnd = seeded(pts);
      const s = Math.min(1, span / 18);
      const pick = (): P | null => {
        for (let k = 0; k < 12; k++) {
          const p: P = [x0 + (x1 - x0) * (0.2 + rnd() * 0.6), z0 + (z1 - z0) * (0.2 + rnd() * 0.6)];
          if (pointInPolygon(p, pts)) return p;
        }
        return null;
      };
      const count = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < count; k++) {
        const p = pick();
        if (p) roofParts.push(box(2.2 * s, 1.1 * s, 1.6 * s, rnd() * 0.3, [p[0], height + 0.55 * s, p[1]]));
      }
      const tank = pick();
      if (tank && rnd() > 0.35) {
        const g = new THREE.CylinderGeometry(1.0 * s, 1.0 * s, 2.2 * s, 18);
        g.translate(tank[0], height + 1.1 * s, tank[1]);
        roofParts.push(g);
      }
      const room = pick();
      if (room && span > 14) roofParts.push(box(4 * s, 2.6 * s, 3.4 * s, 0, [room[0], height + 1.3 * s, room[1]]));
    }
  }

  return { body, windows: merge(parts), roof: merge(roofParts) };
}

export interface StripGeometry {
  body: THREE.BufferGeometry;
  /** Pita tepi (lebih lebar, sedikit lebih rendah). */
  edge: THREE.BufferGeometry;
  dashes: THREE.BufferGeometry | null;
}

/** Pita datar (tebal tipis agar tepinya bertinta) mengikuti jalur [x, z]. */
export function stripGeometry(path: Vec2[], width: number, closed: boolean, dashes: boolean): StripGeometry {
  const pts = clean(path);
  const ribbon = (half: number, y: number, thick: number, from = 0, to = pts.length - 1 + (closed ? 1 : 0)): THREE.BufferGeometry => {
    const at = (i: number) => pts[((i % pts.length) + pts.length) % pts.length];
    const pos: number[] = [];
    const idx: number[] = [];
    const count = to - from + 1;
    for (let k = 0; k < count; k++) {
      const i = from + k;
      const p = at(i);
      const prev = !closed && i === 0 ? p : at(i - 1);
      const next = !closed && i === pts.length - 1 ? p : at(i + 1);
      let tx = next[0] - prev[0];
      let tz = next[1] - prev[1];
      const tl = Math.hypot(tx, tz) || 1;
      tx /= tl;
      tz /= tl;
      // Sambungan miter dibatasi agar tikungan tajam tidak meruncing jauh.
      const seg = Math.hypot(next[0] - p[0], next[1] - p[1]) || 1;
      const sx = (next[0] - p[0]) / seg;
      const sz = (next[1] - p[1]) / seg;
      const miter = Math.min(2, 1 / Math.max(0.5, Math.abs(tx * sx + tz * sz)));
      const nx = -tz * half * miter;
      const nz = tx * half * miter;
      pos.push(p[0] + nx, y + thick, p[1] + nz, p[0] - nx, y + thick, p[1] - nz, p[0] + nx, y, p[1] + nz, p[0] - nx, y, p[1] - nz);
    }
    for (let k = 0; k < count - 1; k++) {
      const a = k * 4;
      const b = a + 4;
      // atas
      idx.push(a, b, a + 1, a + 1, b, b + 1);
      // dua sisi
      idx.push(a, a + 2, b, b, a + 2, b + 2);
      idx.push(a + 1, b + 1, a + 3, a + 3, b + 1, b + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    const flat = g.toNonIndexed();
    g.dispose();
    flat.computeVertexNormals();
    // Urutan segitiga di atas sudah menghadap atas (normal kiri jalur), sisi menghadap keluar.
    return flat;
  };

  const body = ribbon(width / 2, 0.02, 0.12);
  const edge = ribbon(width / 2 + Math.max(0.35, width * 0.04), 0.01, 0.1);
  let dash: THREE.BufferGeometry | null = null;
  if (dashes) {
    // Potong jalur jadi garis 3 m tiap 7 m.
    const list: THREE.BufferGeometry[] = [];
    const segs = closed ? pts.length : pts.length - 1;
    let carry = 0;
    for (let i = 0; i < segs; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const angle = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
      for (let s = carry; s < L; s += 7) {
        const len = Math.min(3, L - s);
        if (len < 0.5) continue;
        const m = (s + len / 2) / L;
        list.push(box(len, 0.02, 0.18, angle, [a[0] + (b[0] - a[0]) * m, 0.155, a[1] + (b[1] - a[1]) * m]));
      }
      carry = (((carry - L) % 7) + 7) % 7;
    }
    dash = merge(list);
  }
  return { body, edge, dashes: dash };
}
