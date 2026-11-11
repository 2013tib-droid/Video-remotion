import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3, WorldObject } from '../../scenes/types';
import type { WorldNode } from './evaluate';
import { ModelView } from './Model';

/** Warna dunia 3D yang diturunkan dari tema (diisi di luar kanvas — konteks tema tidak menembus kanvas). */
export interface WorldPalette {
  neutral: string;
  dark: string;
  light: string;
  glass: string;
  road: string;
  primary: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
}

interface ShapeProps<S extends WorldObject['shape'] = WorldObject['shape']> {
  o: Extract<WorldObject, { shape: S }>;
  color?: string;
  opacity: number;
  pal: WorldPalette;
  extra: WorldNode['extra'];
}

const HALF = Math.PI / 2;
/** Rotasi agar geometri bersumbu y mengarah ke `axis`. */
const fromY = (axis: 'x' | 'y' | 'z' = 'y'): Vec3 => (axis === 'x' ? [0, 0, -HALF] : axis === 'z' ? [HALF, 0, 0] : [0, 0, 0]);
/** Rotasi agar geometri bersumbu z (hasil extrude) mengarah ke `axis`. */
const fromZ = (axis: 'x' | 'y' | 'z' = 'y'): Vec3 => (axis === 'x' ? [0, HALF, 0] : axis === 'y' ? [-HALF, 0, 0] : [0, 0, 0]);

/** Material matte gaya ilustrasi; `glow` = menyala (lampu). */
const Mat: React.FC<{ color: string; opacity?: number; glow?: number }> = ({ color, opacity = 1, glow = 0 }) => (
  <meshStandardMaterial
    color={color}
    roughness={0.82}
    metalness={0.04}
    transparent={opacity < 0.999}
    opacity={opacity}
    depthWrite={opacity >= 0.999}
    emissive={glow > 0 ? color : '#000000'}
    emissiveIntensity={glow}
  />
);

/** Mesh dengan bayangan (benda tembus pandang tidak membayang). */
const M: React.FC<{
  color: string;
  opacity?: number;
  glow?: number;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
  geometry?: THREE.BufferGeometry;
  children?: React.ReactNode;
}> = ({ color, opacity = 1, glow, children, geometry, ...rest }) => (
  <mesh castShadow={opacity >= 0.999} receiveShadow={opacity >= 0.999} geometry={geometry} {...rest}>
    {children}
    <Mat color={color} opacity={opacity} glow={glow} />
  </mesh>
);

function extrude(points: [number, number][], depth: number, bevel = 0, holes: THREE.Path[] = []): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  shape.holes.push(...holes);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments: 24,
  });
  geo.translate(0, 0, -(depth - bevel * 2) / 2);
  return geo;
}

// ---------- bentuk dasar ----------

const Box: React.FC<ShapeProps<'box'>> = ({ o, color, opacity, pal }) => (
  <M color={color ?? pal.neutral} opacity={opacity}>
    <boxGeometry args={o.size} />
  </M>
);

const Cylinder: React.FC<ShapeProps<'cylinder'>> = ({ o, color, opacity, pal }) => (
  <M color={color ?? pal.neutral} opacity={opacity} rotation={fromY(o.axis)}>
    <cylinderGeometry args={[o.radiusTop ?? o.radius, o.radius, o.height, 40]} />
  </M>
);

const Sphere: React.FC<ShapeProps<'sphere'>> = ({ o, color, opacity, pal }) => (
  <M color={color ?? pal.neutral} opacity={opacity}>
    <sphereGeometry args={[o.radius, 32, 20]} />
  </M>
);

const Cone: React.FC<ShapeProps<'cone'>> = ({ o, color, opacity, pal }) => (
  <M color={color ?? pal.neutral} opacity={opacity} rotation={fromY(o.axis)}>
    <coneGeometry args={[o.radius, o.height, 36]} />
  </M>
);

const Torus: React.FC<ShapeProps<'torus'>> = ({ o, color, opacity, pal }) => (
  <group rotation={fromZ(o.axis)}>
    <M color={color ?? pal.neutral} opacity={opacity}>
      <torusGeometry args={[o.radius, o.tube, 18, 56, ((o.arc ?? 360) * Math.PI) / 180]} />
    </M>
  </group>
);

const curveOf = (path: Vec3[], closed?: boolean) => new THREE.CatmullRomCurve3(path.map((p) => new THREE.Vector3(...p)), closed, 'catmullrom', 0.4);

const Tube: React.FC<ShapeProps<'tube'>> = ({ o, color, opacity, pal }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curveOf(o.path, o.closed), o.path.length * 14, o.radius ?? 0.05, 12, o.closed), [o.path, o.closed, o.radius]);
  return <M color={color ?? pal.neutral} opacity={opacity} geometry={geo} />;
};

const Flow: React.FC<ShapeProps<'flow'>> = ({ o, color, opacity, pal, extra }) => {
  const curve = useMemo(() => curveOf(o.path, o.closed), [o.path, o.closed]);
  const count = o.count ?? 10;
  const phase = extra.phase ?? 0;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const u = (((i / count + phase) % 1) + 1) % 1;
        const p = curve.getPointAt(u);
        // Jalur terbuka: butiran mengecil di ujung agar tidak "meletup" saat berulang.
        const edge = o.closed ? 1 : Math.min(1, u * 8, (1 - u) * 8);
        return (
          <mesh key={i} position={[p.x, p.y, p.z]} scale={edge}>
            <sphereGeometry args={[o.size ?? 0.05, 14, 10]} />
            <Mat color={color ?? pal.danger} opacity={opacity} glow={0.55} />
          </mesh>
        );
      })}
    </>
  );
};

const Gear: React.FC<ShapeProps<'gear'>> = ({ o, color, opacity, pal }) => {
  const teeth = o.teeth ?? 14;
  const thickness = o.thickness ?? o.radius * 0.28;
  const geo = useMemo(() => {
    const pts: [number, number][] = [];
    const root = o.radius * 0.82;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const w = (Math.PI * 2) / teeth;
      for (const [f, r] of [[0, root], [0.18, o.radius], [0.5, o.radius], [0.68, root]] as const) {
        pts.push([Math.cos(a + w * f) * r, Math.sin(a + w * f) * r]);
      }
    }
    const hole = new THREE.Path().absarc(0, 0, o.radius * 0.24, 0, Math.PI * 2, true);
    return extrude(pts, thickness, thickness * 0.08, [hole]);
  }, [o.radius, teeth, thickness]);
  return (
    <group rotation={fromZ(o.axis)}>
      <M color={color ?? pal.neutral} opacity={opacity} geometry={geo} />
    </group>
  );
};

const Fan: React.FC<ShapeProps<'fan'>> = ({ o, color, opacity, pal }) => {
  const blades = o.blades ?? 8;
  const r = o.radius;
  return (
    <group rotation={fromY(o.axis)}>
      <M color={pal.dark} opacity={opacity}>
        <cylinderGeometry args={[r * 0.22, r * 0.22, r * 0.34, 28]} />
      </M>
      {Array.from({ length: blades }, (_, i) => (
        <group key={i} rotation={[0, (i / blades) * Math.PI * 2, 0]}>
          <M color={color ?? pal.primary} opacity={opacity} position={[r * 0.6, 0, 0]} rotation={[0.6, 0, 0]}>
            <boxGeometry args={[r * 0.8, r * 0.03, r * 0.3]} />
          </M>
        </group>
      ))}
      <M color={color ?? pal.primary} opacity={opacity * 0.9} rotation={[HALF, 0, 0]}>
        <torusGeometry args={[r, r * 0.035, 10, 48]} />
      </M>
    </group>
  );
};

// ---------- objek jadi (ukuran nyata, meter) ----------

const Car: React.FC<ShapeProps<'car'>> = ({ o, color, opacity, pal }) => {
  const sedan = o.variant === 'sedan';
  const roof = sedan ? 1.42 : 1.64;
  const geo = useMemo(() => {
    const belt = 1.0;
    // Profil samping: x = panjang (depan +), y = tinggi.
    const body: [number, number][] = sedan
      ? [[-2.2, 0.42], [-2.22, 0.86], [-1.9, belt], [0.95, belt], [2.0, 0.84], [2.22, 0.7], [2.2, 0.42], [2.0, 0.34], [-2.05, 0.34]]
      : [[-2.18, 0.42], [-2.2, 0.98], [-2.05, belt + 0.03], [0.95, belt + 0.03], [2.0, 0.88], [2.22, 0.72], [2.2, 0.42], [2.0, 0.34], [-2.05, 0.34]];
    const cabin: [number, number][] = sedan
      ? [[-1.75, belt], [-1.15, roof - 0.06], [0.05, roof - 0.06], [0.95, belt]]
      : [[-2.08, belt], [-1.92, roof - 0.07], [0.15, roof - 0.07], [1.05, belt]];
    const top: [number, number][] = sedan
      ? [[-1.2, roof - 0.07], [-1.05, roof], [0.0, roof], [0.12, roof - 0.07]]
      : [[-1.97, roof - 0.08], [-1.85, roof], [0.1, roof], [0.24, roof - 0.08]];
    return { body: extrude(body, 1.8, 0.07), cabin: extrude(cabin, 1.62, 0.04), top: extrude(top, 1.6, 0.04) };
  }, [sedan, roof]);
  const paint = color ?? pal.neutral;
  const wheels: Vec3[] = [[1.38, 0.34, 0.82], [1.38, 0.34, -0.82], [-1.38, 0.34, 0.82], [-1.38, 0.34, -0.82]];
  // Geometri dibangun memanjang sumbu x; putar agar depan mobil = +z.
  return (
    <group rotation={[0, -HALF, 0]}>
      <M color={paint} opacity={opacity} geometry={geo.body} />
      <M color={pal.glass} opacity={opacity} geometry={geo.cabin} />
      <M color={paint} opacity={opacity} geometry={geo.top} />
      {/* Pilar & garis pinggang: memecah kaca jadi jendela */}
      {(sedan ? [-0.55] : [-1.25, -0.45]).map((x) => (
        <M key={x} color={paint} opacity={opacity} position={[x, (1.0 + roof) / 2, 0]}>
          <boxGeometry args={[0.09, roof - 1.0, 1.66]} />
        </M>
      ))}
      <M color="#1d1f24" opacity={opacity} position={[0, 0.4, 0]}>
        <boxGeometry args={[4.3, 0.12, 1.84]} />
      </M>
      {[1, -1].map((z) => (
        <M key={z} color="#1d1f24" opacity={opacity} position={[0.72, 1.08, z * 0.95]}>
          <boxGeometry args={[0.16, 0.1, 0.2]} />
        </M>
      ))}
      {wheels.map((p, i) => (
        <group key={i} position={p}>
          <M color="#1d1f24" opacity={Math.max(opacity, 0.5)} rotation={[HALF, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.26, 28]} />
          </M>
          <M color={pal.light} opacity={Math.max(opacity, 0.5)} rotation={[HALF, 0, 0]} position={[0, 0, p[2] > 0 ? 0.11 : -0.11]}>
            <cylinderGeometry args={[0.19, 0.19, 0.06, 20]} />
          </M>
        </group>
      ))}
      {[0.62, -0.62].map((z) => (
        <React.Fragment key={z}>
          <M color="#fff6d8" opacity={opacity} glow={0.5} position={[2.19, 0.74, z]}>
            <boxGeometry args={[0.08, 0.14, 0.42]} />
          </M>
          <M color={pal.danger} opacity={opacity} glow={o.brake ? 1.6 : 0.25} position={[-2.19, 0.86, z]}>
            <boxGeometry args={[0.08, 0.18, 0.4]} />
          </M>
        </React.Fragment>
      ))}
      <M color="#1d1f24" opacity={opacity} position={[2.2, 0.5, 0]}>
        <boxGeometry args={[0.07, 0.2, 1.1]} />
      </M>
      <M color="#f4f4f4" opacity={opacity} position={[-2.2, 0.56, 0]}>
        <boxGeometry args={[0.05, 0.14, 0.5]} />
      </M>
    </group>
  );
};

const Road: React.FC<ShapeProps<'road'>> = ({ o, color, opacity, pal }) => {
  const lanes = o.lanes ?? 2;
  const lw = o.laneWidth ?? 3.4;
  const w = lanes * lw;
  const L = o.length;
  const dashes = Math.floor(L / 6);
  const blocks = Math.min(80, Math.floor(L / 1.5));
  const bl = L / blocks;
  return (
    <group>
      <M color={color ?? pal.road} opacity={opacity} position={[0, 0.01, 0]}>
        <boxGeometry args={[w, 0.04, L]} />
      </M>
      {Array.from({ length: lanes - 1 }, (_, l) =>
        Array.from({ length: dashes }, (_, i) => (
          <M key={`${l}-${i}`} color="#f2f2f2" opacity={opacity} position={[-w / 2 + (l + 1) * lw, 0.035, -L / 2 + 3 + i * 6]}>
            <boxGeometry args={[0.14, 0.01, 2.6]} />
          </M>
        )),
      )}
      {(o.curb ?? true)
        ? [-1, 1].map((side) => (
            <React.Fragment key={side}>
              <M color={pal.light} opacity={opacity} position={[side * (w / 2 + 1.5), 0.09, 0]}>
                <boxGeometry args={[2.6, 0.18, L]} />
              </M>
              {Array.from({ length: blocks }, (_, i) => (
                <M key={i} color={i % 2 ? '#f4f4f4' : '#24262b'} opacity={opacity} position={[side * (w / 2 + 0.1), 0.1, -L / 2 + bl / 2 + i * bl]}>
                  <boxGeometry args={[0.24, 0.2, bl]} />
                </M>
              ))}
            </React.Fragment>
          ))
        : null}
    </group>
  );
};

const TrafficLight: React.FC<ShapeProps<'trafficLight'>> = ({ color, opacity, pal, extra }) => {
  const lamps = [
    { name: 'red', c: pal.danger, y: 5.0 },
    { name: 'yellow', c: pal.warning, y: 4.6 },
    { name: 'green', c: pal.success, y: 4.2 },
  ];
  return (
    <group>
      <M color={color ?? pal.dark} opacity={opacity} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 5, 16]} />
      </M>
      <M color={pal.dark} opacity={opacity} position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.16, 20]} />
      </M>
      <M color="#1d1f24" opacity={opacity} position={[0, 4.6, 0.06]}>
        <boxGeometry args={[0.46, 1.34, 0.34]} />
      </M>
      {lamps.map((l) => {
        const on = extra.light === l.name;
        return (
          <mesh key={l.name} position={[0, l.y, 0.22]}>
            <sphereGeometry args={[0.15, 20, 14]} />
            <Mat color={on ? l.c : '#3a3d44'} opacity={opacity} glow={on ? 1.8 : 0} />
          </mesh>
        );
      })}
    </group>
  );
};

const Building: React.FC<ShapeProps<'building'>> = ({ o, color, opacity, pal }) => {
  const [w, h, d] = o.size;
  const floors = Math.min(10, Math.max(1, Math.floor(h / 3.2)));
  const grid = (span: number) => Math.min(6, Math.max(1, Math.floor(span / 2.6)));
  const faces: { n: number; span: number; place: (u: number, y: number) => Vec3; size: Vec3 }[] = [
    { n: grid(w), span: w, place: (u, y) => [u, y, d / 2], size: [1.3, 1.5, 0.08] },
    { n: grid(w), span: w, place: (u, y) => [u, y, -d / 2], size: [1.3, 1.5, 0.08] },
    { n: grid(d), span: d, place: (u, y) => [w / 2, y, u], size: [0.08, 1.5, 1.3] },
    { n: grid(d), span: d, place: (u, y) => [-w / 2, y, u], size: [0.08, 1.5, 1.3] },
  ];
  return (
    <group>
      <M color={color ?? pal.light} opacity={opacity} position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
      </M>
      <M color={pal.dark} opacity={opacity} position={[0, h + 0.12, 0]}>
        <boxGeometry args={[w + 0.3, 0.24, d + 0.3]} />
      </M>
      {faces.map((f, k) =>
        Array.from({ length: floors }, (_, r) =>
          Array.from({ length: f.n }, (_, c) => (
            <M key={`${k}-${r}-${c}`} color={pal.glass} opacity={opacity} position={f.place(-f.span / 2 + (f.span / f.n) * (c + 0.5), (h / floors) * (r + 0.55))}>
              <boxGeometry args={f.size} />
            </M>
          )),
        ),
      )}
    </group>
  );
};

const House: React.FC<ShapeProps<'house'>> = ({ color, opacity, pal }) => {
  const roof = useMemo(() => extrude([[-3.4, 0], [0, 2.1], [3.4, 0]], 5.6, 0.03), []);
  return (
    <group>
      <M color={color ?? pal.light} opacity={opacity} position={[0, 1.5, 0]}>
        <boxGeometry args={[6, 3, 5]} />
      </M>
      <M color={pal.danger} opacity={opacity} position={[0, 3, 0]} geometry={roof} />
      <M color={pal.dark} opacity={opacity} position={[0, 1.05, 2.52]}>
        <boxGeometry args={[1.1, 2.1, 0.08]} />
      </M>
      {[-1.9, 1.9].map((x) => (
        <M key={x} color={pal.glass} opacity={opacity} position={[x, 1.7, 2.52]}>
          <boxGeometry args={[1.2, 1.1, 0.08]} />
        </M>
      ))}
    </group>
  );
};

const Tree: React.FC<ShapeProps<'tree'>> = ({ color, opacity, pal }) => (
  <group>
    <M color="#7a5a40" opacity={opacity} position={[0, 1, 0]}>
      <cylinderGeometry args={[0.14, 0.2, 2, 12]} />
    </M>
    <M color={color ?? pal.success} opacity={opacity} position={[0, 2.7, 0]}>
      <sphereGeometry args={[1.15, 20, 14]} />
    </M>
    <M color={color ?? pal.success} opacity={opacity} position={[0.35, 3.6, 0.1]}>
      <sphereGeometry args={[0.8, 18, 12]} />
    </M>
  </group>
);

const Person: React.FC<ShapeProps<'person'>> = ({ color, opacity, pal }) => (
  <group>
    {[-0.11, 0.11].map((x) => (
      <M key={x} color={pal.dark} opacity={opacity} position={[x, 0.42, 0]}>
        <capsuleGeometry args={[0.09, 0.66, 6, 12]} />
      </M>
    ))}
    <M color={color ?? pal.primary} opacity={opacity} position={[0, 1.13, 0]}>
      <capsuleGeometry args={[0.21, 0.42, 6, 16]} />
    </M>
    <M color="#e3b58f" opacity={opacity} position={[0, 1.62, 0]}>
      <sphereGeometry args={[0.15, 20, 14]} />
    </M>
  </group>
);

const Coins: React.FC<ShapeProps<'coins'>> = ({ o, color, opacity, pal }) => (
  <group>
    {Array.from({ length: o.count ?? 5 }, (_, i) => (
      <M key={i} color={color ?? pal.warning} opacity={opacity} position={[Math.sin(i * 2.4) * 0.03, 0.06 + i * 0.125, Math.cos(i * 1.7) * 0.03]}>
        <cylinderGeometry args={[0.5, 0.5, 0.11, 36]} />
      </M>
    ))}
  </group>
);

const SHAPES: { [S in WorldObject['shape']]: React.FC<ShapeProps<S>> | null } = {
  group: null,
  box: Box,
  cylinder: Cylinder,
  sphere: Sphere,
  cone: Cone,
  torus: Torus,
  tube: Tube,
  flow: Flow,
  gear: Gear,
  fan: Fan,
  car: Car,
  road: Road,
  trafficLight: TrafficLight,
  building: Building,
  house: House,
  tree: Tree,
  person: Person,
  coins: Coins,
  // Model `.glb` dirender langsung di WorldNodeView (butuh nilai xray mentah).
  model: null,
};

/** Satu objek + anak-anaknya. `xray` hanya menembuskan badan objek itu sendiri, bukan anaknya. */
export const WorldNodeView: React.FC<{ node: WorldNode; pal: WorldPalette; xray: Record<string, number>; xrayOpacity: number }> = ({
  node,
  pal,
  xray,
  xrayOpacity,
}) => {
  const Shape = SHAPES[node.object.shape] as React.FC<ShapeProps> | null;
  const x = node.id ? (xray[node.id] ?? 0) : 0;
  const opacity = node.opacity * (1 + (xrayOpacity - 1) * x);
  return (
    <group position={node.position} rotation={node.rotation} scale={node.scale}>
      {node.object.shape === 'model' ? (
        <ModelView
          src={node.object.src}
          size={node.object.size}
          ground={node.object.ground}
          opacity={node.opacity}
          xray={x}
          xrayOpacity={xrayOpacity}
          parts={node.extra.parts ?? []}
        />
      ) : null}
      {Shape ? <Shape o={node.object} color={node.color} opacity={opacity} pal={pal} extra={node.extra} /> : null}
      {node.children.map((c) => (
        <WorldNodeView key={c.key} node={c} pal={pal} xray={xray} xrayOpacity={xrayOpacity} />
      ))}
    </group>
  );
};
