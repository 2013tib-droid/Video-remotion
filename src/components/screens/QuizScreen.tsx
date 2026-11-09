import React from 'react';
import { interpolate } from 'remotion';
import { Reveal, useProgress, useSpring, useStagger } from '../../motion';
import { useTheme } from '../../themes';
import { AppScreen } from './AppScreen';

export interface QuizScreenProps {
  title?: string;
  question: string;
  options: string[];
  /** Index jawaban benar — akan "ditekan" lalu dirayakan. */
  correct: number;
  reward?: string;
  delay?: number;
}

/** Interaksi game kuis: pertanyaan → opsi muncul → jawaban benar dipilih → hadiah. */
export const QuizScreen: React.FC<QuizScreenProps> = ({ title = 'Kuis', question, options, correct, reward = '+10 ⭐', delay = 0 }) => {
  const { theme, type, px } = useTheme();
  const stagger = useStagger();
  const pickAt = stagger(options.length, delay + 0.5) + 0.6;
  const picked = useProgress(pickAt, pickAt + 0.15) > 0.5;
  const pop = useSpring({ delay: pickAt, spring: 'bouncy' });
  const rewardP = useSpring({ delay: pickAt + 0.35, spring: 'bouncy' });
  return (
    <AppScreen title={title}>
      <Reveal delay={delay + 0.2}>
        <div
          style={{
            padding: px(26),
            borderRadius: px(theme.radius.md),
            background: theme.gradient,
            color: theme.colors.onPrimary,
            fontFamily: theme.fonts.heading,
            fontWeight: theme.fontWeights.heading,
            fontSize: type.caption,
            textAlign: 'center',
          }}
        >
          {question}
        </div>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: px(16) }}>
        {options.map((o, i) => {
          const isCorrect = i === correct;
          const active = picked && isCorrect;
          return (
            <Reveal key={i} delay={stagger(i, delay + 0.5)} preset="pop" spring="bouncy">
              <div
                style={{
                  padding: `${px(30)}px ${px(12)}px`,
                  borderRadius: px(theme.radius.sm),
                  textAlign: 'center',
                  fontWeight: theme.fontWeights.strong,
                  fontSize: type.subtitle,
                  background: active ? theme.colors.success : theme.colors.surface,
                  color: active ? '#fff' : theme.colors.text,
                  border: `${px(3)}px solid ${active ? theme.colors.success : theme.colors.border}`,
                  transform: active ? `scale(${interpolate(pop, [0, 0.5, 1], [1, 1.12, 1.04])})` : undefined,
                  opacity: picked && !isCorrect ? 0.5 : 1,
                }}
              >
                {o}
              </div>
            </Reveal>
          );
        })}
      </div>
      <div
        style={{
          alignSelf: 'center',
          marginTop: px(20),
          fontFamily: theme.fonts.heading,
          fontWeight: theme.fontWeights.heading,
          fontSize: type.h3,
          color: theme.colors.accent,
          transform: `scale(${rewardP}) translateY(${interpolate(rewardP, [0, 1], [px(40), 0])}px)`,
          opacity: Math.min(1, rewardP),
          textShadow: '0 4px 0 rgba(0,0,0,0.1)',
        }}
      >
        Benar! {reward}
      </div>
    </AppScreen>
  );
};
