import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { PackIndexItem } from '../../lib/packs/types.ts';
import { AFRICA_TOTAL, stampsFor } from './stamps.ts';

const slug = fc.stringMatching(/^[a-z]{1,10}$/);
const items = fc.uniqueArray(
  fc.record({
    id: slug,
    title: fc.string({ minLength: 1, maxLength: 12 }),
    summary: fc.constant(''),
    continent: fc.constantFrom('Africa', 'Asia', 'Europe', undefined),
  }),
  { selector: (i) => i.id, maxLength: 80 },
) as fc.Arbitrary<PackIndexItem[]>;

describe('stamp book (08-stamp-book)', () => {
  it('Property 1: one stamp per known discovered country, in discovery order', () => {
    fc.assert(
      fc.property(items, fc.array(slug, { maxLength: 100 }), (idx, discovered) => {
        const known = new Set(idx.map((i) => i.id));
        const expected = [...new Set(discovered.filter((d) => known.has(d)))];
        expect(stampsFor(discovered, idx).stamps.map((s) => s.id)).toEqual(expected);
      }),
    );
  });

  it('Property 2: the Africa count equals African stamps and never exceeds 54', () => {
    fc.assert(
      fc.property(items, fc.array(slug, { maxLength: 100 }), (idx, discovered) => {
        const book = stampsFor(discovered, idx);
        const african = book.stamps.filter((s) => s.africa).length;
        expect(book.africaCount).toBe(Math.min(AFRICA_TOTAL, african));
        expect(book.africaTotal).toBe(54);
      }),
    );
  });

  it('Property 3: discovering more never lowers the count (monotonic)', () => {
    fc.assert(
      fc.property(items, fc.array(slug), fc.array(slug), (idx, a, b) => {
        expect(stampsFor([...a, ...b], idx).africaCount).toBeGreaterThanOrEqual(
          stampsFor(a, idx).africaCount,
        );
      }),
    );
  });

  it('uses the design-kit photo for Nigeria', () => {
    const book = stampsFor(['nigeria'], [
      { id: 'nigeria', title: 'Nigeria', summary: '', continent: 'Africa' },
    ]);
    expect(book.stamps[0]?.src).toBe('/photos/zuma.jpg');
    expect(book.africaCount).toBe(1);
  });
});
