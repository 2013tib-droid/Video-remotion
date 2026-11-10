import React from 'react';
import { Reveal, useCue } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import { SceneLayout, SceneTitle } from './SceneLayout';
import type { RelationScene } from './types';

/** Baris "A —kata kerja→ B" + chip rumus. Cocok untuk analogi & sebab-akibat. */
export const RelationSceneView: React.FC<SceneProps<RelationScene>> = ({ scene }) => {
  const { theme, px, space } = useTheme();
  const cue = useCue();
  const chip = (text: string, unknown: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    padding: `${px(40)}px ${px(20)}px`,
    borderRadius: px(26),
    background: unknown ? 'transparent' : theme.colors.surface,
    border: `${px(3)}px ${unknown ? 'dashed' : 'solid'} ${unknown ? theme.colors.primary : theme.colors.border}`,
    fontFamily: theme.fonts.heading,
    fontWeight: 700,
    fontSize: px(text.length > 12 ? 42 : 48),
    color: unknown ? theme.colors.primary : theme.colors.text,
  });
  return (
    <SceneLayout background={scene.background} style={{ gap: space.lg }}>
      <SceneTitle {...scene} />
      {scene.rows.map((row, i) => (
        <Reveal key={i} delay={cue(row.at, 0.3 + i * 1.5)} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: px(18), width: '100%' }}>
            <div style={chip(row.left, false)}>{row.left}</div>
            <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(6) }}>
              <div style={{ fontFamily: theme.fonts.mono, fontWeight: 700, fontSize: px(24), color: theme.colors.primary, letterSpacing: '0.04em' }}>
                {row.verb}
              </div>
              <div style={{ fontSize: px(44), color: theme.colors.primary, lineHeight: 1 }}>→</div>
            </div>
            <div style={chip(row.right, row.right.trim() === '?')}>{row.right}</div>
          </div>
        </Reveal>
      ))}
      {scene.formula ? (
        <Reveal delay={cue(scene.formulaAt, 0.3 + scene.rows.length * 1.5)} preset="pop">
          <div
            style={{
              marginTop: px(20),
              padding: `${px(20)}px ${px(40)}px`,
              borderRadius: px(theme.radius.pill),
              background: theme.colors.primary,
              color: theme.colors.onPrimary,
              fontFamily: theme.fonts.mono,
              fontWeight: 700,
              fontSize: px(38),
              letterSpacing: '0.06em',
            }}
          >
            {scene.formula}
          </div>
        </Reveal>
      ) : null}
    </SceneLayout>
  );
};
