# Requirements: Quizzes with a hint ladder

## Introduction

Every pack article has a five-question quiz built ahead of time from the
article and its Wikidata facts. Each question has a three-step hint
ladder, and after a correct answer the student sees the sentence from the
article that proves it. Quizzes work offline.

## Glossary

- **Hint ladder**: three hints in a fixed order: a nudge, where to look,
  then two wrong answers removed.
- **Proof sentence**: an exact sentence from the article that contains
  the correct answer and none of the wrong ones.
- **Validator**: `validateQuestion` in `src/lib/quiz/validate.ts`, shared
  with the quiz service (spec 10).

## Requirements

### Requirement 1: Question bank

**User story:** As a student, I want five fair questions per article, so
that I can test what I just read.

1. THE quiz builder SHALL produce exactly five questions for every pack
   article that has enough material, and SHALL list any article it skips
   with the reason.
2. Every bundled question SHALL pass the validator against its article:
   four distinct options, one correct answer, a proof sentence that is in
   the article and names the answer and no wrong option.
3. THE quiz builder SHALL be deterministic: the same packs always build
   the same quizzes.
4. THE quiz builder SHALL run as part of `npm run packs`, writing
   `/packs/quizzes/<pack>/<id>.json` with the article's source and
   licence.
5. Questions within one quiz SHALL have distinct prompts and distinct
   correct answers.

### Requirement 2: Hint ladder

**User story:** As a student, I want help that teaches rather than tells,
so that I can find the answer myself.

1. Each question SHALL offer three hints, revealed one at a time and only
   in order: nudge, where to look, two wrong answers removed.
2. THE nudge and where-to-look hints SHALL NOT contain the answer.
3. THE third hint SHALL remove exactly two wrong options and never the
   correct one.
4. THE screen SHALL show hints left as drawn objects (three bulbs) and
   say in words how many hints are left.
5. THE "where to look" hint SHALL link to the named section of the
   article.

### Requirement 3: Answering

1. WHEN the student checks an answer, THE screen SHALL say in words
   whether it is right ("Right!") or not ("Not quite"), with a drawn tick
   or cross, never colour alone.
2. WHEN the answer is right, THE screen SHALL show the proof sentence from
   the article, credited and linked to its section.
3. WHEN the answer is wrong, THE student SHALL be able to try again or use
   a hint; after a second wrong try, the right answer and its proof SHALL
   be shown.
4. THE screen SHALL show progress through the five questions as drawn
   dots plus "Question N of 5".
5. WHEN the quiz ends, THE screen SHALL show the score in words and save
   the best score on the device.
6. All controls SHALL be reachable by keyboard; options SHALL be a radio
   group with a visible focus ring.
7. WHILE offline, THE quiz SHALL work for every bundled article after one
   visit.

### Requirement 4: Quizzes outside the packs

1. WHERE a quiz service endpoint is configured and online, THE app MAY
   request questions for an article outside the packs; every returned
   question SHALL pass the validator again in the app before it is shown.
2. IF the service is unavailable, THEN THE app SHALL keep working with the
   bundled quizzes and say that extra quizzes need a connection.
