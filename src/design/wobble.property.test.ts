import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  clampTilt,
  cutPolygon,
  tornEdge,
  wobblyArrow,
  wobblyCircle,
  wobblyPoints,
  wobblyStar,
} from './wobble.ts';

const seed = fc.integer({ min: 0, max: 2 ** 31 - 1 });
const coord = fc.double({ min: -500, max: 500, noNaN: true });
const numbersIn = (d: string): number[] =>
  (d.match(/-?\d+(\.\d+)?(e-?\d+)?/g) ?? []).map(Number);

describe('wobble generator (01-app-shell)', () => {
  it('Property 3: same seed draws the same shape, with finite numbers (Req 4.3)', () => {
    fc.assert(
      fc.property(seed, coord, coord, (s, x, y) => {
        const a = [
          wobblyCircle(x, y, 20, s),
          wobblyStar(x, y, 15, s),
          wobblyArrow({ x, y }, { x: x + 80, y: y + 30 }, s).join(''),
          tornEdge(1440, 34, s),
          cutPolygon(s),
        ];
        const b = [
          wobblyCircle(x, y, 20, s),
          wobblyStar(x, y, 15, s),
          wobblyArrow({ x, y }, { x: x + 80, y: y + 30 }, s).join(''),
          tornEdge(1440, 34, s),
          cutPolygon(s),
        ];
        expect(a).toEqual(b);
        for (const d of a) {
          expect(numbersIn(d).every(Number.isFinite)).toBe(true);
        }
      }),
    );
  });

  it('Property 3b: different seeds draw different torn edges (Req 4.3)', () => {
    fc.assert(
      fc.property(seed, seed, (s1, s2) => {
        fc.pre(s1 !== s2);
        expect(tornEdge(1440, 34, s1)).not.toBe(tornEdge(1440, 34, s2));
      }),
    );
  });

  it('Property 4: jittered points stay within the wobble amplitude (Req 4.3)', () => {
    fc.assert(
      fc.property(
        seed,
        coord,
        coord,
        coord,
        coord,
        fc.double({ min: 0, max: 10, noNaN: true }),
        (s, x1, y1, x2, y2, amp) => {
          fc.pre(Math.hypot(x2 - x1, y2 - y1) > 1);
          const pts = wobblyPoints({ x: x1, y: y1 }, { x: x2, y: y2 }, s, amp);
          const len = Math.hypot(x2 - x1, y2 - y1);
          for (const p of pts) {
            // distance from the ideal line
            const dist =
              Math.abs((x2 - x1) * (y1 - p.y) - (x1 - p.x) * (y2 - y1)) / len;
            expect(dist).toBeLessThanOrEqual(amp + 1e-6);
          }
        },
      ),
    );
  });

  it('Property 4b: cut polygons stay inside the box (Req 4.3)', () => {
    fc.assert(
      fc.property(seed, (s) => {
        for (const n of numbersIn(cutPolygon(s))) {
          expect(n).toBeGreaterThanOrEqual(0);
          expect(n).toBeLessThanOrEqual(100);
        }
      }),
    );
  });

  it('Property 5: print tilt magnitude is always between 2 and 5 degrees (Req 4.2)', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: false }), (deg) => {
        const t = Math.abs(clampTilt(deg));
        expect(t).toBeGreaterThanOrEqual(2);
        expect(t).toBeLessThanOrEqual(5);
      }),
    );
  });
});
