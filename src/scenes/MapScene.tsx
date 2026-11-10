import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, GEO_COUNTRIES, Icon, MAP_REGIONS, findPlace, project } from '../components';
import { EASINGS, MAP_TIMING, SPRINGS } from '../config';
import { Sfx, useCue, useSceneExit, useSceneMotion } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneTitle } from './SceneLayout';
import type { MapRegion, MapScene } from './types';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
/** Skala drift kamera di pertengahan scene (dipakai untuk menata label). */
const MAP_TIMING_DRIFT_END = 1 + MAP_TIMING.drift * 0.7;
type Box = [number, number, number, number]; // terproyeksi: x0, y0 (atas), x1, y1 (bawah)
interface View {
  cx: number;
  cy: number;
  /** Piksel per satuan peta. */
  s: number;
}

/** Wilayah Indonesia: dipakai untuk menyorot Indonesia secara default. */
const INDONESIA_REGIONS = new Set(['indonesia', 'sumatra', 'jawa', 'kalimantan', 'sulawesi', 'bali-nusra', 'maluku', 'papua']);

function regionBox(region: MapRegion): Box {
  const [w, s, e, n] = typeof region === 'string' ? MAP_REGIONS[region] : region;
  const [x0, y0] = project(w, n);
  const [x1, y1] = project(e, s);
  return [x0, y0, x1, y1];
}

/** Kamera yang memuat `box` di dalam viewport (piksel). */
function fit(box: Box, vp: { x: number; y: number; w: number; h: number }): View & { vp: typeof vp } {
  const bw = Math.max(0.01, box[2] - box[0]);
  const bh = Math.max(0.01, box[3] - box[1]);
  return { cx: (box[0] + box[2]) / 2, cy: (box[1] + box[3]) / 2, s: Math.min(vp.w / bw, vp.h / bh), vp };
}

/** Peta beranimasi: daratan tersingkap, kamera terbang ke area pin, pin jatuh, rute tergambar. */
export const MapSceneView: React.FC<SceneProps<MapScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const { theme, safe, px, type, isPortrait } = useTheme();
  const motion = useSceneMotion();
  const cue = useCue();
  const exit = useSceneExit(0.6);
  const t = frame / fps;
  const sceneSec = motion ? motion.frames / fps : 6;
  const c = theme.colors;

  // Titik: nama kota bawaan atau lat/lon.
  const points = (scene.points ?? [])
    .map((p) => {
      const ll = p.lat !== undefined && p.lon !== undefined ? ([p.lat, p.lon] as [number, number]) : p.place ? findPlace(p.place) : undefined;
      if (!ll) console.warn(`[map] tempat "${p.place}" tidak dikenal — isi lat/lon.`);
      return ll ? { ...p, ll, xy: project(ll[1], ll[0]) } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const outsideSea = points.some(({ ll: [lat, lon] }) => lon < 90 || lon > 145 || lat < -15 || lat > 25);
  const region: MapRegion = scene.region ?? (outsideSea ? 'world' : 'indonesia');
  const countries = new Set(scene.countries ?? (typeof region === 'string' && INDONESIA_REGIONS.has(region) ? ['Indonesia'] : []));

  // Viewport peta: di bawah judul.
  const hasTitle = Boolean(scene.title || scene.eyebrow);
  const top = hasTitle ? H * (isPortrait ? 0.3 : 0.26) : safe.top;
  const vp = { x: safe.x * 0.6, y: top, w: W - safe.x * 1.2, h: H - top - safe.bottom * 0.8 };
  const start = fit(regionBox(region), vp);

  // Area pin (diberi ruang & ukuran minimum agar tidak zoom berlebihan).
  let end = start;
  if (points.length && (scene.zoomToPoints ?? true)) {
    const xs = points.map((p) => p.xy[0]);
    const ys = points.map((p) => p.xy[1]);
    const minSize = outsideSea ? 18 : 5;
    const bw = Math.max(minSize, (Math.max(...xs) - Math.min(...xs)) * 1.5);
    const bh = Math.max(minSize * 0.6, (Math.max(...ys) - Math.min(...ys)) * 1.6);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    // Ruang untuk label di kanan pin.
    end = fit([cx - bw / 2, cy - bh / 2, cx + bw / 2 + bw * 0.12, cy + bh / 2], vp);
    // Jangan zoom-out ke luar wilayah awal kecuali pin memang lebih luas.
    if (end.s < start.s * 0.98 && !outsideSea) end = start;
  }
  const zooming = end !== start;
  const fly = zooming ? interpolate(t, [MAP_TIMING.flyAt, MAP_TIMING.flyAt + MAP_TIMING.fly], [0, 1], { ...clamp, easing: EASINGS.emphasized }) : 0;
  const drift = 1 + MAP_TIMING.drift * interpolate(t, [0, sceneSec], [0, 1], { ...clamp, easing: EASINGS.drift });
  const view: View = {
    cx: start.cx + (end.cx - start.cx) * fly,
    cy: start.cy + (end.cy - start.cy) * fly,
    s: Math.exp(Math.log(start.s) + (Math.log(end.s) - Math.log(start.s)) * fly) * drift,
  };
  const ox = vp.x + vp.w / 2;
  const oy = vp.y + vp.h / 2;
  const toScreen = ([x, y]: [number, number]): [number, number] => [(x - view.cx) * view.s + ox, (y - view.cy) * view.s + oy];
  const vb: Box = [view.cx - ox / view.s, view.cy - oy / view.s, view.cx + (W - ox) / view.s, view.cy + (H - oy) / view.s];

  // Daratan tersingkap melingkar dari tengah viewport.
  const reveal = interpolate(t, [0, MAP_TIMING.draw], [0, 1], { ...clamp, easing: EASINGS.decelerate });
  const radius = reveal * Math.hypot(W, H);
  const fillIn = interpolate(t, [MAP_TIMING.fillAt, MAP_TIMING.fillAt + 0.6], [0, 1], { ...clamp, easing: EASINGS.standard });
  const hlIn = interpolate(t, [MAP_TIMING.fillAt + 0.3, MAP_TIMING.fillAt + 1.0], [0, 1], { ...clamp, easing: EASINGS.standard });
  const mask = reveal >= 1 ? undefined : `radial-gradient(circle at ${ox}px ${oy}px, #000 ${radius * 0.82}px, transparent ${radius}px)`;

  // Garis lintang/bujur halus.
  const step = view.s > 60 ? 2 : view.s > 20 ? 5 : view.s > 6 ? 10 : 30;
  const grid: string[] = [];
  for (let lon = Math.ceil(vb[0] / step) * step; lon <= vb[2]; lon += step) grid.push(`M${lon} ${vb[1]}V${vb[3]}`);
  for (let lat = -80; lat <= 84; lat += step) {
    const y = project(0, lat)[1];
    if (y >= vb[1] && y <= vb[3]) grid.push(`M${vb[0]} ${y}H${vb[2]}`);
  }

  // Jadwal pin & rute.
  const pinBase = zooming ? MAP_TIMING.flyAt + MAP_TIMING.fly * 0.75 : MAP_TIMING.pinsAt;
  const pinTimes: number[] = points.map((p, i) => cue(p.at, pinBase + i * MAP_TIMING.pinStagger));
  const routes = (scene.routes ?? [])
    .filter((r) => points[r.from] && points[r.to])
    .map((r) => ({ ...r, time: cue(r.at, Math.max(pinTimes[r.from], pinTimes[r.to]) + 0.35) }));

  const pinSize = px(54);

  // Posisi label anti-tabrakan (dihitung pada kamera akhir agar tidak melompat):
  // coba kanan, kiri, kanan-bawah, kiri-bawah, kanan-atas, kiri-atas.
  const labelH = (p: (typeof points)[number]) => (p.value ? px(84) : px(56));
  const labelW = (p: (typeof points)[number]) =>
    Math.max((p.label ?? p.place ?? '').length * type.caption * 0.62, (p.value ?? '').length * type.caption * 0.55) + px(44);
  const endScreen = (xy: [number, number]): [number, number] => [(xy[0] - end.cx) * end.s * MAP_TIMING_DRIFT_END + ox, (xy[1] - end.cy) * end.s * MAP_TIMING_DRIFT_END + oy];
  const placed: Box[] = points.map((p) => {
    const [x, y] = endScreen(p.xy);
    return [x - pinSize / 2, y - pinSize * 1.4, x + pinSize / 2, y];
  });
  const labelSlots = points.map((p, i) => {
    const [x, y] = endScreen(p.xy);
    const w = labelW(p);
    const h = labelH(p);
    const gap = pinSize * 0.75;
    const baseY = y - pinSize * 1.25;
    const preferRight = x < W * 0.62;
    const cands: { side: 'left' | 'right'; dy: number }[] = [0, h * 0.9, -h * 0.9, h * 1.8].flatMap((dy) =>
      preferRight ? [{ side: 'right' as const, dy }, { side: 'left' as const, dy }] : [{ side: 'left' as const, dy }, { side: 'right' as const, dy }],
    );
    const boxOf = (c: (typeof cands)[number]): Box =>
      c.side === 'right' ? [x + gap, baseY + c.dy, x + gap + w, baseY + c.dy + h] : [x - gap - w, baseY + c.dy, x - gap, baseY + c.dy + h];
    const hit = (b: Box) => placed.some((o, k) => k !== i && b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) || b[0] < 0 || b[2] > W;
    const pick = cands.find((c) => !hit(boxOf(c))) ?? cands[0];
    placed.push(boxOf(pick));
    return pick;
  });
  const sounds = [
    ...pinTimes.map((at, i) => <Sfx key={`p${i}`} name="pop" at={at + 0.18} seed={i} />),
    ...routes.map((r, i) => <Sfx key={`r${i}`} name="swipe" at={r.time} volume={0.7} />),
  ];

  return (
    <AbsoluteFill>
      {sounds}
      <Background kind={scene.background ?? 'solid'} />
      <AbsoluteFill style={{ opacity: Math.max(0.15, 1 - exit * 0.4) }}>
        <svg width={W} height={H} viewBox={`${vb[0]} ${vb[1]} ${vb[2] - vb[0]} ${vb[3] - vb[1]}`} style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask }}>
          <defs>
            <linearGradient id="map-hl" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c.primary} />
              <stop offset="100%" stopColor={c.secondary} />
            </linearGradient>
          </defs>
          <path d={grid.join('')} stroke={c.text} strokeOpacity={0.07} strokeWidth={px(1.2)} vectorEffect="non-scaling-stroke" fill="none" />
          {GEO_COUNTRIES.map((g) => {
            const [x0, y0, x1, y1] = g.bbox;
            if (x1 < vb[0] || x0 > vb[2] || y1 < vb[1] || y0 > vb[3]) return null;
            const hl = countries.has(g.name);
            return (
              <path
                key={g.id}
                d={g.d}
                fill={hl ? 'url(#map-hl)' : c.surfaceAlt}
                fillOpacity={hl ? 0.25 + 0.65 * hlIn : 0.9 * fillIn}
                stroke={hl ? c.primary : c.border}
                strokeOpacity={hl ? 0.9 : 0.9}
                strokeWidth={px(hl ? 2 : 1.2)}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Rute (ruang layar → tebal garis tetap). */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - exit }}>
        {routes.map((r, i) => {
          const a = toScreen(points[r.from].xy);
          const b = toScreen(points[r.to].xy);
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const dist = Math.hypot(dx, dy);
          const ctrl: [number, number] = [(a[0] + b[0]) / 2 + dy * 0.25 * (dx >= 0 ? 1 : -1), (a[1] + b[1]) / 2 - Math.abs(dx) * 0.25 - dist * 0.05];
          const at = (u: number): [number, number] => [
            (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * ctrl[0] + u * u * b[0],
            (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * ctrl[1] + u * u * b[1],
          ];
          // Tabel panjang busur → kepala garis & titik berjalan sejajar ujung garis.
          const N = 48;
          const lens = [0];
          for (let k = 1; k <= N; k++) lens.push(lens[k - 1] + Math.hypot(at(k / N)[0] - at((k - 1) / N)[0], at(k / N)[1] - at((k - 1) / N)[1]));
          const total = lens[N] || 1;
          const uAt = (frac: number) => {
            const target = frac * total;
            let k = 1;
            while (k < N && lens[k] < target) k++;
            const seg = lens[k] - lens[k - 1] || 1;
            return (k - 1 + (target - lens[k - 1]) / seg) / N;
          };
          const p = interpolate(t, [r.time, r.time + MAP_TIMING.route], [0, 1], { ...clamp, easing: EASINGS.standard });
          if (p <= 0) return null;
          const head = at(uAt(p));
          // Setelah tergambar: titik kecil mengalir sepanjang rute.
          const flow = p >= 1 ? ((t - r.time - MAP_TIMING.route) / 1.6) % 1 : -1;
          const flowPt = flow >= 0 ? at(uAt(flow)) : null;
          return (
            <g key={i}>
              <path d={`M${a[0]} ${a[1]}Q${ctrl[0]} ${ctrl[1]} ${b[0]} ${b[1]}`} fill="none" stroke={c.primary} strokeOpacity={0.25} strokeWidth={px(12)} strokeLinecap="round" strokeDasharray={`${total} ${total}`} strokeDashoffset={total * (1 - p)} />
              <path d={`M${a[0]} ${a[1]}Q${ctrl[0]} ${ctrl[1]} ${b[0]} ${b[1]}`} fill="none" stroke={c.primary} strokeWidth={px(5)} strokeLinecap="round" strokeDasharray={`${total} ${total}`} strokeDashoffset={total * (1 - p)} />
              {p < 1 ? <circle cx={head[0]} cy={head[1]} r={px(10)} fill={c.primary} stroke={c.onPrimary} strokeWidth={px(3)} /> : null}
              {flowPt ? <circle cx={flowPt[0]} cy={flowPt[1]} r={px(7)} fill={c.onPrimary} stroke={c.primary} strokeWidth={px(3)} opacity={Math.sin(flow * Math.PI)} /> : null}
            </g>
          );
        })}
      </svg>

      {/* Pin + label. */}
      {points.map((p, i) => {
        const at = pinTimes[i];
        if (t < at) return null;
        const [x, y] = toScreen(p.xy);
        const f = Math.round((t - at) * fps);
        const drop = spring({ frame: f, fps, config: SPRINGS.bouncy });
        const land = interpolate(drop, [0, 1], [-px(140), 0]);
        const labelIn = spring({ frame: f - Math.round(0.2 * fps), fps, config: SPRINGS.snappy });
        const pulse = ((t - at - 0.3) / 1.6) % 1;
        const slot = labelSlots[i];
        const right = slot.side === 'right';
        const out = 1 - exit;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, opacity: out }}>
            {/* Bayangan & denyut di titik. */}
            <div
              style={{
                position: 'absolute',
                left: -px(18),
                top: -px(7),
                width: px(36),
                height: px(14),
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.25)',
                transform: `scale(${interpolate(drop, [0, 1], [0.3, 1])})`,
              }}
            />
            {t - at > 0.3 ? (
              <div
                style={{
                  position: 'absolute',
                  left: -px(40),
                  top: -px(40),
                  width: px(80),
                  height: px(80),
                  borderRadius: '50%',
                  border: `${px(3)}px solid ${c.primary}`,
                  opacity: 0.6 * (1 - pulse),
                  transform: `scale(${0.3 + pulse})`,
                }}
              />
            ) : null}
            {/* Pin tetes. */}
            <div
              style={{
                position: 'absolute',
                left: -pinSize / 2,
                top: -pinSize * 1.35 + land,
                width: pinSize,
                height: pinSize,
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                background: theme.gradient,
                boxShadow: theme.shadow.elevated,
                opacity: interpolate(drop, [0, 0.15], [0, 1], clamp),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ transform: 'rotate(45deg)', display: 'flex' }}>
                {p.icon ? (
                  <Icon src={p.icon} size={30} delay={at} color={c.onPrimary} />
                ) : (
                  <div style={{ width: pinSize * 0.34, height: pinSize * 0.34, borderRadius: '50%', background: c.onPrimary }} />
                )}
              </div>
            </div>
            {/* Label. */}
            {p.label ?? p.place ? (
              <div
                style={{
                  position: 'absolute',
                  top: -pinSize * 1.25 + slot.dy,
                  [right ? 'left' : 'right']: pinSize * 0.75,
                  transformOrigin: right ? 'left center' : 'right center',
                  transform: `scale(${interpolate(labelIn, [0, 1], [0.7, 1])})`,
                  opacity: labelIn,
                  padding: `${px(10)}px ${px(20)}px`,
                  borderRadius: px(theme.radius.md),
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  boxShadow: theme.shadow.card,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontFamily: theme.fonts.heading, fontWeight: theme.fontWeights.heading, fontSize: type.caption * 1.1, color: c.text, lineHeight: 1.15 }}>
                  {p.label ?? p.place}
                </span>
                {p.value ? (
                  <span style={{ fontFamily: theme.fonts.body, fontWeight: theme.fontWeights.strong, fontSize: type.caption * 0.95, color: c.primary, lineHeight: 1.2 }}>
                    {p.value}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Judul di atas peta, dengan scrim warna latar agar terbaca. */}
      {hasTitle ? (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${c.background} 0%, ${c.background}e6 ${(top / H) * 70}%, ${c.background}00 ${(top / H) * 110}%)`,
          }}
        />
      ) : null}
      {hasTitle || scene.subtitle ? (
        <AbsoluteFill style={{ padding: `${safe.top}px ${safe.x}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <SceneTitle {...scene} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

