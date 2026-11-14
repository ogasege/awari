# Crawl local-journeys-390

Base: http://127.0.0.1:4173. Run: 2026-11-14T22:20:53.063Z.

- Screens visited: 0 (0 distinct routes, both widths)
- Controls activated: 341 (0 in the button sweep, 341 in scripted journeys)
- Screen failures: 0; control failures: 6
- Controls under 44 px on the phone layout (not counted as failures, listed for review): 0

## Controls activated per screen type

| Screen type | Activated | Failed |
|---|---|---|
| article | 1 | 1 |
| atlas | 16 | 0 |
| castle | 32 | 0 |
| credits | 6 | 0 |
| home | 31 | 4 |
| make-a-quiz | 1 | 1 |
| not-found | 1 | 0 |
| pictures | 28 | 0 |
| quiz | 150 | 0 |
| search | 12 | 0 |
| stamp book | 6 | 0 |
| timeline | 36 | 0 |
| tour | 21 | 0 |

## Small controls on the phone layout, by component


## Failing screens (first 60)

## Failing controls (first 80)
- [390] (home) `/article/countries/bulgaria` "link /article/countries/random": ok; blank screen
- [390] (home) `/` "link /article/earth/sahara": threw: locator.click: Timeout 4000ms exceeded. (- element is not visible)
- [390] (home) `/` "link /article/countries/madagascar": threw: locator.click: Timeout 4000ms exceeded. (- element is not visible)
- [390] (home) `/` "link /article/wildlife/penguin": threw: locator.click: Timeout 4000ms exceeded. (- element is not visible)
- [390] (make-a-quiz) `/quizzes` "form": make-a-quiz form not found on /quizzes
- [390] (article) `/article/countries/nigeria` "double-click a word opens a word card": word card shown; console: Failed to load resource: the server responded with a status of 404 ()
