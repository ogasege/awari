# Requirements: Atlas


> Updated in the 01-13 review pass (2026-11-12): the Africa stamp count beside the globe is now the world count
> (`16-world-stamp-book`), and the globe can draw a marked place for tours (`20-tours`). Requirements about the
> 54 African stamps are kept as history.

## Introduction

A globe the student can spin, drawn from Natural Earth country shapes.
Countries the student opens are marked as discovered, so the globe is
also their record of exploring. Selecting a country shows its facts and
links to its article and quiz. Must never be cut (product steering).

## Glossary

- **Globe**: an orthographic projection of `/packs/atlas/countries.json`.
- **Discovered**: a country slug stored in the student's progress.
- **Accessible twin**: a labelled country picker that does everything the
  globe does, for keyboard and screen-reader users.

## Requirements

### Requirement 1: Spin the globe

1. THE Atlas SHALL draw every Natural Earth country on an orthographic
   globe with a graticule, ocean and outline.
2. WHEN the student drags the globe with a mouse, pen or finger, THE globe
   SHALL rotate to follow the pointer.
3. WHILE the globe has keyboard focus, THE arrow keys SHALL rotate it in
   steps, and THE globe SHALL say in words how to spin it.
4. THE globe SHALL never tilt past a pole (latitude rotation stays within
   −90° to 90°) and longitude SHALL wrap around.
5. THE globe SHALL not animate on its own; it moves only when the student
   moves it (design rule 8).

### Requirement 2: Select a country

1. WHEN the student taps or clicks a country, THE Atlas SHALL select it,
   turn the globe so that it faces the student, and show a facts card.
2. THE facts card SHALL show the country name, continent and the facts
   available (capital, people, area, languages, money), credit Wikidata,
   and link to the country's article and quiz when they exist.
3. THE Atlas SHALL offer an accessible twin: a labelled picker of all
   countries; choosing one SHALL do exactly what tapping it does.
4. WHEN the address has `?c=<slug>`, THE Atlas SHALL open with that
   country selected.
5. IF a shape has no article, THEN THE card SHALL say so in words and
   still show its name.

### Requirement 3: Discovered countries

1. WHEN a country with an article is selected, THE Atlas SHALL mark it as
   discovered on the device.
2. THE globe SHALL fill discovered countries in yellow and the others in
   teal, and the selected country SHALL also get a thick outline, so the
   state does not rely on colour alone.
3. THE Atlas SHALL show, in words and as drawn stamps, how many of
   Africa's 54 countries are discovered.

### Requirement 4: Credits and budget

1. THE Atlas SHALL credit Natural Earth (public domain) and Wikidata (CC0).
2. THE map library and the shapes SHALL load only on the Atlas route.
