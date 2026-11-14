# Requirements: Review 4 (spec 24)

Source: `docs/review-4.md` (owner, 14 Nov). Twelve items, one task and one commit each.
Guardrails: no push, no deploy, no `terraform apply`, no spending.

1. A caption is a plain English phrase. Never a file name, camera or catalogue number, photographer
   handle or another language. Source order: Commons English description, Commons structured caption
   (`en` label), a hand-checked override, else the picture is dropped. The twelve strings in the review
   are failing test cases. The count each rule drops is reported.
2. Credits show a name. A URL author becomes the account name ("anoldent on Flickr").
3. The Pictures screen opens on quality: Featured, Quality and Valued first, then article leads, one
   picture per article before repeats; nothing clinical on the first screen.
4. The lead picture of an article is its highest-scored picture that shows the whole subject (Colosseum,
   judges' path, the 30 biggest countries).
5. A quiz card's picture comes from the quiz's own article; a test fails if not.
6. The articles with fewer than four pictures are listed; filled from the Commons category when good
   pictures exist.
7. Picture questions: photographs of one clear subject only; answer is the picture's own article; wrong
   answers are the same kind of thing.
8. Fill-the-gap wrong answers have the same part of speech and are plausible (property test).
9. The credits page is paged (100 per page) with search; summary and non-picture credits on the first view.
10. Continent stamp sheets: perforated stamp slots; found show the stamp picture, unfound a faint "?".
11. Coordinate strings are stripped from snippets and leads ("117°E / 30.900; 31.117" is a test case).
12. Retake screenshots; `licences`, `submission-check`, `offline-check` pass; numbers refreshed; report.
