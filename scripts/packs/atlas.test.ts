// @vitest-environment node
/** Tests for trimming Natural Earth shapes into the atlas file. */
import fc from 'fast-check';
import type { Position } from 'geojson';
import { describe, expect, it } from 'vitest';
import { round2, roundRing, trimAtlas } from './atlas.ts';
import type { NeCollection } from './countries.ts';

const square = (x: number, y: number, size = 1): Position[] => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
  [x, y],
];

describe('trimAtlas', () => {
  it('keeps iso3/name/id, falls back to ADM0_A3 and rounds', () => {
    const ne: NeCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { ISO_A3: '-99', ADM0_A3: 'FRA', NAME: 'France', NAME_EN: 'France', WIKIDATAID: 'Q142' },
          geometry: { type: 'Polygon', coordinates: [square(2.123456, 46.98765)] },
        },
        {
          type: 'Feature',
          properties: { ISO_A3: 'GRL', ADM0_A3: 'GRL', NAME: 'Greenland' },
          geometry: { type: 'MultiPolygon', coordinates: [[square(-40, 70)], [square(1, 1, 0.001)]] },
        },
      ],
    };
    const out = trimAtlas(ne, (p) =>
      p.WIKIDATAID === 'Q142' ? { id: 'france', name: 'France' } : undefined,
    );
    expect(out.features.map((f) => f.properties)).toEqual([
      { iso3: 'FRA', name: 'France', id: 'france' },
      { iso3: 'GRL', name: 'Greenland', id: null },
    ]);
    expect(out.features[0]?.geometry.coordinates[0]?.[0]).toEqual([2.12, 46.99]);
    // The tiny island collapses to a point and is dropped.
    expect(out.features[1]?.geometry.coordinates).toHaveLength(1);
  });

  const coord = fc.double({ min: -180, max: 180, noNaN: true });
  const ring = fc.array(fc.tuple(coord, coord), { minLength: 3, maxLength: 12 }).map(
    (pts) => [...pts, pts[0] as [number, number]] as Position[],
  );
  const props = fc.record({
    ISO_A3: fc.constantFrom('-99', 'NGA', 'ZAF'),
    ADM0_A3: fc.constantFrom('NOR', 'KOS', 'NGA'),
    NAME: fc.constantFrom('A', 'B'),
    extra: fc.string(),
  });

  it('Property 8: trimmed features have exact props, 2-decimal coords and closed rings (Req 7.2, 7.3)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(props, fc.array(ring, { minLength: 1, maxLength: 3 })), { maxLength: 6 }),
        (items) => {
          const ne = {
            features: items.map(([p, rings]) => ({
              type: 'Feature' as const,
              properties: p,
              geometry: { type: 'Polygon' as const, coordinates: rings },
            })),
          };
          const out = trimAtlas(ne, () => undefined);
          for (const f of out.features) {
            expect(Object.keys(f.properties).sort()).toEqual(['id', 'iso3', 'name']);
            const src = items.find(([p]) => p.NAME === f.properties.name)?.[0];
            expect(src).toBeDefined();
            const polys =
              f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
            for (const poly of polys) {
              for (const r of poly) {
                expect(r.length).toBeGreaterThanOrEqual(4);
                expect(r[0]).toEqual(r.at(-1));
                for (const [x, y] of r) {
                  expect(round2(x ?? 0)).toBe(x);
                  expect(round2(y ?? 0)).toBe(y);
                  expect(String(x)).toMatch(/^-?\d+(\.\d{1,2})?$/);
                }
              }
            }
          }
          for (const f of out.features) {
            expect(['NGA', 'ZAF', 'NOR', 'KOS']).toContain(f.properties.iso3);
          }
        },
      ),
    );
  });

  it('iso3 follows the ISO_A3 / ADM0_A3 rule', () => {
    fc.assert(
      fc.property(props, (p) => {
        const out = trimAtlas(
          { features: [{ type: 'Feature', properties: p, geometry: { type: 'Polygon', coordinates: [square(0, 0, 5)] } }] },
          () => undefined,
        );
        expect(out.features[0]?.properties.iso3).toBe(p.ISO_A3 === '-99' ? p.ADM0_A3 : p.ISO_A3);
      }),
    );
  });

  it('drops degenerate rings', () => {
    expect(roundRing([[0, 0], [0.001, 0], [0, 0.001], [0, 0]])).toBeNull();
  });
});
