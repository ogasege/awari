# Requirements: Review 2 (screenshot defects, 12 November)

## Introduction

The owner looked at every screenshot in `docs/screenshots/` and listed
fourteen defects in `docs/review-2.md`. Most are breaches of design
steering rule 3 ("a note shares a fact about *the thing* its arrow points
at") that the daily rotation introduced, plus four screens that "a
template could have made".

This spec covers the fixes. It does not change any feature's purpose; it
corrects what the screens say and show.

## Requirements

### Tour globe

1. THE tour globe SHALL draw its sea and its land from named design
   tokens, so no screen can render it as an unstyled black shape.
   WHEN the `/tours/:id` route is opened directly (no visit to `/atlas`
   first), the globe SHALL still be styled.

### Hero (Home)

2. EVERY note whose drawn arrow touches the Earth photograph SHALL state a
   checked fact about the Earth or about a place on the visible face of
   that photograph, AND SHALL carry the exact article sentence that proves
   it.
3. THE drawn circle SHALL be shown ONLY when the note it belongs to names a
   place that lies on the visible face of the photograph, AND SHALL be
   drawn at that place.
4. THE rotating "ever wondered" prompt SHALL be placed where it points at
   nothing: no arrow, no circle, outside the photograph.

### Subject pile (Home)

5. EVERY subject SHALL have one hand-picked cover photograph that a
   ten-year-old would recognise as that subject, held in a single reviewed
   list, with its Commons file, author and licence.
6. THE cover list SHALL be audited by `awari-licence-auditor` and every
   file in it SHALL already be credited in `CREDITS.md`.
7. A margin note SHALL only sit beside a print of the SAME subject.
8. A question note SHALL be grammatical English: WHEN a title needs an
   article ("the violin", "the Nile"), the prompt SHALL include it; WHEN a
   title names a process ("digestion"), the prompt SHALL read "how X
   works".

### On this day (Home)

9. AN event that is not today's SHALL carry a visible label saying it is
   coming up, with its date.
10. THE coming-up label SHALL NOT overlap the drawn years at any width from
    320 px to 1600 px.
11. EVERY doodle on "On this day" SHALL point at something it is about, or
    SHALL NOT be drawn.

### Castle panel (Home)

12. THE castle panel SHALL show a photograph that matches the wing its
    button opens, or a photograph of no particular place; AND the button
    text SHALL be grammatical ("Enter the Asia wing", not "Enter The Asia
    wing").

### Footer credits (Home)

13. THE Home footer SHALL credit exactly the photographs shown on the page
    that day, each with author and licence, and SHALL name no photograph
    that is not shown.

### Atlas

14. AT 1440 px THE globe SHALL be the largest thing on the screen and
    SHALL be at least 45% of the viewport width.
15. PROGRESS SHALL be drawn as a stamp sheet grouped by continent with the
    count per continent, not as one undifferentiated grid of squares.

### Subjects, stamp book and quiz

16. `/subjects`, `/stamps` and `/quiz/:pack/:id` SHALL each show at least
    one photographic print, one hand-cut strip, one piece of tape and one
    margin note that carries meaning; form controls, answers and body text
    SHALL stay straight and calm.

### Timeline

17. THE timeline SHALL show one century at a time, with controls to move
    to the previous and next century that holds events.
18. BY DEFAULT fewer than half of the cards shown SHALL be births, while
    the century holds enough events of other kinds.
19. THE page SHALL be under 12,000 px tall at 1440 px.

### Article lead photos

20. EVERY article on the judges' path in `docs/judges.md`, AND each of the
    thirty most populous countries, SHALL lead with a photograph of a
    recognisable landmark, place or subject of that article, held in the
    reviewed override list.

### Evidence

21. EVERY screenshot in `docs/screenshots/` SHALL be retaken at 1440 px
    and 390 px after the fixes, with no horizontal overflow and no console
    errors.
