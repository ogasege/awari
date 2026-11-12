import { geoOrthographic } from 'd3-geo';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { TOURS, stepStop, stopHref, stopRotation, tourById } from './tours.ts';

describe('tours (20-tours)', () => {
  it('has the three tours, each with six to eight stops. _Req 1, 2_', () => {
    expect(TOURS.map((t) => t.id)).toEqual(['rivers', 'wonders', 'volcanoes']);
    for (const t of TOURS) {
      expect(t.stops.length).toBeGreaterThanOrEqual(6);
      expect(t.stops.length).toBeLessThanOrEqual(8);
      expect(new Set(t.stops.map((s) => s.article)).size).toBe(t.stops.length);
    }
    expect(tourById('rivers')?.title).toBe('Great rivers of the world');
    expect(tourById('nope')).toBeUndefined();
  });

  it('Property 3 (data): every stop has valid coordinates, a place in words and a pack article path', () => {
    for (const t of TOURS) {
      for (const s of t.stops) {
        expect(s.lat).toBeGreaterThanOrEqual(-90);
        expect(s.lat).toBeLessThanOrEqual(90);
        expect(s.lon).toBeGreaterThanOrEqual(-180);
        expect(s.lon).toBeLessThanOrEqual(180);
        expect(s.place.length).toBeGreaterThan(3);
        expect(s.article).toMatch(/^(earth|ancient)\/[a-z0-9-]+$/);
      }
    }
  });

  it('Property 1: stepping stays inside the tour, and next then previous returns. _Req 3_', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 12 }), fc.integer({ min: 0, max: 11 }), fc.integer({ min: -20, max: 20 }), (n, i, d) => {
        const from = Math.min(i, n - 1);
        const to = stepStop(n, from, d);
        expect(to).toBeGreaterThanOrEqual(0);
        expect(to).toBeLessThanOrEqual(n - 1);
        if (from + 1 <= n - 1) expect(stepStop(n, stepStop(n, from, 1), -1)).toBe(from);
        if (from - 1 >= 0) expect(stepStop(n, stepStop(n, from, -1), 1)).toBe(from);
      }),
    );
    expect(stepStop(0, 3, 1)).toBe(0);
  });

  it('Property 2: the globe turns so that every stop is at its centre. _Req 4_', () => {
    for (const t of TOURS) {
      for (const s of t.stops) {
        const projection = geoOrthographic().scale(200).translate([300, 300]).rotate(stopRotation(s));
        const [x, y] = projection([s.lon, s.lat]) as [number, number];
        expect(x).toBeCloseTo(300, 6);
        expect(y).toBeCloseTo(300, 6);
      }
    }
  });

  it('every stop of the volcanoes tour lies around the Pacific (east of 95 or west of -60)', () => {
    const volcanoes = tourById('volcanoes');
    expect(volcanoes).toBeDefined();
    for (const s of volcanoes?.stops ?? []) {
      expect(s.lon > 95 || s.lon < -60, `${s.title} at ${s.lon}`).toBe(true);
    }
  });

  it('opens a stop as its article with the tour and stop number in the address', () => {
    const rivers = tourById('rivers');
    expect(rivers && stopHref(rivers, 0)).toBe('/article/earth/nile?tour=rivers&stop=1');
  });
});
