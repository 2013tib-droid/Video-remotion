#!/usr/bin/env node
/**
 * Lihat isi file model 3D (.glb) sebelum dipakai di scene `world`:
 *
 *   npm run model -- public/models/mobil.glb
 *
 * Mencetak ukuran file, ekstensi yang dipakai (Draco/KTX2 TIDAK didukung), nama bagian (node) dan
 * material — nama-nama inilah yang dipakai di `parts` (mis. menyembunyikan kap atau menembuskan bodi).
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Pakai: npm run model -- <file.glb>');
  process.exit(1);
}
const buf = readFileSync(file);
if (buf.toString('latin1', 0, 4) !== 'glTF') {
  console.error('Bukan file .glb (glTF biner).');
  process.exit(1);
}
const json = JSON.parse(buf.toString('utf8', 20, 20 + buf.readUInt32LE(12)));
const UNSUPPORTED = ['KHR_draco_mesh_compression', 'KHR_texture_basisu'];
const used = json.extensionsUsed ?? [];
const bad = used.filter((e) => UNSUPPORTED.includes(e));

console.log(`${file}  ${(buf.length / 1048576).toFixed(1)} MB`);
console.log(`Ekstensi: ${used.join(', ') || '-'}`);
if (bad.length) console.log(`✗ TIDAK didukung: ${bad.join(', ')} — ekspor ulang tanpa kompresi itu (mis. gltf-transform).`);

// Kotak pembatas kasar dari min/max POSITION (tanpa transform node).
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const mesh of json.meshes ?? []) {
  for (const prim of mesh.primitives ?? []) {
    const acc = json.accessors?.[prim.attributes?.POSITION];
    if (!acc?.min || !acc?.max) continue;
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], acc.min[i]);
      max[i] = Math.max(max[i], acc.max[i]);
    }
  }
}
if (Number.isFinite(min[0])) console.log(`Ukuran mesh (kasar, satuan model): ${max.map((v, i) => (v - min[i]).toFixed(2)).join(' × ')}`);

const tree = (index, depth) => {
  const node = json.nodes[index];
  const mesh = node.mesh !== undefined ? '  [mesh]' : '';
  console.log(`${'  '.repeat(depth)}- ${node.name ?? `(tanpa nama #${index})`}${mesh}`);
  (node.children ?? []).forEach((c) => tree(c, depth + 1));
};
console.log('\nBagian (node):');
for (const scene of json.scenes ?? []) (scene.nodes ?? []).forEach((n) => tree(n, 1));
console.log('\nMaterial:');
(json.materials ?? []).forEach((m, i) => console.log(`  - ${m.name ?? `(tanpa nama #${i})`}`));
