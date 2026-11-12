/**
 * Pure helpers for the Timeline screen: subject filtering, grouping by
 * century and the century ruler (07-timeline Req 2.2, 2.4).
 */
import type { TimelineEvent, TimelineSubject } from '../../lib/packs/types.ts';

export type SubjectFilter = 'all' | TimelineSubject;

/** The filter buttons, in display order. */
export const FILTERS: ReadonlyArray<{ id: SubjectFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'countries', label: 'Countries' },
  { id: 'science', label: 'Science' },
  { id: 'people', label: 'People' },
  { id: 'history', label: 'History' },
];

/** Events of one subject, or every event for `all`; order is kept. */
export function filterBySubject(
  events: readonly TimelineEvent[],
  filter: SubjectFilter,
): TimelineEvent[] {
  return filter === 'all' ? [...events] : events.filter((e) => e.subject === filter);
}

/** The year of an event; all dates are CE (Req 2.5). */
export function yearOf(event: Pick<TimelineEvent, 'date'>): number {
  return Number(event.date.slice(0, 4));
}

/** "1900s" for any year from 1900 to 1999. */
export function centuryLabel(year: number): string {
  return `${Math.floor(year / 100) * 100}s`;
}

export interface CenturyGroup {
  label: string;
  events: TimelineEvent[];
}

/** Splits events (already oldest first) into runs of one century each. */
export function groupByCentury(events: readonly TimelineEvent[]): CenturyGroup[] {
  const groups: CenturyGroup[] = [];
  for (const e of events) {
    const label = centuryLabel(yearOf(e));
    const last = groups.at(-1);
    if (last && last.label === label) {
      last.events.push(e);
    } else {
      groups.push({ label, events: [e] });
    }
  }
  return groups;
}

/**
 * Where a year sits on the ruler, from 0 (left) to 1 (right). Years
 * outside the range are clamped, so "you are here" never leaves the
 * line (Req 2.4).
 */
export function positionOf(year: number, min: number, max: number): number {
  if (max <= min) {
    return 1;
  }
  return Math.min(1, Math.max(0, (year - min) / (max - min)));
}

/** The years that get a mark: multiples of `step` inside [min, max]. */
export function rulerMarks(min: number, max: number, step = 100): number[] {
  const marks: number[] = [];
  for (let y = Math.ceil(min / step) * step; y <= max; y += step) {
    marks.push(y);
  }
  return marks;
}

/** The years covered by a list of events, or undefined when it is empty. */
export function yearRange(
  events: readonly TimelineEvent[],
): { min: number; max: number } | undefined {
  if (events.length === 0) {
    return undefined;
  }
  const years = events.map(yearOf);
  return { min: Math.min(...years), max: Math.max(...years) };
}
