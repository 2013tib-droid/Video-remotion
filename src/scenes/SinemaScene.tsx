import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { resolveSrc } from '../components';
import {
  ArabicReveal,
  CineLine,
  FilmLook,
  FlowDiagram,
  LightLeak,
  Ornament,
  PhoneDonasi,
  SINEMA_SETS,
  ShotCaption,
  ShotProvider,
  WARM_WHITE,
  EMERALD,
  DRIFT,
  SMOOTH,
  lerp,
  ramp,
  setTone,
  type Cam,
} from '../components/sinema';
import { FONT_STACKS } from '../config';
import { Sfx, useCue, useSceneMotion, useSceneExit } from '../motion';
import { useTheme } from '../themes';
import type { SceneProps } from './registry-types';
import type { SinemaMove, SinemaScene, SinemaShot } from './types';

/** Waktu adegan sinema (detik). */
export const SINEMA_TIMING = {
  /** Crossfade antar shot dalam satu adegan. */
  crossfade: 0.9,
  /** Jeda antar baris teks bila `at` kosong. */
  lineGap: 0.9,
  /** Baris pertama muncul. */
  firstLine: 0.5,
} as const;

/** Kamera per gerak, progres p 0..1 (unit kanvas). */
function camFor(move: SinemaMove, p: number): Cam {
  switch (move) {
    case 'descend':
      return { x: 0, y: lerp(430, 0, p), zoom: lerp(1.0, 1.07, p) };
    case 'rise':
      return { x: 0, y: lerp(-180, 240, p), zoom: lerp(1.03, 1.08, p) };
    case 'pushIn':
      return { x: 0, y: lerp(0, -24, p), zoom: lerp(1.0, 1.13, p) };
    case 'pullOut':
      return { x: 0, y: lerp(-30, 0, p), zoom: lerp(1.15, 1.02, p) };
    case 'panLeft':
      return { x: lerp(-80, 80, p), y: 0, zoom: 1.08 };
    case 'panRight':
      return { x: lerp(80, -80, p), y: 0, zoom: 1.08 };
    case 'none':
      return { x: 0, y: 0, zoom: lerp(1.0, 1.025, p) };
  }
}

const DEFAULT_MOVE: Record<string, SinemaMove> = {
  masjid: 'descend',
  langit: 'rise',
  mihrab: 'pushIn',
  jendela: 'panLeft',
  dompet: 'pushIn',
  sarapan: 'panRight',
  berbagi: 'pushIn',
  anak: 'panLeft',
  air: 'panRight',
  mushaf: 'pushIn',
  pola: 'none',
  ponsel: 'pushIn',
  kartu: 'none',
};

/** Tunda render sampai font sinema (Cormorant, Amiri) termuat. */
function useSinemaFonts() {
  const [handle] = useState(() => delayRender('Memuat font sinema'));
  useEffect(() => {
    const loads = [
      '700 60px "Cormorant Garamond"',
      'italic 600 60px "Cormorant Garamond"',
      '600 60px "Cormorant Garamond"',
      '700 60px "Amiri"',
      '400 60px "Amiri"',
    ].map((f) => document.fonts.load(f, 'Aa اللهم').catch(() => undefined));
    Promise.all(loads).then(() => continueRender(handle));
  }, [handle]);
}

/**
 * Adegan sinematik ilustratif: panggung siluet berlapis (paralaks) dengan kamera
 * pelan, cahaya, debu, grain film — plus teks serif, kaligrafi Arab, infografis
 * alur, ponsel donasi, dan logo. Lihat `docs/KATALOG-SCENE.md` → *Sinema*.
 */
export const SinemaSceneView: React.FC<SceneProps<SinemaScene>> = ({ scene, brand }) => {
  useSinemaFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { safe, px } = useTheme();
  const motion = useSceneMotion();
  const exit = useSceneExit(0);
  const cue = useCue();
  const t = frame / fps;
  const sceneSec = motion ? motion.frames / fps : 6;
  const k = width / 1080;

  const shots: SinemaShot[] = scene.shots ?? [
    { set: scene.set ?? 'masjid', time: scene.time, crowd: scene.crowd, move: scene.move },
  ];
  const xf = SINEMA_TIMING.crossfade;
  const fixed = shots.reduce((a, s) => a + (s.duration ?? 0), 0);
  const free = shots.filter((s) => s.duration === undefined).length;
  const each = free ? Math.max(1.2, (sceneSec - fixed + xf * (shots.length - 1)) / free) : 0;
  const starts: number[] = [];
  const lens: number[] = [];
  shots.reduce((acc, s, i) => {
    starts[i] = acc;
    lens[i] = s.duration ?? each;
    return acc + lens[i] - xf;
  }, 0);
  const firstSet = shots[0].set;
  const tone = setTone(firstSet);

  // Teks: waktu muncul tiap baris.
  const lines = scene.lines ?? [];
  let next = SINEMA_TIMING.firstLine;
  const lineAt = lines.map((l) => {
    const a = cue(l.at, next);
    next = a + SINEMA_TIMING.lineGap;
    return a;
  });
  const pos = scene.textPosition ?? 'top';
  const ornamentP = lines.length ? ramp(t, lineAt[0] - 0.3, lineAt[0] + 1.2) : 0;
  const arabicAt = scene.arabic ? cue(scene.arabic.at, 0.6) : 0;
  const translationAt = scene.arabic ? cue(scene.arabic.translationAt, arabicAt + 2.4) : 0;
  const logoAt = scene.logo ? cue(scene.logo.at, 0.8) : 0;
  const logoP = scene.logo ? ramp(t, logoAt, logoAt + 1.6) : 0;

  const logoPill = scene.logo ? (
    <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: px(22),
              opacity: logoP,
              filter: `blur(${(1 - logoP) * px(10)}px)`,
              transform: `translateY(${(1 - logoP) * px(16)}px)`,
              padding: `${px(18)}px ${px(34)}px`,
              borderRadius: px(999),
              background: tone === 'light' ? 'rgba(255,255,255,0.65)' : 'rgba(12,6,4,0.35)',
              border: `${px(1.5)}px solid rgba(212,175,55,0.6)`,
              backdropFilter: 'blur(6px)',
            }}
          >
            {(scene.logo.src ?? brand.logo) ? <Img src={resolveSrc(scene.logo.src ?? brand.logo!)} style={{ width: px(72), height: px(72) }} /> : null}
            <div
              style={{
                fontFamily: FONT_STACKS.jakarta,
                fontWeight: 700,
                fontSize: px(46),
                letterSpacing: '0.02em',
                color: tone === 'light' ? EMERALD : WARM_WHITE,
              }}
            >
              {scene.logo.text ?? brand.url ?? brand.name}
            </div>
          </div>
          <Sfx name="ting" at={logoAt + 0.2} volume={0.5} category="elements" />
    </>
  ) : null;

  return (
    <AbsoluteFill style={{ background: '#120a08', overflow: 'hidden' }}>
      {shots.map((shot, i) => {
        const start = starts[i];
        const end = start + lens[i];
        const last = i === shots.length - 1;
        if (t < start - 0.05 || (!last && t > end + 0.05)) return null;
        const span = last ? Math.max(lens[i], sceneSec - start) : lens[i];
        const local = t - start;
        const p = DRIFT(Math.max(0, Math.min(1, local / span)));
        const move = shot.move ?? (shots.length === 1 ? scene.move : undefined) ?? DEFAULT_MOVE[shot.set] ?? 'none';
        const cam = camFor(move, p);
        const fadeIn = i === 0 ? 1 : ramp(t, start, start + xf, SMOOTH);
        const Set = SINEMA_SETS[shot.set];
        const capIn = ramp(t, start + 0.4, start + 1.1);
        const capOut = last ? 1 - exit : 1 - ramp(t, end - xf - 0.3, end - xf + 0.1);
        return (
          <AbsoluteFill key={i} style={{ opacity: fadeIn }}>
            <ShotProvider value={{ t: local, dur: span, cam, vw: width, vh: height, k }}>
              <Set shot={shot} scene={scene} />
            </ShotProvider>
            {shot.caption ? (
              <div style={{ position: 'absolute', left: safe.x, top: safe.top + px(420) }}>
                <ShotCaption text={shot.caption} p={capIn * capOut} tone={setTone(shot.set)} />
              </div>
            ) : null}
            {i > 0 ? <Sfx name="whooshSoft" at={start} volume={0.5} /> : null}
            {/* Suasana: kicau burung pagi & langkah kaki jamaah. */}
            {shot.set === 'masjid' || shot.set === 'langit' ? <Sfx name="burung" at={start} volume={shot.time === 'senja' ? 0.5 : 0.9} seed={i} /> : null}
            {shot.set === 'masjid' && shot.crowd !== 'none' ? <Sfx name="langkah" at={start + 0.6} volume={0.8} /> : null}
          </AbsoluteFill>
        );
      })}

      {motion && motion.index === 0 ? (
        // Pembuka: naik dari gelap.
        <AbsoluteFill style={{ background: '#000', opacity: 1 - ramp(t, 0, 1.4) }} />
      ) : null}
      <FilmLook vignette={tone === 'light' ? 0.28 : 0.55} grain={0.07} />
      {motion && motion.index > 0 ? <LightLeak t={t} at={0} dur={1.6} from={motion.index % 2 ? 'right' : 'left'} /> : null}

      {scene.flow ? (
        <ShotProvider value={{ t, dur: sceneSec, cam: { x: 0, y: 0, zoom: 1 }, vw: width, vh: height, k }}>
          <FlowDiagram items={scene.flow.items.map((it, i) => ({ ...it, at: cue(it.at, 1.2 + i * 1.3) }))} exit={exit} />
        </ShotProvider>
      ) : null}
      {scene.phone ? (
        <ShotProvider value={{ t, dur: sceneSec, cam: { x: 0, y: 0, zoom: 1 }, vw: width, vh: height, k }}>
          <PhoneDonasi
            {...scene.phone}
            qrAt={cue(scene.phone.qrAt, 1.4)}
            scanAt={cue(scene.phone.scanAt, 3.2)}
            successAt={cue(scene.phone.successAt, 4.4)}
            exit={exit}
          />
        </ShotProvider>
      ) : null}

      {lines.length || scene.arabic ? (
        <AbsoluteFill
          style={{
            padding: `${safe.top + px(40)}px ${safe.x}px ${safe.bottom + px(60)}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: pos === 'top' ? 'flex-start' : pos === 'center' ? 'center' : 'flex-end',
          }}
        >
          {scene.arabic && tone === 'light' ? (
            // Bayangan lembut di belakang blok kaligrafi agar terbaca di atas cahaya.
            <AbsoluteFill
              style={{
                background: `radial-gradient(ellipse 70% ${pos === 'top' ? '30% at 50% 30%' : pos === 'center' ? '28% at 50% 50%' : '26% at 50% 62%'}, rgba(14,6,2,${0.62 * (1 - exit)}) 0%, rgba(14,6,2,0) 100%)`,
              }}
            />
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(18), position: 'relative' }}>
            {lines.length ? (
              <div style={{ opacity: 1 - exit, marginBottom: px(8) }}>
                <Ornament p={ornamentP} color={tone === 'light' ? '#e2c26a' : '#b8892a'} />
              </div>
            ) : null}
            {lines.map((l, i) => (
              <CineLine key={i} text={l.text} highlight={l.highlight} t={t} at={lineAt[i]} size={l.size ?? 'title'} tone={tone} exit={exit} />
            ))}
            {scene.arabic ? (
              <div style={{ marginTop: px(lines.length ? 36 : 0) }}>
                <ArabicReveal
                  text={scene.arabic.text}
                  translation={scene.arabic.translation}
                  source={scene.arabic.source}
                  t={t}
                  at={arabicAt}
                  translationAt={translationAt}
                  tone={tone}
                  exit={exit}
                />
                <Sfx name="halaman" at={arabicAt} volume={0.7} />
              </div>
            ) : null}
            {logoPill ? <div style={{ marginTop: px(40) }}>{logoPill}</div> : null}
          </div>
        </AbsoluteFill>
      ) : logoPill ? (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>{logoPill}</AbsoluteFill>
      ) : null}

    </AbsoluteFill>
  );
};
