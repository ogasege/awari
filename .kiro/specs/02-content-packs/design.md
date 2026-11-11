# Design: Content packs

## Overview

`npm run packs` runs `scripts/packs/build.ts`, which fetches open data
through a caching HTTP client, turns it into the shapes in
`src/lib/packs/types.ts` with small pure functions, writes everything to
a staging folder, validates it, and only then swaps it into
`public/packs/` and rewrites the credits region of `CREDITS.md`.

Pure transforms (no network, no file system) are kept apart from the
steps that fetch and write, so each transform has example tests and a
fast-check property.

## Architecture

```
scripts/packs/
  build.ts        entry point: runs the steps in order, stages, swaps
  http.ts         cached, polite fetch (data/raw/, User-Agent, retries)
  sources.ts      Source builders and licence URLs per data set
  slug.ts         slugify(), stripParenthetical()             (pure)
  text.ts         splitSections(), splitSentences(), summarise() (pure)
  licence.ts      normaliseLicence(), isUnwantedImage()        (pure)
  wikidata.ts     wbgetentities client + claim/pick helpers   (pure parts)
  wikipedia.ts    extracts, page images, Commons imageinfo
  countries.ts    country selection, articles, facts, African list
  physics.ts      physics article list and builder
  photos.ts       candidate search, acceptance, sharp resize
  notes.ts        deriveNotes()                                (pure)
  wordnet.ts      parseWordNet(), selectEntries(), shard()     (pure)
  atlas.ts        trimAtlas(), roundCoords()                   (pure)
  credits.ts      renderCredits(), replaceRegion()             (pure)
  manifest.ts     buildManifest()
  validate.ts     validatePacks(): the checks shared by build and test
  *.test.ts       examples + "Property N" tests
  validate.test.ts  loads committed public/packs and runs validatePacks
```

## Data flow

```
Natural Earth 50m ──┐ (QIDs present on the map)
Wikidata API ───────┼─> country list (QID, title, NE iso3/continent)
                    │        │
Simple Wikipedia ───┼────────┴─> extracts ─> sections, summary, notes
                    │                             │
Wikidata API ───────┴─> claims ─> CountryFacts (labels, neighbours→slugs)
Commons API ──> candidates ─> accept ─> sharp ─> img/<slug>.jpg + Photo
all article text ─> tokens ─> lemmaCandidates ∩ OEWN ─> dictionary/*.json
Natural Earth 110m ─> trimAtlas(slug by QID) ─> atlas/countries.json
staging folder ─> validatePacks ─> manifest.json ─> swap ─> CREDITS.md
```

### HTTP cache (`http.ts`)

`fetchCached(url, { key, kind })` hashes the URL (SHA-1) unless a key is
given, and stores `{ url, fetched, status, body }` as JSON (text) or the
raw bytes plus a `.meta.json` (binary) in `data/raw/<kind>/`. Cache hits
return immediately with the original fetch date, so a rebuild from cache
is byte-for-byte stable apart from the manifest build date. Network
requests are serialised through one promise chain with a 150 ms gap
that doubles (up to 3 s) after every HTTP 429; HTTP 429/5xx are retried up to four times with exponential back-off,
honouring `Retry-After`. Every request sends
`AwariBuild/0.1 (educational open-source project)`. POST form bodies are
part of the cache key.

### Country selection (`countries.ts`)

1. Natural Earth 1:50m: the set of `WIKIDATAID`s (242 features).
2. Wikidata API (`wbgetentities`, 50 ids per request, labels, claims
   and the Simple English sitelink): keep items with a non-deprecated
   P31 Q3624078 and no P576. The Query Service (SPARQL) was not used: at
   build time it was rate-limiting every client to one request a minute
   during an outage, and `wbgetentities` needs no query at all. Three
   aliases map a
   sovereign state to the item Natural Earth uses: Kingdom of the
   Netherlands Q29999 → Netherlands Q55, Kingdom of Denmark Q756617 →
   Denmark Q35 (both for the European country, which is what students
   look for), and Natural Earth's Palestinian territories Q23792 → State
   of Palestine Q219060. For the first two the facts and article come
   from the alias item.
3. Keep states present on the map with a Simple English article; slug
   and title come from that article's title (Requirement 2.3/2.4).
4. Check the 54 African UN members (hard-coded ISO3 list) are present.

### Text (`text.ts`)

`splitSections(extract)` walks the extract line by line. A line
matching `^(={2,})\s*(.+?)\s*\1$` opens a section at that level; a
dropped heading (case-insensitive list) suppresses everything until a
heading of the same or higher level. Other lines are trimmed, inner
whitespace collapsed, and kept as paragraphs unless they look like a
broken formula (contains `=` or `{\displaystyle` and has fewer than
three spaces). Empty sections are removed.

`splitSentences(paragraph)` splits after `.`, `!` or `?` followed by
whitespace and an upper-case letter, digit or opening quote, except
after common abbreviations (Mr, Dr, St, U.S, e.g, i.e, etc, c, No).
Every sentence is a substring of the paragraph.

### Facts (`wikidata.ts`)

Claims come from the same `wbgetentities` responses; labels of the
items they point at (capitals, currencies, languages, continents) are
fetched in further batches of 50. Pure helpers:

- `currentStatements(claims, pid)`: drops deprecated statements and
  those with an end time (P582), keeps the best remaining rank.
- `pickPopulation(statements)`: rank order preferred > normal
  (deprecated ignored); among the best rank, the latest `P585`; ties go
  to the larger figure so the choice does not depend on order.
- `iso3`: Natural Earth's code (ISO_A3, else ADM0_A3) for countries on
  the map, so facts always join the atlas (Wikidata's P298 is deprecated
  for the Netherlands and is "XKS" for Kosovo where Natural Earth uses
  "KOS"); P298 otherwise.
- `formatWikidataTime(value, precision)`: `YYYY-MM-DD` (11), `YYYY-MM`
  (10) or `YYYY` (9 or coarser); negative years keep their sign.
- Area converts km², square miles, hectares and m² to km², rounded.
- `independenceDate(entity)`: the P585 date of a P793 = Q1464916
  ("significant event: independence") statement, else nothing. P571
  (inception) is deliberately not used (Nigeria's is its 1963 republic,
  not its 1960 independence). At build time Wikidata had no such
  statement for any bundled country, so `independence` is omitted.
- `mapNeighbours(qids, slugByQid, self)`: maps to slugs, drops unknown
  and self, sorts, de-duplicates.
- `chooseContinent(labels, neContinent, iso3)`: "Africa" for African UN
  members; else Natural Earth's continent when Wikidata lists it; else
  the first Wikidata label in alphabetical order.

### Photos (`photos.ts`)

Candidates, in order: files used on the Simple English article (in the
order the parse API returns them), then Commons searches
(`filetype:bitmap` with "<country> landscape", "<country>" and each
capital for countries, or a curated phrase for physics). Candidates go
to Commons `imageinfo` in batches of up to 50 with `extmetadata` and a
1200 px thumbnail URL. `acceptImage(meta)` applies Requirements 5.2
and 5.7 to the file name, object name, description, categories and
author together: the `UNSUITABLE` list (child labour, war, refugees,
poverty, protests, caricatures…), artworks (painting, engraving,
drawing…) and any year before 1900; for places also official
portraits, events, embassies and satellite imagery. `placeMentions`
keeps a country's photos about that country: a file used on the
article is rejected when its name or description names another country
but not this one (Benin's article used a photo of Koutammakou, Togo),
and a search result must name this country (or its capital) and no
other. A candidate is only usable with an alt text (`altFrom`: the
first sentence of the Commons description when it reads as complete
English, cut at a word boundary to 140 characters) and a caption
(`captionFrom`: the object name or file name, bracketed parts and
trailing numbers removed, when it is two to five plain words). Among
usable candidates `preferenceScore` ranks landscapes, landmarks,
wildlife and cities (keyword hits) and landscape format; sources are
read until one offers a preferred subject.

`photo-overrides.ts` maps "<pack>/<slug>" to a hand-picked Commons file
with its caption (and optional alt). Overrides were chosen by reviewing
every automatic pick's file name and description and replacing any that
was doubtful; they pass through `acceptImage` like any other file, so a
licence change on Commons fails the build. The chosen file is
downloaded (thumbnail), resized with `sharp` (`fit: inside`, 800×800,
`withoutEnlargement`, mozjpeg), and re-encoded at quality 72, 64, 57, 50
until under 90 KB.

### Margin notes (`notes.ts`)

`deriveNotes(sections)` scans sentences in reading order and keeps those
that contain a digit, end with a full stop, are at most 69 characters
once the full stop becomes "!", do not start with a pronoun (It, They,
This, These, He, She, Its, Their, There) and contain no brackets or
quotes. The first two (preferring the lead) become notes. Because the
text is the proof sentence itself, a note can only be as true as the
article sentence it sits beside, which is the guarantee Requirement 8
asks for.

### Dictionary (`wordnet.ts`)

The OEWN `english-wordnet-<year>.xml.gz` release asset is gunzipped in
memory (~110 MB string) and scanned with two regular expressions: one
for `<LexicalEntry>` blocks (lemma `writtenForm` + ordered `Sense`
synset ids) and one for `<Synset>` blocks (part of speech, first
`Definition`, first `Example`). XML entities are decoded. Lemmas are
keyed in lower case; entries for the same key are merged. Senses are
taken round-robin across that key's entries (so "charge" gets a noun
and a verb sense) up to three.

`selectEntries(tokens, lexicon)` collects `lemmaCandidates` for every
token and keeps those in the lexicon; `shardEntries` groups them by
`shardFor`.

### Atlas (`atlas.ts`)

`trimAtlas(fc, lookup)` keeps geometry type, rounds coordinates to two
decimals, removes consecutive duplicate positions, re-closes rings,
drops rings with fewer than four positions (and polygons whose outer
ring was dropped), and sets `{ iso3, name, id }`. `id` comes from the
country matched by `WIKIDATAID` (with the alias table) and `iso3` is
then taken from that country's facts, which the build asserts equals
the Natural Earth code; unmatched features keep the Natural Earth code
and `id: null`.

### Credits and manifest

`replaceRegion(text, region)` returns `text` with the bytes between the
markers replaced, or with the markers and region appended (after one
blank line) when absent. `renderCredits(photos)` produces the data-set
list with backticked globs (`packs/countries/*.json`,
`packs/physics/*.json`, `packs/dictionary/*.json`,
`packs/atlas/*.json`, `packs/manifest.json`) and one table row per
photo. Table cells escape `|`.

`manifest.json` (not part of `types.ts`, so its shape is fixed here):

```ts
interface PacksManifest {
  built: string;            // ISO date of the build
  totalBytes: number;
  files: { path: string; bytes: number }[]; // path like "/packs/img/nigeria.jpg"
}
```

The manifest does not list itself, and lists only this pipeline's
entries (`OWNED_ENTRIES`: `countries/`, `physics/`, `dictionary/`,
`atlas/`, `img/`). `quizzes/` is written afterwards by
`scripts/quizzes/build.ts` (`npm run packs` runs both), so the service
worker must precache quiz files from their own listing.

### Staging and swap

Everything is written to `data/build/packs/` first. `validatePacks`
runs on the staging folder; on success each owned entry of
`public/packs/` is replaced by its staged copy with a rename, and the
credits region is rewritten. Entries the pipeline does not own (such
as `quizzes/`) are never touched. On failure `public/packs/` stays
untouched.

## Correctness properties

1. *Sections*: for any extract, no output section has a dropped
   heading, every section has at least one paragraph, and every
   paragraph is non-empty, trimmed and (after whitespace collapsing)
   appears in the input in order. (Req 2.5, 2.6)
2. *Slugs*: for any string, `slugify` returns only `[a-z0-9]` runs
   joined by single hyphens (or the empty string) and is idempotent.
   (Req 2.3)
3. *Licences*: for any string, `normaliseLicence` returns either null
   or an Accepted licence; strings mentioning NC, ND or GFDL-only are
   never accepted; every Accepted licence normalises to itself. (Req
   5.2, 9.1)
4. *Population*: for any set of statements, `pickPopulation` returns a
   statement of the best non-deprecated rank present with the latest
   date among that rank, independent of input order. (Req 3.3)
5. *Neighbours*: for any neighbour lists, `mapNeighbours` returns
   sorted, unique, known slugs that never include the country itself.
   (Req 3.5)
6. *WordNet parsing*: for any generated lexicon serialised as LMF XML,
   `parseWordNet` returns exactly its lemmas (lower-cased) with their
   senses' parts of speech, glosses and first examples, entities
   decoded. (Req 6.1, 6.3)
7. *Dictionary selection*: for any texts and lexicon, every selected
   lemma is a candidate of some token and in the lexicon, every such
   candidate is selected, no lemma has more than three senses, and every
   lemma sits in shard `shardFor(lemma)`. (Req 6.2–6.4)
8. *Atlas trimming*: for any polygon features, output properties are
   exactly `{iso3, name, id}`, every coordinate has at most two
   decimals, every ring is closed with at least four positions, and
   `iso3` follows the ISO_A3 / ADM0_A3 fallback. (Req 7.2, 7.3)
9. *Margin notes*: for any sections, `deriveNotes` returns at most two
   notes, each shorter than 70 characters, whose proof is an exact
   substring of the article text and whose text is the proof with its
   final full stop replaced by "!". (Req 8.1–8.4)
10. *Credits region*: for any file text and region, `replaceRegion`
    leaves everything outside the markers unchanged, is idempotent, and
    appends the markers when they are absent. (Req 9.2)
11. *Image filter*: for any file title containing an unwanted word
    (flag, map, coat of arms, …) or a non-JPEG extension,
    `isUnwantedImage` is true. (Req 5.2)

## Testing

- Example tests and Properties 1–11 sit beside the modules
  (`scripts/packs/*.test.ts`), named `Property N: …` with the
  requirement numbers.
- `scripts/packs/validate.test.ts` runs `validatePacks` on the committed
  `public/packs/` (Requirement 10) plus Nigeria/delta spot checks.
- Pack test files use the `node` Vitest environment.
