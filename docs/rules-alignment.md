# Rules alignment brief (Kiroween 2026 Official Rules)

Do this as soon as your current task is committed, then carry on with specs 14 to 20. Nothing here changes the guardrails: no push, no deploy, no `terraform apply`, no spending, never print or commit keys.

## What the rules ask for

- "Entrants must build a working software application using Kiro (IDE, CLI, Web, and/or Kiro Crew)... Insufficient use of Kiro will result in disqualification at the Judges' sole discretion."
- "Your repo must contain the /.kiro directory at the root of the project to show usage of Kiro such as specs, hooks, and steering." It must not be gitignored.
- "Provide a write up on how Kiro was used. Judges must understand how effectively you used Kiro." The rules list eight prompts: IDE/CLI/Web/Crew and how they differed; custom agents; agent hooks; spec-driven development compared with vibe coding; steering; MCP; property-based testing; Kiro powers.
- Judging (20%): "How thoroughly and skillfully does the project use Kiro? Was there a thoughtful strategy to AI development? Was a variety of Kiro tools used impactfully? ... Was there experimentation?"
- The project "must function as depicted in the video and/or expressed in the text description."
- New work only; "must disclose any other pre-existing code or work". Third-party data must be used within its licence.
- Public GitHub repo, open source licence "detectable and visible at the top of the repository page (in the About section)". Video under three minutes, on YouTube, no third-party trademarks or copyrighted music.

## 1. Make the write-up true and complete

Rewrite "How Kiro was used" in `README.md` and "How we used Kiro" in `docs/devpost.md` (and the blog and social drafts) under the eight prompts above, in that order. Rules for the text:

- Remove "built end to end with Kiro" and "Everything was built ... with Kiro". Say exactly what was done and where.
- State the inputs plainly: the Home design reference in `design/` and the brief `KICKOFF.md` were prepared outside Kiro before the first session.
- State the surfaces plainly: all build sessions ran in Kiro Crew. Through commit `fd8c464` (2026-11-11 22:44 UTC) Crew's agent backend was set to Claude Code; from commit `9f3cc2c` (23:47 UTC) onward it is the Kiro CLI backend. Add a "Sessions" table at the top of `docs/kiro-log.md` with these dates and backends, and keep it current.
- Only describe a feature under a prompt if it was really used, and point to the file, commit or log line that shows it. If something was not used, leave it out. Never invent usage.
- Numbers in the write-up (spec count, property count, test count, pack sizes) must come from a script, not be typed by hand. They are already stale (13 specs is now 20).

## 2. Correct the Kiro log

- The "Driven by" column may say `hook: ...` only where a Kiro hook actually fired. Where the agent ran the command itself, write the command instead (for example `npm run lint && npm test`).
- "security review hook" is not one of the hooks in `.kiro/hooks/`. Describe it as what it was.
- Do not rewrite history beyond these corrections. Add a one-line note at the top saying the log was corrected and when.

## 3. Hooks that really run

The files in `.kiro/hooks/*.kiro.hook` are in the Kiro IDE format. Check Kiro's own documentation (do not guess) for how hooks fire in the surface you are running in. If CLI and Crew sessions take hooks from the agent configuration, then:

- Create a custom agent `awari-builder` in `.kiro/agents/` that carries the steering files as resources and has hooks for: lint and tests after a source file is written; the credits check after a bundled photo or data file changes; the hard-rules check when the agent stops.
- Run the remaining work with that agent. Save one captured example of each hook firing under `docs/kiro-evidence/` and reference it in the log.
- Keep the `.kiro.hook` files for the IDE.

## 4. Custom agents

Besides `awari-builder`, create two narrow agents and use each for real work on specs 14 to 20, logging what each found:

- `awari-licence-auditor`: read-only; checks every bundled photo, dataset and font against `CREDITS.md` and the licence rules.
- `awari-design-reviewer`: checks a built screen against `.kiro/steering/design.md` and the reference in `design/`.

## 5. MCP

Add workspace MCP configuration (check the docs for the correct file and format) with servers that help this build and come from their official publishers only, for example AWS documentation and Terraform for the infrastructure review, and a browser automation server for checking screens against the design. No secrets in the file. Use each one for a real task and log it. If a server adds nothing, remove it rather than list it.

## 6. Property-based testing

Keep deriving properties for specs 14 to 20. In the write-up, list the defects properties caught, with the property number and commit.

## 7. Kiro review pass over specs 01 to 13

For each of the first thirteen specs: reread requirements, design and tasks; run its tests; open its screen in the browser; fix what is wrong; update the spec if the code moved on; log the pass. This puts verified Kiro work on every part of the app.

## 8. Powers, IDE and Web

If Kiro powers are available in this surface and one fits (AWS, Terraform, testing), use it for real and log it. Otherwise leave powers out of the write-up. Do not claim the IDE or Web; list "open the project in the Kiro IDE and run one task there so the IDE hooks fire" under what you need from Segun.

## 9. Submission gate

Extend `npm run submission-check` so it also fails when:

- `.kiro` lacks `specs/`, `hooks/` or `steering/`, or any of them is ignored by git;
- `LICENSE` is not the standard MIT text at the repo root (GitHub must detect it for the About section);
- the write-up is missing any of the eight prompts that were really used, or contains "end to end";
- a feature named in `README.md`, `docs/devpost.md` or `docs/video-script.md` has no route or test behind it;
- the video script runs past 2:55 or names a third-party brand or track;
- a bundled asset lacks a licence entry, or a typed number in the write-up differs from the generated one.

Add to `docs/runbook.md`: after creating the repo, confirm the licence shows in About, the repo is public, and the Devpost form names the category (Resurrection) and each bonus category entered.

## 10. Report

When this is done, reply with: what changed, what the write-up now claims under each of the eight prompts, and what you need from Segun.
