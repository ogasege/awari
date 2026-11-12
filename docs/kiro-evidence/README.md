# Kiro evidence

Raw records behind the "How we used Kiro" write-up. Every claim in `README.md` and
`docs/devpost.md` points at one of these files, a commit or a line of `docs/kiro-log.md`.

| File | What it shows |
| --- | --- |
| `hook-firings.jsonl` | One line per agent hook firing in a real Kiro session (`"source": "kiro-session"` with the `KIRO_SESSION_ID` Kiro passes to hook commands). |
| `hooks.md` | One captured example of each `awari-builder` hook firing, with the line it came from. |
| `terraform-mcp-review.md` | The 11-infrastructure review that `awari-builder` made with the Terraform MCP server and the AWS documentation MCP server, with every tool call listed. |
| `agents.md` | What the two narrow agents, `awari-licence-auditor` and `awari-design-reviewer`, found and what was changed because of it. |
| `properties.md` | Defects caught by tests, with the test, the property number where there is one, and the commit. |

## Surfaces

All build work ran in Kiro Crew (a session manager on top of Kiro). Its agent backend
was Claude Code until commit `fd8c464` (2026-11-11 22:44 UTC) and the Kiro CLI from
`9f3cc2c` (23:47 UTC) onward. The custom agents in `.kiro/agents/` were run with
`kiro-cli chat --agent <name>` from that Kiro CLI backend. The Kiro IDE and Kiro Web were
not used; the `.kiro/hooks/*.kiro.hook` files are there for the IDE and have not fired
(see the runbook for the one IDE task the owner can run).

## Not used

Kiro powers: not used, so not claimed.
