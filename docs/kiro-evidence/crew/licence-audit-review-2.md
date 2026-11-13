# Licence audit: 21-review-2 photographs

Auditor: awari-licence-auditor. Read-only. Date: 2026-11-13.
Method: Commons API (extmetadata, 3 batched requests, 3 s apart, none throttled) for all 36 files
(10 commons covers + 25 lead overrides + the bundled `photos/pyramids.jpg` ancient cover, which is
the same Commons file as Egypt's lead). Licence/author compared with `CREDITS.md` and with
`public/packs/countries/<id>.json` `photos[0].credit`; every bundled JPG was viewed.
Commons page URLs in CREDITS.md / JSON all resolve to the right file (only percent-encoding differs). Not checked: nothing skipped.

## Licence verdict
All 36 licences are allowed (PD, CC0, CC BY 2.0/4.0, CC BY-SA 2.0/2.5/3.0/4.0). All authors match Commons
(two differ by a stray space only, see D5). No licence defects.

## Covers (`public/photos/covers/`)
| File | Licence | Author match | Shows what it claims | Problems |
| --- | --- | --- | --- | --- |
| countries.jpg | CC BY 4.0 | yes | **no** | Hand-drawn children's poster "Flags of the world"; alt says real flags flying side by side |
| wildlife.jpg | CC BY 2.0 | yes | yes | Lion lying in grass; alt says "looking out", fine |
| space.jpg | PD | yes | yes | |
| earth.jpg | CC BY-SA 2.5 | yes | yes | Everest, ok |
| body.jpg | CC BY-SA 4.0 | yes | partly | A plastic classroom model skeleton, head and ribs only, not "standing"; dim |
| science.jpg | CC BY-SA 4.0 | yes | **no** | Two black-and-white stoppered flasks of clear liquid; alt says "coloured liquids" |
| physics.jpg | CC BY-SA 3.0 | yes | yes | Plasma ball, purple and pink; ok |
| inventions.jpg | PD | yes | yes | Wright Flyer 1903 |
| people.jpg | PD | yes | yes | Einstein |
| arts.jpg | PD | yes | yes | Mona Lisa |
| photos/pyramids.jpg (ancient) | CC BY-SA 2.0 | yes | yes | Giza; bundled, same file as Egypt lead |

## Lead overrides (`public/packs/img/<country>.jpg`)
| File | Licence | Author match | Shows what it claims | Problems |
| --- | --- | --- | --- | --- |
| nigeria | CC BY-SA 4.0 | yes | yes | Hazy, power lines across the rock; weak but accurate |
| india | CC BY-SA 3.0 | yes | yes | D5 (space) |
| peoples-republic-of-china | CC0 | yes | yes | |
| indonesia | PD | yes | yes | |
| pakistan | CC BY-SA 4.0 | yes | yes | |
| brazil | CC BY-SA 4.0 | yes | yes | |
| bangladesh | CC BY-SA 4.0 | yes | yes | |
| russia | CC BY-SA 4.0 | yes | yes | |
| mexico | CC BY-SA 4.0 | yes | yes | |
| ethiopia | CC BY-SA 3.0 | yes | yes | |
| egypt | CC BY-SA 2.0 | yes | yes | |
| vietnam | CC BY-SA 3.0 | yes | yes | |
| iran | CC BY-SA 3.0 | yes | yes | |
| philippines | CC BY-SA 4.0 | yes | yes | |
| france | PD | yes | yes | |
| united-states | PD | yes | yes | |
| united-kingdom | CC BY-SA 3.0 | yes | yes | Night shot |
| italy | CC BY-SA 4.0 | yes | yes | Black and white; fine |
| spain | CC BY-SA 4.0 | yes | yes | Scaffold and cranes visible; accurate |
| colombia | PD | yes | **no (JSON alt)** | D1: article JSON alt does not describe the picture |
| south-africa | CC BY 2.0 | yes | yes | Child on beach in foreground |
| tanzania | CC BY-SA 4.0 | yes | yes | |
| kenya | CC BY-SA 4.0 | yes | yes | |
| myanmar | CC BY-SA 4.0 | yes | yes | |
| south-korea | CC BY-SA 4.0 | yes | yes | |

## Defects and fixes
- D1 (real, article text): `public/packs/countries/colombia.json` photos[0].alt is "The old walled city of Cartagena beside the sea"; the picture is a street of painted houses with no walls or sea. lead-overrides.ts has the right alt. Fix: set JSON alt to "A street of brightly painted houses in the old city of Cartagena" (re-run `scripts/packs/apply-lead-overrides.ts`; it evidently did not refresh alt for this pack). The other 24 packs' alt and caption equal the override text.
- D2 (real, wrong claim): `src/lib/packs/covers.ts` countries cover is a child-drawn flag poster. Fix: change alt to "A poster of hand-drawn flags from many countries", or better swap to a photo of real flags (e.g. a Commons photo of flags at the UN, then update CREDITS.md and the prepare script entry).
- D3 (real, wrong claim): science cover alt "coloured liquids" is false. Fix: alt "Two glass laboratory flasks with stoppers" (or swap for a colourful lab photo).
- D4 (minor): body cover alt "A human skeleton standing" -> "A model of a human skeleton, head and chest".
- D5 (cosmetic): India author in CREDITS.md and JSON is "Dhirad , picture edited by J. A. Knudsen" (space before comma) vs Commons "Dhirad, picture edited by J. A. Knudsen"; Colombia has "CONOCER at wts" vs Commons double space "at  wts". Fix: normalise, or leave (harmless).
- Note: Cartagena is tagged PD via a Wikivoyage-shared template; acceptable. Pixel identity with Commons originals was not byte-compared; matched by eye.
