import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { HomeFeatured, HomeNoteData } from '../../lib/packs/home.ts';
import { SUBJECTS, CONTINENTS, normaliseContinent } from '../../lib/packs/subjects.ts';
import type { PackIndexItem } from '../../lib/packs/types.ts';
import { nextCountry, pickFeatured, pickNotes, pickSubjects } from './rotation.ts';

const ids = SUBJECTS.map((s) => s.id);
const day = fc.integer({ min: 19000, max: 25000 });

describe('Home rotation (19-home-world)', () => {
  it('Property 2: five prints are from five different subjects. _Req 1_', () => {
    fc.assert(
      fc.property(day, (d) => {
        const five = pickSubjects(d, ids, 5);
        expect(five).toHaveLength(5);
        expect(new Set(five).size).toBe(5);
        for (const s of five) expect(ids).toContain(s);
      }),
    );
  });

  it('Property 3: every subject appears within any eleven consecutive days. _Req 2_', () => {
    fc.assert(
      fc.property(day, (d) => {
        const seen = new Set<string>();
        for (let k = 0; k < 11; k += 1) pickSubjects(d + k, ids, 5).forEach((s) => seen.add(s));
        expect([...seen].sort()).toEqual([...ids].sort());
      }),
    );
    // In fact three days are enough with eleven subjects and five prints.
    const three = new Set([0, 1, 2].flatMap((k) => pickSubjects(19000 + k, ids, 5)));
    expect(three.size).toBe(11);
  });

  it('Property 1: the same day gives the same picks, from the data only. _Req 6_', () => {
    const featured: HomeFeatured[] = Array.from({ length: 6 }, (_, i) => ({
      pack: 'earth',
      id: `a${i}`,
      title: `A${i}`,
      photo: { file: `img/a${i}.jpg`, alt: 'x', width: 1, height: 1 },
    }));
    fc.assert(
      fc.property(day, fc.integer({ min: 0, max: 4 }), (d, slot) => {
        const a = pickFeatured(d, slot, featured);
        expect(pickFeatured(d, slot, featured)).toEqual(a);
        expect(featured).toContain(a);
      }),
    );
    expect(pickFeatured(1, 0, [])).toBeUndefined();
    expect(pickSubjects(5, [], 5)).toEqual([]);
  });

  const note = (i: number, subject: string, kind: 'fact' | 'question'): HomeNoteData => ({
    kind,
    text: `n${i}`,
    to: `/article/${subject}/a${i}`,
    subject: subject as HomeNoteData['subject'],
    ...(kind === 'fact' ? { article: `${subject}/a${i}`, proof: `Proof ${i}.` } : {}),
  });
  const pool = ids.flatMap((s, si) => [note(si * 2, s, 'fact'), note(si * 2 + 1, s, 'question')]);

  it('picks six different notes alternating facts and questions, every fact with its proof. _Req 3_', () => {
    fc.assert(
      fc.property(day, (d) => {
        const picked = pickNotes(d, pool, 6);
        expect(picked).toHaveLength(6);
        expect(new Set(picked).size).toBe(6);
        picked.forEach((n, k) => {
          expect(n.kind).toBe(k % 2 === 0 ? 'fact' : 'question');
          if (n.kind === 'fact') expect(n.proof).toBeTruthy();
        });
        expect(new Set(picked.map((n) => n.subject)).size).toBeGreaterThanOrEqual(5);
      }),
    );
    expect(pickNotes(3, [], 6)).toEqual([]);
    expect(pickNotes(3, pool.slice(0, 2), 6)).toHaveLength(2);
  });

  const items: PackIndexItem[] = CONTINENTS.flatMap((c) =>
    Array.from({ length: 5 }, (_, i) => ({ id: `${c.toLowerCase().replace(/ /g, '')}${i}`, title: `${c} ${i}`, summary: '', continent: c })),
  );

  it('Property 5: the suggested country is never one already found, and comes from the thinnest continent. _Req 4_', () => {
    fc.assert(
      fc.property(day, fc.array(fc.constantFrom(...items.map((i) => i.id)), { maxLength: 29 }), (d, found) => {
        const pick = nextCountry(d, found, items);
        const all = new Set(found);
        if (all.size < items.length) {
          expect(pick).toBeDefined();
          expect(all.has(pick?.id ?? '')).toBe(false);
          const count = (c: string): number => items.filter((i) => all.has(i.id) && normaliseContinent(i.continent) === c).length;
          const open = CONTINENTS.filter((c) => items.some((i) => !all.has(i.id) && i.continent === c));
          expect(count(normaliseContinent(pick?.continent) ?? '')).toBe(Math.min(...open.map(count)));
        } else {
          expect(pick).toBeUndefined();
        }
      }),
    );
    expect(nextCountry(1, [], [])).toBeUndefined();
  });
});
