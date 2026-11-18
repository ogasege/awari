# Design pass brief (spec 28-every-screen-like-home)

Owner's words, 18 Nov: "I want this to feel very, very engaging for the users, very fun, none of
the boring stuff. The home page with 'Step into a subject' is fantastic. Make sure all of the
pages are like that." He does not want any screen that looks like generated UI.

I looked at every screen of the live site at 1440 px on 18 Nov, side by side with Home. Home is
the bar: a coral photo table, big prints of different sizes that overlap and tilt, tape and pins,
handwritten notes with arrows, doodles, sticky notes on a drawn ruler, torn edges, things crossing
from one band into the next. Most other screens fall back to one recipe: the two-strip headline on
graph paper, a row of pill chips, then a uniform grid or a list. That recipe is what reads as
generated. This spec replaces it, screen by screen. `.kiro/steering/design.md` still rules; this
brief says what each screen must become.

Target: the owner submits by the end of this week (Sunday 22 Nov). Work in parallel: one
`awari-builder` crew member per screen group below, each on its own files, the main session
integrating and running the gates. Label the parallel runs with Iron Man suit names (Mark 3,
Mark 42, Hulkbuster, and so on); that is how the owner names agents. Record every run in
`docs/kiro-evidence/crew/README.md`.

## The test for every screen

Put the screen beside Home at the same width. It passes only if all of these are true:

1. No uniform grid of same-size cards and no bare list of links as the main content.
2. At least three sizes of object on the first screen, something overlapping, something tilted,
   something handwritten that says a true thing about what is on this screen.
3. The first screen is full: no large empty white area at 1440 px, and on a phone the first
   thing is the content, not furniture.
4. The screen has its own table colour or band, chosen from the palette, so that moving between
   screens feels like turning to a different page of a scrapbook, not reloading a template.
5. A child can tell what to do without reading a paragraph.
6. Rule 7 still holds: navigation, body text, buttons and form fields stay straight, calm and
   accessible; decoration is hidden from screen readers; reduced motion respected; 44 px targets.

## Screen by screen

**Quiz (the play screen) — worst offender, highest value.** Today it is a form on an empty white
page. Make it a game table that fills the screen: a dark board (navy), the question on a large
index card pinned at a slight angle, the four answers as big paper tickets in a 2 x 2 (with a
flag or photograph on each when the question has them), the hint ladder as three drawn light
bulbs you can tap, progress as five stamps along the top that ink in as you answer, the lead print
of the subject taped to the side. A right answer gets an inked "Right!" stamp and the proof on a
torn slip; a wrong one a gentle "Not yet" in words. The result screen is a certificate card with
the stamps earned and two next quizzes as prints. On a phone the question is at the top and the
tickets stack 2 x 2 or 1 x 4 without scrolling past furniture.

**Quizzes (the index).** Today: 9,300 px of text links. Make it a quiz shelf: a big "Quiz of the
day" print, "Surprise me", then one overlapping pile of prints per subject (the subject covers)
on a coral table, each pile opening its quizzes as prints, and the countries as continent stamp
sheets with flags. Find-a-quiz stays at the top. The full A to Z list sits behind one "Show every
quiz" control as small chips, not as the page.

**Article.** Today: a narrow Wikipedia column with an empty right side. Make it a scrapbook
spread: section headings on paper strips; the extra pictures taped in between sections at
different sizes, alternating sides (not only one strip at the top); the facts as an index card
with the flag and locator map for countries, a specimen card for animals, a mission card for
spacecraft; two or three "Did you know" sticky notes taken from the article's own sentences; the
word-lookup as a torn dictionary slip; and at the end "Keep exploring" as overlapping prints of
related articles, the quiz as a ticket, and the place on a small globe when it has one. The
reading text itself stays one calm column, dark on white.

**Subjects.** Today: twelve small same-size polaroids in a grid. Make it Home's "Step into a
subject" at full size: big overlapping prints of varied sizes on the coral table, each with a
handwritten question about that subject and its count of articles.

**Subject (for example Space).** Today: a uniform grid, with grey blanks while pictures load. Make
it a board: a hero collage of the subject's best pictures; the articles in small themed clusters
with a handwritten label each (for Space: planets, other worlds, people and machines), one
featured print large; quiz progress as drawn objects; never a grey blank (use the SafeImg paper
placeholder).

**Timeline.** Today: three rows of chips and a grid of boxes. Make it a walk: one long drawn ruler,
notes pinned above and below it alternately at slight tilts, a photograph print wherever the event
has an article, coloured bands for eras, and the filters reduced to one quiet row. "On this day"
uses the tear-off calendar from Home.

**Stamp book and continent pages.** Today: grey grids. Make it an album: cream album paper with
photo corners, perforated stamps showing the country's lead photograph once found and its outline
before, a faint hand-drawn continent map behind each page, postmarks for progress.

**Tours.** Today: three small cards and an empty page. Make each tour a travel poster with its
route drawn across a map strip and its stops as pins and luggage tags; fill the page.

**Search.** Results as index cards with a thumbnail print, the best match large; the empty state
with A to Z as paper tabs; the word meaning as a torn dictionary slip.

**Atlas.** The globe is good. Under it, use the album treatment from the stamp book and show
recently opened countries as prints.

**Castle.** The idea is good but six identical door grids repeat. Give each wing its own colour,
door shape and landmark print, and show the castle as a hand-drawn floor plan a child can tap.

**Pictures, Credits, Not found.** Pictures is already close to Home; keep it. Credits stays plain
tables on purpose. Not found gets a drawn map with an X and real links.

## How to work

1. Spec first: requirements, design (per screen: the first-screen composition at 1440 and 390, the
   objects, their sizes, colours from the palette, what is handwritten), tasks. One property per
   screen from "The test for every screen" where it can be checked in code (for example: the main
   content is never a uniform grid; no first screen has more than 40% empty area at 1440).
2. No new dependencies, no new fonts, no stock art: use the pictures and drawing styles already in
   the app. Keep the first-load budget (300 KB), the offline behaviour, the suitability gate, axe
   at 0 serious, and every journey in the crawl working (update the journeys where controls move).
3. Before and after contact sheets for every screen at both widths in `docs/final-review/design-pass/`.
4. Then an independent round by `awari-design-reviewer`: for every screen, pass or fail against
   "The test for every screen", with the two weakest named. Fix the fails. Repeat once.
5. Order by value if time runs short: Quiz, Quizzes, Article, Subjects, Subject, Timeline, Stamp
   book, Tours, Search, Castle, Atlas.
6. Finish spec 27-quiz-variety first only where it is already half built; its remaining tasks and
   this spec run side by side (the Quiz play screen must show the new question shapes well: flags
   and photographs on the tickets, a two-button card for true or false, a drawn ruler for which
   came first).
7. Say REDEPLOY NOW after each screen group is green, so the owner can look at the live site as it
   improves.
