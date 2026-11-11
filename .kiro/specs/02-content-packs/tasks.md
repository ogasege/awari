# Tasks: Content packs

- [x] 1. Spec: requirements, design with correctness properties, tasks.
      _Req 1–10_
- [x] 2. Pure text transforms
  - [x] 2.1 `slug.ts` and `text.ts` (sections, sentences, summary) with
        Properties 1 and 2. _Req 2.3–2.7_
  - [x] 2.2 `licence.ts` (normalisation, image filter) and `sources.ts`
        with Properties 3 and 11. _Req 5.2, 9.1_
- [x] 3. Cached, polite HTTP client `http.ts`. _Req 1.2, 1.3_
- [ ] 4. Countries
  - [ ] 4.1 `wikidata.ts` parsers with Properties 4 and 5. _Req 3.2–3.5_
  - [ ] 4.2 `countries.ts`: selection, articles, facts, African check.
        _Req 2.1–2.8, 3.1–3.5_
- [ ] 5. Physics pack `physics.ts`. _Req 4.1, 4.2_
- [ ] 6. Margin notes `notes.ts` with Property 9. _Req 8.1–8.4_
- [ ] 7. Photos `photos.ts` (Commons candidates, acceptance, sharp).
      _Req 5.1–5.6_
- [ ] 8. Dictionary `wordnet.ts` with Properties 6 and 7. _Req 6.1–6.5_
- [ ] 9. Atlas `atlas.ts` with Property 8. _Req 7.1–7.4_
- [ ] 10. Credits, manifest, validation and the build
  - [ ] 10.1 `credits.ts` with Property 10, `manifest.ts`,
        `validate.ts`. _Req 9.2–9.5, 10.1_
  - [ ] 10.2 `build.ts`: staging, swap, run `npm run packs`, commit the
        packs. _Req 1.1, 1.4, 1.5, 10.2_
- [ ] 11. Pack validation test over committed output; lint, typecheck,
      credits and a clean-cache rebuild. _Req 10.1, 10.2, 1.2_
