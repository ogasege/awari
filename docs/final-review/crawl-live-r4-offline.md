# Crawl live-r4-offline

Base: https://d3txwsv4mn6ye9.cloudfront.net (offline after saving). Run: 2026-11-18T22:03:15.964Z.

- Screens visited: 196 (98 distinct routes, both widths)
- Controls activated: 864 (0 in the button sweep, 864 in scripted journeys)
- Screen failures: 0; control failures: 5
- Designed picture placeholders shown (pictures not saved yet): 1 on 1 screens
- Controls under 44 px on the phone layout (not counted as failures, listed for review): 15

## Controls activated per screen type

| Screen type | Activated | Failed |
|---|---|---|
| article | 4 | 0 |
| atlas | 32 | 0 |
| castle | 64 | 0 |
| credits | 12 | 0 |
| home | 52 | 1 |
| make-a-quiz | 10 | 0 |
| not-found | 2 | 0 |
| pictures | 54 | 4 |
| quiz | 478 | 0 |
| search | 28 | 0 |
| stamp book | 14 | 0 |
| timeline | 72 | 0 |
| tour | 42 | 0 |

## Small controls on the phone layout, by component

- `a.`: 15

## Failing screens (first 60)

## Failing controls (first 80)
- [1440] (pictures) `/media` "Next picture": threw: locator.click: Timeout 3000ms exceeded.
- [1440] (pictures) `/media` "Previous picture": threw: locator.click: Timeout 3000ms exceeded.
- [390] (home) `/` "link /stamps": threw: locator.click: Timeout 4000ms exceeded.
- [390] (pictures) `/media` "Next picture": threw: locator.click: Timeout 3000ms exceeded.
- [390] (pictures) `/media` "Previous picture": threw: locator.click: Timeout 3000ms exceeded.
