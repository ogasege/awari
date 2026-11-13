# Design review of the retaken screenshots against docs/review-2.md

Reviewer: awari-design-reviewer. Read-only review of `docs/screenshots/` (32 files, 16 pages at 1440 and 390 px) against `.kiro/steering/design.md`.

Coverage: every 1440 image was opened. At 390 I opened home, atlas, tours-rivers-stop-2 and timeline. The other 390 files (article, castle, castle-asia, credits, quiz, search, stamps, stamps-oceania, subject-wildlife, subjects, tours) were NOT opened, so nothing below is claimed about them. Items 2 and 12 cannot be fully judged from screenshots alone.

## The 14 items

| # | Item | Verdict | Evidence and what I saw |
|---|------|---------|-------------------------|
| 1 | Tours globe black | FIXED | `tours-rivers-stop-2-1440.png`, `tours-rivers-stop-2-390.png`: pale-teal land on dark-teal sea, grid lines, red ring on the Amazon. Only one stop was retaken, so "every tour and stop" is not shown by the screenshots. |
| 2 | Open spec tasks (offline proof, home-world task 4) | NOT VERIFIABLE | Not visible in any screenshot. Every page shows "Not saved for offline yet", so no screenshot proves offline behaviour. |
| 3 | Hero notes vs Earth photo | FIXED | `home-1440.png`: Sahara note points at Africa, the Madagascar note circles Madagascar, the penguin note points at Antarctica. All are Earth facts, and the circle sits on the right place. |
| 4 | Subject covers | PARTLY | `home-1440.png`: Mona Lisa for Arts, flags for Countries, lion, Saturn, pyramids are all recognisable. Only 5 of 11 subjects are on the pile, so human body, inventions and famous people cannot be checked. `subjects-1440.png` shows no covers at all (see item 10). |
| 5 | Notes beside the wrong print | FIXED | `home-1440.png`: rackets note by "Arts, music and sport", platypus note by Wildlife, Mali note by Ancient worlds. All match the subject. The prompt grammar is not visible in any retaken screenshot. |
| 6 | On this day | PARTLY | `home-1440.png`: each card is labelled "Coming up: 14 November", the label is clear of the years, and the chart doodle is gone. `home-390.png`: the cards sit on top of the "Your stamp book" heading and its sentence (new defect N1). |
| 7 | Castle panel | PARTLY | `home-1440.png`, `home-390.png`: the button now reads "Enter the Europe wing" (capital fixed). The photo is the Apollo 17 Earth with black corners, the same image as the hero, so it is neutral but not a castle. |
| 8 | Footer credits | FIXED | `home-1440.png`: the credits name the Earth, Mona Lisa, flags, lion, Saturn and pyramids, which are all on the page. The quiz and stamp photos are deferred to article pages, as the footer says. |
| 9 | Atlas | PARTLY | `atlas-1440.png`: the globe is about 740 px of 1440 and the empty two thirds are gone. Progress is still about 197 grey squares in six white cards. `atlas-390.png`: the globe is about 300 px wide, small, and the squares are identical. |
| 10 | Subjects, Stamp book, Quiz boxes | PARTLY | `subjects-1440.png`: NOT FIXED. It shows 11 plain bordered boxes with one Space print in the corner. `stamps-1440.png`: the "Latest stamps" row is good, but the six continent boxes are still plain. `quiz-countries-nigeria-1440.png`: one print, but the question card is still a plain white rectangle. |
| 11 | Timeline | PARTLY | `timeline-1440.png` is 5,375 px (was 34,650), with century buttons and "A mix of 60 of the 289 events of the 1900s". In the rows I could see, births are still about half or more. `timeline-390.png` is 14,751 px. All cards are the same boxed grid with no prints. |
| 12 | Article lead photos | PARTLY | `article-countries-nigeria-1440.png`: the lead is now Zuma Rock, a real landmark. It is a dull overcast shot with a road and power lines. Other articles were not screenshotted. |
| 13 | Wildlife note | FIXED | `subject-wildlife-1440.png`: the note now reads "The baby elephant develops for 20 to 22 months inside its mother!" with the arrow on the elephant photo. |
| 14 | Retake all at both widths | FIXED | All 16 pages exist at 1440 and 390. Gap: no screenshot of any tour other than rivers stop 2, and none of the thirty-country lead photos. |

## New defects

- N1. `home-390.png`, On this day. The three sticky cards overlap "Your stamp book" and its sentence, so the text is unreadable. Fix: stack the cards in normal flow at 390 (no negative margins or absolute offsets) and give the section a min-height or bottom padding.
- N2. `home-1440.png` and `home-390.png`, Castle panel. The Apollo 17 photo has black corners, repeats the hero image, and the "The Castle" label covers its lower third. Fix: use a castle or door print, or crop away the black corners and use a different image from the hero.
- N3. `home-1440.png`, hero. The Madagascar note's arrow runs through the words "nowhere else". Fix: start the arrow from the end of the text block, below or beside it.
- N4. `home-1440.png`, Wildlife. The arrow of the platypus note strikes through the word "really" (the arrow starts on the text). Fix: start the arrow at the baseline of the last line, with 8 px of clearance.
- N5. `tours-1440.png`. The three cards have different heights, so the Start buttons do not line up. A stray teal arrow at the bottom left points at nothing. The right 340 px are empty. Fix: use equal-height cards with the button pinned to the bottom, remove or re-aim the doodle, and add a print per tour.
- N6. `tours-rivers-stop-2-1440.png`. The white hand-drawn globe outline is offset from the disc and cuts across the right edge, and the stop strip sits about 100 px below the section with a blank gap. Fix: centre the outline on the globe radius and tighten the spacing.
- N7. `subjects-1440.png`. The intro says "10 subjects" but there are 11 boxes. The handwritten line sits on the bottom edge of the yellow strip. Fix: use one count from data and add 24 px under the strip.
- N8. `stamps-oceania-1440.png`. The "Back to the whole stamp book" link is default browser blue. The page is 14 identical dashed "? Not found yet" boxes with nothing to hint at which country. Fix: style the link in teal ink and draw a perforated stamp outline with the country name hint (or a faint silhouette).
- N9. `stamps-1440.png`. Oceania wraps alone onto a second row of continent boxes. Fix: use a 3x2 grid or a single stamp sheet strip.
- N10. `quiz-countries-nigeria-1440.png`. The disabled "Check my answer" button is grey with white text, which is low contrast. About 120 px of empty grid paper sits under the card. Fix: use navy outline styling with dark text for the disabled state, and add one doodle or tape to the card.
- N11. `castle-1440.png`. The 12 wing cards are identical teal rectangles and the doors fill only the left third of each. Fix: widen the door grid to fill the card, or put a print per wing next to it.
- N12. `castle-asia-1440.png`. The doors are small on the left and the right 55% of the page is empty navy. A yellow "!" doodle by the first door looks like a glitch. Fix: centre the doors at a larger size, add an Asia print, and redraw the doodle as an arrow with a label.
- N13. `article-countries-nigeria-1440.png`. Quick facts says 211,400,708 people (2021) while the body says "over 232,679,478". The "Cities" heading is followed by one sentence and then nothing (the list is missing). The right column is empty from about y=1170 down. Fix: show one population figure with its year in both places, restore or remove the Cities section, and let the right column carry a second print.
- N14. `search-q-nile-1440.png`. Several snippets stop mid-sentence with no ellipsis ("Their", "Agatha", "Egypt"). The Nile Delta snippet starts with raw coordinates "117°E / 30.900; 31.117". There are no thumbnails or prints. Fix: cut at a word with "…", strip coordinates from snippets, and add a thumbnail to each article result.
- N15. `credits-1440.png`. The "Commons page" column is cut off at the right edge for every row (the URLs are clipped). The page is 34,039 px tall (36,213 at 390). Fix: use `overflow-wrap:anywhere` on the URL cells, and group or collapse the rows by licence.
- N16. `timeline-1440.png`. The "On this day, 13 November" card is an empty-state sentence. Card colour follows the column (white, blue, yellow) instead of the kind of event, and the year column leaves each card's left third blank. The "you are here" arrow lands on a ruler where 1000 to 1800 are bunched together. Fix: colour by kind (born, founded, country) with a label, put the year above the title, and show a small print or doodle on at least one card per row.
- N17. `subject-wildlife-1440.png`. The Bat and Hummingbird prints are multi-photo collages that read as noise at thumbnail size. Fix: pick a single-subject photo for each.
- N18. `atlas-1440.png`. About 150 px of empty teal sits between the country selector and the facts note at the default state. Fix: move the note up, or put the "Tap a country" prompt next to the globe.

## Template check

- Atlas, Subjects, Stamp book, Quiz, Castle, Tours and Search would still pass for a template (plain boxes in a grid). Items 9 and 10 stay open until at least the grey squares, subject boxes and wing cards carry prints.
- Timeline is only a template with a century filter on top.
- Home, Wildlife and the Tours detail page are the only screens that read as made by a person.
