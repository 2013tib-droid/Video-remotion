import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { cancelRender, continueRender, delayRender } from 'remotion';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { resolveSrc } from '../assets';
import type { WorldPartState } from './evaluate';

/** Satu file dimuat sekali untuk semua objek & frame. */
const cache = new Map<string, Promise<GLTF>>();
function loadModel(src: string): Promise<GLTF> {
  let p = cache.get(src);
  if (!p) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    p = loader.loadAsync(resolveSrc(src));
    cache.set(src, p);
  }
  return p;
}

/** Cocokkan nama dengan pola ber-`*` (tanpa membedakan huruf besar; spasi = garis bawah). */
function matcher(pattern: string): (name: string) => boolean {
  const norm = (v: string) => v.toLowerCase().replace(/[\s_]+/g, '_');
  const re = new RegExp(`^${norm(pattern).split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
  return (name) => re.test(norm(name));
}

type Mat = THREE.MeshStandardMaterial & { transmission?: number };
interface Base {
  color: THREE.Color;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}
interface Rest {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
}
const nodeName = (o: THREE.Object3D) => (typeof o.userData.name === 'string' ? o.userData.name : o.name);

/**
 * Model `.glb`: disalin per objek (bahan sendiri), dinormalkan ke meter, lalu tiap frame bagian-bagiannya
 * diatur dari `parts` (warna, opasitas, gerak) — semuanya deterministik dari keadaan yang dihitung di luar.
 */
export const ModelView: React.FC<{
  src: string;
  size?: number;
  ground?: boolean;
  opacity: number;
  /** 0..1: seberapa tembus pandang (bagian `solid` tidak ikut). */
  xray: number;
  xrayOpacity: number;
  parts: WorldPartState[];
}> = ({ src, size, ground = true, opacity, xray, xrayOpacity, parts }) => {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [handle] = useState(() => delayRender(`Memuat model ${src}`, { timeoutInMilliseconds: 120000 }));
  useEffect(() => {
    let alive = true;
    loadModel(src)
      .then((g) => {
        if (alive) setGltf(g);
        else continueRender(handle);
      })
      .catch((err) => cancelRender(new Error(`[world] gagal memuat model "${src}": ${err instanceof Error ? err.message : err}`)));
    return () => {
      alive = false;
    };
  }, [src, handle]);

  const model = useMemo(() => {
    if (!gltf) return null;
    const root = gltf.scene.clone(true);
    const meshes: { mesh: THREE.Mesh; mats: Mat[]; names: string[] }[] = [];
    const nodes: { node: THREE.Object3D; rest: Rest }[] = [];
    root.traverse((o) => {
      nodes.push({ node: o, rest: { position: o.position.clone(), quaternion: o.quaternion.clone(), scale: o.scale.clone() } });
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const list = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((m) => {
        const mat = m.clone() as Mat;
        // Kaca "transmission" butuh pass render tambahan → ganti transparansi biasa (lebih ringan & stabil).
        if (mat.transmission && mat.transmission > 0) {
          mat.transmission = 0;
          mat.transparent = true;
          mat.opacity = Math.min(mat.opacity, 0.32);
          mat.depthWrite = false;
        }
        mat.userData.base = { color: mat.color.clone(), opacity: mat.opacity, transparent: mat.transparent, depthWrite: mat.depthWrite } satisfies Base;
        return mat;
      });
      mesh.material = Array.isArray(mesh.material) ? list : list[0];
      const names: string[] = [];
      for (let a: THREE.Object3D | null = mesh; a && a !== root.parent; a = a.parent) names.push(nodeName(a));
      meshes.push({ mesh, mats: list, names });
    });
    // Normalkan: sisi terpanjang = `size` meter, tengah di x/z, alas di y = 0.
    const box = new THREE.Box3().setFromObject(root);
    const dim = box.getSize(new THREE.Vector3());
    const k = size ? size / Math.max(dim.x, dim.y, dim.z, 1e-6) : 1;
    const center = box.getCenter(new THREE.Vector3());
    const holder = new THREE.Group();
    holder.add(root);
    holder.scale.setScalar(k);
    if (ground) holder.position.set(-center.x * k, -box.min.y * k, -center.z * k);
    return { holder, meshes, nodes };
  }, [gltf, size, ground]);

  // Saat render, kanvas hanya menggambar ketika frame berganti: gambar ulang setelah model terpasang, baru lanjutkan.
  const advance = useThree((s) => s.advance);
  useLayoutEffect(() => {
    if (!model) return;
    advance(performance.now());
    continueRender(handle);
  }, [model, advance, handle]);

  const matchers = useMemo(
    () => parts.map(({ part }) => ({ name: part.name ? matcher(part.name) : null, material: part.material ? matcher(part.material) : null })),
    // Pola hanya bergantung pada daftar `parts` di config (stabil antar frame).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parts.map(({ part }) => `${part.name}|${part.material}`).join(',')],
  );

  if (!model) return null;

  // Gerak bagian: kembali ke posisi asli lalu terapkan geser/putar/skala frame ini.
  for (const { node, rest } of model.nodes) {
    node.position.copy(rest.position);
    node.quaternion.copy(rest.quaternion);
    node.scale.copy(rest.scale);
    parts.forEach((state, i) => {
      const m = matchers[i];
      if (!m.name || m.material || !m.name(nodeName(node))) return;
      node.position.add(new THREE.Vector3(...state.offset));
      node.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...state.rotation)));
      node.scale.multiplyScalar(state.scale);
    });
  }

  // Bahan: warna/opasitas dari entri `parts` terakhir yang cocok, lalu tembus pandang (kecuali `solid`).
  for (const { mesh, mats, names } of model.meshes) {
    for (const mat of mats) {
      const base = mat.userData.base as Base;
      let color: string | undefined;
      let alpha = 1;
      let solid = false;
      parts.forEach((state, i) => {
        const m = matchers[i];
        const hit = (!m.name || names.some(m.name)) && (!m.material || m.material(mat.name)) && Boolean(m.name || m.material);
        if (!hit) return;
        if (state.color) color = state.color;
        alpha = state.opacity;
        if (state.part.solid !== undefined) solid = state.part.solid;
      });
      const a = base.opacity * opacity * alpha * (solid ? 1 : 1 + (xrayOpacity - 1) * xray);
      const full = a >= base.opacity - 0.001 && !base.transparent;
      mat.opacity = a;
      mat.transparent = !full;
      mat.depthWrite = full ? base.depthWrite : a > 0.6 && base.depthWrite;
      if (color) mat.color.set(color);
      else mat.color.copy(base.color);
      mesh.visible = a > 0.004;
      mesh.castShadow = a > 0.6;
    }
  }
  return <primitive object={model.holder} />;
};
