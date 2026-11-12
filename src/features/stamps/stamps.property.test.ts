import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CONTINENTS, normaliseContinent } from '../../lib/packs/subjects.ts';
import type { PackIndexItem } from '../../lib/packs/types.ts';
import { slotsFor, stampsFor, worldBook } from './stamps.ts';

const slug = fc.stringMatching(/^[a-z]{1,10}$/);
const items = fc.uniqueArray(
  fc.record({
    id: slug,
    title: fc.string({ minLength: 1, maxLength: 12 }),
    summary: fc.constant(''),
    continent: fc.constantFrom(...CONTINENTS, 'Insular Oceania', 'Antarctica?', undefined),
  }),
  { selector: (i) => i.id, maxLength: 80 },
) as fc.Arbitrary<PackIndexItem[]>;

describe('world stamp book (16-world-stamp-book)', () => {
  it('Property 1: one stamp per known discovered country, in discovery order', () => {
    fc.assert(
      fc.property(items, fc.array(slug, { maxLength: 100 }), (idx, discovered) => {
        const known = new Set(idx.map((i) => i.id));
        const expected = [...new Set(discovered.filter((d) => known.has(d)))];
        expect(stampsFor(discovered, idx).map((s) => s.id)).toEqual(expected);
      }),
    );
  });

  it('Property 2: the world count equals the stamps on a continent and never exceeds the total. _Req 1, 5_', () => {
    fc.assert(
      fc.property(items, fc.array(slug, { maxLength: 100 }), (idx, discovered) => {
        const book = worldBook(discovered, idx);
        expect(book.count).toBe(book.stamps.filter((s) => s.continent).length);
        expect(book.count).toBeLessThanOrEqual(book.total);
        expect(book.total).toBe(idx.filter((i) => normaliseContinent(i.continent)).length);
      }),
    );
  });

  it('Property 3: continent counts add up to the world count; each country is on one continent', () => {
    fc.assert(
      fc.property(items, fc.array(slug, { maxLength: 100 }), (idx, discovered) => {
        const book = worldBook(discovered, idx);
        expect(book.perContinent.reduce((n, c) => n + c.count, 0)).toBe(book.count);
        expect(book.perContinent.reduce((n, c) => n + c.total, 0)).toBe(book.total);
        expect(book.perContinent.map((c) => c.continent)).toEqual([...CONTINENTS]);
        for (const c of book.perContinent) expect(c.count).toBeLessThanOrEqual(c.total);
      }),
    );
  });

  it('Property 4: a continent page has exactly its countries, and the filled slots are exactly its stamps', () => {
    fc.assert(
      fc.property(items, fc.array(slug, { maxLength: 100 }), (idx, discovered) => {
        const stamps = stampsFor(discovered, idx);
        for (const continent of CONTINENTS) {
          const slots = slotsFor(continent, stamps, idx);
          const here = idx.filter((i) => normaliseContinent(i.continent) === continent).map((i) => i.id);
          expect(slots.map((s) => s.id).sort()).toEqual([...here].sort());
          expect(slots.filter((s) => s.stamp).map((s) => s.id).sort()).toEqual(
            stamps.filter((s) => s.continent === continent).map((s) => s.id).sort(),
          );
        }
      }),
    );
  });

  it('Property 5: discovering more never lowers any count', () => {
    fc.assert(
      fc.property(items, fc.array(slug), fc.array(slug), (idx, a, b) => {
        const before = worldBook(a, idx);
        const after = worldBook([...a, ...b], idx);
        expect(after.count).toBeGreaterThanOrEqual(before.count);
        after.perContinent.forEach((c, i) => expect(c.count).toBeGreaterThanOrEqual(before.perContinent[i]?.count ?? 0));
      }),
    );
  });

  it('counts the real index as 197 countries on six continents, Insular Oceania with Oceania', async () => {
    const { readFileSync } = await import('node:fs');
    const index = JSON.parse(readFileSync('public/packs/countries/index.json', 'utf8')) as { items: PackIndexItem[] };
    const book = worldBook([], index.items);
    expect(book.total).toBe(197);
    expect(book.perContinent.map((c) => [c.continent, c.total])).toEqual([
      ['Africa', 54],
      ['Asia', 49],
      ['Europe', 45],
      ['North America', 23],
      ['South America', 12],
      ['Oceania', 14],
    ]);
  });

  it('uses the design-kit photo for Nigeria', () => {
    const [s] = stampsFor(['nigeria'], [{ id: 'nigeria', title: 'Nigeria', summary: '', continent: 'Africa' }]);
    expect(s?.src).toBe('/photos/zuma.jpg');
    expect(s?.caption).toBe('Zuma Rock');
  });
});
