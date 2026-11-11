/** Durasi default per tipe scene (detik) bila `duration` tidak diisi. */
export const DEFAULT_SCENE_DURATION: Record<string, number> = {
  logo: 3,
  hero: 4,
  mascot: 4,
  features: 5,
  stats: 4,
  chart: 5,
  comparison: 5,
  timeline: 5,
  device: 5,
  calculation: 5,
  testimonial: 4.5,
  cta: 4,
  question: 5,
  relation: 5,
  statement: 5,
  words: 4,
  broll: 5,
  map: 6,
  world: 8,
};

/** Durasi minimum satu scene (detik) setelah penskalaan durasi total. */
export const MIN_SCENE_DURATION = 1.5;
