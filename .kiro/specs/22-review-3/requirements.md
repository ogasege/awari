# Requirements: Review 3 (what was still wrong after review 2, 13 Nov)

Source: `docs/review-3.md` and `docs/kiro-evidence/crew/design-review-review-2.md`
(items N3 to N7, N9, N11 to N14, N16 to N18 and the PARTLY items 4, 6, 7, 9, 10, 11, 12).
Guardrails: no push, no deploy, no `terraform apply`, no spending.

## Requirements

### On this day
1. EVERY day of the year, including 29 February, SHALL have at least two events of its own in
   `timeline.json`, each with a date checked the same way as the rest of the pack.
2. A test SHALL fail if any of the 366 days has fewer than two events.
3. "Coming up" cards SHALL fill only a third slot, never one of the first two.

### Subjects, stamp book and Atlas
4. `/subjects` SHALL show each subject as its cover print with a handwritten label, in the Home
   style, with the count taken from the data and no sentence that states a number by hand.
5. The stamp book SHALL show each continent as a small stamp sheet: its found stamps and blank
   perforated slots, in a grid that never leaves one continent alone on a row.
6. The Atlas SHALL use the same stamp-sheet component as the stamp book.
7. THE Atlas SHALL not leave a gap of more than 60 px between the picker and the facts note.

### Home
8. THE castle panel SHALL show a castle or a door, never the flag poster or the hero Earth.
9. NO page SHALL show the same photograph twice; a test SHALL check Home on several days.
10. THE hero notes' arrows SHALL not cross their own text (N3, N4).

### Article, search
11. EVERY country article SHALL give one population figure with its year and source, or label two
    figures clearly.
12. THE pack build SHALL drop a section with a heading and no content; a test SHALL fail on one.
13. Search snippets SHALL end at a sentence or word boundary with an ellipsis, SHALL not start
    mid-word, and SHALL not contain raw coordinate strings.

### Timeline
14. Timeline cards SHALL be coloured by kind of event, with a legend that says what the colours mean.
15. THE year SHALL sit above the title on each card, and the ruler SHALL not bunch 1000 to 1800.
16. BY DEFAULT the births SHALL be fewer than 40% of the cards shown in a century.

### Tours, castle, quiz, wildlife, lead photos
17. Tour cards SHALL have equal height, a print each, and no doodle that points at nothing (N5).
18. THE tour globe outline SHALL be centred on the globe and the stop strip SHALL sit under it
    without a blank gap (N6).
19. Castle wing cards SHALL each carry their own print; the doors SHALL fill their card; the Asia
    page SHALL centre its doors at a larger size and use an arrow with a label (N11, N12).
20. THE quiz card SHALL carry tape or a doodle, and the disabled button SHALL keep a readable
    contrast (N10).
21. Wildlife prints SHALL use a single-subject photograph, not a multi-photo collage (N17).
22. Lead photos on the judges' path that the reviewer called weak (Zuma Rock for Nigeria) SHALL be
    replaced by a clear one.

### Generated numbers and evidence
23. `submission-check` SHALL regenerate `docs/generated/stats.json` and fail when the README or
    write-up differ from it.
24. THE batch SHALL run through the conductor and the three crew members, and the post-batch
    workflow SHALL be run at the end; what could not be used SHALL be stated in
    `docs/kiro-evidence/crew/README.md`.
