# Kiro Crew capabilities: evidence (12 Nov 2026)

Brief: `docs/crew-capabilities.md`. This file records what was done, what was blocked and why. Nothing here is claimed in the write-up until its row says "used".

| # | Capability | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Crew members `awari-builder`, `awari-design-reviewer`, `awari-licence-auditor` | **Blocked**: `kirocrew agent create` fails from the agent sandbox (`[Errno 1] Operation not permitted` on `~/.kiro/crew/memory_stores/.member-backups`). Needs the owner to add them in Agent Capabilities, Crews. The agent files they boot from are in `.kiro/agents/`. | command output, 12 Nov 09:35 |
| 2 | Conductor (`kirocrew-conductor`, work ledger) | Not started. Waits for item 1, and for the running review-2 worker (`cf8bb02a`) to finish; applies from the next batch. | |
| 3 | Workflow | **Authored** by Crew's `workflow_author`, saved as `.kiro/workflows/awari-post-batch-verification.py`. Not yet run: it retakes screenshots, which would collide with the running worker. First run is after that worker finishes. | `.kiro/workflows/awari-post-batch-verification.py` |
| 4 | Steering and Hooks panels | Workspace steering lives in `.kiro/steering/` and shows in Crew's Steering files tab when this project is bound to the chat. The hook checks are in `.kiro/agents/awari-builder.json` (kiro-cli agent hooks) and `.kiro/hooks/` (IDE). Registering them in Crew's own `hooks.json` is blocked for the same reason as item 1. | `.kiro/hooks/README.md` |
| 5 | Knowledge | **Blocked**: `knowledge.auto_add_documents` is off, so the agent cannot add documents. Needs the owner to turn it on or to upload `KICKOFF.md`, `docs/rules-alignment.md` and `.kiro/steering/design.md` in the Knowledge panel. | tool refusal, 12 Nov 09:36 |
| 6 | Skills and Prompts | **Written, not yet used**: `.kiro/skills/awari-pack-build/SKILL.md` (pack build plus licence check) and `.kiro/prompts/review-request.md` (review request). The pack build ran three times and the review request is used for every review-2 item, so both pass the "more than once" test. | files |
| 7 | Heartbeat and Connections | Left out: nothing here needs them. | |

## Why the blocked rows matter

Rows 1, 4 and 5 are the ones the rules would see as "variety of Kiro tools". They need one action from the owner, listed in the reply that accompanied this file.
