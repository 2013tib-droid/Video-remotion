import React from 'react';
import { FONT_STACKS } from '../../config';
import { Dust, GodRays } from './atmos';
import { Orang, type OrangProps } from './figures';
import { ogive } from './interior';
import { BlurFilter, Glow, H, Lapis, W, clamp01, lerp, rand, ramp, useShot } from './util';

/* ------------------------------------------------------------------ */
/*  Bahan bersama                                                      */
/* ------------------------------------------------------------------ */

/** Permukaan meja kayu (serat bergelombang) + cahaya jendela miring dengan bayangan kusen. */
function MejaKayu({ id, top = -900, light = 1 }: { id: string; top?: number; light?: number }) {
  const { t } = useShot();
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset={0} stopColor="#5a3820" />
          <stop offset={0.5} stopColor="#3f2614" />
          <stop offset={1} stopColor="#24150b" />
        </linearGradient>
        <BlurFilter id={`${id}-sun`} sd={30} />
              </defs>
      <rect x={-600} y={top} width={W + 1200} height={H + 1800} fill={`url(#${id}-wood)`} />
      <g opacity={0.22}>
        {Array.from({ length: 34 }, (_, i) => {
          const y = top + i * 90 + rand(i, 2) * 40;
          const a = 10 + rand(i, 3) * 16;
          return (
            <path
              key={i}
              d={`M -600 ${y} C 0 ${y + a} 500 ${y - a} 1700 ${y + a * 0.5}`}
              stroke={i % 3 ? '#1c0f07' : '#7a5232'}
              strokeWidth={2 + rand(i, 4) * 4}
              fill="none"
            />
          );
        })}
      </g>
      {/* Cahaya jendela: empat kaca terang miring (kusen jadi celah gelap) */}
      <g style={{ mixBlendMode: 'screen' }} opacity={light * (0.9 + 0.1 * Math.sin(t * 0.4))} filter={`url(#${id}-sun)`}>
        <g transform="translate(560 620) rotate(-14) skewX(-22)">
          {[
            [-330, -400],
            [20, -400],
            [-330, 20],
            [20, 20],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={310} height={380} fill="#ffcf8a" opacity={0.5} />
          ))}
        </g>
      </g>
    </>
  );
}

/** Lapisan bayangan jauh / bokeh kabur. */
function Bokeh({ seed, colors, count = 14, d = 0.15, blur = 4 }: { seed: number; colors: string[]; count?: number; d?: number; blur?: number }) {
  const { t } = useShot();
  return (
    <Lapis d={d} blur={blur}>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={-100 + rand(i, seed) * 1280 + Math.sin(t * 0.2 + i) * 10}
          cy={-100 + rand(i, seed + 1) * 1500}
          r={40 + rand(i, seed + 2) * 90}
          fill={colors[i % colors.length]}
          opacity={0.12 + rand(i, seed + 3) * 0.22}
        />
      ))}
    </Lapis>
  );
}

/** Orang besar dengan pendar tepi (rim light) — untuk siluet close-up berlatar matahari. */
function OrangRim({ rim, glow = 0.85, ...props }: OrangProps & { rim: string; glow?: number }) {
  return (
    <>
      <g filter="url(#rim-blur)" opacity={glow}>
        <Orang {...props} color={rim} itemColor={rim} />
      </g>
      <Orang {...props} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dompet                                                             */
/* ------------------------------------------------------------------ */

/** Selembar uang kertas (bergaya, bukan replika). */
function UangKertas({ value }: { value: string }) {
  return (
    <g>
      <defs>
        <linearGradient id="uang-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset={0} stopColor="#8a6bb3" />
          <stop offset={0.5} stopColor="#a68bc8" />
          <stop offset={1} stopColor="#6f5296" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={400} height={190} rx={6} fill="url(#uang-g)" />
      <rect x={10} y={10} width={380} height={170} rx={4} fill="none" stroke="#4e3570" strokeWidth={2} opacity={0.6} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M 20 ${40 + i * 14} Q 110 ${20 + i * 14} 200 ${40 + i * 14} T 380 ${40 + i * 14}`} stroke="#d8c8ec" strokeWidth={1.2} fill="none" opacity={0.35} />
      ))}
      <circle cx={300} cy={95} r={52} fill="#5d4285" opacity={0.35} />
      <circle cx={300} cy={95} r={40} fill="none" stroke="#e5d9f2" strokeWidth={1.5} opacity={0.5} />
      <text x={26} y={62} fontFamily={FONT_STACKS.jakarta} fontWeight={800} fontSize={44} fill="#f3ecfb">
        {value}
      </text>
      <text x={28} y={160} fontFamily={FONT_STACKS.jakarta} fontWeight={600} fontSize={15} letterSpacing={3} fill="#efe6f8" opacity={0.85}>
        SEPULUH RIBU RUPIAH
      </text>
    </g>
  );
}

/** Close-up dompet kulit di meja: terbuka perlahan, selembar uang ditarik sedikit keluar. */
export const DompetSet: React.FC<{ note?: string }> = ({ note = '10.000' }) => {
  const { t } = useShot();
  const open = ramp(t, 0.4, 2.2);
  const sx = lerp(-1, 1, open);
  const pull = ramp(t, 2.0, 3.6);
  const hinge = 540;
  const top = 860;
  const hgt = 300;
  const half = 290;
  const leather = '#5b3218';
  const leatherDark = '#3d1f0e';
  const inner = '#6e3e1f';
  return (
    <>
      <Lapis d={0.2}>
        <MejaKayu id="dompet" />
      </Lapis>
      <Lapis
        d={0.55}
        defs={
          <>
            <BlurFilter id="dompet-shadow" sd={22} />
            <linearGradient id="dompet-l" x1="0" y1="0" x2="1" y2="1">
              <stop offset={0} stopColor="#7a4524" />
              <stop offset={1} stopColor={leather} />
            </linearGradient>
          </>
        }
      >
        <g transform={`translate(540 1010) scale(1.32) rotate(-7) translate(-540 -1010)`}>
          <rect x={hinge - half - 10} y={top + 30} width={half * 2 + 40} height={hgt + 20} rx={30} fill="#000" opacity={0.5} filter="url(#dompet-shadow)" />
          {/* Sisi kiri (dalam) */}
          <rect x={hinge - half} y={top} width={half} height={hgt} rx={22} fill={inner} />
          <rect x={hinge - half + 12} y={top + 12} width={half - 24} height={hgt - 24} rx={16} fill="none" stroke="#c99a6a" strokeWidth={2} strokeDasharray="7 6" opacity={0.6} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${hinge - half + 26} ${top + 150 + i * 38} L ${hinge - 26} ${top + 150 + i * 38}`} stroke={leatherDark} strokeWidth={5} opacity={0.7} />
          ))}
          {/* Uang di kantong panjang */}
          <g transform={`translate(${hinge - half + 40} ${top - 60 - pull * 110}) rotate(${-2 + pull * -3})`} opacity={clamp01(open * 1.6)}>
            <UangKertas value={note} />
          </g>
          <rect x={hinge - half} y={top + 80} width={half} height={hgt - 80} rx={20} fill={inner} />
          <rect x={hinge - half + 12} y={top + 92} width={half - 24} height={hgt - 104} rx={14} fill="none" stroke="#c99a6a" strokeWidth={2} strokeDasharray="7 6" opacity={0.55} />
          {/* Sisi kanan: lipatan yang membuka (skala x -1 → 1 di engsel) */}
          <g transform={`translate(${hinge} 0) scale(${sx} 1)`}>
            <rect x={0} y={top} width={half} height={hgt} rx={22} fill={sx < 0 ? 'url(#dompet-l)' : inner} />
            <rect x={12} y={top + 12} width={half - 24} height={hgt - 24} rx={16} fill="none" stroke="#c99a6a" strokeWidth={2} strokeDasharray="7 6" opacity={0.6} />
            {sx > 0
              ? [0, 1, 2, 3].map((i) => <rect key={i} x={24} y={top + 40 + i * 58} width={half - 48} height={46} rx={8} fill={leatherDark} opacity={0.45} />)
              : null}
          </g>
          <rect x={hinge - 4} y={top + 4} width={8} height={hgt - 8} rx={4} fill={leatherDark} opacity={0.8} />
        </g>
      </Lapis>
      <Dust count={30} seed={61} region={[-50, 0, 1180, 1500]} skew={-0.2} d={0.7} size={0.9} opacity={0.8} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Sarapan                                                            */
/* ------------------------------------------------------------------ */

/** Uap mengepul (garis bergelombang kabur yang naik). */
function Uap({ x, y, h = 260, n = 3 }: { x: number; y: number; h?: number; n?: number }) {
  const { t } = useShot();
  return (
    <g filter="url(#uap-blur)">
      {Array.from({ length: n }, (_, i) => {
        const ph = (t * 0.35 + i / n) % 1;
        const yy = y - ph * h;
        const a = Math.sin(ph * Math.PI);
        const d = Array.from({ length: 8 }, (_, k) => {
          const u = k / 7;
          return `${x + (i - 1) * 16 + Math.sin(u * 5 + t * 1.6 + i * 2) * 16 * (0.4 + u)} ${yy - u * h * 0.55}`;
        });
        return <path key={i} d={`M ${d.join(' L ')}`} stroke="#fff6e8" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.42 * a} />;
      })}
    </g>
  );
}

/** Meja sarapan sederhana dekat jendela: nasi + telur, teh mengepul; ibu samar di belakang. */
export const SarapanSet: React.FC = () => {
  const { t } = useShot();
  return (
    <>
      <Lapis
        d={0.12}
        blur={9}
        defs={
          <>
            <linearGradient id="dapur-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#3b2a1e" />
              <stop offset={1} stopColor="#6a4a30" />
            </linearGradient>
            <Glow id="dapur-win" color="#fff0cf" mid={0.45} />
          </>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#dapur-wall)" />
        <g transform="translate(0 200)">
        <ellipse cx={300} cy={760} rx={560} ry={620} fill="url(#dapur-win)" opacity={0.95} />
        <rect x={60} y={380} width={480} height={700} fill="#fff4da" />
        <rect x={60} y={380} width={480} height={700} fill="none" stroke="#3b2a1e" strokeWidth={26} />
        <path d="M 300 380 L 300 1080 M 60 720 L 540 720" stroke="#3b2a1e" strokeWidth={18} />
        <path d="M 20 340 Q 90 700 40 1120 L -40 1120 L -40 340 Z" fill="#c98b5a" opacity={0.85} />
        <path d="M 580 340 Q 520 700 600 1120 L 680 1120 L 680 340 Z" fill="#c98b5a" opacity={0.85} />
        </g>
        <g opacity={0.9}>
          <Orang kind="wanita" pose="hold" x={820} y={1360} s={3.3} dir={-1} color="#2a1a12" arm={-30 - 8 * Math.sin(t * 0.8)} />
        </g>
      </Lapis>
      <GodRays x={300} y={900} color="#ffdca0" opacity={0.28} spread={[10, 80]} count={7} length={1700} seed={71} d={0.15} />
      <Lapis
        d={0.6}
        defs={
          <>
            <linearGradient id="sarapan-meja" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#8a5a34" />
              <stop offset={0.35} stopColor="#5a371d" />
              <stop offset={1} stopColor="#2a160a" />
            </linearGradient>
            <linearGradient id="teh" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#d9862e" />
              <stop offset={1} stopColor="#7a3a12" />
            </linearGradient>
            <BlurFilter id="uap-blur" sd={7} />
            <BlurFilter id="sarapan-sh" sd={14} />
          </>
        }
      >
        <rect x={-600} y={1240} width={W + 1200} height={1600} fill="url(#sarapan-meja)" />
        <rect x={-600} y={1240} width={W + 1200} height={8} fill="#c49163" opacity={0.6} />
        {/* Piring nasi + telur */}
        <ellipse cx={410} cy={1480} rx={250} ry={74} fill="#000" opacity={0.35} filter="url(#sarapan-sh)" />
        <ellipse cx={400} cy={1452} rx={250} ry={76} fill="#efe6d6" />
        <ellipse cx={400} cy={1446} rx={196} ry={56} fill="#fbf7ee" />
        <path d="M 270 1450 Q 300 1360 380 1352 Q 450 1356 470 1430 Q 420 1462 330 1462 Z" fill="#fffdf6" />
        <path d="M 290 1430 Q 330 1400 380 1398" stroke="#e8dfcd" strokeWidth={4} fill="none" />
        <path d="M 440 1452 Q 450 1408 520 1410 Q 572 1418 560 1456 Q 520 1478 470 1470 Z" fill="#ffffff" />
        <ellipse cx={505} cy={1436} rx={22} ry={15} fill="#f2a823" />
        <ellipse cx={500} cy={1431} rx={8} ry={5} fill="#ffd36b" />
        {/* Gelas teh */}
        <ellipse cx={780} cy={1420} rx={84} ry={20} fill="#000" opacity={0.35} filter="url(#sarapan-sh)" />
        <path d="M 712 1240 L 848 1240 L 832 1414 Q 780 1428 728 1414 Z" fill="url(#teh)" opacity={0.92} />
        <path d="M 712 1240 L 848 1240 L 832 1414 Q 780 1428 728 1414 Z" fill="none" stroke="#fff1d8" strokeWidth={3} opacity={0.5} />
        <ellipse cx={780} cy={1262} rx={66} ry={12} fill="#e9a04a" />
        <path d="M 726 1260 L 738 1400" stroke="#fff6e6" strokeWidth={6} opacity={0.5} strokeLinecap="round" />
        <Uap x={780} y={1230} />
        <Uap x={400} y={1360} h={200} n={2} />
        {/* Teko & mangkuk */}
        <path d="M 900 1300 Q 890 1180 960 1170 Q 1040 1170 1040 1300 Z" fill="#3a2414" />
        <path d="M 900 1240 Q 860 1220 846 1180" stroke="#3a2414" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M 120 1300 Q 130 1350 200 1352 Q 270 1350 280 1300 Z" fill="#d9cbb3" />
        <ellipse cx={200} cy={1300} rx={80} ry={14} fill="#a8432a" />
      </Lapis>
      <Dust count={28} seed={81} region={[0, 300, 900, 1200]} skew={0.3} d={0.4} size={0.9} opacity={0.8} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Montase berbagi                                                    */
/* ------------------------------------------------------------------ */

/** Langit emas + matahari di belakang tokoh + jalan kabur. */
function LatarEmas({ id, sun = [560, 900], arches = false }: { id: string; sun?: [number, number]; arches?: boolean }) {
  return (
    <>
      <Lapis
        d={0.1}
        blur={arches ? 6 : 3}
        defs={
          <>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#6b4a5a" />
              <stop offset={0.35} stopColor="#d88a5e" />
              <stop offset={0.6} stopColor="#f9c983" />
              <stop offset={0.8} stopColor="#fde3b0" />
            </linearGradient>
            <Glow id={`${id}-sun`} color="#fff1c8" mid={0.3} />
          </>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill={`url(#${id}-sky)`} />
        <circle cx={sun[0]} cy={sun[1]} r={520} fill={`url(#${id}-sun)`} />
        <circle cx={sun[0]} cy={sun[1]} r={70} fill="#fffaf0" />
        {arches ? (
          <g fill="#7a4a3a" opacity={0.55}>
            <rect x={-300} y={1000} width={1700} height={900} />
            {[-120, 160, 440, 720, 1000].map((x, i) => (
              <path key={i} d={ogive(x + 70, 1500, 200, 1030)} fill="#f6c88a" />
            ))}
          </g>
        ) : (
          <g fill="#8a5a52" opacity={0.6}>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-200 + i * 120} y={1180 - rand(i, 4) * 260} width={100} height={900} />
            ))}
          </g>
        )}
      </Lapis>
      <Bokeh seed={id.length * 7} colors={['#ffe2a8', '#ffc78a', '#fff3d6']} d={0.25} blur={6} />
    </>
  );
}

/** Siluet memberi nasi kotak kepada pekerja berhelm. */
export const BerbagiSet: React.FC = () => {
  const { t } = useShot();
  const reach = ramp(t, 0.3, 2.2);
  return (
    <>
      <LatarEmas id="berbagi" sun={[560, 980]} />
      <GodRays x={560} y={980} color="#ffe2a8" opacity={0.32} seed={91} d={0.15} />
      <Lapis
        d={0.7}
        defs={
          <>
            <BlurFilter id="rim-blur" sd={7} />
            <linearGradient id="berbagi-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#a8664a" />
              <stop offset={0.3} stopColor="#3a2018" />
              <stop offset={1} stopColor="#1c0e0a" />
            </linearGradient>
          </>
        }
      >
        <rect x={-600} y={1580} width={W + 1200} height={1400} fill="url(#berbagi-ground)" />
        <OrangRim kind="pria" pose="give" x={340} y={1660} s={3.6} dir={1} color="#24140f" rim="#ffd79a" arm={lerp(-35, -74, reach)} item="box" itemColor="#fff3dc" />
        <OrangRim kind="priaCelana" hat="helm" pose="receive" x={760} y={1668} s={3.7} dir={-1} color="#1f110c" rim="#ffd79a" arm={lerp(-20, -64, ramp(t, 0.8, 2.6))} />
      </Lapis>
      <Dust count={30} seed={93} d={0.9} size={1.1} opacity={0.9} />
    </>
  );
};

/** Siluet ibu membagikan piring makanan kepada anak-anak. */
export const AnakSet: React.FC = () => {
  const { t } = useShot();
  const give = ramp(t, 0.2, 2.0);
  return (
    <>
      <LatarEmas id="anak" sun={[640, 900]} arches />
      <GodRays x={640} y={900} color="#ffe2a8" opacity={0.28} seed={95} d={0.15} />
      <Lapis
        d={0.7}
        defs={
          <>
            <BlurFilter id="rim-blur" sd={7} />
            <linearGradient id="anak-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#9a5a40" />
              <stop offset={0.3} stopColor="#341c14" />
              <stop offset={1} stopColor="#180c08" />
            </linearGradient>
          </>
        }
      >
        <rect x={-600} y={1560} width={W + 1200} height={1400} fill="url(#anak-ground)" />
        <OrangRim kind="anakPerempuan" pose="stand" x={980} y={1620} s={3.1} dir={-1} color="#2a1610" rim="#ffd79a" glow={0.6} />
        <OrangRim kind="wanita" pose="give" x={310} y={1670} s={3.6} dir={1} color="#24140f" rim="#ffd79a" arm={lerp(-40, -70, give)} item="plate" itemColor="#fff3dc" />
        <OrangRim kind="anak" pose="receive" x={680} y={1672} s={3.7} dir={-1} color="#1f110c" rim="#ffd79a" arm={lerp(-30, -80, ramp(t, 0.6, 2.2))} />
      </Lapis>
      <Dust count={30} seed={97} d={0.9} size={1.1} opacity={0.9} />
    </>
  );
};

/** Deretan gelas/botol air minum dalam cahaya, kilau kaustik di meja. */
export const AirSet: React.FC = () => {
  const { t } = useShot();
  const bottles = [180, 360, 540, 720, 900];
  return (
    <>
      <Lapis
        d={0.1}
        blur={10}
        defs={
          <linearGradient id="air-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#2c3a35" />
            <stop offset={0.5} stopColor="#8a7350" />
            <stop offset={1} stopColor="#f2c98a" />
          </linearGradient>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#air-bg)" />
      </Lapis>
      <Bokeh seed={13} colors={['#ffe8b8', '#cfe9e0', '#ffd08a']} count={16} d={0.2} blur={8} />
      <GodRays x={980} y={300} color="#ffe6b0" opacity={0.3} spread={[100, 170]} count={7} seed={99} d={0.2} />
      <Lapis
        d={0.65}
        defs={
          <>
            <linearGradient id="air-meja" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#c9a072" />
              <stop offset={0.4} stopColor="#6e4a2a" />
              <stop offset={1} stopColor="#2a180c" />
            </linearGradient>
            <linearGradient id="air-isi" x1="0" y1="0" x2="1" y2="0">
              <stop offset={0} stopColor="#dff3f0" stopOpacity={0.35} />
              <stop offset={0.3} stopColor="#ffffff" stopOpacity={0.75} />
              <stop offset={0.6} stopColor="#cbe8e3" stopOpacity={0.3} />
              <stop offset={1} stopColor="#ffffff" stopOpacity={0.6} />
            </linearGradient>
            <BlurFilter id="kaustik" sd={4} />
          </>
        }
      >
        <rect x={-600} y={1300} width={W + 1200} height={1600} fill="url(#air-meja)" />
        {bottles.map((x, i) => {
          const y = 1300 + i * 0;
          const glint = 0.5 + 0.5 * Math.sin(t * 1.2 + i * 1.3);
          return (
            <g key={i}>
              <g filter="url(#kaustik)" opacity={0.55}>
                <path d={`M ${x - 30} ${y + 40} Q ${x + 20 + Math.sin(t + i) * 10} ${y + 70} ${x + 90} ${y + 52} Q ${x + 60} ${y + 90} ${x - 10} ${y + 84}`} stroke="#fff4d0" strokeWidth={5} fill="none" />
              </g>
              <path d={`M ${x - 52} ${y - 300} L ${x + 52} ${y - 300} L ${x + 44} ${y + 10} Q ${x} ${y + 22} ${x - 44} ${y + 10} Z`} fill="url(#air-isi)" />
              <path d={`M ${x - 52} ${y - 300} L ${x + 52} ${y - 300} L ${x + 44} ${y + 10} Q ${x} ${y + 22} ${x - 44} ${y + 10} Z`} fill="none" stroke="#ffffff" strokeWidth={2.5} opacity={0.6} />
              <ellipse cx={x} cy={y - 300} rx={52} ry={10} fill="#e9f6f3" opacity={0.85} />
              <ellipse cx={x} cy={y - 300} rx={52} ry={10} fill="none" stroke="#ffffff" strokeWidth={3} />
              <rect x={x - 50} y={y - 200} width={100} height={70} fill="#2f8f6a" opacity={0.55} />
              <path d={`M ${x - 32} ${y - 280} L ${x - 26} ${y - 10}`} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.55 * glint} />
              <circle cx={x + 24} cy={y - 90} r={4} fill="#fff" opacity={0.8 * glint} />
              <circle cx={x + 30} cy={y - 60} r={2.5} fill="#fff" opacity={0.7} />
            </g>
          );
        })}
      </Lapis>
      {/* Tangan meraih gelas dari kanan */}
      <Lapis d={0.8}>
        <g transform={`translate(${lerp(1300, 1000, ramp(t, 0.4, 2.4))} ${1150}) rotate(-8)`} fill="#2a170e">
          <rect x={0} y={-40} width={500} height={90} rx={40} />
          <path d="M 0 -40 Q -70 -50 -84 0 Q -90 40 -40 56 L 20 50 Z" />
          <rect x={-104} y={-30} width={70} height={24} rx={12} />
        </g>
      </Lapis>
      <Dust count={24} seed={103} d={0.9} opacity={0.8} />
    </>
  );
};

/** Mushaf di atas rehal, sajadah & tasbih dalam cahaya pagi. */
export const MushafSet: React.FC = () => {
  const { t } = useShot();
  return (
    <>
      <Lapis
        d={0.1}
        blur={7}
        defs={
          <>
            <linearGradient id="mushaf-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#170e08" />
              <stop offset={1} stopColor="#4a301c" />
            </linearGradient>
            <Glow id="mushaf-win" color="#ffe4b0" mid={0.35} />
          </>
        }
      >
        <rect x={-600} y={-900} width={W + 1200} height={H + 1800} fill="url(#mushaf-bg)" />
        <ellipse cx={820} cy={520} rx={420} ry={520} fill="url(#mushaf-win)" opacity={0.9} />
        <path d={ogive(820, 1000, 300, 200)} fill="#fff1d2" />
      </Lapis>
      <GodRays x={820} y={520} color="#ffdca0" opacity={0.32} spread={[100, 160]} count={8} seed={105} d={0.15} />
      <Lapis
        d={0.65}
        defs={
          <>
            <linearGradient id="sajadah" x1="0" y1="0" x2="1" y2="0">
              <stop offset={0} stopColor="#0f4a2a" />
              <stop offset={0.5} stopColor="#1B5E20" />
              <stop offset={1} stopColor="#0f4a2a" />
            </linearGradient>
            <BlurFilter id="mushaf-sh" sd={16} />
          </>
        }
      >
        <rect x={-600} y={1380} width={W + 1200} height={1500} fill="#2a180c" />
        {/* Sajadah */}
        <path d="M -100 1540 L 1180 1500 L 1300 1960 L -200 2000 Z" fill="url(#sajadah)" />
        <path d="M -60 1570 L 1150 1532 L 1250 1930 L -150 1966 Z" fill="none" stroke="#D4AF37" strokeWidth={5} opacity={0.75} />
        <path d={ogive(560, 1900, 360, 1580)} fill="none" stroke="#D4AF37" strokeWidth={4} opacity={0.55} />
        {/* Rehal */}
        <path d="M 300 1520 L 560 1260 L 600 1290 L 360 1540 Z" fill="#6b3f1f" />
        <path d="M 820 1520 L 560 1260 L 520 1290 L 760 1540 Z" fill="#5a3418" />
        {/* Mushaf terbuka */}
        <ellipse cx={560} cy={1310} rx={300} ry={40} fill="#000" opacity={0.4} filter="url(#mushaf-sh)" />
        <path d="M 560 1150 Q 440 1110 300 1140 L 290 1290 Q 430 1262 560 1300 Z" fill="#f6ead0" />
        <path d="M 560 1150 Q 680 1110 820 1140 L 830 1290 Q 690 1262 560 1300 Z" fill="#fff4dc" />
        <path d="M 288 1292 Q 430 1264 560 1302 Q 690 1264 832 1292 L 834 1306 Q 690 1280 560 1318 Q 430 1280 286 1306 Z" fill="#1B5E20" />
        {Array.from({ length: 12 }, (_, i) => {
          const side = i < 6 ? -1 : 1;
          const k = i % 6;
          const yy = 1160 + k * 20;
          return (
            <path
              key={i}
              d={`M ${560 + side * 30} ${yy + 4} q ${side * 30} -8 ${side * 60} 0 t ${side * 60} 0 t ${side * 60} 0 t ${side * 50} -2`}
              stroke="#4a3a28"
              strokeWidth={2.5}
              fill="none"
              opacity={0.55}
            />
          );
        })}
        {/* Tasbih */}
        {Array.from({ length: 22 }, (_, i) => {
          const a = (i / 22) * Math.PI * 1.6 + 0.4;
          return <circle key={i} cx={860 + Math.cos(a) * 110} cy={1680 + Math.sin(a) * 48} r={11} fill="#7a4a24" stroke="#e0b874" strokeWidth={1.5} />;
        })}
        <circle cx={860 + Math.cos(0.4) * 110 - 10} cy={1680 + Math.sin(0.4) * 48 + 30} r={14} fill="#D4AF37" opacity={0.85 + 0.15 * Math.sin(t * 2)} />
      </Lapis>
      <Dust count={30} seed={107} region={[500, 300, 600, 1300]} skew={-0.25} d={0.5} opacity={0.9} />
    </>
  );
};
