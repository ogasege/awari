# Screenshots of Kiro in use

Taken on 14 November 2026 from the Kiro Crew desktop app (v0.7.0) during the build session
"Continue Awari Project Build", and from the public repository. Nothing is staged or edited;
images are cropped to the relevant panel.

| File | What it shows |
| --- | --- |
| `01-prompt-steered-into-running-turn.jpg` | A prompt steered into a running turn: the brief for spec 26-final-review, and Kiro picking the work up. |
| `02-prompt-then-spec-task.jpg` | A prompt asking for a small spec task (the header badge change), then Kiro reporting on spec 25 task 5 after 41 tool calls. |
| `03-kiro-working-through-a-task.jpg` | Kiro narrating its way through that task: service worker, header, tests, offline check, screenshots. |
| `04-kiro-debugging-desktop-offline.jpg` | Kiro finding and fixing why the desktop app never finished saving for offline use. Crew's own policy blocking a tool call is visible at the top. |
| `05-tool-calls-in-a-turn.jpg` | Tool calls inside a turn: reading screenshots, writing a test, running the test suite. |
| `06-crew-members.jpg` | Agent Capabilities, Agents: the three crew members created for this project. |
| `07-hooks-223-runs.jpg` | Agent Capabilities, Hooks: the three Crew hooks, 223 runs, 0 errors. |
| `08-knowledge-sources.jpg` | Agent Capabilities, Knowledge: the three documents the agent can search. |
| `09-repo-kiro-folder.png` | `/.kiro` at the root of the public repository. |
| `10-repo-specs.png` | `/.kiro/specs`: one folder per spec. |
| `11-repo-steering.png` | `/.kiro/steering`. |
| `12-repo-hooks.png` | `/.kiro/hooks`. |

| `13-subagents-panel-crew-member-runs.jpg` | Crew's Subagents panel for the build session: twelve sub-agent runs (eleven complete, one error) with their models and durations, and the input and output of one run that begins "You are awari-design-reviewer for the Awari project". |
| `14-design-reviewer-run-in-chat.jpg` | The same crew member run as it appears in the chat: "You are awari-design-reviewer", Completed. |
| `15-design-reviewer-run-transcript.jpg` | That run opened: the transcript path under `~/.kiro/crew/subagents/` and the report it wrote to `docs/kiro-evidence/crew/media-design-review-2.md`. |
| `16-two-crew-members-finished.jpg` | "Sub-agents finished": Kiro names the two crew members it started, `awari-licence-auditor` (run e8072946) and `awari-design-reviewer` (run 70521deb), and what each checked. |
| `17-review-round-3-findings.jpg` | Round 3 of the media review: the licence auditor and design reviewer were spawned again and Kiro combines their findings. |
| `18-kiro-reports-hooks-knowledge-reviewers.jpg` | Kiro's own account in the chat: Crew hooks fired, Knowledge search worked, the two reviewers ran as crew members, and what was not used. |
| `19-opening-prompt-steering-and-specs.jpg` | The opening prompt of the session: read the brief, the files in `.kiro/steering`, every `tasks.md` in `.kiro/specs`, then carry on with the open tasks, with the guardrails for AWS and GitHub. |
| `20-kiro-loads-steering-file.jpg` | Steering in use: Kiro's first tool calls read `.kiro/steering`, and the output shows the design steering file with `inclusion: always`. |
| `21-steering-design-file.png` | The design steering file in the public repository. |
| `22-steering-hackathon-rules-file.png` | The hackathon-rules steering file in the public repository. |
| `23-spec-25-tasks-file.png` | A spec's task list (`25-desktop/tasks.md`) in the public repository. |

Which crew members ran and which did not is recorded in `docs/kiro-evidence/crew/README.md`;
pictures 13 to 18 are the visual record of the runs that did happen.
