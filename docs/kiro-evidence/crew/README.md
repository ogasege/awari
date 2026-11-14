# Kiro Crew capabilities: evidence (updated 13 Nov 2026)

Brief: `docs/crew-capabilities.md`. This file records what really ran in Kiro Crew, with ids and files, and what did not. Nothing is claimed in the write-up unless its row says "used".

| # | Capability | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Crew members `awari-builder`, `awari-design-reviewer`, `awari-licence-auditor` | **Added by the owner on 13 Nov** (each from the `kirocrew-worker` template). **Used**: `awari-licence-auditor` (run `e8072946`) and `awari-design-reviewer` (run `70521deb`) were each started as `spawn_run(crew=...)` for the final review-2 pass. **Not used**: `awari-builder`. The review-2 tasks 5 to 14 were built in the main session with the file tool; no spawn for them. | `licence-audit-review-2.md`, `design-review-review-2.md` (each written by its member) |
| 2 | Conductor (`kirocrew-conductor`, work ledger) | **Not used.** The review-2 list was worked through one task at a time in one session, with a commit and a `docs/kiro-log.md` row after each. | `git log` (21-review-2 1 to 15) |
| 3 | Workflow | **Authored, not run.** `.kiro/workflows/awari-post-batch-verification.py` was written by Crew's `workflow_author`. The same steps (retake screenshots, licence audit, design review, `submission-check`, `offline-check`) were run by hand and with the two crew members above. | `.kiro/workflows/awari-post-batch-verification.py` |
| 4 | Steering and Hooks panels | **Used.** The owner added three Crew hooks (hard rules on Stop, lint and tests after a write, credits check after a shell command). They fired in this session: `docs/kiro-evidence/hook-firings.jsonl` holds 48 lines, 21 of them from Crew's own hooks (20 `after-write` and 1 `stop`, event names `PostToolUse` and `Stop`); the other 27 come from the kiro-cli agent hooks in `.kiro/agents/awari-builder.json`. | `hook-firings.jsonl`, `.kiro/hooks/README.md`, `docs/kiro-evidence/hooks.md` |
| 5 | Knowledge | **Used (read).** The owner added `KICKOFF.md`, `docs/rules-alignment.md` and `.kiro/steering/design.md` (3 sources, 6 items). A search for the design rules returned the scrapbook style guide and the hooks, agents and gate section on 13 Nov. Knowledge was not used to decide any of the review-2 fixes beyond that check. | `knowledge_list_sources`, `local_knowledge_search` on 13 Nov |
| 6 | Skills and Prompts | **Written; the skill ran as a procedure.** `.kiro/skills/awari-pack-build/SKILL.md` (pack build plus licence check) and `.kiro/prompts/review-request.md`. Task 13 followed the skill's licence check through `scripts/packs/apply-lead-overrides.ts`. | files |
| 7 | Heartbeat and Connections | Left out: nothing here needs them. | |

## What the two crew members found (13 Nov)

- **Licence auditor**: all 36 photographs have usable licences, authors and Commons URLs. Four alt texts were wrong (Colombia lead, and the Countries, Science and Body covers); all four are fixed and a test now compares every lead photo's alt with its override. Two photos are accurate but weak (Zuma Rock is hazy with power lines, the Sagrada Família shows scaffolding).
- **Design reviewer**: of the 14 review-2 items it marked 6 FIXED, 7 PARTLY and 1 NOT VERIFIABLE (the offline proof, which no screenshot can show). It also raised 18 new defects. Fixed in the same pass: N1 (Home On this day cards overlapped the stamp book at 390 px), N2 (castle panel repeated the hero Earth), N8 (blue link on the stamp pages), N10 (low-contrast disabled button), N15 (clipped credit URLs). The rest are listed under "What I need from you" in the reply with this file and were not fixed.

## Review 3 (spec 22, 13 Nov): what really ran

- **Conductor `bed8c321`: used for the start only.** It read the spec and handed task 2 to `awari-builder`, then ended its turn, as the conductor does after each delegation.
- **`awari-builder` run `34363b32`: died** on a backend 5xx after its Wikidata fetch had finished and before it wired the rows in. Per the owner's instruction I took over in the main session: tasks 2 to 14 were built, tested and committed there, one commit each (`dc277b5` to `b479e05`), with a `docs/kiro-log.md` row each. The builder's leftover files (the candidate rows) were kept and used.
- **`awari-licence-auditor` run `d89d3288`: used.** It audited 12 photos against the Commons API with throttling and a timeout: no licence or author defect, five alt-text or caption defects, all fixed. Report: `licence-audit-review-3.md`. Note: both reviewers were spawned in one call with `crew=awari-design-reviewer`, because `crew=` applies to the whole batch, so the auditor ran under the design-reviewer template.
- **`awari-design-reviewer` run `8b50276e`: failed** with "Request exceeds the maximum allowed size": it was handed all 40 full-page screenshots. I did the design check myself on the retaken screens and recorded it in `design-review-review-3.md`. A retry with fewer, smaller images is left for the owner to decide.
- **Workflow `awari-post-batch-verification`: still not run.** Its steps were run by hand in this session: screenshots, the auditor, `submission-check`, `offline-check`.

## Media library (spec 23, 14 Nov): what really ran

Three review rounds, each by an independent crew member working read-only from a fresh random sample.  In round 3 each reviewer was spawned under its own crew name.

| Round | Auditor (licence and captions) | Design reviewer (pictures and screens) |
|---|---|---|
| 1 (`db9bff28`, `2bc97c86`) | 0 licence problems; 16 caption defects | 124 of 200 sampled pictures with a problem (62%); 20 screen defects N1 to N20 |
| 2 (`d1968cf1`, `3833edf6`) | 0 licence problems; 31 of 206 captions below the English bar; kind mislabels | 159 of 200 (80%); its screen captures predated the fixes, so most screen fixes were unverifiable |
| 3 (`ee596cb2`, `23537e96`) | 0 licence problems on 200 of 200; caption defects 33 (four sub-classes), 49 (round 2 classes) or 68 (its full bar); 11 kind defects | 98 of the 120 pictures it opened (82%); 53% on substantive faults only; screens: 11 of N1 to N20 fixed, 4 partly, 4 standing, 1 unverifiable |

What the rounds changed in the product: relevance terms and English-only captions (round 1); a WordNet English check, residue stripping, a denylist of 144 Commons files and stricter kinds (round 2); clause-boundary captions, more residue rules, foreign function words, sentence-cased shouting, four flag pictures and the non-English sample captions dropped, a quiz note that is a question, plain credits wording (round 3).

What did not work, and is not claimed as fixed:
- The design reviewer judged only 120 of its 200 sample pictures by eye (image budget) and 80 from captions. Its rate is high at every round and the selection is automatic, not curated by hand.
- The auditor sampled the library partway through my round-3 rebuild, so a few of its caption findings were already changed when it wrote them. The numbers above are its own, not re-measured on the final library.
- Still present at the end: about 18% of captions are three words or fewer, 8% end in an ellipsis, diagram is almost unused as a kind (3 records), some captions are wrong in small ways (a painting dated after the painter died), and the article strip mixes drawings with photographs without saying so.
- Not seen by the design reviewer in any round: the picture of the day on Home, the large picture view, the end of the credits page.
- Licences: 0 problems in all three rounds and in the library's own check against Commons (4,478 images in the final library).
- `awari-builder` was not used for spec 23 and the `awari-post-batch-verification` workflow was not run; its steps were run by hand (screenshots, both reviewers, `submission-check`, `offline-check`).
- Each reviewer was told to write its own file (`media-audit-review-N.md`, `media-design-review-N.md`); all six are kept.

## What this does not show

The write-up must not say a conductor, a workflow run or `awari-builder` crew run was used. Say that two Crew members (the licence auditor and the design reviewer) reviewed the final screenshots and photos, that three Crew hooks fired during the build, and that Knowledge holds the three documents.

## Spec 24 (review 4): what ran

No Crew member was started for spec 24. I did the twelve items myself in one session, one commit each, and checked the screens by eye:
- The captions, the lead pictures and the Pictures screen were read by me from contact sheets and screenshots. This is not an independent review, and it should not be described as one. The 214 hand decisions in `scripts/media/captions-decisions.txt` are mine.
- The judges' path and the 30 biggest countries were compared on one contact sheet (lead picture against the library's first picture); the leads were right except for the ones listed in the kiro-log row for task 4, which were replaced.
- A new design review and a new licence audit would need the retaken screenshots in `docs/screenshots/` and a fresh random sample of `public/media/`; `npm run licences` (4,216 of 4,216 images, 0 problems) is the licence evidence for this round.
