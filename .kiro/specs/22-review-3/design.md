# Design: Review 3

## On this day (Req 1-3)
`scripts/packs/timeline-days.ts` lists, for every month-day, Wikidata people and events whose date
is that day; `build.ts` merges at least two per day into `timeline.json` after the same
cross-check used for the rest (Wikidata date against the label's own statements). A coverage
report prints the days still short. Home's `onThisDayOrNext` keeps events of today first and may
add "coming up" cards only in slot three.

## Stamp sheets (Req 5-7)
One component, `src/design/StampSheets.tsx`, takes the world book (`perContinent` with the found
stamps) and draws one perforated sheet per continent: found stamps with their photo, blank slots
for the rest, count in handwriting. The stamp book and the Atlas both render it. A 3x2 grid.

## Subjects (Req 4)
`SubjectList` renders `SUBJECT_COVERS` as `Print` components with a hand label; the intro count
comes from `SUBJECTS.length`, never from typed text.

## Home (Req 8-10)
The castle panel uses a door or castle photograph per wing; a pure `uniquePhotos(shown)` check
backs a test over many days. Hero note arrows start at the end of the text block.

## Article, search (Req 11-13)
`facts` shows one population figure with year and source; the article's first paragraph keeps the
Wikipedia sentence but the page labels it "from Wikipedia". `dropEmptySections` runs in the build
and in a test. `snippetFor` cuts at a boundary, adds an ellipsis and strips `\d+°[EW]`-style coordinates.

## Timeline (Req 14-16)
`kindOf(event)` returns birth, founded, country or discovery; the card class follows the kind and a
legend sits above the list. Births are capped under 40% of a default century.

## Properties
1. Every month-day of 2024 has at least two events in `timeline.json`.
2. `onThisDayOrNext` returns today's events first and never a coming-up card in slots one or two
   while two of today's exist.
3. No two photographs on Home are equal across 400 days.
4. `snippetFor` output never starts mid-word, never contains a coordinate string, and ends with
   a sentence end or an ellipsis.
5. `kindOf` is total: every event has exactly one kind.
6. No committed article has a heading with no paragraphs below it.
