# Media library licence audit, round 3: the rebuilt library, new 5% sample

Auditor: awari-licence-auditor. Read-only (this file is the only write). Date: 2026-11-14.
Round 1: `docs/kiro-evidence/crew/media-audit-review-1.md`.
Round 2: `docs/kiro-evidence/crew/media-audit-review-2.md`.

Sample: `docs/kiro-evidence/crew/media-sample.json` — 200 pictures, seed 20261116, a random 5% of the
3,986-picture library (down from 4,106). It covers 169 articles across all 11 subject files:
countries 97, arts 14, ancient 14, body 13, wildlife 13, inventions 11, earth 10, space 9, science 8,
people 7, physics 4. Every sample id resolved in a `public/media/<subject>.json` record, none came
from `daily.json`, and the sample's `title`, `author` and `licence` matched the subject record for all
200. Kinds present in the sample: photo 167, map 16, art 13, portrait 4 — **no `flag` and no
`diagram` record was drawn**, which matters below.

Method: my own checker, written for this audit and deliberately **not** importing anything from
`scripts/media/` — the allow-list, the author comparison, the English test, the residue rules and the
kind rules are re-implemented from the audit brief, so a bug shared with the shipped script cannot
hide a defect. Commons API `action=query&prop=imageinfo&iiprop=extmetadata|url|size|sha1|mime`,
`formatversion=2`, `maxlag=5`, 50 titles per POST, one request at a time, 1.3 s apart, 30 s timeout,
`User-Agent: awari-licence-auditor/1.0 (Awari encyclopedia media audit, round 3; contact: …/issues)`.
Four requests covered all 200 distinct titles. **Nothing was throttled and nothing was skipped:**
0 maxlag errors, 0 HTTP 429/5xx, 0 retries, 200 of 200 titles answered.

My English test uses the bundled Open English WordNet in `public/packs/dictionary` (14,593 entries,
content words only — it has no function words, so I added my own function-word list) plus a
Unicode-script test. Before trusting it I replayed round 2's 28 quoted defect captions through the
rule set: 25 of 28 fired. The three misses (`Berliner Physiker u Chemiker`, and two bare-file-name
captions) are now covered by added rules, and every rule firing in this round was reviewed by hand
for false positives — six were discarded (`Campo Flavona`, `Ahmed Abokob`, `States of Palau`,
`Mosaic, Roman artwork, 2nd century CE`, and two double-counts).

Every thumbnail in `public/media/img/` was measured with `sharp`. Sixteen were opened and looked at:
ten as the check-5 sample, six more to settle kind questions the metadata could not settle.

Not available: the `@kirocrew-computer` MCP server is declared by the agent spec but **not configured**
in this session, so there was no browser or screen tooling — captions were judged against the image
files and the Commons metadata, not against rendered pages. `work_brief` reports this session is not
bound to a work item (`not_bound`), so the task text was taken as the definition of done. No git, no
build, no deploy, no spend.

## Verdict

**The licence path is clean for the third round running, and it is now clean on a rebuilt library:
no licence defect, no author defect, no restriction, no non-Commons file, no bad thumbnail — 200 of
200 on checks 1 to 5.** The rebuild also fixed the mechanical caption residue round 2 named one by
one: `(cropped)`, `- Flickr - <handle>`, `Wellcome <accession>`, the space-before-comma, the trailing
ISO language code and the `Unsplash`/Flickr numeric id are all stripped now, on every file in this
sample that carried them (4, 1, 1, 15, 2 files respectively).

**The new English check closed the hole it was built for and left a different one open.** Round 2's
ten non-English captions included Russian, Georgian, Serbian Cyrillic, Persian and a Chinese prefix.
This sample contains **zero captions with a non-Latin letter** — the script test is working
completely. But nine captions are still not English, and all nine are Latin-script European
languages the WordNet test does not reject: German, French ×2, Slovak ×2, Swedish, Portuguese,
Spanish, Serbian-Latin. The count barely moved (10 → 9) because the fix addressed scripts, not
languages.

**Caption residue got worse, not better: 8 cases in round 2, 18 here.** The rebuild stripped the
named import suffixes and then fell back to the raw file name more often, so a new generation of
catalogue junk arrived from sources round 2's denylist does not name — `- NARA - 84785533`, a US
military photo id `100906-F-3322D-009`, a museum shelfmark `ceg74154`, a date-stamped
`20220525.Rijksmuseum Amsterdam.-011`, an orphan `6)` from a LACMA accession, a `(a)`-style figure
number, two camel-case brand slugs and `$Kill - Legado`.

**Truncating on a preposition is fixed (2 → 0) and truncation itself is not.** Six captions are cut
somewhere else: on an abbreviation (`Air Force Col`, `… at the MIM, Berlin, Kat`, `Statue of of
Cristobal Columbus St`), on a label word (`Bururi National Forest Figure`) or mid-clause after a verb
(`… are long gone, and plant life is…`).

**Three classes round 2 recorded as FIXED are back**, each once: a caption that is just the article
title (`Nikola Tesla`, on a photograph of a pavement star in Opatija), a first-person caption
(`The help and comfort I received…`), and panel-list residue (`Left to right: Front row: …`).

**Kind defects went up, 7 → 11, and the cause is visible library-wide.** The stricter kinds removed
the round-2 flag and diagram false positives by all but abandoning those labels: the whole 3,986-picture
library now holds **3 `diagram` records and 4 `flag` records**. This 200-picture sample alone contains
five pictures that are diagrams (two labelled `photo`, two labelled `art`, one labelled `map`), which
implies on the order of a hundred library-wide. `diagram` is not over-applied any more; it is
effectively unused.

Counting is not like-for-like with round 2, so three numbers: on the brief's four caption sub-classes
**33 of 200**; on round 2's seven counted classes **49 of 200** (round 2: 31 of 206); on my full bar,
which adds mid-sentence fragments, misspellings, all-caps, uninformative slugs and editorial tone,
**68 of 200**.

## Count per check

| # | Check | Pass | Defect | Notes |
| --- | --- | --- | --- | --- |
| 1 | File exists on Commons and is hosted there | 200 | **0** | every title answered with a pageid + imageinfo; 0 `missing`, 0 `invalid`; all 200 `descriptionurl` values are `https://commons.wikimedia.org/wiki/File:…` |
| 2 | Licence is PD / CC0 / CC BY / CC BY-SA | 200 | **0** | 118 CC BY-SA, 41 CC BY, 29 public domain, 12 CC0, in 13 distinct `LicenseShortName` values. No NC, no ND, no GFDL-only, no fair use. The recorded licence string equals the Commons one for 200 of 200 |
| 3 | No `Restrictions` field | 200 | **0** | `Restrictions` empty in all 200 answers |
| 4 | Recorded author is the Commons `Artist`, non-empty under attribution | 200 | **0** | exact match after HTML-to-text on 200 of 200; 159 records are CC BY or CC BY-SA and all 159 carry a non-empty author |
| 5 | 480 px thumbnail is a downscale of that file | 200 | **0** | all present, all webp, all exactly 480 px wide, none larger than the original in either dimension, aspect within 0.295% of the Commons original (median 0.011%). Recorded `tw`/`th` equals the webp on disk for 200 of 200. Sixteen opened — see below |
| 6 | Caption is an honest shortening of the English description or file name | 167 / 151 / 132 | **33 / 49 / 68** | three bars, see above. The brief's four sub-classes: **9 not English, 18 file-name or catalogue residue, 9 describe the file not the picture, 0 truncated on a preposition** (33 distinct records). Round 2's other three classes add 8 uninformative, 5 not about their own picture, 5 wrong subject for the article (49 distinct). My full bar adds 6 truncated elsewhere, 6 mid-sentence fragments, 6 misspelt or ungrammatical, 2 all-caps, 1 article-title fallback, 1 first-person, 1 editorial tone (68 distinct) |
| 7 | Kind label matches the picture | 189 | **11** | 2 diagrams stored as `photo`, 2 diagrams stored as `art`, 1 multi-panel research figure stored as `map`, 2 paintings/renders stored as `photo`, 1 photograph stored as `art`, 1 photograph stored as `portrait`, plus 1 inconsistent pair (two bordered satellite composites, one `map`, one `photo`) |

Secondary observations, not defects: 0 sha1 collisions; the smallest original long side is exactly
800 px, so the `MIN_SIDE` floor still holds; 38 captions end in an ellipsis and none truncates
mid-word, though 2 end after a function word; 7 of 200 files have an empty Commons
`ImageDescription`, up from 2 in round 2; 56 of 200 captions come from the file name
(`captionFrom: "title"`), 144 from the description.

## Round-2 defect classes, re-checked

| Round-2 class | Round-3 status | Evidence |
| --- | --- | --- |
| Captions not in English (10) | **PARTLY — the script half is fixed, the language half is not** | 0 of 200 captions contain a non-Latin letter (round 2 had Russian, Georgian, Cyrillic, Persian ×2, a CJK prefix). But 9 Latin-script foreign captions remain: `Auf dem Ofen 1895` (German, `body/sleep`), `Senegal Langues` (French), `Monument au Gabon` (French), `Bratislava, Parlament, Slovensko` and `STANICA LANOVKY S OBSERVATÓRIOM` (Slovak), `Ungdomsbiblioteket Bissau` (Swedish), `Lusofonia Angola Censo` (Portuguese), `Coliseo medieval` (Spanish), `SV 410 006 - SOKO - Novi Beograd` (Serbian) |
| File-name / catalogue residue (8) | **STILL PRESENT and worse: 18** | The six suffixes round 2 named are gone — `(cropped)` stripped on 4 of 4 files, `- Flickr -` on 1 of 1, `Wellcome M0000113` on 1 of 1 (`fe7276d4fe20cb6f` is now the clean `Portrait of Marie Curie, Polish chemist`), Flickr/Unsplash numeric ids on 17 of 17, and 0 captions show a space before a comma or a trailing ISO language code. New sources arrived instead: `- NARA - 84785533`, `100906-F-3322D-009:`, `ceg74154`, `20220525.Rijksmuseum Amsterdam.-011`, `11277 Vatican FromTheDome`, `6)`, `Blue Whale 001 body bw`, `Monte Bianco -m` |
| Captions describing the file, not the picture (4) | **STILL PRESENT and worse: 9** | `The picture depicts drums set up…`, `The photograph shows the massive head…`, `A series of shots (1-8): …`, `Postprocessed photo (fusion of two) of β cells…`, `Human body cavities with the labels removed`, `3D Medical Animation Still Shot Depicting Nose…`, `Sirius A and B artwork`, `Photo 02-07-14 12 55 10`, `… This mosaic depicts the International Space Station…`. Round 2's own examples are gone: no `Identificatie/Objecttype` catalogue dump, no camera-gear-only caption |
| Captions truncated on a preposition (2) | **FIXED for prepositions, the truncation moved** | 0 of 200 end on a preposition (round 2's `9fb83b7f08d49a86` and `3e09a59a46551426` are both gone from the library). Six are cut elsewhere: `Air Force Col`, `… the MIM, Berlin, Kat`, `Statue of of Cristobal Columbus St`, `Bururi National Forest Figure`, `… plant life is…`, `… nuns were…` |
| Uninformative caption / usable description discarded (5) | **STILL PRESENT: 8** | `$Kill - Legado` on `physics/electrical-circuit`, `MR Roberts` on `body/ear`, `Demonstration Stage`, `Lady Physicist`, `Isaohm Shunt BVS, Nikrothal LX` (Commons offers `… photographed on 5 mm grid paper`), `Wooster, United States`, `Ahmed Abokob` (Commons offers `a Somali skirmisher from Djibouti, 1st Battalion of Somali Tirailleurs`), `FIFA World Cup 2010 Brazil North Korea`. Note the pipeline is right to distrust descriptions in general — 11 records in this sample fell back to the file name over Wiki-Loves-Monuments boilerplate such as `This photo has been taken in the country: Tajikistan`, and those fallbacks are correct |
| Caption naming the wrong subject for its article (1) | **STILL PRESENT: 5** | `824eb2cdc98a3118` puts a Pluto photograph on `space/asteroid`; `be9f63d142959de7` captions `body/ear` with `From October 16 to 20 NeuroMat hosted the workshop…`; `6f7f29f36014cabc` captions `people/haile-selassie-i` with `M Elizabeth II in 1954 entering Buckingham Palace`; `9c83b5bf354822ca` captions a mango-sticky-rice photo with the hotel's tea room; `16fb73313eb05534` puts `Wooster, United States` on `inventions/light-bulb`. Round 2's own case (`cc59cc2edb7aaf12`, the Kenyan flag on Kyrgyzstan) is gone from the library |
| Caption not about its own picture (1) | **STILL PRESENT: 5** | Five captions are encyclopedic lecture rather than description: `Pressure swing adsorption (PSA) is a technique used to separate…`, `About a decade after its discovery, Cygnus X-1 secured a place in the history…`, `Changunarayan is a municipality in Bhaktapur District…`, `Platinum mining is an extremely lucrative mining industry…`, `It is good sportsmanship to shake hands with your opponent…` |
| Article-title fallback (round 1; round 2 **FIXED**) | **REGRESSED: 1** | `dee1ea28b20bf12d` is captioned `Nikola Tesla` on `people/nikola-tesla`, and the Commons description says what it actually is: `Nikola Tesla, Stern am Gehweg eingelassen, in Opatija` — a pavement star, not Tesla |
| First-person captions (round 1; round 2 **FIXED**) | **REGRESSED: 1** | `c41ab95e890910d6`: `The help and comfort I received while being in an Orphanage by Mother Theresa's nuns were…` |
| Panel markers (round 1; round 2 **FIXED**) | **REGRESSED: 1 caption, 1 picture** | `97d2432e1c6f47b0` keeps `Left to right: Front row: Jacob Zuma (South…`; and `30c23555b474a214` is a six-panel academic figure labelled `(a) Cluster 2 … (f) Cluster 5`, stored as `kind: "map"` |
| Bare URLs | **FIXED** | 0 of 200 captions contain a URL or a bare host |
| Text pages and sequences | **STILL PRESENT: 2** | `786c358d3afab87f` is page 1 of a patent file, with clerk's handwriting, stamps and `6 Sheets—Sheet 1.` across the top; `6a9aa2f70be1f8c3` is captioned as a sequence, `A series of shots (1-8)` |
| Kind: photographs stored as `flag` (3) | **FIXED, by abandoning the label** | 0 `flag` records in the sample; the whole library holds 4. The `/^Flag of/` tightening landed |
| Kind: diagram stored as `photo` (2) | **STILL PRESENT: 2, and the opposite error appeared** | `3320f2c04e060246` (anatomy diagram) and `d3f6d197c85e53e1` (speaker-placement diagram) are both `photo`. Two more diagrams are stored as `art` (`3f82173d08ac640f`, `cd23ecc87f546782`). Library-wide there are 3 `diagram` records in 3,986 |
| Kind: non-portrait stored as `portrait` (2) | **PARTLY: 1** | `03d3ad7f63951982`, a photograph of a print-shop interior, is `portrait`. Round 2's cases (lions, the Solvay group photograph) are gone, and the `portrait` count is down to 104 library-wide; the remaining rule still fires without a human in the frame |
| Promotional material (1 marketing map) | **PARTLY** | No marketing graphic in this sample; the round-2 denylist addition held. But two captions are a vendor's brand or spec sheet: `Immersive Sound LipinskiSound` and `Acrtic BE1200A+ 1200 RPM / 6KG load / Digital display` |
| Thumbnail `tw`/`th` off by 1 px (round 1 D16) | **FIXED, confirmed again** | 200 of 200 |

## Defects

Grouped by what a fix would have to change. `L` = caption language, `R` = residue, `F` = describes the
file, `T` = truncation, `S` = fragment, `U` = uninformative, `W` = wrong subject, `X` = misspelt or
ungrammatical, `K` = kind.

| id | File | What | Suggested fix |
| --- | --- | --- | --- |
| `a345ef46067f99ed` | Auf dem Ofen 1895.jpg | **L** Caption is German, `Auf dem Ofen 1895`, on `body/sleep` | Reject a caption whose only function words are foreign (`dem`, `auf`); translate to "On the stove, 1895" or caption from categories |
| `b9406638ff40fb5f` | Senegal-Langues.jpg | **L** Caption is French, `Senegal Langues`; the Commons description is French too | Caption "Language map of Senegal"; add a map-kind English fallback |
| `81b326e2b667fb9d` | Bâtiment la concorde au Gabon.jpg | **L** Caption is French, `Monument au Gabon` | Caption "La Concorde building, Gabon" |
| `bdf6fe2035abada8` | Bratislava, Parlament, Slovensko.jpg | **L** Caption is Slovak, `Bratislava, Parlament, Slovensko` | Caption "The National Council building, Bratislava, Slovakia" |
| `83be5433ff7fe07d` | STANICA LANOVKY S OBSERVATÓRIOM.JPG | **L** Caption is Slovak **and shouted**: `STANICA LANOVKY S OBSERVATÓRIOM` | Caption "Cable-car station and observatory, Skalnaté pleso"; sentence-case any all-caps caption |
| `ea50e7e72fcd1513` | Ungdomsbiblioteket Bissau.jpg | **L** Caption is Swedish, `Ungdomsbiblioteket Bissau` | Caption "Youth library, Bissau" |
| `0fc71df49d02f6b4` | Lusofonia Angola Censo.png | **L** Caption is Portuguese, `Lusofonia Angola Censo` | Caption "Share of native Portuguese speakers in Angola by municipality" from the description |
| `5a2defc53946f5a5` | Coliseo medieval.jpg | **L** Caption is Spanish, `Coliseo medieval`. Opened: a 16th-century engraved bird's-eye plan of Rome labelled `COLISEO`, `ARCO DI CONSTANTINO` | Caption "The Colosseum on a 16th-century plan of Rome". My rules missed this one — `medieval` is an English word, so the lexicon ratio passed |
| `8c3703a2e340c54c` | SV 410 006 - SOKO - Novi Beograd - 03.jpg | **L R** Caption is a Serbian railway slug, `SV 410 006 - SOKO - Novi Beograd` | Strip a `<class> <number> - <name> - <place>` railway pattern; caption "Train at Novi Beograd station, Serbia" |
| `786c358d3afab87f` | C. L. Sholes Type Writing Machine - NARA - 84785533 (page 1).jpg | **R K** Caption keeps the archive suffix and accession number. Opened: Sholes's 1896 patent drawing, page 1, with stamps and handwriting — a patent drawing stored as `kind: "art"` | Strip `- NARA -`/`- LOC -`/`- DVIDS -` and a trailing accession number, as `- Flickr -` already is; classify as `diagram` |
| `8d291f1cb2653dbd` | Bread of Afghanistan in 2010.jpg | **R** Caption opens with a US military photo id: `100906-F-3322D-009: Naan bread, often eaten with traditional Afghan meals, is prepared…` | Strip a leading `\d{6}-[A-Z]-[A-Z0-9]+-\d+:` token |
| `9d3248e05c271925` | 2011-09-24 17.42 Leuven, universiteitsbibliotheek ceg74154 foto4.jpg | **R** Caption keeps a museum shelfmark: `Leuven, university library ceg74154` | Strip a `[a-z]{2,4}\d{4,}` catalogue token |
| `74eab04e15c2e860` | 20220525.Rijksmuseum Amsterdam.-011.jpg | **R** Caption is the raw file name: `20220525.Rijksmuseum Amsterdam.-011` | Strip a leading `\d{8}\.` date stamp and a trailing `-\d+`; caption "Rijksmuseum, Amsterdam" |
| `607dce4ec546a99c` | 11277-Vatican-FromTheDome (3481600615).jpg | **R S** Caption keeps a 5-digit upload code and camel-case glue: `11277 Vatican FromTheDome` | Strip a leading `\d{4,8}` code; split camel case; caption "Rome seen from the dome of St Peter's" |
| `28d07e510627d070` | Shiva Bearing the Descent of the Ganges River, folio from a Hindi manuscript … LACMA M.86.345.6.jpg | **R K** Caption is a fragment of the LACMA accession plus the museum department: `6) South and Southeast Asian Art`. Opened: an Indian miniature painting of Shiva, stored as `kind: "photo"` | Never caption from text following an accession number; caption "Shiva bearing the descent of the Ganges, Hindi manuscript folio, c. 1740"; classify as `art` |
| `8c4e5b6d620be8dd` | The station pictured from the SpaceX Crew Dragon 5.jpg | **R F S** Caption starts mid-date and keeps the NASA separator: `8, 2021) --- This mosaic depicts the International Space Station pictured from the SpaceX…` | Strip a `jsc\w+ (Mon. D, YYYY) ---` NASA header; drop the `This mosaic depicts` lead-in |
| `97d2432e1c6f47b0` | 2010 G-20 Seoul summit.jpg | **R** Caption runs into the sitter list: `World leaders at the 2010 G-20 Seoul summit Left to right: Front row: Jacob Zuma (South…` | Cut at `Left to right|Front row|Back row`; caption "World leaders at the 2010 G-20 Seoul summit" |
| `31877a3e199549ec` | Gianni Lora Lamia Nissan Terrano T1 Agip Paris-Cape Town 1992 … .jpg | **R S** Caption is the uploader's keyword list, opening on an orphan `0` and repeating Nissan three times: `0 V6 Agip team Nissan Nismo Nissan Motorsport nissan France Dessoude Paris-Cape Town 1992…` | Reject a description with no verb and a repeated token; caption "Nissan Terrano on the 1992 Paris–Cape Town rally, Gabon" from the file name |
| `bfacc176682ee6fb` | Pluto Charon crater map Robbins Dones 2023.jpg | **R** Caption keeps the authors' surnames and year: `Pluto Charon crater map Robbins Dones 2023`. Commons offers `These maps show both Pluto and Charon in equirectangular projection…` | Strip a trailing `<Surname> <Surname> <year>` credit; prefer the description |
| `d3f6d197c85e53e1` | Immersive Sound LipinskiSound.jpg | **R K** Caption is a camel-case brand slug: `Immersive Sound LipinskiSound`. Opened: a speaker-placement diagram (L/C/R/Ls/Rs/LFE on a grid), stored as `kind: "photo"` | Split camel case and strip a vendor name; caption "Speaker placement for immersive sound" from the description; classify as `diagram` |
| `256d452e40b25bdc` | $Kill - Legado.jpg | **R U** Caption is a meaningless file name, `$Kill - Legado`, on `physics/electrical-circuit`. Opened: the picture is fine — a bench circuit with galvanometers, coils and a key | Reject a caption with a leading `$` or no alphabetic word; caption "Circuit with galvanometers on a laboratory bench" from categories |
| `02e934d028cb4041` | Monty Python Live 02-07-14 12 55 10 (14415565317).jpg | **R F** Caption is a camera timestamp: `Photo 02-07-14 12 55 10`, on `people/stephen-hawking` | Reject `^Photo \d` and date-time runs; caption from the "Stephen Hawking" category, or drop the file |
| `54d8bd89c634069b` | At Chester Zoo 2023 019 - Komodo Dragon (cropped).jpg | **R** Caption keeps the shoot sequence: `At Chester Zoo 2023 019 - Komodo Dragon`. Commons offers `Komodo Dragon (Varanus komodoensis) at Chester Zoo.` | Strip a `\d{4} \d{3}` sequence pair; prefer the description |
| `e8c76aa5623e4764` | Blue Whale 001 body bw.jpg | **R** Caption keeps the sequence and the processing slug: `Blue Whale 001 body bw` | Strip a trailing `bw|hdr|edit\d*` and a `\d{3}` sequence; caption "Blue whale" |
| `0636ea9e5297a6c7` | Monte Bianco DSF1243-m.jpg | **R** Stripping the camera token left a dangling suffix: `Monte Bianco -m` | Drop a trailing `-[a-z]{1,3}` after removing a camera token; caption "Mont Blanc" |
| `8ac5c731c453d4fe` | 247 Marine Corps Ball.jpg | **R S** Caption opens on a bare `247` — the ordinal was lost: `247 Marine Corps Ball`, on `countries/ghana` | Restore the ordinal from the description ("247th anniversary of the U.S. Marine Corps"), and say where it was held |
| `af7d64c166b169e4` | Drums set up at Goethe Institut culture concert, Windhoek Namibia.jpg | **F** `The picture depicts drums set up during a concert that was held at Goethe Institut…` | Strip a `The picture depicts/shows` lead-in |
| `8fd856f3e75be859` | Poisson-Tigre Goliath … - Congo 23.jpg | **F** `The photograph shows the massive head and prominent interlocking teeth characteristic…` | Same rule; caption "Goliath tigerfish from the Congo River" |
| `6a9aa2f70be1f8c3` | Встреча 2.jpg | **F** Caption describes a file sequence and mistranslates the place: `A series of shots (1-8): a pair of bears near the Earth-Franz Joseph` | Reject `A series of shots`; `Земля Франца-Иосифа` is Franz Josef Land, not "the Earth-Franz Joseph" |
| `a7a468a3b37387d1` | F-actin and DNA in β cells of pancreas (phaloidin+TRITC and DAPI) 1.jpg | **F** Caption opens with the file's production: `Postprocessed photo (fusion of two) of β cells in pancreas stained by phaloidin+TRITC…` | Strip a `Postprocessed/fusion of two` production note |
| `3320f2c04e060246` | Body cavitiesCCby3.0 connexions - labels removed.jpg | **F K** Caption describes an edit: `Human body cavities with the labels removed`. Opened: an anatomy diagram, lateral and anterior views, **with leader lines pointing at nothing** because the labels were removed, stored as `kind: "photo"` | Drop the file — a label-stripped diagram teaches nothing; if kept, classify as `diagram` and caption "Diagram of the human body cavities" |
| `cd23ecc87f546782` | 3D Medical Animation Nose Top section.jpg | **F K** Caption names the file type: `3D Medical Animation Still Shot Depicting Nose & its Basic Internal Structure`. Opened: a labelled 3D medical illustration (olfactory mucosa, nostrils, pharynx), stored as `kind: "art"` | Caption "Cross-section of the nose and nasal cavity"; classify as `diagram` |
| `5f79f36592d99edc` | Sirius A and B artwork.jpg | **F K** Caption names the file type: `Sirius A and B artwork`. Opened: an artist's impression render, stored as `kind: "photo"` | Caption "Artist's impression of Sirius A and its white-dwarf companion"; classify as `art`, not `photo` |
| `5f89993d681b3bea` | LAMAT 2026 brings advanced cardiac capability to Saint Lucia (9653300).jpg | **T U** Caption is cut at an abbreviation after two words: `Air Force Col` | Never cut before a period-less abbreviation (`Col`, `Lt`, `Sgt`); caption from the file name |
| `e6f85947b870b06c` | MIM Double Manual Piano CN5266.jpg | **T** Caption is cut at the German abbreviation `Kat`: `Pleyel piano (Paris, after 1927) with two keyboards at the MIM, Berlin, Kat` | Cut at the last clause boundary; drop the `Kat.`-number tail |
| `642ad099138dd74e` | Cristobal Columbus20231003 115330.jpg | **T X** Doubled preposition and cut at `St`: `Statue of of Cristobal Columbus St` | Collapse `\bof of\b`; never cut before `St.`; caption "Statue of Christopher Columbus, St Ann's Bay, Jamaica" |
| `e72fe602a214264d` | Bururi National Forest (10.3897-AfrInvertebr.60.38432) Figure 19.jpg | **T** Stripping the figure number left the bare label: `Bururi National Forest Figure` | Strip `Figure \d+` whole, not just the digits; caption "Habitat at Bururi National Forest, Burundi" |
| `2a909c45de522734` | Fresh water milkfish that once fed the entire village are long gone (10697187613).jpg | **T** Caption cut after a verb: `… are long gone, and plant life is…` | Truncate at a clause boundary, never after `is/are/was/were` |
| `c41ab95e890910d6` | Christenelle Diroc with Mother Theresa's Nun in Orphanage in Romania.jpg | **T** + first person: `The help and comfort I received while being in an Orphanage by Mother Theresa's nuns were…` | Reject a first-person description outright (round 2 reported this class fixed); caption from the file name |
| `eca9dc13b9949352` | 750-Gold rod.JPG | **S** Caption starts mid-sentence, lower-case: `after being quenched in water, one can see a black and brown "patina" caused by copper…` | Start at a sentence boundary; caption "18-carat gold rod, 9.5 cm long" from the description's first sentence |
| `da607ef942917483` | Pectoral of Tutankhamun by M. Strasser.jpg | **S** Caption begins with a space and mid-thought: `' The pectoral is made of semi-precious stones and was placed on display…'` | Trim leading whitespace; caption "Pectoral of Tutankhamun, semi-precious stones" |
| `076a3e238c32c9b0` | Silk from Mawangdui 2.jpg | **S** Caption opens on an orphan `1` cut from "Tomb no. 1": `1 at Mawangdui, Changsha, Hunan province, China, dated to the 2nd century BC…` | Do not start a caption on a bare digit; caption "Silk from Tomb 1 at Mawangdui, 2nd century BC" |
| `6fc40f671af5525e` | Three elephant's curly kisses.jpg | **S** Caption is a narrative fragment: `Soon the baby started trying to join the 'fight' & by stretching its trunk to the limit…` | Prefer the file name here; caption "Three elephants touching trunks" |
| `fabdeafa80f07828` | Chandra image of Cygnus X-1.jpg | **F-adjacent** Caption is a history lesson, not a description: `About a decade after its discovery, Cygnus X-1 secured a place in the history…` | Prefer a sentence that describes the image; caption "Chandra X-ray image of Cygnus X-1" |
| `5457ed633899979e` | Oxygen Generator Applications.jpg | Caption is a textbook definition: `Pressure swing adsorption (PSA) is a technique used to separate some gas species…`. Opened: a technician beside PSA vessels (the kind label `photo` is right) | Caption "Technician assembling a pressure-swing-adsorption oxygen generator" |
| `db2d97a95044c8fa` | Changunarayan photowalk-WLV-3897.jpg | Caption is a gazetteer entry: `Changunarayan is a municipality in Bhaktapur District in the Bagmati Zone of central…` | Reject `X is a municipality/city/town in`; caption from the "Changunarayan Temple" category |
| `cfdd771293059b3a` | Platinum Mining.jpg | Caption is a claim about the industry, not the picture: `Platinum mining is an extremely lucrative mining industry found within South Africa` | Caption "Platinum mine in South Africa" |
| `4c8beb5cf7b8ffee` | Tennis shake hands after match.jpg | Caption is advice: `It is good sportsmanship to shake hands with your opponent after playing a tennis match…`. **K** Opened: a photograph of two players shaking hands at the net, stored as `kind: "art"` | Caption "Players shaking hands at the net after a match"; classify as `photo` |
| `48918b00b1bc1ace` | Rubaga Cthedral.jpg | **X** Caption repeats the uploader's typo: `Rubaga Cthedral`. The description spells it correctly | Spell-check a file-name caption against the description; caption "Rubaga Cathedral, Kampala" |
| `3f82173d08ac640f` | Cardiac catheterization.jpg | **X K** Caption is misspelt and has no grammar: `Catherizathion heart femoral artery`. Opened: a 3D medical illustration of the catheter route from the femoral artery to the heart, stored as `kind: "art"` | Caption "Catheter route from the femoral artery to the heart"; classify as `diagram` |
| `30c981224a6bf8c8` | WashingMachine, manufactured by ArcticRomania.jpg | **X** Caption is a misspelt spec sheet: `Acrtic BE1200A+ 1200 RPM / 6KG load / Digital display` | Reject a description that is only model numbers and specs; caption "Front-loading washing machine" |
| `a861d6304496897c` | Childrens are swimming (b).jpg | **X** Caption is ungrammatical: `Childrens are swimming` | Caption "Children swimming" |
| `9a8a77eca9b06c9b` | Arabian Leopard Nimr (8454247265).jpg | **X** Caption is the uploader talking to himself, with a typo, and says nothing about the leopard: `A nice view, pity about the man made structrues in the background!` | Reject a description with no subject noun from the file name; caption "Arabian leopard, Saudi Arabia" |
| `a77952921c5fc1c1` | Winter snow in Kitzbühel.jpg | **X** Caption is keyword spam with broken capitals: `Winter snowing skiing holiday KItzbuhel Austria` | Prefer the file name; caption "Winter snow in Kitzbühel, Austria" |
| `770dd4e1a8d987ef` | GEORGE WASHINGTON HOUSE - BARBADOS.jpg | All-caps shouting: `WASHINGTON'S RENTED HOUSE KNOWN THEN AS BUSH HILL HOUSE WAS BUILT IN 1715` | Sentence-case a caption with no lower-case letters |
| `dee1ea28b20bf12d` | Nikola Tesla (19125122247).jpg | **W** Caption equals the article title and misdescribes the picture: `Nikola Tesla` on `people/nikola-tesla`, where Commons says `Nikola Tesla, Stern am Gehweg eingelassen, in Opatija` — a pavement star | Reject a caption equal to the article title (round 2 reported this fixed); caption "Star commemorating Nikola Tesla, Opatija" |
| `824eb2cdc98a3118` | Pluto in True Color - High-Res.jpg | **W** A Pluto photograph illustrates `space/asteroid`; the caption is about Pluto: `Pluto's image taken by New Horizons on July 14, 2015, from a range of 22,025 miles…` | Drop the file from `space/asteroid` — Pluto is not an asteroid |
| `be9f63d142959de7` | Random Structures in the Brain 052.jpg | **W** Caption is a workshop announcement on `body/ear`: `From October 16 to 20 NeuroMat hosted the workshop "Random Structures in the Brain"` | Drop the file; it illustrates neither the ear nor the caption |
| `6f7f29f36014cabc` | H.I.M Haile Selassie I with H.M Elizabeth II.webp | **W S** `M Elizabeth II in 1954 entering Buckingham Palace` on `people/haile-selassie-i` — the `M` is the tail of `H.M`, and the caption names the wrong person for the article | Caption "Haile Selassie I with Elizabeth II, 1954"; never start a caption on a one-letter token |
| `9c83b5bf354822ca` | Mango sticy rice (3859549574).jpg | **W** Caption describes the venue, not the dish: `Erawan Tea Room at Grand Hyatt Erawan Bangkok Hotel, Thailand` | Caption "Mango sticky rice, Bangkok" (the Commons file name's typo aside) |
| `16fb73313eb05534` | Cat with window in wooster (Unsplash).jpg | **W U** Caption is a place alone, `Wooster, United States`, on `inventions/light-bulb`. Opened: a living room with a sofa and two lamps; the bulb is not the subject | Drop the file from `inventions/light-bulb` |
| `7bec125f53ecf648` | MR Roberts.jpg | **U** Caption is `MR Roberts` on `body/ear` — a name with no context | Caption from the description or categories; if neither exists, drop the file |
| `13ba6f1b332ee5e7` | Demonstration Stage.jpg | **U** Caption is `Demonstration Stage` on `physics/static-electricity` | Say what is being demonstrated |
| `0c3653776118d019` | Lady Physicist.jpg | **U** Caption is `Lady Physicist` on `countries/botswana` — uninformative and dated phrasing | Caption "Physicist at work, Botswana" |
| `b1c27ac56ae67ad9` | Isaohm Shunt BVS, Nikrothal LX.jpg | **U** Caption is two product names: `Isaohm Shunt BVS, Nikrothal LX`. Commons adds `2 mOhm, size 3920 … photographed on 5 mm grid paper` | Caption "Precision resistance alloys on 5 mm grid paper" |
| `d9d0771b06f9528e` | Ahmed Abokob.jpg | **U** Caption is a bare name; Commons offers `a Somali skirmisher from Djibouti, apart of the 1st Battalion of Somali Tirailleurs` | Caption "Ahmed Abokob, Somali tirailleur from Djibouti" |
| `435163c93ae4cbca` | FIFA World Cup 2010 Brazil North Korea 7.jpg | **U** Caption is a file-name slug with no verb: `FIFA World Cup 2010 Brazil North Korea` | Caption "Brazil v North Korea, 2010 FIFA World Cup" |
| `e32c8bc2d620dd72` | Sexy Leg.jpg | Caption `Sexy Leg` on `body/leg` — honest to the file, wrong register for an encyclopedia, and the Commons description (`Sexy bare leg with shapely calf, anklet, barefoot`) is no better | Replace the file with an anatomical photograph of a leg |
| `03d3ad7f63951982` | Chiang-Mai Thailand Print-shop-01.jpg | **K** Stored as `kind: "portrait"`. Opened: a photograph of a print-shop interior with an offset press; no sitter | Require a human subject signal before `portrait`; classify as `photo`. (The caption also says Phuket while the file name says Chiang Mai — Commons' own conflict, not Awari's) |
| `30c23555b474a214` | Mosaic of reflective viewshed analyses … Taskast wadi.jpg | **K** Stored as `kind: "map"`. Opened: a six-panel academic figure labelled `(a) Cluster 2` … `(f) Cluster 5`, with a legend and scale bar | Classify as `diagram`; better, drop a multi-panel figure from an encyclopedia article (round 1's "sequences" rule) |
| `87b9324bc2883379` / `859e2b3c76a397bc` | Tajikistan satellite photo.jpg / Uzbekistan satellite photo.jpg | **K** The same genre, two kinds: both are bordered satellite composites with near-identical captions (`… based on a satellite picture`), one stored as `photo`, the other as `map` | Pick one rule for a bordered satellite composite and apply it to both |

## The sixteen thumbnails opened

Each is a plain 480 px downscale of the file it names; no crop, substitution or wrong-revision was
found in any of the sixteen. Ten were the check-5 sample; six more were opened because the metadata
could not settle a kind question.

| id | What the thumbnail shows | Matches Commons | Bears on |
| --- | --- | --- | --- |
| `256d452e40b25bdc` | a bench circuit: galvanometers, coils, a Morse-style key, red leads | yes | the picture is right, the caption is junk |
| `3320f2c04e060246` | anatomy diagram, lateral and anterior views, coloured cavities, leader lines with no labels | yes | kind, and the file's usefulness |
| `d3f6d197c85e53e1` | a grid plan with L/C/R/Ls/Rs/LFE speaker positions around a listener | yes | kind = diagram |
| `5a2defc53946f5a5` | a 16th-century engraved bird's-eye plan of Rome, `COLISEO` labelled | yes | kind `map` defensible; caption is Spanish |
| `f7e71ea2436956a0` | a US Census line map, "States, Municipalities, and Places", Republic of Palau | yes | kind `map` correct, no defect |
| `3f82173d08ac640f` | a 3D medical illustration, catheter route from groin to heart | yes | kind = diagram |
| `cd23ecc87f546782` | a labelled 3D render of the nasal cavity | yes | kind = diagram |
| `4c8beb5cf7b8ffee` | a photograph of two tennis players shaking hands at the net | yes | kind = photo |
| `03d3ad7f63951982` | a print-shop interior, offset press, two people at the back | yes | kind ≠ portrait |
| `28d07e510627d070` | an Indian miniature painting: Shiva on Nandi, Ganges descending | yes | kind = art; caption is an accession fragment |
| `5f79f36592d99edc` | a render of a brilliant white star with a small blue companion | yes | an artist's impression, not a photograph |
| `859e2b3c76a397bc` | a satellite composite of Uzbekistan with the border outlined | yes | kind inconsistency with `87b9324bc2883379` |
| `5457ed633899979e` | a technician in a hard hat beside black PSA pressure vessels | yes | kind `photo` correct; caption is a definition |
| `16fb73313eb05534` | a living room: grey sofa, teal cushions, two lamps, a cat on the sill | yes | weak relevance to `inventions/light-bulb` |
| `30c23555b474a214` | six panels (a)–(f) of viewshed analysis over satellite basemaps | yes | kind = diagram, multi-panel figure |
| `786c358d3afab87f` | Sholes's patent drawing, page 1, stamps and clerk's handwriting | yes | kind = diagram; caption keeps the NARA accession |

## What I could not check

1. **Whether the recorded licence is the file's only licence.** The API returns a single
   `LicenseShortName`; a file whose chosen template is off-list while that field reports a CC one
   would need the wikitext to catch.
2. **Restrictions that do not appear in the `Restrictions` field**: personality rights, trademark,
   freedom of panorama, currency rules. The field was empty for all 200 and I did not read the file
   pages. `30c981224a6bf8c8` (a named washing-machine model) and `d3f6d197c85e53e1` (a vendor's
   diagram) are where a trademark question would bite first.
3. **Whether a Commons upload is itself a copyright violation.** I took Commons' own tag at face
   value.
4. **Byte identity of the thumbnails.** I compared format, width, dimensions, aspect ratio and, for
   sixteen, the visible content; I did not download originals or compute a perceptual hash.
5. **The 3,786 pictures outside the sample.** At 68 caption defects in 200, the library-wide rate on
   my full bar is roughly 1,350; the 18 residue cases imply ~360 and the 9 non-English ~180, and both
   are single-rule fixes. The kind rules are systematic, not sampled: with 3 `diagram` records in
   3,986 and five diagram-worthy pictures in 200, something near a hundred are mislabelled.
6. **Whether `CREDITS.md` lists these 200.** Out of scope here; authors were matched against
   `public/media/<subject>.json` by id as instructed, and all 200 resolved.
7. **Rendered pages.** No browser or screen tooling was available (`@kirocrew-computer` not
   configured), so I could not see how a 90-character caption or a label-stripped diagram actually
   lays out; captions were judged against the image files and the Commons metadata.
8. **Article relevance in general.** I judged it only where a thumbnail or the metadata made it plain
   (the five `W` rows); a systematic relevance audit was not part of this brief.
9. **Which denylist entry rejected which description.** I could see that 11 records fell back to the
   file name over Wiki-Loves-Monuments boilerplate, and that the fallback was right, but not which
   rule fired — I did not read `scripts/media/`, by design.
10. **A library that stopped holding still.** See the addendum: another process rebuilt the captions
    while this audit was running, so every finding above is as of the snapshot I read, not as of now.

## Addendum: the library was rebuilt during this audit

This audit read `public/media/*.json` at about 05:25, against the sample file written at 05:14:34.
At **05:38:05** another process rewrote `scripts/media/caption.ts` and `scripts/media/denylist.json`,
and at **05:39:16** it rewrote every `public/media/*.json`. The library went from 3,986 records to
3,985 and 21 captions changed. **Everything above describes the 05:25 snapshot**; I did not re-run the
audit against the newer build, because a sample drawn from one build cannot be scored against another.

All 200 sample ids still exist, no kind label changed, and 9 of my 71 defect records were touched.
Two are genuinely fixed:

| id | was | now |
| --- | --- | --- |
| `8d291f1cb2653dbd` | `100906-F-3322D-009: Naan bread, often eaten with traditional Afghan meals, is prepared…` | `Bread of Afghanistan in 2010` — the military photo id is gone |
| `8fd856f3e75be859` | `The photograph shows the massive head and prominent interlocking teeth characteristic…` | `Close-up photograph of a wild Goliath tigerfish ( Hydrocynus goliath )` — the `The photograph shows` lead-in is gone |

The other seven only lost their trailing ellipsis clause, and **four of those are now worse, not
better** — the tail was cut without fixing the start, so a long truncated sentence became a short
meaningless one:

| id | was | now |
| --- | --- | --- |
| `eca9dc13b9949352` | `after being quenched in water, one can see a black and brown "patina" caused by copper…` | `after being quenched in water` |
| `fabdeafa80f07828` | `About a decade after its discovery, Cygnus X-1 secured a place in the history…` | `About a decade after its discovery` |
| `076a3e238c32c9b0` | `1 at Mawangdui, Changsha, Hunan province, China, dated to the 2nd century BC…` | `1 at Mawangdui, Changsha, Hunan province, China` — still opens on the orphan `1` |
| `2a909c45de522734` | `… are long gone, and plant life is…` | `Fresh water milkfish that once fed the entire village are long gone` — this one is an improvement |
| `6fc40f671af5525e`, `4c8beb5cf7b8ffee`, `824eb2cdc98a3118` | ellipsis tail | ellipsis tail removed, same text otherwise |

So the newest build shortens captions at a clause boundary instead of mid-phrase, which is the right
move for the two cases where the sentence had a usable head, and no help at all for the three where
the caption starts mid-sentence (`eca9dc13b9949352`, `fabdeafa80f07828`, `076a3e238c32c9b0`). The
mid-sentence-fragment class (**S**) is the one to fix next: trimming the tail cannot repair a caption
that begins in the middle of someone else's sentence.

A round 4 should re-sample from a build that is not being rewritten, and should check the **S**, **L**
(Latin-script languages) and **K** (`diagram` is effectively unused) classes first, since those three
are rule-level and none of them is addressed by tail trimming.
