#!/usr/bin/env node
/**
 * Ambil data kota dari OpenStreetMap (Overpass API) → `src/worlds/peta/<nama>.json` untuk `kotaDariPeta()`.
 *
 *   npm run peta -- <nama> <lat> <lon> [radius-meter=450]
 *   npm run peta -- scbd -6.2251 106.8085 450
 *
 * Isi: tapak + tinggi gedung (`height` / `building:levels` × 3,5 m / perkiraan), jalan (lebar menurut kelas),
 * taman, air. Koordinat meter relatif pusat: x = timur, z = selatan. Data © OpenStreetMap contributors (ODbL) —
 * tulis kreditnya di video. Butuh host `overpass-api.de` diizinkan di jaringan environment.
 */
import fs from 'node:fs';
import path from 'node:path';

const [nama, latS, lonS, radS] = process.argv.slice(2);
if (!nama || !latS || !lonS) {
  console.error('Pakai: npm run peta -- <nama> <lat> <lon> [radius-meter]');
  process.exit(1);
}
const lat0 = Number(latS);
const lon0 = Number(lonS);
const R = Number(radS ?? 450);
const ENDPOINT = process.env.OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter';

const JALAN = {
  motorway: 16, trunk: 14, primary: 12, secondary: 9, tertiary: 7.5,
  motorway_link: 7, trunk_link: 7, primary_link: 7, secondary_link: 6, tertiary_link: 6,
  unclassified: 6, residential: 5.5, living_street: 4.5, service: 4,
};
const UTAMA = new Set(['motorway', 'trunk', 'primary', 'secondary', 'motorway_link', 'trunk_link', 'primary_link']);

const around = `(around:${R * 1.15},${lat0},${lon0})`;
const query = `[out:json][timeout:90];
(
  way["building"]${around};
  relation["building"]${around};
  way["highway"~"^(${Object.keys(JALAN).join('|')})$"]${around};
  way["leisure"~"^(park|garden|pitch|golf_course)$"]${around};
  way["landuse"~"^(grass|recreation_ground|village_green|forest)$"]${around};
  way["natural"~"^(water|wood)$"]${around};
);
out tags geom;`;

console.log(`Mengambil OSM: ${nama} (${lat0}, ${lon0}) radius ${R} m …`);
const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'motion-studio-peta/1.0' },
  body: `data=${encodeURIComponent(query)}`,
});
if (!res.ok) {
  console.error(`Overpass ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}
const data = await res.json();

const kx = Math.cos((lat0 * Math.PI) / 180) * 111320;
const kz = 110574;
const r1 = (v) => Math.round(v * 10) / 10;
const proj = (g) => g.map(({ lat, lon }) => [r1((lon - lon0) * kx), r1(-(lat - lat0) * kz)]);

/** Douglas–Peucker. */
function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, az] = pts[a];
    const [bx, bz] = pts[b];
    const L = Math.hypot(bx - ax, bz - az) || 1e-9;
    let best = -1;
    let bi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (az - pts[i][1]) - (ax - pts[i][0]) * (bz - az)) / L;
      if (d > best) [best, bi] = [d, i];
    }
    if (best > tol) {
      keep[bi] = 1;
      stack.push([a, bi], [bi, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const closedRing = (pts) => {
  const p = simplify(pts, 0.6);
  if (p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) p.pop();
  return p.length >= 3 ? p : null;
};

function tinggi(tags) {
  const h = parseFloat(String(tags.height ?? '').replace(',', '.'));
  if (Number.isFinite(h) && h > 0) return r1(h);
  const lv = parseFloat(tags['building:levels'] ?? '');
  if (Number.isFinite(lv) && lv > 0) return r1(lv * 3.5 + 1);
  const t = tags.building;
  if (['house', 'residential', 'detached', 'semidetached_house', 'terrace', 'garage', 'shed', 'hut', 'roof'].includes(t)) return 7;
  if (['commercial', 'office', 'retail', 'hotel', 'apartments'].includes(t)) return 18;
  return 10;
}

const out = { nama, pusat: [lat0, lon0], radius: R, sumber: 'Peta: © OpenStreetMap contributors', gedung: [], jalan: [], taman: [], air: [] };
for (const el of data.elements ?? []) {
  const tags = el.tags ?? {};
  if (el.type === 'way' && el.geometry) {
    const pts = proj(el.geometry);
    if (tags.building && tags.building !== 'no') {
      const p = closedRing(pts);
      if (p) out.gedung.push({ p, h: tinggi(tags), ...(tags.name ? { nama: tags.name } : {}) });
    } else if (tags.highway) {
      if (tags.tunnel === 'yes' || tags.area === 'yes') continue;
      const p = simplify(pts, 0.8);
      const lanes = parseInt(tags.lanes ?? '', 10);
      const w = Number.isFinite(lanes) && lanes > 0 ? Math.max(JALAN[tags.highway], lanes * 3.3) : JALAN[tags.highway];
      out.jalan.push({ p, w: r1(w), ...(UTAMA.has(tags.highway) ? { utama: true } : {}) });
    } else if (tags.natural === 'water') {
      const p = closedRing(pts);
      if (p) out.air.push({ p });
    } else {
      const p = closedRing(pts);
      if (p) out.taman.push({ p });
    }
  } else if (el.type === 'relation' && tags.building) {
    for (const m of el.members ?? []) {
      if (m.role !== 'outer' || !m.geometry) continue;
      const p = closedRing(proj(m.geometry));
      if (p) out.gedung.push({ p, h: tinggi(tags), ...(tags.name ? { nama: tags.name } : {}) });
    }
  }
}

const dir = path.join(process.cwd(), 'src/worlds/peta');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${nama}.json`);
fs.writeFileSync(file, JSON.stringify(out));
const named = out.gedung.filter((g) => g.nama).map((g) => g.nama);
console.log(`→ ${path.relative(process.cwd(), file)}: ${out.gedung.length} gedung, ${out.jalan.length} jalan, ${out.taman.length} taman, ${out.air.length} air (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
if (named.length) console.log(`Gedung bernama (${named.length}): ${[...new Set(named)].slice(0, 40).join(' · ')}`);
