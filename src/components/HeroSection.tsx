import React from 'react';
import { type TypeSize } from '../config';
import { Reveal } from '../motion';
import { useTheme } from '../themes';
import { BodyText, Heading, Pill } from './primitives';

export interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  /** Kata dalam judul yang diberi gradien. */
  highlight?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  titleSize?: TypeSize;
  delay?: number;
  /** Konten tambahan di bawah (CTA, mockup) — muncul setelah teks. */
  children?: React.ReactNode;
}

/** Blok judul utama: eyebrow → judul kata-per-kata → subjudul → konten. */
export const HeroSection: React.FC<HeroSectionProps> = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
  titleSize = 'display',
  delay = 0,
  children,
}) => {
  const { space, px } = useTheme();
  const words = title.split(/\s+/).length;
  const afterTitle = delay + 0.25 + words * 0.06;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: space.md,
        maxWidth: px(1500),
      }}
    >
      {eyebrow ? (
        <Reveal delay={delay}>
          <Pill>{eyebrow}</Pill>
        </Reveal>
      ) : null}
      <Heading text={title} highlight={highlight} size={titleSize} align={align} delay={delay + 0.15} />
      {subtitle ? (
        <Reveal delay={afterTitle}>
          <BodyText size="subtitle" align={align} style={{ maxWidth: px(900) }}>
            {subtitle}
          </BodyText>
        </Reveal>
      ) : null}
      {children ? (
        <Reveal delay={afterTitle + 0.25} style={{ marginTop: space.md }}>
          {children}
        </Reveal>
      ) : null}
    </div>
  );
};
