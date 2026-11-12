# Use Kiro Crew's own capabilities (owner brief, 12 Nov)

The rules score "a variety of Kiro tools used impactfully" and "experimentation". So far this project uses one Crew chat with the default agent, plus three agents run through `kiro-cli`. Crew's Agent Capabilities panel offers much more: crew members, the conductor, heartbeat, knowledge, pipelines, skills, connections, prompts, steering, hooks and workflows. Use the ones below for real work on `docs/review-2.md` and what follows. Check Crew's own documentation for how each works; do not guess, and do not add anything that does no work.

Finish and commit your current task first. If a change needs "Apply & Restart", commit first and say so in the log before restarting.

1. **Crew members**: add `awari-builder`, `awari-design-reviewer` and `awari-licence-auditor` as crew members (same permissions as their `.kiro/agents` files: the reviewer and auditor read-only, the builder denied `git push`, `terraform apply` and `terraform destroy`). From then on run them inside Crew.
2. **Conductor**: give the review-2 fixes to the conductor as one goal. Let it break the list into work items and hand them to the crew members, with the design reviewer checking each fixed screen before the item closes.
3. **Workflow or pipeline**: make "retake screenshots, design review, licence audit, submission-check" one repeatable workflow, and run it after every batch of fixes.
4. **Hooks and Steering panels**: make sure the workspace steering files and the three hook checks are registered where Crew shows them, and that they fire in Crew sessions.
5. **Knowledge**: load `KICKOFF.md`, `docs/rules-alignment.md` and `.kiro/steering/design.md` so every crew member works from the same rules.
6. **Skills and Prompts**: save the pack build with its licence check as a skill, and the review request as a saved prompt, if you run them more than once.
7. **Heartbeat and Connections**: use only if they do something useful here (for example a scheduled submission-check). Otherwise leave them out and do not mention them.

Keep everything that can live in the repo under `/.kiro` so the judges can see it. For each capability you use, add a row to `docs/kiro-log.md`, save evidence under `docs/kiro-evidence/crew/` (what ran, what it found, session id), and add it to the write-up under the matching rules prompt, including how working in Crew differed from the CLI agents. Guardrails unchanged: no push, no deploy, no `terraform apply`, no spending.
