#!/usr/bin/env node
/**
 * Ambil data kota dari OpenStreetMap (Overpass API) → `src/worlds/peta/<nama>.json` untuk `kotaDariPeta()`.
 *
 *   npm run peta -- <nama> <lat> <lon> [radius-meter=450]
 *   npm run peta -- scbd -6.2251 106.8085 450
 *
 * Sumber: API resmi OpenStreetMap (`api.openstreetmap.org`, kotak ≤ ±0,25 derajat²). Overpass (lebih ringan, tetapi sering
 * memutus koneksi dari server cloud) dipakai bila `OVERPASS_URL` diisi.
 *
 * Isi: tapak + tinggi gedung (`height` / `building:levels` × 3,5 m / perkiraan), jalan (lebar menurut kelas),
 * taman, air. Koordinat meter relatif pusat: x = timur, z = selatan. Data © OpenStreetMap contributors (ODbL) —
 * tulis kreditnya di video. Sesi cloud: host `api.openstreetmap.org` harus diizinkan di jaringan environment.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// fetch bawaan Node tidak membaca HTTPS_PROXY kecuali NODE_USE_ENV_PROXY=1 (Node ≥ 22.21): jalankan ulang diri sendiri.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

const [nama, latS, lonS, radS] = process.argv.slice(2);
if (!nama || !latS || !lonS) {
  console.error('Pakai: npm run peta -- <nama> <lat> <lon> [radius-meter]');
  process.exit(1);
}
const lat0 = Number(latS);
const lon0 = Number(lonS);
const R = Number(radS ?? 450);
const OVERPASS = process.env.OVERPASS_URL;

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

async function get(url, init) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { ...init, headers: { 'user-agent': 'motion-studio-peta/1.0', ...(init?.headers ?? {}) } });
      if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
      return await res.json();
    } catch (e) {
      if (i >= 4) throw e;
      console.warn(`  gagal (${String(e.message ?? e).slice(0, 80)}), coba lagi…`);
      await new Promise((r) => setTimeout(r, 15000 * i));
    }
  }
}

/** Elemen gaya Overpass (`geometry` pada way, `members[].geometry` pada relasi). */
let elements;
if (OVERPASS) {
  console.log(`Mengambil OSM (Overpass): ${nama} (${lat0}, ${lon0}) radius ${R} m …`);
  elements = (await get(OVERPASS, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: `data=${encodeURIComponent(query)}` })).elements ?? [];
} else {
  const dLat = (R * 1.15) / 110574;
  const dLon = (R * 1.15) / (Math.cos((lat0 * Math.PI) / 180) * 111320);
  const bbox = [lon0 - dLon, lat0 - dLat, lon0 + dLon, lat0 + dLat].map((v) => v.toFixed(6)).join(',');
  // Data mentah disimpan di cache: menjalankan ulang (mis. setelah mengubah skrip) tidak mengunduh lagi.
  const cache = path.join(process.cwd(), 'node_modules/.cache/peta', `${bbox}.json`);
  let raw;
  if (fs.existsSync(cache)) {
    console.log(`Memakai cache ${path.relative(process.cwd(), cache)}`);
    raw = JSON.parse(fs.readFileSync(cache, 'utf8'));
  } else {
    console.log(`Mengambil OSM (api.openstreetmap.org): ${nama} (${lat0}, ${lon0}) radius ${R} m …`);
    raw = (await get(`https://api.openstreetmap.org/api/0.6/map.json?bbox=${bbox}`)).elements ?? [];
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    fs.writeFileSync(cache, JSON.stringify(raw));
  }
  const nodes = new Map(raw.filter((e) => e.type === 'node').map((n) => [n.id, { lat: n.lat, lon: n.lon }]));
  const geom = (w) => w.nodes.map((id) => nodes.get(id)).filter(Boolean);
  const ways = new Map(raw.filter((e) => e.type === 'way').map((w) => [w.id, w]));
  elements = [
    ...[...ways.values()].map((w) => ({ type: 'way', tags: w.tags, geometry: geom(w) })),
    ...raw
      .filter((e) => e.type === 'relation')
      .map((r) => ({
        type: 'relation',
        tags: r.tags,
        members: (r.members ?? []).map((m) => ({ role: m.role, geometry: m.type === 'way' && ways.has(m.ref) ? geom(ways.get(m.ref)) : null })),
      })),
  ];
}

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
  const open = pts.slice();
  if (open.length > 1 && open[0][0] === open[open.length - 1][0] && open[0][1] === open[open.length - 1][1]) open.pop();
  const p = simplify(open, 0.6);
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
for (const el of elements) {
  const tags = el.tags ?? {};
  if (el.type === 'way' && el.geometry) {
    const pts = proj(el.geometry);
    if (el.geometry.length < 2) continue;
    if (tags.building && tags.building !== 'no') {
      const p = closedRing(pts);
      if (p) out.gedung.push({ p, h: tinggi(tags), ...(tags.name ? { nama: tags.name } : {}) });
    } else if (tags.highway && JALAN[tags.highway]) {
      if (tags.tunnel === 'yes' || tags.area === 'yes') continue;
      const p = simplify(pts, 0.8);
      const lanes = parseInt(tags.lanes ?? '', 10);
      const w = Number.isFinite(lanes) && lanes > 0 ? Math.max(JALAN[tags.highway], lanes * 3.3) : JALAN[tags.highway];
      out.jalan.push({ p, w: r1(w), ...(UTAMA.has(tags.highway) ? { utama: true } : {}) });
    } else if (tags.natural === 'water') {
      const p = closedRing(pts);
      if (p) out.air.push({ p });
    } else if (/^(park|garden|pitch|golf_course)$/.test(tags.leisure ?? '') || /^(grass|recreation_ground|village_green|forest)$/.test(tags.landuse ?? '') || tags.natural === 'wood') {
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
