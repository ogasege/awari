# Fix batch 1: report (spec 26-final-review, task 7)

Hand-off: `.kiro/specs/26-final-review/fix-batch-1.md`. Source findings: `docs/final-review/design-review.md` (independent run `e44858cc`).

## How it was run

- **Conductor `7e52b9eb`** (`kirocrew-conductor`) read the hand-off and started three `awari-builder` runs, one per package,
  then ended its turn (as the conductor does after delegating). It did **not** write the consolidated report it was asked for,
  so this report was written by the parent session from the commits and from checks the parent ran itself.
- **`awari-builder` runs:** package A `7186432e` (quizzes), package B `bc314cac` (article leads), package C `23821fde`
  (picture captions and leads). Each ended with one commit, below.
- Parent checks after all three: `npx tsc -b --noEmit` clean, `npx eslint . --max-warnings 0` clean, `npx vitest run`
  619 tests passed, `npm run licences` 4,021 of 4,021 images verified with 0 problems, `npm run submission-check` passed,
  `npm run offline-check` 20 steps passed, `npm run desktop-check` 9 steps passed.

## Package A: quizzes (D-1, D-5 to D-8), commit `0248d92`

| Measure over all 479 quiz files (2,360 questions) | Before (design review, 381-question sample, or the builder's own count) | After (`npx tsx scripts/quizzes/audit.ts`) |
|---|---|---|
| First hint names the answer on its own | 366 of 381 sampled; 2,254 in the full set | **0** |
| Hints that count letters | 376 of 381 | **0** |
| Answer leaks through capitalisation | 87 of the sample; 356 in the full set | **0** |
| Distractor as good as or better than the answer | 68 of the sample | **0** |
| Implausible distractors (a language list for a sign language, a pair of capitals offered as a country) | examples in D-7; 565 place distractors outside the answer's region | **0** |
| "Where to look" points at the wrong part | 1 found by the review | **0** |
| Proof sentence is just the question with the gap filled | 360 of 381; 1,814 cloze questions in the full set | **1,494 of 2,360 still are** (320 now use a second sentence from the article) |

New files: `src/lib/quiz/hints.ts` (+ property test), `scripts/quizzes/audit.ts`, `options.property.test.ts`. **Not fixed:** most proofs
still repeat the question with the gap filled, because the article often states a fact once. And 95% of questions are still
one fill-the-gap shape (D-4): that needs new question types, which is a feature, not a fix.

## Package B: article leads (D-17 to D-22), commit `0522aa4`

`src/lib/text/leads.ts` repairs a lead by removal only (empty brackets, transcriptions, native scripts, hatnotes,
disambiguation stubs, a paragraph cut mid-sentence, citation markers, and a 45-word budget). 146 pack files rewritten.
Counts over the 483 leads, builder's measure and re-run by `scripts/packs/leads-quality.test.ts` (which is part of the
619 passing tests): bracket artifacts 30 to 0, non-Latin openings 41 to 0, IPA 23 to 0, over 45 words 27 to 0, no full stop
8 to 0, cut mid-sentence 2 to 0, hatnotes 2 to 0, disambiguation stubs 2 to 0, citation markers 1 to 0. Two leads (Basketball,
Indonesia) have hand-written repairs built from the article's own words (`scripts/packs/lead-text-overrides.ts`).

## Package C: picture captions and lead pictures (D-2, D-3, D-12 to D-16, D-26 and others), commit `04d7679`

New caption bar (no ellipsis, no uploader first person, no processing notes, no date-only captions), twelve pinned lead
pictures (`scripts/media/leads.ts`), wrong pictures dropped, `scripts/media/captions-override.json` extended. The library went
from 3,720 to **3,525** pictures. Measured by the parent on the committed `public/media/*.json`:

| | Before (design review of 3,720) | After |
|---|---|---|
| Captions cut with an ellipsis | 431 | **0** |
| Under three words | 29 | **5** |
| Processing notes | 4 | **0** |
| Self-referring ("this photo") | 17 | **1** |
| Uploader first person | 32 | **3 clear cases remain** ("And I still need to make dinner", "The help and comfort I received while being in an Orphanage", "I stacked the photos before changing the light curves hoping") |

Lead pictures now: movie theatre "Interior of Cinema 9, Hoyts movie theater" (was nachos and beer, D-2), carbon "Diamond and
graphite shown side by side" (was a smoker's lung, D-3), brain, digestion, frog, steamboat re-chosen. `npm run licences`
verified 4,021 of 4,021 images against the live Commons API with 0 problems after the rebuild.

**Not fixed:** the three first-person captions above; articles that fell below four pictures are listed in `KNOWN_GAPS`
(the count is in `docs/generated/stats.json`); the picture selection is still automatic.

## Not done in batch 1, and why

- D-4, D-8 (quiz question shapes and proof sentences): new question types are a feature.
- D-25 (the margin note on Space points at the Sun photo): a placement rule across the collage; left as a known minor issue.
- D-29, D-30, D-32, D-33, D-35 to D-39, D-41 to D-43: minor or polish; D-30 (Not found doodle) and D-31 were done by the parent.
