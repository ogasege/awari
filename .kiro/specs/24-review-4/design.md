# Design: Review 4

- Captions: `scripts/media/caption.ts` gets stricter rules (file-name shapes, catalogue residue, foreign
  words). `scripts/media/captions-override.json` holds hand-checked captions keyed by Commons title; a value
  of `null` drops the picture. `scripts/media/structured.ts` fetches `wbgetentities` labels (en) politely
  through the existing queue and caches them under `data/raw`. A caption from a file title is accepted only
  through the override list.
- Authors: `authorName()` in `scripts/media/licences.ts` turns a URL into "<account> on <site>", applied at
  record build time and in the check.
- Ordering: build writes a `rank` per picture (Commons quality status from the API, lead pictures, one per
  article); the Pictures screen sorts by it by default.
- Questions: `src/features/quiz/picture.ts` uses kind `photo` and same-pack siblings only.
- Cloze: distractors chosen by part of speech from the dictionary pack.
- Credits: paged table with search.
- Stamp sheets: SVG perforated slot component shared by Atlas and stamp book.
- Snippets: one `stripCoordinates()` shared by search and article lead rendering.

Properties: P1 no caption is a file name or non-English; P2 every picture question is a photograph whose
answer is its article; P3 cloze distractors share the answer's part of speech; P4 no coordinate string in
any snippet.
