# Fix batch 1 (spec 26-final-review, task 7)

Source: `docs/final-review/design-review.md` (independent design reviewer run `e44858cc`, 14 Nov). Findings table D-1 to D-43.
This file is the hand-off for the conductor. The conductor splits it into the three work packages below, gives
each to `awari-builder`, and reports back what was done, with commit ids and test output. The parent session
(owner of `src/features/**` and `src/design/**`) is fixing the screen items D-9, D-10, D-11, D-23, D-24, D-25, D-28 to D-31,
D-34, D-40 to D-42 at the same time, so do not edit those folders.

## Guardrails (all packages)

- No `git push`, no deploy, no `terraform apply`, no AWS writes, no spending. Do not run `npm run build`, `npm run desktop:prepare`
  or anything else that writes `dist/` (the parent uses it).
- Commit only your own paths: `git add <your paths>` then `git commit <your paths> -m "..."`, one commit per package, message
  `26-final-review fix-batch-1 <package>: <summary>`. Never `git add -A`. Do not touch `docs/kiro-evidence/hook-firings.jsonl`.
- Never write the banned product name. Keep every picture licence verified: `npm run licences` must still pass
  (needs network to Commons; if it cannot run, say so and do not claim it passed).
- Add or update tests; `npx vitest run`, `npx tsc -b --noEmit` and `npx eslint . --max-warnings 0` must pass before you finish.
- Report: what changed, counts before and after, commit ids, test output tails, anything you could not fix and why.

## Package A: quizzes (D-1, D-5, D-6, D-7, D-8)  [owner: awari-builder]

Files: `src/lib/quiz/generate.ts` (+ its tests), `scripts/quizzes/**`, `public/packs/quizzes/**` (rebuild with `npm run packs` only if
that does not rewrite content packs; otherwise run `npx tsx scripts/quizzes/build.ts`).

1. **D-1 (blocker).** The first hint ("nudge") is "It starts with the letter X and has N letters." and identifies the answer in
   366 of 381 questions. Replace rung one with a hint that does not name the answer on its own. For example: tell the part of the
   article to look in, or the answer's word class and a related clue, but never the first letter AND length together when
   that single-handedly matches one option. Add a property test: for every committed quiz, no first hint alone narrows the four
   options to one.
2. **D-5.** 87 cloze questions leak the answer by capitalisation (exactly one option is capitalised and it is the right one).
   Make all options match the capitalisation of the gap position (sentence start capitalised, otherwise lower case), and add a
   property test over all committed quizzes.
3. **D-6, D-7.** Drop or regenerate questions whose distractor is as good or better than the answer, or whose distractors are
   implausible (examples: `ancient/mali-empire.json` "prolific, richest, wealthiest, african"; `countries/kenya.json` language
   options "Zimbabwe Sign Language, Swahili, Xhosa, Bobo"; `countries/nigeria.json` question 3 offering "Sri Jayawardenepura Kotte, Colombo").
   Distractors must be the same kind (countries for countries, languages for languages, same part of speech and number for words) and
   must not fit the sentence equally well (reject a distractor that is a synonym of the answer). A quiz must still have at least
   5 questions and all existing quiz tests must pass; list quizzes that fall under 5 questions.
4. **D-8.** 360 of 381 proof sentences are the question with the gap filled in. Where the article has a different sentence that
   states the same fact, show that as the proof; otherwise keep it and say in your report that it remains. Do not invent text.

## Package B: article leads (D-17 to D-22)  [owner: awari-builder]

Files: `scripts/packs/**` (the lead text cleaning), `public/packs/*/*.json` and `public/packs/*/index.json` (regenerate the
affected files only, then rebuild the manifest with `npx tsx scripts/packs/rebuild-home.ts`).

Fix the lead (first paragraph and the index `summary`) of: empty brackets `( ())` and `( (), )` (24 leads, e.g. cape-verde, andorra,
bolivia, croatia, hungary, albania, algeria, austria, belize, estonia, grenada, iceland); leading hatnotes ("Not to be mistaken for ...",
"This article is about iron the metal. For the tool ...": `arts/muhammad-ali`, `science/iron`); text cut mid-sentence
(`earth/mount-fuji` "at", `inventions/helicopter` "lifts up off"); disambiguation stub `science/energy` ("Energy can mean various things:");
`arts/basketball` (stray "+", ungrammatical, 49 words); 41 leads that open with a non-Latin native name and 22 with IPA before the
first verb (move the native name out of the first sentence or drop it; the facts card keeps it); citation marker `[4]` in
`countries/laos`. Rules: keep the Simple English Wikipedia text and its licence/credit; if a lead cannot be repaired by a rule, write
a one-sentence lead from the article's own second sentence, never from outside knowledge. Add a test over every committed
pack that fails on empty brackets, a trailing "[n]", a lead not ending in a full stop, and a lead over 45 words.

## Package C: picture captions and lead pictures (D-2, D-3, D-12, D-13, D-14, D-15, D-16, D-26, D-27, D-36 to D-39)  [owner: awari-builder]

Files: `scripts/media/**` (caption rules, `captions-decisions.txt`, denylist, lead overrides), `public/media/**` (rebuild with the
documented media build, then `npm run licences`), `scripts/packs/lead-overrides.ts` if the lead picture changes.

- Not suitable lead pictures (blockers): `arts/movie-theatre` (nachos and beer; use "A movie theater concession stand" or another cinema
  picture already in its record), `science/carbon` (emphysema lung; use any other picture in the record or a plain element/diamond/graphite
  picture), also `body/brain`, `body/digestion`, `arts/olympic-games`, `ancient/industrial-revolution`, `arts/jesse-owens`,
  `wildlife/frog`, `inventions/paper`, `arts/mask`: choose a lead that shows the subject, from pictures already in the library.
- Captions: stop at a clause boundary instead of "..." (431 captions end in an ellipsis; 15 break on a function word); reject
  uploader first person ("I found", "my letter", "this photo is not taken by me", 32 + 17 captions), processing notes
  ("Cropped, with artifacts removed, mild denoising/sharpening", `inventions/steamboat` lead), date-only captions ("6/, Jun 19, 2013"),
  captions under three words, shouting capitals ("A4 PAPER"); add the 10 worst examples in the review as test cases.
- Wrong picture for the article: `countries/australia` "Shiraz wine ... Iran", `earth/mount-kilimanjaro` "Kenyan Landscapes",
  `inventions/paper` Pripyat picture, `body/pancreas` unreadable caption, `arts/mask` file/caption mismatch: remove or replace
  with a hand-written caption in `captions-decisions.txt` only where the file page text supports it.
- When a picture is removed, the article may drop below four; list those articles in KNOWN_GAPS as before. Re-run the licence check.
  Do not add a picture whose licence has not been verified against the Commons API.
