import type { VideoConfig } from '../core/types';
import type { Feature, StatsScene } from '../scenes/types';
import { baseConfig, compact, type CTAContent, type TemplateBase } from './types';

export interface EducationalProductPromoProps extends TemplateBase {
  mascot: { src: string; name?: string; speech: string; title?: string };
  lessonsTitle?: string;
  lessons: Feature[];
  quiz: { title?: string; question: string; options: string[]; correct: number; reward?: string; caption?: string };
  stats?: StatsScene['stats'];
  cta: CTAContent;
}

/** Produk edukasi: Maskot → Kartu belajar → Game kuis → (Statistik) → CTA. */
export function educationalProductPromo(p: EducationalProductPromoProps): VideoConfig {
  return {
    ...baseConfig(p, 'PlayfulKids'),
    duration: p.duration ?? 22,
    scenes: compact([
      { type: 'mascot', mascot: p.mascot.src, name: p.mascot.name, speech: p.mascot.speech, title: p.mascot.title },
      { type: 'features', title: p.lessonsTitle ?? 'Belajar jadi seru!', features: p.lessons },
      {
        type: 'device',
        title: p.quiz.caption ?? 'Main sambil belajar',
        screen: { kind: 'quiz', title: p.quiz.title, question: p.quiz.question, options: p.quiz.options, correct: p.quiz.correct, reward: p.quiz.reward },
      },
      p.stats?.length ? { type: 'stats', stats: p.stats } : null,
      { type: 'cta', ...p.cta },
    ]),
  };
}
