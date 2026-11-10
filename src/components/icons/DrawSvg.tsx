import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cancelRender, continueRender, delayRender } from 'remotion';
import { ICON_ANIMATION } from '../../config';
import { useIconDraw, useIconIdle, useRevealDelay } from '../../motion';
import { useTheme } from '../../themes';
import { resolveSrc } from '../assets';

const SHAPES = 'path, line, polyline, polygon, circle, ellipse, rect';

interface ShapeInfo {
  el: SVGGeometryElement;
  stroke: boolean;
  fill: string | null;
  fillOpacity: number;
  /** Bentuk tanpa garis: digambar sebagai sketsa lalu diisi. */
  sketch: boolean;
}

export interface DrawSvgProps {
  /** File SVG di public/ atau URL. */
  src: string;
  size: number;
  delay?: number;
  style?: React.CSSProperties;
}

/**
 * File SVG yang "tergambar": garis digambar berurutan; bentuk yang hanya berisi
 * (tanpa garis) disketsa dulu dengan garis tipis, lalu warna isiannya memudar masuk.
 * Cocok untuk ikon/ilustrasi garis dan logo sederhana.
 */
export const DrawSvg: React.FC<DrawSvgProps> = ({ src, size, delay, style }) => {
  const { px } = useTheme();
  const revealDelay = useRevealDelay();
  const start = delay ?? revealDelay;
  const ref = useRef<HTMLDivElement>(null);
  const shapes = useRef<ShapeInfo[]>([]);
  const [markup, setMarkup] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [handle] = useState(() => delayRender(`Memuat SVG ${src}`));

  useEffect(() => {
    fetch(resolveSrc(src))
      .then((r) => {
        if (!r.ok) throw new Error(`SVG ${src}: HTTP ${r.status}`);
        return r.text();
      })
      .then(setMarkup)
      .catch((err) => cancelRender(err));
  }, [src]);

  // Pasang SVG sekali, kumpulkan bentuk yang bisa digambar.
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host || markup === null) return;
    host.innerHTML = markup;
    const svg = host.querySelector('svg');
    if (!svg) {
      cancelRender(new Error(`SVG ${src}: elemen <svg> tidak ditemukan`));
      return;
    }
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.overflow = 'visible';
    const vb = svg.viewBox?.baseVal;
    const unit = vb && vb.width ? Math.max(vb.width, vb.height) : 24;
    shapes.current = Array.from(svg.querySelectorAll<SVGGeometryElement>(SHAPES))
      .filter((el) => !el.closest('defs, clipPath, mask, pattern, symbol'))
      .map((el) => {
        const cs = getComputedStyle(el);
        const stroke = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0;
        const fill = cs.fill !== 'none' && cs.fill !== 'transparent' ? cs.fill : null;
        const fillOpacity = parseFloat(cs.fillOpacity || '1');
        const sketch = !stroke && fill !== null;
        el.setAttribute('pathLength', '1');
        el.style.strokeDasharray = '1 1';
        if (sketch) {
          el.style.stroke = fill;
          el.style.strokeWidth = `${unit * ICON_ANIMATION.sketchStroke}`;
          el.style.strokeLinecap = 'round';
          el.style.strokeLinejoin = 'round';
        }
        return { el, stroke, fill, fillOpacity, sketch };
      });
    setCount(shapes.current.length);
    continueRender(handle);
  }, [markup, handle, src]);

  // Jumlah garis bisa banyak (logo): batasi agar total waktu gambar tetap ±1,6 dtk.
  const speed = Math.max(1, (Math.max(1, count - 1) * ICON_ANIMATION.stagger + ICON_ANIMATION.draw) / 1.6);
  const draw = useIconDraw(count, start, speed);
  const idle = useIconIdle('tilt', draw.doneAt, size);

  // Terapkan progres frame ini.
  useLayoutEffect(() => {
    shapes.current.forEach((s, i) => {
      const p = draw.stroke(i);
      const f = Math.min(1, draw.fill(i) / ICON_ANIMATION.fillOpacity);
      s.el.style.strokeDashoffset = `${1 - p}`;
      s.el.style.opacity = p > 0.001 ? '1' : '0';
      if (s.fill !== null) s.el.style.fillOpacity = `${s.fillOpacity * f}`;
      if (s.sketch) s.el.style.strokeOpacity = `${1 - f}`;
    });
  });

  const sz = px(size);
  return (
    <div
      ref={ref}
      style={{ width: sz, height: sz, transform: [`scale(${draw.scale})`, idle].filter(Boolean).join(' '), ...style }}
    />
  );
};
