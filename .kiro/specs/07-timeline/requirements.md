# Requirements: Timeline and On this day


> Updated in the 01-13 review pass (2026-11-12): subjects are now the eleven Awari subjects and events carry a
> continent (`18-world-timeline`); the four subjects below (Countries, Science, People, History) are history.

## Introduction

Dated events from Wikidata, filterable by subject, shown on a drawn
timeline. Home shows up to three events for today's date.

## Glossary

- **Event**: a `TimelineEvent` (see `src/lib/packs/types.ts`) with a full
  ISO date, a label, one plain sentence and a subject.
- **Curated list**: the reviewed Wikidata items in
  `scripts/packs/timeline-items.ts` that the pipeline turns into events.

## Requirements

### Requirement 1: The timeline pack

1. THE Pipeline SHALL build `public/packs/timeline.json` from a curated
   list of Wikidata items, reading each date and label from Wikidata
   through the cached `wbgetentities` client.
2. THE Pipeline SHALL keep an event only IF its date has day precision,
   it has exactly one distinct date, and its label is English.
3. THE `text` of each event SHALL be built from the Wikidata fields by a
   fixed template (for example "<label> was born on 7 November 1867."),
   never free-written, so it is true by construction.
4. EACH event SHALL carry a Wikidata `Source` (CC0) and, WHERE the item
   has a bundled article, a `link` such as `countries/ghana`.
5. THE list SHALL be suitable for ages 9 to 14: no wars, massacres,
   attacks or disasters, and every subject SHALL have at least 15 events.
6. THE pack SHALL cover at least 40 distinct month-and-day pairs so
   that Home shows something on most days.

### Requirement 2: The Timeline screen

1. THE screen SHALL list events oldest first as an ordered list with the
   year, label, sentence and a link to the article where one exists.
2. THE screen SHALL offer toggle buttons for All, Countries, Science,
   People and History with `aria-pressed`; selecting one SHALL show only
   events of that subject, and All SHALL show every event.
3. THE screen SHALL show an "On this day" band with today's events, or
   say in words that none are filed.
4. THE screen SHALL draw a century ruler with a hand-drawn "you are
   here" arrow at today's year, hidden from screen readers.
5. Years before the common era SHALL NOT appear; all dates are CE.

### Requirement 3: On this day on Home

1. WHEN events exist for today's month and day, THE Home screen SHALL
   show up to three, spread across subjects, oldest first.
2. IF none exist, THEN Home SHALL say so in words.
