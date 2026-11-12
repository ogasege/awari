# Requirements: Submission pack

## Introduction

Everything Devpost asks for, ready for the owner to paste, record or run:
the README, credits, write-up, video script, judge guide, bonus-prize
drafts, a runbook for the steps only the owner may take (GitHub, AWS
apply, deploy), and one command that fails when a hard rule is at risk.

## Glossary

- **Gate**: `npm run submission-check`.
- **Owner steps**: creating the GitHub repo and pushing, `terraform
  apply`, uploading the site, recording the video and submitting. The
  build never does these.

## Requirements

### Requirement 1: Documents

1. THE repository SHALL contain `README.md` (what Awari is, a screenshot,
   how to run it, how Kiro was used, licences), `CREDITS.md`,
   `docs/devpost.md`, `docs/video-script.md`, `docs/judges.md`,
   `docs/blog-post.md`, `docs/social-post.md` and `docs/runbook.md`.
2. THE write-up SHALL name the Resurrection category and give concrete
   examples from `docs/kiro-log.md` covering specs, steering, hooks and
   chat-driven coding, challenges and what is next.
3. THE video script SHALL run exactly 2 minutes 55 seconds, with a shot
   list whose timings add up, no third-party logos, no copyrighted music
   and at least 40 seconds showing Kiro at work.
4. THE judge guide SHALL let a judge test the main journey, including
   offline, in under two minutes.
5. THE name of the product that inspired Awari SHALL appear at most once,
   in plain words, in `README.md` and in `docs/devpost.md`, and nowhere
   else.

### Requirement 2: The gate

1. THE Gate SHALL fail IF `.kiro/steering`, `.kiro/specs` or
   `.kiro/hooks` is missing or empty, or `.gitignore` would hide `.kiro`.
2. THE Gate SHALL fail IF `LICENSE` is not MIT, or a bundled photo or
   data file has no entry in `CREDITS.md`.
3. THE Gate SHALL fail IF a required document is missing, or the video
   script's shot list does not add up to 2:55.
4. THE Gate SHALL fail IF a secret (an AWS key, a private key or a
   token) is present in any file that is committed or could be.
5. THE Gate SHALL fail IF lint, typecheck, tests or the build fail, or
   the first-load JavaScript is over 300 KB.
6. THE secret scan SHALL be a pure function with tests: it finds each
   kind of secret it knows and none in ordinary text.

### Requirement 3: Owner steps

1. THE runbook SHALL list the exact commands to create the public GitHub
   repo, push, plan and apply Terraform, upload the site, verify the live
   site, keep it up until 29 January 2027, and finish the submission.
2. THE runbook SHALL mark each step that spends money or publishes.
