# Crawl live-after-offline3

Base: https://d3txwsv4mn6ye9.cloudfront.net (offline after saving). Run: 2026-11-15T01:23:02.435Z.

- Screens visited: 196 (98 distinct routes, both widths)
- Controls activated: 790 (0 in the button sweep, 790 in scripted journeys)
- Screen failures: 1; control failures: 7
- Designed picture placeholders shown (pictures not saved yet): 0 on 0 screens
- Controls under 44 px on the phone layout (not counted as failures, listed for review): 17

## Controls activated per screen type

| Screen type | Activated | Failed |
|---|---|---|
| article | 4 | 0 |
| atlas | 32 | 0 |
| castle | 64 | 0 |
| credits | 12 | 0 |
| home | 52 | 2 |
| make-a-quiz | 10 | 0 |
| not-found | 2 | 0 |
| pictures | 56 | 4 |
| quiz | 402 | 0 |
| search | 28 | 0 |
| stamp book | 14 | 1 |
| timeline | 72 | 0 |
| tour | 42 | 0 |

## Small controls on the phone layout, by component

- `a.`: 15
- `input.`: 1
- `select.`: 1

## Failing screens (first 60)
- [390] `/media`: broken images: 1 (/media/img/6fb8db6648406b41.webp)

## Failing controls (first 80)
- [1440] (home) `/` "link /stamps": threw: locator.click: Timeout 4000ms exceeded.
- [1440] (pictures) `/media` "Next picture": threw: locator.click: Timeout 3000ms exceeded.
- [1440] (pictures) `/media` "Previous picture": threw: locator.click: Timeout 3000ms exceeded.
- [390] (home) `/` "link /subject/earth": threw: locator.click: Timeout 4000ms exceeded.
- [390] (pictures) `/media` "Next picture": threw: locator.click: Timeout 3000ms exceeded.
- [390] (pictures) `/media` "Previous picture": threw: locator.click: Timeout 3000ms exceeded.
- [390] (stamp book) `/stamps` "Start again, then No": threw: locator.click: Timeout 3000ms exceeded. (- <span>Saved. Awari now works without a connection. Pict…</span> from <div class="app__bo)
