# Video script: Awari in 2 minutes 55 seconds

**Length:** exactly 2:55, under the three-minute limit. **Voice:** warm, quick, curious.
**Rules:** no third-party logos, no copyrighted music (silence under the voice, or an original
tune), nothing on screen that is not Awari, Kiro or your own terminal. Rows marked **[KIRO]** show
Kiro at work: together they run 50 seconds (the minimum is 40). Upload as public or unlisted.

**Before recording:** `npm run build && npm run preview`, open the site once and wait for the
badge to say "Works offline". Seed reference stamps with `/?demo=reference` (it asks first).
Screen 1440 × 900, zoom 100%. Record the Kiro rows from the real project folder; open the Kiro
Crew session and the files named, do not stage anything that did not happen.

## Shot list

| Time | Shot | Voice-over | Notes |
| --- | --- | --- | --- |
| 0:00 – 0:10 | Black. A hand-drawn star, then the Awari logo on its yellow label. | "When I was a kid, a whole encyclopedia fit on one shiny disc, and it worked with no internet at all." | Logo from `design/logo/awari-logo.svg`, unchanged. |
| 0:10 – 0:25 | Home: photo prints, paper strips, margin notes. Scroll to the stamp book. | "Awari brings that back: a free encyclopedia for the whole world, built like a scrapbook, that keeps working when the internet doesn't." | Hover one print so it straightens and lifts. |
| 0:25 – 0:55 | Search "okapi"; open the result from Wikipedia. Tap a word; the side card opens. Then open Nigeria, "Find it on the globe": the facts card pins and a stamp appears. | "Search anything and it opens, photo, credits, quiz and all, and it's saved for later. Tap any word for its meaning. Open a country on the globe, and it becomes a stamp in your book." | Online for this shot. |
| 0:55 – 1:15 | Nigeria quiz: nudge, where to look, take away two; answer; "Right!" with the proof slip. | "Every question has three hints: a nudge, where to look, then two wrong answers disappear. When you're right, you see the sentence that proves it." | Pause on the proof slip. |
| 1:15 – 1:30 | Tours: "Great rivers of the world". Next stop twice: the globe turns to the Amazon, then the Yangtze. | "Guided tours turn the globe from stop to stop: rivers, ancient wonders, volcanoes of the Ring of Fire." | |
| 1:30 – 1:45 | Castle: the Space wing, one answer, the next door lights. Then the timeline, filter "Oceania". | "Sixteen castle wings, a room for every right answer. And a timeline of the whole world." | |
| 1:45 – 2:00 | Airplane mode on (menu bar). Reload. Open an article, a quiz, the Okapi page read earlier. Badge: "Offline, still working". | "Now, no internet. After one visit, everything still works, even the page we read from Wikipedia a minute ago." | Show the Wi-Fi icon off. |
| 2:00 – 2:12 | **[KIRO]** The Kiro Crew session for this build, then `.kiro/specs/`, then `18-world-timeline/requirements.md`. | "I built it in Kiro, spec first. Twenty specs, each with requirements and numbered acceptance criteria, written before the code." | Scroll slowly. |
| 2:12 – 2:26 | **[KIRO]** `18-world-timeline/design.md` Property 2 beside its test; run `npx vitest run scripts/packs/timeline-world.test.ts`. | "Each requirement becomes a property, and each property a test. This one keeps a date out unless Wikidata agrees. It's why Nigeria's 1963 'inception' isn't shown as its independence day." | Terminal full width. |
| 2:26 – 2:40 | **[KIRO]** `.kiro/agents/`: run `kiro-cli chat --agent awari-licence-auditor` on the bundle, then show `docs/kiro-evidence/agents.md`. | "Custom Kiro agents did the narrow jobs: one builds with hooks that lint, test and check the hackathon rules; one audits licences; one reviews the design in a real browser." | Show one reply line. |
| 2:40 – 2:50 | **[KIRO]** `docs/kiro-evidence/hook-firings.jsonl` and `docs/kiro-log.md`. | "Every hook firing and every task is on the record." | Stop on two readable rows. |
| 2:50 – 2:55 | Back to Home. Logo. Text: "Awari. Free. Open. Works offline." | "Awari: discovery, for everyone." | End card. |

## Timing check

Rows run 0:00 to 2:55 with no gaps: 10 + 15 + 30 + 20 + 15 + 15 + 15 + 50 + 5 = 175 seconds.
`npm run submission-check` reads the table and fails if the rows do not add up to 2:55 or if the
[KIRO] rows total less than 40 seconds.

## Recording notes

- Record the voice-over last; trim a clause rather than speed up.
- Captions on: every line of voice-over is in the table.
- The inspiration (the 1990s CD-ROM encyclopedias) is only described, never shown: no logos,
  layouts or artwork from any product.
