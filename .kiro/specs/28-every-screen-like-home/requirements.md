# Requirements: 28-every-screen-like-home

Source: `docs/design-pass.md` (owner, 18 Nov). Home is the bar: a coral photo table, big prints of different sizes that
overlap and tilt, tape and pins, handwritten notes with arrows, doodles, sticky notes, torn edges. Most other screens use one
recipe (two-strip headline on graph paper, a row of pill chips, a uniform grid or list), which reads as generated UI. This spec
replaces that recipe screen by screen. `.kiro/steering/design.md` still rules. Submission: Sunday 22 Nov.

## Req 1. The test for every screen
Each screen passes only if, beside Home at the same width:
1.1 The main content is not a uniform grid of same-size cards and not a bare list of links.
1.2 The first screen has at least three sizes of object, something overlapping, something tilted, and something handwritten that
    says a true thing about what is on the screen.
1.3 The first screen is full: no large empty area at 1440 px (at most 40% of the first 1440 x 900 viewport is empty page
    background); on a phone the content comes first, not furniture.
1.4 The screen has its own table colour or band from the palette.
1.5 A child can tell what to do without reading a paragraph.
1.6 Rule 7 holds: navigation, body text, buttons and form fields stay straight, calm and accessible; decoration is `aria-hidden`;
    reduced motion is respected; targets are at least 44 px.

## Req 2. Screens, in order of value
2.1 Quiz play: a navy game board; the question on a large pinned index card at a slight angle; four answers as big paper tickets
    (2 x 2), a two-ticket card for true or false (spec 27); the hint ladder as three drawn bulbs (two for true or false);
    progress as stamps that ink in; the subject's lead print taped to the side; "Right!" as an inked stamp with the proof on a
    torn slip, "Not yet" in words; the result as a certificate with the stamps and two next quizzes as prints. On a phone the
    question is at the top and the tickets need no scroll past furniture.
2.2 Quizzes index: a quiz shelf: a big "Quiz of the day" print, "Surprise me", one overlapping pile of prints per subject on a
    coral table, the countries as continent stamp sheets; find-a-quiz at the top; the full A to Z behind one "Show every quiz"
    control as chips.
2.3 Article: a scrapbook spread: headings on paper strips; extra pictures taped between sections at different sizes on
    alternating sides; facts as an index card (flag and locator map for countries); two or three "Did you know" sticky notes from
    the article's own sentences; the word lookup as a torn dictionary slip; "Keep exploring" as overlapping prints, the quiz as a
    ticket. The reading text stays one calm column, dark on white.
2.4 Subjects: Home's "Step into a subject" at full size, varied overlapping prints, a handwritten question and the article count.
2.5 Subject: a hero collage, the articles in labelled clusters with one featured print large, quiz progress as drawn objects,
    never a grey blank.
2.6 Timeline, Stamp book, Tours, Search, Castle, Atlas, Not found: as `docs/design-pass.md` describes. Pictures and Credits keep
    their current design.

## Req 3. Constraints
3.1 No new dependencies, fonts or stock art; first-load budget 300 KB; offline behaviour, suitability gate, axe 0 serious, and
    every crawl journey keep working (journeys updated where controls move).
3.2 Before and after contact sheets at 1440 and 390 px in `docs/final-review/design-pass/`.
3.3 An independent `awari-design-reviewer` round marks each screen pass or fail against Req 1 and names the two weakest; fails
    are fixed and the round repeated once.
3.4 The owner is told REDEPLOY NOW after each screen group is green.
