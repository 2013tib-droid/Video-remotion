import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASINGS, SPRINGS } from '../../config';
import { formatValue, useCue } from '../../motion';
import { useTheme } from '../../themes';
import type { WorldCard, WorldMeasure, WorldMeter, WorldPanel, WorldReadout, WorldSourceTone, WorldStamp } from '../../scenes/types';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Angka HUD dunia 3D (detik). */
export const WORLD_HUD_TIMING = {
  /** Lama batang ukur bergerak ke nilai barunya. */
  meter: 0.9,
  /** Jeda antar butir daftar putusan di kartu. */
  point: 0.5,
  /** Sisa waktu di akhir scene saat angka strip data sudah berhenti menghitung. */
  readoutTail: 0.8,
} as const;

type ColorFn = (c: string | undefined) => string | undefined;
type Project = (target: string | [number, number, number]) => { x: number; y: number } | null;

/** Muncul (pegas) × hilang (`hideAt`) × keluar scene → 0..1. */
function useAppear(at: number, hideAt: number, exit: number, preset: keyof typeof SPRINGS = 'gentle') {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const inP = spring({ frame: frame - at * fps, fps, config: SPRINGS[preset] });
  const outP = Number.isFinite(hideAt) ? interpolate(t, [hideAt, hideAt + 0.25], [0, 1], clamp) : 0;
  return { t, p: Math.max(0, inP * (1 - outP) * (1 - exit)), gone: t < at || t > hideAt + 0.25 };
}

/** Lencana jenis bukti: biru = data pihak lain, kuning = ilustrasi, netral = hitungan/asumsi sendiri. */
export const SourceBadge: React.FC<{ text: string; tone?: WorldSourceTone; scale?: number }> = ({ text, tone = 'data', scale = 1 }) => {
  const { theme, px, type } = useTheme();
  const c = theme.colors;
  const look = {
    data: { background: c.primary, color: c.onPrimary },
    ilustrasi: { background: '#f2c14e', color: '#111111' },
    hitungan: { background: c.text, color: c.background },
  }[tone];
  return (
    <div
      style={{
        ...look,
        padding: `${px(7) * scale}px ${px(16) * scale}px`,
        borderRadius: px(8),
        fontFamily: theme.fonts.mono,
        fontWeight: 700,
        fontSize: type.label * 0.85 * scale,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Strip data: angka/teks mesin tik di kiri (bisa menghitung) + lencana sumber di kanan. */
export const WorldReadoutView: React.FC<{ readout: WorldReadout; sceneSec: number; exit: number }> = ({ readout, sceneSec, exit }) => {
  const { theme, px, type } = useTheme();
  const cue = useCue();
  const c = theme.colors;
  const start = cue(readout.at, 0.2);
  const { t, p } = useAppear(Math.min(start, 0.2), Infinity, exit);
  let text = readout.text ?? '';
  if (readout.value !== undefined) {
    const end = start + (readout.duration ?? Math.max(1, sceneSec - start - WORLD_HUD_TIMING.readoutTail));
    const v = readout.to === undefined ? readout.value : interpolate(t, [start, end], [readout.value, readout.to], { ...clamp, easing: EASINGS.standard });
    text = formatValue(v, readout);
  }
  return (
    <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: px(20), opacity: p }}>
      <div
        style={{
          padding: `${px(8)}px ${px(18)}px`,
          borderRadius: px(10),
          background: `${c.surface}e6`,
          color: c.text,
          fontFamily: theme.fonts.mono,
          fontWeight: 700,
          fontSize: type.caption * 1.25,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
      {readout.source ? <SourceBadge text={readout.source} tone={readout.tone} /> : null}
    </div>
  );
};

/** Panel batang ukur: tiap batang bergerak dari `value` ke `to` saat cue-nya. */
export const WorldMeterView: React.FC<{ meter: WorldMeter; index: number; exit: number; color: ColorFn }> = ({ meter, index, exit, color }) => {
  const { theme, px, type } = useTheme();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const cue = useCue();
  const c = theme.colors;
  const { t, p, gone } = useAppear(cue(meter.at, 0.3 + index * 0.4), meter.hideAt !== undefined ? cue(meter.hideAt, Infinity) : Infinity, exit);
  if (gone) return null;
  const max = meter.max ?? 1;
  const hasText = meter.rows.some((r) => r.text);
  const mono = { fontFamily: theme.fonts.mono, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' } as const;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * -px(20)}px)`,
        width: hasText ? '74%' : '60%',
        display: 'flex',
        flexDirection: 'column',
        gap: px(12),
        padding: `${px(18)}px ${px(22)}px`,
        borderRadius: theme.radius.sm,
        background: `${c.surface}eb`,
        boxShadow: theme.shadow.card,
      }}
    >
      {meter.title || meter.tag ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: px(12), flexWrap: 'wrap' }}>
          {meter.title ? <div style={{ ...mono, fontSize: type.label * 0.82, color: c.muted }}>{meter.title}</div> : null}
          {meter.tag ? <SourceBadge text={meter.tag} tone={meter.tone ?? 'ilustrasi'} scale={0.85} /> : null}
        </div>
      ) : null}
      {meter.rows.map((row, j) => {
        const start = cue(row.at, 0.6);
        const v = row.to === undefined ? row.value : interpolate(t, [start, start + (row.duration ?? WORLD_HUD_TIMING.meter)], [row.value, row.to], { ...clamp, easing: EASINGS.emphasized });
        const shown = row.showAt === undefined ? 1 : spring({ frame: frame - cue(row.showAt, 0) * fps, fps, config: SPRINGS.gentle });
        if (shown <= 0.01) return null;
        return (
          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: px(14), opacity: shown }}>
            <div style={{ ...mono, fontSize: type.label * 0.85, color: c.text, minWidth: px(170) }}>{row.label}</div>
            <div style={{ flex: 1, height: px(20), borderRadius: px(10), background: c.border, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(1, Math.max(0, v / max)) * shown * 100}%`,
                  height: '100%',
                  borderRadius: px(8),
                  background: color(row.color) ?? c.accent,
                }}
              />
            </div>
            {row.text ? <div style={{ ...mono, fontSize: type.label * 0.85, color: color(row.color) ?? c.text, whiteSpace: 'nowrap' }}>{row.text}</div> : null}
          </div>
        );
      })}
      {meter.note ? <div style={{ fontFamily: theme.fonts.body, fontSize: type.label * 0.8, lineHeight: 1.3, color: c.muted }}>{meter.note}</div> : null}
    </div>
  );
};

/** Daftar putusan ✓/✕ di dalam kartu keterangan. */
export const WorldCardPoints: React.FC<{ points: NonNullable<WorldCard['points']>; cardStart: number }> = ({ points, cardStart }) => {
  const { theme, px, type } = useTheme();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const cue = useCue();
  const c = theme.colors;
  return (
    <>
      {points.map((pt, j) => {
        const p = spring({ frame: frame - cue(pt.at, cardStart + (j + 1) * WORLD_HUD_TIMING.point) * fps, fps, config: SPRINGS.snappy });
        const col = pt.ok === undefined ? c.text : pt.ok ? c.success : c.danger;
        return (
          <div
            key={j}
            style={{
              opacity: p,
              transform: `translateX(${(1 - p) * -px(16)}px)`,
              display: 'flex',
              gap: px(10),
              fontFamily: theme.fonts.body,
              fontWeight: theme.fontWeights.strong,
              fontSize: type.caption * 0.9,
              lineHeight: 1.3,
              color: col,
            }}
          >
            <span>{pt.ok === undefined ? '•' : pt.ok ? '✓' : '✕'}</span>
            <span>{pt.text}</span>
          </div>
        );
      })}
    </>
  );
};

/** Penanda ukuran: garis berujung di antara dua titik 3D + teks di sampingnya. */
export const WorldMeasureView: React.FC<{ measure: WorldMeasure; index: number; exit: number; project: Project; color: ColorFn; W: number; H: number }> = ({
  measure,
  index,
  exit,
  project,
  color,
  W,
  H,
}) => {
  const { theme, px, type } = useTheme();
  const cue = useCue();
  const { p } = useAppear(cue(measure.at, 0.8 + index * 0.4), measure.hideAt !== undefined ? cue(measure.hideAt, Infinity) : Infinity, exit, 'snappy');
  const a = project(measure.from);
  const b = project(measure.to);
  if (!a || !b || p <= 0.01) return null;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  // Garis tumbuh dari tengah; ujungnya tegak lurus garis.
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const half = (len / 2) * Math.min(1, p);
  const cap = px(14);
  const ends = [-1, 1].map((s) => ({ x: mid.x + ux * half * s, y: mid.y + uy * half * s }));
  const col = color(measure.color) ?? '#ffffff';
  const stroke = { stroke: col, strokeWidth: px(4), strokeLinecap: 'round' } as const;
  const right = mid.x < W * 0.6;
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: Math.min(1, p * 1.5), filter: `drop-shadow(0 0 ${px(3)}px #111111)` }}>
        <line x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} {...stroke} />
        {ends.map((e, k) => (
          <line key={k} x1={e.x - uy * cap} y1={e.y + ux * cap} x2={e.x + uy * cap} y2={e.y - ux * cap} {...stroke} />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: mid.x + (right ? 1 : -1) * (Math.abs(uy) * cap + px(18)),
          top: mid.y,
          transform: `translate(${right ? '0' : '-100%'}, -50%) scale(${0.7 + 0.3 * Math.min(1, p)})`,
          transformOrigin: right ? 'left center' : 'right center',
          opacity: Math.min(1, p * 1.5),
          padding: `${px(4)}px ${px(12)}px`,
          borderRadius: px(8),
          background: 'rgba(17,17,17,0.72)',
          color: col,
          fontFamily: theme.fonts.mono,
          fontWeight: 700,
          fontSize: type.label * 0.9,
          whiteSpace: 'nowrap',
        }}
      >
        {measure.text}
      </div>
    </>
  );
};

/** Cap putusan: kata besar miring yang menghentak masuk dari ukuran besar. */
export const WorldStampView: React.FC<{ stamp: WorldStamp; exit: number; project: Project; color: ColorFn; W: number; H: number; start: number }> = ({
  stamp,
  exit,
  project,
  color,
  W,
  H,
  start,
}) => {
  const { theme, px } = useTheme();
  const cue = useCue();
  const { p, gone } = useAppear(start, stamp.hideAt !== undefined ? cue(stamp.hideAt, Infinity) : Infinity, exit, 'snappy');
  if (gone || p <= 0.01) return null;
  const xy = (stamp.target ? project(stamp.target) : null) ?? { x: W / 2, y: H * 0.55 };
  // Ukuran mengecil untuk teks panjang agar tetap di dalam layar.
  const size = Math.min(px(190), (W * 0.82) / Math.max(3, stamp.text.length * 0.62));
  return (
    <div
      style={{
        position: 'absolute',
        left: Math.min(W * 0.8, Math.max(W * 0.2, xy.x)),
        top: xy.y,
        transform: `translate(-50%, -50%) rotate(${stamp.rotate ?? -6}deg) scale(${1 + (1 - Math.min(1, p)) * 1.4})`,
        opacity: Math.min(1, p * 2),
        fontFamily: theme.fonts.heading,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: color(stamp.color) ?? '#fff3d1',
        WebkitTextStroke: `${px(10)}px #111111`,
        paintOrder: 'stroke fill',
        textShadow: `0 ${px(8)}px ${px(18)}px rgba(0,0,0,0.45)`,
      }}
    >
      {stamp.text}
    </div>
  );
};

/** Warna HUD gaya referensi: layar gelap & kuning putusan (sama di tema terang/gelap, seperti benda nyata). */
export const HUD_COLORS = {
  screen: '#1d2320',
  screenText: '#f2efe6',
  screenMuted: '#9aa39c',
  verdict: '#f6d23f',
  verdictText: '#141414',
  mark: '#f6d23f',
} as const;

/** Panel gelap gaya layar mesin: baris label + angka mesin tik yang bisa menghitung. */
export const WorldPanelView: React.FC<{ panel: WorldPanel; sceneSec: number; exit: number; color: ColorFn }> = ({ panel, sceneSec, exit, color }) => {
  const { theme, px, type } = useTheme();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const cue = useCue();
  const { t, p, gone } = useAppear(cue(panel.at, 0.2), panel.hideAt !== undefined ? cue(panel.hideAt, Infinity) : Infinity, exit);
  if (gone) return null;
  const mono = { fontFamily: theme.fonts.mono, fontWeight: 700, fontVariantNumeric: 'tabular-nums' } as const;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * -px(20)}px)`,
        width: '78%',
        display: 'flex',
        flexDirection: 'column',
        gap: px(14),
        padding: `${px(22)}px ${px(26)}px`,
        borderRadius: theme.radius.sm,
        background: HUD_COLORS.screen,
        boxShadow: theme.shadow.elevated,
        border: `${px(3)}px solid #000000`,
      }}
    >
      {panel.title ? (
        <div style={{ ...mono, fontSize: type.label * 0.82, letterSpacing: '0.14em', textTransform: 'uppercase', color: HUD_COLORS.screenMuted }}>{panel.title}</div>
      ) : null}
      {panel.rows.map((row, j) => {
        const start = cue(row.at, 0.4);
        const shown = row.showAt === undefined ? 1 : spring({ frame: frame - cue(row.showAt, 0) * fps, fps, config: SPRINGS.gentle });
        if (shown <= 0.01) return null;
        let text = row.text ?? '';
        if (row.value !== undefined) {
          const end = start + (row.duration ?? Math.max(1, Math.min(2, sceneSec - start - WORLD_HUD_TIMING.readoutTail)));
          const v = row.to === undefined ? row.value : interpolate(t, [start, end], [row.value, row.to], { ...clamp, easing: EASINGS.standard });
          text = formatValue(v, row);
        }
        return (
          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: px(14), opacity: shown, transform: `translateX(${(1 - shown) * -px(14)}px)` }}>
            {row.dot ? <div style={{ width: px(22), height: px(22), borderRadius: '50%', background: color(row.dot) ?? row.dot, border: `${px(3)}px solid ${HUD_COLORS.screenText}` }} /> : null}
            <div style={{ fontFamily: theme.fonts.heading, fontWeight: theme.fontWeights.strong, fontSize: type.caption, color: HUD_COLORS.screenText }}>{row.label}</div>
            {row.tag ? (
              <div style={{ ...mono, fontSize: type.label * 0.7, lineHeight: 1.1, padding: `${px(4)}px ${px(8)}px`, borderRadius: px(6), background: '#d9dcd6', color: '#141414' }}>{row.tag}</div>
            ) : null}
            <div style={{ flex: 1 }} />
            <div style={{ ...mono, fontSize: type.caption * 1.35, color: color(row.color) ?? HUD_COLORS.screenText, whiteSpace: 'nowrap' }}>{text}</div>
          </div>
        );
      })}
      {panel.note ? <div style={{ fontFamily: theme.fonts.mono, fontSize: type.label * 0.72, color: HUD_COLORS.screenMuted }}>{panel.note}</div> : null}
    </div>
  );
};

/** Teks dengan kata/frasa `sorot` diberi latar kuning (gaya stabilo). */
export const MarkedText: React.FC<{ text: string; marks?: string[] }> = ({ text, marks }) => {
  const { px } = useTheme();
  if (!marks?.length) return <>{text}</>;
  const esc = marks.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${esc.join('|')})`, 'g'));
  return (
    <>
      {parts.map((part, i) =>
        marks.includes(part) ? (
          <span key={i} style={{ background: HUD_COLORS.mark, color: HUD_COLORS.verdictText, borderRadius: px(4), padding: `0 ${px(4)}px` }}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};

/** Kartu keterangan: `catatan` (putih), `kutipan` (kutipan + sumber), `putusan` (kuning besar). */
export const WorldCardView: React.FC<{ card: WorldCard; p: number; start: number; color: ColorFn }> = ({ card, p, start, color }) => {
  const { theme, px, type, space } = useTheme();
  const c = theme.colors;
  const gaya = card.gaya ?? 'catatan';
  const verdict = gaya === 'putusan';
  const quote = gaya === 'kutipan';
  const ink = verdict ? HUD_COLORS.verdictText : c.text;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * -px(24)}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: space.sm,
        maxWidth: verdict ? '90%' : '86%',
        padding: verdict ? `${px(28)}px ${px(34)}px` : `${px(22)}px ${px(30)}px`,
        borderRadius: theme.radius.sm,
        background: verdict ? HUD_COLORS.verdict : c.surface,
        border: verdict ? `${px(3)}px solid #141414` : undefined,
        borderLeft: verdict ? `${px(3)}px solid #141414` : `${px(8)}px solid ${color(card.color) ?? (quote ? c.success : c.primary)}`,
        boxShadow: verdict ? theme.shadow.elevated : theme.shadow.card,
      }}
    >
      {card.tag ? (
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: theme.fontWeights.heading, fontSize: type.h3, color: ink, whiteSpace: 'nowrap' }}>{card.tag}</div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: px(6) }}>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: verdict ? theme.fontWeights.heading : theme.fontWeights.strong,
            fontStyle: quote ? 'italic' : undefined,
            fontSize: verdict ? type.caption * 1.25 : type.caption,
            lineHeight: 1.3,
            color: ink,
          }}
        >
          {quote ? '\u201C' : null}
          <MarkedText text={card.text} marks={card.sorot} />
          {quote ? '\u201D' : null}
        </div>
        {card.points ? <WorldCardPoints points={card.points} cardStart={start} /> : null}
        {card.source ? <div style={{ fontFamily: theme.fonts.mono, fontSize: type.label * 0.8, color: verdict ? '#4a4310' : c.muted }}>{card.source}</div> : null}
      </div>
    </div>
  );
};
