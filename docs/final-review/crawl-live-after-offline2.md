# Crawl live-after-offline2

Base: https://d3txwsv4mn6ye9.cloudfront.net (offline after saving). Run: 2026-11-15T01:01:46.308Z.

- Screens visited: 196 (98 distinct routes, both widths)
- Controls activated: 900 (0 in the button sweep, 900 in scripted journeys)
- Screen failures: 1; control failures: 17
- Designed picture placeholders shown (pictures not saved yet): 0 on 0 screens
- Controls under 44 px on the phone layout (not counted as failures, listed for review): 17

## Controls activated per screen type

| Screen type | Activated | Failed |
|---|---|---|
| article | 4 | 0 |
| atlas | 32 | 0 |
| castle | 64 | 0 |
| credits | 12 | 0 |
| home | 60 | 4 |
| make-a-quiz | 10 | 0 |
| not-found | 2 | 0 |
| pictures | 56 | 4 |
| quiz | 504 | 0 |
| search | 28 | 2 |
| stamp book | 14 | 1 |
| timeline | 72 | 0 |
| tour | 42 | 6 |

## Small controls on the phone layout, by component

- `a.`: 15
- `input.`: 1
- `select.`: 1

## Failing screens (first 60)
- [390] `/media`: broken images: 1 (/media/img/5c24c12d9edef190.webp)

## Failing controls (first 80)
- [1440] (home) `/article/countries/trinidad-and-tobago` "link /article/countries/random": ok; blank screen
- [1440] (home) `/timeline?year=1804` "On this day on 2026-01-01": 3 notes; request failed /photos/falls.jpg
- [1440] (home) `/timeline?year=1804` "On this day on 2026-07-04": 3 notes; request failed /photos/kili.jpg
- [1440] (tour) `/article/earth/nile?tour=rivers&stop=1` "/tours/rivers open the article": ok; request failed /packs/earth/murray-river.json
- [1440] (tour) `/article/ancient/great-pyramid-of-giza?tour=wonders&stop=1` "/tours/wonders open the article": ok; request failed /packs/ancient/lighthouse-of-alexandria.json
- [1440] (tour) `/article/earth/krakatoa?tour=volcanoes&stop=1` "/tours/volcanoes open the article": ok; request failed /packs/earth/popocatepetl.json
- [1440] (pictures) `/media` "Next picture": threw: locator.click: Timeout 3000ms exceeded.
- [1440] (pictures) `/media` "Previous picture": threw: locator.click: Timeout 3000ms exceeded.
- [1440] (search) `/search?q=okapi` "header search box submits": ok; request failed /photos/kili.jpg
- [390] (home) `/timeline?year=1804` "On this day on 2026-01-01": 3 notes; request failed /photos/falls.jpg
- [390] (tour) `/article/earth/nile?tour=rivers&stop=1` "/tours/rivers open the article": ok; request failed /packs/earth/murray-river.json
- [390] (tour) `/article/ancient/great-pyramid-of-giza?tour=wonders&stop=1` "/tours/wonders open the article": ok; request failed /packs/ancient/lighthouse-of-alexandria.json
- [390] (tour) `/article/earth/krakatoa?tour=volcanoes&stop=1` "/tours/volcanoes open the article": ok; request failed /packs/earth/popocatepetl.json
- [390] (pictures) `/media` "Next picture": threw: locator.click: Timeout 3000ms exceeded.
- [390] (pictures) `/media` "Previous picture": threw: locator.click: Timeout 3000ms exceeded.
- [390] (search) `/search?q=okapi` "header search box submits": ok; request failed /photos/kili.jpg
- [390] (stamp book) `/stamps` "Start again, then No": threw: locator.click: Timeout 3000ms exceeded. (- <span>Saved. Awari now works without a connection. Pict…</span> from <div class="app__bo)
