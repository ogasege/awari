# Design: Media library

## Data
`public/media/index.json` (small: per-image id, article key, kind, width, height, thumb path) and one
`public/media/<subject>.json` per subject with the full record (title, page, author, licence, caption,
verified). `public/media/licences.json` is the dated API answer. Thumbnails live in `public/media/img/`.
All media data loads on demand so first load stays under 300 KB.

## Collector (`scripts/media/`)
- `collect.ts`: per article, `generator=images` on the English Wikipedia title and
  `generator=categorymembers` on the Commons category from Wikidata P373, `prop=imageinfo` with
  `iiprop=extmetadata|url|size|sha1|mime` and `iiurlwidth=480`. A single queue: one request at a
  time, >= 1 s apart, `maxlag=5`, User-Agent with a contact address from the environment, 30 s
  timeout, backoff, every response written to `data/raw/<hash>.json`.
- `select.ts`: pure filters (shared repository, allow-list, size, restrictions, unsuitable categories
  and words, logos, collages), scoring (Featured/Quality/Valued first, landscape, kind variety),
  and a per-article quota of at least four and at most twelve; countries are chosen per kind.
- `thumbs.ts`: downloads the API thumbnail, converts to WebP 480 px, aims at 25 KB.
- `licences.ts` (`npm run licences`): re-asks the API for every bundled image, 50 titles per request,
  compares with the record, writes `licences.json`.

## App
- `ArticleGallery` strip on every article; `MediaViewer` (large view from Commons, cached by the
  service worker under a bounded cache, credit shown); `/media` gallery with filters, search and a
  "surprise me" pile; `PictureOfTheDay` on Home; picture questions built from the library in
  `src/lib/quiz/picture.ts`.
- Credits page reads `public/media/*.json`, grouped by subject and paginated.

## Properties
1. Every bundled image has a verified, allow-listed licence in `licences.json`.
2. No article has fewer than four images; the library has at least 3,000.
3. No picture appears twice on one page.
4. Every caption is a substring-traceable shortening of its Commons description.
5. `select` never returns a file with a restriction, an NC/ND licence, a non-shared repository, or a
   long side under 800 px.
6. A picture question never has two correct options and never repeats a distractor.
7. `licences` fails (non-zero exit) for a missing file, an off-list licence and an author mismatch.
