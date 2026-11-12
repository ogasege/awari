# Design: Submission pack

## Documents

| File | Purpose |
| --- | --- |
| `README.md` | What Awari is, a screenshot, how to run it, how Kiro was used, licences |
| `CREDITS.md` | Every photo, dataset and font with author and licence (packs region is generated) |
| `docs/devpost.md` | The write-up, with concrete examples taken from `docs/kiro-log.md` |
| `docs/video-script.md` | 2:55 script; the shot-list table is parsed by the gate |
| `docs/judges.md` | The main journey and the offline test in under two minutes |
| `docs/blog-post.md`, `docs/social-post.md` | Bonus-prize drafts |
| `docs/runbook.md` | Owner steps: GitHub, Terraform, upload, verify, submit, keep online |

Placeholders `[LIVE URL]`, `[GITHUB URL]` and `[VIDEO URL]` mark the three
facts only the owner can supply; the runbook says where to replace them.

## The gate (`scripts/submission-check.ts`)

1. Required documents exist and are not empty (`REQUIRED_DOCS`).
2. `shotListProblems(parseShots(video-script.md))`: contiguous rows from
   0:00 to 2:55 and at least 40 s on `[KIRO]` rows.
3. `findSecrets` over every committed or committable text file: AWS access
   keys, AWS secret keys, private keys, GitHub and Slack tokens, bearer
   tokens. Findings name the file, line and kind, never the value.
4. `npm run rules`, `npm run credits` and `npm run check` (lint, typecheck,
   tests, build, first-load budget).

Pure logic lives in `scripts/lib/submission.ts`; the script only touches the
file system and runs commands.

## Correctness properties

1. The secret scan finds every kind it knows and reports no value; it finds
   nothing in ordinary text that avoids the secret shapes.
2. Shot lists whose rows are contiguous and end at the total pass the timing
   checks; any gap, overlap, wrong total or short Kiro time is reported.
3. A clock time parses only when seconds are 00–59.
