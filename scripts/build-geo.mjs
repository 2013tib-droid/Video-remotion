/**
 * Bangun data peta untuk scene `map` → src/components/map/geo-data.ts
 *
 * Sumber: Natural Earth (domain publik) dari paket npm `world-atlas@2` (hanya file JSON-nya
 * yang dibaca; decoder TopoJSON ada di bawah). Detail 1:50m untuk Asia Tenggara/Oseania dekat
 * (agar pulau-pulau Indonesia terbaca), 1:110m untuk negara lain.
 * Proyeksi Mercator; x = derajat bujur, y = −mercator(lintang) dalam derajat.
 *
 * Pemakaian (hanya bila data perlu dibangun ulang):
 *   mkdir /tmp/geo && cd /tmp/geo && npm pack world-atlas@2.0.2 && tar xzf world-atlas-2.0.2.tgz
 *   node scripts/build-geo.mjs /tmp/geo/package
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('Pakai: node scripts/build-geo.mjs <folder world-atlas/package>');
const load = (n) => JSON.parse(fs.readFileSync(path.resolve(dir, `countries-${n}.json`), 'utf8'));

/** Decoder TopoJSON minimal (arcs ter-quantize + delta). */
function decode(topo) {
  const { scale, translate } = topo.transform;
  const arcs = topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
  const arcPts = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  const ring = (ids) => {
    const pts = [];
    ids.forEach((id, k) => {
      const a = arcPts(id);
      pts.push(...(k === 0 ? a : a.slice(1)));
    });
    return pts;
  };
  return topo.objects.countries.geometries.map((g) => ({
    id: g.id ?? g.properties.name,
    name: g.properties.name,
    polys:
      g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map((p) => p.map(ring)) : [],
  }));
}

const DETAIL_BOX = { lon: [88, 160], lat: [-25, 25] };
const inBox = ([lon, lat]) => lon >= DETAIL_BOX.lon[0] && lon <= DETAIL_BOX.lon[1] && lat >= DETAIL_BOX.lat[0] && lat <= DETAIL_BOX.lat[1];
const mercY = (lat) => {
  const l = Math.max(-80, Math.min(84, lat));
  return (-Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360)) * 180) / Math.PI;
};

/** Ring yang melintasi garis 180° (Fiji, Rusia timur): geser bujur negatif +360 agar tidak membentuk pita. */
function unwrap(ring) {
  const crosses = ring.some((p, i) => i > 0 && Math.abs(p[0] - ring[i - 1][0]) > 180);
  return crosses ? ring.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat]) : ring;
}

function ringPath(ring, step) {
  const pts = [];
  for (const [lon, lat] of unwrap(ring)) {
    const x = Math.round(lon / step) * step;
    const y = Math.round(mercY(lat) / step) * step;
    const last = pts[pts.length - 1];
    if (!last || last[0] !== x || last[1] !== y) pts.push([x, y]);
  }
  if (pts.length < 3) return '';
  const d = step < 0.1 ? 2 : 1;
  return 'M' + pts.map(([x, y]) => `${+x.toFixed(d)} ${+y.toFixed(d)}`).join('L') + 'Z';
}

const coarse = decode(load('110m'));
const fine = decode(load('50m'));
const isNear = (c) => c.polys.some((p) => p[0].some(inBox));
const nearFine = fine.filter(isNear);
const nearIds = new Set(nearFine.map((c) => c.id));
const rest = coarse.filter((c) => !nearIds.has(c.id) && !isNear(c) && c.id !== '010'); // tanpa Antarktika

const out = [];
for (const [list, step] of [[nearFine, 0.02], [rest, 0.1]]) {
  for (const c of list) {
    const d = c.polys.map((p) => ringPath(p[0], step)).join('');
    if (!d) continue;
    const biggest = c.polys.map((p) => p[0]).sort((a, b) => b.length - a.length)[0];
    const xs = biggest.map((q) => q[0]);
    const ys = biggest.map((q) => q[1]);
    const r = (v) => +v.toFixed(2);
    const all = c.polys.flatMap((p) => unwrap(p[0]));
    const ax = all.map((q) => q[0]);
    const ay = all.map((q) => mercY(q[1]));
    const bbox = [r(Math.min(...ax)), r(Math.min(...ay)), r(Math.max(...ax)), r(Math.max(...ay))];
    out.push({ id: String(c.id), name: c.name, center: [r((Math.min(...xs) + Math.max(...xs)) / 2), r((Math.min(...ys) + Math.max(...ys)) / 2)], bbox, d });
  }
}
out.sort((a, b) => a.name.localeCompare(b.name));

const body = `/* eslint-disable */
// DIBANGKITKAN oleh scripts/build-geo.mjs — jangan diedit manual.
// Sumber: Natural Earth (domain publik) via world-atlas@2. Proyeksi Mercator:
// x = bujur (derajat), y = −mercator(lintang) (derajat). center = [bujur, lintang]; bbox = [x0, y0, x1, y1] terproyeksi.
export interface GeoCountry { id: string; name: string; center: [number, number]; bbox: [number, number, number, number]; d: string }
export const GEO_COUNTRIES: GeoCountry[] = ${JSON.stringify(out)};
`;
const target = path.resolve('src/components/map/geo-data.ts');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, body);
console.log(`✓ ${out.length} negara (${nearFine.length} detail) → ${target} (${(body.length / 1024).toFixed(0)} KB)`);
