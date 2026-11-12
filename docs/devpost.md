# Awari: Devpost write-up

**Category:** Resurrection
**Tagline:** The 1990s CD-ROM encyclopedia, brought back as a free web app that works in airplane mode.

> Before submitting, fill the three placeholders: `[LIVE URL]`, `[GITHUB URL]`
> and `[VIDEO URL]` (see `docs/runbook.md`).

## Inspiration

Awari is inspired by Encarta and the CD-ROM encyclopedias of the 1990s. I
wanted to know why they felt so good. Three things stand out. The whole library
sat on a disc, so it worked with no network. One thing led to another: a photo,
a map, a word you did not know. And it was playful, with quizzes and games
tucked between the articles.

Today, curious children in many places have a phone, a patchy connection and
the largest encyclopedia ever written, and still cannot reliably use it. So the
resurrection is not nostalgia; it is the disc's best ideas, made free, open and
small enough to carry. *Awari* is Yoruba for discovery.

## What it does

- **Photo-led articles** on 197 countries (all 54 of Africa's) and 12
  electricity topics, from Simple English Wikipedia. Tap any word and a side
  card shows its meaning from Open English WordNet.
- **An atlas globe** you can spin, built from Natural Earth shapes. Open a
  country and see its Wikidata facts, its article and its quiz. Countries you
  open become **postage stamps**, counted out of Africa's 54.
- **Quizzes with a hint ladder.** Five questions per article, three hints each:
  a nudge, where to look, then two wrong answers removed. After a right answer
  the exact sentence from the article that proves it is shown, so the quiz
  sends you back to the text. Right and wrong are always said in words.
- **The Castle**, a room-by-room trivia game on the same question bank. Each
  correct answer lights the next of twelve rooms.
- **A timeline** of 123 dates, filterable by subject, and **On this day**.
- **Offline.** A hand-written service worker saves the whole site. After one
  visit, every feature works in airplane mode, and the header says honestly
  whether the site has been saved yet.
- **An optional quiz service** (AWS Lambda calling Amazon Bedrock) that makes
  questions for articles outside the packs and checks every one against the
  article text before a student sees it. The app never depends on it.

## How we built it

Awari is React 19, TypeScript and Vite, with no UI framework: the scrapbook
look (photo prints with tape and pins, paper strips, wobbly SVG doodles,
torn edges) is a small set of hand-made components. First-load JavaScript is
268 KB of the 300 KB budget; packs load on demand.

Content is built by one command, `npm run packs`, from open data into static
JSON: 197 country articles, 12 physics articles, 66 licence-checked Commons
photos, 9,007 dictionary lemmas, 177 atlas shapes, 205 quizzes (994
questions) and 123 timeline events. Every record carries its source and
licence, and a validator fails the build if one does not.

Infrastructure is Terraform: a private S3 bucket behind CloudFront (HTTPS
only, SPA fallback, cache tiers) and, optionally, one least-privilege Lambda
behind the same CloudFront domain. No servers. 13 Terraform tests run with
mock providers and no credentials.

## How we used Kiro

Everything was built spec-first with Kiro, and `docs/kiro-log.md` is a dated
record of what drove each piece of work. Concrete examples:

**Specs.** Thirteen specs in `.kiro/specs/`, each with EARS requirements,
numbered acceptance criteria and a design that derives **correctness
properties**. 87 tests are named for a property and the requirements they
cover. Properties caught real mistakes:

- *05-quizzes, Property 6* ("a hint never gives away the answer") caught year
  nudges such as "the 1960s" that contained the answer. The nudges are now
  written in words, and the property guards every generated question.
- *06-castle 2.2*: the component test for completing a twelve-room wing
  found that the last answer hid its own "Right!" and proof sentence behind
  the finish panel. Fixed before it reached a student.
- *07-timeline, Property 4* ("an item with two different day dates yields
  nothing") makes the pipeline refuse to guess. Wikidata gives Isaac Newton
  and Edward Jenner two birth days each (old and new style calendars), so
  they are left off the timeline instead of shown with a possibly wrong date.

**Steering.** `design.md` holds the art-direction brief word for word and was
the standing rule for every screen: photos as prints, headlines on strips,
straight calm body text, hover straightens and lifts, nothing else moves.
`hackathon-rules.md` turned the hard rules into a script, `npm run rules`,
which fails the build if `.kiro` is ignored, the licence is not MIT, or the
inspiration's name appears more than once in plain words.

**Hooks.** Five agent hooks: lint and tests on save; a credits check when a
bundled photo or data file changes; a Kiro-log entry when a spec task is
ticked; and a hard-rule guard when the agent stops. A security review pass
(logged on 2026-11-11) made the Home "demo reset" ask before clearing a
student's progress.

**Chat-driven coding.** The brief became specs, specs became tasks, and each
task became a commit named `<spec> <task>: <summary>`. Course corrections
happened in conversation and are in the log: the first Home margin notes
included facts (a lemur, "smoke that thunders", a 4,500-year claim) that were
not in the articles they pointed to. Kiro rewrote them so that **every
handwritten fact has an exact proof sentence from its article**, and a test
fails if the sentence goes missing. For the timeline, a whole-Wikidata query
timed out and returned unreviewed items, so the design changed to a curated
list whose dates are read from Wikidata and whose sentences are fixed
templates: true by construction.

## Challenges

- **Honest content.** Children's reference needs to be right. Every fact in a
  handwritten note, every quiz answer and every timeline sentence is traceable
  to a source sentence or a Wikidata field.
- **Open data is messy.** Country "inception" is not independence (Nigeria's is
  1963, the year it became a republic), so Nigeria is absent from the
  independence days rather than shown wrongly. Some Wikidata labels exist only
  through a shared language code and had to be fetched with language fallback.
- **Offline for real.** The service worker saves 569 files, fails the install
  whole if any is missing, and `npm run offline-check` proves it by switching
  a real browser offline and opening every feature.
- **Looking made by a person.** A grid is easy; a desk is not. Each screen was
  designed before it was built and checked against one question: could a
  template have made this?

## What's next

- More packs: more sciences, history, and local-language editions (Yoruba,
  Swahili, Hausa) using the same pipeline and the same licence checks.
- A teacher mode: share a quiz set as a link, work offline in a classroom.
- Search over full article text (today it covers titles, summaries, events and
  words).
- Use the quiz service to grow the question bank, with every question still
  checked against its article.

## Built with

React, TypeScript, Vite, d3-geo, fast-check, Vitest, Playwright, Terraform,
Amazon S3, Amazon CloudFront, AWS Lambda, Amazon Bedrock, Kiro.

## Links

- Live app: [LIVE URL]
- Code (MIT): [GITHUB URL]
- Video: [VIDEO URL]
