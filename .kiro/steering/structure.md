---
inclusion: always
---

# Structure

```
.kiro/
  steering/          product, tech, structure, design, hackathon rules
  specs/NN-feature/  requirements.md (EARS), design.md, tasks.md
  hooks/             *.kiro.hook agent hooks
design/              kit reference (home.html, home.png, logo/) + screens/
docs/                brief, kiro-log (evidence), video script, Devpost draft
scripts/
  packs/             content pack build pipeline (npm run packs)
  check-*.ts         credits, rules and bundle-budget gates
  kiro-log.ts        appends a dated entry to docs/kiro-log.md
public/packs/        generated JSON packs and photos (committed)
src/
  app/               App, router, routes, header, layout
  design/            tokens.css, global.css and hand-made components
  features/<name>/   home, article, atlas, quiz, castle, timeline, stamps
  lib/               packs loader, quiz engine, dictionary, store, text
  sw/                service worker source
services/quiz-lambda Lambda + Bedrock quiz generator (own package.json)
infra/terraform/     S3, CloudFront, Lambda
```

## Conventions

- Feature code lives in `src/features/<name>/`; shared logic that has no
  React in it lives in `src/lib/` so it can be property-tested and reused
  by the Lambda.
- Tests sit beside the code: `*.test.ts(x)` for examples,
  `*.property.test.ts` for fast-check properties.
- Pack types are defined once in `src/lib/packs/types.ts` and imported by
  the pipeline, the app and the Lambda.
- Decorative elements carry `aria-hidden="true"` and the `deco` class,
  which hides them on narrow screens where they would crowd content.
- Commit messages: `<spec> <task>: <summary>`, for example
  `05-quizzes 2.1: hint ladder engine`.
- After each spec task, append an entry to `docs/kiro-log.md` with
  `npm run log -- --spec <spec> --task <n> --by <steering|hook|spec> --note "…"`.
