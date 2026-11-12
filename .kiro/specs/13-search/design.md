# Design: Search

- `search.ts` (pure): `tokens(query)`, `searchDocs(docs, query)` where a doc
  is `{ kind, id, title, text, to }`. Score: all words must appear in
  title+text; +10 for a word that starts the title or is the title, +6 for
  a word in the title, +2 for a word in the text; sorted by score then
  title.
- `SearchScreen.tsx`: loads the two pack indexes, the quiz index and the
  timeline pack with `usePack`, builds docs, shows article, event and
  dictionary results.

## Correctness properties

1. Every result contains every query word (case-insensitively) in its
   title or text.
2. Results are ordered by score descending, then title.
3. A blank query returns nothing.
4. The query's case does not change the results.
