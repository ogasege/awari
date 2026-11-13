/**
 * 22-review-3 Properties 1 and 2 (Req 1 to 3): every day of the year has at
 * least two events of its own, and "Coming up" only ever fills a third slot.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { TimelineEvent } from '../../lib/packs/types.ts';
import { monthDay, onThisDayOrNext } from './today.ts';

const events = (JSON.parse(readFileSync('public/packs/timeline.json', 'utf8')) as { events: TimelineEvent[] }).events;

/** Every day of a leap year, so 29 February is included. */
function allDays(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 366; i++) {
    days.push(new Date(2024, 0, 1 + i));
  }
  return days;
}

describe('On this day coverage (22-review-3 Property 1)', () => {
  it('has 366 distinct days to check', () => {
    expect(new Set(allDays().map(monthDay)).size).toBe(366);
  });

  it('gives every day of the year at least two events of its own', () => {
    const short = allDays()
      .map((d) => ({ day: monthDay(d), count: events.filter((e) => e.date.slice(5, 10) === monthDay(d)).length }))
      .filter((x) => x.count < 2);
    expect(short).toEqual([]);
  });

  it('never shows a Julian-calendar day as a Gregorian one', () => {
    // Tchaikovsky is 25 April 1840 on Wikidata (Julian) and 7 May in the modern calendar.
    expect(events.find((e) => e.id === 'Q7315')).toBeUndefined();
  });
});

describe('Coming up only in the third slot (22-review-3 Property 2)', () => {
  it('fills the first two slots with events of the day itself, on every day', () => {
    for (const d of allDays()) {
      const picked = onThisDayOrNext(events, d, 3).events;
      expect(picked.length).toBe(3);
      const same = picked.filter((e) => e.date.slice(5, 10) === monthDay(d));
      expect(same.length).toBeGreaterThanOrEqual(2);
    }
  });
});
