# Design: Quizzes with a hint ladder

Screen design: `design/screens/README.md` (Quiz).

## Build time

```
scripts/quizzes/build.ts     reads public/packs, writes packs/quizzes
src/lib/quiz/generate.ts     buildQuiz(article, facts, allFacts) (pure)
src/lib/quiz/sentences.ts    sentence splitting (pure)
src/lib/quiz/validate.ts     shared validator (spec 10)
```

`buildQuiz` collects candidate questions from two sources and keeps the
first five that pass the validator, preferring variety:

1. **Fact questions** (countries): capital, a neighbour, an official
   language, currency. The answer comes from Wikidata; the proof sentence
   is the first article sentence that contains the answer. Distractors
   are values of the same kind from other countries on the same continent
   that do not appear in the proof sentence.
2. **Gap-fill questions** (all articles): a sentence from the article
   with one key term blanked out. Key terms are numbers (years, sizes),
   capitalised names that appear in the facts pack, or physics glossary
   terms. Distractors are terms of the same kind from the same pack.

A seeded PRNG (`seedFrom(articleId)`) shuffles options and picks the two
wrong options hint 3 removes, so builds are deterministic.

Hints:
- *Nudge*: kind-specific clue without the answer, e.g. "It starts with
  the letter A and has 5 letters." or "It is a year in the 1960s."
- *Where to look*: "Look in the “History” part of the article." (or "the
  opening paragraphs").
- *Remove two*: two wrong option indexes.

## Run time

```
src/features/quiz/quizMachine.ts  pure state machine (reducer)
src/features/quiz/QuizScreen.tsx  loads /packs/quizzes/<pack>/<id>.json
src/features/quiz/QuizzesScreen.tsx list of every quiz by pack
```

State per question: `selected`, `hintsUsed (0..3)`, `tries`, `status`
(`asking` | `right` | `wrong` | `revealed`). Actions: `select`, `check`,
`hint`, `next`. The reducer is pure and property-tested.

## Correctness properties

1. *Every bundled question is valid*: for every quiz file and question,
   `validateQuestion(q, article)` is ok. (Req 1.2)
2. *Five per quiz, all different*: each quiz has five questions with
   distinct prompts and distinct answers. (Req 1.1, 1.5)
3. *Determinism*: `buildQuiz` returns identical output for identical
   input. (Req 1.3)
4. *Ladder order*: for any action sequence, hints are revealed strictly
   in order and never more than three. (Req 2.1)
5. *Remove-two safety*: after hint 3 the visible options are exactly the
   correct one plus one wrong one. (Req 2.3)
6. *Hints never leak*: nudge and where-to-look never contain the answer.
   (Req 2.2)
7. *Score bounds*: the final score is between 0 and 5 and equals the
   number of questions answered right on a first or second try without
   the answer being revealed. (Req 3.5)
8. *Generated options are fair*: for any synthetic article and facts,
   every question `buildQuiz` emits passes the validator. (Req 1.2)
