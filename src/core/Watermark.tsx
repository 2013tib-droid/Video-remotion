import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SAFE_AREA } from '../config';
import { Icon } from '../components/primitives';
import { useTheme } from '../themes';
import type { Timeline } from './timeline';
import type { VideoConfig, WatermarkOptions, WatermarkPosition } from './types';

/** Ukuran & waktu watermark (px basis 1080, detik). */
export const WATERMARK = {
  height: 54,
  /** Jarak dari tepi area aman konten. */
  gap: 18,
  /** Jarak minimum dari tepi frame. */
  edge: 24,
  opacity: 0.72,
  fade: 0.4,
} as const;

/**
 * Watermark brand kecil yang tetap di pojok sepanjang video (di luar area konten,
 * jadi tidak menutupi teks). Memudar masuk di awal dan — secara default — hilang
 * saat scene penutup `cta` (brand sudah tampil besar di sana).
 */
export const Watermark: React.FC<{ config: VideoConfig; timeline: Timeline }> = ({ config, timeline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme, px, format } = useTheme();
  const setting = config.watermark;
  if (!setting) return null;
  const opt: WatermarkOptions = setting === true ? {} : typeof setting === 'string' ? { text: setting } : setting;

  // HUD explainer sudah menempati baris atas → default pindah ke bawah.
  const position: WatermarkPosition = opt.position ?? (config.overlay ? 'bottom' : 'top-right');
  const [vertical, align = 'center'] = position.split('-') as ['top' | 'bottom', ('left' | 'right')?];
  const safe = SAFE_AREA[format];
  const offset = px(Math.max(WATERMARK.edge, safe[vertical] - WATERMARK.height - WATERMARK.gap));

  const fade = Math.max(1, Math.round(WATERMARK.fade * fps));
  let opacity = interpolate(frame, [0, fade], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const last = timeline.entries.length - 1;
  if (opt.outro !== true && last > 0 && config.scenes[last].type === 'cta') {
    const from = timeline.entries[last].from;
    opacity *= interpolate(frame, [from, from + fade], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  }
  if (opacity <= 0) return null;

  const logo = opt.logo === false ? undefined : config.brand.logo;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          [vertical]: offset,
          left: px(safe.x),
          right: px(safe.x),
          display: 'flex',
          justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
          opacity: opacity * (opt.opacity ?? WATERMARK.opacity),
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: px(10),
            height: px(WATERMARK.height),
            padding: `0 ${px(20)}px`,
            borderRadius: px(WATERMARK.height / 2),
            background: theme.colors.surface,
            border: `${px(2)}px solid ${theme.colors.border}`,
            color: theme.colors.text,
            fontFamily: theme.fonts.heading,
            fontWeight: theme.fontWeights.strong,
            fontSize: px(24),
            whiteSpace: 'nowrap',
          }}
        >
          {logo ? <Icon src={logo} size={28} animate={false} /> : null}
          {opt.text ?? config.brand.name}
        </div>
      </div>
    </AbsoluteFill>
  );
};
