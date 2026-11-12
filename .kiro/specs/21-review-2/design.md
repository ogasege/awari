# Design: Review 2

## Tour globe (Req 1)

- `tokens.css` gains `--globe-sea`, `--globe-land`, `--globe-land-lit` and
  `--globe-grid`; `atlas.css` uses `var(…)` for `.globe__ocean` and
  `.globe__land` instead of raw hex.
- A test reads `src/design/atlas.css` and `src/design/tokens.css` as text
  and asserts the fills are `var(--globe-*)` tokens that `tokens.css`
  defines. A component test renders `<Globe>` from the tour route and
  asserts the ocean and land carry those classes.

## Home hero (Req 2-4)

- `notes.ts` gains `EARTH_NOTES`: three facts about places on the visible
  face of `/photos/earth.jpg` (Africa, Madagascar, Antarctica), each with
  `article` + `proof`, plus `circle: true|false` and the place's position
  on the photograph in percent.
- `Hero` draws the hand-cut circle only for a note with `circle: true`,
  positioned from the note's own `at` coordinates. Notes without a place
  get no arrow.
- The rotating "ever wondered" prompt moves out of the collage into a
  straight line under the hero actions (`home-hero__wonder`), with no
  doodle attached.

## Subject covers (Req 5-8)

- `src/lib/packs/covers.ts`: `SUBJECT_COVERS`, one entry per subject with
  `{ file, alt, caption, author, licence }` naming a photo under
  `public/photos/covers/`. `scripts/prepare-cover-photos.ts` downloads each
  from Commons with the same licence and author checks the pack pipeline
  uses, and appends them to `CREDITS.md`.
- Home's subject prints use `SUBJECT_COVERS[subject]`, so the cover never
  rotates; which five subjects appear still rotates by date.
- `noteForSubject(day, data, subject)` picks a note from the pool whose
  `subject` equals the print beside it. Home passes each print's subject.
- `questionFor(title)` in `src/lib/text/notes.ts` builds the prompt:
  "how X works" for a process noun, "the X" where the title needs an
  article, plain otherwise. The pipeline uses it so the pool is correct.

## On this day (Req 9-11)

- `onThisDayOrNext` returns `{ events, comingUpFrom }` where
  `comingUpFrom` is the index of the first event that is not today's.
- Each coming-up card carries its own label chip ("coming up · 14 Nov")
  inside the card, under the year, so nothing can collide with the drawn
  years. The page-level "Coming up on the calendar:" line is removed.
- The chart doodle is removed; a drawn arrow from the calendar to the
  first card replaces it (it is about the calendar, which it points at).

## Castle panel (Req 12)

- `WINGS` gain `photo` (file, alt) — the continent or subject's own
  photograph. The panel shows the photo of the wing its button opens, and
  the button reads `Enter the ${wing.name} wing` with `wing.name`
  lower-cased to `the Asia wing` form in `castle.ts`.

## Footer credits (Req 13)

- `creditLine(photos)` in `src/features/home/credits.ts` is a pure
  function from the photos Home actually renders (cover files, print
  files, stamp files, castle, quiz) to one sentence, grouping by author
  and licence. Home collects what it rendered and passes it in.

## Atlas (Req 14-15)

- `.atlas` becomes two columns at 1440 (`globe` + a right rail) with the
  globe spanning `minmax(0, 1fr)` and `--globe-max: 46vw`; the picker and
  lead move above it, the facts card to the right rail.
- `ContinentSheet`: one stamp block per continent with the continent name,
  `found of total`, and that continent's countries as perforated stamp
  outlines, filled for each found. Shared with `/stamps`.

## Subjects / stamps / quiz (Req 16)

- Each gains a board with a `StripHeading`, one `Print` (subject cover,
  the newest stamp's photo, the quiz article's lead photo), `Tape`, a
  `MarginNote` tied to what is on the screen, and a `TornEdge` that a card
  crosses. Answers, selects and buttons are untouched.

## Timeline (Req 17-19)

- `century(date)` and `centuriesWith(events)` in `filter.ts`; the screen
  keeps `?century=` in the URL and shows only that century's events.
- `balanceKinds(events, max)` drops births past `floor(max / 2) - 1` while
  other kinds remain, so births are a minority of what is shown.

## Article lead photos (Req 20)

- New entries in `scripts/packs/photo-overrides.ts` for the judges' path
  and the thirty most populous countries where the automatic pick is not a
  recognisable landmark. `scripts/check-leads.ts` lists the current lead of
  every article on that list so the review is repeatable.

## Correctness properties

1. The globe's sea and land fills are design tokens that `tokens.css`
   defines (no raw colour in `.globe__ocean` / `.globe__land`).
2. Every hero note is a fact with a proof sentence present in the article
   it names, and a note with `circle: false` has no circle drawn.
3. Every subject has exactly one cover whose file exists under
   `public/photos/covers/` and is credited in `CREDITS.md`.
4. A note shown beside a print has the same subject as that print, for
   every day and every rotation of subjects.
5. `questionFor` never produces "about Violin?" style text: a title
   needing an article always gets one, a process title becomes "how X
   works".
6. Every event after `comingUpFrom` is not today's month and day, and
   every event before it is.
7. `creditLine` names exactly the photos passed in, no more and no fewer.
8. `centuriesWith` returns each century once, ascending, and every event
   belongs to exactly one of them.
9. `balanceKinds` keeps births below half whenever the century has enough
   non-birth events, and never invents or duplicates an event.
10. Every article on the judges' path and in the thirty most populous
    countries has a lead photo.
