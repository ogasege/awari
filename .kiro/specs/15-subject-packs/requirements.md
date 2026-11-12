# Requirements: Subject packs

## Introduction

Beyond Countries and Electricity, Awari ships nine curated subject packs
of about 30 articles each, so a student can wander the whole world of
knowledge offline. Each subject has a page that Home's prints link to.

## Glossary

- **Subject**: one of Countries, Electricity (`physics`), Wildlife
  (`wildlife`), Space (`space`), Ancient worlds and history (`ancient`),
  Earth (`earth`), The human body (`body`), Physics and chemistry
  (`science`), Inventions and technology (`inventions`), Famous people
  (`people`), Arts, music and sport (`arts`).
- **Subject pack**: the nine new packs, built like the Electricity pack.

## Requirements

### Requirement 1: The packs

1. THE Pipeline SHALL build each subject pack from a curated list of
   Simple English Wikipedia articles, with between 25 and 35 articles in
   each pack.
2. EACH article SHALL carry a lead photo from Wikimedia Commons that
   passes the pipeline's licence and suitability checks, with author and
   licence in `CREDITS.md`, margin-note facts with exact proof sentences,
   and a Wikidata id when the page has one.
3. THE Pipeline SHALL build a quiz of at least three questions for every
   article, each question valid by the shared validator.
4. THE Pipeline SHALL fail and name every article that lacks usable text,
   a photo or a quiz, in one run.
5. THE packs SHALL load on demand; the first-load JavaScript SHALL stay
   under 300 KB.
6. THE Pipeline SHALL cover the tour stops (rivers, ancient wonders,
   volcanoes) in the Earth and Ancient packs.

### Requirement 2: The subject page

1. THE route `/subject/:id` SHALL show, for any subject, its name, a short
   description, and one print for every article of the pack (or, for
   Countries, the continents) linking to the article.
2. THE page SHALL link to the subject's quizzes, its Castle wing and its
   timeline events.
3. WHEN the subject id is unknown, THE page SHALL say so in words and link
   to the list of subjects at `/subjects`.
4. THE page SHALL work offline.

### Requirement 3: Search and records

1. THE search SHALL include every subject pack article.
2. THE credits screen and `CREDITS.md` SHALL list every new photo and
   data file, so `npm run credits` passes.
