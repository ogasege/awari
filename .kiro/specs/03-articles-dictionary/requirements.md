# Requirements: Articles and dictionary

## Introduction

A photo-led article page renders any pack article (Countries or Physics)
and lets the student tap any word to see its meaning in a side card,
using the bundled Open English WordNet pack, so it works offline.

## Glossary

- **Article**: an `Article` record from `/packs/<pack>/<id>.json`.
- **Side card**: the panel beside the text showing a word's meaning.
- **Lemma**: the dictionary form of a word (deltas → delta).

## Requirements

### Requirement 1: Article page

**User story:** As a student, I want to read an article led by a real
photograph, so that the place or idea feels real.

1. WHEN the student opens `/article/:pack/:id`, THE App SHALL load that
   article from its pack on demand and show its title, summary, lead
   photo as a print, and every section in order.
2. THE article body SHALL be straight, dark text on white paper, in a
   column no wider than about 70 characters.
3. THE article page SHALL show the article's handwritten margin notes,
   each fact note paired with the exact proof sentence from this article.
4. WHERE the article is a country, THE page SHALL show a facts card
   (capital, population with year, area, languages, currency) from the
   Wikidata facts pack, and links to the atlas and the country's quiz.
5. WHEN a country article is opened, THE App SHALL mark the country as
   discovered.
6. IF the article does not exist, THEN THE page SHALL say so in words and
   offer a link to search.
7. WHEN the id is `random`, THE App SHALL open a random article from that
   pack.

### Requirement 2: Credits on every article

1. THE article page SHALL credit the text source by name with a link, the
   licence (CC BY-SA 4.0) with a link, and a note that the text was
   adapted (split into sections).
2. THE article page SHALL credit each photo with author, licence and a
   link to its Wikimedia Commons file page.

### Requirement 3: Tap a word

**User story:** As a student, I want to tap a word I don't know, so that
I can understand the sentence without leaving the page.

1. WHEN the student taps or clicks a word in the article body, THE side
   card SHALL show the word, its dictionary form, part of speech and up
   to three meanings with examples where available.
2. THE side card SHALL resolve inflected forms to their lemma (for
   example "deltas" to "delta") using the shared lemmatiser.
3. IF no meaning is found, THEN THE side card SHALL say so in words and
   suggest trying another form.
4. THE side card SHALL contain a labelled text field so that keyboard
   and screen-reader users can look up any word.
5. WHILE offline, THE lookup SHALL work for every word whose lemma is in
   the bundled dictionary pack (for example "delta" in the Nigeria
   article).
6. THE side card SHALL credit Open English WordNet under CC BY 4.0.
7. THE meaning SHALL be announced to screen readers through a polite
   live region.
