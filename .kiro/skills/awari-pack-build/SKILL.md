---
name: awari-pack-build
description: Rebuild the Awari content packs and quizzes, then prove every bundled asset is credited and licensed
---

# Build the packs and check licences

Use after changing `scripts/packs/**` or any topic list. The build takes about an hour and makes about a thousand network requests to Wikipedia, Wikidata and Commons, so run it in the background and log to `data/build/packs.log`.

1. `npm run packs > data/build/packs.log 2>&1` (runs `scripts/packs/build.ts`, then `scripts/quizzes/build.ts`).
2. Read the tail of the log: it must end with `Done in ... s`. Note every `skipped` line; a pack article that is skipped can break a tour stop (the wonders tour lost its Olympia page this way).
3. `npm run stats`, so the numbers in the write-up follow the new packs.
4. `npm run credits` must pass: every photo, dataset and quiz folder has a `CREDITS.md` entry.
5. Run the `awari-licence-auditor` agent over the new photos. It checks that each photo shows what its article says (it once found a Philippine town photographed as the Central African Republic's capital).
6. `npm run submission-check` and `npm run offline-check`.

Never commit a half-finished build: the build swaps into `public/packs` only after validation passes.
