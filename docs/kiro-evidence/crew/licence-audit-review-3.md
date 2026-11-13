# Licence audit: 22-review-3 photographs

Auditor: awari-licence-auditor. Read-only (this file is the only write). Date: 2026-11-13.

Method: Commons API `action=query&prop=imageinfo&iiprop=extmetadata|url|size` for each of the 12
files, one request every 2 s, 30 s timeout, 12 requests plus 3 follow-ups (`ImageDescription` for
`Dhows on the Nile.jpg` and `Sydney Opera House - Dec 2008.jpg`, licence wikitext for
`Lagos skyline with marina.jpg`). **None was throttled, so nothing was skipped.** Commons
`LicenseShortName`, `Artist` (raw HTML, so a stray space is real and not a strip artefact) and
`descriptionurl` compared byte-for-byte against the `CREDITS.md` row and the article JSON
`photos[].credit`; URLs compared percent-decoded. Every one of the 12 JPGs was opened and looked at.
Pixel identity was not byte-compared, but each local file's aspect ratio matches its Commons
original to within 0.1%, so each is a plain downscale of the file it names (no crop, no substitution).

Not available: the `@kirocrew-computer` MCP server is not configured in this session, so there was
no browser or screen tooling. Alt text was judged against the image files, not against rendered
screens. `npm run credits` was not run (read-only remit).

## Licence verdict

All 12 licences allow reuse: 4 public domain, 8 CC BY-SA (2.0 / 3.0 / 4.0). Every
attribution-required file names its author identically in `CREDITS.md` and in the article JSON, and
every `licenceUrl` matches the Commons `LicenseUrl`. **No licence defect, no author defect beyond
the cosmetic D5, no wrong source URL.** The 5 defects below are all alt text or caption, on 4 files,
plus one stray space.

`Lagos skyline with marina.jpg` (the Nigeria replacement required by Req 22) is
`{{PD-author-FlickrPDM}}` with a passed `FlickreviewR` (reviewed 2024-04-21, licence
"Public Domain Mark", author kopee15), so the "Public domain" claim and the
`publicdomain/mark/1.0/` licence URL are exactly right.

## Per-file result

| File | Commons file | Licence (Commons = recorded) | Author | Source URL | Alt describes the picture | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| packs/img/nigeria.jpg | Lagos skyline with marina.jpg | Public domain (PD-author-FlickrPDM) | kopee15, exact | exact | yes — Lagos towers across the water, ships and boats at the marina | **PASS** |
| packs/img/wildlife-bat.jpg | Grey headed flying fox - AndrewMercer IMG41833.jpg | CC BY-SA 4.0 | Andrew Mercer (www.baldwhiteguy.co.nz), exact | exact | yes — one grey-headed flying fox in flight, single subject (Req 21) | **PASS** |
| packs/img/wildlife-hummingbird.jpg | Anna's hummingbird (Calypte anna) male in flight Campbell River.jpg | CC BY-SA 4.0 | Charles J. Sharp, exact | exact (only `%27` differs) | yes — a hummingbird hovering, wings spread, single subject (Req 21) | **PASS** |
| packs/img/earth-nile.jpg | Dhows on the Nile.jpg | Public domain | Jordan Busson, exact | exact | **no** — alt says "Dhows", the picture has one boat (D1) | **DEFECT** |
| packs/img/ancient-great-pyramid-of-giza.jpg | Gizeh Cheops BW 1.jpg | CC BY-SA 3.0 | Berthold Werner, exact | exact | **no** — alt is the caption again, case apart (D3) | **DEFECT** |
| packs/img/earth-mount-fuji.jpg | 080103 hakkai fuji.jpg | CC BY-SA 3.0 | 名古屋太郎, exact | exact | **no** — "A picture of Mount Fuji" is filler, describes nothing (D4) | **DEFECT** |
| packs/img/egypt.jpg | All Gizah Pyramids.jpg | CC BY-SA 2.0 | Ricardo Liberato, exact | exact | yes — three big pyramids in the desert | **PASS** |
| packs/img/india.jpg | Taj Mahal in March 2004.jpg | CC BY-SA 3.0 | space before the comma (D5) | exact | yes — white marble Taj Mahal, dome and four minarets | **DEFECT** (cosmetic) |
| packs/img/france.jpg | Tour Eiffel Wikimedia Commons.jpg | Public domain | Benh LIEU SONG, exact | exact | yes — the Eiffel Tower at full height from the Champ de Mars; thin but true | **PASS** |
| packs/img/united-states.jpg | Statue of Liberty frontal 2.jpg | Public domain | Daniel Schwen, exact | exact | yes — the statue head-on, torch raised, tablet, pedestal | **PASS** |
| packs/img/brazil.jpg | Redentor Over Clouds 1.jpg | CC BY-SA 4.0 | Donatas Dabravolskas, exact | exact | yes — Christ the Redeemer above a sea of cloud at sunrise | **PASS** |
| packs/img/australia.jpg | Sydney Opera House - Dec 2008.jpg | CC BY-SA 3.0 | Diliff, exact | exact | **no** — camera jargon, broken grammar, and it omits that the shot is at night (D2) | **DEFECT** |

## Defects and fixes

- **D1** (real, wrong count) `public/packs/earth/nile.json` `photos[0].alt` is
  "Dhows traversing the Nile near Aswan", copied verbatim from the Commons `ImageDescription`. The
  picture is **one** felucca with a tall white sail on blue water, palms and a rocky desert hill
  behind. Fix: `"A felucca with a tall white sail on the Nile, with palm trees and a rocky desert
  hill behind"`.
- **D2** (real, two parts) `public/packs/countries/australia.json`. (a) `alt` is
  `"A exposure blended photo of the Sydney Opera House , as viewed from the Sydney Harbour Bridge ."`
  — the Commons `ImageDescription` verbatim, so it carries the "A exposure" error, the spaces before
  `,` and `.`, and a note about the exposure technique instead of the picture; it also omits the
  most visible fact, that the shot is at night with the shells and the city lit. Fix:
  `"The Sydney Opera House lit up at night, its white shells beside the harbour with the city
  skyline behind"`. (b) `caption` is `"Sydney Opera House - Dec"`, cut mid-phrase out of the file
  name `Sydney Opera House - Dec 2008.jpg`. Fix: `"The Sydney Opera House at night"`.
- **D3** (real, empty alt) `public/packs/ancient/great-pyramid-of-giza.json` `alt` is
  "Great pyramid of Giza" and `caption` is "Great Pyramid of Giza" — the same words, capitalisation
  apart, so a screen reader says it twice and the alt adds nothing. The picture also has tourists
  and a saddled camel in the foreground. Fix:
  `"The Great Pyramid of Giza rising above the sand, with tourists and a saddled camel in front"`.
- **D4** (minor) `public/packs/earth/mount-fuji.json` `alt` is "A picture of Mount Fuji". "A picture
  of" is filler (a screen reader already announces an image) and the rest repeats the caption. Fix:
  `"Snow-capped Mount Fuji above a village of thatched roofs and bare winter trees"`.
- **D5** (cosmetic, carried over from review-2 D5, still unfixed) the India author is
  `"Dhirad , picture edited by J. A. Knudsen"` in `CREDITS.md` line 353 and in
  `public/packs/countries/india.json`; the Commons `Artist` field is
  `"Dhirad, picture edited by J. A. Knudsen"` with no space before the comma. Fix: drop the space in
  both files, or leave it — attribution is still unambiguous.

## Notes, no action needed

- India: the Commons `Permission` field keeps a 2005 note from the uploader asking for an e-mail
  before reuse. The file now carries a CC BY-SA 3.0 tag, which is the operative licence, and the
  author's preferred `Attribution` field is just "Dhirad". The recorded credit is a superset of
  that, so it satisfies the licence.
- Australia: the Commons page carries a freedom-of-panorama note (Australian Copyright Act
  ss 65–68) for the building itself. Nothing to record.
- Nigeria: 800x213 is a 3.76:1 panorama, matching the Commons original, so no crop went wrong — but
  it will render as a thin strip in a card. That is a design question for awari-design-reviewer,
  not a licence one.
- All 12 local copies are downscales of the Commons originals. CC BY-SA asks that changes be
  indicated; `CREDITS.md` says "Resized copies" only in the design-kit section. One sentence
  covering `packs/img/` would close that.
