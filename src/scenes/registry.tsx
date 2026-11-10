import React from 'react';
import {
  CTASceneView,
  ChartSceneView,
  ComparisonSceneView,
  FeaturesSceneView,
  HeroSceneView,
  LogoSceneView,
  MascotSceneView,
  StatsSceneView,
  TestimonialSceneView,
  TimelineSceneView,
} from './BasicScenes';
import { CalculationSceneView } from './CalculationScene';
import { DeviceSceneView } from './DeviceScene';
import { QuestionSceneView } from './QuestionScene';
import { RelationSceneView } from './RelationScene';
import type { SceneProps } from './registry-types';
import type { SceneConfig, SceneType } from './types';

/**
 * Peta tipe scene → komponen. Menambah tipe scene baru:
 * 1) tambahkan interface di types.ts, 2) buat komponen, 3) daftarkan di sini.
 */
const REGISTRY: { [T in SceneType]: React.FC<SceneProps<Extract<SceneConfig, { type: T }>>> } = {
  logo: LogoSceneView,
  hero: HeroSceneView,
  mascot: MascotSceneView,
  features: FeaturesSceneView,
  stats: StatsSceneView,
  chart: ChartSceneView,
  comparison: ComparisonSceneView,
  timeline: TimelineSceneView,
  device: DeviceSceneView,
  calculation: CalculationSceneView,
  testimonial: TestimonialSceneView,
  cta: CTASceneView,
  question: QuestionSceneView,
  relation: RelationSceneView,
};

export const SceneRenderer: React.FC<SceneProps> = ({ scene, brand }) => {
  const Component = REGISTRY[scene.type] as React.FC<SceneProps>;
  if (!Component) throw new Error(`Tipe scene tidak dikenal: "${scene.type}"`);
  return <Component scene={scene} brand={brand} />;
};
