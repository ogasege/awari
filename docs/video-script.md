# Video script: Awari in 2 minutes 55 seconds

**Length:** exactly 2:55. **Voice:** warm, quick, curious; no hype words.
**Rules:** no third-party logos, no copyrighted music (use silence under the
voice, or record a simple original tune), nothing on screen that is not
Awari, Kiro or your own terminal. Rows marked **[KIRO]** show Kiro at work:
together they run **50 seconds** (the minimum is 40).

**Before recording:** `npm run build && npm run preview`, open the site once and
wait for the badge to say "Works offline". Seed the reference stamps with
`/?demo=reference` (it asks before changing anything). Screen size 1440 × 900,
browser zoom 100%. Record the Kiro rows from the real project folder.

## Shot list

| Time | Shot | Voice-over | Notes |
| --- | --- | --- | --- |
| 0:00 – 0:10 | Black. A hand-drawn star appears, then the Awari logo on its yellow label. | "When I was a kid, a whole encyclopedia fit on one shiny disc, and it worked with no internet at all." | Logo from `design/logo/awari-logo.svg`, unchanged. |
| 0:10 – 0:25 | Home at 1440 px: photo prints, paper strips, margin notes. Slow scroll to the stamp book. | "Awari brings that back. It's a free encyclopedia for curious kids, built like a scrapbook, and it keeps working when the internet doesn't." | Hover one print so it straightens and lifts. |
| 0:25 – 0:55 | Open Nigeria. Tap the word "delta"; the side card opens. Click "Find it on the globe": the globe spins, Nigeria's facts card pins, a stamp appears in the stamp book. | "Read about a country. Tap any word and see what it means. Open it on the globe, and the country becomes a stamp in your book, out of Africa's fifty-four." | Show "N of 54" in words. |
| 0:55 – 1:20 | Nigeria quiz: take a nudge, then "Where should I look?", then "Take away two answers". Answer; "Right!" appears with the proof slip. | "Every quiz has five questions and three hints. A nudge. Where to look. Then two wrong answers disappear. And when you're right, you see the sentence from the article that proves it." | Pause on the proof slip for two seconds. |
| 1:20 – 1:32 | The Castle: Africa wing, door wall; answer one question, the next door lights. | "In the Castle, every right answer lights the next of twelve rooms." | Chalk names over lit doors. |
| 1:32 – 1:45 | Timeline: tap "Science"; the ruler's "you are here" arrow; Home's "On this day". | "A timeline of a hundred and twenty-three dates, and what happened on this day." | Only dates from Wikidata appear. |
| 1:45 – 2:00 | Turn on airplane mode (menu bar). Reload. Open an article, a quiz and the timeline. Badge says "Offline, still working". | "Now, no internet. After one visit, everything still works: the articles, the dictionary, the globe, the quizzes, your stamps." | Show the Wi-Fi icon off. Say "airplane mode" aloud. |
| 2:00 – 2:12 | **[KIRO]** Kiro open on the project: `.kiro/specs/` tree, then `05-quizzes/requirements.md` showing EARS criteria and numbered acceptance criteria. | "I built it with Kiro, spec first. Thirteen specs, each with requirements in EARS and numbered acceptance criteria." | Scroll slowly; keep text readable. |
| 2:12 – 2:26 | **[KIRO]** `05-quizzes/design.md` showing Property 6 beside the test that is named for it; run `npm run test:props` and show it pass. | "Each requirement becomes a correctness property, and each property becomes a test. This one says a hint never gives away its answer. It caught a nudge that said 'the 1960s' when the answer was 1960." | Terminal full width. |
| 2:26 – 2:38 | **[KIRO]** `.kiro/steering/design.md` and `hackathon-rules.md`; then the hooks folder; save a source file and show the lint-and-test hook run. | "Steering holds my art-direction brief and the hackathon rules. Hooks run lint and tests every time I save." | Show `.kiro/hooks/` file names. |
| 2:38 – 2:50 | **[KIRO]** `docs/kiro-log.md` scrolling; end on `git log --oneline` with messages like "07-timeline 3.2: …". | "And this log records which spec, hook or steering file drove each piece of work, with a commit for every task." | Scroll fast, stop on two readable rows. |
| 2:50 – 2:55 | Back to Home. Logo. Text: "Awari. Free. Open. Works offline." | "Awari: discovery, for everyone, even offline." | End card, 5 s. Hold silence for the last second. |

## Timing check

Rows run 0:00 to 2:55 with no gaps: 10 + 15 + 30 + 25 + 12 + 13 + 15 + 50 + 5
= 175 seconds. `npm run submission-check` reads the table above and fails if the
rows do not add up to 2:55 or if the [KIRO] rows total less than 40 seconds.

## Recording notes

- Record the voice-over last, against the finished picture. The voice-over is
  249 words for 175 seconds, a relaxed pace that leaves the picture room to
  breathe; if a row runs long, trim a clause rather than speed up.
- Captions on: every line of voice-over is in the table.
- The inspiration (the 1990s CD-ROM encyclopedias) is only described, never
  shown: no screenshots, logos or artwork from any product.
- Upload as public or unlisted on YouTube or Vimeo, then paste the link into
  `docs/devpost.md` and the Devpost form.
