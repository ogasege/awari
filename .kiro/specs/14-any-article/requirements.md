# Requirements: Any article

## Introduction

Awari is the whole encyclopedia, not a sampler. Searching any topic opens
it: when online, an article is loaded on demand from Simple English
Wikipedia (falling back to English Wikipedia) into the same article page,
and every article read is kept on the device so it works offline later.

## Glossary

- **Wiki article**: an `Article` with pack `wiki`, built on the device from
  a live Wikipedia response. Route: `/article/wiki/:title`.
- **Reading cache**: the IndexedDB store of wiki articles (with their
  lead photo bytes) the student has opened.

## Requirements

### Requirement 1: Loading

1. WHEN the student opens `/article/wiki/:title`, THE Loader SHALL ask
   Simple English Wikipedia for the page and, ONLY IF Simple has no such
   page, English Wikipedia.
2. THE Loader SHALL turn the plain-text extract into sections, dropping
   back-matter sections (references, external links, other websites and
   similar), and SHALL fail with a clear reason if no usable text remains.
3. THE Loader SHALL give the article a source naming the wiki, the page
   and CC BY-SA 4.0, and a Wikidata id when the page has one.

### Requirement 2: Photo and credits

1. WHEN the page has a lead image on Commons whose licence is accepted and
   whose author is named, THE Loader SHALL show it as the lead print with
   author, licence and link; OTHERWISE the article SHALL render without a
   photo.
2. THE page SHALL credit text and photo exactly as bundled articles do.

### Requirement 3: Reading cache

1. WHEN a wiki article loads, THE Loader SHALL save it, with its photo
   bytes, in the reading cache.
2. WHEN the network is gone, THE page SHALL open any cached article, and
   SHALL say in words that an uncached article needs a connection.
3. THE search SHALL include cached articles even offline.

### Requirement 4: Search opens anything

1. WHEN the student searches, THE Search SHALL also query Simple English
   Wikipedia (and English Wikipedia when Simple finds nothing) and list
   each result as a link to `/article/wiki/:title`.
2. WHEN a result names a bundled article, THE Search SHALL link to the
   bundled page instead, and SHALL not list it twice.
3. THE Search SHALL offer "Open <best match>" as its first action.

### Requirement 5: Dictionary and quiz

1. WHEN a tapped word is not in the bundled dictionary, THE WordCard SHALL
   use a saved lookup, then (online) Wiktionary, save the answer, and say
   in words when nothing is found or the network is gone.
2. THE Quiz for `wiki/:title` SHALL be built on the device from the
   article, with the same hint ladder, each question passing the shared
   validator; IF fewer than three questions can be made, THEN THE page
   SHALL say so in words.
