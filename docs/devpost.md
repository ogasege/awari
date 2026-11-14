# Awari: Devpost write-up

**Category:** Resurrection
**Tagline:** The 1990s CD-ROM encyclopedia, brought back as a free web app for the whole world that works in airplane mode.

> Before submitting, fill the three placeholders: `[LIVE URL]`, `[GITHUB URL]` and `[VIDEO URL]`
> (see `docs/runbook.md`). The numbers below are filled in by `npm run stats`.

## Inspiration

Awari is inspired by Encarta and the CD-ROM encyclopedias of the 1990s. I wanted to know why
they felt so good. The whole library sat on a disc, so it worked with no network. One thing led
to another: a photo, a map, a word you did not know. And it was playful, with quizzes and games
tucked between the articles.

Today, curious children in many places have a phone, a patchy connection and the largest
encyclopedia ever written, and still cannot rely on it. So the resurrection is not nostalgia; it
is the disc's best ideas, made free, open and small enough to carry. *Awari* is Yoruba for
discovery.

## What it does

- **Search any topic.** Online, any Simple English Wikipedia article opens on demand (English
  Wikipedia when Simple has none) in the same photo-led page, with credits, a quiz built on the
  device and tap-a-word meanings. Every article read is saved, so it opens offline later.
- **A library on the disc**: <!--n:countries-->197<!--/n--> countries and
  <!--n:subjectArticles-->274<!--/n--> articles in <!--n:subjects-->11<!--/n--> subjects, with
  <!--n:photos-->476<!--/n--> licence-checked Commons photos, a page per subject, and a dictionary of
  <!--n:lemmas-->14,593<!--/n--> words.
- **A globe** you can spin and **guided tours** that turn it from stop to stop: great rivers,
  wonders of the ancient world, volcanoes of the Ring of Fire.
- **A stamp book** with a page per continent, counted out of all <!--n:countries-->197<!--/n-->
  countries.
- **Quizzes with a hint ladder**: <!--n:quizzes-->479<!--/n--> quizzes,
  <!--n:questions-->2364<!--/n--> questions, three hints each (a nudge, where to look, two wrong
  answers removed), and the proof sentence after a right answer. Right and wrong are said in
  words.
- **The Castle**: <!--n:wings-->16<!--/n--> wings, one per continent and one per subject, twelve
  rooms each.
- **A timeline** of <!--n:events-->1530<!--/n--> dates across every subject and continent, and **On
  this day** on Home, which also rotates its prints, notes and suggestions daily.
- **A picture library** of <!--n:mediaPictures-->3982<!--/n--> Commons pictures (four or more per article but eighteen, <!--n:mediaMB-->87<!--/n--> MB of small WebP copies): an article strip, a large view with the credit, a Pictures screen, the picture of the day and picture questions. No licence is typed by hand: `npm run licences` asks the Commons API about <!--n:mediaVerified-->4478<!--/n--> images and fails the submission check on any mismatch.
- **Offline**: a hand-written service worker saves the whole bundle. After one visit every bundled
  feature works in airplane mode, and the header says honestly whether the site has been saved.
- **An optional quiz service** (AWS Lambda calling Amazon Bedrock) that checks every generated
  question against the article before a student sees it. The app never depends on it.

## How we built it

React 19, TypeScript and Vite, with hand-made components for the scrapbook look and no UI
framework. The main script is <!--n:mainScriptKB-->269<!--/n--> KB, under the 300 KB budget;
packs load on demand. Content is built by one command, `npm run packs`, from Simple English
Wikipedia, Wikidata, Natural Earth, Open English WordNet and Wikimedia Commons, and every record
carries its source and licence. Infrastructure is Terraform (private S3 behind CloudFront, and
an optional least-privilege Lambda); <!--n:terraformTests-->13<!--/n--> Terraform tests run with mock
providers.

## How we used Kiro

Everything below can be checked in the repo: `.kiro/`, `docs/kiro-log.md` and
`docs/kiro-evidence/`.

### Kiro surfaces (IDE, CLI, Web, Crew)

All build sessions ran in **Kiro Crew**, driven by chat: the brief, then "continue" messages, then
a world-scope brief and a rules-alignment brief from the owner. Crew's agent backend was Claude
Code through commit `fd8c464` (2026-11-11 22:44 UTC) and the **Kiro CLI** from `9f3cc2c` (23:47 UTC)
onward (`docs/kiro-log.md`, Sessions table). Crew held the long build; the **Kiro CLI** ran three
custom agents for narrow jobs with their own tools, hooks and MCP servers. The Kiro IDE and Kiro
Web were not used. The Home design reference (`design/`) and the brief (`KICKOFF.md`) were
prepared outside Kiro before the first session.

### Custom agents

- **`awari-builder`** carries the steering files as resources, the hooks below, and the Terraform
  and AWS documentation MCP servers. Its shell settings deny `git push`, `terraform apply` and
  `terraform destroy`. It rebuilt packs, added tests and committed tasks
  (`aaa2b79`, `c1dc8a8`, `b1a5071`).
- **`awari-licence-auditor`** is read-only (deny-by-default shell). It found that the Central
  African Republic's photo showed Bangui in the Philippines, which the automatic photo check had
  accepted because the file named the capital, and a wrong font author.
- **`awari-design-reviewer`** is read-only with the Playwright MCP server. It found that the new
  Subject and Tour screens broke design rules 3 to 6 ("a template could have made this"), and a
  margin note saying an elephant "was shot". All were fixed, and margin notes now refuse such
  sentences, with a property test.

### Agent hooks

`awari-builder` has `postToolUse` hooks (after a source file is written: eslint, typecheck and the
related tests; after a pack build or a change under `public/`: `npm run credits`) and a `stop`
hook (`npm run rules`, the hackathon hard rules). Kiro fired them <!--n:hookFirings-->27<!--/n-->
times in real sessions, each logged with its Kiro session id. The hooks earned their place: a
firing exposed a bug in the hook script itself (a Vitest option that no longer exists), and
another showed the hook missed a type error in a new test, so it now runs the type checker
(`docs/kiro-evidence/hooks.md`). The `.kiro/hooks/*.kiro.hook` files hold the same checks for the
Kiro IDE; they have not fired, because the IDE was not used.

### Spec-driven development

<!--n:specs-->23<!--/n--> specs, each with EARS requirements and numbered acceptance criteria, a
design that derives correctness properties, and tasks; <!--n:specTasksDone-->198<!--/n--> of
<!--n:specTasks-->198<!--/n--> tasks are done, each committed as `<spec> <task>: <summary>`. The
difference from vibe coding showed most when the scope grew to the whole world: specs 14 to 20
were written before any code. The design for the timeline made us check what Wikidata's
"inception" means, found that it is often not a country's independence day, and turned that
into a rule: a curated date must agree with Wikidata or the event is left out. A review pass over
specs 1 to 13 then found and fixed a bug no test covered (the Castle's buttons were yellow text
on yellow).

### Steering

Five steering files: `product`, `tech`, `structure`, `design` (the art-direction brief word for
word) and `hackathon-rules`. The design file was the yardstick for every screen and the
reviewer agent's instructions; the hackathon rules are code (`npm run rules`) that runs on every
stop hook and in `npm run submission-check`.

### MCP

`awari-builder` used the **HashiCorp Terraform MCP server** (provider docs for
`aws_lambda_function_url`, `aws_lambda_permission` and `aws_cloudfront_origin_access_control`) and
the **AWS Documentation MCP server** (the CloudFront guide for Lambda function URL origins) to
review the infrastructure: it confirmed the origin access control signing settings, both Lambda
permissions and the `x-amz-content-sha256` header the app must send, with ten tool calls listed
in `docs/kiro-evidence/terraform-mcp-review.md`. `awari-design-reviewer` used the **Playwright MCP
server** to open screens at laptop and phone widths and check overflow and focus. An earlier
Terraform server we tried was deprecated and would not start, so it was replaced rather than
listed.

### Property-based testing

<!--n:properties-->118<!--/n--> fast-check tests are named `Property N:` with the requirements they
cover. Defects they caught (`docs/kiro-evidence/properties.md`):
- *05-quizzes, Property 6* ("a hint never gives the answer away") caught year nudges like "the
  1960s" for an answer of 1960 (`be247ac`).
- *18-world-timeline, Property 2* ("a curated date that disagrees with Wikidata yields no event")
  left out 21 independence days, including Nigeria's (Wikidata gives 1963, the year it became a
  republic) and the United States' (`6084f8d`).
- *Margin notes are suitable* removed 16 article notes and a Home note (`b1a5071`).

## Challenges

- **Honest content.** Every handwritten fact is an article sentence word for word; every quiz
  answer has a proof sentence; every timeline sentence is a fixed template over Wikidata fields.
- **Pictures for ideas.** A scenic photo search works for countries and fails for "light bulb" or
  "Vikings". Subject packs now use each article's own lead image, and every photo was checked by
  eye on contact sheets before release.
- **Open data is messy.** Some English labels exist only through a shared language code; some
  countries' Wikidata dates mean something else.
- **Offline for real.** `npm run offline-check` switches a real browser offline and opens every
  feature, including an article read from Wikipedia while online.

## What's next

Local-language editions (Yoruba, Swahili, Hausa) with the same pipeline and licence checks, a
teacher mode that shares a quiz set as a link, and search over full article text.

## Built with

React, TypeScript, Vite, d3-geo, fast-check, Vitest, Playwright, Terraform, Amazon S3, Amazon
CloudFront, AWS Lambda, Amazon Bedrock, Kiro (Kiro Crew, Kiro CLI, custom agents, hooks, MCP).

## Links

- Live app: [LIVE URL]
- Code (MIT): [GITHUB URL]
- Video: [VIDEO URL]
