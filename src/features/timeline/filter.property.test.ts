/**
 * Properties of the timeline filter and ruler (07-timeline design):
 * 1 and 2 for filtering, 6 for the ruler.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { EVENT_CONTINENTS, SUBJECTS } from '../../lib/packs/subjects.ts';
import type { TimelineEvent, TimelineSubject } from '../../lib/packs/types.ts';
import {
  FILTERS,
  centuryLabel,
  filterBySubject,
  filterEvents,
  groupByCentury,
  positionOf,
  rulerMarks,
  yearOf,
  yearRange,
  type SubjectFilter,
} from './filter.ts';

const subjects: TimelineSubject[] = SUBJECTS.map((x) => x.id);

const event = fc
  .record({
    year: fc.integer({ min: 1, max: 2100 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }),
    subject: fc.constantFrom(...subjects),
    continent: fc.option(fc.constantFrom(...EVENT_CONTINENTS), { nil: undefined }),
    id: fc.stringMatching(/^Q[0-9]{1,6}$/),
  })
  .map(
    (r): TimelineEvent => ({
      id: r.id,
      date: `${String(r.year).padStart(4, '0')}-${String(r.month).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`,
      label: r.id,
      text: r.id,
      subject: r.subject,
      ...(r.continent ? { continent: r.continent } : {}),
      source: {
        name: 'Wikidata',
        url: 'https://www.wikidata.org',
        licence: 'CC0',
        licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        retrieved: '2026-11-12',
      },
    }),
  );

const events = fc
  .array(event, { maxLength: 40 })
  .map((list) => [...list].sort((a, b) => a.date.localeCompare(b.date)));

describe('Timeline filter (07-timeline 3.1)', () => {
  it('Property 1: a subject filter returns only that subject; All returns every event unchanged and in order. _Req 2.2_', () => {
    fc.assert(
      fc.property(events, fc.constantFrom(...subjects), (list, subject) => {
        const some = filterBySubject(list, subject);
        expect(some.every((e) => e.subject === subject)).toBe(true);
        expect(some).toEqual(list.filter((e) => e.subject === subject));
        expect(filterBySubject(list, 'all')).toEqual(list);
      }),
    );
  });

  it('Property 2: filtering is idempotent and the subject filters partition the events. _Req 2.2, 2.4_', () => {
    fc.assert(
      fc.property(events, fc.constantFrom(...FILTERS.map((f) => f.id)), (list, filter: SubjectFilter) => {
        const once = filterBySubject(list, filter);
        expect(filterBySubject(once, filter)).toEqual(once);
      }),
    );
    fc.assert(
      fc.property(events, (list) => {
        const parts = subjects.flatMap((s) => filterBySubject(list, s));
        expect(parts).toHaveLength(list.length);
      }),
    );
  });

  it('Property 1 (world): subject and continent together return exactly the events with both; All and Everywhere return everything. _Req 6_', () => {
    fc.assert(
      fc.property(events, fc.constantFrom('all' as const, ...subjects), fc.constantFrom('all' as const, ...EVENT_CONTINENTS), (list, subject, continent) => {
        const out = filterEvents(list, subject, continent);
        expect(out).toEqual(
          list.filter((e) => (subject === 'all' || e.subject === subject) && (continent === 'all' || e.continent === continent)),
        );
        expect(filterEvents(out, subject, continent)).toEqual(out);
        expect(filterEvents(list, 'all', 'all')).toEqual(list);
        expect(filterEvents(list, subject, 'all')).toEqual(filterBySubject(list, subject));
      }),
    );
  });

  it('Property 6: ruler marks strictly increase inside the range, and "you are here" is clamped. _Req 2.4_', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2000 }),
        fc.integer({ min: 0, max: 600 }),
        fc.constantFrom(10, 50, 100),
        fc.integer({ min: -500, max: 4000 }),
        (min, span, step, today) => {
          const max = min + span;
          const marks = rulerMarks(min, max, step);
          marks.forEach((m, i) => {
            expect(m).toBeGreaterThanOrEqual(min);
            expect(m).toBeLessThanOrEqual(max);
            expect(m % step).toBe(0);
            if (i > 0) {
              expect(m).toBeGreaterThan(marks[i - 1] as number);
            }
          });
          const here = positionOf(today, min, max);
          expect(here).toBeGreaterThanOrEqual(0);
          expect(here).toBeLessThanOrEqual(1);
          for (const m of marks) {
            const at = positionOf(m, min, max);
            expect(at).toBeGreaterThanOrEqual(0);
            expect(at).toBeLessThanOrEqual(1);
          }
        },
      ),
    );
  });
});

describe('century groups and ranges', () => {
  it('labels centuries and keeps every event in one group, in order', () => {
    expect(centuryLabel(1999)).toBe('1900s');
    expect(centuryLabel(2000)).toBe('2000s');
    expect(centuryLabel(789)).toBe('700s');
    fc.assert(
      fc.property(events, (list) => {
        const groups = groupByCentury(list);
        expect(groups.flatMap((g) => g.events)).toEqual(list);
        for (const g of groups) {
          expect(g.events.every((e) => centuryLabel(yearOf(e)) === g.label)).toBe(true);
        }
        for (let i = 1; i < groups.length; i++) {
          expect(groups[i]?.label).not.toBe(groups[i - 1]?.label);
        }
      }),
    );
  });

  it('reports the year range, and nothing for no events', () => {
    expect(yearRange([])).toBeUndefined();
    fc.assert(
      fc.property(
        events.filter((l) => l.length > 0),
        (list) => {
          const r = yearRange(list);
          expect(r?.min).toBe(yearOf(list[0] as TimelineEvent));
          expect(r?.max).toBe(yearOf(list.at(-1) as TimelineEvent));
        },
      ),
    );
  });
});
