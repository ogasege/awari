# Hooks

Two sets of hooks, for two Kiro surfaces. Both run the same checks.

| Check | Kiro IDE (`.kiro/hooks/*.kiro.hook`) | Kiro CLI and Kiro Crew (`.kiro/agents/awari-builder.json`) |
| --- | --- | --- |
| Lint and tests after a source file is saved | `lint-and-test-on-save.kiro.hook` (`fileEdited` on `src/**`, `scripts/**`) | `postToolUse` with matcher `write`: eslint and `vitest --related` on the written files |
| Credits after a bundled photo or data file changes | `credits-check.kiro.hook`, `credits-check-on-edit.kiro.hook` (`fileCreated`/`fileEdited` on `public/**`, `CREDITS.md`) | `postToolUse` with matcher `write` on `public/**` or `CREDITS.md`, and matcher `shell` after a pack build: `npm run credits` |
| Hard rules when the agent finishes | `hard-rules-check.kiro.hook` (`agentStop`) | `stop`: `npm run rules` |
| Kiro log entry when a task is ticked | `kiro-log-on-task-done.kiro.hook` (`fileEdited` on `.kiro/specs/*/tasks.md`, asks the agent) | not a hook: the agent prompt tells it to run `npm run log` after each task |

The IDE files only fire in the Kiro IDE. The build ran in Kiro Crew, where hooks come
from the custom agent's configuration (see the Kiro CLI hooks documentation:
`agentSpawn`, `userPromptSubmit`, `preToolUse`, `postToolUse`, `stop`). The agent hooks
call `scripts/hooks/kiro-hook.mjs`, which runs the check and appends a line to
`docs/kiro-evidence/hook-firings.jsonl`. Lines with `"source": "kiro-session"` carry the
`KIRO_SESSION_ID` Kiro sets for hook commands, so they are records of a real firing.
