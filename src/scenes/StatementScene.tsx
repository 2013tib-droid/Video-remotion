import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { KineticText } from '../components';
import { EASINGS } from '../config';
import { countAccents, measureText, useCue, useFontReady, useSceneMotion, useSceneText, useTextAnimation } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneLayout } from './SceneLayout';
import type { StatementScene } from './types';

/** Tinggi baris teks statement (em). */
const LH = 1.08;
/** Sisakan ruang untuk punch (8%) dan coretan; `slam` (mulai 1,3×) butuh lebih. */
const HEADROOM = 0.88;
const HEADROOM_SLAM = 0.8;
/** Jarak antar kata (em) — sama dengan columnGap KineticText. */
const GAP = 0.26;

/**
 * Ukuran font terbesar agar `text` muat di kotak maxW × maxH:
 * tiap kata ≤ lebar, dan jumlah baris hasil bungkus × tinggi baris ≤ tinggi.
 */
function fitFontSize(
  text: string,
  font: (size: number) => string,
  tracking: number,
  headroom: number,
  maxW: number,
  maxH: number,
  min: number,
  max: number,
): number {
  const words = text.split(/\s+/).filter(Boolean);
  const w100 = words.map((w) => measureText(w, font(100)) + tracking * 100 * w.length);
  const fits = (s: number) => {
    const k = s / 100;
    const limit = maxW * headroom;
    let rows = 1;
    let line = 0;
    for (const w of w100) {
      const ww = w * k;
      if (ww > limit) return false;
      const add = line === 0 ? ww : line + GAP * s + ww;
      if (add > limit) {
        rows++;
        line = ww;
      } else line = add;
    }
    return rows * s * LH <= maxH;
  };
  let lo = min;
  let hi = max;
  if (fits(hi)) return hi;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo);
}

/** Teks besar ala Reels/TikTok: `stack` (bertumpuk) atau `replace` (berganti memenuhi layar). */
export const StatementSceneView: React.FC<SceneProps<StatementScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { theme, safe, space, type, px } = useTheme();
  const motion = useSceneMotion();
  const { emphasis } = useSceneText();
  const cue = useCue();
  const anim = useTextAnimation('display');
  const mode = scene.style ?? 'stack';
  const family = theme.fonts.heading;
  const weight = theme.fontWeights.heading;
  const font = (size: number) => `${weight} ${size}px ${family}`;
  const ready = useFontReady(font(100));

  const lines = scene.lines;
  const n = Math.max(1, lines.length);
  const sceneSec = motion ? motion.frames / fps : 5;
  const t = frame / fps;

  // Waktu muncul tiap baris (cue narasi atau dibagi rata), selalu naik.
  const times: number[] = [];
  const step = mode === 'stack' ? Math.min(1.4, Math.max(0.5, (sceneSec - 1.6) / n)) : Math.max(0.6, (sceneSec - 0.4) / n);
  lines.forEach((l, i) => {
    const fallback = (mode === 'stack' ? 0.25 : 0.2) + i * step;
    const at = cue(l.at, fallback);
    times.push(i === 0 ? at : Math.max(at, times[i - 1] + 0.3));
  });

  // Urutan aksen per baris (lanjutan dari baris sebelumnya).
  const offsets: number[] = [];
  lines.reduce((acc, l, i) => {
    offsets[i] = acc;
    return acc + countAccents(l.text, l.highlight, emphasis);
  }, 0);

  if (!ready) return <SceneLayout background={scene.background}>{null}</SceneLayout>;

  const areaW = width - 2 * safe.x;
  const areaH = height - safe.top - safe.bottom;
  const min = px(36);
  const headroom = anim === 'slam' ? HEADROOM_SLAM : HEADROOM;
  // stack: satu ukuran untuk semua baris (yang terkecil) agar tumpukan rapi; replace: tiap frasa memenuhi layar.
  const fitted = lines.map((l) =>
    mode === 'stack'
      ? fitFontSize(l.text, font, theme.headingTracking, headroom, areaW, (areaH - space.md * (n - 1)) / n, min, type.display * 1.3)
      : fitFontSize(l.text, font, theme.headingTracking, headroom, areaW, areaH * 0.85, min, type.display * 1.8),
  );
  const sizes = mode === 'stack' ? fitted.map(() => Math.min(...fitted)) : fitted;

  const lineEl = (i: number, cueUntil?: number) => (
    <KineticText
      key={i}
      text={lines[i].text}
      highlight={lines[i].highlight}
      animation={anim}
      delay={times[i]}
      fontSize={sizes[i]}
      accentOffset={offsets[i]}
      cueUntil={cueUntil}
      color={theme.colors.text}
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontSize: sizes[i],
        lineHeight: LH,
        letterSpacing: `${theme.headingTracking}em`,
        justifyContent: 'center',
        textAlign: 'center',
        // Lebar sama dengan perhitungan fit → baris terbungkus persis seperti yang diukur.
        width: areaW * headroom,
        maxWidth: '100%',
      }}
    />
  );

  if (mode === 'stack') {
    return (
      <SceneLayout background={scene.background} style={{ gap: space.md }}>
        {lines.map((_, i) => lineEl(i))}
      </SceneLayout>
    );
  }

  return (
    <SceneLayout background={scene.background}>
      {lines.map((_, i) => {
        const start = times[i];
        const next = times[i + 1];
        if (t < start - 0.05 || (next !== undefined && t >= next)) return null;
        const out =
          next === undefined
            ? 0
            : interpolate(t, [next - 0.22, next], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.accelerate });
        return (
          <AbsoluteFill
            key={i}
            style={{
              padding: `${safe.top}px ${safe.x}px ${safe.bottom}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1 - out,
              transform: out > 0 ? `translateY(${-px(30) * out}px) scale(${1 - 0.06 * out})` : undefined,
            }}
          >
            {lineEl(i, next !== undefined ? next - 0.3 : undefined)}
          </AbsoluteFill>
        );
      })}
    </SceneLayout>
  );
};
