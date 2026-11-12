# Design: World stamp book

- `stamps.ts`: `continentOf(item)` (maps Insular Oceania to Oceania),
  `CONTINENTS`, `worldBook(discovered, items)` -> `{ stamps, count, total,
  perContinent }`, `slotsFor(continent, stamps, items)`.
- `StampsScreen` becomes the overview; `ContinentStamps` is the page for
  `/stamps/:continent` (router gains the route).
- Home and Atlas use `worldBook` for their counts and wording.

## Correctness properties

1. One stamp per known discovered country, in discovery order (kept).
2. The world count equals the stamps and never exceeds 197.
3. Continent counts sum to the world count; each country is in exactly
   one continent.
4. A continent's slots are exactly that continent's countries, and the
   filled ones are exactly its stamps.
5. Discovering more never lowers any count.
