/**
 * Twelve hand-drawn castle doors in two rows, lit (filled yellow) for each
 * room the student has completed: progress shown as drawn objects
 * (design rule 6). Drawn in the 1344 x 650 "Learn by playing" canvas.
 */
import { rng, seedFrom } from '../../design/wobble.ts';

const XS = [606, 636, 666, 696, 726, 756];
const ROWS = [346, 388];

/** A wobbly arched door outline with its top-left corner at (x, y). */
export function doorPath(x: number, y: number, seed: number): string {
  const next = rng(seed);
  const j = (n: number): string => (n + (next() - 0.5) * 1.6).toFixed(1);
  return (
    `M${j(x)} ${j(y + 22)}L${j(x)} ${j(y)}` +
    `C${j(x + 0.5)} ${j(y - 11)} ${j(x + 20)} ${j(y - 11)} ${j(x + 20)} ${j(y)}` +
    `L${j(x + 20)} ${j(y + 22)}Z`
  );
}

export function DoorRow({ lit }: { lit: number }) {
  const doors = ROWS.flatMap((y) => XS.map((x) => ({ x, y })));
  return (
    <svg
      aria-hidden="true"
      className="deco"
      viewBox="0 0 1344 650"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {doors.map((d, i) => (
        <path
          key={`${d.x}-${d.y}`}
          d={doorPath(d.x, d.y, seedFrom(`door${i}`))}
          stroke={i < lit ? '#FFD23F' : '#FFFFFF'}
          fill={i < lit ? '#FFD23F' : 'none'}
          style={{ filter: 'url(#aw-chalk)' }}
        />
      ))}
    </svg>
  );
}
