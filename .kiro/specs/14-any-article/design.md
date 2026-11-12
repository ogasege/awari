# Design: Any article

- `src/lib/wiki/convert.ts` (pure): `titleSlug`, `sectionsFromExtract`
  (reuses the pack splitter rules), `toArticle(response, wiki)`,
  `acceptPhoto(meta)` (same licence list as the pipeline).
- `src/lib/wiki/api.ts`: `loadWikiArticle(title, fetchImpl)` -> Simple,
  then English; image metadata from Commons `extmetadata`; thumbnail
  bytes fetched with CORS. All fetches take an injectable `fetch`.
- `src/lib/wiki/cache.ts`: IndexedDB database `awari-reading`
  (`articles`, `words`) with `putArticle`, `getArticle`, `listArticles`,
  `putWord`, `getWord`; falls back to memory without IndexedDB.
- `src/lib/wiki/search.ts`: `wikiSearch(query)` over the MediaWiki search
  API; merged with bundled hits and cached articles by `mergeResults`.
- `ArticleScreen` handles pack `wiki` through `useWikiArticle`; photo
  bytes are shown from an object URL.
- `WordCard` lookup order: bundled shard, `words` store, Wiktionary REST.
- `QuizScreen` for pack `wiki` builds the quiz with `buildQuiz` and a
  term pool from `autoTerms(article)`.

## Correctness properties

1. Converted articles have non-empty sections, no back-matter headings,
   and plain text without wiki markup or HTML entities.
2. The title slug is stable (same title, any case or underscores, same id).
3. Every question built for any article passes `validateQuestion`.
4. The reading cache round-trips an article and its photo bytes.
5. Simple is tried first; English only when Simple has no page.
6. A photo is accepted only with an accepted licence and a named author.
7. Merged search results contain no repeated target and list bundled
   articles in place of their wiki twins.
