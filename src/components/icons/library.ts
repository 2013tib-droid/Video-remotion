/**
 * Pustaka ikon garis (grid 24×24, stroke 2, ujung bulat) untuk animasi "tergambar".
 * Setiap ikon = daftar garis yang digambar berurutan. `fill: true` = bagian yang
 * mendapat isian duotone tipis setelah garisnya selesai.
 *
 * Tambah ikon: tulis path 24×24 (gaya garis), lalu (opsional) petakan emoji di EMOJI_ICONS.
 */
import type { IconIdle } from '../../config';

export type IconPart = string | { d: string; fill?: boolean };

export interface LineIconDef {
  parts: IconPart[];
  /** Gerak idle khas; default `tilt`. */
  idle?: IconIdle;
  /** Titik putar untuk idle (CSS transform-origin), default tengah. */
  origin?: string;
}

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r === 0
    ? `M${x} ${y}h${w}v${h}h${-w}Z`
    : `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;

const dot = (cx: number, cy: number) => ({ d: circle(cx, cy, 0.9), fill: true });
const filled = (d: string) => ({ d, fill: true });

const HEART = 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z';

export const LINE_ICONS = {
  check: { parts: ['M20 6 9 17l-5-5'], idle: 'beat' },
  'check-circle': { parts: [filled(circle(12, 12, 10)), 'm8 12 3 3 5-6'], idle: 'beat' },
  x: { parts: ['M18 6 6 18', 'm6 6 12 12'], idle: 'tilt' },
  'x-circle': { parts: [filled(circle(12, 12, 10)), 'm15 9-6 6', 'm9 9 6 6'], idle: 'tilt' },
  'arrow-right': { parts: ['M5 12h14', 'm12 5 7 7-7 7'], idle: 'nudge' },
  cart: {
    parts: [filled('M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6'), circle(9, 20.5, 1.5), circle(18, 20.5, 1.5)],
    idle: 'nudge',
  },
  bag: { parts: [filled('M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z'), 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'], idle: 'bob' },
  bank: { parts: [filled('M12 2 21 7H3Z'), 'M6 18v-7', 'M10 18v-7', 'M14 18v-7', 'M18 18v-7', 'M4 18h16', 'M3 22h18'], idle: 'tilt' },
  crane: { parts: ['M4 22V4', 'M2 4h18', 'M4 9l5-5', 'M17 4v6', filled(rect(14, 10, 6, 4, 1)), 'M2 22h8'], idle: 'swing', origin: '20% 20%' },
  factory: { parts: [filled('M2 20V9l6 4V9l6 4V4h6v16Z'), 'M2 20h20', 'M7 17h2', 'M12 17h2', 'M17 17h1'], idle: 'tilt' },
  target: { parts: [circle(12, 12, 10), circle(12, 12, 6), filled(circle(12, 12, 2))], idle: 'beat' },
  bell: { parts: [filled('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'), 'M10.3 21a1.94 1.94 0 0 0 3.4 0'], idle: 'swing', origin: '50% 8%' },
  search: { parts: [filled(circle(11, 11, 7)), 'm21 21-4.3-4.3'], idle: 'tilt' },
  'bar-chart': { parts: ['M3 3v18h18', filled(rect(7, 12, 3, 6, 0.5)), filled(rect(12, 8, 3, 10, 0.5)), filled(rect(17, 5, 3, 13, 0.5))], idle: 'bob' },
  'trending-up': { parts: ['M3 3v18h18', 'm7 15 4-4 3 3 6-7', 'M15 7h5v5'], idle: 'nudge' },
  edit: { parts: ['M12 20h9', filled('M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z')], idle: 'tilt' },
  file: { parts: [filled('M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z'), 'M14 2v6h6', 'M8 13h8', 'M8 17h5'], idle: 'tilt' },
  receipt: { parts: [filled('M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2Z'), 'M8 8h8', 'M8 12h8', 'M8 16h5'], idle: 'bob' },
  wallet: {
    parts: [filled('M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5'), dot(16.5, 14)],
    idle: 'tilt',
  },
  heart: { parts: [filled(HEART)], idle: 'beat' },
  bot: { parts: [filled(rect(4, 8, 16, 12, 2)), 'M12 8V4', 'M10 4h4', 'M9 13v2', 'M15 13v2', 'M2 14h2', 'M20 14h2'], idle: 'tilt' },
  flask: { parts: ['M9 3h6', filled('M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3'), 'M7 15h10'], idle: 'swing', origin: '50% 10%' },
  hash: { parts: ['M4 9h16', 'M4 15h16', 'M10 3 8 21', 'm16 3-2 18'], idle: 'tilt' },
  link: {
    parts: ['M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7', 'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'],
    idle: 'tilt',
  },
  lock: { parts: [filled(rect(3, 11, 18, 11, 2)), 'M7 11V7a5 5 0 0 1 10 0v4'], idle: 'beat' },
  phone: { parts: [filled(rect(5, 2, 14, 20, 2.5)), 'M11 18h2'], idle: 'tilt' },
  book: { parts: [filled('M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z'), filled('M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z')], idle: 'bob' },
  briefcase: { parts: [filled(rect(2, 7, 20, 14, 2)), 'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2', 'M2 13h20'], idle: 'bob' },
  lightbulb: { parts: [filled('M15 14c.2-1 .7-1.7 1.5-2.5A6 6 0 1 0 7.5 11.5c.8.8 1.3 1.5 1.5 2.5Z'), 'M9 18h6', 'M10 22h4'], idle: 'beat' },
  users: {
    parts: [filled(circle(9, 7, 4)), 'M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2', 'M16 3.1a4 4 0 0 1 0 7.8', 'M22 21v-2a4 4 0 0 0-3-3.9'],
    idle: 'bob',
  },
  user: { parts: [filled(circle(12, 8, 4)), 'M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1'], idle: 'bob' },
  film: { parts: [filled('M3 10h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'), 'M3 10 20 5.5l-.8-3L2.2 7Z', 'm7 6.2 1.6 2.7', 'm12.2 4.8 1.6 2.7'], idle: 'tilt' },
  palette: {
    parts: [filled('M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 22Z'), dot(7.5, 10.5), dot(12, 7), dot(16.5, 10.5)],
    idle: 'tilt',
  },
  scissors: { parts: [circle(6, 6, 3), circle(6, 18, 3), 'M20 4 8.1 15.9', 'M14.5 14.5 20 20', 'M8.1 8.1 12 12'], idle: 'tilt' },
  zap: { parts: [filled('M13 2 3 14h9l-1 8 10-12h-9Z')], idle: 'beat' },
  coffee: { parts: [filled('M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z'), 'M17 8h1a4 4 0 1 1 0 8h-1', 'M6 2v2', 'M10 2v2', 'M14 2v2'], idle: 'bob' },
  star: { parts: [filled('M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z')], idle: 'beat' },
  sparkles: { parts: [filled('M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z'), 'M19 3v4', 'M17 5h4', 'M5 17v4', 'M3 19h4'], idle: 'beat' },
  rocket: {
    parts: [
      filled('M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2Z'),
      'M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0',
      'M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5',
      'M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z',
    ],
    idle: 'bob',
  },
  shield: { parts: [filled('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'), 'm9 12 2 2 4-4'], idle: 'beat' },
  clock: { parts: [filled(circle(12, 12, 10)), 'M12 6v6l4 2'], idle: 'tilt' },
  calendar: { parts: [filled(rect(3, 4, 18, 18, 2)), 'M16 2v4', 'M8 2v4', 'M3 10h18'], idle: 'tilt' },
  gift: {
    parts: [filled(rect(3, 8, 18, 4, 1)), 'M12 8v13', 'M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7', 'M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5'],
    idle: 'beat',
  },
  mail: { parts: [filled(rect(2, 4, 20, 16, 2)), 'm22 7-10 6L2 7'], idle: 'bob' },
  home: { parts: [filled('M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'), 'M9 22v-8h6v8'], idle: 'tilt' },
  settings: {
    parts: [filled(circle(12, 12, 7)), 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'm4.9 4.9 2.1 2.1', 'm17 17 2.1 2.1', 'm4.9 19.1 2.1-2.1', 'm17 7 2.1-2.1', circle(12, 12, 3)],
    idle: 'spin',
  },
  globe: { parts: [filled(circle(12, 12, 10)), 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z'], idle: 'tilt' },
  money: { parts: [filled(rect(2, 6, 20, 12, 2)), circle(12, 12, 2.5), 'M6 12h.01', 'M18 12h.01'], idle: 'bob' },
  dollar: { parts: ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'], idle: 'beat' },
  percent: { parts: ['M19 5 5 19', filled(circle(6.5, 6.5, 2.5)), filled(circle(17.5, 17.5, 2.5))], idle: 'beat' },
  tag: {
    parts: [filled('M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z'), circle(7.5, 7.5, 1.5)],
    idle: 'swing',
    origin: '20% 20%',
  },
  truck: {
    parts: [filled('M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'), 'M15 18H9', 'M14 8h4l4 4v5a1 1 0 0 1-1 1h-2', circle(17, 18, 2), circle(7, 18, 2)],
    idle: 'nudge',
  },
  camera: { parts: [filled('M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z'), circle(12, 13, 3)], idle: 'tilt' },
  chat: { parts: [filled('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z'), 'M8 9h8', 'M8 13h5'], idle: 'bob' },
  megaphone: { parts: [filled('M3 11v2a1 1 0 0 0 1 1h3l7 5V5L7 10H4a1 1 0 0 0-1 1Z'), 'M18 8a5 5 0 0 1 0 8', 'M21 5a9 9 0 0 1 0 14'], idle: 'beat' },
  trophy: {
    parts: [filled('M7 3h10v6a5 5 0 0 1-10 0Z'), 'M7 5H4.5a2.5 2.5 0 0 0 0 5H7', 'M17 5h2.5a2.5 2.5 0 0 1 0 5H17', 'M12 14v4', 'M8 22v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M6 22h12'],
    idle: 'beat',
  },
  flame: { parts: [filled('M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z')], idle: 'beat', origin: '50% 100%' },
  play: { parts: [circle(12, 12, 10), filled('m10 8 6 4-6 4Z')], idle: 'beat' },
  download: { parts: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'], idle: 'bob' },
  eye: { parts: [filled('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z'), circle(12, 12, 3)], idle: 'tilt' },
  'map-pin': { parts: [filled('M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z'), circle(12, 10, 3)], idle: 'bob' },
  smile: { parts: [filled(circle(12, 12, 10)), 'M8 14s1.5 2 4 2 4-2 4-2', dot(9, 9), dot(15, 9)], idle: 'tilt' },
  'thumbs-up': {
    parts: ['M7 10v11', filled('M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z')],
    idle: 'beat',
  },
  info: { parts: [filled(circle(12, 12, 10)), 'M12 16v-4', 'M12 8h.01'], idle: 'tilt' },
  alert: { parts: [filled('M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'), 'M12 9v4', 'M12 17h.01'], idle: 'beat' },
  question: { parts: [filled(circle(12, 12, 10)), 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3', 'M12 17h.01'], idle: 'tilt' },
  sun: {
    parts: [filled(circle(12, 12, 4)), 'M12 2v2', 'M12 20v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M2 12h2', 'M20 12h2', 'm6.3 17.7-1.4 1.4', 'm19.1 4.9-1.4 1.4'],
    idle: 'spin',
  },
  moon: { parts: [filled('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z')], idle: 'tilt' },
  leaf: { parts: [filled('M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z'), 'M2 21c0-3 1.9-5.4 5.2-6.1 2.4-.5 4.9-2 5.8-3.9'], idle: 'swing', origin: '10% 90%' },
  cloud: { parts: [filled('M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z')], idle: 'bob' },
  graduation: { parts: [filled('M22 10 12 5 2 10l10 5Z'), 'M6 12v5c3 3 9 3 12 0v-5', 'M22 10v6'], idle: 'tilt' },
  music: { parts: ['M9 18V5l12-2v13', filled(circle(6, 18, 3)), filled(circle(18, 16, 3))], idle: 'bob' },
  package: { parts: [filled('M21 8 12 3 3 8v8l9 5 9-5Z'), 'm3 8 9 5 9-5', 'M12 13v8'], idle: 'bob' },
  scan: {
    parts: ['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', filled(rect(7, 7, 4, 4, 0.5)), filled(rect(13, 13, 4, 4, 0.5)), 'M13 7h4v3', 'M7 17v-3h3'],
    idle: 'beat',
  },
  calculator: { parts: [filled(rect(4, 2, 16, 20, 2)), 'M8 6h8', 'M8 11h.01', 'M12 11h.01', 'M16 11h.01', 'M8 15h.01', 'M12 15h.01', 'M16 15v3', 'M8 18h4'], idle: 'tilt' },
} satisfies Record<string, LineIconDef>;

export type LineIconName = keyof typeof LINE_ICONS;

/**
 * Emoji → ikon garis. Kunci tanpa variation selector (U+FE0F).
 * Emoji yang tidak ada di sini tetap tampil sebagai emoji (dengan gerak idle).
 */
export const EMOJI_ICONS: Record<string, LineIconName> = {
  '✅': 'check-circle', '✔': 'check', '☑': 'check-circle', '❌': 'x-circle', '✖': 'x',
  '➡': 'arrow-right', '→': 'arrow-right', '👉': 'arrow-right',
  '🛒': 'cart', '🛍': 'bag', '🏛': 'bank', '🏦': 'bank', '🏗': 'crane', '🏭': 'factory',
  '🎯': 'target', '🔔': 'bell', '🔍': 'search', '🔎': 'search', '📊': 'bar-chart', '📈': 'trending-up',
  '📝': 'edit', '✏': 'edit', '🖊': 'edit', '📄': 'file', '📃': 'file', '📋': 'file', '🧾': 'receipt',
  '👛': 'wallet', '💳': 'wallet', '❤': 'heart', '💖': 'heart', '💙': 'heart', '💚': 'heart', '🧡': 'heart', '💜': 'heart',
  '🤖': 'bot', '🔬': 'flask', '🧪': 'flask', '⚗': 'flask', '🔢': 'hash', '#': 'hash', '🔗': 'link',
  '🔒': 'lock', '🔐': 'lock', '📱': 'phone', '📲': 'phone', '📖': 'book', '📚': 'book', '📕': 'book', '📘': 'book',
  '💼': 'briefcase', '💡': 'lightbulb', '👥': 'users', '👤': 'user', '🙋': 'user', '🎬': 'film', '🎥': 'film',
  '🎨': 'palette', '✂': 'scissors', '⚡': 'zap', '☕': 'coffee', '⭐': 'star', '🌟': 'star', '✨': 'sparkles',
  '🚀': 'rocket', '🛡': 'shield', '⏰': 'clock', '⏱': 'clock', '🕒': 'clock', '⌛': 'clock', '⏳': 'clock',
  '📅': 'calendar', '🗓': 'calendar', '📆': 'calendar', '🎁': 'gift', '✉': 'mail', '📧': 'mail', '📩': 'mail', '📨': 'mail',
  '🏠': 'home', '🏡': 'home', '⚙': 'settings', '🛠': 'settings', '🔧': 'settings', '🌐': 'globe', '🌍': 'globe', '🌏': 'globe',
  '💰': 'money', '💵': 'money', '💸': 'money', '🪙': 'money', '💲': 'dollar', '💯': 'percent', '🏷': 'tag',
  '🚚': 'truck', '📦': 'package', '📷': 'camera', '📸': 'camera', '💬': 'chat', '🗨': 'chat', '📣': 'megaphone', '📢': 'megaphone',
  '🏆': 'trophy', '🥇': 'trophy', '🔥': 'flame', '▶': 'play', '⬇': 'download', '📥': 'download', '👀': 'eye', '👁': 'eye',
  '📍': 'map-pin', '📌': 'map-pin', '😊': 'smile', '🙂': 'smile', '😀': 'smile', '😄': 'smile', '👍': 'thumbs-up',
  'ℹ': 'info', '⚠': 'alert', '❓': 'question', '❔': 'question', '☀': 'sun', '🌙': 'moon', '🌱': 'leaf', '🌿': 'leaf', '🍃': 'leaf',
  '☁': 'cloud', '🎓': 'graduation', '🎵': 'music', '🎶': 'music', '🧮': 'calculator', '🔳': 'scan',
};

/** Ikon garis untuk emoji, atau undefined bila tidak dikenal. */
export function lineIconForEmoji(emoji: string): LineIconName | undefined {
  return EMOJI_ICONS[emoji.replace(/️/g, '').trim()];
}

export function isLineIconName(name: string): name is LineIconName {
  return Object.prototype.hasOwnProperty.call(LINE_ICONS, name);
}
