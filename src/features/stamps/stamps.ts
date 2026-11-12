/**
 * Turns the list of discovered countries into postage stamps, and counts
 * how many of Africa's 54 countries the student has collected.
 */
import { packUrl } from '../../lib/packs/load.ts';
import type { PackIndexItem } from '../../lib/packs/types.ts';

/** Africa has 54 countries recognised by the United Nations. */
export const AFRICA_TOTAL = 54;

export interface StampView {
  id: string;
  name: string;
  caption: string;
  src: string;
  alt: string;
  africa: boolean;
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
 * skipped, duplicates count once, and only African countries count
 * towards the 54.
 */
export function stampsFor(
  discovered: readonly string[],
  items: readonly PackIndexItem[],
): { stamps: StampView[]; africaCount: number; africaTotal: number } {
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
    stamps.push({
      id,
      name: item.title,
      caption: kit?.caption ?? item.continent ?? '',
      src: kit?.src ?? (item.thumb ? packUrl(item.thumb) : '/logo/awari-icon.svg'),
      alt: kit?.alt ?? `A picture from ${item.title}`,
      africa: item.continent === 'Africa',
    });
  }
  const africaCount = Math.min(AFRICA_TOTAL, stamps.filter((s) => s.africa).length);
  return { stamps, africaCount, africaTotal: AFRICA_TOTAL };
}

export interface AfricaSlot {
  id: string;
  name: string;
  /** The stamp when the student has found this country. */
  stamp?: StampView;
}

/**
 * One slot for each African country in the index, sorted by name, filled
 * with its stamp when found (08-stamp-book Req 3.1).
 */
export function africaSlots(
  stamps: readonly StampView[],
  items: readonly PackIndexItem[],
): AfricaSlot[] {
  const found = new Map(stamps.map((s) => [s.id, s]));
  return items
    .filter((i) => i.continent === 'Africa')
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((i) => ({ id: i.id, name: i.title, stamp: found.get(i.id) }));
}
