---
name: review-request
description: Ask the design reviewer and licence auditor to check a fixed screen before its work item closes
---

Review the screen or route named below after its fix. Read only; never edit files.

Route or item: {{route or review-2 item number}}

1. awari-design-reviewer: open the route at 1440 px and 390 px, check the nine rules in `.kiro/steering/design.md` against the Home reference in `design/`, and ask "could a template have made this?". Report findings per rule with what you saw and which file draws it, and say what you could not check.
2. awari-licence-auditor: for every photo, dataset or font the route shows, confirm an entry in `CREDITS.md` with author and licence, and that the photo is of the thing it is captioned as.
3. Reply with PASS or a numbered list of defects. The work item closes only on PASS from both.

Guardrails: no push, no deploy, no `terraform apply`, no spending, never print keys.
