# Recording the video in one sitting

Target: the 2 minute 55 second shot list in `docs/video-script.md`. Plan on 45 minutes: 10 to set up, 25 to record,
10 to check. Record the pictures first and the voice-over last.

## What to have ready (10 minutes)

1. **Screen.** One external or built-in display set to 1440 × 900, browser zoom 100%. Close every other window, turn on
   Do Not Disturb, hide the desktop icons. Use a fresh browser profile (no extensions, no bookmarks bar) so the page is
   the only thing in frame. Crop or hide the menu bar and the dock: no operating system or browser logo should be in
   close-up.
2. **The live site, saved.** Open https://d3txwsv4mn6ye9.cloudfront.net once online and wait for the notice "Saved. Awari now
   works without a connection." (about 40 seconds on a good line), then press "Got it". Then open **Credits** and press
   **Save all pictures** (about 86 MB) and wait for "All pictures are saved on this device." so every picture works
   offline in the airplane-mode shot.
3. **Stamps.** Visit `/?demo=reference` once (it asks first) so the stamp book has stamps, then go back to Home.
4. **Read the Okapi page once online** (search "okapi", open the result from Wikipedia) so it is saved for the offline shot.
5. **Kiro windows** (rows marked [KIRO]): open the Kiro Crew desktop app on the build session and the files named in the
   script: `.kiro/specs/18-world-timeline/requirements.md` and `design.md`, a terminal in the project folder, Crew's
   **Subagents** panel, Crew's **Hooks** panel (three hooks, 223 runs, 0 errors), `docs/final-review/design-review.md`,
   `docs/kiro-evidence/hook-firings.jsonl`, `docs/kiro-log.md`. Do not stage anything that did not happen.
6. **Recorder.** Any screen recorder, 1080p or better, 30 fps, no cursor highlight, microphone muted for now. Save as MP4.
7. **Captions.** Every line of voice-over is in the table of the script; paste them as the caption file.

## Order of clicks (25 minutes), one take per row

| Row | Click path |
|---|---|
| 0:00 | Black card with the two lines of text and the logo (made in any slide tool, text only, no logos but Awari's). |
| 0:10 | Home. Move the pointer over one photo print so it straightens. Scroll to the stamp book and stop. |
| 0:25 | Header search: type `okapi`, Enter, open the result "From Wikipedia". Click a word; the side card opens. Search `nigeria`, open the article, "Find it on the globe": the card pins and a stamp appears. |
| 0:55 | Nigeria quiz (`/quiz/countries/nigeria`): press the nudge, "Where should I look?", then the third hint; pick the right answer; pause on the proof slip. |
| 1:15 | Tours, "Great rivers of the world", Start the tour; press "Next stop" twice (Amazon, then Yangtze). |
| 1:30 | Castle, open the Space wing, answer one question so the next door lights. Then Timeline, press "Oceania". |
| 1:45 | Switch the computer's network off (not the browser's). Reload Home: the header shows the quiet "Offline" pill. Open an article, the Nigeria quiz and the Okapi page. Show the network icon off in a small crop. |
| 2:00 to 2:50 | The five Kiro rows in order: Crew session, `.kiro/specs/`, spec 18 requirements, design Property 2 beside its test and run `npx vitest run scripts/packs/timeline-world.test.ts`, the Subagents panel, the Hooks panel, `hook-firings.jsonl`, `docs/kiro-log.md`. |
| 2:50 | Back online. Home, then the end card text "Awari. Free. Open. Works offline." |

## Check before you upload (10 minutes)

- Total time at most 2:59 (the rule is under three minutes). Run `npm run submission-check`: it re-reads the table.
- No third-party trademark or logo is readable in any frame, and no music (silence, or an original tune you made).
- The Kiro rows total at least 40 seconds and show real Crew screens.
- Say "the desktop installers are not code-signed" if you show them; do not call them signed.
- Upload as public or unlisted, paste the link into the Devpost form. That step and the submission are yours.
