import React from 'react';
import { type TypeSize } from '../config';
import { LINE_HEIGHT } from '../config';
import { Reveal, useTextAnimation } from '../motion';
import { useTheme } from '../themes';
import { LineText, textRevealSpan, useTextLastStart } from './KineticText';
import { Heading, Pill } from './primitives';

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
  const { theme, type, space, px } = useTheme();
  const anim = useTextAnimation(titleSize);
  // Subtitle menyusul saat judul hampir selesai (maks 1,2 dtk agar tidak menunggu lama).
  // Judul sinkron narasi: subtitle menunggu kata terakhir judul muncul.
  const lastWord = useTextLastStart(title, anim, delay + 0.15);
  const afterTitle = Math.max(delay + 0.15 + Math.min(1.2, Math.max(0.3, textRevealSpan(title, anim) * 0.8)), lastWord + 0.25);
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
        <LineText
          text={subtitle}
          delay={afterTitle}
          fontFamily={theme.fonts.body}
          fontWeight={theme.fontWeights.body}
          fontSize={type.subtitle}
          style={{ maxWidth: px(900), lineHeight: LINE_HEIGHT.body, color: theme.colors.muted, textAlign: align }}
        />
      ) : null}
      {children ? (
        <Reveal delay={afterTitle + 0.25} style={{ marginTop: space.md }}>
          {children}
        </Reveal>
      ) : null}
    </div>
  );
};
