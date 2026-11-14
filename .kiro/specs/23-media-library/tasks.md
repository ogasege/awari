# Tasks: Media library

Starts after spec 22 is committed. Run through the conductor with `awari-builder`,
`awari-design-reviewer` and `awari-licence-auditor`. Commit after every task, log in
`docs/kiro-log.md`, tests before ticking, browser check at 1440 and 390 px.

- [x] 1. Spec: requirements, design with properties, tasks.
- [x] 2. `npm run licences` and the allow-list module; `public/media/licences.json` for the ten design
      photos and the 36 changed photos first; add it to `submission-check`; drop the "owner confirms
      photo pages" step from runbook, CREDITS and every owner list (Property 1, 7). _Req 1-5_
- [x] 3. `select.ts` filters and scoring with property tests (Property 5). _Req 6-8_
- [x] 4. Collector: queue, cache under `data/raw`, resumable progress; dry run on five articles. _Req 9, 10_
- [x] 5. Thumbnails: WebP 480 px, size budget check (under 150 MB total). _Req 11_
- [x] 6. Run the collector over all articles in batches until each has at least four (or the gap is
      listed); countries per kind. _Req 15, 16_
- [x] 7. Media records and captions from Commons descriptions (Property 4). _Req 13, 14_
- [x] 8. Article gallery strip and the large viewer with credit; service-worker caching of the large
      view; honest offline wording. _Req 12, 17, 21_
- [x] 9. Media gallery screen `/media` with filters, search and the surprise pile. _Req 18_
- [x] 10. Picture of the day on Home (Property 3). _Req 19_
- [x] 11. Picture questions in quizzes and the Castle (Property 6). _Req 20_
- [x] 12. Credits page from media data; `CREDITS.md` summary; README and LICENSE notes. _Req 22, 23_
- [ ] 13. Sample reviews: auditor checks a random 5% against Commons; the design reviewer checks at
      least 150 pictures and the new screens. _Req 24_
- [ ] 14. Retake screenshots, `submission-check`, `offline-check`, post-batch workflow, report with
      counts and anything not obtained.
