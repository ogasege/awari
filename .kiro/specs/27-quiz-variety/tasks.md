# Tasks: 27-quiz-variety

One commit per task, a row in `docs/kiro-log.md`, a test for each. Nothing ticked without evidence.
Status: **written, not started** (decision of the owner, 16 Nov: the quiz shape variety is not a known issue,
it is this next spec).

- [ ] 1. Question record: `kind` and `media` fields in `src/lib/quiz/validate.ts`; old files load unchanged; tests for
      the new rejections (unknown kind, missing picture, bad true/false options).
- [ ] 2. Shared helpers: seeded generator, `distractors()`, the transcontinental list, the look-alike flag pairs; tests.
- [ ] 3. Generators for capital, capital-reverse, continent and currency, with hint templates and proofs; unit tests
      and the fact test (Req 5.4) for each.
- [ ] 4. Generators for neighbour and largest, reusing the land-border and area rules from 26 N-1; tests.
- [ ] 5. Generators for first (timeline) and truefalse; tests that every false statement is false with certainty.
- [ ] 6. Generators for flag and picture; picture rules shared with `dailyRejection`; tests.
- [ ] 7. Mixing in `scripts/quizzes/build.ts` with the per-shape cap and the build table; regenerate the committed
      quizzes; review the diff (Req 4.4); update the cloze share in `docs/final-review/report.md`.
- [ ] 8. Screens: Picture, TrueFalse and First question components; keyboard, focus, 44 px; component tests.
- [ ] 9. Gates: `suitability` over all new questions, property tests over all shapes (Req 5.2, 5.3), hint ladder over
      all shapes; `offline-check` plays one of each shape; `a11y.ts` on each shape at both widths.
- [ ] 10. Quizzes index copy, About "Known differences" line, README and judges guide numbers.
- [ ] 11. Live: after the owner's redeploy, an independent `awari-design-reviewer` pass over one quiz of each shape;
      fix blockers and majors; update `docs/final-review/report.md` with the before and after cloze share.
