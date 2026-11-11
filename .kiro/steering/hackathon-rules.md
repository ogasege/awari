---
inclusion: always
---

# Hackathon rules (Kiroween 2026, Resurrection category)

Copied word for word from KICKOFF.md, which supersedes docs/brief.md
where the two differ. Breaking a hard rule can disqualify the entry, so
any change that would break one needs the owner's sign-off first.

## Hard rules (breaking one can disqualify the entry)

1. The repo root must contain `/.kiro` with `steering/`, `specs/` and `hooks/`. Never gitignore it.
2. Awari is an original design. Never brand anything as Encarta, and never use Microsoft's logo, layout, screenshots or artwork in the product, repo or video. The README and write-up may say once, in plain words, that Awari is inspired by Encarta and the CD-ROM encyclopedias of the 1990s.
3. Public GitHub repo with an MIT `LICENSE`. All content must be openly licensed and credited (see Content).
4. The app must stay free and online until 29 January 2027.
5. All code is new work. Do not copy code from other projects.
6. Submission deadline: Friday 4 December 2026, 2:00 pm Pacific. Feature freeze: Friday 27 November. Target submission: Wednesday 2 December.

## Content and licences

- Wikipedia and Simple English Wikipedia text: CC BY-SA 4.0. Credit on every article.
- Wikidata: CC0. Natural Earth: public domain. Open English WordNet: CC BY 4.0.
- Photos: Wikimedia Commons only, with author and licence in `CREDITS.md`. The ten used in the design are listed in `design/CREDITS.md`.
- Every fact shown in a handwritten note must be true and checked against the article it points to.

## Quality bar

- Unit tests and property-based tests pass before a task is marked done.
- Keyboard reachable, visible focus, WCAG AA contrast.
- First load under 300 KB of JavaScript before packs; packs load on demand.
- No secrets in the repo.

## Stop and ask

- AWS credentials, Bedrock model access, or anything that spends money.
- Creating the GitHub repo or pushing to it.
- Deploying to a public URL.
- Any change that would break a hard rule.

## How these rules are enforced

- `npm run rules` (also an `agentStop` hook) fails if `.kiro/steering`,
  `.kiro/specs` or `.kiro/hooks` is missing or empty, if `.gitignore`
  would hide `.kiro`, if `LICENSE` is not MIT, or if the banned name
  appears anywhere except the files that state this rule (`KICKOFF.md`,
  `docs/brief.md`, this file) and at most one plain-words mention each in
  `README.md` and `docs/devpost.md`.
- `npm run credits` (also a file hook) fails if a bundled photo or data
  file under `public/` has no entry in `CREDITS.md`.
- `npm run submission-check` runs every gate plus a secret scan, the
  build and the tests.
- Commit after each completed spec task: `<spec> <task>: <summary>`.
