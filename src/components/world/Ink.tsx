import React, { createContext, useContext, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * GAYA TINTA (komik/ilustrasi) untuk dunia 3D — `style: 'ink'` di scene `world`.
 *
 * 1. Bahan benda jadi `MeshToonMaterial` (warna rata 3 tingkat) lewat `useInk()` di `shapes.tsx`.
 * 2. `InkPass`: setelah gambar biasa, dunia digambar sekali lagi ke tekstur (normal + kedalaman), lalu satu
 *    lapisan layar penuh menggambar garis tinta di tempat kedalaman melompat (siluet) atau arah permukaan
 *    berbelok tajam (lipatan). Berlaku untuk semua benda, termasuk model `.glb`, tanpa mengubah geometrinya.
 *    Gambar warna tetap antialias; garis tinta dihaluskan sendiri.
 */

export interface InkSettings {
  color: string;
  /** Tebal garis dalam px pada lebar 1080. */
  width: number;
}

/** Intensitas cahaya gaya tinta (dibagi π oleh bahan Lambert): langit merata 0,62 + matahari 0,38. */
export const INK_LIGHT = { hemisphere: 0.62 * Math.PI, sun: 0.38 * Math.PI } as const;

const InkContext = createContext<InkSettings | null>(null);
export const InkProvider = InkContext.Provider;
export const useInk = () => useContext(InkContext);

/**
 * Peta gradasi toon (koordinat = dot(normal, arah matahari) × 0,5 + 0,5). Dengan cahaya `INK_LIGHT`:
 * atap ≈ 100 % warna asli, dinding menghadap matahari ≈ 90 %, dinding teduh ≈ 77 %, bayangan jatuh ≈ 62 %.
 */
let gradient: THREE.DataTexture | null = null;
export function toonGradient(): THREE.DataTexture {
  if (!gradient) {
    gradient = new THREE.DataTexture(new Uint8Array([77, 102, 140, 191, 255]), 5, 1, THREE.RedFormat);
    gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
#include <packing>
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 res;
uniform float off;
uniform float cNear;
uniform float cFar;
uniform float fogNear;
uniform float fogFar;
uniform vec3 ink;
varying vec2 vUv;

float dist(vec2 uv) {
  float d = texture2D(tDepth, uv).x;
  return d >= 0.99999 ? cFar : -perspectiveDepthToViewZ(d, cNear, cFar);
}
vec3 nrm(vec2 uv) { return normalize(texture2D(tNormal, uv).xyz * 2.0 - 1.0); }

void main() {
  vec2 dx = vec2(off / res.x, 0.0);
  vec2 dy = vec2(0.0, off / res.y);
  float c = dist(vUv);
  float l = dist(vUv - dx), r = dist(vUv + dx), u = dist(vUv + dy), b = dist(vUv - dy);
  float near = min(c, min(min(l, r), min(u, b)));
  if (near >= cFar * 0.999) { gl_FragColor = vec4(0.0); return; }

  // Kebalikan jarak berubah LINEAR di layar untuk bidang datar → laplacian ±0 di bidang miring (lantai),
  // besar di siluet. Dibagi kebalikan jarak terdekat agar tak bergantung jarak kamera.
  float ic = 1.0 / c;
  float lap = abs(1.0 / l + 1.0 / r - 2.0 * ic) + abs(1.0 / u + 1.0 / b - 2.0 * ic);
  float depthEdge = smoothstep(0.035, 0.09, lap * near);

  // Lipatan: arah permukaan tetangga berbeda tajam (hanya antar piksel yang sama-sama berisi benda).
  vec3 nc = nrm(vUv);
  float bend = 0.0;
  if (l < cFar * 0.999) bend = max(bend, 1.0 - dot(nc, nrm(vUv - dx)));
  if (r < cFar * 0.999) bend = max(bend, 1.0 - dot(nc, nrm(vUv + dx)));
  if (u < cFar * 0.999) bend = max(bend, 1.0 - dot(nc, nrm(vUv + dy)));
  if (b < cFar * 0.999) bend = max(bend, 1.0 - dot(nc, nrm(vUv - dy)));
  float creaseEdge = smoothstep(0.12, 0.3, bend);

  float edge = max(depthEdge, creaseEdge);
  float fog = smoothstep(fogNear, fogFar, near);
  gl_FragColor = vec4(ink, edge * (1.0 - fog) * 0.95);
}
`;

/** Lapisan garis tinta. Taruh sebagai anak `ThreeCanvas`; mengambil alih langkah gambar (prioritas 1). */
export const InkPass: React.FC<{ settings: InkSettings; fog: [number, number] }> = ({ settings, fog }) => {
  const gl = useThree((s) => s.gl);

  const parts = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.UnsignedByteType });
    target.depthTexture = new THREE.DepthTexture(4, 4, THREE.UnsignedIntType);
    const normalMat = new THREE.MeshNormalMaterial();
    const inkColor = new THREE.Color(settings.color);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tNormal: { value: target.texture },
        tDepth: { value: target.depthTexture },
        res: { value: new THREE.Vector2(1, 1) },
        off: { value: 1 },
        cNear: { value: 0.1 },
        cFar: { value: 1000 },
        fogNear: { value: 100 },
        fogFar: { value: 1000 },
        // Ditulis langsung ke kanvas (sRGB) tanpa konversi.
        ink: { value: new THREE.Vector3(...inkColor.clone().convertLinearToSRGB().toArray()) },
      },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const quadScene = new THREE.Scene();
    quadScene.add(quad);
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { target, normalMat, material, quadScene, quadCam };
  }, [settings.color]);

  useEffect(
    () => () => {
      parts.target.dispose();
      parts.material.dispose();
      parts.normalMat.dispose();
    },
    [parts],
  );

  useFrame(({ scene, camera }) => {
    // 1. Gambar biasa (antialias) ke kanvas.
    gl.setRenderTarget(null);
    gl.render(scene, camera);

    // 2. Normal + kedalaman ke tekstur. Benda tembus pandang (xray) tidak bertinta.
    const size = gl.getDrawingBufferSize(new THREE.Vector2());
    if (parts.target.width !== size.x || parts.target.height !== size.y) parts.target.setSize(size.x, size.y);
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!o.visible || !m) return;
      if (o.userData.noInk) {
        o.visible = false;
        hidden.push(o);
        return;
      }
      const first = Array.isArray(m) ? m[0] : m;
      if (first && first.transparent && first.opacity < 0.6) {
        o.visible = false;
        hidden.push(o);
      }
    });
    const prevOverride = scene.overrideMaterial;
    const prevShadow = gl.shadowMap.autoUpdate;
    const prevClear = gl.getClearColor(new THREE.Color());
    const prevAlpha = gl.getClearAlpha();
    scene.overrideMaterial = parts.normalMat;
    gl.shadowMap.autoUpdate = false;
    gl.setClearColor(0x8080ff, 1);
    gl.setRenderTarget(parts.target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(prevClear, prevAlpha);
    gl.shadowMap.autoUpdate = prevShadow;
    scene.overrideMaterial = prevOverride;
    for (const o of hidden) o.visible = true;

    // 3. Garis tinta di atas gambar.
    const cam = camera as THREE.PerspectiveCamera;
    const u = parts.material.uniforms;
    u.res.value.set(size.x, size.y);
    u.off.value = Math.max(0.75, (settings.width * size.x) / 1080 / 2);
    u.cNear.value = cam.near;
    u.cFar.value = cam.far;
    u.fogNear.value = fog[0];
    u.fogFar.value = fog[1];
    const auto = gl.autoClear;
    gl.autoClear = false;
    gl.render(parts.quadScene, parts.quadCam);
    gl.autoClear = auto;
  }, 1);

  return null;
};
