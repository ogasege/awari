# Requirements: World stamp book

## Introduction

The stamp book covers all 197 countries, one page per continent, and
never speaks of Africa alone. (This supersedes the Africa-only wording
of 08-stamp-book.)

## Requirements

1. THE Stamp_Book SHALL hold one stamp slot for each of the 197 countries
   in the countries index, grouped into six continents: Africa (54),
   Asia (49), Europe (45), North America (23), South America (12) and
   Oceania (14, including Insular Oceania).
2. THE route `/stamps` SHALL show the count "N of 197 countries" in words
   and the count for each continent, each linking to its page.
3. THE route `/stamps/:continent` SHALL show that continent's slots, found
   stamps first in discovery order, empty slots as "Not found yet".
4. THE words "Africa's 54" and any Africa-only count SHALL NOT appear in
   the app text; Home, the atlas and the stamp book SHALL use the world
   count and the continent counts.
5. THE counts SHALL never exceed their totals and SHALL never fall when
   countries are added.
