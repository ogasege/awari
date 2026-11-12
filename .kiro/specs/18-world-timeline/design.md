# Design: World timeline

- `TimelineSubject` becomes the subject ids; old `history` events map to
  `ancient` or `inventions`, old `science` to `science`, `physics`,
  `space` or `body`.
- `TimelineEvent.continent?` is set by `continentOf` in the pipeline from
  Wikidata (place of birth P19, country P17, origin P495, headquarters
  P159, continent P30) through the countries' continents, with an
  explicit `continent` override for items such as the Antarctic stations.
- Sources of items: (a) topics marked `event` in the subject lists (the
  event links to its article), (b) countries with an `expect`ed
  independence day, (c) curated extras resolved from names to ids by a
  helper script (cached, serial).
- New kinds: `published` (P577), `discovered` (P575), `completed`.
- `filter.ts` gains `filterEvents(events, {subject, continent})`.
- Validation thresholds live in `timeline.ts`.

## Correctness properties

1. Filtering by subject and continent returns exactly the events with
   both (extends 07 P1-P2); All/any returns everything in order.
2. A curated item whose expected date differs from Wikidata yields no
   event (the pipeline reports it).
3. The committed pack meets every threshold (events, subjects,
   continents, month-days) and every link resolves.
4. Continent assignment never invents: only events whose Wikidata chain
   or override names a continent carry one.
