# Awari

**Awari** (Yoruba for *discovery*) is a free, offline-first encyclopedia for curious students aged
about 9 to 14. It is built for the Kiroween 2026 hackathon, **Resurrection** category: Awari is
inspired by Encarta and the CD-ROM encyclopedias of the 1990s, and brings back what they did
best: a whole library that works with no network, wandering from one thing to the next, and
learning that feels like play.

![Awari Home at 1440 px: a scrapbook of photo prints, paper strips and handwritten notes](docs/screenshots/home-1440.png)

Awari is an original design. It shares no name, logo, layout or artwork with any product of the
past. Everything on screen is hand-made in code: photo prints with tape and pins, headlines on
paper strips, wobbly SVG doodles, torn edges.

## What you can do

- **Search any topic.** Online, any Simple English Wikipedia article opens on demand (English
  Wikipedia when Simple has none) in the same page, with its photo, credits, a quiz made on the
  device and tap-a-word meanings. Every article you read is kept, so it opens offline next time.
- **Read offline**: <!--n:countries-->197<!--/n--> countries and <!--n:subjectArticles-->274<!--/n-->
  articles in <!--n:subjects-->11<!--/n--> subjects (wildlife, space, ancient worlds, Earth, the
  human body, physics and chemistry, electricity, inventions, famous people, arts, music and
  sport). Each subject has a page. **Tap any word** to see its meaning in a side card.
- **Spin the globe** and take **guided tours** that turn it from stop to stop: great rivers,
  wonders of the ancient world, volcanoes of the Ring of Fire.
- **Collect stamps**: every country you open becomes a stamp in a stamp book with a page for
  each continent, counted out of all <!--n:countries-->197<!--/n-->.
- **Take quizzes with a hint ladder**: a nudge, where to look, then two wrong answers removed.
  A right answer shows the sentence from the article that proves it. Right and wrong are said
  in words, never colour alone.
- **Walk the Castle**: <!--n:wings-->16<!--/n--> wings, one per continent and one per subject,
  each with twelve rooms that light up one right answer at a time.
- **Wander the timeline** of <!--n:events-->1530<!--/n--> dates from Wikidata, by subject and by
  continent, and see what happened **on this day** on Home, where the prints, notes and
  suggestions change every day.
- **Look at the world**: <!--n:mediaPictures-->4106<!--/n--> pictures from Wikimedia Commons, four or more for every article but one (Radioactive decay has two usable ones),
  in a strip under each article, on a **Pictures** screen with filters, search and a surprise pile, as the
  **picture of the day** on Home, and as picture questions in the Castle and picture quizzes. Every picture's author
  and licence is read from the Commons API by `npm run licences`, which the submission check runs.
- **Go offline.** After one visit every bundled feature works in airplane mode. Progress lives on
  your device; there are no accounts and no tracking.

## Run it

Needs Node.js 20 or later (22 recommended). No network is needed to build: the content packs are
committed.

```sh
npm ci
npm run dev                        # http://127.0.0.1:5173
npm run build && npm run preview   # the production build, with the service worker
```

| Command | What it does |
| --- | --- |
| `npm run check` | lint, typecheck, all tests, credits, hard rules, build, first-load budget |
| `npm run offline-check` | serves the build, visits once, goes offline, opens every feature |
| `npm run packs` | rebuilds the content packs from open data (network on first run, then cached) |
| `npm run stats` | recomputes every number quoted in this README and the write-up |
| `npm run submission-check` | the gate: `.kiro`, licence, write-up claims, numbers, features, video, secrets, `check` |

The optional quiz service and the Terraform for hosting are in
[`infra/terraform/README.md`](infra/terraform/README.md) and [`docs/runbook.md`](docs/runbook.md).
The app works without the quiz service.

## How Kiro was used

The evidence for every line below is in the repository: `.kiro/`, `docs/kiro-log.md` (a dated
record of what drove each piece of work) and `docs/kiro-evidence/`.

### Kiro surfaces (IDE, CLI, Web, Crew)

All build sessions ran in **Kiro Crew**, driven by chat. Crew's agent backend was Claude Code
through commit `fd8c464` (2026-11-11 22:44 UTC) and the **Kiro CLI** from `9f3cc2c` (23:47 UTC)
onward; the custom agents below were run with `kiro-cli chat --agent <name>` from that backend.
Crew is where the long, multi-step build lived (briefs, specs, follow-ups); the CLI agents did
narrow jobs with their own tools and hooks. The Kiro IDE and Kiro Web were not used. Two inputs
were prepared outside Kiro before the first session: the Home design reference in `design/`
and the brief `KICKOFF.md`.

### Custom agents

Three workspace agents in `.kiro/agents/`, each used for real work (`docs/kiro-evidence/agents.md`):

- `awari-builder`: the steering files as resources, hooks (below), Terraform and AWS
  documentation MCP servers, and shell rules that deny `git push`, `terraform apply` and
  `terraform destroy`.
- `awari-licence-auditor` (read-only): found that the Central African Republic photo showed
  Bangui in the Philippines, and a wrong font author. Both fixed (`aaa2b79`).
- `awari-design-reviewer` (read-only, Playwright MCP): found the new Subject and Tour screens
  broke design rules 3 to 6, and a margin note about an elephant being shot. Both fixed
  (`6be06ba`, `b1a5071`).

### Agent hooks

`awari-builder` runs `scripts/hooks/kiro-hook.mjs` on `postToolUse` (eslint, typecheck and the
related tests after a source file is written; `npm run credits` after a pack build or a change
under `public/`) and on `stop` (`npm run rules`, the hackathon hard rules). Kiro fired these
<!--n:hookFirings-->27<!--/n--> times in real sessions, each recorded with its session id in
`docs/kiro-evidence/hook-firings.jsonl`. A firing caught a defect in the hook itself (an option
Vitest 4 removed) and showed it missed type errors, so it now runs the type checker
(`docs/kiro-evidence/hooks.md`). The `.kiro/hooks/*.kiro.hook` files hold the same checks in the
Kiro IDE format; they have not fired, because the IDE was not used.

### Spec-driven development

<!--n:specs-->23<!--/n--> specs in `.kiro/specs/`, each with EARS requirements, numbered acceptance
criteria, a design that derives correctness properties, and tasks
(<!--n:specTasksDone-->196<!--/n--> of <!--n:specTasks-->198<!--/n--> done). Every spec was written
before its code, and each task became a commit named `<spec> <task>: <summary>`. Compared with
vibe coding, the specs changed outcomes: when the owner widened the scope to the whole world,
specs 14 to 20 were written first and caught that Wikidata's "inception" is not independence,
so the timeline cross-checks every curated date and leaves out the ones that disagree.

### Steering

`.kiro/steering/` holds `product`, `tech`, `structure`, `design` (the art-direction brief, word
for word) and `hackathon-rules`. The design file was the yardstick for every screen and for
`awari-design-reviewer`; the hackathon rules are code (`npm run rules`) and run on every stop hook.

### MCP

`awari-builder` used the HashiCorp Terraform MCP server and the AWS Documentation MCP server to
review the infrastructure against the provider docs and the CloudFront guide for Lambda function
URL origins (`docs/kiro-evidence/terraform-mcp-review.md`, ten tool calls). `awari-design-reviewer`
used the Playwright MCP server to open screens at 1440 and 390 pixels and check overflow and
focus. Configuration: `.kiro/settings/mcp.json` and the agent files; no secrets.

### Property-based testing

<!--n:properties-->118<!--/n--> fast-check tests are named for a spec property and the requirements
they cover. Defects they caught, with commits, are in `docs/kiro-evidence/properties.md`: a
quiz hint that gave away its answer (`be247ac`), curated dates that disagreed with Wikidata
(`6084f8d`), and unsuitable margin notes (`b1a5071`).

## Content and licences

Code is MIT (see [`LICENSE`](LICENSE)). Content is openly licensed, and every bundled photo and
data file is credited in [`CREDITS.md`](CREDITS.md):

| Content | Source | Licence |
| --- | --- | --- |
| Articles | Simple English Wikipedia (English Wikipedia on demand) | CC BY-SA 4.0 |
| Facts and timeline dates | Wikidata | CC0 |
| Globe shapes | Natural Earth | Public domain |
| Word meanings | Open English WordNet (Wiktionary on demand) | CC BY 4.0 (CC BY-SA 4.0) |
| Photos and the picture library | Wikimedia Commons | per picture: `CREDITS.md`, `public/media/*.json`, and the Credits screen; verified by `npm run licences` |
| Fonts | Bricolage Grotesque, Figtree, Covered By Your Grace | SIL OFL 1.1 |

All code is new work for this hackathon; libraries come from npm under their own licences.

## Project layout

```
.kiro/       steering, specs, hooks, agents, MCP settings (the Kiro evidence)
src/         the app: features/, design/, lib/, sw/ (service worker)
scripts/     content pack pipeline, gates, stats, hooks, service worker build, offline check
public/      generated packs and photos (committed)
services/    the optional quiz Lambda (Amazon Bedrock)
infra/       Terraform: S3, CloudFront, Lambda
docs/        brief, Kiro log, evidence, Devpost write-up, video script, judge guide, runbook
```
