# Final review report (spec 26-final-review)

Written 16 Nov 2026. Live site: https://d3txwsv4mn6ye9.cloudfront.net. The last redeploy the owner started (14:40 UTC) had not
reached the live site when this was written (live `sw.js` still `f9ee8ff947d4`, the 15 Nov upload), so **the round-4 changes are
verified locally only**. Everything marked "live" was exercised on the live site in rounds 1 to 3.

## Verdict

Not ready to tag `v1.0.0` until one more redeploy and a short live re-run (below). There is no open blocker in the round-3 review
and every blocker and major found since has a fix with a test in the repo. One major is deliberately left for the next spec:
the quizzes are mostly one shape (79% fill-the-gap). The owner has ruled that this is not a known issue to ship with, so it is
the next spec (`27-quiz-variety`, written, not started).

## What was exercised

| Check | Result | Where |
|---|---|---|
| Live crawl with journeys, both widths (359 routes each, 500 to 525 controls activated) | 0 failures at 1440 px; 1 at 390 px (a decorative Home link hidden on phones by design) | `crawl-live-r3-*.md` |
| Offline crawl, 60 articles, live | round 2: found F-019 (fixed); round 3 crashed once; **round 4 (18 Nov, live build 96cc349): 196 screens, 864 controls, 0 screen failures, 5 control failures** (Pictures large view Next/Previous timed out offline at both widths, under investigation; the Home stamp-book link at 390 px is hidden on phones by design) | `crawl-live-r4-offline.md` |
| axe on the live round-4 build (18 Nov) | 0 serious or critical on 40 states; keyboard walks with no unnamed stop and no missing focus indicator | `a11y-live-r4.md` |
| Phone header in each state (local build, 18 Nov) | 360 px: quiet 164 px, saving 164 px (was 202; the pill now sits on the header's edge), one-time saved notice 226 px; headline and first control above the fold in every state | `phone-header-saving-360.png` |
| Gates on 064ac95 (spec 27 shapes + spec 28 quiz screen) | `submission-check` and `offline-check` pass; 654 tests pass; `desktop-check` could not start Electron in the agent sandbox ("sandbox initialization failed"), so it must be run from the owner's terminal | this session |
| axe, 40 screen states, both widths | 0 serious or critical (live, round 2; local after every fix since) | `a11y-live-after.md` |
| Lighthouse (4 pages, mobile and desktop, live) | accessibility 100 on all, best practices 100, performance 91 to 100, SEO 92; desktop CLS 0.19 Home and 0.12 article (open) | `lighthouse.md` |
| Browser behaviour on live (deep links with refresh, back and forward, reload mid-quiz, 200% zoom, reduced motion) | 53 checks, 0 failed | `browser-live-after.md` |
| Slow 3G (400 kbps, 400 ms) | Home usable in 3.4 s, article 5.6 s, quiz 5.8 s | `slow3g.md` |
| Independent design review, three rounds | round 3: 33 fixed, 13 partly, 13 not fixed of 60, plus 10 new (R-1 to R-10) | `design-review*.md` |
| Local gates on the final repo state | `tsc`, `eslint --max-warnings 0`, 643 tests, `npm run suitability` (0 questions, 0 captions) and `npm run rules` pass. `submission-check` and `offline-check` last passed on the round-3 build; they build `dist/`, so they were **not rerun** on the round-4 changes while the owner's deploy was running | this session |

## Before and after

| Measure | Round 1 (live, 14 Nov) | Round 3 (live, 16 Nov) | Repo now |
|---|---|---|---|
| Blockers open | 3 | 0 new, N-1 and N-2 partly | 0 |
| First quiz hint names the answer | 2,254 of 2,360 | 0 of 2,357 | 0 |
| Capitalisation gives the answer away | 356 | 0 | 0 |
| Cloze proofs that are a different sentence | not counted | 0 | 0 |
| Border questions that are not a land border | not counted | 5 | 0 (106 left) |
| Money questions whose proof skips the currency | not counted | 24 of 48 | 0 of 24 |
| Unsuitable quiz questions or captions (ages 8 to 14) | not checked | 1 found | 0, and a gate |
| Unsuitable article sentences | not checked | 5 named | 0 (12 removed) |
| Captions cut with "..." | 431 | 0 | 0 |
| Article leads with leftover markup, foreign script or IPA | 30+ | 0 | 0 |
| Phone header, quiet | 257 px | 164 px | 164 px |
| Phone header with the saving pill | not measured | 208 px (owner) | 164 px at 360 (pill on the header edge) |
| axe serious or critical | 7 | 0 | 0 |
| Fill-the-gap share of questions | 77% | 79% | 35.2% of 2,415 (spec 27: capital, capital-reverse, continent, money, borders, biggest, who was born first, true or false) |
| Pictures in the library | 3,720 | 3,466 | 3,466 |
| Picture of the day | any picture, including diagrams | 15 Nov: a research diagram | 129-photograph set, all 366 listed |

## Owner's re-check of 15 Nov (five items)

| Item | Status |
|---|---|
| 1. Timeline "On this day" card repeats the date | fixed in repo (round 3, tests); not yet live |
| 2. Home "On this day" prints the year twice | fixed in repo: the phone layout showed the big year and the text's own year; the big one is now hidden there |
| 3. Stamp book overview is a grid of "?" | fixed in repo: each empty stamp draws its country's outline; "?" stays only for countries the atlas has no shape for |
| 4. Picture of the day was a research diagram | fixed in repo: strong set, rule `dailyRejection`, all 366 days in `picture-of-the-day.md`, test `daily.test.ts` |
| 5. Phone header 208 px with the saving pill | slimmer pill and compact notice in the repo; **not measured yet**, `phone-header-states.ts` will do both states after the deploy |

## Known issues that remain

Minor or polish, listed with ids in `findings.md`: header still 19% of a phone screen, 3 to 4 first-person or cut captions,
`as of` dates in 51 Wikipedia texts, US spellings in 172, seven articles without pictures, five island stamp slots without an
outline, a Castle photo above the headline on phones, desktop CLS 0.19 on Home and 0.12 on articles. Sound is not included.
The DMGs built on the owner's Mac predate these fixes; the tagged GitHub Actions build produces the real installers.

## Next spec: 27-quiz-variety

More question shapes from facts already in the packs: capital (both ways), continent, currency, neighbours, flag, picture,
which came first, true or false and biggest or smallest, with the cloze share capped at 40%. Requirements, design and tasks are
in `.kiro/specs/27-quiz-variety/`. It has not been started.

## What only the owner can do

1. `git push origin main` and `sh scripts/deploy-live.sh` (the repo changed after the last deploy began).
2. After the deploy: the offline pass (60 articles), axe and `phone-header-states.ts` on the live site, then a short round-4 look.
3. When that is clean: push the tag `v1.0.0` so GitHub Actions builds the installers (spec 25 task 7).
