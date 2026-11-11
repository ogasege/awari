/**
 * WCAG 2.x contrast maths and the list of text/background token pairs the
 * design system promises are readable.
 */

/** Lagoon palette from `.kiro/steering/design.md`, plus derived tints. */
export const palette = {
  teal: '#00606E',
  coral: '#FF8662',
  yellow: '#FFD23F',
  navy: '#0B1B4D',
  tealInk: '#007A8C',
  tomato: '#E8452C',
  paper: '#FFFFFF',
  ink: '#101828',
  inkSoft: '#475467',
  mist: '#D5F0F3',
  coralInk: '#2E0D00',
  yellowInk: '#1F1400',
  offline: '#6FE3B4',
  footerInk: '#C9D2E6',
} as const;

export type PaletteName = keyof typeof palette;

/** Relative luminance of a #RRGGBB colour. */
export function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) {
    throw new Error(`Not a #RRGGBB colour: ${hex}`);
  }
  const value = parseInt(m[1] as string, 16);
  const channel = (shift: number): number => {
    const c = ((value >> shift) & 0xff) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

/** Contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

/** A text colour on a background, and whether the text is large. */
export interface TextPair {
  text: PaletteName;
  on: PaletteName;
  large: boolean;
  use: string;
}

/** Every text/background combination the components use. */
export const TEXT_PAIRS: readonly TextPair[] = [
  { text: 'ink', on: 'paper', large: false, use: 'reading text' },
  { text: 'inkSoft', on: 'paper', large: false, use: 'secondary text' },
  { text: 'tealInk', on: 'paper', large: false, use: 'links, notes on paper' },
  { text: 'paper', on: 'teal', large: false, use: 'text on the board' },
  { text: 'mist', on: 'teal', large: false, use: 'lead text on the board' },
  { text: 'yellow', on: 'teal', large: false, use: 'notes and nav on board' },
  { text: 'offline', on: 'ink', large: false, use: 'offline badge' },
  { text: 'coralInk', on: 'coral', large: false, use: 'text on photo table' },
  { text: 'yellowInk', on: 'yellow', large: false, use: 'yellow buttons' },
  { text: 'paper', on: 'navy', large: true, use: 'navy headline strip' },
  { text: 'paper', on: 'tomato', large: true, use: 'calendar month' },
  { text: 'paper', on: 'tealInk', large: false, use: 'teal notes' },
  { text: 'paper', on: 'ink', large: false, use: 'dark buttons' },
  { text: 'footerInk', on: 'ink', large: false, use: 'footer' },
  { text: 'navy', on: 'yellow', large: false, use: 'chalk highlight' },
];

/** WCAG AA threshold for a pair. */
export function requiredRatio(pair: TextPair): number {
  return pair.large ? 3 : 4.5;
}
