# Does it work the way a 1990s CD-ROM encyclopedia worked?

Spec 26-final-review, brief section 2. Each row was exercised, not assumed: "Evidence" names the journey, test or
screen. No third-party name, logo, layout or artwork is used in the product (`npm run rules` passes).

| Feature of the era | Here? | How close it feels | What is weaker | What was fixed in this spec | Evidence |
|---|---|---|---|---|---|
| Opening screen you want to explore | Present | Close: Home is a scrapbook with doors to the globe, Castle, quizzes, tours, timeline and pictures; every part is one click away | On a phone the collage is trimmed, so some doors become the header links | Header on a phone is 174 px, not 257, so the first screen shows content (D-10) | 26 Home links activated per width; probe at 390 px |
| Articles with pictures, captions, related links | Present | Close: lead photo, "More pictures" strip, credit line, in-article links to other articles, a quiz link | Articles are Simple English Wikipedia length, not written for a child; captions are automatic | Contents list on long articles (F-013); strip never shows empty frames offline (F-016) | article journey: contents link, 8 in-article links |
| Table of contents | Present now | Close | Only for articles with three or more headed sections | Added "In this article" (F-013) | `article.test.tsx` |
| Word lookup by double click or tap | Present | Close: click a word, a side card gives the meaning from the bundled WordNet (online Wiktionary as a fallback) | Words with no entry show a gentle "no meaning" card | None needed | double-click journey: card shown |
| Search that suggests as you type | Present now | Close: results appear after 220 ms of typing; a word's meaning shows beside the hits | The header box still goes to the Search screen on Enter | Find-as-you-type (F-011) | `search.test.tsx` |
| Browse by subject | Present | Close: 11 subject walls | none | none | 11 subjects crawled at both widths |
| Browse A to Z | Present now | Close: letters, then every article under the letter | Letters list only articles in the bundled packs, not every Wikipedia title | Added (F-012) | `search.test.tsx`, journey |
| Media: a gallery to wander | Present | Close: filters by subject and kind, search, surprise pile, large view with next and previous, author and licence for every picture | Captions are automatic; 11% were cut off with an ellipsis before batch 1 (D-14) | Package C of fix batch 1 rewrites the worst (see `fix-batch-1-report.md`) | 28 Pictures controls per width |
| Atlas you can spin and pan | Present | Close: drag to turn, wheel to zoom, pick a country, land on its page with facts, flag and map | Facts card shows population with its year (some are years old) | None (the year label is honest) | atlas journey: 12 countries from every continent, spin, zoom |
| Timeline with a jump to the article | Present | Close: ruler, filters by subject and continent, centuries, "Read about" links | Entries are generated sentences | Short form "Born 4 February 1900." under the name and year (D-23) | timeline journey: every chip, note link |
| Games and learning: the Castle, quizzes with hints and proof | Present | Close in shape: rooms, hint ladder, proof sentence | Quizzes are 95% fill-the-gap, and rung one of the hint ladder named the answer in 96% of questions (D-1, D-4) | Batch 1 package A (see report) | 250 quiz controls per width, six quizzes played to the result |
| Progress that is remembered and can be reset | Present now | Close: stamps, rooms, scores kept on the device | Reset did not exist | "Start my stamp book again", two taps (F-014) | `stamps.test.tsx` |
| Guided tours | Present | Close: stop by stop with the globe turning | Three tours | none | 3 tours stepped to the end |
| On this day | Present | Close: real dates from Wikidata, tested for 1 Jan, 28 Feb, 15 Mar, 4 Jul and 31 Dec | Mostly births | none | home journey: 3 notes on each date |
| Dictionary | Present | Close: word cards and Search show meanings offline | Only English | none | offline-check: "delta" resolves offline |
| Works with no disc | Present | Close: after the first visit the whole library but the extra pictures works in airplane mode in the browser; the desktop app has everything | A web visitor must look at a picture once, or press "Save all pictures", for it to be offline | One true statement everywhere; pictures left out with one note (F-001, F-016) | `offline-check` 20 steps; crawl with 60 articles offline |
| Sound | **Missing, by choice** | n/a | No narration or music. A known difference from the era | No third-party audio was added | none |

## Three places that still felt like a website, and what was done

1. **No find-as-you-type, no A to Z.** A site waits for Enter; an encyclopedia on a disc answers as you type and lets you
   flip through the alphabet. Added both (F-011, F-012).
2. **Long articles were one long scroll.** A printed or CD-ROM article has a contents list. Added "In this article" (F-013).
3. **Offline looked like a failure.** A row of blank frames read as "broken", which no disc ever did. Pictures that are not
   on the device are now left out with one line, and "Save all pictures" gives the visitor the whole disc in one tap (F-001, F-016).

## Still weaker than the real thing (not fixed, said plainly)

- No audio and no video clips. The CD-ROMs had both; adding third-party media was out of scope.
- The content is a free Wikipedia in Simple English, not an editorial team's work; the quizzes are generated by rules.
- The header search box submits to the Search screen instead of dropping a list under the box.
