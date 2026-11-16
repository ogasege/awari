# Design: 27-quiz-variety

## Data model
The existing question record (`src/lib/quiz/validate.ts`) is `{ id, articleId, pack, prompt, options, answer,
hints: { nudge, whereToLook, removed }, proof, proofSection }`. This spec adds two optional fields and keeps every
existing question valid without them:

- `kind`: `'cloze' | 'capital' | 'capital-reverse' | 'continent' | 'currency' | 'neighbour' | 'flag' | 'picture' |
  'first' | 'truefalse' | 'largest'`. A missing `kind` means `'cloze'`, so old files load unchanged.
- `media`: `{ pictureId: string }` for flag and picture questions (an id in `public/media/*.json`), or
  `{ events: Array<{ text: string; year: number }> }` for "which came first". Options of flag questions are
  country names; the picture is the question.

`validate.ts` accepts the new fields and rejects an unknown `kind`, a `media` that points to a picture that is not in
the library, and a true/false question whose options are not exactly `['True', 'False']`.

## Generators (`scripts/quizzes/shapes/*.ts`)
One module per shape, each `(facts, rng) => Question[]` and pure:

| Shape | Facts used | Drop when |
| --- | --- | --- |
| capital, capital-reverse | `countries.capital`, `continent` | capital missing; two countries share the capital name |
| continent | `continent` | transcontinental list (`TRANSCONTINENTAL`) |
| currency | `currency` | currency shared with a distractor; currency is a generic word |
| neighbour | `neighbours` (land only) | no neighbour; island state; fewer than 3 non-neighbours in the pool |
| flag | flag file in the picture library, `name` | no verified flag; two flags that look near-identical (same colours, listed pairs) |
| picture | lead picture of an article, `title` | picture fails `dailyRejection`; distractor title contains the answer |
| first | `timeline.json` events with a year | gap under 10 years; BC/AD ambiguity; the text names the other date |
| truefalse | any one fact above | the false version could also be true |
| largest | `areaKm2`, `population` + year | values within 20% of each other |

A shared `distractors(pool, answer, region, n)` picks wrong options from the same region first, never the answer,
never a string containing the answer, never two options that are the same country in two spellings. The random
source is a seeded generator (`mulberry32` on a hash of article id and shape), so a rebuild is stable.

Every generator returns questions that already carry their proof and their three-step hints; the hint text is a
per-shape template filled from the fact, and `hints.property.test.ts` is extended to run over every shape.

## Mixing
`scripts/quizzes/build.ts` assembles each article's quiz of up to ten questions: it takes the shapes that article
can support (an article about a country can have capital, continent, currency, neighbour, flag, largest, truefalse;
a person's article can have first, picture, truefalse from its own facts; a science article keeps cloze and picture),
then picks round-robin across shapes with a per-shape cap of four, so no quiz is a run of one shape. Cloze fills the
rest. The build prints the shape table (Req 4.3).

## Screens
- `QuizScreen` renders by `kind`: `ChoiceQuestion` (text options, the current screen), `PictureQuestion` (image above
  the options, the picture's caption hidden until answered so it cannot give the answer), `TrueFalseQuestion` (two
  44 px buttons side by side), `FirstQuestion` (events as two or three cards, "Which came first?").
- Pictures use the same `Print` component and the placeholder fallback of spec 26 F-001, so a picture that is not on
  the device offline shows the placeholder and the question is skipped for that session (a quiz never shows a
  question whose picture failed).
- The hint ladder component is unchanged; true/false passes `removed: []` and the component hides the third step.

## Accessibility
Flag and picture images carry `alt=""` and the prompt states the task ("Look at the flag and choose the country"),
because the picture is the question; a screen reader user is told the question needs the picture and is offered the
next question ("Skip this one"). This is stated in the About screen under "Known differences".

## Risks
- Flag look-alikes (Chad and Romania, Indonesia and Monaco): a listed-pairs file keeps them out of the same question.
- Dated facts (population, area rank) change; the proof states the year and the fact test re-derives from the pack.
- Fewer questions per article for some packs; Req 4.4 caps the loss at 10% and the build prints where it happens.
- The quiz data is large (2,300 questions); adding shapes grows `public/packs/quizzes` by an estimated 15%, which the
  offline save budget (about 130 MB today) absorbs; the build prints the new size.
