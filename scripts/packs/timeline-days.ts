/**
 * "On this day" coverage (22-review-3 Req 1 to 3): every month-day of the
 * year, including 29 February, needs at least two events of its own. The
 * candidate rows come from `timeline-days-data.ts` (generated from the
 * Wikidata query service by `timeline-days-fetch.ts`); the build checks each
 * one against the item's own statements, like every other timeline item.
 */
import type { TimelineSubject } from '../../src/lib/packs/types.ts';
import { DAY_ROWS, type DayRow } from './timeline-days-data.ts';
import type { EventKind, TimelineItem } from './timeline.ts';

/** All 366 month-days ("MM-DD") of a leap year, in calendar order. */
export function dayKeys(): string[] {
  const keys: string[] = [];
  const d = new Date(Date.UTC(2024, 0, 1));
  for (let i = 0; i < 366; i++) {
    keys.push(d.toISOString().slice(5, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return keys;
}

/** Reviewed rows for days the query left short (7 May); the build still cross-checks the date. */
const EXTRA_ROWS: readonly DayRow[] = [
];

/** The timeline items for the day rows; `expect` makes a disputed day drop out. */
export function dayItems(): TimelineItem[] {
  return [...DAY_ROWS, ...EXTRA_ROWS].map(([qid, date, subject, kind]) => ({
    qid,
    subject: subject as TimelineSubject,
    kind: kind as EventKind,
    expect: date,
  }));
}

/** Month-days that have fewer than `min` events. */
export function daysShort(events: readonly { date: string }[], min = 2): { day: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    const day = e.date.slice(5, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return dayKeys()
    .map((day) => ({ day, count: counts.get(day) ?? 0 }))
    .filter((x) => x.count < min);
}
