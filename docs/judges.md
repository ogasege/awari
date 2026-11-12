# Judge guide: test Awari in under two minutes

Awari is a free encyclopedia for curious students. It works offline after
one visit. Live app: **[LIVE URL]**. Code: **[GITHUB URL]**. No account or
sign-in is needed.

## The main journey (about 90 seconds)

1. **Open the live app** and wait a few seconds. The badge at the top right
   changes from "Saving for offline…" to **"Works offline"**. That means the
   whole site has been saved on your device.
2. **Read and tap a word.** Choose *Explore*, open **Nigeria**, and tap the
   word **delta** in the text. A side card shows its meaning. (Every word
   works; the dictionary is saved too.)
3. **Spin the globe.** Choose *Atlas*, drag the globe, pick a country (or use
   the list below it). The facts card links to the article and the quiz.
   Open two or three countries, then go to *Explore*: they are now **stamps**,
   counted "out of Africa's 54".
4. **Take a quiz with hints.** Open the **Nigeria quiz**. Press *Give me a
   nudge*, *Where should I look?* and *Take away two answers*. Answer, then
   check: the result is said in words ("Right!" or "Not quite."), and a right
   answer shows the **sentence from the article that proves it**.
5. **Try the Castle.** *Castle → The Africa wing*: each right answer lights the
   next of twelve rooms.
6. **Timeline.** *Timeline → Science*. The drawn ruler has a "you are here"
   arrow. Home shows up to three events for today's date.

## Offline (30 seconds)

After step 1, turn the network off, then reload and repeat any step above.

- **Airplane mode:** switch on your device's airplane mode, **or**
- **In a desktop browser:** open DevTools → Network → set throttling to
  **Offline** (Chrome or Edge), then reload the page.

The badge now reads **"Offline, still working"**, and articles, the
dictionary, the globe, quizzes, the Castle, the timeline and your stamps all
still work. A page you never visited also opens. The only feature that needs
the network is the optional quiz maker for articles outside the packs; it
appears only when a quiz service is configured, and if the service is
unreachable the app says so in words and carries on with the bundled quizzes.

## Check it from the code

```sh
git clone [GITHUB URL] awari && cd awari
npm ci
npm run build
npm run offline-check     # visits once, goes offline, opens every feature
npm run submission-check  # hard rules, credits, secret scan, tests, build
```

`npm run offline-check` serves the build, lets the service worker save the
site, switches a real Chromium offline and opens Home, the Nigeria article
and the word "delta", the Nigeria quiz with a hint, the quizzes list, the
atlas, a Castle wing, the timeline, the stamp book, search and a page never
visited.

## Where to look for the Kiro evidence

| What | Where |
| --- | --- |
| Specs (requirements in EARS, design with correctness properties, tasks) | `.kiro/specs/` |
| Steering (product, tech, structure, design, hackathon rules) | `.kiro/steering/` |
| Hooks | `.kiro/hooks/` |
| Dated record of what drove each piece of work | `docs/kiro-log.md` |
| Property tests (87 named `Property N:`) | `src/**/*.property.test.ts`, `scripts/**` |

## Rules, at a glance

`.kiro/` is committed and not ignored; `LICENSE` is MIT; every bundled photo
and data file is listed in `CREDITS.md` with author and licence; all content
is openly licensed; no secrets are in the repository. `npm run rules`,
`npm run credits` and `npm run submission-check` check these.
