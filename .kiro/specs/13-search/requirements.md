# Requirements: Search


> Updated in the 01-13 review pass (2026-11-12): search now also covers every subject pack, articles read on this
> device, and Simple or English Wikipedia online (`14-any-article` Req 4, `15-subject-packs` Req 3.1).

## Introduction

The header has a search field on every screen. It searches the bundled
packs (article titles and summaries, quizzes and timeline events) and
the dictionary, entirely on the device, so it works offline.

## Requirements

### Requirement 1: Matching

1. WHEN the student searches, THE Search SHALL split the query into
   words, ignore case, and return only items that contain every word in
   their title or text.
2. THE Search SHALL rank title matches above text matches, and break
   ties alphabetically by title.
3. IF the query is blank, THEN THE Search SHALL return nothing and ask
   the student to type a word.

### Requirement 2: The screen

1. THE screen SHALL read the query from `?q=` and have its own labelled
   search field.
2. THE screen SHALL list articles (with a quiz link where the article has
   a quiz), then timeline events, and SHALL show a dictionary meaning
   when the query is one word that resolves.
3. IF nothing matches, THEN THE screen SHALL say so in words and suggest
   the atlas and the quizzes.
4. THE screen SHALL work offline from the cached packs.
