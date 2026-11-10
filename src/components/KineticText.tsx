/**
 * Tipografi kinetik: kata muncul dengan gaya bervariasi (rise/pop/blur/typewriter/slam),
 * sinkron dengan narasi, dan kata sorotan mendapat aksen (punch + sapuan warna + coretan).
 * Subtitle/paragraf memakai <LineText>: fade naik kalem per baris.
 */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  ACCENT_TIMING,
  EASINGS,
  SPRINGS,
  TEXT_ANIMATIONS,
  TYPEWRITER,
  type AccentStroke,
  type TextAnimation,
  type TextAnimationPreset,
} from '../config';
import {
  accentFlags,
  accentStroke,
  normWord,
  useCueWords,
  useFontReady,
  useMotionEnergy,
  useSceneExit,
  useSceneMotion,
  useSceneText,
  type CueWord,
} from '../motion';
import { useTheme } from '../themes';

const clamp01 = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export interface WordPlan {
  word: string;
  /** Detik kata mulai muncul. */
  start: number;
  /** Detik kata selesai muncul (typewriter: huruf terakhir). */
  end: number;
  /** Kata ditemukan di narasi (muncul tepat saat diucapkan). */
  cued: boolean;
}

/**
 * Jadwal muncul tiap kata. Kata yang diucapkan di narasi (dalam jendela [from, until])
 * muncul tepat pada cue-nya, berurutan; kata lain memakai jeda bergiliran preset.
 */
export function planWords(
  words: string[],
  anim: TextAnimation,
  delay: number,
  cues: CueWord[] = [],
  until = Infinity,
): WordPlan[] {
  const preset: TextAnimationPreset = TEXT_ANIMATIONS[anim];
  const out: WordPlan[] = [];
  let k = 0;
  let prev: WordPlan | null = null;
  for (const word of words) {
    const typing = anim === 'typewriter' ? word.length * TYPEWRITER.charStep : 0;
    let start: number = prev ? (anim === 'typewriter' ? prev.end + TYPEWRITER.charStep * 2 : prev.start + preset.stagger) : delay;
    let cued = false;
    const target = normWord(word);
    if (target) {
      for (let j = k; j < cues.length; j++) {
        const c = cues[j];
        if (c.start > until) break;
        if (c.start >= delay - 0.05 && normWord(c.w) === target) {
          start = Math.max(c.start, prev ? prev.start : delay);
          cued = true;
          k = j + 1;
          break;
        }
      }
    }
    const plan: WordPlan = { word, start, end: start + (anim === 'typewriter' ? typing : preset.duration), cued };
    out.push(plan);
    prev = plan;
  }
  return out;
}

/** Lama total kata-kata muncul tanpa narasi (detik) — untuk menjadwalkan elemen sesudahnya. */
export function textRevealSpan(text: string, anim: TextAnimation): number {
  const plan = planWords(text.split(/\s+/).filter(Boolean), anim, 0);
  return plan.length ? plan[plan.length - 1].end : 0;
}

/**
 * Detik saat kata terakhir judul mulai muncul, memperhitungkan cue narasi scene ini.
 * Dipakai agar subtitle tidak mendahului judul yang sinkron dengan narasi.
 */
export function useTextLastStart(text: string, anim: TextAnimation, delay: number): number {
  const cues = useCueWords();
  const motion = useSceneMotion();
  const { fps } = useVideoConfig();
  const until = motion ? motion.frames / fps - 1.2 : Infinity;
  const plan = planWords(text.split(/\s+/).filter(Boolean), anim, delay, cues, until);
  return plan.length ? plan[plan.length - 1].start : delay;
}

export interface KineticTextProps {
  text: string;
  /** Kata/frasa yang disorot. */
  highlight?: string;
  animation: TextAnimation;
  /** Detik mulai. */
  delay?: number;
  /** Ukuran font (px) — untuk ketebalan coretan. */
  fontSize: number;
  /** Urutan kata sorotan pertama teks ini di antara teks lain dalam scene yang sama. */
  accentOffset?: number;
  /** Batas akhir cue narasi (detik dari awal scene). Default: 1,2 dtk sebelum scene berakhir. */
  cueUntil?: number;
  /** Warna teks dasar (sebelum sapuan gradien). */
  color: string;
  style?: React.CSSProperties;
}

/** Kata-kata kinetik dalam kontainer flex-wrap (gaya tipografi dari `style`). */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  highlight,
  animation,
  delay = 0,
  fontSize,
  accentOffset = 0,
  cueUntil,
  color,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneText = useSceneText();
  const motion = useSceneMotion();
  const cues = useCueWords();
  const words = text.split(/\s+/).filter(Boolean);
  const until = cueUntil ?? (motion ? motion.frames / fps - 1.2 : Infinity);
  const plan = planWords(words, animation, delay, cues, until);
  const flags = accentFlags(text, highlight, sceneText.emphasis);
  const style_ = sceneText.highlightStyle;
  const t = frame / fps;

  // Kursor mesin ketik: di kata terakhir yang sudah mulai diketik.
  let cursorAt = -1;
  let cursorOn = false;
  if (animation === 'typewriter' && plan.length) {
    for (let i = 0; i < plan.length; i++) if (t >= plan[i].start) cursorAt = i;
    const last = plan[plan.length - 1];
    if (cursorAt >= 0) {
      const typing = t <= plan[cursorAt].end;
      const sinceTyped = t - plan[cursorAt].end;
      const done = cursorAt === plan.length - 1 && t > last.end + TYPEWRITER.cursorLinger;
      cursorOn = !done && (typing || Math.floor(sinceTyped / TYPEWRITER.blink) % 2 === 1);
    }
  }

  let accentIndex = sceneText.accentBase + accentOffset;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.26em', color, ...style }}>
      {plan.map((p, i) => {
        const f = flags[i];
        const isAccent = f.hl || f.emph;
        let accent: AccentInfo | null = null;
        if (isAccent) {
          const idx = accentIndex++;
          if (style_ !== 'none') {
            const at =
              f.emph && p.cued
                ? p.start + ACCENT_TIMING.afterCue
                : animation === 'typewriter'
                  ? p.end + 0.1
                  : p.start + ACCENT_TIMING.after;
            accent = { at, stroke: accentStroke(style_, idx), sweep: f.hl };
          }
        }
        return (
          <KineticWord
            key={i}
            plan={p}
            animation={animation}
            accent={accent}
            staticGradient={style_ === 'none' && f.hl}
            cursor={i === cursorAt ? cursorOn : null}
            fontSize={fontSize}
            color={color}
          />
        );
      })}
    </div>
  );
};

interface AccentInfo {
  /** Detik aksen dimulai. */
  at: number;
  stroke: AccentStroke | null;
  /** Sapuan warna gradien (kata highlight). Kata emphasis saja: punch + coretan. */
  sweep: boolean;
}

const KineticWord: React.FC<{
  plan: WordPlan;
  animation: TextAnimation;
  accent: AccentInfo | null;
  staticGradient: boolean;
  /** null = tanpa kursor; true/false = kursor tampil/padam (kedip). */
  cursor: boolean | null;
  fontSize: number;
  color: string;
}> = ({ plan, animation, accent, staticGradient, cursor, fontSize, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme, px } = useTheme();
  const energy = useMotionEnergy();
  const exit = useSceneExit(plan.start);
  const t = frame / fps;
  const preset: TextAnimationPreset = TEXT_ANIMATIONS[animation];
  const typewriter = animation === 'typewriter';

  // --- Masuk ---
  const p = typewriter
    ? 1
    : spring({
        frame,
        fps,
        config: SPRINGS[preset.spring],
        delay: Math.round(plan.start * fps),
        durationInFrames: Math.max(1, Math.round(preset.duration * fps)),
      });
  const from = preset.from;
  const lerp = (a: number | undefined, neutral: number) => (a === undefined ? neutral : a + (neutral - a) * p);
  const started = t >= plan.start;
  const opacity = !started
    ? 0
    : from.opacity === undefined
      ? 1
      : interpolate(p, [0, preset.opacityRamp], [from.opacity, 1], clamp01);
  const y = lerp(from.y, 0);
  const scale = lerp(from.scale, 1);
  const blur = Math.max(0, lerp(from.blur, 0));

  // --- Aksen ---
  const accentP = (dur: number, easing = EASINGS.emphasized) =>
    accent ? interpolate(t, [accent.at, accent.at + dur], [0, 1], { ...clamp01, easing }) : 0;
  const punchP = accentP(ACCENT_TIMING.punch, EASINGS.standard);
  const punch = accent ? 1 + ACCENT_TIMING.punchScale * Math.sin(Math.PI * punchP) : 1;
  const sweep = accent?.sweep ? accentP(ACCENT_TIMING.sweep) : 0;
  const draw = accent?.stroke ? accentP(ACCENT_TIMING.draw) : 0;

  // --- Mesin ketik ---
  const shown = typewriter
    ? Math.max(0, Math.min(plan.word.length, started ? Math.floor((t - plan.start) / TYPEWRITER.charStep) + 1 : 0))
    : plan.word.length;
  const visible = plan.word.slice(0, shown);
  const rest = plan.word.slice(shown);

  const fill: React.CSSProperties = staticGradient
    ? gradientFill(theme.gradient)
    : accent?.sweep && sweep > 0
      ? {
          ...gradientFill(`linear-gradient(${color}, ${color}), ${theme.gradient}`),
          backgroundSize: `${(1 - sweep) * 100}% 100%, 100% 100%`,
          backgroundPosition: 'right top, left top',
          backgroundRepeat: 'no-repeat',
        }
      : {};

  const exitY = px(energy.exit.y) * exit;
  const exitBlur = px(energy.exit.blur) * exit;
  const inner = (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: y !== 0 || scale !== 1 ? `translateY(${y}em) scale(${scale})` : undefined,
        filter: blur > 0.002 ? `blur(${blur}em)` : undefined,
        whiteSpace: 'pre',
      }}
    >
      <span style={fill}>{visible}</span>
      {cursor !== null ? <Cursor on={cursor} /> : null}
      {rest ? <span style={{ visibility: 'hidden' }}>{rest}</span> : null}
    </span>
  );

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        isolation: 'isolate',
        opacity: 1 - exit,
        transform: exit > 0 || punch !== 1 ? `translateY(${-exitY}px) scale(${punch})` : undefined,
        filter: exitBlur > 0.05 ? `blur(${exitBlur}px)` : undefined,
      }}
    >
      {accent?.stroke && draw > 0 ? <Stroke kind={accent.stroke} progress={draw} fontSize={fontSize} /> : null}
      {preset.mask ? (
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
            padding: '0.1em 0.08em 0.18em',
            margin: '-0.1em -0.08em -0.18em',
          }}
        >
          {inner}
        </span>
      ) : (
        inner
      )}
    </span>
  );
};

function gradientFill(image: string): React.CSSProperties {
  return {
    backgroundImage: image,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
  };
}

/** Kursor mesin ketik: lebar nol agar tata letak tidak bergeser. */
const Cursor: React.FC<{ on: boolean }> = ({ on }) => {
  const { theme } = useTheme();
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 0 }}>
      <span
        style={{
          position: 'absolute',
          left: '0.03em',
          bottom: '-0.16em',
          width: '0.07em',
          height: '0.92em',
          borderRadius: '0.03em',
          background: theme.colors.primary,
          opacity: on ? 1 : 0,
        }}
      />
    </span>
  );
};

/** Coretan di belakang kata sorotan: blok stabilo, garis bawah, atau lingkaran tangan. */
const Stroke: React.FC<{ kind: AccentStroke; progress: number; fontSize: number }> = ({ kind, progress, fontSize }) => {
  const { theme, px } = useTheme();
  const base: React.CSSProperties = { position: 'absolute', zIndex: -1, pointerEvents: 'none' };
  if (kind === 'marker') {
    return (
      <span
        style={{
          ...base,
          left: '-0.08em',
          right: '-0.08em',
          top: '0.5em',
          height: '0.5em',
          borderRadius: px(8),
          background: `color-mix(in srgb, ${theme.colors.primary} 42%, transparent)`,
          transform: `skewX(-8deg) scaleX(${progress})`,
          transformOrigin: 'left center',
        }}
      />
    );
  }
  if (kind === 'underline') {
    const thick = Math.max(px(5), fontSize * 0.075);
    return (
      <span
        style={{
          ...base,
          left: '-0.02em',
          right: '-0.02em',
          bottom: '0.02em',
          height: thick,
          borderRadius: thick,
          background: theme.colors.accent,
          transform: `scaleX(${progress})`,
          transformOrigin: 'left center',
        }}
      />
    );
  }
  const thick = Math.max(px(4), fontSize * 0.05);
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ ...base, left: '-0.2em', right: '-0.2em', top: '-0.06em', bottom: '-0.06em', width: 'calc(100% + 0.4em)', height: 'calc(100% + 0.12em)', overflow: 'visible' }}
    >
      <path
        d="M 12 30 C 30 6, 82 4, 95 34 C 104 60, 80 96, 46 95 C 14 94, -2 70, 4 46 C 8 28, 30 12, 60 10"
        fill="none"
        stroke={theme.colors.accent}
        strokeWidth={thick}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - progress}
      />
    </svg>
  );
};

/**
 * Subtitle/paragraf kalem: fade naik per BARIS (bukan per kata).
 * Baris diukur dari tata letak browser setelah font termuat.
 */
export const LineText: React.FC<{
  text: string;
  delay?: number;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, fontFamily, fontWeight, fontSize, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const fontReady = useFontReady(`${fontWeight} ${Math.round(fontSize)}px ${fontFamily}`);
  const [lines, setLines] = useState<number[] | null>(null);
  const [handle] = useState(() => delayRender('Mengukur baris teks'));
  const released = useRef(false);
  useLayoutEffect(() => {
    if (!fontReady || !ref.current) return;
    const spans = Array.from(ref.current.querySelectorAll<HTMLElement>('[data-w]'));
    let line = 0;
    let top = spans[0]?.offsetTop ?? 0;
    const next = spans.map((s) => {
      if (s.offsetTop > top + 2) {
        line++;
        top = s.offsetTop;
      }
      return line;
    });
    setLines(next);
    if (!released.current) {
      released.current = true;
      continueRender(handle);
    }
  }, [fontReady, text, handle]);
  const words = text.split(/\s+/).filter(Boolean);
  const step = TEXT_ANIMATIONS.fade.stagger;
  return (
    <div ref={ref} style={{ position: 'relative', fontFamily, fontWeight, fontSize, ...style }}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <LineWord word={w} delay={delay + (lines?.[i] ?? 0) * step} hidden={!lines} />
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </div>
  );
};

const LineWord: React.FC<{ word: string; delay: number; hidden: boolean }> = ({ word, delay, hidden }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px } = useTheme();
  const energy = useMotionEnergy();
  const exit = useSceneExit(delay);
  const preset = TEXT_ANIMATIONS.fade;
  const p = spring({
    frame,
    fps,
    config: SPRINGS[preset.spring],
    delay: Math.round(delay * fps),
    durationInFrames: Math.round(preset.duration * fps),
  });
  const y = (preset.from.y ?? 0) * (1 - p);
  const blur = px(energy.exit.blur) * exit;
  return (
    <span
      data-w=""
      style={{
        display: 'inline-block',
        opacity: hidden ? 0 : p * (1 - exit),
        transform: `translateY(calc(${y}em - ${px(energy.exit.y) * exit}px))`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}
    >
      {word}
    </span>
  );
};
