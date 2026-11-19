/**
 * Each wing of the castle has its own look (28-every-screen-like-home task 5): a colour from the palette, a shape of
 * door and a landmark print, so sixteen wings do not read as sixteen copies of one grid.
 */
import { WINGS } from './castle.ts';

export type DoorShape = 'arch' | 'pointed' | 'square' | 'round';

const COLOURS = ['#0b1b4d', '#1e5a3a', '#7a3b1d', '#8a2f4d', '#00606e', '#3a2f7a'] as const;
const SHAPES: readonly DoorShape[] = ['arch', 'pointed', 'square', 'round'];

export interface WingLook {
  colour: string;
  shape: DoorShape;
  index: number;
}

export function wingLook(id: string): WingLook {
  const i = Math.max(0, WINGS.findIndex((w) => w.id === id));
  return { colour: COLOURS[i % COLOURS.length] as string, shape: SHAPES[i % SHAPES.length] as DoorShape, index: i };
}

/** Door outlines in the 20 x 28 box the arch door is drawn in (the wall scales them up). */
export const DOOR_PATHS: Record<Exclude<DoorShape, 'arch'>, string> = {
  pointed: 'M1 28 L1.4 15 Q2 10 10 4 Q18 10 18.6 15 L19 28 Z',
  square: 'M1 8 L19 7.2 L19.4 28 L0.8 28 Z',
  round: 'M10 8 C16 8 19.5 12 19.5 17.5 C19.5 23 15.5 27 10 27 C4.5 27 0.6 23 0.6 17.5 C0.6 12 4 8 10 8 Z',
};
