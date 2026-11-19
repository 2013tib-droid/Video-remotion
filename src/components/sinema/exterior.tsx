import React from 'react';
import { CloudDefs, Cloud, Dust, Flare, GodRays, SkyFill } from './atmos';
import { Birds, LampuJalan, Motor, Orang, Palem, Pohon } from './figures';
import { BlurFilter, Glow, Lapis, PALETTES, W, mix, ramp, rand, useShot, type Palette } from './util';

/* ------------------------------------------------------------------ */
/*  Masjid                                                             */
/* ------------------------------------------------------------------ */

/** Kubah bawang dengan alas di (cx, y) dan jari-jari r. */
const dome = (cx: number, y: number, r: number) =>
  `M ${cx - r} ${y} C ${cx - r * 1.12} ${y - r * 0.7} ${cx - r * 0.7} ${y - r * 1.12} ${cx} ${y - r * 1.68} C ${cx + r * 0.7} ${y - r * 1.12} ${cx + r * 1.12} ${y - r * 0.7} ${cx + r} ${y} Z`;
/** Bulan sabit di (cx, cy). */
const crescent = (cx: number, cy: number, r: number) =>
  `M ${cx + r * 0.4} ${cy - r} A ${r} ${r} 0 1 0 ${cx + r * 0.4} ${cy + r} A ${r * 0.74} ${r * 0.74} 0 1 1 ${cx + r * 0.4} ${cy - r} Z`;
/** Jendela lengkung. */
const archWin = (x: number, y: number, w: number, h: number) =>
  `M ${x} ${y + h} L ${x} ${y + w * 0.55} Q ${x} ${y} ${x + w / 2} ${y - w * 0.25} Q ${x + w} ${y} ${x + w} ${y + w * 0.55} L ${x + w} ${y + h} Z`;

function Minaret({ x, base, top, w = 40 }: { x: number; base: number; top: number; w?: number }) {
  const b1 = base - (base - top) * 0.62;
  return (
    <>
      <path d={`M ${x - w / 2} ${base} L ${x + w / 2} ${base} L ${x + w / 2 - 4} ${top} L ${x - w / 2 + 4} ${top} Z`} />
      <rect x={x - w / 2 - 12} y={b1} width={w + 24} height={10} rx={3} />
      <rect x={x - w / 2 - 6} y={b1 - 20} width={w + 12} height={20} />
      <rect x={x - w / 2 - 14} y={top} width={w + 28} height={11} rx={3} />
      <rect x={x - w / 2 - 6} y={top - 26} width={w + 12} height={26} />
      <rect x={x - w / 2 + 2} y={top - 70} width={w - 4} height={46} />
      <path d={dome(x, top - 68, w / 2 + 4)} />
      <rect x={x - 2} y={top - 68 - (w / 2 + 4) * 1.68 - 34} width={4} height={36} />
      <path d={crescent(x, top - 68 - (w / 2 + 4) * 1.68 - 44, 9)} />
    </>
  );
}

/** Siluet masjid (kubah besar, dua menara, kubah sudut) — tanpa jendela. */
function MasjidShape() {
  return (
    <>
      <rect x={300} y={1308} width={480} height={16} rx={4} />
      <rect x={318} y={1318} width={444} height={190} />
      <rect x={445} y={1250} width={190} height={72} />
      <rect x={432} y={1244} width={216} height={12} rx={4} />
      <path d={dome(540, 1250, 122)} />
      <rect x={537} y={1250 - 122 * 1.68 - 52} width={6} height={56} />
      <circle cx={540} cy={1250 - 122 * 1.68 - 6} r={8} />
      <path d={crescent(540, 1250 - 122 * 1.68 - 66, 15)} />
      <path d={dome(352, 1310, 34)} />
      <rect x={350} y={1310 - 34 * 1.68 - 22} width={4} height={24} />
      <path d={dome(728, 1310, 34)} />
      <rect x={726} y={1310 - 34 * 1.68 - 22} width={4} height={24} />
      <Minaret x={238} base={1508} top={1010} />
      <Minaret x={842} base={1508} top={1068} w={36} />
      {/* Serambi depan berlengkung */}
      <rect x={380} y={1420} width={320} height={88} />
      <path d="M 372 1424 L 708 1424 L 690 1400 L 390 1400 Z" />
    </>
  );
}

function MasjidWindows({ color }: { color: string }) {
  const wins = [340, 395, 645, 700].map((x) => archWin(x, 1350, 30, 54));
  const porch = [404, 468, 532, 596, 660].map((x) => archWin(x, 1446, 38, 62));
  const drum = [470, 512, 554, 596].map((x) => archWin(x, 1268, 14, 34));
  return (
    <g fill={color}>
      {[...wins, ...drum].map((d, i) => (
        <path key={i} d={d} opacity={0.9} />
      ))}
      {porch.map((d, i) => (
        <path key={`p${i}`} d={d} opacity={i === 2 ? 1 : 0.75} />
      ))}
    </g>
  );
}

/** Masjid utuh: halo cahaya di belakang, siluet bergradien, jendela menyala. */
export const Masjid: React.FC<{ p: Palette; lights?: number }> = ({ p, lights = 1 }) => {
  const id = `msj-${p.near.slice(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0.8" y1="0" x2="0.2" y2="1">
          <stop offset={0} stopColor={mix(p.mid, p.glow, 0.18)} />
          <stop offset={0.45} stopColor={p.mid} />
          <stop offset={1} stopColor={p.near} />
        </linearGradient>
        <BlurFilter id={`${id}-halo`} sd={9} />
        <BlurFilter id={`${id}-win`} sd={7} />
      </defs>
      <g fill={p.glow} filter={`url(#${id}-halo)`} opacity={0.75}>
        <MasjidShape />
      </g>
      <g fill={`url(#${id}-fill)`}>
        <MasjidShape />
      </g>
      <g filter={`url(#${id}-win)`} opacity={0.9 * lights}>
        <MasjidWindows color={p.window} />
      </g>
      <g opacity={lights}>
        <MasjidWindows color={p.window} />
      </g>
    </g>
  );
};

/** Rumah kampung beratap limasan. */
function Rumah({ x, y, w, h, color, lit, win = true, seed = 1 }: { x: number; y: number; w: number; h: number; color: string; lit: string; win?: boolean; seed?: number }) {
  const roof = h * 0.75;
  return (
    <g>
      <path d={`M ${x - 12} ${y - h} L ${x + w * 0.3} ${y - h - roof} L ${x + w * 0.7} ${y - h - roof} L ${x + w + 12} ${y - h} Z`} fill={color} />
      <rect x={x} y={y - h} width={w} height={h} fill={color} />
      {win ? <rect x={x + w * (0.2 + rand(seed, 3) * 0.4)} y={y - h * 0.72} width={w * 0.16} height={h * 0.32} fill={lit} opacity={0.85} /> : null}
    </g>
  );
}

/** Lapisan langit + matahari + awan untuk palet tertentu. */
export const SkyLayer: React.FC<{ p: Palette; name: string; sunRise?: number }> = ({ p, name, sunRise = 0 }) => {
  const { t } = useShot();
  const [sx, sy0] = p.sunPos;
  const sy = sy0 - sunRise * t;
  return (
    <Lapis
      d={0.08}
      defs={
        <>
          <Glow id={`sun-${name}`} color={p.glow} mid={0.25} />
          <Glow id={`sunc-${name}`} color={p.sun} mid={0.55} />
          <CloudDefs />
        </>
      }
    >
      <SkyFill id={`sky-${name}`} stops={p.sky} stars={p.stars} />
      <ellipse cx={sx} cy={sy + 120} rx={1100} ry={420} fill={`url(#sun-${name})`} opacity={0.75} />
      <circle cx={sx} cy={sy} r={p.sunR * 6} fill={`url(#sun-${name})`} opacity={0.85} />
      <circle cx={sx} cy={sy} r={p.sunR * 1.5} fill={`url(#sunc-${name})`} />
      <circle cx={sx} cy={sy} r={p.sunR} fill={p.sun} />
      <Cloud x={180} y={620} w={760} h={70} color={p.cloud} lit={p.cloudLit} opacity={0.55} seed={2} />
      <Cloud x={820} y={820} w={620} h={60} color={p.cloud} lit={p.cloudLit} opacity={0.6} seed={4} drift={-5} />
      <Cloud x={300} y={1010} w={900} h={56} color={mix(p.cloud, p.cloudLit, 0.4)} lit={p.cloudLit} opacity={0.5} seed={7} />
      <Cloud x={-80} y={380} w={600} h={60} color={p.cloud} lit={p.cloudLit} opacity={0.35} seed={9} drift={4} />
    </Lapis>
  );
};

export type Crowd = 'jalan' | 'masuk' | 'pulang' | 'none';

/** Orang di jalan depan masjid. */
function Kerumunan({ crowd, p }: { crowd: Crowd; p: Palette }) {
  const { t } = useShot();
  const c = p.near;
  const far = mix(p.mid, p.near, 0.4);
  if (crowd === 'none') return null;
  if (crowd === 'pulang') {
    const fx = 250 + t * 19;
    return (
      <g>
        {[0, 1, 2].map((i) => (
          <Orang key={i} kind={i % 2 ? 'wanita' : 'pria'} x={700 + i * 46 + t * 6} y={1556} s={0.36} dir={1} color={far} phase={i * 0.3} />
        ))}
        <Orang kind="pria" x={fx} y={1760} s={1.2} dir={1} color={c} pose="walk" arm={-24} phase={0} />
        <Orang kind="anak" x={fx + 62} y={1764} s={1.2} dir={1} color={c} pose="walk" phase={0.25} />
        <Orang kind="wanita" x={fx + 124} y={1758} s={1.18} dir={1} color={c} pose="walk" phase={0.5} />
        {/* Tangan bergandengan */}
        <path d={`M ${fx + 26} ${1760 - 112} Q ${fx + 44} ${1760 - 92} ${fx + 58} ${1764 - 88}`} stroke={c} strokeWidth={9} strokeLinecap="round" fill="none" />
        <path d={`M ${fx + 70} ${1764 - 88} Q ${fx + 92} ${1764 - 92} ${fx + 110} ${1758 - 102}`} stroke={c} strokeWidth={9} strokeLinecap="round" fill="none" />
      </g>
    );
  }
  const busy = crowd === 'masuk';
  return (
    <g>
      {/* Orang jauh menuju gerbang */}
      {Array.from({ length: busy ? 9 : 5 }, (_, i) => {
        const fromLeft = i % 2 === 0;
        const x = fromLeft ? 260 + rand(i, 3) * 160 + t * 9 : 820 - rand(i, 4) * 160 - t * 9;
        return (
          <Orang
            key={i}
            kind={(['pria', 'wanita', 'priaCelana', 'anak'] as const)[i % 4]}
            x={x}
            y={1552 + rand(i, 5) * 20}
            s={0.36 + rand(i, 6) * 0.06}
            dir={fromLeft ? 1 : -1}
            color={far}
            phase={rand(i, 7)}
          />
        );
      })}
      <Orang kind="pria" x={90 + t * 26} y={1716} s={1.12} dir={1} color={c} phase={0.1} />
      <Orang kind="anak" x={22 + t * 26} y={1724} s={1.12} dir={1} color={c} phase={0.6} />
      <Orang kind="wanita" x={-60 + t * 24} y={1700} s={1.08} dir={1} color={c} phase={0.35} />
      <Orang kind="priaCelana" x={1000 - t * 23} y={1750} s={1.22} dir={-1} color={c} phase={0.2} />
      {busy ? (
        <>
          <Orang kind="pria" x={720} y={1640} s={0.86} dir={-1} color={c} pose="stand" arm={-40} />
          <Orang kind="anak" x={668} y={1644} s={0.86} dir={1} color={c} pose="bow" arm={-70} lean={24} />
          <Orang kind="wanita" x={1150 - t * 22} y={1800} s={1.3} dir={-1} color={c} phase={0.7} />
          <Orang kind="anakPerempuan" x={1090 - t * 22} y={1806} s={1.3} dir={-1} color={c} phase={0.1} />
        </>
      ) : (
        <Orang kind="pria" x={1130 - t * 25} y={1792} s={1.3} dir={-1} color={c} phase={0.55} />
      )}
    </g>
  );
}

/** Set eksterior masjid: langit, gunung, kampung, masjid, jalan, jamaah, latar depan. */
export const MasjidSet: React.FC<{ time?: 'fajar' | 'pagi' | 'senja'; crowd?: Crowd; flare?: boolean; dust?: number }> = ({
  time = 'fajar',
  crowd = 'jalan',
  flare = true,
  dust = 0.8,
}) => {
  const { t } = useShot();
  const p = PALETTES[time];
  const horizon = p.sky[p.sky.length - 1][1];
  const haze = mix(p.far, horizon, 0.35);
  const farTown = mix(p.far, p.mid, 0.35);
  const [sx, sy] = p.sunPos;
  const sunRise = time === 'fajar' ? 6 : time === 'senja' ? -5 : 0;
  const lights = time === 'pagi' ? 0.25 : 1;
  return (
    <>
      <SkyLayer p={p} name={time} sunRise={sunRise} />
      <Lapis d={0.2}>
        <Birds x={260} y={760} color={p.bird} count={7} seed={time.length} speed={time === 'senja' ? -20 : 24} />
        <Birds x={820} y={560} color={p.bird} count={4} seed={time.length + 9} speed={18} scale={0.7} />
      </Lapis>
      {/* Gunung & kota jauh berkabut */}
      <Lapis d={0.18} defs={<BlurFilter id="far-soft" sd={2.5} />}>
        <g filter="url(#far-soft)">
          <path d="M -300 1440 L 40 1300 Q 150 1250 200 1210 L 255 1205 Q 300 1250 420 1310 L 700 1400 L 1400 1430 L 1400 1600 L -300 1600 Z" fill={haze} opacity={0.75} />
          <path d="M 560 1440 L 860 1330 Q 950 1300 1010 1320 L 1400 1400 L 1400 1600 L 560 1600 Z" fill={haze} opacity={0.55} />
        </g>
        <g fill={farTown} opacity={0.9}>
          {Array.from({ length: 26 }, (_, i) => {
            const x = -260 + i * 66 + rand(i, 2) * 30;
            const h = 30 + rand(i, 3) * 50;
            return <rect key={i} x={x} y={1440 - h} width={50 + rand(i, 4) * 30} height={h + 200} />;
          })}
        </g>
        <rect x={-600} y={1430} width={W + 1200} height={60} fill={horizon} opacity={0.35} />
      </Lapis>
      {/* Kampung, pohon & masjid */}
      <Lapis d={0.5} defs={<BlurFilter id="soft-glow" sd={18} />}>
        <g>
          <Pohon x={130} y={1500} r={90} color={mix(p.mid, p.near, 0.3)} seed={1} />
          <Pohon x={955} y={1500} r={100} color={mix(p.mid, p.near, 0.3)} seed={4} />
          <Rumah x={-120} y={1508} w={170} h={70} color={mix(p.mid, p.near, 0.55)} lit={p.window} seed={1} win={lights > 0.5} />
          <Rumah x={60} y={1508} w={130} h={58} color={mix(p.mid, p.near, 0.6)} lit={p.window} seed={2} win={lights > 0.5} />
          <Rumah x={900} y={1508} w={150} h={66} color={mix(p.mid, p.near, 0.55)} lit={p.window} seed={3} win={lights > 0.5} />
          <Rumah x={1040} y={1508} w={170} h={74} color={mix(p.mid, p.near, 0.6)} lit={p.window} seed={4} win={lights > 0.5} />
          <Palem x={40} y={1510} h={360} lean={50} color={mix(p.mid, p.near, 0.5)} seed={3} />
          <Palem x={1010} y={1510} h={420} lean={-60} color={mix(p.mid, p.near, 0.5)} seed={6} />
        </g>
        <Masjid p={p} lights={lights} />
      </Lapis>
      {/* Halaman & jalan */}
      <Lapis
        d={0.82}
        defs={
          <>
            <linearGradient id={`ground-${time}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor={mix(p.road, p.ground, 0.66)} />
              <stop offset={0.12} stopColor={mix(p.road, p.ground, 0.72)} />
              <stop offset={0.5} stopColor={p.ground} />
              <stop offset={1} stopColor={p.ground} />
            </linearGradient>
            <Glow id={`refl-${time}`} color={p.glow} mid={0.3} />
          </>
        }
      >
        <rect x={-600} y={1500} width={W + 1200} height={1400} fill={`url(#ground-${time})`} />
        <ellipse cx={sx} cy={1640} rx={150} ry={340} fill={`url(#refl-${time})`} opacity={0.45} />
        {/* Garis paving halaman (perspektif) */}
        <g stroke={p.ground} strokeWidth={2} opacity={0.35}>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1={540 + (i - 6) * 90} y1={1550} x2={540 + (i - 6) * 330} y2={2100} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1={-600} y1={1560 + Math.pow(i + 1, 1.7) * 22} x2={1700} y2={1560 + Math.pow(i + 1, 1.7) * 22} />
          ))}
        </g>
        {/* Pagar halaman + gerbang */}
        <g fill={mix(p.near, p.mid, 0.25)}>
          <rect x={-300} y={1522} width={770} height={26} />
          <rect x={610} y={1522} width={770} height={26} />
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={-300 + i * 76} y={1500} width={10} height={30} />
          ))}
          <rect x={452} y={1440} width={26} height={110} />
          <rect x={602} y={1440} width={26} height={110} />
          <path d={dome(465, 1440, 16)} />
          <path d={dome(615, 1440, 16)} />
        </g>
        <LampuJalan x={-20} y={1700} h={300} color={p.near} light={p.window} on={lights} />
        <LampuJalan x={1100} y={1700} h={300} color={p.near} light={p.window} on={lights} dir={-1} />
        <Kerumunan crowd={crowd} p={p} />
        {crowd === 'jalan' ? <Motor x={-260 + t * 48} y={1880} s={1.05} color={p.near} light={p.window} /> : null}
      </Lapis>
      <GodRays x={sx} y={sy - (time === 'fajar' ? 6 * t : 0)} color={p.glow} opacity={time === 'pagi' ? 0.22 : 0.3} spread={[150, 390]} seed={time.length} d={0.1} />
      {/* Latar depan: pelepah kelapa menjuntai, kabur (kedalaman ruang tajam) */}
      <Lapis d={1.3} blur={5}>
        <g fill={mix(p.near, '#000000', 0.35)}>
          <g transform={`translate(-60 -40) rotate(${Math.sin(t * 0.5) * 2})`}>
            <Palem x={0} y={0} h={0} color={mix(p.near, '#000000', 0.35)} seed={11} s={2.1} />
          </g>
        </g>
      </Lapis>
      {flare ? <Flare x={sx} y={sy} color={p.glow} opacity={time === 'pagi' ? 0.6 : 0.85} d={0.08} /> : null}
      {dust > 0 ? <Dust count={42} seed={time.length + 1} opacity={dust} d={0.9} /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Langit: dua berkas cahaya + kitab amal                             */
/* ------------------------------------------------------------------ */

/** Kitab terbuka bercahaya; baris tulisan emas muncul bertahap. */
export const Kitab: React.FC<{ x: number; y: number; s?: number; write?: number; glow?: number }> = ({ x, y, s = 1, write = 1, glow = 1 }) => {
  const { t } = useShot();
  const lines = 7;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <Glow id="kitab-aura" color="#ffd98a" mid={0.3} />
        <linearGradient id="kitab-page-l" x1="0" x2="1">
          <stop offset={0} stopColor="#f3e2bd" />
          <stop offset={0.85} stopColor="#fff7e6" />
          <stop offset={1} stopColor="#d9c39a" />
        </linearGradient>
        <linearGradient id="kitab-page-r" x1="1" x2="0">
          <stop offset={0} stopColor="#f3e2bd" />
          <stop offset={0.85} stopColor="#fff7e6" />
          <stop offset={1} stopColor="#d9c39a" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={20} rx={420 * (0.9 + 0.1 * Math.sin(t * 1.2))} ry={260} fill="url(#kitab-aura)" opacity={0.85 * glow} />
      <path d="M -236 100 Q -110 84 0 126 Q 110 84 236 100 L 236 114 Q 110 98 0 142 Q -110 98 -236 114 Z" fill="#1B5E20" />
      <path d="M -232 92 Q -110 76 0 118 Q 110 76 232 92 L 232 102 Q 110 88 0 130 Q -110 88 -232 102 Z" fill="#e6d3ab" />
      <path d="M 0 0 Q -100 -36 -226 -16 L -232 94 Q -110 76 0 118 Z" fill="url(#kitab-page-l)" />
      <path d="M 0 0 Q 100 -36 226 -16 L 232 94 Q 110 76 0 118 Z" fill="url(#kitab-page-r)" />
      <path d="M 0 0 L 0 118" stroke="#b89a66" strokeWidth={2} opacity={0.6} />
      {Array.from({ length: lines * 2 }, (_, i) => {
        const side = i < lines ? -1 : 1;
        const k = i % lines;
        const p = Math.max(0, Math.min(1, write * lines * 2 - i));
        const yy = -2 + k * 13 + 6;
        const x0 = side * 24;
        const x1 = side * (24 + 172 * p);
        return p > 0 ? (
          <path key={i} d={`M ${x0} ${yy} Q ${(x0 + x1) / 2} ${yy - 8 * (1 - k / lines)} ${x1} ${yy}`} stroke="#c9a23a" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75} />
        ) : null;
      })}
    </g>
  );
};

/** Set langit: awan pagi, dua berkas cahaya turun ke kitab amal yang bercahaya. */
export const LangitSet: React.FC<{ beamsAt?: number }> = ({ beamsAt = 0.6 }) => {
  const { t } = useShot();
  const beam = ramp(t, beamsAt, beamsAt + 1.6);
  const sky: [number, string][] = [
    [0, '#1f3a68'],
    [0.22, '#3f6497'],
    [0.45, '#8ea7c2'],
    [0.66, '#e9cfa6'],
    [1, '#fde3b8'],
  ];
  const beams: [number, number][] = [
    [395, 455],
    [685, 625],
  ];
  return (
    <>
      <Lapis
        d={0.12}
        defs={
          <>
            <CloudDefs />
            <Glow id="langit-open" color="#fff6dc" mid={0.35} />
          </>
        }
      >
        <SkyFill id="sky-langit" stops={sky} />
        <ellipse cx={540} cy={60} rx={520} ry={360} fill="url(#langit-open)" opacity={0.85} />
      </Lapis>
      <Lapis d={0.3} defs={<CloudDefs />}>
        <Cloud x={120} y={260} w={700} h={150} color="#7d86a0" lit="#fff3dc" opacity={0.85} seed={3} drift={5} litSide="top" />
        <Cloud x={960} y={330} w={720} h={160} color="#7a819a" lit="#fff1d6" opacity={0.85} seed={5} drift={-5} litSide="top" />
        <Cloud x={540} y={760} w={1200} h={120} color="#e9d6c3" lit="#fff8ea" opacity={0.6} seed={8} drift={3} litSide="top" />
      </Lapis>
      {/* Dua berkas cahaya */}
      <Lapis
        d={0.45}
        blend="screen"
        defs={
          <>
            <linearGradient id="beam-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#fffaf0" stopOpacity={0.95} />
              <stop offset={0.6} stopColor="#ffe6b0" stopOpacity={0.55} />
              <stop offset={1} stopColor="#ffd98a" stopOpacity={0.15} />
            </linearGradient>
            <BlurFilter id="beam-b" sd={18} />
            <BlurFilter id="beam-core" sd={5} />
          </>
        }
      >
        {beams.map(([top, bottom], i) => {
          const len = 1560 * beam;
          const sway = Math.sin(t * 0.5 + i * 2) * 6;
          return (
            <g key={i} opacity={beam * (0.85 + 0.15 * Math.sin(t * 1.1 + i))}>
              <polygon
                points={`${top - 70 + sway},-100 ${top + 70 + sway},-100 ${bottom + 34},${-100 + len} ${bottom - 34},${-100 + len}`}
                fill="url(#beam-g)"
                filter="url(#beam-b)"
              />
              <polygon
                points={`${top - 16 + sway},-100 ${top + 16 + sway},-100 ${bottom + 8},${-100 + len} ${bottom - 8},${-100 + len}`}
                fill="#fffdf6"
                opacity={0.7}
                filter="url(#beam-core)"
              />
            </g>
          );
        })}
      </Lapis>
      <Dust count={26} seed={21} region={[380, 0, 60, 1450]} skew={0.04} fall size={0.8} d={0.45} opacity={beam} />
      <Dust count={26} seed={23} region={[640, 0, 60, 1450]} skew={-0.04} fall size={0.8} d={0.45} opacity={beam} />
      {/* Hamparan awan bawah + kitab */}
      <Lapis d={0.7} defs={<CloudDefs />}>
        <Cloud x={540} y={1700} w={1500} h={220} color="#f2e2cb" lit="#fffaf0" opacity={0.95} seed={12} drift={2} litSide="top" />
        <Kitab x={540} y={1450} s={1.05} write={ramp(t, beamsAt + 1.2, beamsAt + 4)} glow={0.4 + 0.6 * beam} />
        <Cloud x={200} y={1830} w={900} h={200} color="#ead7bf" lit="#fff6e6" opacity={0.95} seed={14} drift={3} litSide="top" />
        <Cloud x={900} y={1860} w={900} h={200} color="#ead7bf" lit="#fff6e6" opacity={0.95} seed={16} drift={-3} litSide="top" />
      </Lapis>
      <Dust count={30} seed={27} region={[300, 1100, 480, 400]} size={0.9} d={0.7} opacity={0.4 + 0.6 * beam} />
      <Flare x={540} y={-40} color="#ffe7b0" opacity={0.55} d={0.12} />
    </>
  );
};
