import { geoOrthographic } from 'd3-geo';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { centreOn, drag, keyStep, normalise, type Rotation } from './globeMath.ts';

const angle = fc.double({ min: -1e4, max: 1e4, noNaN: true });

describe('globe maths (04-atlas)', () => {
  it('Property 1: normalised rotations are in range (Req 1.4)', () => {
    fc.assert(
      fc.property(angle, angle, (l, p) => {
        const [nl, np] = normalise([l, p]);
        expect(nl).toBeGreaterThanOrEqual(-180);
        expect(nl).toBeLessThan(180);
        expect(np).toBeGreaterThanOrEqual(-90);
        expect(np).toBeLessThanOrEqual(90);
      }),
    );
  });

  it('Property 2: whole turns do not change the rotation (Req 1.4)', () => {
    fc.assert(
      fc.property(fc.double({ min: -720, max: 720, noNaN: true }), fc.integer({ min: -5, max: 5 }), (l, k) => {
        const a = normalise([l, 0])[0];
        const b = normalise([l + 360 * k, 0])[0];
        const d = Math.abs(a - b);
        expect(Math.min(d, 360 - d)).toBeLessThan(1e-6);
      }),
    );
  });

  it('Property 3: a drag and its reverse return to the start (Req 1.2)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -170, max: 170, noNaN: true }),
        fc.double({ min: -40, max: 40, noNaN: true }),
        fc.double({ min: -100, max: 100, noNaN: true }),
        fc.double({ min: -100, max: 100, noNaN: true }),
        fc.double({ min: 100, max: 400, noNaN: true }),
        (l, p, dx, dy, radius) => {
          const start: Rotation = [l, p];
          const back = drag(drag(start, dx, dy, radius), -dx, -dy, radius);
          expect(back[0]).toBeCloseTo(l, 9);
          expect(back[1]).toBeCloseTo(p, 9);
        },
      ),
    );
  });

  it('Property 4: centring a point projects it to the middle of the globe (Req 2.1)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -180, max: 180, noNaN: true }),
        fc.double({ min: -89, max: 89, noNaN: true }),
        (lon, lat) => {
          const projection = geoOrthographic().scale(200).translate([300, 300]).rotate(centreOn(lon, lat));
          const [x, y] = projection([lon, lat]) as [number, number];
          expect(x).toBeCloseTo(300, 6);
          expect(y).toBeCloseTo(300, 6);
        },
      ),
    );
  });

  it('Property 5: each arrow key changes exactly one angle by one step (Req 1.3)', () => {
    fc.assert(
      fc.property(angle, angle, fc.constantFrom('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'), (l, p, key) => {
        const next = keyStep([l, p], key) as Rotation;
        const changed = [Math.abs(next[0] - l), Math.abs(next[1] - p)];
        expect(changed.filter((c) => c > 1e-9)).toHaveLength(1);
        expect(Math.max(...changed)).toBeCloseTo(15, 9);
      }),
    );
    expect(keyStep([0, 0], 'Enter')).toBeNull();
  });
});
