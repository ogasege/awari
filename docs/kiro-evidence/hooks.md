# Hook firings: one example of each

The `awari-builder` agent (`.kiro/agents/awari-builder.json`) carries these hooks. Each
example below is a line from `hook-firings.jsonl`, written by `scripts/hooks/kiro-hook.mjs`
while Kiro ran the hook in a real `kiro-cli chat --agent awari-builder` session.

## 1. Lint, typecheck and tests after a source file is written (`postToolUse`, matcher `write`)

Session `8b1a5d97`, 2026-11-12 04:00:38 UTC, task "20-tours 2: volcano stops lie around the
Pacific" (commit `c1dc8a8`). The agent wrote `src/features/tours/tours.test.ts`; Kiro ran
the hook, which ran eslint and the tests related to that file. Result: passed.

An earlier firing at 03:58:03 UTC (session `7c4391c5`, writing
`scripts/packs/photo-overrides.test.ts`) **failed**: the hook script called `vitest run
--related`, an option Vitest 4 no longer has. That was a defect in the hook, found
because the hook really ran; the script now calls `vitest related --run`. The same task
also showed the hook missed a type error in the new test (it ran eslint and tests but
not the type checker), so the hook now runs `tsc -b --noEmit` too.

## 2. Credits after a bundled photo or data file changes (`postToolUse`, matcher `shell`)

Session `7c4391c5`, 2026-11-12 03:58:44 UTC. The agent ran `npm run packs` to rebuild the
Central African Republic photo (commit `aaa2b79`); Kiro ran the hook after the command,
which ran `npm run credits`: "Credits check passed (1495 bundled files)." It fired again
after the 03:58:49 and 03:59:08 commands of the same task, and four more times in
session `e45a1927` when the agent rebuilt the packs for the margin-note rule (commit `b1a5071`).

## 3. Hard rules when the agent stops (`stop`)

Every session ends with this firing; for example session `8b1a5d97` at 04:00:45 UTC:
`npm run rules` → "Hard-rule check passed (334 files scanned)."

## Not captured

`agentSpawn` (`node scripts/hooks/kiro-hook.mjs spawn`) is configured, but no
`agentSpawn` line appears in any `--no-interactive` session, so it is not claimed.

## How a line is told apart from a manual run

A line counts only when it carries a Kiro session id and matches a `kiro-cli chat --agent
awari-builder` run in this log. One line written at 03:59:59 UTC came from reproducing the
failing hook by hand in a shell that also had a Kiro session id; it was removed.
