# Video script: Awari in 2 minutes 55 seconds

**Length:** exactly 2:55, under the three-minute limit. **Voice:** warm, quick, curious.
**Rules:** no third-party logos, no copyrighted music (silence under the voice, or an original
tune), nothing on screen that is not Awari, Kiro or your own terminal. Rows marked **[KIRO]** show
Kiro at work: together they run 50 seconds (the minimum is 40). Upload as public or unlisted.

**Before recording:** see `docs/video-recording.md` for the exact steps. In short: open the live site once and wait for the
notice "Saved. Awari now works without a connection." (To show every picture offline, first press **Save all pictures** on Credits and wait for it to finish.) Seed reference stamps with `/?demo=reference` (it asks first).
Screen 1440 × 900, zoom 100%. Record the Kiro rows from the real project folder; open the Kiro
Crew session and the files named, do not stage anything that did not happen.

## Shot list

| Time | Shot | Voice-over | Notes |
| --- | --- | --- | --- |
| 0:00 – 0:10 | Black. White text fades in: "About half of the world's schools are not online." Small credit line: "Giga (ITU and UNICEF), July 2024". Then the Awari logo on its yellow label. | "About half the schools in the world still have no internet, and in the poorest countries mobile data costs nineteen times as much of a family's income." | Sources for both facts: README, "Who it is for and why it matters". Logo from `design/logo/awari-logo.svg`, unchanged. |
| 0:10 – 0:25 | Home: photo prints, paper strips, margin notes. Scroll to the stamp book. | "Awari is a free encyclopedia for children aged eight to fourteen. Visit once and it saves itself, then works with no connection at all, like the encyclopedia discs of the nineties." | Hover one print so it straightens and lifts. |
| 0:25 – 0:55 | Search "okapi"; open the result from Wikipedia. Tap a word; the side card opens. Then open Nigeria, "Find it on the globe": the facts card pins and a stamp appears. | "Search anything and it opens, photo, credits, quiz and all, and it's saved for later. Tap any word for its meaning. Open a country on the globe, and it becomes a stamp in your book." | Online for this shot. |
| 0:55 – 1:15 | Nigeria quiz: nudge, where to look, take away two; answer; "Right!" with the proof slip. | "Every question has three hints: a nudge, where to look, then two wrong answers disappear. When you're right, you see the sentence that proves it." | Pause on the proof slip. |
| 1:15 – 1:30 | Tours: "Great rivers of the world". Next stop twice: the globe turns to the Amazon, then the Yangtze. | "Guided tours turn the globe from stop to stop: rivers, ancient wonders, volcanoes of the Ring of Fire." | |
| 1:30 – 1:45 | Castle: the Space wing, one answer, the next door lights. Then the timeline, filter "Oceania". | "Sixteen castle wings, a room for every right answer. And a timeline of the whole world." | |
| 1:45 – 2:00 | Airplane mode on (menu bar). Reload. Open an article, a quiz, the Okapi page read earlier. Header: "Offline". | "Now, no internet. After one visit, everything still works, even the page we read from Wikipedia a minute ago." | Show the Wi-Fi icon off. |
| 2:00 – 2:12 | **[KIRO]** The Kiro Crew session for this build, then `.kiro/specs/`, then `18-world-timeline/requirements.md`. | "I built it in Kiro, spec first. Twenty-six specs, each with requirements and numbered acceptance criteria, written before the code." | Scroll slowly. |
| 2:12 – 2:26 | **[KIRO]** `18-world-timeline/design.md` Property 2 beside its test; run `npx vitest run scripts/packs/timeline-world.test.ts`. | "Each requirement becomes a property, and each property a test. This one keeps a date out unless Wikidata agrees. It's why Nigeria's 1963 'inception' isn't shown as its independence day." | Terminal full width. |
| 2:26 – 2:40 | **[KIRO]** Crew's Subagents panel with the crew-member runs (picture 13 in `docs/kiro-evidence/screenshots/` shows what it should look like), then the design reviewer's report `docs/final-review/design-review.md`. | "Crew members did the narrow jobs: a builder, a licence auditor, and a design reviewer that read the whole product like a stranger and found what I had missed." | Show one reply line. |
| 2:40 – 2:50 | **[KIRO]** Crew's Hooks panel (three hooks, 223 runs, 0 errors on 14 November), then `docs/kiro-evidence/hook-firings.jsonl` and `docs/kiro-log.md`. | "Hooks check the hackathon's rules every time the agent stops. Every task is on the record." | Stop on two readable rows. |
| 2:50 – 2:55 | Back to Home. Logo. Text: "Awari. Free. Open. Works offline." | "Awari: discovery, for everyone." | End card. |

**Desktop download (optional cutaway, no extra time):** if a few seconds are spare in the offline
segment, show the macOS app opening with Wi-Fi off and say "or download it, and it works from the first
launch". Do not call the installers signed.

## Timing check

Rows run 0:00 to 2:55 with no gaps: 10 + 15 + 30 + 20 + 15 + 15 + 15 + 50 + 5 = 175 seconds.
`npm run submission-check` reads the table and fails if the rows do not add up to 2:55 or if the
[KIRO] rows total less than 40 seconds.

## Recording notes

- Record the voice-over last; trim a clause rather than speed up.
- Captions on: every line of voice-over is in the table.
- No brand or logo in close-up: do not show the operating system's menu bar with its logo, the browser's logo or any
  other product's name. Record the browser window's content only (crop to it), and for the offline moment use the
  header's own "Offline" pill plus a small crop of the network icon.
- The inspiration (the 1990s CD-ROM encyclopedias) is only described, never shown: no logos,
  layouts or artwork from any product.
