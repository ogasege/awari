/**
 * The two quizzes the certificate offers next (28-every-screen-like-home, owner feedback 18 Nov): for a country, its
 * land neighbours first, then other countries on the same continent; for any other article, the next ones in the
 * same pack. Never the quiz just played, never an unrelated subject. Pure, so it is tested without a screen.
 */
import { normaliseContinent } from '../../lib/packs/subjects.ts';
import type { CountryFacts, PackIndexItem } from '../../lib/packs/types.ts';

export function relatedQuizzes(
  items: readonly PackIndexItem[],
  id: string,
  facts: readonly CountryFacts[] = [],
  count = 2,
): PackIndexItem[] {
  const at = items.findIndex((i) => i.id === id);
  if (at < 0) return [];
  const me = items[at] as PackIndexItem;
  // Walk the pack in order from the quiz just played, so each article gets its own neighbours in the list.
  const ring = [...items.slice(at + 1), ...items.slice(0, at)];
  const continent = me.continent ? normaliseContinent(me.continent) : undefined;
  if (!continent) return ring.slice(0, count);
  const neighbours = new Set(facts.find((f) => f.id === id)?.neighbours ?? []);
  const sameContinent = ring.filter((i) => i.continent && normaliseContinent(i.continent) === continent);
  const first = sameContinent.filter((i) => neighbours.has(i.id));
  const rest = sameContinent.filter((i) => !neighbours.has(i.id));
  return [...first, ...rest].slice(0, count);
}
