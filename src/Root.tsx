import React from 'react';
import { Composition, Folder } from 'remotion';
import { MotionVideo, computeTimeline, type MotionVideoProps } from './core';
import { PROJECTS } from './projects';

/** Mendaftarkan semua video dari src/projects. Tidak perlu diubah. */
export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(PROJECTS).map(([folder, videos]) => (
      <Folder key={folder} name={folder}>
        {videos.map((config) => {
          const t = computeTimeline(config);
          return (
            <Composition
              key={config.id}
              id={config.id}
              component={MotionVideo}
              durationInFrames={t.durationInFrames}
              fps={t.fps}
              width={t.width}
              height={t.height}
              defaultProps={{ config }}
              calculateMetadata={({ props }: { props: MotionVideoProps }) => {
                const m = computeTimeline(props.config);
                return { durationInFrames: m.durationInFrames, fps: m.fps, width: m.width, height: m.height };
              }}
            />
          );
        })}
      </Folder>
    ))}
  </>
);
