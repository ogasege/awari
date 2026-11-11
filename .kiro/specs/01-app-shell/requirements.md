# Requirements: App shell and design system

## Introduction

The shell gives every Awari screen the same header, routes, design tokens
and hand-made scrapbook components, so each feature screen is assembled
from parts that already obey the design steering
(`.kiro/steering/design.md`). Home is the first screen built with them and
must match `design/home.png` at 1440 px wide.

## Glossary

- **Print**: a photo shown as a physical photograph (white border, slight
  rotation, tape or pin, handwritten caption).
- **Strip**: a hand-cut paper strip carrying a headline, with a hard
  offset shadow.
- **Deco**: anything purely decorative (doodles, margin arrows, tape).
- **Phone width**: a viewport narrower than 900 CSS pixels.

## Requirements

### Requirement 1: Shared header and navigation

**User story:** As a student, I want the same header on every screen, so
that I can always get to the atlas, timeline, castle and quizzes.

1. THE App SHALL render one header containing the Awari logo from
   `design/logo/awari-logo.svg`, links to Explore (Home), Atlas, Timeline,
   Castle and Quizzes, a search field and a "Works offline" badge.
2. WHEN the current route matches a navigation link, THE header SHALL mark
   that link with `aria-current="page"` and a wobbly underline.
3. THE header links, search field and badge SHALL be straight (not
   rotated) and reachable with the Tab key in visual order.
4. WHEN the viewport is at phone width, THE header SHALL wrap so that no
   link or field overflows horizontally.

### Requirement 2: Routing

**User story:** As a student, I want each screen to have its own address,
so that I can bookmark and share it and use the back button.

1. THE App SHALL map `/`, `/atlas`, `/article/:pack/:id`,
   `/quiz/:pack/:id`, `/castle`, `/castle/:wing`, `/timeline` and
   `/stamps` to their screens.
2. WHEN the student follows an in-app link, THE App SHALL change the
   address with the History API without a full page load.
3. WHEN the student presses the browser back button, THE App SHALL show
   the previous screen.
4. IF a path matches no route, THEN THE App SHALL show a "page not found"
   screen with a link back to Home.
5. WHEN the screen changes, THE App SHALL move focus to the new screen's
   main heading and update `document.title`.

### Requirement 3: Design tokens

**User story:** As a developer, I want the Lagoon palette and type scale
defined once, so that every screen stays on brand.

1. THE design system SHALL define CSS custom properties for every Lagoon
   colour in the design steering (teal, coral, yellow, navy, teal ink,
   tomato, paper, ink) and for the three font families.
2. THE design system SHALL self-host Bricolage Grotesque 800, Figtree and
   Covered By Your Grace so text renders the same offline.
3. Every text and background colour pair used for body text, buttons and
   links SHALL meet WCAG AA contrast (4.5:1, or 3:1 for text 24 px and up
   or 18.66 px bold and up).
4. Long reading text SHALL be dark ink on white paper.

### Requirement 4: Hand-made components

**User story:** As the art director, I want reusable scrapbook pieces,
so that every screen looks assembled by a person at a desk.

1. THE design system SHALL provide Print, Strip, Tape, Pin, MarginNote,
   Doodle (star, arrow, circle, sparkle), TornEdge, Button, Stamp and
   HandUnderline components.
2. THE Print and Strip components SHALL accept a rotation, and Print
   SHALL keep its rotation between 2 and 5 degrees in either direction.
3. Doodles and torn edges SHALL be drawn as wobbly SVG strokes generated
   from a seed, so the same seed always draws the same shape and two
   different seeds draw different shapes.
4. Every Deco element SHALL carry `aria-hidden="true"` and SHALL be
   hidden at phone width when marked `crowding`.
5. WHEN the pointer hovers a Print or Strip, or it receives keyboard
   focus, THE component SHALL straighten to 0 degrees and lift; no other
   animation SHALL run.
6. WHILE the user prefers reduced motion, THE components SHALL change
   state without transitions.
7. Every focusable element SHALL show a visible focus outline.

### Requirement 5: Home screen

**User story:** As a student, I want an inviting Home, so that I want to
start exploring.

1. THE Home screen SHALL show, in order: the "What will you discover
   today?" hero with the Earth print and margin notes; "Step into a
   subject" with five photo prints; "On this day"; "Your stamp book";
   "Learn by playing" (castle and today's quiz); and a credits footer.
2. AT 1440 px wide, THE Home screen SHALL match the composition of
   `design/home.png` (section order, colours, photo placement and
   rotation, strip headlines, notes and doodles).
3. AT phone width, THE Home screen SHALL reflow to a single column with
   no horizontal scrolling and no decoration crowding the content.
4. Every handwritten fact on Home SHALL be true and SHALL name the
   article (or credited source) it is checked against.
5. THE footer SHALL credit every photo shown on the screen with author
   and licence, and credit Wikipedia text under CC BY-SA.

### Requirement 6: Performance budget

1. THE first load SHALL ship under 300 KB of JavaScript (uncompressed),
   measured from the built `index.html`, before any pack is fetched.
2. Screens other than Home SHALL be code-split and loaded on demand.
