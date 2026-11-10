import React from 'react';
import { CounterAnimation, Pill, Surface } from '../components';
import { Reveal, formatValue, useStagger } from '../motion';
import { useTheme } from '../themes';
import { CONTENT_DELAY, SceneLayout, SceneTitle } from './SceneLayout';
import type { CalculationScene } from './types';
import type { SceneProps } from './registry-types';

export const CalculationSceneView: React.FC<SceneProps<CalculationScene>> = ({ scene }) => {
  const { theme, type, px, space } = useTheme();
  const stagger = useStagger('relaxed');
  const totalDelay = stagger(scene.lines.length, CONTENT_DELAY) + 0.2;
  const fmt = { prefix: scene.prefix, suffix: scene.suffix };
  return (
    <SceneLayout background={scene.background}>
      <SceneTitle {...scene} />
      <Reveal delay={CONTENT_DELAY - 0.2} style={{ width: '100%', maxWidth: px(960) }}>
        <Surface padding={52} radius="lg" elevated>
          <div style={{ display: 'flex', flexDirection: 'column', gap: px(22), fontFamily: theme.fonts.body, fontSize: type.body }}>
            {scene.lines.map((l, i) => (
              <Reveal key={i} delay={stagger(i, CONTENT_DELAY)} preset="slideLeft">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: px(24) }}>
                  <span style={{ color: theme.colors.muted }}>{l.label}</span>
                  <span
                    style={{
                      color: l.negative ? theme.colors.success : theme.colors.text,
                      fontWeight: theme.fontWeights.strong,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {l.negative ? '− ' : ''}
                    {formatValue(l.value, fmt)}
                  </span>
                </div>
              </Reveal>
            ))}
            <Reveal delay={totalDelay - 0.1} preset="fadeIn">
              <div style={{ height: px(3), background: theme.colors.border, borderRadius: px(2), margin: `${px(8)}px 0` }} />
            </Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: px(24) }}>
              <Reveal delay={totalDelay}>
                <span style={{ color: theme.colors.text, fontWeight: theme.fontWeights.strong, fontSize: type.subtitle }}>{scene.total.label}</span>
              </Reveal>
              <CounterAnimation value={scene.total.value} {...fmt} size="h2" delay={totalDelay} align="left" />
            </div>
          </div>
        </Surface>
      </Reveal>
      {scene.note ? (
        <Reveal delay={totalDelay + 0.9} preset="pop" spring="bouncy" idle style={{ marginTop: -space.sm }}>
          <Pill tone="primary" style={{ fontSize: type.body }}>
            {scene.note}
          </Pill>
        </Reveal>
      ) : null}
    </SceneLayout>
  );
};
