# Final review brief (spec 26-final-review)

> The one product name in the owner's words is replaced in brackets: the repository's rules check
> forbids that name in any tracked file.

Owner's words: "Add a final review to do a complete rundown of the app. Everything clickable, all the
user experience. I need a complete assessment of the application. We need to be sure that this works
the way [a 1990s CD-ROM encyclopedia] used to work, and it must be really good and it must be ready to be submitted for my
hackathon."

This is the last spec before submission. It is an assessment first and a fix list second. Do not
mark anything as passing that you did not exercise. Where a check could not be run, say so.

Run it against the real thing: the live site https://d3txwsv4mn6ye9.cloudfront.net after the latest
deploy, and the packaged macOS desktop app. Local preview is only for reproducing a defect.

## 1. Click everything

Write `scripts/final-review/crawl.ts` (Playwright) and keep it in the repo.

- Start at Home. Collect every link, button, tab, card, chip, form control, menu item, map or globe
  hotspot, pager, filter, stamp, timeline marker, picture, and keyboard shortcut. Activate each one.
  Follow every in-app route it leads to and repeat until no new screen or state appears.
- For every activation record: screen, control (accessible name and role), what happened, console
  errors, failed network requests, and whether the result made sense (not a blank screen, not a
  dead control, not a silent no-op, not a 404, not the wrong article).
- Cover every route type with real breadth, not one example each: all 11 subjects, every country
  page (197), at least 150 articles spread over all subjects, every tour, every Castle room, every
  quiz type (word gap, picture, hint, proof), the make-a-quiz form (good title, bad title, empty,
  offline), the Atlas (every continent, zoom, a country from each), the Timeline (every era and
  filter), Pictures (filters, search, surprise pile, large view, next and previous), dictionary
  word cards, search (hits, no hits, misspelling, one letter, very long text, punctuation), stamp
  book, On this day (step through several days and both year ends), Credits (paging and search),
  About.
- Deep links: load at least 40 different in-app URLs directly on the live site and refresh them.
  Unknown URLs must show a helpful not-found screen with a way back.
- Browser behaviour: back and forward through a long path, reload mid-quiz, two tabs, text zoom at
  200%, reduced motion, dark and light system themes if the app has them.
- Do all of it at 1440 px and at 390 px. No horizontal overflow, no clipped text, no control
  smaller than 44 px on the phone layout, no overlapping elements.
- Every image must load or show its designed fallback. List every broken or missing picture.

Output: `docs/final-review/crawl.json` (raw) and a readable table in the report. State the totals:
screens visited, controls activated, failures.

## 2. Does it work the way [a 1990s CD-ROM encyclopedia] used to work?

Assess the experience against what people remember of a CD-ROM encyclopedia of that era, feature by
feature. For each row give: present or missing, how close it feels, what is weaker, and what you
fixed. Be critical. Never use Microsoft's name, logo, layout or artwork in the product.

- Opening the app: does Home feel like opening an encyclopedia you want to explore, with a clear
  way into every part within one click?
- Articles: rich reading with pictures, captions, related articles, see-also links that go
  somewhere real, a table of contents on long articles, word lookup by double click or tap.
- Finding things: search that suggests as you type, browse by subject, browse A to Z.
- Media: a gallery you can wander, pictures that open large with caption, author and licence.
- Atlas: a world you can spin or pan, pick a country, and land on its page with facts, flag, map.
- Timeline: scroll through history and jump from an event into its article.
- Games and learning: the Castle (the maze of rooms with questions), quizzes with hints and proof,
  progress that is remembered (stamps, rooms cleared, scores) and can be reset.
- Guided tours and On this day.
- Dictionary.
- Works with no connection, like a disc: after the first save, everything above works offline in
  the browser and in the desktop app.
- Sound: if the app has none, say so plainly as a known difference; do not add third-party audio.
- The feeling: discovery, depth, one more click. Name the three places where the app still feels
  like a website and not an encyclopedia, and improve them.

## 3. User experience assessment

Spawn the `awari-design-reviewer` crew member on fresh screenshots of every screen (both widths)
and have it report independently; if it fails, say it failed and do the review in the main session,
marked as not independent. Cover:

- First minute of a new visitor: is it obvious what this is and what to do first?
- Consistency of navigation, headings, buttons, spacing, type, colour across all screens.
- Loading, empty, error and offline states on every screen that can have them.
- Copy: plain English, no leftover placeholder text, no file names, no developer words, no broken
  sentences, no stray coordinates or markup. Sample at least 100 article leads and 200 captions.
- Content sanity: sample 60 articles for facts that are clearly wrong, out of date or mismatched
  with their picture; sample 60 quizzes for questions with a wrong, ambiguous or guessable answer.
- Accessibility: axe on every screen type with zero serious or critical issues; full keyboard
  path through Home, search, an article, a quiz, the Castle, the Atlas and Pictures; visible focus;
  screen-reader names on every control; colour contrast.
- Performance on the live site: Lighthouse (mobile and desktop) for Home, an article, Pictures and
  the Atlas; first load size; time until the app is usable on a slow 3G profile; report numbers.

## 4. Fix what you find

- Log every finding in `docs/final-review/findings.md`: id, screen, what is wrong, severity
  (blocker, major, minor, polish), evidence (screenshot or log), status, commit.
- Fix all blockers and majors, and every minor that takes under 15 minutes. Add a regression test
  for each fix that can have one. List the rest honestly as known issues.
- Then run the crawl again from the start and show before and after totals. Repeat until a full
  run has no blocker and no major.

## 5. Ready to submit?

Check each item against the official rules quoted in `docs/rules-alignment.md` and write yes or no
with evidence in `docs/final-review/readiness.md`:

- Live URL works for a first-time visitor, with no sign-in, and will stay up through judging.
- Public repo, MIT licence detected in About, `/.kiro` at the root with specs, hooks and steering,
  nothing needed from it git-ignored.
- README and `docs/devpost.md`: every claim is true of the live build today (numbers come from
  `docs/generated/stats.json`), the Kiro write-up answers the eight prompts, and nothing claims a
  Kiro feature that was not used.
- `docs/video-script.md`: every shot shows something that works exactly as scripted on the live
  site, fits under three minutes, and uses no third-party trademark or copyrighted music.
- Picture licences: `npm run licences` passes today; Credits screen matches.
- `npm run submission-check`, `npm run offline-check` (live URL), `npm run desktop-check`, the full
  test suite, type check and lint all pass. Paste the real output tails.
- Desktop installers: state for each platform whether it was built, where it is, and whether it
  was opened and tested or only built.
- Costs: what is running in AWS and the expected monthly cost.

Finish with `docs/final-review/report.md`: one page. Verdict (ready or not ready), the numbers,
what was fixed, known issues, and the exact list of what only the owner can do.

## Rules for this spec

- Keep the turn alive; do not stop to ask. Commit after each task. Say when there are unpushed
  commits or when the site needs a redeploy; the owner pushes and deploys.
- No new features. No spending. No claims without evidence.
- If a check fails on the live site only because the live site is behind the repo, say so and ask
  for a redeploy, then run it again.

## 6. Screenshots of Kiro in use (owner request, 14 Nov)

The owner wants visual proof of how Kiro was used in the submission. Twenty-three real screenshots are in
`docs/kiro-evidence/screenshots/` with a README that says what each one shows (prompts steered into
a running turn, Kiro working through spec tasks, the three crew members, the three Crew hooks with
their run counts, the Knowledge sources, and `/.kiro` in the public repo).

- Commit that folder.
- Embed the most telling ones in the README's "How Kiro was used" section and in `docs/devpost.md`,
  next to the prompt each one supports (hooks picture beside the hooks answer, and so on), with
  accurate alt text and captions. Add them to `docs/blog-post.md` too.
- Captions must match `docs/kiro-evidence/crew/README.md`: the crew members picture shows they
  exist; do not caption it as proof of runs that did not happen.
- List them in `docs/judges.md` so a judge can find them in one click.
- Pictures 13 to 20 are the strongest: the Subagents panel with the crew member runs, the design
  reviewer run and its transcript, and Kiro loading the steering file at the start of the session.
  Lead with those, the hooks panel (07) and the specs folder (10).
- If a better picture is still needed, say exactly which screen and the owner will capture it.

## 7. Score the submission against the five judging criteria (owner request, 14 Nov)

The owner had the Hackathon Website and Official Rules re-read on 14 Nov. Each criterion is 20%.
Write `docs/final-review/judging.md`: for each criterion, the judges' own questions (quoted from
`docs/rules-alignment.md`), our honest answer today, the evidence, and what you changed. These are
the gaps found; close each one for real or say plainly why not.

**Potential Impact** ("a credible case for solving a real problem for a real audience… Would
someone actually use this?")
- The write-up makes this case in two sentences. Add a short "Who it is for and why it matters"
  section to README and `docs/devpost.md`: the audience (children of about 8 to 14, and the
  parents and teachers who share one phone or a school computer with a patchy or costly
  connection), the problem in numbers from sources you look up and cite (cost of mobile data,
  share of schools without internet; use ITU, UNICEF/Giga, GSMA or A4AI and link each figure; if
  you cannot verify a figure, leave it out), and what is demonstrated: one visit saves it, then it
  works with no connection in the browser, as an installed app and as a desktop app, with the
  measured size.
- Say what it is not, so the claim is credible: the content is Simple English Wikipedia, selected
  and checked by rules, not written by experts.

**Technological Implementation** ("How thoroughly and skillfully does the project use Kiro?… Was
a variety of Kiro tools used impactfully?… Was there experimentation?")
- Of the eight write-up prompts, **Kiro powers** has no answer in `docs/devpost.md`. Find out what
  Kiro powers are available to this installation, install one that fits real work in this spec
  (for example a testing, accessibility, AWS or Playwright power), use it on a real task here, and
  write what it did. If none can be installed, say that in one honest line under a "Kiro powers"
  heading.
- The workflow `awari-post-batch-verification` was authored and never run, and the conductor and
  the `awari-builder` crew member were not used. Use them for real in this spec: run the workflow
  after a batch of fixes, hand the fix list from section 4 to the conductor, give `awari-builder`
  at least one fix. Record what happened, including failures, in
  `docs/kiro-evidence/crew/README.md`, then update the write-up to match.
- Add a "What I tried that did not work" paragraph (experimentation): the crew member that died,
  the request-too-large review, the hook that missed a type error, the blocked tool calls and how
  the work was reshaped. Judges ask about experimentation; this is the true record of it.
- The write-up's hook count must be the real one (Crew's Hooks panel showed 223 runs, 0 errors on
  14 Nov; `hook-firings.jsonl` is the source of truth). Describe the Crew features actually used:
  steering a running turn, Knowledge sources, Crew hooks, crew members and the Subagents panel.
- Kiro IDE and Kiro Web were not used and the write-up says so. Leave that true. If a small real
  task could be done in the IDE (runbook 7b), list it for the owner; do not claim it.

**Design** ("a complete, coherent product experience… intuitive, polished, and intentional")
- Covered by sections 1 to 4. In `judging.md` name the three weakest screens after the fixes.

**Innovation/Idea** ("does the project differ from existing concepts? Are any unusual technologies
or public resources (like datasets) leveraged or combined in a unique way?")
- Add a short, fair comparison to what already exists (reading Wikipedia online; offline Wikipedia
  readers such as Kiwix; children's encyclopedia sites) and say what is different here: built for
  exploring and play (rooms, tours, stamps, atlas, timeline), every quiz answer shown with its
  proof sentence, five public datasets combined by rules (Simple English Wikipedia, Wikidata,
  Natural Earth, Open English WordNet, Wikimedia Commons), every picture licence verified against
  the Commons API. Check each claim against the code before writing it.

**Presentation** ("Does the video clearly demonstrate the project working end-to-end? Does the
pitch communicate what problem is solved, who it's for, and why it matters?… creative and
memorable?")
- Re-check `docs/video-script.md` against the live site after this spec: every shot must work as
  written (the header badge has changed). The first 20 seconds must say the problem, who it is
  for and why it matters. Keep the Kiro part, and show the Subagents panel, the hooks panel and a
  spec file, which are the strongest pictures.
- The video must not show or name third-party trademarks: no encyclopedia brand names or logos, no
  browser or OS logos in close-up, no copyrighted music. Rewrite any line that names a brand.
- Write `docs/video-recording.md`: exact steps to record it in one sitting (window size, what to
  have open, the order of clicks), so the owner can record without preparing anything.

**Bonus prizes** (state of each in `docs/final-review/readiness.md`)
- Blog post bonus (100 winners): `docs/blog-post.md` must be ready to paste: live URLs filled in,
  the sentence that it is written as part of the Kiroween 2026 hackathon, the best screenshots.
- Social Blitz (5 winners, judged on "original thoughts vs AI writing"): the owner writes this
  himself. Leave `docs/social-post.md` as notes and facts only, starting with the required
  `#KiroweenHackathon26`, and say so at the top.
- Best Demo: automatic; depends on the video.
- Best Kiro Crew App, Startup, Student, Ghost of Kiroween Past: list what each needs and mark them
  as the owner's decision. Do not build a Crew app in this spec.
