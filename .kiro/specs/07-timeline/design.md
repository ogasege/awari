# Design: Timeline and On this day

## Data

SPARQL over all of Wikidata timed out (HTTP 504) and returned unreviewed
items, so the pipeline uses a curated list instead. `timeline-items.ts`
holds `{ qid, subject, kind, link?, label? }` where `kind` picks the
Wikidata property and the sentence template:

| kind | property | sentence |
| --- | --- | --- |
| `born` | P569 | "X was born on D." |
| `founded` / `established` | P571 | "X was founded / established on D." |
| `independence` | P571 | "X became an independent country on D." |
| `launched` | P619 | "X was launched on D." |
| `opened` | P1619 | "X was officially opened on D." |

Deaths are left out on purpose (ages 9 to 14). `independence` reads P571
(inception) only for countries whose inception is a day-precision date
that is also their independence day; every such item was checked by hand
before listing, and countries whose P571 means something else (Nigeria's
is 1963, the year it became a republic) are simply not listed.
`label` replaces a long or unclear Wikidata label (for example "NASA").
The list is fetched with `getEntities(..., languageFallback)` because
Wikidata now returns some English labels only through the shared `mul`
label (Marie Curie, Carl Linnaeus); responses are cached under
`data/raw/wikidata`, so rebuilds are offline.

## Pure helpers (`scripts/packs/timeline.ts`)

- `dayDate(entity, pid)`: the single distinct day-precision CE date for a
  property, else `undefined` (deprecated statements ignored, a
  preferred statement outranks normal ones).
- `sentence(kind, label, date)`: the template text, e.g. "Marie Curie was
  born on 7 November 1867."
- `buildEvents(items, entities, retrieved)`: events sorted by date then
  id, items without a usable date dropped and reported.
- `validateTimeline(pack)`: shape, sources, subject counts, distinct
  month-days.

## App

- `src/features/timeline/filter.ts`: `filterBySubject`, `yearOf`,
  `rulerMarks` (pure, property-tested).
- `TimelineScreen.tsx`: strip title, filter toggles, On this day band,
  drawn ruler with "you are here", and the ordered list of notes.
- `src/features/home/today.ts` already provides `onThisDay`.

## Correctness properties

1. Filtering by a subject returns only that subject, and All returns
   every event unchanged and in order.
2. Filtering is idempotent and the subject filters partition the events.
3. `sentence` always contains the label and the formatted date.
4. `dayDate` returns nothing when an item has two different day dates.
5. `buildEvents` output is sorted by date and every `date` is a full
   ISO `YYYY-MM-DD`.
6. `rulerMarks` are strictly increasing, inside the event range, and the
   "you are here" position is clamped to the ruler.
