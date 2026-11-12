# I rebuilt the 1990s CD-ROM encyclopedia as a web app that works in airplane mode

*Draft for the Kiroween 2026 blog-post bonus. Replace `[LIVE URL]` and
`[GITHUB URL]` before publishing. Suggested tags: `kiro`, `kiroween`,
`offline-first`, `react`, `aws`.*

When I was young, an entire encyclopedia came on one shiny disc. You put it in
the computer, and everything was just there: no loading, no connection, no
account. You could start at a photo of a volcano and end up, twenty minutes
later, in a quiz about rivers. I wanted that feeling back, for children who
today have a phone and a patchy connection, and the biggest encyclopedia ever
written that they can't count on.

So I built **Awari** (Yoruba for *discovery*) for the Resurrection category of
Kiroween 2026. It is a free web app for curious students: photo-led articles on
197 countries and the basics of electricity, a globe you can spin, quizzes with
hints that teach, a trivia castle, a timeline, and a stamp book that fills as
you explore. After one visit, all of it works with the network off. Try it:
[LIVE URL]. The code is MIT: [GITHUB URL].

## Three ideas I kept from the disc

**Everything is on the disc.** Awari's content is static JSON built from open
data (Simple English Wikipedia, Wikidata, Natural Earth, Open English WordNet,
Wikimedia Commons). A hand-written service worker saves all 569 files on the
first visit, and *fails the install whole* if any one is missing, so you never
end up with half an encyclopedia. The header badge says "Saving for
offline…" and then "Works offline" only when that is true. A script
(`npm run offline-check`) switches a real browser offline and opens every
feature to prove it.

**One thing leads to another.** Every article links to the globe and to its
quiz. Every word can be tapped for its meaning. Countries you open become
postage stamps in a stamp book, counted out of Africa's 54.

**Learning that feels like play.** Each quiz has five questions and three
hints: a nudge, where to look, then two wrong answers removed. When you get one
right, the app shows the exact sentence from the article that proves it. The
quiz sends you back to the text instead of rewarding guessing.

## How Kiro shaped it

I wrote almost no code before I wrote specs. For each of the 13 features Kiro
and I wrote requirements in EARS with numbered acceptance criteria, then a
design that turns them into **correctness properties**, then tasks. Each
property became a property-based test. 87 tests are named `Property N:`, and
they earned their keep:

- A property that says *a hint never gives away its answer* caught nudges like
  "the 1960s" when the answer was 1960.
- A component test for completing a twelve-room castle wing found that the last
  answer hid its own "Right!" and proof sentence.
- A rule that *every handwritten margin fact has an exact proof sentence in its
  article* showed that several of my first notes (a lemur, "smoke that
  thunders", a 4,500-year claim) were not in the articles they pointed at. They
  were rewritten, and a test now fails if the proof goes missing.

**Steering files** held my art-direction brief and the hackathon's hard rules.
The rules are code: `npm run rules` fails if `.kiro` is ignored, the licence
isn't MIT, or a banned name appears. **Hooks** run lint and tests on save,
check that every bundled photo is credited, and write a line to
`docs/kiro-log.md` whenever a spec task is ticked. That log, a dated record of
which spec, hook or steering file drove each piece of work, is my favourite
artifact of the project.

## Things that surprised me

- Wikidata's "inception" for a country is not its independence day. Nigeria's
  is 1963, the year it became a republic. I left Nigeria out of the
  independence list rather than show a wrong date.
- Some English labels exist on Wikidata only through a shared language code, so
  Marie Curie had no name until I asked for language fallback.
- A "template" look is easy to fall into. Every screen was designed first and
  tested against one question: *could a template have made this?*

## What's next

Local-language editions with the same pipeline and the same licence checks, a
teacher mode, and search over full article text. If you build on Awari, the
whole pipeline (`npm run packs`) is open, and every record carries its source
and licence.

Thank you to the volunteers behind Simple English Wikipedia, Wikidata, Natural
Earth, Open English WordNet and Wikimedia Commons. Awari is theirs.
