import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SPRINGS } from '../config';
import { WORLD_TIMING, cameraAt, cameraPosition, evaluateWorld, type CameraPose } from '../components/world/evaluate';
import { WorldCardView, WorldMeasureView, WorldMeterView, WorldPanelView, WorldReadoutView, WorldStampView } from '../components/world/Hud';
import { WorldNodeView, type WorldPalette } from '../components/world/shapes';
import { Sfx, useCue, useSceneExit, useSceneMotion } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneTitle } from './SceneLayout';
import type { WorldScene } from './types';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Lampu + kabut + lantai; mengikuti titik yang dilihat kamera agar bayangan tetap tajam. */
const Stage: React.FC<{ pose: CameraPose; sky: string; ground: string | null }> = ({ pose, sky, ground }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#ffffff', 2.1);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    return l;
  }, []);
  // Pantulan lingkungan netral: bahan mengilap model `.glb` (cat, krom, kaca) tidak tampak hitam.
  const gl = useThree((s) => s.gl);
  const scene3 = useThree((s) => s.scene);
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene3.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene3.environmentIntensity = 0.55;
    pmrem.dispose();
  }, [gl, scene3]);
  const ext = Math.min(70, Math.max(2.5, pose.distance * 0.75));
  light.position.copy(pose.target).add(new THREE.Vector3(0.55, 1, 0.45).multiplyScalar(ext * 2.2));
  light.target.position.copy(pose.target);
  const cam = light.shadow.camera;
  cam.left = cam.bottom = -ext;
  cam.right = cam.top = ext;
  cam.near = 0.1;
  cam.far = ext * 6;
  cam.updateProjectionMatrix();
  return (
    <>
      <fog attach="fog" args={[sky, pose.distance * 2.2, pose.distance * 7]} />
      <hemisphereLight args={['#ffffff', ground ?? sky, 1.25]} />
      <primitive object={light} />
      <primitive object={light.target} />
      {ground ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[600, 48]} />
          <meshStandardMaterial color={ground} roughness={1} />
        </mesh>
      ) : null}
    </>
  );
};

/**
 * Dunia 3D: objek nyata, kamera terbang antar sudut pandang, tembus pandang, label menempel.
 * Semua keadaan dihitung di luar kanvas dari frame → deterministik.
 */
export const WorldSceneView: React.FC<SceneProps<WorldScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { theme, safe, px, type, space } = useTheme();
  const motion = useSceneMotion();
  const cue = useCue();
  const exit = useSceneExit(0.4);
  const c = theme.colors;
  const dark = theme.mode === 'dark';
  const sceneSec = motion ? motion.frames / fps : 8;

  const color = (v: string | undefined) => (v && v in c ? c[v as keyof typeof c] : v);
  const pal: WorldPalette = {
    neutral: dark ? '#aeb4bf' : '#b9bec7',
    dark: dark ? '#3b4049' : '#4a4f58',
    light: dark ? '#d5d9e0' : '#eceae4',
    glass: dark ? '#1c2533' : '#2b3442',
    road: dark ? '#2a2d33' : '#8d9198',
    primary: c.primary,
    accent: c.accent,
    danger: c.danger,
    success: c.success,
    warning: '#f2c14e',
  };
  const sky = color(scene.sky) ?? c.background;
  const groundSetting = scene.ground ?? true;
  const ground = groundSetting === false ? null : groundSetting === true ? (dark ? '#14171c' : '#dedbd3') : (color(groundSetting) ?? null);

  const at = (f: number) => {
    const t = f / fps;
    const positions = new Map<string, THREE.Vector3>();
    const abs = ((motion?.from ?? 0) + f) / fps;
    const nodes = evaluateWorld(scene.objects, t, abs, cue, color, positions);
    const pose = cameraAt(scene.shots, scene.views ?? {}, t, sceneSec, cue, positions, abs);
    return { t, nodes, positions, pose };
  };
  const now = at(frame);
  const { t, nodes, positions, pose } = now;

  // Kamera dibuat sekali dan digerakkan sebelum kanvas menggambar (dipakai juga untuk proyeksi label).
  const camera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(32, 1, 0.05, 2000);
    (cam as THREE.PerspectiveCamera & { manual?: boolean }).manual = true;
    return cam;
  }, []);
  const hasTop = Boolean(scene.title || scene.eyebrow || scene.cards?.length || scene.readout || scene.meters?.length || scene.panel);
  camera.fov = pose.fov;
  camera.aspect = W / H;
  camera.near = Math.max(0.02, pose.distance * 0.02);
  camera.far = pose.distance * 40 + 200;
  // Titik fokus sedikit di bawah tengah bila ada judul/kartu di atas.
  camera.setViewOffset(W, H, 0, hasTop ? -H * 0.06 : 0, W, H);
  camera.position.copy(cameraPosition(pose));
  camera.lookAt(pose.target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

  // Blur gerak murah: sebanding kecepatan kamera.
  const prev = at(Math.max(0, frame - 1)).pose;
  const speed = (cameraPosition(prev).distanceTo(camera.position) + prev.target.distanceTo(pose.target)) / Math.max(0.05, pose.distance);
  const blur = Math.min(px(12), speed * px(110));

  const project = (target: string | [number, number, number]) => {
    const p = Array.isArray(target) ? new THREE.Vector3(...target) : positions.get(target)?.clone();
    if (!p) return null;
    p.project(camera);
    return p.z > 1 ? null : { x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H };
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
  const measures = scene.measures ?? [];
  const stampStart = scene.stamp ? cue(scene.stamp.at, 1) : 0;

  const pillH = px(64);
  const lift = px(120);
  return (
    <AbsoluteFill style={{ background: sky }}>
      <AbsoluteFill style={{ filter: blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : undefined, transform: blur > 0.4 ? 'scale(1.03)' : undefined }}>
        <ThreeCanvas width={W} height={H} camera={camera} shadows gl={{ antialias: true }} style={{ width: W, height: H }}>
          <Stage pose={pose} sky={sky} ground={ground} />
          {nodes.map((n) => (
            <WorldNodeView key={n.key} node={n} pal={pal} xray={pose.xray} xrayOpacity={WORLD_TIMING.xrayOpacity} />
          ))}
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Label menempel pada objek */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {labels.map(({ l, i, p, xy }) => {
          if (!xy || p <= 0.01) return null;
          const right = l.side ? l.side === 'right' : xy.x < W * 0.5;
          const col = color(l.color) ?? c.accent;
          const ex = xy.x + (right ? 1 : -1) * px(70) * p;
          const ey = xy.y - lift * p;
          return (
            <g key={i} opacity={Math.min(1, p * 1.5)}>
              <line x1={xy.x} y1={xy.y} x2={ex} y2={ey} stroke={dark ? '#ffffff' : '#111111'} strokeWidth={px(3)} strokeLinecap="round" />
              <circle cx={xy.x} cy={xy.y} r={px(9)} fill={col} stroke={dark ? '#ffffff' : '#111111'} strokeWidth={px(3)} />
            </g>
          );
        })}
      </svg>
      {labels.map(({ l, i, p, xy }) => {
        if (!xy || p <= 0.01) return null;
        const right = l.side ? l.side === 'right' : xy.x < W * 0.5;
        const col = color(l.color) ?? c.accent;
        const x = Math.min(W - safe.x * 0.5, Math.max(safe.x * 0.5, xy.x + (right ? 1 : -1) * px(70)));
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
              padding: `0 ${px(26)}px`,
              display: 'flex',
              alignItems: 'center',
              borderRadius: theme.radius.pill,
              background: col,
              color: new THREE.Color(col).getHSL({ h: 0, s: 0, l: 0 }).l > 0.6 ? '#111111' : '#ffffff',
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.heading,
              fontSize: type.label,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              boxShadow: theme.shadow.card,
            }}
          >
            {l.text}
          </div>
        );
      })}

      {measures.map((m, i) => (
        <WorldMeasureView key={i} measure={m} index={i} exit={exit} project={project} color={color} W={W} H={H} />
      ))}

      {/* Sapuan warna langit di belakang judul agar teks tetap terbaca */}
      {hasTop ? (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky} 0%, ${sky}e6 ${Math.round((safe.top / H) * 100) + 4}%, ${sky}00 ${Math.round((safe.top / H) * 100) + 24}%)` }} />
      ) : null}
      {/* Judul + kartu keterangan */}
      <AbsoluteFill style={{ padding: `${safe.top}px ${safe.x}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: space.sm }}>
        <SceneTitle eyebrow={scene.eyebrow} title={scene.title} highlight={scene.highlight} subtitle={scene.subtitle} align="left" />
        {scene.readout ? <WorldReadoutView readout={scene.readout} sceneSec={sceneSec} exit={exit} /> : null}
        {meters.map((m, i) => (
          <WorldMeterView key={i} meter={m} index={i} exit={exit} color={color} />
        ))}
        {scene.panel ? <WorldPanelView panel={scene.panel} sceneSec={sceneSec} exit={exit} color={color} /> : null}
        {cards.map(({ card, i, p, start, gone }) => (gone ? null : <WorldCardView key={i} card={card} p={p} start={start} color={color} />))}
      </AbsoluteFill>

      {scene.stamp ? <WorldStampView stamp={scene.stamp} exit={exit} project={project} color={color} W={W} H={H} start={stampStart} /> : null}

      {scene.note ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: safe.bottom,
            display: 'flex',
            justifyContent: 'center',
            opacity: interpolate(t, [0.4, 0.9], [0, 0.85], clamp) * (1 - exit),
          }}
        >
          <div
            style={{
              padding: `${px(8)}px ${px(20)}px`,
              borderRadius: px(8),
              background: dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,20,20,0.78)',
              color: '#ffffff',
              fontFamily: theme.fonts.mono,
              fontSize: type.label * 0.75,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {scene.note}
          </div>
        </div>
      ) : null}

      {pose.starts.slice(1).map((s, i) => (
        <Sfx key={`shot-${i}`} name="whooshSoft" at={s} seed={i} category="elements" />
      ))}
      {labels.map(({ i, start }) => (
        <Sfx key={`label-${i}`} name="pop" at={start} seed={i} />
      ))}
      {cards.map(({ i, start }) => (
        <Sfx key={`card-${i}`} name="tick" at={start} seed={i} />
      ))}
      {scene.panel && cue(scene.panel.at, 0.2) >= 0 ? <Sfx name="tick" at={cue(scene.panel.at, 0.2)} seed={9} /> : null}
      {meters.map((m, i) => {
        const start = cue(m.at, 0.3 + i * 0.4);
        return start >= 0 ? <Sfx key={`meter-${i}`} name="tick" at={start} seed={i + 3} /> : null;
      })}
      {measures.map((m, i) => (
        <Sfx key={`measure-${i}`} name="pop" at={cue(m.at, 0.8 + i * 0.4)} seed={i + 5} />
      ))}
      {scene.stamp && stampStart >= 0 ? <Sfx name="impact" at={stampStart} /> : null}
    </AbsoluteFill>
  );
};
