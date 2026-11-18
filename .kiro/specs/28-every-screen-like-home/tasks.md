# Tasks: 28-every-screen-like-home

One commit per task ('28-every-screen-like-home <n>: ...'), a row in `docs/kiro-log.md`, tests for each. Builders run in
parallel, one per screen group, each on its own files; the main session integrates and runs the full gates. Runs are labelled
with Iron Man suit names and recorded in `docs/kiro-evidence/crew/README.md`.

Shared property (Req 1.1, 1.3): `scripts/final-review/screen-test.ts` measures, at 1440 x 900, the empty share of the first
viewport and whether the main content's direct children are all the same size; each group adds its screen to it.

- [ ] 0. Before sheets of every screen at 1440 and 390 in `docs/final-review/design-pass/before/`.
- [ ] 1. Group "Mark 42": Quiz play screen and result (QuestionCard, QuizScreen, quiz.css; spec 27 task 8 shapes rendered on
      it). Castle rooms reuse QuestionCard and must still work.
- [ ] 2. Group "Hulkbuster": Quizzes index (QuizzesScreen, new quizzes.css).
- [ ] 3. Group "Mark 50": Article (src/features/article/*).
- [ ] 4. Group "Mark 3": Subjects and Subject (src/features/subject/*).
- [ ] 5. Second wave: Timeline, Stamp book, Tours, Search, Castle, Atlas, Not found.
- [ ] 6. After sheets; independent `awari-design-reviewer` round; fix fails; repeat once.
