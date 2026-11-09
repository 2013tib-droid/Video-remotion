import React from 'react';
import { Img } from 'remotion';
import { resolveSrc } from '../primitives';

/** Screenshot asli aplikasi (path di public/ atau URL). */
export const ImageScreen: React.FC<{ src: string }> = ({ src }) => (
  <Img src={resolveSrc(src)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
);
