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

## What this does not show

The write-up must not say a conductor, a workflow run or `awari-builder` crew run was used. Say that two Crew members (the licence auditor and the design reviewer) reviewed the final screenshots and photos, that three Crew hooks fired during the build, and that Knowledge holds the three documents.
