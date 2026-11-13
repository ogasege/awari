import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { TimelineEvent } from '../../lib/packs/types.ts';
import { CENTURY_LIMIT, balancedCentury, centuriesWith, centuryStart, inCentury, isBirth, nearestCentury, yearOf } from './filter.ts';

const event = fc
  .record({
    n: fc.integer({ min: 0, max: 100_000 }),
    year: fc.integer({ min: 1000, max: 2025 }),
    birth: fc.boolean(),
  })
  .map(
    ({ n, year, birth }): TimelineEvent => ({
      id: `Q${n}`,
      date: `${String(year).padStart(4, '0')}-06-15`,
      label: `Label ${n}`,
      text: birth ? `Person ${n} was born on 15 June ${year}.` : `Thing ${n} was founded on 15 June ${year}.`,
      subject: 'people',
      source: {
        name: 'Wikidata',
        url: 'https://www.wikidata.org/',
        licence: 'CC0',
        licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        retrieved: '2026-01-01',
      },
    }),
  );
const unique = (events: TimelineEvent[]): TimelineEvent[] =>
  [...new Map(events.map((e) => [e.id, e])).values()].sort((a, b) => a.date.localeCompare(b.date));

describe('century view (21-review-2 Properties 8 and 9)', () => {
  it('Property 8: centuriesWith lists each century once, ascending, and every event is in exactly one', () => {
    fc.assert(
      fc.property(fc.array(event, { maxLength: 80 }), (raw) => {
        const events = unique(raw);
        const centuries = centuriesWith(events);
        expect(centuries).toEqual([...new Set(centuries)].sort((a, b) => a - b));
        for (const e of events) {
          expect(centuries.filter((c) => centuryStart(yearOf(e)) === c)).toHaveLength(1);
        }
        expect(centuries.reduce((n, c) => n + inCentury(events, c).length, 0)).toBe(events.length);
      }),
    );
  });

  it('Property 9: the default view is capped, ordered, and has fewer births than other events', () => {
    fc.assert(
      fc.property(fc.array(event, { maxLength: 300 }), (raw) => {
        const events = unique(raw);
        const shown = balancedCentury(events);
        expect(shown.length).toBeLessThanOrEqual(CENTURY_LIMIT);
        expect(shown.every((e) => events.includes(e))).toBe(true);
        expect(shown.map((e) => e.date)).toEqual([...shown.map((e) => e.date)].sort());
        const others = events.filter((e) => !isBirth(e)).length;
        const births = shown.filter(isBirth).length;
        if (others >= 2) {
          expect(births * 2).toBeLessThan(shown.length);
        }
        if (events.length > 0) {
          expect(shown.length).toBeGreaterThan(0);
        }
      }),
    );
  });

  it('opens on the nearest century that has events', () => {
    expect(nearestCentury([1700, 1800, 1900], 2000)).toBe(1900);
    expect(nearestCentury([1700, 1900], 1800)).toBe(1700);
    expect(nearestCentury([], 1900)).toBeUndefined();
  });
});
