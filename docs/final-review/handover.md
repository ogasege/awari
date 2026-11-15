# Handover: spec 26-final-review (update after each step)

Repo `/Users/mac/workplace/awari`, live site https://d3txwsv4mn6ye9.cloudfront.net, GitHub https://github.com/ogasege/awari.
Rules: no push to main, no deploy, no terraform apply, no spend. The owner pushes and runs `scripts/deploy-live.sh`.
Shell edits: long heredocs get blocked as "ssh to localhost"; use the file tool (create, strReplace) and short commands.
Never write the banned product name (`npm run rules`). Keep `docs/kiro-evidence/hook-firings.jsonl` redacted (it is).

## Where things stand (01:25, 15 Nov)

- Done and committed: crawl/journeys/a11y/browser/Lighthouse/slow-3G scripts in `scripts/final-review/`; findings F-001..F-018 and
  D-xx in `docs/final-review/findings.md`; fix batch 1 (conductor `7e52b9eb`, builders `7186432e` A, `bc314cac` B, `23821fde` C;
  report `fix-batch-1-report.md`); `cdrom.md`, `kiro-power.md`, `design-review.md` (round 1, run `e44858cc`), `judging.md` (draft),
  README/devpost/blog/judges/video-script/video-recording/social-post updated; crew README updated incl. workflow `wf_000003` (cancelled).
- Local gates on the fixed build all pass: submission-check, offline-check (20), desktop-check (9), axe 0 serious, 619 tests, licences 4,021/4,021.
- The owner is deploying the fixed build now (started 00:23 UTC). **Do not touch `dist/` until live `sw.js` hash == `dist/sw.js` hash**
  (`curl -s -o .live-sw.js <url>/sw.js; shasum .live-sw.js dist/sw.js`; never pipe curl to shasum, it is blocked).

## Round 2 plan (in order; tick as done)

1. [ ] Poll until live sw.js == dist/sw.js.
2. [ ] Live crawl, both widths, with journeys: `VIEWPORT=1440 npx tsx scripts/final-review/crawl.ts <url> live-after-1440 --no-follow` and same for 390 (run both in parallel, background, logs `.crawl-live-after-*.log`).
3. [ ] Offline pass, 60 articles: `npx tsx scripts/final-review/crawl.ts <url> live-after-offline --offline --no-follow` (needs ~10 min; ends with `docs/final-review/crawl-live-after-offline.md`).
4. [ ] axe + keyboard + 200% zoom + reduced motion + schemes on live: `npx tsx scripts/final-review/a11y.ts <url> live-after`.
5. [ ] Lighthouse (live, 4 pages, mobile and desktop): see the loop in this file's history; outputs `docs/final-review/lighthouse/*.json`, then `npx tsx scripts/final-review/lh-summary.ts` (move the round-1 files to `lighthouse-before/` first).
6. [ ] Browser behaviour on live: `npx tsx scripts/final-review/browser-behaviour.ts <url> live-after`; slow 3G: `npx tsx scripts/final-review/slow3g.ts`.
7. [ ] Fresh sheets: `npx tsx scripts/final-review/shots.ts` (overwrites `docs/final-review/sheets/`; keep round 1 sheets by copying to `sheets-round1/` first), then spawn `awari-design-reviewer` (model claude-opus-5, cwd repo) to write `docs/final-review/design-review-2.md`; tell it to open Quiz, Stamp book, Timeline, and the Movie theatre and Carbon articles first, and to compare with `design-review.md` (D-1..D-43: fixed / partly / not).
8. [ ] Fix blockers/majors found; commit; if a redeploy is needed say REDEPLOY NOW and wait.
9. [ ] Write `findings.md` final statuses, `judging.md` (fill the "three weakest screens" from design-review-2), `readiness.md` (every item in brief section 5 and the bonus prizes, yes/no with evidence), `report.md` (one page: verdict, numbers before/after, fixed, known issues, what only the owner can do).
10. [ ] Spec 25: tell the owner when ready for the `v1.0.0` tag (after a clean live run). Update `docs/kiro-log.md` rows and `.kiro/specs/26-final-review/tasks.md` ticks only for what was exercised.

## Numbers to carry into the report (before = live build of 14 Nov 21:51 UTC)

- Before, live crawl (both widths, `crawl-live-before-*.md`): 359 routes per width, 507 + 518 controls activated; failures: `/quizzes` overflow (1642 > 1440 and 1134 > 390), 3 home links not visible at 390 (by design).
- Before, offline (`crawl-live-offline.md`): thumbnails failed by design, replaced by placeholders; now they are left out with one note.
- Before, axe local: 7 serious (stamp links, credits table); after fixes 0.
- Before, Lighthouse (`lighthouse.md`): perf 91 to 100, a11y 100, best practices 100, SEO 92; CLS 0.19 Home desktop, 0.12 article desktop (font swap; open, minor).
- Before, slow 3G: Home usable 3.4 s, article 5.1 s, quiz 5.1 s (97 to 159 KB).
- Design review round 1: 3 blockers, 25 majors (D-1..D-43). Quiz audit after batch 1: 0 giveaway hints, 0 capitalisation leaks, 0 distractor problems; 1,494 of 2,360 proofs still repeat the question.
- Open known issues: CLS on desktop; three first-person captions; D-4/D-8 quiz shapes and proofs; D-25 margin note placement; hand-curation of pictures; DMGs on this Mac predate batch 1 (CI builds the real ones on the tag).

## Log (newest last)
- 01:30 live == dist (92bb8ef5c435). Crawls started (1440, 390, offline). Lighthouse after: a11y 100 all, CLS desktop unchanged. a11y live-after: 0 serious. browser-live-after: 53 checks, 0 failed. slow3G: Home 3.4 s, article 5.6 s, quiz 5.8 s.
- 01:40 round-2 design reviewer 0b549c35 spawned (fresh sheets incl. movie-theatre and carbon articles).
- 01:55 round-2 results so far: live 390 crawl 0 failures (525 controls); small targets left: inline prose links (exempt) and Credits input/select (fixed in repo, not yet live: needs next deploy). Offline crawl counted console "net::ERR_FAILED" as failures (expected noise for unsaved pictures and online search): crawler now ignores those offline; rerun as `live-after-offline2` (running). 1440 crawl still running. Reviewer 0b549c35 still running.
- 02:20 live 1440 crawl: 513 controls, 0 failures. Offline crawl needed two crawler fixes (console net errors, ERR_ABORTED) -> `live-after-offline3` running. `readiness.md` written (needs gate output tails pasted at the end, and the deploy for the Credits-field change). Waiting for reviewer 0b549c35 (design-review-2.md). Still to write: report.md, final judging.md "three weakest screens", findings.md statuses, tasks.md ticks, kiro-log rows.
- 03:10 New finding F-019 (fixed in repo, NOT yet live): offline with no pictures saved, Pictures showed "Showing 0 of 0" (every tile failed and was removed, 3,525 requests). Now gives up after 150 misses and says "None of these pictures are on this device yet..." (test added). Also Credits fields 44 px. Crawler now dismisses the "Got it" notice after warm-up (it covered the viewer's Next/Previous and stamp-book buttons in the offline runs). NEXT: wait for design-review-2.md (reviewer 0b549c35), then write findings/judging/report, then rebuild + gates + REDEPLOY NOW, then rerun offline crawl (label live-after-offline4) on the final live build.
