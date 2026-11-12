/**
 * Pure helpers for the date-driven parts of Home: the three "On this day"
 * events and today's quiz.
 */
import type { TimelineEvent } from '../../lib/packs/types.ts';

/** "MM-DD" for a date in the student's local time zone. */
export function monthDay(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d}`;
}

/**
 * Picks up to `count` events that happened on this month and day, spread
 * across subjects where possible, returned oldest first.
 */
export function onThisDay(
  events: readonly TimelineEvent[],
  date: Date,
  count = 3,
): TimelineEvent[] {
  const md = monthDay(date);
  const today = events.filter((e) => e.date.slice(5, 10) === md);
  const bySubject = new Map<string, TimelineEvent[]>();
  for (const e of today) {
    const list = bySubject.get(e.subject) ?? [];
    list.push(e);
    bySubject.set(e.subject, list);
  }
  const picked: TimelineEvent[] = [];
  // Round-robin across subjects, so one subject cannot take every slot.
  const queues = [...bySubject.values()];
  while (picked.length < count && queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && picked.length < count) {
        picked.push(next);
      }
    }
  }
  return picked.sort((a, b) => a.date.localeCompare(b.date));
}

/** Days from `from` ("MM-DD") to `to` ("MM-DD") going forward, wrapping at the year's end (0 = same day). */
export function daysAhead(from: string, to: string): number {
  const day = (md: string): number => {
    const m = Number(md.slice(0, 2));
    const d = Number(md.slice(3, 5));
    // A leap year, so 02-29 has a place; every year is 366 long here.
    return Math.floor(Date.UTC(2024, m - 1, d) / 86_400_000);
  };
  const delta = day(to) - day(from);
  return delta >= 0 ? delta : delta + 366;
}

/**
 * Up to `count` events for Home's calendar: today's first, spread across
 * subjects; when fewer than `count` are filed for today, the next events
 * on the calendar fill the rest ("Coming up"). Today's events come first,
 * then the others in calendar order.
 */
export function onThisDayOrNext(
  events: readonly TimelineEvent[],
  date: Date,
  count = 3,
): { events: TimelineEvent[]; comingUp: boolean } {
  const today = onThisDay(events, date, count);
  if (today.length >= count) {
    return { events: today, comingUp: false };
  }
  const md = monthDay(date);
  const later = events
    .filter((e) => e.date.slice(5, 10) !== md)
    .map((e) => ({ e, ahead: daysAhead(md, e.date.slice(5, 10)) }))
    .sort((a, b) => a.ahead - b.ahead || a.e.date.localeCompare(b.e.date) || a.e.id.localeCompare(b.e.id));
  const fill = later.slice(0, count - today.length).map((x) => x.e);
  return { events: [...today, ...fill], comingUp: fill.length > 0 };
}

export interface DailyQuiz {
  pack: 'countries' | 'physics';
  id: string;
  topic: string;
  blurb: string;
  photo: string;
  alt: string;
}

/** The quizzes Home rotates through, one per day. */
export const DAILY_QUIZZES: readonly DailyQuiz[] = [
  {
    pack: 'physics',
    id: 'electricity',
    topic: 'electricity',
    blurb: 'Five questions on sparks, circuits and lightning.',
    photo: '/photos/lightning.jpg',
    alt: 'Lightning striking at night',
  },
  {
    pack: 'countries',
    id: 'nigeria',
    topic: 'Nigeria',
    blurb: 'Five questions on rivers, cities and Zuma Rock.',
    photo: '/photos/lokoja.jpg',
    alt: 'The River Niger seen from Mount Patti at Lokoja',
  },
  {
    pack: 'countries',
    id: 'egypt',
    topic: 'Egypt',
    blurb: 'Five questions on the Nile, the desert and the pyramids.',
    photo: '/photos/pyramids.jpg',
    alt: 'The pyramids of Giza',
  },
  {
    pack: 'countries',
    id: 'tanzania',
    topic: 'Tanzania',
    blurb: 'Five questions on mountains, lakes and islands.',
    photo: '/photos/kili.jpg',
    alt: 'Kilimanjaro rising above the clouds',
  },
];

/** Whole days since 1970-01-01 in local time. */
export function dayNumber(date: Date): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local / 86_400_000);
}

/** Today's quiz: the same all day, and each quiz comes round in turn. */
export function todaysQuiz(date: Date): DailyQuiz {
  const n = DAILY_QUIZZES.length;
  return DAILY_QUIZZES[((dayNumber(date) % n) + n) % n] as DailyQuiz;
}
