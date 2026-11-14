# Crawl live-before-390

Base: https://d3txwsv4mn6ye9.cloudfront.net. Run: 2026-11-14T22:42:49.725Z.

- Screens visited: 359 (359 distinct routes, both widths)
- Controls activated: 518 (78 in the button sweep, 440 in scripted journeys)
- Screen failures: 1; control failures: 3
- Controls under 44 px on the phone layout (not counted as failures, listed for review): 908

## Controls activated per screen type

| Screen type | Activated | Failed |
|---|---|---|
| article | 1 | 0 |
| atlas | 16 | 0 |
| castle | 32 | 0 |
| credits | 6 | 0 |
| home | 26 | 3 |
| make-a-quiz | 5 | 0 |
| not-found | 1 | 0 |
| pictures | 28 | 0 |
| quiz | 250 | 0 |
| search | 12 | 0 |
| stamp book | 6 | 0 |
| sweep of buttons | 78 | 0 |
| timeline | 36 | 0 |
| tour | 21 | 0 |

## Small controls on the phone layout, by component

- `a.`: 718
- `input.`: 161
- `a.tl-note__link`: 20
- `button.timeline__chip`: 8
- `select.`: 1

## Failing screens (first 60)
- [390] `/quizzes`: horizontal overflow: 1134 > 390

## Failing controls (first 80)
- [390] (home) `/` "link /article/earth/sahara": threw: locator.click: Timeout 4000ms exceeded.
- [390] (home) `/` "link /article/countries/madagascar": threw: locator.click: Timeout 4000ms exceeded.
- [390] (home) `/` "link /article/wildlife/penguin": threw: locator.click: Timeout 4000ms exceeded.
