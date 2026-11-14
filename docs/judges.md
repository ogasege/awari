# Judge guide: test Awari in under two minutes

Awari is a free encyclopedia for curious students that works offline after one visit. Live app:
**https://d3txwsv4mn6ye9.cloudfront.net**. Code: **https://github.com/ogasege/awari**. No account or sign-in.

## The main journey (about 90 seconds)

1. **Open the live app** and wait a few seconds. The header shows "Saving for offline…" with a
   percentage, then a one-time notice says **"Saved. Awari now works without a connection."**: the
   articles, quizzes, maps and lead photos are on your device (extra library pictures are kept as you view them, or all at once with **Save all pictures** on the Credits screen). After that the header stays quiet while you are online.
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

The header shows a quiet **"Offline"**. The bundled articles, dictionary, globe, tours,
quizzes, castle, timeline and stamps all still work, and so does the article you opened from
search in step 2. A topic never opened before says, in words, that it needs a connection. The
optional quiz maker for articles outside the packs appears only when a quiz service is configured.

## Download (optional)

Awari is also a download for Windows (`.exe`), macOS (`.dmg`, Apple silicon and Intel) and
Linux (`.AppImage`) from the [Releases page](https://github.com/ogasege/awari/releases). It is the same build as the website with every
pack and small picture inside, so it works with no internet from the first launch; bigger pictures
still come from Wikimedia Commons when online. The installers are **not code-signed**: on macOS,
right-click the app and choose Open; on Windows, choose More info, then Run anyway. Only the macOS
build was opened and tested by hand; the Windows and Linux builds come from the
`Desktop installers` workflow (`.github/workflows/desktop.yml`) and were not run by hand.

To try it: download the installer for your system, open it with the network off, and open Home,
an article, a quiz and the Pictures screen.

## Check it from the code

```sh
git clone https://github.com/ogasege/awari awari && cd awari
npm ci
npm run build
npm run offline-check     # visits once, goes offline, opens every feature
npm run submission-check  # .kiro, licence, write-up claims, numbers, secrets, tests, build
```

## Where to look for the Kiro evidence

| What | Where |
| --- | --- |
| Specs (EARS requirements, design with correctness properties, tasks) | `.kiro/specs/` (<!--n:specs-->26<!--/n-->) |
| Steering | `.kiro/steering/` |
| Custom agents (builder with hooks and MCP, licence auditor, design reviewer) | `.kiro/agents/`, `docs/kiro-evidence/agents.md` |
| Hooks and their recorded firings | `.kiro/hooks/README.md`, `docs/kiro-evidence/hooks.md`, `docs/kiro-evidence/hook-firings.jsonl` |
| MCP configuration and the Terraform and AWS documentation review | `.kiro/settings/mcp.json`, `docs/kiro-evidence/terraform-mcp-review.md` |
| Property tests and the defects they caught | `src/**/*.property.test.ts`, `docs/kiro-evidence/properties.md` |
| Dated record of what drove each piece of work, and the Kiro surfaces used | `docs/kiro-log.md` |
| Screenshots of Kiro in use (23, with captions that match the crew record): Subagents panel, a reviewer run and its transcript, steering loaded, the hooks panel, the specs folder | `docs/kiro-evidence/screenshots/` (start with 13 to 20, then 07 and 10) |
| What really ran in Crew, with run ids, including what died or did not run | `docs/kiro-evidence/crew/README.md` |
| The independent final review: crawl, accessibility, Lighthouse, design review, findings and the verdict | `docs/final-review/report.md` |

## Rules, at a glance

`.kiro/` is committed and not ignored; `LICENSE` is the standard MIT text; every bundled photo
and data file is in `CREDITS.md` with author and licence; all content is openly licensed; no
secrets are in the repository. `npm run submission-check` checks all of these.
