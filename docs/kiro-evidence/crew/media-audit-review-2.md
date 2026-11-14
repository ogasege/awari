# Media library licence audit, round 2: the rebuilt 5% sample

Auditor: awari-licence-auditor. Read-only (this file is the only write). Date: 2026-11-14.
Round 1: `docs/kiro-evidence/crew/media-audit-review-1.md`.

Sample: `docs/kiro-evidence/crew/media-sample.json` — 206 pictures, seed 20261115, a random 5% of the
rebuilt 4,106-picture library, covering 175 articles across all 11 subject files (countries 93,
inventions 19, earth 14, body 13, space 12, people 12, wildlife 10, ancient 9, arts 9, science 8,
physics 7). Every sample id resolved in a `public/media/<subject>.json` file; none came from
`daily.json`, and the sample's `title`, `author` and `licence` matched the subject record for all 206.

Method: my own checker, written for this audit and deliberately **not** importing
`scripts/media/licences.ts`, `check.ts`, `allow.ts` or `caption.ts` — the allow-list, the author
comparison and the caption test are re-implemented from the audit brief, so a bug shared with the
shipped script cannot hide a defect. Commons API
`action=query&prop=imageinfo&iiprop=extmetadata|url|size|sha1|mime`, `formatversion=2`, `maxlag=5`,
50 titles per POST, one request at a time, 1.3 s apart, 30 s timeout,
`User-Agent: awari-licence-auditor/1.0 (Awari encyclopedia media audit, round 2; contact: …/issues)`.
Five requests covered all 206 distinct titles. **Nothing was throttled and nothing was skipped:**
0 maxlag errors, 0 HTTP 429/5xx, 0 retries, 206 of 206 titles answered.

Every thumbnail in `public/media/img/` was measured with `sharp`; ten were opened and looked at.

Not available: the `@kirocrew-computer` MCP server is declared by the agent spec but not configured in
this session, so there was no browser or screen tooling — captions were judged against the image files
and the Commons metadata, not against rendered pages. `work_brief` reports this session is not bound
to a work item, so the task text was taken as the definition of done. No git, no build, no deploy,
no spend.

## Verdict

**The licence path is clean again, and the round-1 caption root causes are genuinely fixed.** No
licence defect, no author defect, no restriction, no non-Commons file, no bad thumbnail — and the
headline round-1 class, a caption asserting something its source does not say, is **gone**: all 206
captions are literal shortenings of the Commons description or the file name. Zero article-title
fallbacks, zero bare URLs, zero first-person captions, zero boilerplate prefixes, zero panel markers,
zero `kind: "diagram"`.

What is left is lower-grade but wider than round 1 counted. 31 of 206 captions fail the full bar —
"an honest shortening of the **English** description or file name" — in ways round 1 never had to
tally because worse defects dominated it: **10 captions are not in English**, 8 carry raw file-name
residue (`… map en`, `- Flickr - Dave Proffer`, `PIA00103 …`, a dangling hyphen), and 4 describe the
file or its catalogue record rather than the picture. The 31 and round 1's 16 are **not comparable
numbers**: my bar here is stricter, and against round 1's own bar this sample scores 0.

Three new classes appear that round 1 did not report: a caption naming the wrong country for the
article it illustrates, a diagram whose labels are in Hebrew, and a company's marketing graphic in
`inventions/plastic`.

## Count per check

| # | Check | Pass | Defect | Notes |
| --- | --- | --- | --- | --- |
| 1 | File exists on Commons and is hosted there | 206 | **0** | every title answered with a pageid + imageinfo; 0 `missing`, 0 `invalid`; all 206 `descriptionurl` values are `https://commons.wikimedia.org/wiki/File:…` |
| 2 | Licence is PD / CC0 / CC BY / CC BY-SA | 206 | **0** | 103 CC BY-SA, 59 public domain, 8 CC0, 35 CC BY, in 12 distinct `LicenseShortName` values. No NC, no ND, no GFDL-only, no fair use. The recorded licence string equals the Commons one for 206 of 206 |
| 3 | No `Restrictions` field | 206 | **0** | `Restrictions` empty in all 206 answers |
| 4 | Recorded author is the Commons `Artist`, non-empty under attribution | 206 | **0** | exact match after HTML-to-text on 206 of 206; 0 empty authors under a CC BY or CC BY-SA licence |
| 5 | 480 px thumbnail is a downscale of that file | 206 | **0** | all present, all webp, all exactly 480 px wide, none larger than the original in either dimension, aspect within 0.69% of the Commons original (median 0.027%). Ten opened — see below |
| 6 | Caption is an honest shortening of the English description or file name | 175 | **31** | 0 invented or borrowed phrases (206 of 206 are literal shortenings: 166 from the description, 34 from the file name, 6 non-Latin verbatim). The 31 break down as 10 not English, 8 file-name residue, 5 uninformative or a usable description discarded, 4 about the file not the picture, 2 truncated at a preposition, 1 naming the wrong country, 1 not about its own picture |
| — | Kind label matches the picture | 199 | **7** | 3 photographs stored as `flag`, 2 diagrams stored as `photo`, 2 non-portraits stored as `portrait` |

Secondary observations, not defects: recorded `tw`/`th` now equals the webp on disk for **206 of 206**
(round-1 D16, 35 records off by 1 px, is fixed); 2 of 206 files have an empty Commons
`ImageDescription` (down from 11); 0 sha1 collisions; the smallest original long side is exactly
800 px, so the `MIN_SIDE` floor holds; 38 captions end in an ellipsis and **none** truncates
mid-word.

## Round-1 defect classes, re-checked

Where a round-1 record survived the rebuild I quote its current caption, which is stronger evidence
than the sample rate.

| Round-1 class | Round-2 status | Evidence |
| --- | --- | --- |
| Wrong or borrowed captions (article-title fallback) | **FIXED** | 0 captions equal their article title in this sample. `28697c0635b69901` went from "Neil Armstrong" to "Armstrong on Moon"; `d7fe319a037125c4` from "Mississippi River" to "A more accurate Map of the Mississippi River Basin, intended to replace…"; `09206be3da2cb0a1` from "Antigua and Barbuda" to "Official portrait of Rodney Williams (cropped)". The six round-1 records whose captions asserted an unsupported fact (Lavoisier/"Chemical reaction", Boyle/"Chemical element", Aksum, Palestine, Marshall Islands, Octopus) are all gone from the library |
| Kind mislabelling — diagram from the word "photograph" | **FIXED** | **0** records in the sample carry `kind: "diagram"` (round 1: 44 of 206, 43 of them wrongly). `488b5734fe22fe2f` (Nassau traffic policeman) and `e63390aa4b1e90da` (Ada Lovelace statue) are both `kind: "photo"` now. The `\bgraph\b` word-bound fix landed |
| Kind mislabelling — flags from category names | **FIXED as a category bug, STILL PRESENT via titles** | No flag-kind record is driven by a category any more: all 4 have a flag word in the **file title**, and the round-1 category cases are resolved (`41e355f0301ebcd6`, the Tsai/Solomon Islands photo, is `portrait` now; the Bissau palace and the Everest climber are gone). But 3 of those 4 are photographs *of* flags, not flag images — see D32–D34 |
| Text pages and sequences | **STILL PRESENT** | `0d3fc0d7245f9610` (1828 Green title page), `9aeeccc439626d0d` (two-panel figure) and `196f036191815ba8` (Hubble sequence) are all gone, so `NEVER` did gain ground — but this sample has two fresh ones: `d0dc9352ce462ab9` is a page of printed Swedish text with no picture content, in `body/vaccine`, and `2156b30c6c80eabf` is a photograph of an engraved stone plaque whose content is its inscription |
| First-person or boilerplate captions | **FIXED** | 0 in the sample. `ac598239b2d4ea87` lost "A map of Saint Lucia that i created…" and `4907a41609173b62` lost "Original caption from NASA: …" — though both fell back to a raw file-name slug ("Saint Lucia geography map en", "Antennae galaxies xl"), which is the new residue class |
| Captions ending in a preposition | **PARTLY** | down to 2 of 206: `9fb83b7f08d49a86` ends "…of the Emirates during…", `3e09a59a46551426` ends "…on top of…". Round 1's own examples are fixed — `5e881073b34f55ca` is now "BaAka woman dancing" |
| Bare URLs | **FIXED** | 0 captions contain a URL or a bare host under a test for `https?:`, `www.` and a bare `*.com/.org/.net/.edu/.gov/.de/.fr/.nl/.uk/.io` host. `83f002e6450d51f3` (the `digital.lib.muohio.edu` caption) is gone from the library |

Two round-1 records are only **partly** repaired: `ad2c3c0010828b06`'s unfilled form field and stray
quote are gone, but stripping the trailing "3" left the caption ending on a dangling "photo"
("Fernanda Nossa, Guinea-Bissau, photo"); and `09206be3da2cb0a1` still carries the "(cropped)" suffix
that round-1 G5 asked to strip.

## Defects

Severity reading: D1–D10 are visible to a reader as a foreign-language caption; D11–D21 misdescribe
the picture; D22–D31 are cosmetic residue; D32–D38 are kind and content.

| id | File | What | Suggested fix |
| --- | --- | --- | --- |
| `e7e958e276343043` | Hamza Abdi Barre 2025 official portrait.jpg | Caption is Russian: **"Портрет премьер-министра Сомали Хамзы Абди Барре"**, on `countries/somalia`. The file name is already English | Prefer the file name when `looksEnglish` fails on the description; caption "Hamza Abdi Barre, Prime Minister of Somalia" |
| `686b7b1b2f4362c1` | Fresco of Ubisi (7).jpg | Caption is Georgian, **"Უბისის მონასტრის ფრესკა"** — and the pipeline upper-cased the first letter, which in Mkhedruli produces a Mtavruli character (`უ`→`Ე`); Georgian has no letter case | Use the file name, "Fresco of Ubisi"; do not apply `toUpperCase` to a non-Latin first letter |
| `05104b67fd7152f2` | Stara planina, vrh Midžor.jpg | Caption is Serbian Cyrillic and opens with a protected-area code: **"ПП16 Парк природе Стара планина"** | Use the file name, "Stara Planina, Midžor peak" |
| `378fc57d914f1ae5` | ماشین تحریر مظفر الدین شاه قاجار.jpg | Caption is Persian; the file name is Persian too, so there is no English source at all for this record | Caption from categories/Wikidata, "Typewriter of Mozaffar ad-Din Shah Qajar"; or drop the file |
| `05830de24ee098f3` | Kish Island, Persian Gulf, Iran.jpg | Caption is Persian, **"ساحل جزیره کیش"**, while the file name is English | Use the file name, "Kish Island, Persian Gulf, Iran" |
| `e2a6595c6095b2a0` | 万国来朝图 Brunei (汶莱國) delegates in Peking in 1761.jpg | Caption keeps a Chinese prefix on an otherwise English sentence: **"万国来朝图 Brunei (汶莱國) delegates in Peking in 1761"** | Strip a leading CJK run when an English remainder of 3+ words survives |
| `8c5b4c69de6bec89` | Canada in 2014.jpg | Caption is Spanish, **"Imagen de paisaje de Canadá en 2014"**, and it also describes the file ("Imagen de…"); the file name "Canada in 2014" is English | Prefer the English file name |
| `6e2eca0b98167ba7` | Esquelete de necrópole romana (7326104804).jpg | Caption is Galician/Portuguese, **"Esquelete de necrópole romana"**; the Commons description is a long Galician excavation note | Caption "Skeleton from a Roman necropolis" |
| `2eaa7491d037d747` | Berliner Physiker u Chemiker 1920.jpg | Caption is a truncated German file name, **"Berliner Physiker u Chemiker"** (the "u" is an abbreviated "und"), on `people/albert-einstein`. The description lists every sitter, Einstein included | Caption "Berlin physicists and chemists, 1920, with Albert Einstein"; expand "u" → "und" or translate |
| `819083eb76d6427a` | Kniegelenk, RP-F-F26541.jpg | Caption is Dutch Rijksmuseum catalogue fields: **"Identificatie Titel(s): Kniegelenk Objecttype: foto stereofoto Objectnummer: RP-F-F26541…"**. Opened: a stereo card of two knee X-rays with the arterial tree injected, in `body/artery` | Reject a description containing `Identificatie|Objecttype|Objectnummer`; caption "Stereo X-ray of the arteries of the knee, c. 1900" |
| `f78945eb560bd261` | Mountain scene. Best viewed large. (49909617046).jpg | Caption is the camera gear: **"10 mm. Voigtlander lens"**, on `earth/alps`. Opened: a gravel path and cloud-capped peaks — the caption says nothing about it | Reject a description that is only equipment (`\d+ ?mm|lens|f/\d`); caption "Mountain scene in the Alps" from the file name |
| `fe7276d4fe20cb6f` | Portrait of Marie Curie (1867 - 1934), Polish chemist Wellcome M0000113.jpg | Caption carries a library accession number and a space before the comma: **"Portrait of Marie Curie , Polish chemist Wellcome M0000113"**. `ObjectName` offers the clean "Portrait of Marie Curie (1867 - 1934), Polish chemist" | Strip a trailing `Wellcome [A-Z]\d+` / accession token; collapse `\s+,` → `,`; prefer `ObjectName` |
| `53ac9d01fc1b5f0f` | Vesuvius (erupting), Brooklyn Museum Archives.jpg | Caption is the archive's shelf label with a space before the comma: **"Vesuvius , Brooklyn Museum Archives"** | Collapse `\s+,`; strip a trailing archive/collection name; caption "Vesuvius erupting" |
| `d0dc9352ce462ab9` | Photo of old book from 1756 prasing vaccine.jpg | Caption describes the file and repeats the uploader's typo: **"Photo of old book from 1756 prasing vaccine"**. Opened: a page of printed 18th-century Swedish, no picture content at all | Drop the file (text page, see below); if kept, caption "Page from a 1756 book praising inoculation" |
| `cc59cc2edb7aaf12` | Kenyan flag on 2016-08-02 11.01.27.jpg | Caption names the wrong country for the article: **"Kenyan flag at the Olympic Village"** on `countries/kyrgyzstan`. Opened: a row of flags at Rio 2016 — Puerto Rico, Portugal, Kenya, Kyrgyzstan, North Korea. Technically honest, but a Kyrgyzstan reader is told about Kenya | Caption "Flags at the Olympic Village, Rio 2016, including Kyrgyzstan"; or reject a candidate naming a country other than the article's |
| `326ba7b0efe083ad` | Curious - Flickr - Stiller Beobachter (1).jpg | Caption is the Commons Flickr-import file name including the uploader's handle: **"Curious - Flickr - Stiller Beobachter"**, on `body/ear`. The description is the single word "curious" | Strip a `- Flickr - <handle>` suffix; caption "Close-up of a dog's ear" from the "Ears"/"Eurasier" categories |
| `8ccb5a4c16af4a97` | Entebbe - Flickr - Dave Proffer.jpg | Same residue: **"Entebbe - Flickr - Dave Proffer"**, on `people/jane-goodall`, where the caption also tells the reader nothing about Goodall | Strip the suffix; caption from the "Jane Goodall"/"2007 in Uganda" categories |
| `2156b30c6c80eabf` | Red Gate Woods DSCF0605 (50143996582).jpg | Caption **"Red Gate Woods"** on `science/nuclear-power`. Opened: a stone plaque reading "THE WORLD'S FIRST NUCLEAR REACTOR WAS REBUILT AT THIS SITE IN 1943…" — the caption names a wood, not the reactor site | Caption "Marker at the burial site of the world's first nuclear reactor, Red Gate Woods" from the "Site A/Plot M Disposal Site" category |
| `22deb0a4a3dbb9c1` | Global subducted slabs USGS.png | Caption is the bare file name with an agency acronym, **"Global subducted slabs USGS"**, although Commons gives a usable sentence: "Map of subducted slabs, contoured by depth, for most active subduction zones around the globe" | Find out why that description was rejected (likely `JUNK`'s "produced by"); caption "Map of subducted slabs by depth, worldwide" |
| `39051fc7e496d36f` | Neptune Dark Spot Jr. Hubble.png | Caption is the bare file name, **"Neptune Dark Spot Jr. Hubble"**, although the NASA description explains the smaller dark spot and its 3,900-mile width | `SELF` likely rejected "this Hubble image"; strip the demonstrative clause instead of discarding the whole description |
| `6cdc5c2e2e42cb82` | How to Measure the Spin of a Black Hole.jpg | Caption is a general lecture, not a description of this picture: **"Black holes are tremendous objects whose immense gravity can distort and twist…"**. Opened: a three-row NASA **chart** — accretion-disc illustrations beside X-ray brightness graphs — and the description's own fourth sentence says "This chart illustrates the basic model…" | Caption "Chart: X-ray spectra for retrograde, zero and prograde black-hole spin"; prefer the sentence that starts "This chart/figure illustrates" rather than the lead-in |
| `9fb83b7f08d49a86` | Flag-hoisting at the Union Declaration.jpg | Caption truncates at a preposition: **"…and their Highnesses the Rulers of the Emirates during…"** | Truncate at the last clause boundary, never after a preposition; caption "Sheikh Zayed and the Rulers at the flag hoisting, Dubai 1971" |
| `3e09a59a46551426` | Ruins atop Tel Megiddo … (19888642855).jpg | Caption truncates at a preposition: **"…a series of temples on top of…"** | Same rule; caption "Ruins atop Tel Megiddo, Israel" |
| `82f833c749f94dbf` | 2015 0731 Apfelstrudel Vanillesoße Edelweisshütte Sölden.jpg | Opening quote stripped, closing quote kept: **`Apfelstrudel mit Vanillesoße" at the Edelweisshütte above Sölden, Tyrol`** | Drop an unmatched quote after tidying, or strip both |
| `b6f46ac79ae28193` | Ring with engraved portrait of Ptolemy VI Philometor (3rd–2nd century BCE) - 2009.jpg | Removing the parenthetical and the year left a dangling hyphen: **"Ring with engraved portrait of Ptolemy VI Philometor -"** | Trim trailing `[-–,:;]` after stripping |
| `ea9471c8f95c8754` | Castelul Bran2.jpg | Caption is the file name with the sequence digit glued to the word: **"Castelul Bran2"**, and it is Romanian | Split `([a-z])(\d+)$` and drop the digits; caption "Bran Castle, Romania" |
| `c4c7afe655e2d811` | 201805 human skeleton.png | Caption keeps the upload date code: **"201805 human skeleton"** | Strip a leading `\d{6,8}` date token; caption "Human skeleton" |
| `852fb6ac4ff409f2` | PIA00103 Venus - 3-D Perspective View of Lavinia Planitia.jpg | Caption keeps the NASA catalogue number: **"PIA00103 Venus - 3-D Perspective View of Lavinia Planitia"** | Strip a leading `PIA\d+`/`STScI-\d+` token |
| `ac427316acab5b9c` | Claude Monet - Arrival of the Normandy Train, Gare Saint-Lazare - Google Art Project.jpg | Caption keeps the import suffix: **"… - Google Art Project"**. This file is one of only 2 in the sample with an empty Commons description, so the file name was all there was | Strip `- Google Art Project` / `- Google Cultural Institute`, as for `- Flickr -` |
| `ac598239b2d4ea87` | Saint Lucia geography map en.png | Round-1 first-person caption fixed, but the fallback keeps the language-code slug: **"Saint Lucia geography map en"** | Strip a trailing ISO language code (`en`, `dz`, `de`, …); caption "Map of Saint Lucia" |
| `ad2c3c0010828b06` | Fernanda Nossa, Guinea-Bissau, photo 3.jpg | Round-1 form-field caption fixed, but stripping the "3" left a dangling noun: **"Fernanda Nossa, Guinea-Bissau, photo"** | Drop a trailing `, photo`/`, image` left behind by digit-stripping |
| `726b94cbfa131a2e` | Raising the Flag on Iwo Jima, larger - edit1.jpg | Stored as **`kind: "flag"`** because the title contains "Flag". Opened: Rosenthal's photograph of marines raising a flag — a photograph, not a flag image. With `perKindCap.flag` at 2 it can take a country's flag slots | Classify `flag` only from `/^Flag of |flag of the /i` or a "Flags of X (SVG)" category, not from any title containing "flag" |
| `cc59cc2edb7aaf12` | Kenyan flag on 2016-08-02 11.01.27.jpg | Same: a photograph of flagpoles stored as `kind: "flag"` | Same fix |
| `9fb83b7f08d49a86` | Flag-hoisting at the Union Declaration.jpg | Same: a 1971 ceremony photograph stored as `kind: "flag"` | Same fix |
| `be73726049e1e4a1` | Adiponectin structure.png | Stored as **`kind: "photo"`**. Opened: a schematic of monomer/trimer/multimer forms — a diagram — **and every label is in Hebrew** (מונומר, טרימר, הקסמר), unreadable on an English page | Classify as `diagram`; reject a figure whose embedded labels are non-Latin, or replace with an English-labelled equivalent |
| `5c1a008364e30134` | Lions Family Portrait Masai Mara.jpg | Stored as **`kind: "portrait"`** from the word "Portrait" in the title; the subject is three lions | Require a human/person signal before `portrait`; the caption itself ("Portrait of three lions…") is fine |
| `d9c177088473ce22` | Solvay conference 1927.jpg | Stored as **`kind: "portrait"`**; it is a 29-person group photograph | Same fix; `portrait` should mean one sitter |
| `b18ea6f7c4761b23` | Cosmo Films Map.png | Opened: a **company marketing graphic** — a world map of "Cosmo Films" manufacturing facilities, sales offices and "customer footprints", with a corporate-office pin — used as the picture for `inventions/plastic`. Promotional, and it teaches nothing about plastic | Drop the file; add a promotional rule to `NEVER` (`global footprint|our (?:offices|facilities)|corporate office|sales offices`) |

Not Awari's defect, recorded because it misleads a reader: `30bc441d75bc3dc1` is filed on Commons as
**"Kemna road roller.jpg"** while its own description and the caption say **"Kemna steam plow"** and
its categories say "Ploughing engines". Opened: a steam traction engine with spoked drive wheels,
i.e. the description is right and the Commons file name is wrong. The caption faithfully shortens the
description, so check 6 passes; no change needed on our side.

## The ten thumbnails opened

Each is a plain 480 px downscale of the file it names; no crop, substitution or wrong-revision was
found. Five of the ten turned out to carry a defect of another kind, listed above.

| id | What the thumbnail shows | Matches Commons |
| --- | --- | --- |
| `819083eb76d6427a` | a grey-mounted stereo card, two X-rays of a knee, printed "Kniegelenk" and "Verlag v. J.F. Bergmann" | yes — the Rijksmuseum stereo card (caption defect D10) |
| `f78945eb560bd261` | a gravel alpine path, green valley, cloud-capped peaks | yes for the file; the caption names only the lens (D11) |
| `6cdc5c2e2e42cb82` | three accretion-disc illustrations beside three X-ray brightness graphs, labelled Retrograde / No Rotation / Prograde | yes — and it is a chart, not a photo (D21, D-kind) |
| `726b94cbfa131a2e` | marines raising the US flag on a hilltop, black and white | yes — Rosenthal's Iwo Jima photograph (kind defect D32) |
| `cc59cc2edb7aaf12` | five national flags on poles before apartment towers | yes — Rio 2016 Olympic Village (D15, D33) |
| `30bc441d75bc3dc1` | a steam traction engine, red spoked wheels, in a park | matches the description ("steam plow"), not the Commons file name ("road roller") |
| `d0dc9352ce462ab9` | a page of printed 18th-century Swedish text, no image content | yes for the file, but it is text, not a picture (D14) |
| `be73726049e1e4a1` | a protein schematic, monomer to multimer, labels in Hebrew | yes — a diagram, mislabelled `photo` (D35) |
| `2156b30c6c80eabf` | an engraved stone plaque about the world's first nuclear reactor | yes; the caption names only the wood (D18) |
| `b18ea6f7c4761b23` | a grey world map pinned with a company's offices and factories | yes — corporate marketing material (D38) |

## What I could not check

1. **Whether the recorded licence is the file's only licence.** The API returns a single
   `LicenseShortName`; a file whose chosen template is off-list while that field reports a CC one
   would need the wikitext to catch.
2. **Restrictions that do not appear in the `Restrictions` field**: personality rights, trademark,
   freedom of panorama, currency rules. The field was empty for all 206 and I did not read the file
   pages. `b18ea6f7c4761b23` is where this could bite hardest — a company's own marketing map carries
   a trademark question the licence tag does not answer.
3. **Whether a Commons upload is itself a copyright violation.** I took Commons' own tag at face
   value. `ac598239b2d4ea87` is still flagged on Commons with no machine-readable source.
4. **Byte identity of the thumbnails.** I compared format, width, dimensions, aspect ratio and, for
   ten, the visible content; I did not download originals or compute a perceptual hash.
5. **The 3,900 pictures outside the sample.** At 31 caption defects in 206 the library-wide rate is
   roughly 600 on my wider bar, of which the ~200 implied by the 10 non-English captions and the
   ~160 implied by the 8 residue cases are single-rule fixes. The kind rules are systematic, not
   sampled.
6. **Whether `CREDITS.md` lists these 206.** Out of scope here; authors were matched against
   `public/media/<subject>.json` by id as instructed, and all 206 resolved.
7. **Rendered pages.** No browser or screen tooling was available (`@kirocrew-computer` not
   configured), so I could not see how a 90-character caption or a Hebrew-labelled diagram actually
   lays out; captions were judged against the image files and the Commons metadata.
8. **Article relevance in general.** I judged it only where a thumbnail made it obvious
   (`2156b30c6c80eabf`, `8ccb5a4c16af4a97`, `819083eb76d6427a`); a systematic relevance audit was not
   part of this brief.
