# Design: Subject packs

- `src/lib/packs/subjects.ts` (shared by the app and pipeline): the
  `SUBJECTS` list `{ id, name, blurb, pack, wing? }` and helpers.
- `scripts/packs/subjects/<id>.ts`: topic lists `{ title, photoQuery?,
  event? }` per pack; `scripts/packs/subject-packs.ts` builds the
  articles with `buildArticle`, adds photos with `choosePhoto`, and
  returns the indexes; failures are collected and reported together.
- `scripts/quizzes/build.ts` covers all packs; non-country packs use
  `autoTerms(article)` as the gap-fill pool.
- `PackId` widens to every pack id plus `wiki`; validators and loaders
  take the pack list from `SUBJECTS`.
- `SubjectScreen.tsx` (lazy) renders `/subject/:id` and `/subjects`.
- `public/packs/home.json` is built from the packs for Home (see 19).

## Correctness properties

1. Every pack has 25-35 articles; ids are unique within a pack.
2. Every index item has an article file, a photo file, credits and a
   quiz of at least three valid questions.
3. Subject ids are unique, and each subject maps to exactly one pack or
   to Countries.
4. The subject page lists exactly the articles of the pack index.
