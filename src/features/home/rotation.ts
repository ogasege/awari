/**
 * Daily rotation for Home (19-home-world): which subjects the prints show,
 * which articles and notes are featured, and which country the stamp book
 * suggests. Everything is a pure function of the day number and the data,
 * so a day's picks are the same all day and need no network.
 */
import type { HomeData, HomeFeatured, HomeNoteData } from '../../lib/packs/home.ts';
import { CONTINENTS, normaliseContinent, type BundledPackId, type Continent } from '../../lib/packs/subjects.ts';
import type { PackIndexItem } from '../../lib/packs/types.ts';

/**
 * `count` different items for a day: a window of the list that moves on
 * by `count` each day, so any run of ceil(length / count) consecutive
 * days shows every item.
 */
export function pickSubjects<T>(day: number, items: readonly T[], count: number): T[] {
  const n = items.length;
  if (n === 0) {
    return [];
  }
  const take = Math.min(count, n);
  const start = (((day * take) % n) + n) % n;
  return Array.from({ length: take }, (_, k) => items[(start + k) % n] as T);
}

/** The featured article for a subject on a day. */
export function pickFeatured(day: number, slot: number, featured: readonly HomeFeatured[]): HomeFeatured | undefined {
  if (featured.length === 0) {
    return undefined;
  }
  const i = (((day * 7 + slot * 3) % featured.length) + featured.length) % featured.length;
  return featured[i];
}

/**
 * `count` notes for a day, alternating facts and questions, each from a
 * different subject where the pool allows. A fact is only ever picked
 * together with its proof (the pipeline guarantees the proof is in the
 * article).
 */
export function pickNotes(day: number, pool: readonly HomeNoteData[], count: number): HomeNoteData[] {
  const chosen: HomeNoteData[] = [];
  const subjects = [...new Set(pool.map((n) => n.subject))];
  if (subjects.length === 0) {
    return chosen;
  }
  for (let k = 0; k < count && chosen.length < pool.length; k += 1) {
    const wanted: HomeNoteData['kind'] = k % 2 === 0 ? 'fact' : 'question';
    const subject = subjects[(((day + k * 3) % subjects.length) + subjects.length) % subjects.length];
    const fits = (n: HomeNoteData, kind: boolean, bySubject: boolean): boolean =>
      !chosen.includes(n) && (!kind || n.kind === wanted) && (!bySubject || n.subject === subject);
    const tries: Array<[boolean, boolean]> = [
      [true, true],
      [false, true],
      [true, false],
      [false, false],
    ];
    for (const [kind, bySubject] of tries) {
      const options = pool.filter((n) => fits(n, kind, bySubject));
      if (options.length > 0) {
        chosen.push(options[(((day * 5 + k) % options.length) + options.length) % options.length] as HomeNoteData);
        break;
      }
    }
  }
  return chosen;
}

/** Subjects that have at least one featured article, in the data's order. */
export function subjectsWithPrints(data: HomeData): BundledPackId[] {
  return data.subjects.filter((s) => s.featured.length > 0).map((s) => s.id);
}

/**
 * A country to suggest next: one the student has not found, on the
 * continent where they have found the fewest (the day breaks ties and
 * picks among the countries there). Undefined when every country is found.
 */
export function nextCountry(
  day: number,
  discovered: readonly string[],
  items: readonly PackIndexItem[],
): PackIndexItem | undefined {
  const found = new Set(discovered);
  const left = items.filter((i) => !found.has(i.id) && normaliseContinent(i.continent));
  if (left.length === 0) {
    return undefined;
  }
  const count = (c: Continent): number => items.filter((i) => found.has(i.id) && normaliseContinent(i.continent) === c).length;
  const open = CONTINENTS.filter((c) => left.some((i) => normaliseContinent(i.continent) === c));
  const fewest = Math.min(...open.map(count));
  const ties = open.filter((c) => count(c) === fewest);
  const continent = ties[((day % ties.length) + ties.length) % ties.length] as Continent;
  const here = left.filter((i) => normaliseContinent(i.continent) === continent).sort((a, b) => a.id.localeCompare(b.id));
  return here[(((day * 13) % here.length) + here.length) % here.length];
}
