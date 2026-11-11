import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { TimelineEvent, TimelineSubject } from '../../lib/packs/types.ts';
import { DAILY_QUIZZES, monthDay, onThisDay, todaysQuiz } from './today.ts';

const subject = fc.constantFrom<TimelineSubject>('countries', 'science', 'people', 'history');
const date = fc.date({ min: new Date(1900, 0, 1), max: new Date(2100, 0, 1), noInvalidDate: true });
const event = fc
  .record({
    year: fc.integer({ min: 1000, max: 2025 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }),
    subject,
    id: fc.stringMatching(/^Q[0-9]{1,6}$/),
  })
  .map(
    (r): TimelineEvent => ({
      id: r.id,
      date: `${r.year}-${String(r.month).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`,
      label: r.id,
      text: r.id,
      subject: r.subject,
      source: {
        name: 'Wikidata',
        url: 'https://www.wikidata.org',
        licence: 'CC0',
        licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        retrieved: '2026-11-11',
      },
    }),
  );

describe('Home: on this day and today’s quiz (07-timeline / 01-app-shell)', () => {
  it('Property 1: every picked event happened on today’s month and day', () => {
    fc.assert(
      fc.property(fc.array(event, { maxLength: 60 }), date, (events, d) => {
        for (const e of onThisDay(events, d)) {
          expect(e.date.slice(5)).toBe(monthDay(d));
        }
      }),
    );
  });

  it('Property 2: picks min(3, matches) events, oldest first, no repeats', () => {
    fc.assert(
      fc.property(fc.array(event, { maxLength: 60 }), date, (events, d) => {
        const matches = events.filter((e) => e.date.slice(5) === monthDay(d));
        const picked = onThisDay(events, d);
        expect(picked.length).toBe(Math.min(3, matches.length));
        expect(new Set(picked).size).toBe(picked.length);
        const dates = picked.map((e) => e.date);
        expect([...dates].sort()).toEqual(dates);
      }),
    );
  });

  it('Property 3: when several subjects match, the three are not all one subject', () => {
    fc.assert(
      fc.property(fc.array(event, { minLength: 3, maxLength: 60 }), date, (events, d) => {
        const md = monthDay(d);
        const matching = events.filter((e) => e.date.slice(5) === md);
        const subjects = new Set(matching.map((e) => e.subject));
        const picked = onThisDay(events, d);
        if (subjects.size >= 2 && picked.length === 3) {
          expect(new Set(picked.map((e) => e.subject)).size).toBeGreaterThan(1);
        }
      }),
    );
  });

  it('Property 4: today’s quiz is stable all day and rotates through every quiz', () => {
    fc.assert(
      fc.property(date, fc.integer({ min: 0, max: 23 }), (d, hour) => {
        const later = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour);
        expect(todaysQuiz(later)).toBe(todaysQuiz(d));
      }),
    );
    const start = new Date(2026, 10, 11);
    const seen = new Set(
      DAILY_QUIZZES.map((_, i) =>
        todaysQuiz(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)),
      ),
    );
    expect(seen.size).toBe(DAILY_QUIZZES.length);
  });
});
