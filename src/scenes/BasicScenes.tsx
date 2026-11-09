import React from 'react';
import {
  CTAButton,
  ChartAnimation,
  ComparisonTable,
  CounterAnimation,
  FeatureGrid,
  HeroSection,
  Icon,
  LogoReveal,
  Mascot,
  Pill,
  QuoteCard,
  Surface,
  TimelineAnimation,
} from '../components';
import { Reveal, useStagger } from '../motion';
import { useTheme } from '../themes';
import { CONTENT_DELAY, SceneLayout, SceneTitle } from './SceneLayout';
import type {
  CTAScene,
  ChartScene,
  ComparisonScene,
  FeaturesScene,
  HeroScene,
  LogoScene,
  MascotScene,
  StatsScene,
  TestimonialScene,
  TimelineScene,
} from './types';
import type { SceneProps } from './registry-types';

export const LogoSceneView: React.FC<SceneProps<LogoScene>> = ({ scene, brand }) => (
  <SceneLayout background={scene.background}>
    <LogoReveal name={scene.name ?? brand.name} logo={scene.logo ?? brand.logo} tagline={scene.tagline} delay={0.2} />
  </SceneLayout>
);

export const HeroSceneView: React.FC<SceneProps<HeroScene>> = ({ scene }) => {
  const { isPortrait } = useTheme();
  return (
    <SceneLayout background={scene.background}>
      <HeroSection
        eyebrow={scene.eyebrow}
        title={scene.title}
        highlight={scene.highlight}
        subtitle={scene.subtitle}
        titleSize={isPortrait && scene.title.length > 28 ? 'h1' : 'display'}
        delay={0.15}
      >
        {scene.button ? <CTAButton label={scene.button} pulse={false} /> : undefined}
      </HeroSection>
    </SceneLayout>
  );
};

export const MascotSceneView: React.FC<SceneProps<MascotScene>> = ({ scene }) => {
  const { isPortrait } = useTheme();
  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} size="h1" />
      <Mascot src={scene.mascot} speech={scene.speech} delay={0.3} size={isPortrait ? 560 : 400} />
      {scene.name ? (
        <Reveal delay={1.2} preset="pop" spring="bouncy">
          <Pill tone="primary">{scene.name}</Pill>
        </Reveal>
      ) : null}
    </SceneLayout>
  );
};

export const FeaturesSceneView: React.FC<SceneProps<FeaturesScene>> = ({ scene }) => (
  <SceneLayout background={scene.background}>
    <SceneTitle {...scene} />
    <FeatureGrid features={scene.features} columns={scene.columns} delay={CONTENT_DELAY} />
  </SceneLayout>
);

export const StatsSceneView: React.FC<SceneProps<StatsScene>> = ({ scene }) => {
  const { isPortrait, space, px } = useTheme();
  const stagger = useStagger('relaxed');
  const cols = isPortrait ? (scene.stats.length === 4 ? 2 : 1) : Math.min(scene.stats.length, 4);
  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: space.lg, width: '100%', maxWidth: px(1600) }}>
        {scene.stats.map((s, i) => (
          <CounterAnimation key={i} {...s} size={cols > 2 ? 'h2' : 'display'} delay={stagger(i, CONTENT_DELAY)} />
        ))}
      </div>
    </SceneLayout>
  );
};

export const ChartSceneView: React.FC<SceneProps<ChartScene>> = ({ scene }) => {
  const { px } = useTheme();
  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} />
      <Reveal delay={CONTENT_DELAY - 0.2} style={{ width: '100%', maxWidth: px(1200) }}>
        <Surface padding={48} radius="lg">
          <ChartAnimation
            data={scene.data}
            highlight={scene.highlightBar}
            highlightLabel={scene.highlightLabel}
            orientation={scene.orientation}
            prefix={scene.prefix}
            suffix={scene.suffix}
            decimals={scene.decimals}
            delay={CONTENT_DELAY}
          />
        </Surface>
      </Reveal>
    </SceneLayout>
  );
};

export const ComparisonSceneView: React.FC<SceneProps<ComparisonScene>> = ({ scene }) => (
  <SceneLayout background={scene.background}>
    <SceneTitle {...scene} />
    <ComparisonTable columns={scene.columns} rows={scene.rows} highlightColumn={scene.highlightColumn} delay={CONTENT_DELAY} />
  </SceneLayout>
);

export const TimelineSceneView: React.FC<SceneProps<TimelineScene>> = ({ scene }) => (
  <SceneLayout background={scene.background}>
    <SceneTitle {...scene} />
    <TimelineAnimation steps={scene.steps} delay={CONTENT_DELAY} />
  </SceneLayout>
);

export const TestimonialSceneView: React.FC<SceneProps<TestimonialScene>> = ({ scene }) => (
  <SceneLayout background={scene.background}>
    <SceneTitle {...scene} />
    <QuoteCard {...scene} delay={scene.title ? CONTENT_DELAY : 0.2} />
  </SceneLayout>
);

export const CTASceneView: React.FC<SceneProps<CTAScene>> = ({ scene, brand }) => {
  const { theme, type, px, space } = useTheme();
  const stagger = useStagger();
  const url = scene.url ?? brand.url;
  const showLogo = scene.showLogo ?? true;
  return (
    <SceneLayout background={scene.background}>
      {showLogo ? (
        <Reveal delay={0.1} preset="pop" spring="gentle" style={{ display: 'flex', alignItems: 'center', gap: px(24) }}>
          <div
            style={{
              width: px(120),
              height: px(120),
              borderRadius: px(theme.radius.md),
              background: brand.logo ? theme.colors.surface : theme.gradient,
              border: `${px(2)}px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadow.card,
              color: theme.colors.onPrimary,
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.heading,
              fontSize: px(60),
            }}
          >
            {brand.logo ? <Icon src={brand.logo} size={76} /> : brand.name.charAt(0)}
          </div>
          <div style={{ fontFamily: theme.fonts.heading, fontWeight: theme.fontWeights.heading, fontSize: type.h3, color: theme.colors.text }}>
            {brand.name}
          </div>
        </Reveal>
      ) : null}
      <SceneTitle {...scene} size="h1" delay={0.3} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.md }}>
        <CTAButton label={scene.button} delay={1} cursor />
        {url ? (
          <Reveal delay={1.4}>
            <div style={{ fontFamily: theme.fonts.body, fontSize: type.body, color: theme.colors.muted }}>{url}</div>
          </Reveal>
        ) : null}
        {scene.badges?.length ? (
          <div style={{ display: 'flex', gap: px(16), flexWrap: 'wrap', justifyContent: 'center' }}>
            {scene.badges.map((b, i) => (
              <Reveal key={i} delay={stagger(i, 1.6)}>
                <Pill>{b}</Pill>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </SceneLayout>
  );
};
