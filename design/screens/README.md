# Screen designs: Atlas, Article, Quiz, Castle, Timeline

Designed in the style of `design/home.html` before any of them was built
(design steering: "Design the other five screens … in the same style
before building them"). Each screen keeps the same three surfaces as
Home: the teal **board** for headers and play, the coral **photo table**
for prints, and white or squared **paper** for anything read at length.
Every screen answers the template question at the end: what human touch
carries meaning, and what was removed.

Screenshots of the built screens live in `docs/screenshots/`.

---

## Article (`/article/:pack/:id`)

```
┌ board (teal) ─────────────────────────────────────────────────────────┐
│ header                                                                │
│  ┌strip┐ NIGERIA            ┌──────── lead print (tilt 3°, tape) ───┐ │
│  └─────┘ ┌yellow strip┐     │  photo                                │ │
│          │ Africa      │    │                         caption (hand)│ │
│  one-line summary (mist)    └───────────────────────────────────────┘ │
│  [Find it on the globe] [Take the quiz]      ↖ handwritten fact note  │
└~~~~~~~~~~~~~~~~ torn edge (the print crosses it) ~~~~~~~~~~~~~~~~~~~~~┘
  paper (white)
  ┌ reading column, 68ch, dark on white ─┐   ┌ index card: facts ────┐
  │ Lead paragraphs                       │   │ Capital  Abuja         │
  │ ## History (straight heading)         │   │ People   …             │
  │ …every word can be tapped…            │   └───────────────────────┘
  │                                       │   ┌ side card: word ───────┐
  │                                       │   │ delta (noun)           │
  │                                       │   │ a low triangular area… │
  └───────────────────────────────────────┘   │ [look up a word ____]  │
                                               └───────────────────────┘
  credit line: Simple English Wikipedia, CC BY-SA 4.0, photo author/licence
```

- Body text is never rotated; headings inside the article are straight.
- The side card is sticky on laptop and becomes a bottom sheet on phones.
- Keyboard users look up words with the field in the side card; tapping
  or clicking a word fills it.
- **Human touch that carries meaning:** each margin note is a real fact
  from this article, with a drawn arrow pointing into the text where the
  proof sentence sits. **Removed:** a decorative compass that pointed at
  nothing.

## Atlas (`/atlas`)

```
┌ board (teal, chalk grid) ─────────────────────────────────────────────┐
│ header                                                                │
│ ┌strip┐ Spin the globe          N of 54 African stamps (drawn stamps) │
│        ( globe: Natural Earth shapes, drag or arrow keys to spin )    │
│        discovered countries filled yellow, others teal ink outline    │
│ ← "drag me" chalk note                     ┌ pinned facts card ─────┐ │
│                                            │ NIGERIA  (strip)       │ │
│  country list (select) for keyboard users  │ capital, people, area  │ │
│                                            │ [Read] [Quiz]          │ │
└────────────────────────────────────────────└────────────────────────┘─┘
```

- The globe is an SVG orthographic projection. Arrow keys rotate it,
  Enter on the list selects a country; the list is the accessible twin.
- **Human touch:** discovered countries are coloured in like a child's
  map, with a little hand-drawn tick, so the globe itself is the progress
  record. **Removed:** a latitude/longitude readout.

## Quiz (`/quiz/:pack/:id`)

```
┌ paper (squared) ──────────────────────────────────────────────────────┐
│ ┌strip┐ Nigeria quiz        Question 2 of 5   ● ● ○ ○ ○ (drawn dots)  │
│ ┌ question card (straight) ────────────────────────────────────────┐  │
│ │ What is the capital of Nigeria?                                   │  │
│ │ ( ) Lagos   ( ) Abuja   ( ) Kano   ( ) Ibadan                    │  │
│ │ [Check answer]                                                    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│  hints left: three drawn light bulbs (lit = unused)                     │
│  [Hint 1: nudge] → [Hint 2: where to look] → [Hint 3: remove two]       │
│  ✓ Right! (word + tick)  "proof" sentence on a taped paper slip,        │
│    linked to the article section                                        │
└──────────────────────────────────────────────────────────────────────┘
```

- Right and wrong are always words ("Right!", "Not quite") plus a drawn
  tick or cross, never colour alone.
- **Human touch:** the proof sentence arrives on a torn slip of the
  article itself, taped under the answer: the quiz sends you back to the
  text. **Removed:** a score percentage; the drawn dots say enough.

## Castle (`/castle`, `/castle/:wing`)

```
┌ board (navy night) ───────────────────────────────────────────────────┐
│ ┌strip┐ The Castle   choose a wing: [Africa] [Electricity]           │
│  a drawn castle wall: 12 doors in a winding path, 3 rows of 4         │
│  lit doors glow yellow, the next door has a hand-drawn arrow "next!"  │
│ ┌ door question card (paper, straight) ─────────────────────────────┐ │
│ │ Room 6 of 12 · question, four answers, the same hint ladder       │ │
│ └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

- Progress is the drawn doors themselves (design rule 6).
- **Human touch:** each lit room gets the name of the country or idea it
  was about chalked over its door, so the wall becomes a record of what
  was learned. **Removed:** a timer.

## Timeline (`/timeline`)

```
┌ paper (squared) ──────────────────────────────────────────────────────┐
│ ┌strip┐ Timeline       subject chips: [All] [Countries] [Science] …   │
│  century ruler drawn as a wobbly line, year marks in handwriting      │
│  events as notes pinned above and below the line, alternating styles  │
│  (lined paper, teal note, yellow sticky), each with year + sentence   │
│  "On this day" band at the top shows today's events                   │
└───────────────────────────────────────────────────────────────────────┘
```

- Filters are straight, ordinary toggle buttons with `aria-pressed`.
- The list is real HTML (an ordered list), so it reads in order.
- **Human touch:** a hand-drawn "you are here" arrow marks today on the
  ruler. **Removed:** decade gridlines.
