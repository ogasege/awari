# Ready to submit? (spec 26, brief section 5)

Checked against `docs/rules-alignment.md`. "Yes" means exercised on 15 Nov 2026; "No" and "Owner" say what is left.
Last update: after the round-2 live run (see `report.md` for the verdict and numbers).

| # | Requirement | Answer | Evidence |
|---|---|---|---|
| 1 | Live URL works for a first-time visitor, no sign-in, and stays up through judging | **Yes, with one owner action** | `browser-live-after.md`: 53 checks, 0 failed (40 deep links loaded and refreshed, unknown URLs show a way back, back and forward through ten screens, reload mid-quiz, two tabs). `crawl-live-after-1440.md` and `-390.md`: 359 routes per width, 0 failures. **Owner:** keep the AWS stack running until judging ends and set a Budgets alert (about 5 USD a month, runbook step 3). |
| 2 | Public repo, MIT detected in About, `/.kiro` at the root with specs, hooks and steering, nothing needed git-ignored | **Yes** | `gh repo view`: public, licence `mit`, homepage set. `gh api repos/ogasege/awari/contents/.kiro` lists `agents hooks prompts settings skills specs steering workflows`. `git check-ignore -v .kiro/specs .kiro/steering .kiro/hooks` prints nothing. `npm run rules` passes. |
| 3 | README and `docs/devpost.md`: claims true today, numbers from `docs/generated/stats.json`, the eight Kiro prompts answered, nothing claims an unused Kiro feature | **Yes** | `npm run submission-check` passes its write-up, numbers and features checks (it fails on stale numbers, a prompt out of order, or an overclaim). Kiro IDE and Web are stated as not used. Hook count stated as the two true numbers (27 logged Kiro-session firings; Crew panel 223 runs, 0 errors). The Crew conductor, `awari-builder` and workflow are described as they ran, including that the workflow was cancelled. |
| 4 | `docs/video-script.md`: every shot works as scripted on the live site, under three minutes, no trademark or copyrighted music | **Yes for the script; the video itself is the owner's** | Rows add to 2:55 (checked by `submission-check`). Journeys exercised every product shot on the live site: Home, search "okapi" and Wikipedia article, word card, Nigeria quiz with the three hints and proof, the Rivers tour (Nile, Amazon, Yangtze), the Space wing, the Oceania timeline filter, offline. First 20 seconds state the problem, the audience and why it matters. No brand names or logos on screen; no music. `docs/video-recording.md` has the one-sitting steps. |
| 5 | Picture licences: `npm run licences` passes today; Credits screen matches | **Yes** | After fix batch 1: 4,021 of 4,021 images verified against the live Commons API, 0 problems. The Credits table lists the same records (journeys: paging and search of the table). |
| 6 | `submission-check`, `offline-check` (live URL), `desktop-check`, tests, type check, lint | **Yes** | Output tails in the section below. |
| 7 | Desktop installers: per platform, built or not, where, opened and tested or only built | See below | |
| 8 | Costs: what runs in AWS and the expected monthly cost | See below | |

## Desktop installers (spec 25, task 7)

| Platform | Built? | Where | Opened and tested? |
|---|---|---|---|
| macOS Apple silicon | DMG built on this Mac earlier (`desktop/release/Awari-1.0.0-mac-arm64.dmg`, about 237 MB, unsigned); an unpacked app was **rebuilt from the fixed site on 15 Nov** | `desktop/release/` (git-ignored, never committed) | **Yes**: `npm run desktop-check` opened the rebuilt app with the network off from the first launch and walked 9 screens (Home, Nigeria, a quiz with a hint, a Castle room, Atlas, Timeline, Pictures with never-seen thumbnails, the large-view note, Credits). The earlier DMG predates fix batch 1. |
| macOS Intel | DMG built on this Mac earlier (about 241 MB) | same | **Built only**, not opened. |
| Windows | **Not built** | built by the GitHub Actions workflow `.github/workflows/desktop.yml` when a `v*` tag is pushed | **Not tested.** Windows and Linux are untested until the workflow runs. |
| Linux | **Not built** | same | **Not tested.** |

**Owner:** push the tag `v1.0.0` (after the final deploy), let the workflow build the installers, attach them to the GitHub Release,
and say "not code-signed" (macOS: right-click, Open; Windows: More info, Run anyway).

## Costs

Running in AWS today (from `infra/terraform`, applied with the owner's personal profile): one private **S3** bucket with the
built site; one **CloudFront** distribution (HTTPS, HTTP/3); one **Lambda** (the quiz service, function URL behind CloudFront
with a signed request) with its **CloudWatch** log group; **Bedrock** invocations of Claude Haiku 4.5 through an inference
profile; IAM roles. No servers, no database. Expected cost: the site is cents a month at this scale (first load is about
160 KB on slow 3G); the quiz service costs a fraction of a cent per generated quiz. **Caveat:** the reserved-concurrency cap
was removed because the new account refused it (`quiz_reserved_concurrency = null`), so the cap that would bound the quiz
service's spend is not in force; the signed request and the owner's AWS Budgets alert are the limits. To stop the service
without taking the site down, set `enable_quiz_service = false` and apply (runbook, section 8: keep it online until 29 January 2027).

## Bonus prizes

| Prize | State | What it needs |
|---|---|---|
| Blog post bonus (100 winners) | **Ready to paste**: `docs/blog-post.md` has the live and GitHub URLs, the sentence that it was written as part of the Kiroween 2026 hackathon, three Kiro screenshots, and the honest "what did not work" paragraph | **Owner:** publish it on the platform the rules name and submit the link. |
| Social Blitz (5 winners, "original thoughts vs AI writing") | **Notes only**: `docs/social-post.md` starts with `#KiroweenHackathon26` and says the owner writes it himself | **Owner:** write and post it. Nothing was posted. |
| Best Demo | Automatic, depends on the video | **Owner:** record using `docs/video-recording.md`. |
| Best Kiro Crew App, Startup, Student, Ghost of Kiroween Past | Not pursued | **Owner's decision.** Best Kiro Crew App would need a Crew app (not built, by instruction); Student and Startup depend on who the owner is; Ghost of Kiroween Past depends on the rules' definition. |

## Known issues that remain (also in `report.md`)

Desktop Cumulative Layout Shift above 0.1 on Home (0.19) and articles (0.12) from the web-font swap; 95% of quiz questions are
the same fill-the-gap shape and most proof sentences repeat the prompt; three uploader first-person picture captions; picture
selection is automatic; the Space page's margin note arrow points at the Sun picture; no sound.
