# Design check: 22-review-3 (done by the main session, not by a crew member)

The crew run `8b50276e` (`awari-design-reviewer`) failed with "Request exceeds the maximum allowed size"
when handed 40 full-page screenshots. This check was done by the main session instead, on the retaken
screenshots in `docs/screenshots`, each opened at 1440 px (the 390 px screens were checked for horizontal
overflow by script: 0 px on all 20, and by eye on Home, Subjects and Castle). It is therefore not an
independent review.

| Req | Result | Evidence |
| --- | --- | --- |
| 1-3 On this day | Fixed | Home shows three real events for 13 November, "Coming up" only in a third slot; all 366 days have two events (`on-this-day.property.test.ts`) |
| 4 Subjects | Fixed | `subjects-1440.png`: cover prints with tape, hand labels, counts from the packs |
| 5-7 Stamp sheets, Atlas | Fixed | `stamps-1440.png`, `atlas-1440.png`: six sheets in a 3 x 2 grid; 24 px between picker and facts note |
| 8-10 Home | Fixed | Castle panel is a drawn door; no repeated photo on six days (test); hero arrows start below the note text |
| 11-12 Population, empty sections | Fixed after a miss | The first pass missed the Nigeria lead sentence ("232,679,478 people"); found while reading `article-countries-nigeria-1440.png`; fixed and tested |
| 13 Search | Fixed | `search-q-rhodes-1440.png`: snippets end at a word with an ellipsis, no coordinates |
| 14-16 Timeline | Fixed | `timeline-1440.png`: coloured by kind with a legend, year above title, births 23 of 59 |
| 17-18 Tours | Fixed | `tours-1440.png`, `tours-rivers-1440.png`; `scripts/check-tours-layout.ts` |
| 19 Castle | Fixed | `castle-1440.png`, `castle-asia-1440.png`: a print per wing, "next!" label inside the wall |
| 20-22 Quiz, wildlife, Nigeria lead | Fixed | `quiz-countries-nigeria-1440.png` shows tape; wildlife bat and hummingbird are single animals |
| 23 Generated numbers | Fixed | the gate refills them and fails on stale content numbers |

Still weak, for a human eye: the Nigeria lead is a very wide panorama (800 x 213) that crops to a strip in
a print; the Subjects, Stamp and Quiz screens are better than review 2 but are still arranged in grids.
