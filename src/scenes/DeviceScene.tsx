import React from 'react';
import {
  BrowserMockup,
  DashboardMockup,
  ImageScreen,
  ListScreen,
  NotificationPopup,
  PhoneMockup,
  Pill,
  QRScreen,
  QuizScreen,
  ReceiptScreen,
} from '../components';
import { Reveal, useStagger } from '../motion';
import { useTheme } from '../themes';
import { SceneLayout, SceneTitle } from './SceneLayout';
import type { DeviceScene, ScreenConfig } from './types';
import type { SceneProps } from './registry-types';

const SCREEN_DELAY = 0.7;

export const Screen: React.FC<{ screen: ScreenConfig }> = ({ screen }) => {
  switch (screen.kind) {
    case 'image':
      return <ImageScreen src={screen.src} />;
    case 'receipt':
      return <ReceiptScreen {...screen} delay={SCREEN_DELAY} />;
    case 'qr':
      return <QRScreen {...screen} delay={SCREEN_DELAY} />;
    case 'list':
      return <ListScreen {...screen} delay={SCREEN_DELAY} />;
    case 'quiz':
      return <QuizScreen {...screen} delay={SCREEN_DELAY} />;
    case 'dashboard':
      return <DashboardMockup {...screen} delay={SCREEN_DELAY + 0.2} />;
  }
};

export const DeviceSceneView: React.FC<SceneProps<DeviceScene>> = ({ scene, brand }) => {
  const { isPortrait, space, px } = useTheme();
  const stagger = useStagger('relaxed');
  const device = scene.device ?? (scene.screen.kind === 'dashboard' ? 'browser' : 'phone');
  const hasTitle = Boolean(scene.title || scene.eyebrow);
  const align = isPortrait ? 'center' : 'left';
  const notifStart = 2.2;
  const deviceEl =
    device === 'phone' ? (
      <PhoneMockup width={isPortrait ? (hasTitle ? 510 : 580) : 500} delay={0.2}>
        <Screen screen={scene.screen} />
      </PhoneMockup>
    ) : (
      <BrowserMockup width={isPortrait ? 920 : 1100} url={scene.url ?? brand.url} delay={0.2}>
        <Screen screen={scene.screen} />
      </BrowserMockup>
    );
  return (
    <SceneLayout background={scene.background} split>
      {hasTitle || scene.bullets?.length ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isPortrait ? 'center' : 'flex-start',
            gap: space.md,
            maxWidth: px(isPortrait ? 1000 : 720),
          }}
        >
          <SceneTitle {...scene} align={align} />
          {scene.bullets?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: px(14), justifyContent: isPortrait ? 'center' : 'flex-start' }}>
              {scene.bullets.map((b, i) => (
                <Reveal key={i} delay={stagger(i, 0.9)} preset="pop" spring="snappy">
                  <Pill>✓ {b}</Pill>
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        {deviceEl}
        {scene.notifications?.length ? (
          <div
            style={{
              position: 'absolute',
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: px(18),
              alignItems: 'center',
            }}
          >
            {scene.notifications.map((n, i) => (
              <NotificationPopup key={i} {...n} app={n.app ?? brand.name} delay={stagger(i, notifStart)} width={isPortrait ? 760 : 680} />
            ))}
          </div>
        ) : null}
      </div>
    </SceneLayout>
  );
};
