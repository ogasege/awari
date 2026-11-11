# Awari: build brief for Kiro

You are building **Awari** end to end for the Kiroween 2026 hackathon (Devpost, **Resurrection** category). Awari brings back the 1990s CD-ROM encyclopedia as a free, offline-first web app for curious students. "Awari" is Yoruba for discovery. Work through this brief to completion, in order, without waiting for me unless a step under "Stop and ask" applies.

## Hard rules (breaking one can disqualify the entry)

1. The repo root must contain `/.kiro` with `steering/`, `specs/` and `hooks/`. Never gitignore it.
2. Awari is an original design. Never brand anything as Encarta, and never use Microsoft's logo, layout, screenshots or artwork in the product, repo or video. The README and write-up may say once, in plain words, that Awari is inspired by Encarta and the CD-ROM encyclopedias of the 1990s.
3. Public GitHub repo with an MIT `LICENSE`. All content must be openly licensed and credited (see Content).
4. The app must stay free and online until 29 January 2027.
5. All code is new work. Do not copy code from other projects.
6. Submission deadline: Friday 4 December 2026, 2:00 pm Pacific. Feature freeze: Friday 27 November. Target submission: Wednesday 2 December.

## Project setup

1. Use the folder this file is in as the project root (create `~/workplace/awari` and copy this kit into it if it is somewhere else). Run `git init`.
2. Write steering files in `.kiro/steering/`: `product.md`, `tech.md`, `structure.md`, `design.md` (copy the Design section below word for word), `hackathon-rules.md` (the hard rules above).
3. For each feature below create a spec in `.kiro/specs/<feature>/` with `requirements.md` (EARS format, numbered acceptance criteria), `design.md` and `tasks.md`. Derive correctness properties from the requirements and cover them with property-based tests.
4. Create hooks in `.kiro/hooks/`: run lint and unit tests when a source file is saved; check that every bundled photo and data file has a licence entry in `CREDITS.md`; update `docs/kiro-log.md` when a spec task is completed.
5. Keep `docs/kiro-log.md`: a dated record of which spec, hook or steering file drove each piece of work. This is the evidence for the judges.
6. Commit after every completed task, with the spec and task number in the message.

## What to build (in this order)

1. **App shell and design system.** React, TypeScript, Vite. Shared header, routes, tokens, the hand-made components from the Design section. Done when Home matches `design/home.png` at 1440 px and reflows to one column on a phone.
2. **Content packs.** A build script that turns open data into static JSON packs: Countries (Simple English Wikipedia articles, Wikidata facts), Physics (starting with electricity), Dictionary (Open English WordNet). Done when the packs build from a single command and each record carries its source and licence.
3. **Articles and dictionary.** Photo-led article page; tapping any word shows its meaning in a side card. Done when the Nigeria article renders from the pack and "delta" resolves offline.
4. **Atlas.** A globe the student can spin; countries they open are marked as discovered. Use Natural Earth shapes. Done when selecting a country shows its facts and links to its article and quiz.
5. **Quizzes with a hint ladder.** Five questions per article. Three hints per question: a nudge, where to look, then two wrong answers removed. After a correct answer show the sentence from the article that proves it. Right and wrong states always carry words, never colour alone. Done when the Nigeria quiz works offline.
6. **The Castle.** A room-by-room trivia game that uses the same question bank; each correct answer lights the next room. Done when a wing of twelve rooms can be completed.
7. **Timeline and On this day.** Dated events from Wikidata, filterable by subject; Home shows three events for today's date.
8. **Stamp book.** Each discovered country becomes a postage stamp on Home; shows "N of 54" for Africa.
9. **Offline.** Service worker plus IndexedDB. Done when, after one visit, every pack feature works in airplane mode.
10. **Quiz service.** One AWS Lambda calling Amazon Bedrock to generate questions and hints for articles outside the packs. Validate every generated question against the article text before returning it. The app must work without this service.
11. **Infrastructure.** Terraform for S3, CloudFront and the Lambda. Static site, no servers.
12. **Submission pack.** Everything Devpost asks for, ready for me to paste or record:
    - `README.md`: what Awari is, a screenshot, how to run it, how Kiro was used, licences.
    - `CREDITS.md`: every photo, dataset and font with author and licence.
    - `docs/devpost.md`: the full write-up (inspiration, what it does, how we built it, how Kiro was used with concrete examples from `docs/kiro-log.md` covering specs, steering, hooks and chat-driven coding, challenges, what's next). Category: Resurrection.
    - `docs/video-script.md`: a 2:55 script with a shot list and timings. No third-party logos, no copyrighted music, at least 40 seconds showing Kiro at work.
    - `docs/judges.md`: how a judge can test the main journey, including offline, in under two minutes.
    - `docs/blog-post.md` and `docs/social-post.md`: drafts for the bonus prizes.
    - `docs/runbook.md`: the exact commands for me to create the GitHub repo, push, deploy with Terraform and verify the live site.
    - `npm run submission-check`: a script that fails if `/.kiro` is missing or ignored, `LICENSE` is missing, any bundled asset lacks a credit, a secret is present, or the build or tests fail.

If time runs short, cut in this order: timeline, quiz service, Physics pack, dictionary. Never cut offline, quizzes with hints, or the atlas.

## Content and licences

- Wikipedia and Simple English Wikipedia text: CC BY-SA 4.0. Credit on every article.
- Wikidata: CC0. Natural Earth: public domain. Open English WordNet: CC BY 4.0.
- Photos: Wikimedia Commons only, with author and licence in `CREDITS.md`. The ten used in the design are listed in `design/CREDITS.md`.
- Every fact shown in a handwritten note must be true and checked against the article it points to.

## Design

You are the art director and lead illustrator for Awari. Your background is children's editorial design and cut-paper collage. Every screen must look assembled by a person at a desk, never laid out by a grid.

Feel: a scrapbook kept by an excited explorer. Inviting, playful, a bit messy on purpose, always readable.

Colour (Lagoon): teal `#00606E` for dark "board" areas; coral `#FF8662` for the photo table; yellow `#FFD23F` for accents, buttons and chalk highlights; navy `#0B1B4D`; teal ink `#007A8C` on paper; tomato `#E8452C` in small amounts; white paper `#FFFFFF`; text ink `#101828`. Long reading text is always dark on white. Never signal right or wrong with red and green alone; add words.

Type: Bricolage Grotesque 800 for headings; Figtree for body text; Covered By Your Grace for anything handwritten.

Rules:

1. Lead with real photographs, shown as physical prints: white borders, 2 to 5 degree rotations, overlaps, tape, pins, handwritten captions.
2. Headlines sit on hand-cut paper strips at slightly different angles, with hard offset shadows.
3. Add handwritten margin notes that ask questions or share one true, checked fact, with hand-drawn arrows pointing at the thing.
4. Draw doodles as wobbly SVG strokes (stars, arrows, circles, small sketches), never clean icons.
5. Sections are divided by torn-paper edges, and at least one object must cross each boundary.
6. Show progress as drawn objects: stamps collected, doors lit, hints left.
7. Keep straight and calm: navigation, body text, buttons, form fields. Everything decorative is hidden from screen readers and from phones where it would crowd the content.
8. Hover straightens and lifts an object. No other animation. Respect reduced-motion settings.
9. Laptop first; reflow to one column on a phone.

Logo: `design/logo/awari-logo.svg` (the name on a hand-cut yellow label with a star for the dot of the i) and `design/logo/awari-icon.svg` (app icon and favicon). Use them as they are; do not redraw them.

`design/home.html` and `design/home.png` are the reference for Home. Design the other five screens (Atlas, Article, Quiz, Castle, Timeline) in the same style before building them. Before finishing any screen, check: could a template have made this? If yes, add one human touch that carries meaning, then remove one that doesn't.

## Quality bar

- Unit tests and property-based tests pass before a task is marked done.
- Keyboard reachable, visible focus, WCAG AA contrast.
- First load under 300 KB of JavaScript before packs; packs load on demand.
- No secrets in the repo.

## Stop and ask

Do everything else without asking. Stop and tell me what you need only for these:

- AWS credentials, Bedrock model access, or anything that spends money.
- Creating the GitHub repo or pushing to it.
- Deploying to a public URL.
- Any change that would break a hard rule.

Until then, build and test locally and keep committing. When you stop, list what is done, what is left, and exactly what you need from me.
