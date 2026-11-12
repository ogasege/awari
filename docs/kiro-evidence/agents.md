# Custom agents at work

Three workspace agents live in `.kiro/agents/`. Each was run with
`kiro-cli chat --agent <name> --no-interactive` on real work for specs 14 to 20.

## `awari-builder`

Carries the five steering files as resources, the hooks in `hooks.md`, and two MCP
servers (Terraform, AWS documentation). Shell commands that push, apply or destroy are
denied in its configuration.

| When (UTC) | Task | Result |
| --- | --- | --- |
| 2026-11-12 03:27 | 11-infrastructure review with the Terraform and AWS documentation MCP servers | `terraform-mcp-review.md`: Terraform matches the CloudFront guide; three open questions for the owner. |
| 2026-11-12 03:58 | 02-content-packs 7: new override test, packs rebuilt, Central African Republic photo corrected | commit `aaa2b79` |
| 2026-11-12 04:00 | 20-tours 2: volcano stops lie around the Pacific | commit `c1dc8a8` |
| 2026-11-12 04:09 | 02-content-packs 6: packs rebuilt with the margin-note suitability rule | commit `b1a5071` (16 article notes and 1 Home note removed) |

Two runs before the agent carried its own MCP servers had no Terraform tools; the
first of them wrote a review from web pages and said so at the top. That file was
discarded and the review redone with the MCP servers.

## `awari-licence-auditor` (read-only)

Its shell is deny-by-default except `npm run credits`, `npm run rules` and read-only git.

Findings, 2026-11-12 03:46 UTC, on the committed bundle:

1. **`public/packs/img/central-african-republic.jpg` showed the wrong place.** The
   Commons file was `Bangui_overlooking,_National_Road_(Bangui,_Ilocos_Norte; …).jpg`,
   Bangui in the Philippines, not the country's capital. The automatic photo check had
   accepted it because the file named the capital. Fixed with a hand-picked file
   (`Bangui City Centre.jpg`, CC BY-SA 4.0) in commit `aaa2b79`.
2. **Font credit.** `CREDITS.md` named Mathieu Triay as the author of Bricolage Grotesque;
   the font's own licence names "The Bricolage Grotesque Project Authors". Corrected.
3. Design-kit photos: the exact Commons file is unconfirmed (already a step for the owner
   in `docs/runbook.md`).
4. `public/manifest.webmanifest` had no credits entry. Added.

## `awari-design-reviewer` (read-only, Playwright MCP)

Findings, 2026-11-12 04:03 UTC, on `/subject/wildlife` and `/tours/rivers` (the first run
could not start a browser in the sandbox and reviewed from the code; the agent now
starts Playwright with `--no-sandbox --isolated`):

1. Both screens failed design rules 3 to 6: no margin notes, doodles, torn edges or drawn
   progress ("a template could have made it"). Both now have a teal board with a torn
   edge that a print or card crosses, a handwritten note with a drawn arrow, and drawn
   progress (stamp outlines for quizzes done; a hand-inked route of stops).
2. The fact note on `/subject/wildlife` read "The largest elephant ever recorded was shot
   in Angola in 1974!" Margin notes now refuse sentences about killing, war, death and
   similar (`UNSUITABLE_NOTE` in `src/lib/text/notes.ts`, with a property test); packs
   rebuilt in commit `b1a5071`.
3. The tour page drew a black globe on white when opened directly: the globe's styles
   were only loaded by the Atlas page. `Globe.tsx` now imports them itself.

Re-review at 04:11 UTC with the browser: no horizontal overflow at 1440 or 390 on either
screen; notes and arrows hidden on phones; visible 3 px focus ring on the controls it
reached. It reported a "duplicate" note that is the note's wrapper and the note itself,
not two notes.
