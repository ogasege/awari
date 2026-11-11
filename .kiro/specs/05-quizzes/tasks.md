# Tasks: Quizzes with a hint ladder

- [x] 1. Question bank
  - [x] 1.1 Sentence splitter and `buildQuiz` (fact and gap-fill
        questions, hints, seeded shuffle); Properties 3, 6, 8.
        _Req 1.1–1.5, 2.2, 2.3_
  - [x] 1.2 `scripts/quizzes/build.ts` wired into `npm run packs`;
        pack test for Properties 1 and 2; credits entry. _Req 1.1–1.4_
- [x] 2. Quiz play
  - [x] 2.1 Pure quiz reducer with Properties 4, 5, 7. _Req 2.1, 2.3, 3.1–3.5_
  - [x] 2.2 Quiz screen and quizzes list: radio group, hint bulbs, proof
        slip, drawn progress dots, score saved. _Req 2.4, 2.5, 3.1–3.6_
  - [x] 2.3 Component test: the Nigeria quiz plays end to end from the
        committed pack with no network. _Req 3.7_
- [ ] 3. Outside the packs
  - [ ] 3.1 Optional "make a quiz from any Wikipedia article" panel using
        `fetchRemoteQuiz`, hidden when no endpoint is configured.
        _Req 4.1, 4.2_
