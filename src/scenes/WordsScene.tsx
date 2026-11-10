import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASINGS, SPRINGS, WORDS_TIMING } from '../config';
import { Sfx, normWord, useCue, useFontReady, useSceneMotion } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneLayout } from './SceneLayout';
import { LH, fitFontSize } from './StatementScene';
import type { WordsScene } from './types';

interface WordItem {
  text: string;
  highlight: boolean;
  at?: string | number;
}

function toItems(scene: WordsScene): WordItem[] {
  const hl = new Set((scene.accent ?? []).map(normWord));
  const raw = typeof scene.words === 'string' ? scene.words.split(/\s+/).filter(Boolean) : scene.words;
  return raw.map((w) =>
    typeof w === 'string'
      ? { text: w, highlight: hl.has(normWord(w)) }
      : { text: w.text, highlight: w.highlight ?? hl.has(normWord(w.text)), at: w.at },
  );
}

/**
 * Satu kata per ketukan memenuhi layar: menghentak masuk (skala + blur), mendorong pelan
 * selama tampil, lalu dipotong kata berikutnya. Kata sorotan bergradien + latar berkedip.
 */
export const WordsSceneView: React.FC<SceneProps<WordsScene>> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { theme, safe, type, px } = useTheme();
  const motion = useSceneMotion();
  const cue = useCue();
  const family = theme.fonts.heading;
  const weight = theme.fontWeights.heading;
  const font = (size: number) => `${weight} ${size}px ${family}`;
  const ready = useFontReady(font(100));
  const items = toItems(scene);
  const n = Math.max(1, items.length);
  const sceneSec = motion ? motion.frames / fps : 4;
  const t = frame / fps;
  const flash = scene.flash ?? true;

  // Waktu tiap kata: cue eksplisit → kata di narasi (otomatis) → dibagi rata. Selalu naik.
  const step = scene.interval ?? Math.max(WORDS_TIMING.minInterval, (sceneSec - WORDS_TIMING.lead - WORDS_TIMING.tail) / n);
  const times: number[] = [];
  items.forEach((it, i) => {
    const fallback = WORDS_TIMING.lead + i * step;
    const at = cue(it.at ?? it.text, fallback);
    times.push(i === 0 ? at : Math.max(at, times[i - 1] + WORDS_TIMING.minInterval * 0.6));
  });

  const sounds = times.map((at, i) => (
    <Sfx key={i} name={items[i].highlight ? 'impact' : 'tick'} at={at} volume={items[i].highlight ? 0.5 : 0.9} />
  ));

  if (!ready) return <SceneLayout background={scene.background}>{null}</SceneLayout>;

  const areaW = width - 2 * safe.x;
  const areaH = (height - safe.top - safe.bottom) * (scene.caption ? 0.75 : 0.85);
  let current = -1;
  for (let i = 0; i < n; i++) if (t >= times[i]) current = i;

  const word = current >= 0 ? items[current] : null;
  const age = current >= 0 ? t - times[current] : 0;
  const hold = current >= 0 ? (times[current + 1] ?? sceneSec) - times[current] : 1;
  const size = word ? fitFontSize(word.text, font, theme.headingTracking, 0.86, areaW, areaH, px(48), type.display * 2.6) : 0;

  const enter = spring({ frame: Math.round(age * fps), fps, config: SPRINGS.snappy, durationInFrames: Math.round(WORDS_TIMING.enter * fps) });
  const scale = interpolate(enter, [0, 1], [WORDS_TIMING.fromScale, 1]) * interpolate(age, [0, Math.max(0.3, hold)], [1, 1 + WORDS_TIMING.push], { extrapolateRight: 'clamp' });
  const blur = interpolate(enter, [0, 0.7], [WORDS_TIMING.fromBlur, 0], { extrapolateRight: 'clamp' });
  const tilt = (current % 2 === 0 ? -1 : 1) * WORDS_TIMING.tilt * (1 - enter);
  const flashOn = Boolean(word?.highlight && flash);
  const flashP = flashOn ? interpolate(age, [0, 0.08, Math.max(0.2, hold - 0.05)], [0, 1, 1], { extrapolateRight: 'clamp', easing: EASINGS.decelerate }) : 0;
  const capOpacity = interpolate(t, [0.2, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <SceneLayout background={scene.background}>
      {sounds}
      {flashP > 0 ? <AbsoluteFill style={{ background: theme.gradient, opacity: flashP }} /> : null}
      {word ? (
        <div
          key={current}
          style={{
            fontFamily: family,
            fontWeight: weight,
            fontSize: size,
            lineHeight: LH,
            letterSpacing: `${theme.headingTracking}em`,
            textAlign: 'center',
            width: areaW * 0.86,
            color: flashOn ? theme.colors.onPrimary : theme.colors.text,
            transform: `scale(${scale}) rotate(${tilt}deg)`,
            filter: blur > 0.3 ? `blur(${px(blur)}px)` : undefined,
            opacity: interpolate(enter, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {word.highlight && !flashOn ? (
            <span style={{ backgroundImage: theme.gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>
              {word.text}
            </span>
          ) : (
            word.text
          )}
        </div>
      ) : null}
      {scene.caption ? (
        <div
          style={{
            position: 'absolute',
            left: safe.x,
            right: safe.x,
            bottom: safe.bottom,
            textAlign: 'center',
            fontFamily: theme.fonts.body,
            fontWeight: theme.fontWeights.strong,
            fontSize: type.caption,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: flashOn ? theme.colors.onPrimary : theme.colors.muted,
            opacity: capOpacity,
          }}
        >
          {scene.caption}
        </div>
      ) : null}
      {/* Indikator progres tipis: titik per kata. */}
      <div style={{ position: 'absolute', top: safe.top * 0.6, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: px(10), opacity: capOpacity * 0.8 }}>
        {n <= WORDS_TIMING.maxDots
          ? items.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === current ? px(28) : px(10),
                  height: px(10),
                  borderRadius: px(10),
                  background: flashOn ? theme.colors.onPrimary : i <= current ? theme.colors.primary : theme.colors.border,
                }}
              />
            ))
          : null}
      </div>
    </SceneLayout>
  );
};
