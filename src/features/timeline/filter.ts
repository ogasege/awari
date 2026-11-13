/**
 * Pure helpers for the Timeline screen: subject filtering, grouping by
 * century and the century ruler (07-timeline Req 2.2, 2.4).
 */
import { EVENT_CONTINENTS, SUBJECTS, type EventContinent } from '../../lib/packs/subjects.ts';
import type { TimelineEvent, TimelineSubject } from '../../lib/packs/types.ts';

export type SubjectFilter = 'all' | TimelineSubject;
export type ContinentFilter = 'all' | EventContinent;

/** The subject buttons, in display order: every subject in Awari. */
export const FILTERS: ReadonlyArray<{ id: SubjectFilter; label: string }> = [
  { id: 'all', label: 'All' },
  ...SUBJECTS.map((s) => ({ id: s.id as SubjectFilter, label: s.label })),
];

/** The continent buttons, in display order. */
export const CONTINENT_FILTERS: ReadonlyArray<{ id: ContinentFilter; label: string }> = [
  { id: 'all', label: 'Everywhere' },
  ...EVENT_CONTINENTS.map((c) => ({ id: c as ContinentFilter, label: c })),
];

/** Events of one subject, or every event for `all`; order is kept. */
export function filterBySubject(
  events: readonly TimelineEvent[],
  filter: SubjectFilter,
): TimelineEvent[] {
  return filter === 'all' ? [...events] : events.filter((e) => e.subject === filter);
}

/** Events that match both a subject and a continent (either may be `all`). */
export function filterEvents(
  events: readonly TimelineEvent[],
  subject: SubjectFilter,
  continent: ContinentFilter,
): TimelineEvent[] {
  return events.filter(
    (e) => (subject === 'all' || e.subject === subject) && (continent === 'all' || e.continent === continent),
  );
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

/** First year of the century an event falls in (1865 -> 1800). */
export function centuryStart(year: number): number {
  return Math.floor(year / 100) * 100;
}

/**
 * Each century that holds at least one event, once, oldest first
 * (21-review-2 Req 17): the stops of the previous/next century controls.
 */
export function centuriesWith(events: readonly Pick<TimelineEvent, 'date'>[]): number[] {
  return [...new Set(events.map((e) => centuryStart(yearOf(e))))].sort((a, b) => a - b);
}

/** The events of one century, in the order given. */
export function inCentury(events: readonly TimelineEvent[], start: number): TimelineEvent[] {
  return events.filter((e) => centuryStart(yearOf(e)) === start);
}

/** The century to open on: the wanted year's, else 1900s if it has events, else the newest. */
export function startCentury(centuries: readonly number[], wantedYear: number | null): number | undefined {
  if (wantedYear !== null && centuries.includes(centuryStart(wantedYear))) {
    return centuryStart(wantedYear);
  }
  return centuries.includes(1900) ? 1900 : centuries.at(-1);
}

/** `wanted` if it holds events, else the nearest century that does (undefined when none do). */
export function nearestCentury(centuries: readonly number[], wanted: number): number | undefined {
  return [...centuries].sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted) || a - b)[0];
}

/** A birth ("X was born on ...") or anything else. */
export function isBirth(event: Pick<TimelineEvent, 'text'>): boolean {
  return /\bwas born\b/.test(event.text);
}

/** What an event is about, for its colour and the legend (22-review-3 Req 14). */
export type EventKindGroup = 'birth' | 'nation' | 'founded' | 'discovery' | 'book';

/** The legend, in display order. */
export const EVENT_KIND_GROUPS: ReadonlyArray<{ id: EventKindGroup; label: string }> = [
  { id: 'birth', label: 'Birthday' },
  { id: 'nation', label: 'A country is born' },
  { id: 'founded', label: 'Founded or opened' },
  { id: 'discovery', label: 'Discovery or launch' },
  { id: 'book', label: 'First published' },
];

/** The group of an event, read from its fixed sentence template. */
export function kindOf(event: Pick<TimelineEvent, 'text'>): EventKindGroup {
  const t = event.text;
  if (/\bwas born\b/.test(t)) return 'birth';
  if (/\bbecame an independent country\b/.test(t)) return 'nation';
  if (/\bwas (launched|discovered)\b/.test(t)) return 'discovery';
  if (/\bwas first published\b/.test(t)) return 'book';
  return 'founded';
}

/** A ruler step that keeps the marks readable: about ten marks at most. */
export function rulerStep(min: number, max: number): number {
  const span = Math.max(1, max - min);
  for (const step of [100, 200, 500, 1000, 2000]) {
    if (span / step <= 10) return step;
  }
  return 5000;
}

/** Events shown at once for a century unless the student asks for all of them. */
export const CENTURY_LIMIT = 60;

/** `count` items spread evenly across a list, order kept. */
function spread<T>(list: readonly T[], count: number): T[] {
  if (count >= list.length) return [...list];
  return Array.from({ length: count }, (_, i) => list[Math.floor((i * list.length) / count)] as T);
}

/**
 * The default view of one century (21-review-2 Req 18): at most `limit`
 * events, oldest first, with fewer births than other events whenever the
 * century holds any other event, so a page is not a wall of "was born".
 */
export function balancedCentury(events: readonly TimelineEvent[], limit = CENTURY_LIMIT): TimelineEvent[] {
  const others = events.filter((e) => !isBirth(e));
  const births = events.filter(isBirth);
  const takeOthers = Math.min(others.length, births.length === 0 ? limit : Math.ceil(limit * 0.6));
  const takeBirths =
    others.length === 0
      ? Math.min(births.length, limit)
      : // Strictly under 40% of what is shown: births < 2/3 of the other events (22-review-3 Req 16).
        Math.max(0, Math.min(births.length, Math.ceil((takeOthers * 2) / 3) - 1, limit - takeOthers));
  const chosen = new Set([...spread(others, takeOthers), ...spread(births, takeBirths)]);
  return events.filter((e) => chosen.has(e));
}
