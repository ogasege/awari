# Requirements: Content packs

## Introduction

Awari ships its library "on the disc": static JSON packs and photos in
`public/packs/`, generated from open data by one command
(`npm run packs`) and committed, so the app builds and runs without a
network. This spec covers the pipeline in `scripts/packs/` that builds
the Countries, Physics (electricity) and Dictionary packs, the facts
file, the atlas shapes, the photos and the manifest, and that keeps the
credits in `CREDITS.md` in step with what was bundled. The shapes it
emits are the contract in `src/lib/packs/types.ts`.

## Glossary

- **Pipeline**: the TypeScript program `scripts/packs/build.ts` and the
  modules beside it, run with `tsx`.
- **Raw cache**: `data/raw/`, a git-ignored folder holding every
  downloaded response, so a rerun does not hit the network again.
- **Extract**: the plain text of a Simple English Wikipedia article as
  returned by the TextExtracts API with `explaintext`.
- **Sovereign country**: a Wikidata item with a non-deprecated
  "instance of sovereign state" (P31 Q3624078) statement and no
  dissolution date (P576). On the Natural Earth map this is the 193 UN
  member states plus Vatican City, Palestine, Taiwan and Kosovo.
- **African UN member**: one of the 54 UN member states in Africa,
  listed by ISO 3166-1 alpha-3 code in `scripts/packs/countries.ts`.
- **Slug**: the URL id of an article (see Requirement 2.3).
- **Accepted licence**: one of the values of the `Licence` type
  (CC0, Public domain, CC BY 2.0–4.0, CC BY-SA 2.0–4.0).
- **Lead photo**: the single photo shown at the top of an article.
- **Credits region**: the text between `<!-- packs:begin -->` and
  `<!-- packs:end -->` in `CREDITS.md`.

## Requirements

### Requirement 1: One command, cached and polite

**User story:** As a developer, I want every pack built by one command
from open data, so that the content can be rebuilt and checked at any
time.

1. WHEN `npm run packs` is run, THE Pipeline SHALL build every pack,
   the facts file, the atlas, the photos, the manifest and the credits
   region, writing under `public/packs/` and `CREDITS.md` only.
2. THE Pipeline SHALL store every downloaded response in the Raw cache
   and, WHEN a response is already cached, SHALL use the cached copy
   instead of the network.
3. THE Pipeline SHALL send the User-Agent
   `AwariBuild/0.1 (educational open-source project)` with every request,
   make requests one at a time, wait at least 100 ms between network
   requests, and retry a request that fails with HTTP 429 or 5xx at most
   four times with growing delays.
4. IF a required source cannot be fetched or a validation check fails,
   THEN THE Pipeline SHALL exit with a non-zero status and a message
   naming the failing item, and SHALL NOT leave a partly written pack
   folder in place of a good one.
5. THE Pipeline SHALL delete generated files from a previous run that
   the current run did not produce, so the output always matches the
   manifest.
6. THE Pipeline SHALL replace only the entries of `public/packs/` it
   generates (`countries/`, `physics/`, `dictionary/`, `atlas/`, `img/`
   and `manifest.json`) and SHALL leave every other entry (such as
   `quizzes/`, built by `scripts/quizzes`) untouched.

### Requirement 2: Countries pack

**User story:** As a student, I want an article for every country I can
find on the globe, so that I can read about any of them.

1. THE Pipeline SHALL select every Sovereign country whose Wikidata id
   appears in the Natural Earth 1:50m admin-0 countries layer (directly,
   or through a documented alias for the Netherlands, Denmark and
   Palestine) and that has a Simple English Wikipedia article.
2. THE Pipeline SHALL include all 54 African UN members, and IF any is
   missing an article, THEN THE Pipeline SHALL fail.
3. THE slug of an article SHALL be derived from its title by: removing a
   trailing parenthetical (" (country)"), folding accents to ASCII,
   lowercasing, deleting apostrophes, replacing every other run of
   non-alphanumeric characters with one hyphen, and trimming hyphens
   (for example "Côte d'Ivoire" → `cote-divoire`, "South Africa" →
   `south-africa`). Slugs SHALL be unique within a pack.
4. THE title of a country article SHALL be its Simple English Wikipedia
   title without a trailing parenthetical.
5. THE Pipeline SHALL split each Extract into sections at its `==`
   headings (any level), with an empty heading for the lead, one
   paragraph per non-empty line, and runs of spaces collapsed to one.
6. THE Pipeline SHALL drop the sections headed Related pages,
   References, Other websites, Notes, Sources, See also, External links,
   Further reading, Footnotes, Bibliography, Citations and Gallery,
   together with their sub-sections, and SHALL drop sections left with
   no paragraphs and lines that are broken formula renderings.
7. THE summary of an article SHALL be the first one or two sentences of
   its lead, at most 300 characters.
8. THE Pipeline SHALL write `countries/<slug>.json` (an `Article`) for
   each country and `countries/index.json` (a `PackIndex`) listing every
   country with its continent and, when it has a lead photo, its thumb.

### Requirement 3: Country facts

**User story:** As a student using the atlas, I want key facts for each
country, so that I can compare places at a glance.

1. THE Pipeline SHALL write `countries/facts.json` (a `FactsPack`) with
   one `CountryFacts` per country article, using the article slug as id.
2. THE facts SHALL come from Wikidata (CC0), read through the Wikidata
   API: ISO alpha-3 code (as Natural Earth gives it, ISO_A3 or else
   ADM0_A3, so it joins the atlas; P298 when the country is not on the
   map), continent (P30 label),
   capital (P36), population (P1082) with the year it refers to, area
   in km² (P2046, normalised units), currency (P38), official languages
   (P37), independence and neighbours (P47, mapped to slugs of bundled
   countries).
6. THE `independence` field SHALL be filled only from a "significant
   event: independence" statement (P793 = Q1464916) with its point in
   time (P585), as an ISO date at the stated precision, and SHALL be
   omitted otherwise. Inception (P571) SHALL NOT be used, because it
   often marks a later change of government (Nigeria's is 1963, the
   year it became a republic, not its 1960 independence), and a wrong
   fact would become a wrong quiz answer.
3. THE Pipeline SHALL ignore deprecated statements and statements with
   an end time (P582), and WHEN several population statements remain,
   SHALL use one with the best rank and, among those, the latest point
   in time.
4. WHEN a country has several continents, THE Pipeline SHALL use the
   one Natural Earth gives, and every African UN member SHALL have the
   continent "Africa".
5. Neighbour lists SHALL contain only slugs of bundled countries, never
   the country itself, sorted and without duplicates.

### Requirement 4: Physics pack

**User story:** As a student, I want a set of articles about
electricity, so that I can learn one science topic in depth.

1. THE Pipeline SHALL build `physics/<slug>.json` and
   `physics/index.json` from these Simple English Wikipedia articles:
   Electricity, Electric charge, Electric current, Voltage, Electrical
   resistance, Ohm's law, Electrical circuit, Battery, Electrical
   conductor, Insulator (electricity), Static electricity and Lightning.
2. Physics articles SHALL follow the same section, summary, slug and
   source rules as country articles (Requirements 2.3–2.7).

### Requirement 5: Photos

**User story:** As a student, I want a real photograph at the top of an
article, so that I can see the place or thing I am reading about.

1. THE Pipeline SHALL choose one Lead photo for every African country
   article and every physics article, from Wikimedia Commons only.
2. THE Pipeline SHALL accept a file only IF it is a JPEG, its Commons
   licence normalises to an Accepted licence, it names an author, it
   carries no usage restriction, and neither its name nor its categories
   mark it as a flag, map, coat of arms, emblem, seal, logo, locator,
   icon or symbol.
7. THE Pipeline SHALL reject any file whose name, description or
   categories mention a subject unsuitable for children (child labour,
   war, conflict, refugees, poverty, corpses, protests, rebels, weapons,
   disasters and similar), a caricature or cartoon, a painting,
   engraving, drawing or other artwork, or a year before 1900; and, for
   places, official portraits, events, embassies and satellite images.
8. THE Pipeline SHALL prefer landscapes, landmarks, wildlife and cities,
   and SHALL use a hand-picked file from `photo-overrides.ts` when one
   is listed for the article; an override SHALL pass the same licence,
   author and suitability checks or the build fails.
3. THE Pipeline SHALL read the author (Artist, stripped of HTML) and
   licence (LicenseShortName) from the Commons `extmetadata`.
4. THE Pipeline SHALL resize each photo to at most 800 px wide and
   800 px high, encode it as JPEG at quality about 72, and lower the
   quality until it is under 90 KB or quality 50 is reached.
5. THE Pipeline SHALL save the photo as `img/<slug>.jpg` and record a
   `Photo` with its pixel size, an alt text, a caption, and a credit
   `Source` whose url is the Commons file page. The alt text SHALL be a
   plain English description from the Commons ImageDescription (HTML
   stripped, at most 140 characters) or the override's; a file without
   one is not used. The caption SHALL be two to five words naming what
   the photo shows, from the Commons object name or the override, and
   never a generic phrase such as "A view of <country>".
6. IF no acceptable photo is found for an article, THEN THE Pipeline
   SHALL fail for African countries and physics articles.

### Requirement 6: Dictionary pack

**User story:** As a student, I want to tap any word in an article and
read what it means, even offline.

1. THE Pipeline SHALL read the latest Open English WordNet release
   (CC BY 4.0) in its LMF XML form.
2. FOR every token (`tokenise`) of every bundled article (title, section
   headings and paragraphs), THE Pipeline SHALL bundle every
   `lemmaCandidates` candidate that is a WordNet lemma, and no other
   lemma.
3. Each bundled lemma SHALL keep at most three senses, each with its
   part of speech, gloss and, when WordNet has one, its first example.
4. THE Pipeline SHALL write the entries to `dictionary/<shard>.json`
   (`DictionaryShard`, shard = `shardFor(lemma)`).
5. The word "delta" SHALL resolve through `lemmaCandidates` to a bundled
   entry, because the Nigeria article mentions the Niger Delta.

### Requirement 7: Atlas shapes

**User story:** As a student, I want country shapes for the globe, so
that I can spin it and pick a country.

1. THE Pipeline SHALL write `atlas/countries.json`, a GeoJSON
   FeatureCollection built from the Natural Earth 1:110m admin-0
   countries layer (public domain).
2. Each feature's properties SHALL be exactly `iso3`, `name` and `id`,
   where `iso3` is ISO_A3, or ADM0_A3 when ISO_A3 is `-99`, and `id` is
   the slug of the country's article or `null` when there is none.
3. Coordinates SHALL be rounded to two decimals; rings left with fewer
   than four positions after rounding SHALL be dropped, and every ring
   SHALL stay closed.
4. Every feature with a non-null id SHALL have the same `iso3` as that
   country's facts.

### Requirement 8: Margin notes

**User story:** As a student, I want short handwritten facts beside an
article, so that interesting details jump out — and I can trust them.

1. THE Pipeline SHALL add at most two `fact` notes per article.
2. A note's text SHALL be shorter than 70 characters and SHALL be the
   wording of its proof sentence with only the final full stop replaced
   by an exclamation mark.
3. A note's proof SHALL be an exact sentence of the article text, SHALL
   contain a number, and SHALL NOT start with a pronoun or contain
   brackets or quotation marks.
4. IF no sentence qualifies, THEN THE Pipeline SHALL add no note.

### Requirement 9: Sources, credits and manifest

**User story:** As the project owner, I want every record to say where
it came from, so that Awari honours every licence.

1. Every `Article`, `Photo`, `CountryFacts`, `PackIndex`, `FactsPack`
   and `DictionaryShard` SHALL carry a `Source` with name, url, Accepted
   licence, licence url and retrieval date.
2. THE Pipeline SHALL rewrite only the Credits region of `CREDITS.md`,
   appending the markers at the end when they are absent, and SHALL
   leave every other byte of the file unchanged.
3. THE Credits region SHALL credit Simple English Wikipedia (CC BY-SA
   4.0), Wikidata (CC0), Natural Earth (public domain) and Open English
   WordNet (CC BY 4.0) with backticked glob lines covering every
   generated JSON file, and SHALL list every photo in a table row with
   its exact path, subject, author, licence and Commons url.
4. THE Pipeline SHALL write `manifest.json` listing every file it
   generates under `public/packs/` with its URL path and byte size, the
   total size and the build date. Files other builders write there (such
   as `quizzes/`) are not listed.
5. `npm run credits` SHALL pass after a build.

### Requirement 10: Validation and budget

**User story:** As a judge or maintainer, I want the committed packs
checked automatically, so that a broken build cannot slip in.

1. A Vitest suite SHALL load the committed `public/packs/` and check:
   every record has a Source with an Accepted licence; 54 African
   countries are present with articles; every article has at least one
   section; every Photo file exists; every note proof is an exact
   substring of its article; "delta" resolves in the dictionary; atlas
   features join to facts by iso3; and the manifest matches the files.
2. THE total size of `public/packs/` SHALL stay under 25 MB.
