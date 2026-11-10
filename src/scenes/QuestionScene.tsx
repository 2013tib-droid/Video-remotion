import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { SfxName } from '../config';
import { Reveal, Sfx, useCue, useStagger } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneLayout } from './SceneLayout';
import type { QuestionScene } from './types';

type State = 'idle' | 'select' | 'wrong' | 'strike' | 'correct';
interface OptionState {
  state: State;
  /** Detik saat keadaan terakhir dimulai (−∞ bila dari `initial`). */
  since: number;
  wrong: boolean;
  note?: string;
  noteSince: number;
}

const LETTERS = 'ABCDEFGH';

/** Suara tiap aksi soal. */
const STEP_SFX: Record<NonNullable<QuestionScene['steps']>[number]['action'], SfxName> = {
  select: 'tick',
  wrong: 'impact',
  strike: 'swipe',
  correct: 'ting',
};

/** Kartu soal pilihan ganda gaya aplikasi ujian, dengan aksi berurutan. */
export const QuestionSceneView: React.FC<SceneProps<QuestionScene>> = ({ scene }) => {
  const { theme, px, space } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = useCue();
  const stagger = useStagger('tight');
  const t = frame / fps;
  const enter = scene.enter ?? true;
  const PAST = -999;

  // Keadaan tiap pilihan pada waktu t.
  const states: OptionState[] = scene.options.map((_, i) => ({
    state: scene.initial?.correct === i ? 'correct' : scene.initial?.struck?.includes(i) ? 'strike' : scene.initial?.wrong?.includes(i) ? 'wrong' : 'idle',
    since: PAST,
    wrong: scene.initial?.wrong?.includes(i) ?? false,
    note: scene.initial?.notes?.[i],
    noteSince: PAST,
  }));
  (scene.steps ?? []).forEach((step, k) => {
    const at = cue(step.at, 0.8 + k * 1.2);
    if (t < at) return;
    const s = states[step.option];
    if (!s) return;
    s.state = step.action;
    s.since = at;
    if (step.action === 'wrong') s.wrong = true;
    if (step.note) {
      s.note = step.note;
      s.noteSince = at;
    }
  });

  const ring = scene.countdown ? (
    <Countdown seconds={scene.countdown} start={cue(scene.countdownAt, 0.6)} t={t} />
  ) : null;

  const card = (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: px(18),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: px(96) }}>
        <div style={{ fontFamily: theme.fonts.heading, fontWeight: 700, fontSize: px(44), color: theme.colors.text }}>{scene.label}</div>
        {ring}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: px(44),
          lineHeight: 1.45,
          color: theme.colors.text,
          marginBottom: px(10),
        }}
      >
        {scene.question}
      </div>
      {scene.options.map((opt, i) => {
        const row = <OptionRow key={i} letter={LETTERS[i]} text={opt} s={states[i]} t={t} />;
        return enter ? (
          <Reveal key={i} delay={stagger(i, 0.25)}>
            {row}
          </Reveal>
        ) : (
          row
        );
      })}
    </div>
  );

  const sounds = (scene.steps ?? []).map((step, k) => (
    <Sfx key={`sfx-${k}`} name={STEP_SFX[step.action]} at={cue(step.at, 0.8 + k * 1.2)} volume={step.action === 'wrong' ? 0.6 : 1} />
  ));

  return (
    <SceneLayout background={scene.background} style={{ justifyContent: 'center', gap: space.md }}>
      {sounds}
      {enter ? <Reveal style={{ width: '100%' }}>{card}</Reveal> : card}
    </SceneLayout>
  );
};

const OptionRow: React.FC<{ letter: string; text: string; s: OptionState; t: number }> = ({ letter, text, s, t }) => {
  const { theme, px } = useTheme();
  const c = theme.colors;
  const age = t - s.since;
  const tone =
    s.state === 'correct' ? c.success : s.state === 'wrong' ? c.danger : s.state === 'select' ? c.primary : s.state === 'strike' && s.wrong ? c.danger : null;
  // Getar saat salah, membesar sebentar saat benar.
  const shake = s.state === 'wrong' && age < 0.5 ? Math.sin(age * 55) * (1 - age / 0.5) * 14 : 0;
  const pop = s.state === 'correct' ? 1 + 0.04 * Math.max(0, Math.sin(Math.min(age, 0.35) / 0.35 * Math.PI)) : 1;
  const struck = s.state === 'strike';
  const strikeP = struck ? interpolate(age, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const noteP = s.note ? interpolate(t - s.noteSince, [0.1, 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const mark = s.state === 'correct' ? '✓' : s.state === 'wrong' || (struck && s.wrong) ? '✕' : struck ? '✕' : letter;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: px(28),
        height: px(108),
        padding: `0 ${px(30)}px`,
        borderRadius: px(26),
        background: tone ? `${tone}22` : c.surface,
        border: `${px(3)}px solid ${tone ?? c.border}`,
        boxShadow: s.state === 'correct' ? `0 0 ${px(50)}px ${c.success}55` : undefined,
        transform: `translateX(${px(shake)}px) scale(${pop})`,
        opacity: struck ? interpolate(strikeP, [0, 1], [1, 0.55]) : 1,
      }}
    >
      <div
        style={{
          flex: 'none',
          width: px(66),
          height: px(66),
          borderRadius: 999,
          border: `${px(3)}px solid ${tone ?? c.border}`,
          background: s.state === 'correct' ? c.success : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: theme.fonts.mono,
          fontWeight: 700,
          fontSize: px(30),
          color: s.state === 'correct' ? '#06140b' : tone ?? c.muted,
        }}
      >
        {mark}
      </div>
      <div style={{ position: 'relative', fontFamily: theme.fonts.body, fontWeight: 500, fontSize: px(42), color: c.text, whiteSpace: 'nowrap' }}>
        {text}
        {struck ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '52%',
              height: px(4),
              width: `${strikeP * 100}%`,
              background: s.wrong ? c.danger : c.muted,
              borderRadius: 4,
            }}
          />
        ) : null}
      </div>
      {s.note ? (
        <div
          style={{
            position: 'absolute',
            top: px(-20),
            right: px(24),
            opacity: noteP,
            transform: `translateY(${px(12 * (1 - noteP))}px)`,
            padding: `${px(8)}px ${px(16)}px`,
            borderRadius: px(12),
            background: c.surfaceAlt,
            border: `${px(2)}px solid ${c.secondary}`,
            fontFamily: theme.fonts.mono,
            fontWeight: 700,
            fontSize: px(24),
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: c.secondary,
            whiteSpace: 'nowrap',
          }}
        >
          {s.note}
        </div>
      ) : null}
    </div>
  );
};

const Countdown: React.FC<{ seconds: number; start: number; t: number }> = ({ seconds, start, t }) => {
  const { theme, px } = useTheme();
  const elapsed = Math.min(seconds, Math.max(0, t - start));
  const left = Math.ceil(seconds - elapsed);
  const size = px(96);
  const r = size / 2 - px(6);
  const circ = 2 * Math.PI * r;
  const done = elapsed >= seconds;
  const color = done ? theme.colors.danger : theme.colors.primary;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.colors.border} strokeWidth={px(7)} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={px(7)}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (elapsed / seconds)}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: theme.fonts.mono,
          fontWeight: 700,
          fontSize: px(38),
          color,
        }}
      >
        {left}
      </div>
    </div>
  );
};
