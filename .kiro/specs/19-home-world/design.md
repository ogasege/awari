# Design: Home world

- Pipeline writes `packs/home.json`: per subject up to eight featured
  `{ pack, id, title, photo }` and a pool of notes `{ kind, text, to,
  article?, proof? }` from `deriveNotes`, validated (proof in article).
- `rotation.ts` (pure): `pickSubjects(day, n)`, `pickFeatured`,
  `pickNotes`, `nextCountry` using `dayNumber`.
- Home loads `home.json` on demand; until it arrives the layout shows the
  kit photos (so first paint is unchanged and offline-safe).
- `onThisDay` gains the "coming up" fill (`upcoming`).

## Correctness properties

1. Same day, same picks; picks use only subjects/articles in the data.
2. Five prints are from five distinct subjects.
3. Coverage: every subject appears within any eleven consecutive days.
4. Every fact note's proof sentence is in its article (pack test).
5. `nextCountry` never returns a discovered country when one is left.
6. On this day returns at most three, today's first, in calendar order.
