# Design: Timeline and On this day

## Data

SPARQL over all of Wikidata timed out (HTTP 504) and returned unreviewed
items, so the pipeline uses a curated list instead. `timeline-items.ts`
holds `{ qid, subject, kind, link? }` where `kind` is `born`, `died`,
`founded`, `event` (P585) or `launched` (P619), which picks the property
and the sentence template. The list is fetched with `getEntities`
(cached under `data/raw/wikidata`), so rebuilds are offline.

## Pure helpers (`scripts/packs/timeline.ts`)

- `dayDate(entity, pid)`: the single distinct day-precision date for a
  property, else `undefined`.
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
