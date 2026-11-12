# Requirements: Stamp book

## Introduction

> Superseded by `16-world-stamp-book`: the book now covers all 197 countries on six
> continents. The Africa-only requirements below are kept as history.

Each country a student opens becomes a postage stamp. Home shows the
latest stamps and a count out of Africa's 54 countries; the stamp book
screen shows the whole collection. Progress lives on the device
(IndexedDB) and never leaves it.

## Glossary

- **Discovered country**: a country whose article or atlas card the
  student opened; recorded by `withDiscovered` in `src/lib/store`.
- **Stamp**: the drawn postage stamp for one discovered country.
- **Slot**: one of the 54 places for an African country in the book,
  filled by its stamp or empty.

## Requirements

### Requirement 1: Stamps from discoveries

1. THE Stamp_Book SHALL make exactly one stamp for each discovered
   country that has an article, in the order the countries were found.
2. WHEN a discovered slug has no article, THE Stamp_Book SHALL ignore it.
3. THE count of African stamps SHALL never exceed 54 and SHALL never go
   down when more countries are discovered.

### Requirement 2: Home

1. THE Home screen SHALL show the five most recent stamps, the count
   "N of Africa's 54 countries" in words, and a link to the atlas.

### Requirement 3: The stamp book screen

1. THE screen SHALL show 54 African slots; a slot SHALL hold the stamp
   of its country when found, and otherwise say "Not found yet" in
   words.
2. THE screen SHALL state the African count in words ("N of 54").
3. THE screen SHALL list stamps of countries outside Africa in a
   separate section, and SHALL link every stamp to its article.
4. IF no country has been discovered, THEN THE screen SHALL say so in
   words and link to the atlas.
5. THE screen SHALL work offline from the device's saved progress and
   the cached country index.
