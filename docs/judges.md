# Judge guide: test Awari in under two minutes

Awari is a free encyclopedia for curious students that works offline after one visit. Live app:
**[LIVE URL]**. Code: **[GITHUB URL]**. No account or sign-in.

## The main journey (about 90 seconds)

1. **Open the live app** and wait a few seconds. The badge at the top right changes from "Saving
   for offline…" to **"Works offline"**: the bundled library is saved on your device.
2. **Search any topic.** Type something in the header search, for example *okapi*, and choose
   **Open**. The article opens from Wikipedia with its photo, credits and a quiz. Tap any word
   for its meaning.
3. **Spin the globe.** *Atlas*: drag the globe, pick a country. It becomes a **stamp**; *Explore →
   stamp book* shows a page for each continent and the count out of
   <!--n:countries-->197<!--/n-->.
4. **Take a guided tour.** *Tours → Great rivers of the world*, then *Next stop*: the globe turns
   to each river, and *Open the article* opens it.
5. **Quiz with hints.** Open any quiz (for example from *Subjects → Wildlife → Lion → Take the
   quiz*). Use the three hints; a right answer shows the sentence that proves it.
6. **Castle and timeline.** *Castle*: pick a wing, answer, watch a room light. *Timeline*: filter
   by a subject and a continent.

## Offline (30 seconds)

After step 2, turn the network off and reload:

- **Airplane mode** on your device, **or**
- **DevTools → Network → Offline** in Chrome or Edge, then reload.

The badge reads **"Offline, still working"**. The bundled articles, dictionary, globe, tours,
quizzes, castle, timeline and stamps all still work, and so does the article you opened from
search in step 2. A topic never opened before says, in words, that it needs a connection. The
optional quiz maker for articles outside the packs appears only when a quiz service is configured.

## Check it from the code

```sh
git clone [GITHUB URL] awari && cd awari
npm ci
npm run build
npm run offline-check     # visits once, goes offline, opens every feature
npm run submission-check  # .kiro, licence, write-up claims, numbers, secrets, tests, build
```

## Where to look for the Kiro evidence

| What | Where |
| --- | --- |
| Specs (EARS requirements, design with correctness properties, tasks) | `.kiro/specs/` (<!--n:specs-->24<!--/n-->) |
| Steering | `.kiro/steering/` |
| Custom agents (builder with hooks and MCP, licence auditor, design reviewer) | `.kiro/agents/`, `docs/kiro-evidence/agents.md` |
| Hooks and their recorded firings | `.kiro/hooks/README.md`, `docs/kiro-evidence/hooks.md`, `docs/kiro-evidence/hook-firings.jsonl` |
| MCP configuration and the Terraform and AWS documentation review | `.kiro/settings/mcp.json`, `docs/kiro-evidence/terraform-mcp-review.md` |
| Property tests and the defects they caught | `src/**/*.property.test.ts`, `docs/kiro-evidence/properties.md` |
| Dated record of what drove each piece of work, and the Kiro surfaces used | `docs/kiro-log.md` |

## Rules, at a glance

`.kiro/` is committed and not ignored; `LICENSE` is the standard MIT text; every bundled photo
and data file is in `CREDITS.md` with author and licence; all content is openly licensed; no
secrets are in the repository. `npm run submission-check` checks all of these.
