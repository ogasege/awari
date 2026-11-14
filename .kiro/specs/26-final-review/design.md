# Design: 26-final-review

## Crawl (`scripts/final-review/crawl.ts`)
- Base URL from `CRAWL_URL` (default the live site); `CRAWL_WIDTHS=1440,390`; `CRAWL_LIMIT` for a
  quick run. The desktop app is crawled with the same code through Playwright's Electron mode
  (`CRAWL_DESKTOP=1`), reusing the launch from `scripts/desktop-check.ts`.
- A breadth-first queue of states keyed by URL. For each state: wait for the route to settle, collect
  interactive elements (`a[href]`, `button`, `[role=button|tab|link|option|radio|checkbox]`, `input`,
  `select`, `summary`, `[tabindex="0"]`), record name, role and box, then activate each one in a fresh
  load of the state (so one control's effect cannot hide another's).
- Sense checks per activation: page error, console error, failed request (excluding the designed
  Commons large-view request when offline), a `NotFound` heading on an in-app link, an empty main,
  no visible change (DOM hash and URL unchanged) for a control that is not a toggle, and an article
  whose heading does not match the link text.
- Layout checks per state and width: horizontal overflow, controls under 44 px (390 only), text
  clipped (`scrollWidth > clientWidth` on text blocks with `overflow: hidden`), overlapping
  interactive boxes, images with `naturalWidth === 0` and no fallback.
- Seeds for breadth (from the pack indexes): every subject, every country, 150+ articles sampled
  evenly across subjects, every tour stop, every Castle wing and room, quiz types, search cases, On
  this day dates, Credits pages, 40+ deep links and unknown URLs.
- Writes `docs/final-review/crawl.json` and prints totals; `crawl-summary.md` is generated from it.

## Assessments
- axe through `@axe-core/playwright` on one URL per screen type at both widths.
- Lighthouse through the `lighthouse` CLI against the live site (mobile and desktop presets); slow
  3G with Playwright network throttling via CDP, measuring time until the Home heading is visible.
- The design reviewer gets small screenshots (viewport crops, not full pages) in batches, learning
  from the round-1 "request too large" failure.

## Evidence layout (`docs/final-review/`)
`crawl.json`, `crawl-summary.md`, `cdrom-comparison.md`, `ux-review.md`, `a11y.json`,
`lighthouse/*.json`, `performance.md`, `findings.md`, `readiness.md`, `judging.md`, `report.md`.
