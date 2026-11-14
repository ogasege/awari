# Media library licence audit: the 5% sample

Auditor: awari-licence-auditor. Read-only (this file is the only write). Date: 2026-11-14.

Sample: `docs/kiro-evidence/crew/media-sample.json` — 206 pictures, a seeded (20261114) random 5% of
the 4,106-picture library, covering 172 articles across all 11 subject files (countries 94, earth 15,
body 14, people 14, arts 12, ancient 12, science 11, wildlife 11, space 10, inventions 8, physics 5).

Method: my own checker, written for this audit and deliberately **not** importing
`scripts/media/licences.ts`, `check.ts` or `allow.ts` — the allow-list, the author comparison and the
caption test below are re-implemented from the audit brief, so a bug shared with the shipped script
cannot hide a defect. Commons API `action=query&prop=imageinfo&iiprop=extmetadata|url|size|sha1|mime`,
`formatversion=2`, `maxlag=5`, 50 titles per POST, one request at a time, 1.3 s apart, 30 s timeout,
`User-Agent: awari-licence-auditor/1.0 (Awari encyclopedia media audit; contact: …/issues)`.
Five requests covered all 206 distinct titles. **Nothing was throttled and nothing was skipped:**
0 maxlag errors, 0 HTTP 429/5xx, 0 retries, 206 of 206 titles answered.

Every thumbnail in `public/media/img/` was measured with `sharp`; ten were opened and looked at.

Not available: the `@kirocrew-computer` MCP server is declared by the agent spec but not configured in
this session, so there was no browser or screen tooling — captions were judged against the image files
and the Commons metadata, not against rendered pages. `work_brief` reports this session is not bound to
a work item, so the task text was taken as the definition of done. No git, no build, no deploy, no spend.

## Verdict

**No licence defect, no author defect, no restriction, no missing or non-Commons file, no bad
thumbnail.** All 206 pictures are hosted on Commons under public domain, CC0, CC BY or CC BY-SA, every
recorded author is the Commons `Artist` exactly, and every thumbnail is a true 480 px downscale of the
file it names.

The 16 defects are all **captions**, and 2 of them are also **content** defects (a page of printed text
and a cropped portrait shown as something else). Their root cause is in `scripts/media/caption.ts`, not
in the licence path. Separately, `scripts/media/select.ts` mis-classifies the *kind* of about a quarter
of the sample, which is shown with examples in the last section.

## Count per check

| # | Check | Pass | Defect | Notes |
| --- | --- | --- | --- | --- |
| 1 | File exists on Commons and is hosted there | 206 | **0** | every title answered with a pageid + imageinfo; 0 `missing`, 0 `invalid`. `imagerepository` is `local` for all 206, which — asked on Commons itself — means Commons, not a wiki-local upload |
| 2 | Licence is PD / CC0 / CC BY / CC BY-SA | 206 | **0** | 112 CC BY-SA, 67 public domain or CC0, 27 CC BY. 11 distinct `LicenseShortName` values, no NC, no ND, no GFDL-only, no fair use. The recorded licence string equals the Commons one for 206 of 206 |
| 3 | No `Restrictions` field | 206 | **0** | `Restrictions` empty in all 206 answers |
| 4 | Recorded author is the Commons `Artist` | 206 | **0** | exact match after HTML-to-text on 206 of 206. One file names no author on either side (D2), which is allowed because it is public domain |
| 5 | 480 px thumbnail is a downscale of that file | 206 | **0** | all present, all webp, all exactly 480 px wide, none larger than the original in either dimension, aspect within 0.35% of the Commons original (median 0.04%). Ten opened and compared — see below |
| 6 | Caption is an honest shortening of the Commons description or file name | 190 | **16** | 9 captions assert something the Commons description does not; 7 reproduce boilerplate, a fragment or catalogue metadata |

Secondary observations from the same data, not defects: 35 of 206 records carry a `th` that is 1 px
off the file on disk (rounding, D16); 11 of 206 files have an empty Commons `ImageDescription`;
24 files carry a GFDL category and 1 a CeCILL category beside their CC licence (dual-licensed, so
allowed); the smallest original long side in the sample is exactly 800 px, so the `MIN_SIDE` floor holds.

## Defects

| id | File | What | Suggested fix |
| --- | --- | --- | --- |
| `49f97db7e3a41600` | David - Portrait of Monsieur Lavoisier (cropped).jpg | Caption **"Chemical reaction"** on a cropped detail of David's portrait — the picture is one man's face. Commons says nothing about a reaction; `ObjectName` offers "Portrait of Monsieur de Lavoisier and his Wife, chemist Marie-Anne Pierrette Paulze" | Caption "Antoine Lavoisier, painted by Jacques-Louis David"; let `captionFor` read `ObjectName` when `ImageDescription` is empty |
| `0d3fc0d7245f9610` | GreenEssay.png | Caption **"Electricity"** on the printed **title page** of George Green's 1828 *Essay on the Application of Mathematical Analysis to the Theories of Electricity and Magnetism*. The picture is text only — no picture content — and is stored as `kind: "photo"` | Drop the file from `physics/electricity`; add a title-page/text-page rule to `NEVER` (see G3) |
| `fc8bedd705acc175` | Portret van Robert Boyle, RP-P-OB-4578 (cropped).jpg | Caption **"Chemical element"** on a Rijksmuseum portrait print of Robert Boyle. The Dutch description is catalogue fields; neither names an element | Caption "Robert Boyle, engraved portrait"; read `ObjectName` |
| `079ff28d56eaf850` | Map of Abyssinia and Nubia - DPLA - ….jpg | Caption **"Kingdom of Aksum"** on a 19th-century "Map of Abyssinia and Nubia". Commons description is the scale, `1:7,100,000`; Aksum is named nowhere | Caption "Map of Abyssinia and Nubia" from the file name |
| `09206be3da2cb0a1` | Official portrait of Rodney Williams (cropped).png | Caption **"Antigua and Barbuda"** on an official portrait of a named person the caption does not name | Caption "Rodney Williams, Governor-General"; strip the trailing "(cropped)" instead of rejecting the title (see G5) |
| `2a55ac0ea81d9dc1` | Mt-Grizim-national-park-7920.jpg | Caption **"Palestine"** where Commons says only "Mount Grizim." — the caption is broader than anything the description supports | Caption "Mount Grizim national park" |
| `a08ae7f2817aee29` | 2021-04-17 14-51-47 ILCE-7C DSC05825 DxO (…).jpg | Caption **"Static electricity"** is not supported by the description, which is a French batch blurb for a Brussels museum and states "Various pictures taken in 2021 without real subject". Opened: the picture does show a glowing plasma disc with a hand on it, so the caption is right about the *picture* and wrong about its source | Keep the picture, caption "A hand on a plasma disc"; stop captioning from a batch blurb (see G4) |
| `34acc3c62a7c2ed5` | Stick chart-BHM 1920.530.0032-P8260228.JPG | Caption **"Marshall Islands"** on a Marshallese navigation stick chart. True but says nothing; Commons description is empty, `ObjectName` has "Stick chart" | Caption "Marshallese stick chart"; read `ObjectName` |
| `3aa23b526c851725` | Yambo - Manoscritto trovato in una bottiglia … (page 9 crop).jpg | Caption **"Octopus"** is correct about the picture (a line drawing of a giant octopus reaching for a seated writer) but is the article title, not a shortening of the Italian book citation Commons gives | Caption "Octopus illustration by Yambo, 1905" |
| `5e881073b34f55ca` | BaAka woman dancing.jpg | Caption **"Cultural Fashion or Adornment from"** — a dangling fragment ending in a preposition. The Commons description is an unfilled Wiki Loves Africa form field with the same text | Caption from the file name, "BaAka woman dancing"; reject a candidate ending in a preposition (see G6) |
| `ad2c3c0010828b06` | Fernanda Nossa, Guinea-Bissau, photo 3.jpg | Caption **`"African people at work" from`** — same unfilled form field, plus a stray unbalanced quote | Caption "Police officer at work, Guinea-Bissau" from the file name and categories |
| `83f002e6450d51f3` | Burroughs adding machine display in Oxford National Bank window 1916 (…).jpg | Caption is library catalogue metadata including a URL: **"Persistent URL: digital.lib.muohio.edu/u?/snyder,1473 Subject (TGM): Calculators; Window…"** | `JUNK` must catch a bare host, not only `https?:` (see G8) |
| `4907a41609173b62` | Antennae galaxies xl.jpg | Caption opens with boilerplate about the file: **"Original caption from NASA: “This NASA Hubble Space Telescope image of the Antennae…"**, then truncates | Strip a leading "Original caption from …:" in `tidy`; caption "The Antennae galaxies, NGC 4038 and 4039" |
| `ac598239b2d4ea87` | Saint Lucia geography map en.png | Caption describes the making of the file, not the picture: **"A map of Saint Lucia that i created, based on a public domain map from the PCL, found…"** (lower-case "i" is the uploader's) | `SELF` should also reject a first person description; caption "Map of Saint Lucia" |
| `29c69e3acb627bf4` | DFC 5635 A serene shrine inside a Thai temple … .jpg | Caption talks about the photograph and hedges: **"This photograph captures the interior of an ornate Buddhist temple or memorial hall…"**. `SELF`'s verb list has no "captures" (see G7) | Caption "Shrine inside a Thai temple, Chon Buri" |
| `9aeeccc439626d0d` | Conjugate curvatures.png | Caption is one panel of a two-panel figure, with a bullet, truncated mid-clause: **"• LEFT: A large mass (blue) belongs to the positive sector where it creates a positive…"**. The file is a composite the `NEVER` filter did not catch | Reject a description starting with a panel marker; caption "Positive and negative curvature compared" |
| `D16` (35 records) | — | Recorded `th` is 1 px off the webp on disk (e.g. `568d155315c28fb8` 480×321 on disk, `th: 320`). Harmless, but if `th` is used for the `<img height>` it is a 1 px layout shift | Take `tw`/`th` from the encoded file rather than from the computed ratio |

## The ten thumbnails opened

Each is a plain 480 px downscale showing what Commons describes; no crop or substitution was found.

| id | What the thumbnail shows | Matches Commons |
| --- | --- | --- |
| `a08ae7f2817aee29` | a hand touching a glowing blue plasma disc | the picture is an electrostatic/plasma exhibit; the museum blurb describes the venue, not this shot (defect above) |
| `0d3fc0d7245f9610` | printed title page, "AN ESSAY … BY GEORGE GREEN", Nottingham 1828 | yes for the file, but it is text, not a picture (defect above) |
| `49f97db7e3a41600` | a man's face, 18th-century dress, oil painting | yes — the cropped David portrait |
| `34acc3c62a7c2ed5` | a lattice of tied sticks and shells on a museum wall | yes — a stick chart |
| `3aa23b526c851725` | line drawing: a giant octopus reaching tentacles at a seated writer | yes — the 1905 Yambo illustration |
| `5e881073b34f55ca` | a woman dancing in a forest camp, children watching | yes — "BaAka woman dancing" |
| `488b5734fe22fe2f` | a traffic policeman in a raised booth on a Nassau street | yes — but stored as `kind: "diagram"` (G1) |
| `22c1ffd2297b9371` | a line chart, uninsured US population 1963–2015 | yes |
| `aea274348e7f284a` | a red-roofed university tower behind a large tree | yes — the Universitas Indonesia rectorate |
| `4907a41609173b62` | two colliding spiral galaxies, pink star-forming knots | yes — the Antennae galaxies (caption defect above) |

## Gaps in `scripts/media/select.ts`

Each gap below is shown with an example drawn from this sample.

**G1 — `kindOf` matches "graph" inside "photograph", so plain photos become diagrams.** The regex is
`/diagram|chart|graph|schematic|infographic/` tested on title **plus Commons categories**, and almost
every photograph on Commons sits in a category containing the word "photographs". 44 of the 206 sample
pictures are stored as `kind: "diagram"`; **43 of those 44 have no diagram word in their file title**,
and 38 have "photograph" in their categories. Examples: `488b5734fe22fe2f` (Nassau traffic policeman,
"Photographs by Jay Jarosz" — opened, it is a street photo), `e63390aa4b1e90da` (Ada Lovelace statue,
"Photographs by Matt Brown"), `4907a41609173b62` (Hubble Antennae galaxies, "Featured photographs in
the public domain"), `0e2d5e937f1b0926` (a Nile crocodile swallowing a tilapia, "Photographs by Bernard
Dupont"). Because `perKindCap.diagram` is 2 while `photo` is `max`, the round-robin that exists to give
variety draws these from the wrong bucket and caps them at two per article, and the `kind` written into
each record — which the UI reads — is wrong for about a fifth of the library.
Fix: word-bound the term, `/\bgraph\b/`; `\b` already fails inside "photographs", so this one change
clears all 38.

**G2 — `kindOf` reads a "flags" category as "this picture is a flag".** All 4 sample pictures stored as
`kind: "flag"` have no flag word in their file title, and 3 are plainly not flags:
`b5b6d8565ea31b29` is the presidential palace in Bissau (category "Buildings with flags in
Guinea-Bissau"), `d9d0314a57389e4f` is a climber on the Everest summit ("Photographs of the national
flag of the Dominican Republic"), `41e355f0301ebcd6` is President Tsai receiving the Solomon Islands
Prime Minister ("Photographs of flags of the Solomon Islands"). Only `f13ff646327de17e` is a real flag.
With `perKindCap.flag` of 2, two such photos can take a country's flag slots and crowd out its actual
flag. Fix: drop categories matching `/photographs? of|buildings with/i` before classifying, or take the
kind from the file title and use categories only as a tie-break.

**G3 — `NEVER` has no rule for a page of text or an image sequence.** It covers logos, signatures,
icons, collages, montages and composites, but not a printed page or a "sequence of images".
Examples: `0d3fc0d7245f9610` (the 1828 title page described above, now in `physics/electricity`),
`196f036191815ba8` (Neptune, whose own description begins "This sequence of Hubble Space Telescope
images" — a multi-panel composite stored as `kind: "photo"`), `9aeeccc439626d0d` (a two-panel
LEFT/RIGHT figure, also `kind: "photo"`). Fix: add `sequence of|set of \d+ (?:images|photos)|title
page|frontispiece|\bessay\b` to `NEVER`, and treat "a file with an empty description whose title has no
subject word" as a rejection rather than a pass.

**G4 — the unsuitability filters are English-only and read text that often does not describe the
picture.** `rejectReason` runs `NEVER`, `GRAPHIC` and `UNSUITABLE` over `title + description +
categories`. 11 of the 206 sample files have an **empty** Commons `ImageDescription`, so for those the
filter sees only a title and category names. Worse, a description can belong to a batch rather than the
picture: `a08ae7f2817aee29`'s description advertises a Brussels museum of the fantastic — "Suivez les
gouttes de sang" (follow the drops of blood), "un Elephant Man, la Femme Araignee ou la Momie
Cy-clope" — and ends "Various pictures taken in 2021 without real subject". `GRAPHIC`'s blood terms
(`bloody`, `blood[ -]stain`, `bleeding`) are English, so none of that French text is read. This
particular picture is harmless, which is the point: the filter's input had nothing to do with the
picture it was judging. Fix: `caption.ts` already has `looksEnglish` and `englishPart`; `select.ts`
should use them, judge only the English part, and not count a non-English or empty description as
evidence of safety.

**G5–G8 — the caption rules behind the 16 defects (`scripts/media/caption.ts`).** The audit brief asks
about `select.ts`, but every caption defect above traces to four things here:
- **G5** `JUNK` is tested against the **whole** tidied description, so good text is thrown away because
  of boilerplate further down. `28697c0635b69901`'s first sentence is "Neil Armstrong works at the LM in
  the only photo taken of him on the moon" — 72 characters, a perfect caption — discarded because the
  description later says "This is a cropped photo", "Source http://…" and "File:…jpg"; the caption
  became the article title "Neil Armstrong". Same for `d7fe319a037125c4` ("A more accurate Map of the
  Mississippi River Basin", killed by a `File:…png` reference) and for `49f97db7e3a41600`, whose file
  title was rejected by `JUNK`'s `crop(?:ped)?`. Fix: `shorten` first, then test `JUNK` on the shortened
  candidate; strip a trailing "(cropped)" from a title rather than rejecting it. This one change fixes
  the article-title fallback for 11 of the 13 cases in the sample.
- **G6** `tidy` strips "This is an image of " **before** the `SELF` guard runs, so an unfilled Wiki
  Loves Africa form field collapses to a fragment that then passes the 12-character, 3-word test:
  `5e881073b34f55ca`, `ad2c3c0010828b06`. Fix: test `SELF` on the untidied description and reject a
  candidate that ends in a preposition.
- **G7** `SELF`'s verb list lacks "captures", "features", "portrays", so `29c69e3acb627bf4`'s "This
  photograph captures the interior of…" is accepted.
- **G8** `JUNK`'s URL test is `https?:`, so a bare host passes: `83f002e6450d51f3`'s
  "digital.lib.muohio.edu/u?/snyder,1473".

**Not demonstrable from this sample.** `selectForArticle` de-duplicates by exact title and by `stemOf`,
never by `sha1`, so the same bitmap under two file names could be kept twice — there are **0 sha1
collisions among the 206**, so I cannot show it with an example. `hostedOnCommons`'s `local` + `from:
'category'` branch likewise cannot be exercised: asked on Commons, all 206 answer `local`, so the field
carries no information here and I verified hosting from the Commons page instead. `GRAPHIC` is broad
enough to reject innocent pictures (a bird's "breast", a "hunting" wasp), but rejected candidates are by
definition not in the library, so the sample cannot show that either.

## What I could not check

1. **Whether the recorded licence is the file's only licence.** The API returns a single
   `LicenseShortName`. 24 sample files carry a GFDL category and `34acc3c62a7c2ed5` a CeCILL category
   beside their CC tag — dual licensing, so the verdict stands — but a file whose chosen template is
   off-list while `LicenseShortName` reports a CC one would not be caught without reading the wikitext.
2. **Restrictions that do not appear in the `Restrictions` field**: personality rights, trademark,
   freedom of panorama, currency rules. The field was empty for all 206 and I did not read the file
   pages. Three sample files are where such a rule could bite: `520d6c988e63097c` (Hotel in Lobito),
   `c4abe556552bf90a` (Isa Bin Ali House), `734ae3d9ed69c810` (an East Timor centavo coin).
3. **Whether a Commons upload is itself a copyright violation.** I took Commons' own tag at face value.
   `ac598239b2d4ea87` is flagged on Commons as "Assumed own work" with "no machine-readable author".
4. **Byte identity of the thumbnails.** I compared dimensions, aspect ratio (within 0.35%) and, for ten,
   the visible content; I did not download originals or compute a perceptual hash, so a thumbnail made
   from a different revision of the same file would not be caught.
5. **The 3,900 pictures outside the sample.** At 16 caption defects in 206, the library-wide rate would
   be roughly 300 captions, and the G1 kind bug is systematic rather than sampled.
6. **`CREDITS.md`** — out of scope here; authors were matched against `public/media/<subject>.json` by
   id as instructed. All 206 ids resolved in a subject file (none came from `daily.json`).
7. **Rendered pages.** No browser or screen tooling was available (`@kirocrew-computer` not configured),
   so captions were judged against the image files, not against the UI.
