/**
 * Pure helpers that turn curated Wikidata items into timeline events.
 * Every sentence comes from a fixed template filled with Wikidata
 * fields, so what a student reads is true by construction
 * (07-timeline Req 1.3). Wikidata is CC0.
 */
import type {
  TimelineEvent,
  TimelinePack,
  TimelineSubject,
} from '../../src/lib/packs/types.ts';
import { EVENT_CONTINENTS, SUBJECTS } from '../../src/lib/packs/subjects.ts';
import { wikidataSource } from './sources.ts';
import {
  currentStatements,
  formatWikidataTime,
  itemIds,
  type Entity,
} from './wikidata.ts';

/** What an item's date means, which picks the property and the sentence. */
export type EventKind =
  | 'born'
  | 'founded'
  | 'established'
  | 'independence'
  | 'launched'
  | 'opened'
  | 'published'
  | 'discovered';

/** The Wikidata property and sentence template for each kind. */
export const KINDS: Readonly<
  Record<EventKind, { pid: string; text: (label: string, date: string) => string }>
> = {
  born: { pid: 'P569', text: (l, d) => `${l} was born on ${d}.` },
  founded: { pid: 'P571', text: (l, d) => `${l} was founded on ${d}.` },
  established: { pid: 'P571', text: (l, d) => `${l} was established on ${d}.` },
  independence: {
    pid: 'P571',
    text: (l, d) => `${l} became an independent country on ${d}.`,
  },
  launched: { pid: 'P619', text: (l, d) => `${l} was launched on ${d}.` },
  opened: { pid: 'P1619', text: (l, d) => `${l} was officially opened on ${d}.` },
  published: { pid: 'P577', text: (l, d) => `${l} was first published on ${d}.` },
  discovered: { pid: 'P575', text: (l, d) => `${l} was discovered on ${d}.` },
};

/** One reviewed Wikidata item the pipeline turns into an event. */
export interface TimelineItem {
  qid: string;
  subject: TimelineSubject;
  kind: EventKind;
  /** Article to link, such as "physics/battery". Countries are linked automatically. */
  link?: string;
  /** Short name to use when the Wikidata label is long or unclear. */
  label?: string;
  /**
   * The day the curator expects Wikidata to give (YYYY-MM-DD). When
   * Wikidata says another day the event is dropped and reported, so a
   * wrong date can only enter when two sources agree on it.
   */
  expect?: string;
  /** A continent to use when Wikidata names none (for example Antarctica). */
  continent?: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** True for a real calendar date written YYYY-MM-DD with a CE year. */
export function isIsoDay(value: string): boolean {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(value);
  if (!m) {
    return false;
  }
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }
  const lengths = [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= (lengths[month - 1] ?? 0);
}

/** "1867-11-07" as "7 November 1867". Years are written without padding. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso);
  if (!m) {
    throw new Error(`Not a full ISO date: ${iso}`);
  }
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? '?'} ${Number(m[1])}`;
}

/** The fixed sentence for a kind, label and ISO date. */
export function sentence(kind: EventKind, label: string, iso: string): string {
  return KINDS[kind].text(label, formatDate(iso));
}

/**
 * The one day-precision CE date an item has for a property, or
 * undefined when it has none, only coarser ones, or two different
 * day dates (we will not guess between them). Deprecated statements
 * are ignored, and a preferred statement outranks normal ones.
 */
export function dayDate(entity: Entity, pid: string): string | undefined {
  const days = new Set<string>();
  for (const s of currentStatements(entity, pid)) {
    const dv = s.mainsnak.datavalue;
    if (dv?.type !== 'time') {
      continue;
    }
    const { time, precision } = dv.value as { time: string; precision: number };
    if (precision < 11 || !time.startsWith('+')) {
      continue;
    }
    const iso = formatWikidataTime(time, precision);
    if (iso && isIsoDay(iso)) {
      days.add(iso);
    }
  }
  return days.size === 1 ? [...days][0] : undefined;
}

/** Why an item did not become an event. */
export interface Dropped {
  qid: string;
  reason: string;
}

/**
 * Builds events from items and fetched entities. Items with no usable
 * date, no English label or a repeated id are dropped and reported.
 * The result is sorted by date, then id.
 */
export function buildEvents(
  items: readonly TimelineItem[],
  entities: ReadonlyMap<string, Entity>,
  retrieved: string,
  linkFor: (item: TimelineItem) => string | undefined = (i) => i.link,
  continentFor: (item: TimelineItem, entity: Entity) => string | undefined = (i) => i.continent,
): { events: TimelineEvent[]; dropped: Dropped[] } {
  const events: TimelineEvent[] = [];
  const dropped: Dropped[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.qid)) {
      dropped.push({ qid: item.qid, reason: 'listed twice' });
      continue;
    }
    seen.add(item.qid);
    const entity = entities.get(item.qid);
    if (!entity) {
      dropped.push({ qid: item.qid, reason: 'not found on Wikidata' });
      continue;
    }
    const label = item.label ?? entity.labels?.en?.value;
    if (!label) {
      dropped.push({ qid: item.qid, reason: 'no English label' });
      continue;
    }
    const date = dayDate(entity, KINDS[item.kind].pid);
    if (!date) {
      dropped.push({
        qid: item.qid,
        reason: `no single day-precision ${KINDS[item.kind].pid} date`,
      });
      continue;
    }
    if (item.expect !== undefined && item.expect !== date) {
      dropped.push({
        qid: item.qid,
        reason: `Wikidata says ${date}, expected ${item.expect}`,
      });
      continue;
    }
    const link = linkFor(item);
    const continent = item.continent ?? continentFor(item, entity);
    events.push({
      id: item.qid,
      date,
      label,
      text: sentence(item.kind, label, date),
      subject: item.subject,
      ...(continent ? { continent } : {}),
      ...(link ? { link } : {}),
      source: wikidataSource(retrieved, item.qid, label),
    });
  }
  events.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return { events, dropped };
}

/** The subjects the screen filters by, in display order. */
export const SUBJECT_IDS: readonly TimelineSubject[] = SUBJECTS.map((x) => x.id);

/** Fewest events the whole pack must hold (18-world-timeline Req 1). */
export const MIN_EVENTS = 400;
/** Fewest events each subject must have (Req 2). */
export const MIN_PER_SUBJECT = 15;
/** Fewest events each inhabited continent, and Antarctica, must have (Req 3). */
export const MIN_PER_CONTINENT = 20;
export const MIN_ANTARCTICA = 3;
/** Fewest distinct month-and-day pairs the pack must cover (Req 7). */
export const MIN_MONTH_DAYS = 200;

/**
 * Checks a timeline pack against the spec and returns the problems.
 * `articleExists` lets the caller confirm each link points at a bundled
 * article.
 */
export function validateTimeline(
  pack: TimelinePack,
  articleExists: (link: string) => boolean = () => true,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  let previous = '';
  for (const e of pack.events) {
    const where = `timeline ${e.id}`;
    if (ids.has(e.id)) {
      errors.push(`${where}: listed twice`);
    }
    ids.add(e.id);
    if (!isIsoDay(e.date)) {
      errors.push(`${where}: date "${e.date}" is not a full CE date`);
      continue;
    }
    if (e.date < previous) {
      errors.push(`${where}: not sorted by date`);
    }
    previous = e.date;
    if (e.continent && !(EVENT_CONTINENTS as readonly string[]).includes(e.continent)) {
      errors.push(`${where}: unknown continent "${e.continent}"`);
    }
    if (!SUBJECT_IDS.includes(e.subject)) {
      errors.push(`${where}: unknown subject "${e.subject}"`);
    }
    if (!e.label || !e.text.includes(e.label) || !e.text.includes(formatDate(e.date))) {
      errors.push(`${where}: text does not carry its label and date`);
    }
    if (e.source.licence !== 'CC0' || !e.source.url.includes(e.id)) {
      errors.push(`${where}: source must be this item's CC0 Wikidata page`);
    }
    if (e.link && !articleExists(e.link)) {
      errors.push(`${where}: link ${e.link} has no bundled article`);
    }
  }
  if (pack.events.length < MIN_EVENTS) {
    errors.push(`timeline: ${pack.events.length} events, needs ${MIN_EVENTS}`);
  }
  for (const subject of SUBJECT_IDS) {
    const n = pack.events.filter((e) => e.subject === subject).length;
    if (n < MIN_PER_SUBJECT) {
      errors.push(`timeline: ${subject} has ${n} events, needs ${MIN_PER_SUBJECT}`);
    }
  }
  for (const continent of EVENT_CONTINENTS) {
    const n = pack.events.filter((e) => e.continent === continent).length;
    const need = continent === 'Antarctica' ? MIN_ANTARCTICA : MIN_PER_CONTINENT;
    if (n < need) {
      errors.push(`timeline: ${continent} has ${n} events, needs ${need}`);
    }
  }
  const monthDays = new Set(pack.events.map((e) => e.date.slice(5)));
  if (monthDays.size < MIN_MONTH_DAYS) {
    errors.push(
      `timeline: ${monthDays.size} distinct month-days, needs ${MIN_MONTH_DAYS}`,
    );
  }
  return errors;
}

/** Properties whose value is a country. */
const COUNTRY_PIDS = ['P17', 'P27', 'P495', 'P1532'] as const;
/** Properties whose value is a place that has a country (P17) of its own. */
const PLACE_PIDS = ['P19', 'P159', 'P131', 'P276'] as const;

/** The country and place items an entity points at (to fetch before `continentFrom`). */
export function referencedPlaces(entity: Entity): string[] {
  return [...COUNTRY_PIDS, ...PLACE_PIDS].flatMap((pid) => itemIds(currentStatements(entity, pid)));
}

/**
 * The continent of an entity, only when Wikidata names a country (or a
 * place in a country) that sits on one: it never guesses. The item itself
 * counts when it is a country.
 */
export function continentFrom(
  entity: Entity,
  byCountry: ReadonlyMap<string, string>,
  places: ReadonlyMap<string, Entity>,
): string | undefined {
  const own = byCountry.get(entity.id);
  if (own) {
    return own;
  }
  for (const pid of COUNTRY_PIDS) {
    for (const id of itemIds(currentStatements(entity, pid))) {
      const found = byCountry.get(id);
      if (found) {
        return found;
      }
    }
  }
  for (const pid of PLACE_PIDS) {
    for (const id of itemIds(currentStatements(entity, pid))) {
      const place = places.get(id);
      for (const countryId of place ? itemIds(currentStatements(place, 'P17')) : []) {
        const found = byCountry.get(countryId);
        if (found) {
          return found;
        }
      }
    }
  }
  return undefined;
}
