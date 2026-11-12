/**
 * Turns the list of discovered countries into postage stamps, grouped by
 * continent, and counts how many of the world's countries the student
 * has collected (16-world-stamp-book).
 */
import { packUrl } from '../../lib/packs/load.ts';
import { CONTINENTS, normaliseContinent, type Continent } from '../../lib/packs/subjects.ts';
import type { PackIndexItem } from '../../lib/packs/types.ts';

export interface StampView {
  id: string;
  name: string;
  caption: string;
  src: string;
  alt: string;
  /** The continent page this stamp belongs on. */
  continent: Continent | undefined;
}

/** Design-kit photos used for a few stamps, matching the Home reference. */
const KIT_STAMPS: Record<string, { src: string; caption: string; alt: string }> = {
  nigeria: { src: '/photos/zuma.jpg', caption: 'Zuma Rock', alt: 'Zuma Rock beside a road near Abuja' },
  egypt: { src: '/photos/pyramids.jpg', caption: 'the pyramids', alt: 'The pyramids of Giza' },
  tanzania: { src: '/photos/kili.jpg', caption: 'Kilimanjaro', alt: 'Kilimanjaro above the clouds' },
  ethiopia: { src: '/photos/castle.jpg', caption: 'Gondar castle', alt: 'A stone castle tower in Gondar' },
  zambia: { src: '/photos/falls.jpg', caption: 'Victoria Falls', alt: 'Victoria Falls from the air' },
};

/**
 * Builds stamps in discovery order. Unknown slugs (not in the index) are
 * skipped and duplicates count once.
 */
export function stampsFor(discovered: readonly string[], items: readonly PackIndexItem[]): StampView[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const seen = new Set<string>();
  const stamps: StampView[] = [];
  for (const id of discovered) {
    const item = byId.get(id);
    if (!item || seen.has(id)) {
      continue;
    }
    seen.add(id);
    const kit = KIT_STAMPS[id];
    const continent = normaliseContinent(item.continent);
    stamps.push({
      id,
      name: item.title,
      caption: kit?.caption ?? continent ?? '',
      src: kit?.src ?? (item.thumb ? packUrl(item.thumb) : '/logo/awari-icon.svg'),
      alt: kit?.alt ?? `A picture from ${item.title}`,
      continent,
    });
  }
  return stamps;
}

export interface ContinentCount {
  continent: Continent;
  count: number;
  total: number;
}

export interface WorldBook {
  stamps: StampView[];
  /** Countries collected, out of `total`. */
  count: number;
  /** Every country in the index that sits on a continent. */
  total: number;
  perContinent: ContinentCount[];
}

/** The whole collection: stamps, the world count and each continent's count. */
export function worldBook(discovered: readonly string[], items: readonly PackIndexItem[]): WorldBook {
  const stamps = stampsFor(discovered, items);
  const totals = new Map<Continent, number>();
  for (const i of items) {
    const c = normaliseContinent(i.continent);
    if (c) totals.set(c, (totals.get(c) ?? 0) + 1);
  }
  const perContinent = CONTINENTS.map((continent) => ({
    continent,
    count: stamps.filter((s) => s.continent === continent).length,
    total: totals.get(continent) ?? 0,
  }));
  return {
    stamps,
    count: perContinent.reduce((n, c) => n + c.count, 0),
    total: perContinent.reduce((n, c) => n + c.total, 0),
    perContinent,
  };
}

export interface Slot {
  id: string;
  name: string;
  /** The stamp when the student has found this country. */
  stamp?: StampView;
}

/** One slot for each country of a continent, sorted by name. */
export function slotsFor(continent: Continent, stamps: readonly StampView[], items: readonly PackIndexItem[]): Slot[] {
  const found = new Map(stamps.map((s) => [s.id, s]));
  return items
    .filter((i) => normaliseContinent(i.continent) === continent)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((i) => ({ id: i.id, name: i.title, stamp: found.get(i.id) }));
}
