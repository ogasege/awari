# Media library design review — round 3

Reviewer: awari-design-reviewer. Date: 14 November 2026.
Round 1: `docs/kiro-evidence/crew/media-design-review-1.md` (124 of 200 pictures had a problem;
screen defects N1-N20). Round 2: `docs/kiro-evidence/crew/media-design-review-2.md` (159 of 200;
new defects P1-P8).
Evidence this round: `docs/kiro-evidence/crew/media-sheets/` (10 new contact sheets of a fresh
200-picture sample, `index.json`), `docs/kiro-evidence/crew/media-screens/` (1440 px and 390 px
captures written at 05:22, **after** the screen sources were last modified at 05:17-05:19, so for the
first time the captures are newer than the code they show), and the rebuilt library under
`/Users/mac/workplace/awari/public/media/` (3,986 records).
Measured against `.kiro/steering/design.md` and `.kiro/specs/23-media-library/requirements.md`.

**Image budget.** I was held to about twelve images for the whole run. I spent them on six of the ten
contact sheets (sheets 1, 3, 5, 7, 9, 10 — 120 of the 200 pictures) and six screen captures
(Pictures at 1440 and 390, the article, Home, the picture quiz, credits, all at 1440). Sheets 2, 4, 6
and 8 were judged from `index.json` captions only, with no sight of the pictures, and the Castle
capture was not opened. Every count below says which basis it rests on. This is the one real
weakness of round 3 and it is listed again at the end.

## Counts

| | round 1 | round 2 | round 3 |
|---|---|---|---|
| Pictures in the sample | 200 | 200 | 200 |
| Pictures opened and judged by eye | 200 | 200 | **120** (six sheets) |
| Pictures with a problem | 124 of 200 (62%) | 159 of 200 (80%) | **98 of 120 (82%)** |
| …counting only substantive faults, cosmetic caption quirks ignored | — | 134 (67%) | **63 of 120 (53%)** |
| Suggested drop | 87 | 100 | **47 of 120 (39%)** |
| Suggested keep with a rewritten caption | 37 | 59 | **51 of 120** |
| Screen defects fixed outright | — | 4 | **11** |
| Partly fixed | — | 4 | **4** |
| Still standing | — | 5 | **4** |
| Unverifiable from this capture set | — | 7 (code-only fixes) | **1** (N13) |
| New defects | — | 8 (P1-P8) | **11 (R1-R11)** |

Problems by kind, each picture counted once under its main fault, the same five kinds as rounds 1
and 2. Round 3 is over the 120 pictures I opened, so the percentage is the column to compare, not
the count.

| kind | round 1 (of 200) | round 2 (of 200) | round 3 (of 120) |
|---|---|---|---|
| Caption wrong, not English, truncated, or a placeholder | 52 (26%) | 67 (34%) | **51 (43%)** |
| Does not show what its article is about | 36 (18%) | 44 (22%) | **25 (21%)** |
| Excluded kind (flag, collage, screenshot, page of text, research figure, marketing graphic) | 24 (12%) | 38 (19%) | **19 (16%)** |
| Unsuitable for a ten-year-old | 7 (3.5%) | 6 (3%) | **3 (2.5%)** |
| Near-duplicate of another picture on the sheets | 5 (2.5%) | 4 (2%) | **0** |

Caption faults can be counted over all 200, because `index.json` carries every caption as text. On
that full basis, **87 of the 200 captions (44%)** carry at least one mechanical fault:

| caption fault | count in the 200 |
|---|---|
| Ends in an ellipsis (cut mid-sentence or mid-word) | 40 |
| Three words or fewer | 39 |
| Not English, or carries non-English text | 9 |
| Archive or pipeline residue still at the front | 8 |

The nine that are not English: 1/18 "Creativ at Night the Deckel - Heidenheimer Deckel",
2/14 "Umspannwerk Teinach am E-Werk Teinach, Station Teinach", 2/20 "Energia Eolica",
4/10 "Nagrobek Zygmunta Starego i Zygmunta Augusta", 5/20 "Vincent, Karibik - St",
6/04 "Ostafrikanisches Spitzmaulnashorn", 6/20 "Puente Inca Pucayaku", 8/02 "Cantando Hip Hop",
and 9/17, which is English but misspells "Vallley".

The eight residue captions: `(Constellations of the southern hemisphere)` (1/10),
`Depicted person: Isaac Newton – …` (1/14), `0662019 - Conversations about Leading: …` (2/06),
`Translation of original description: …` (4/14), `Abstract: Miner underground …` (4/17),
`500px provided description: Voltage In The Mountains…` (4/18),
`P20250808DT-1377 President Donald Trump signs …` (9/13), `html G299 was left over …` (10/14).

### The second, looser count

Pictures a ten-year-old would be **well served by**: **57 of the 120 I opened (48%)**. That is the
22 pictures with no fault at all, plus 35 whose only fault is a cosmetic caption quirk.

What I ignored to reach that number: a caption cut off with an ellipsis; a caption that is a product
or model name rather than a sentence ("GE 2 Speed Commercial Washers", "Hiller YROE-1"); an archive
or pipeline prefix still attached ("Depicted person:", "html ", "Abstract:"); a misspelling or a
missing capital ("decomissioned", "jan 9, 2011", "mount Fuji"); a stray escape (`England\'s`); a
first-person or chatty voice ("A random toad that I found on the ground"); an artist-and-title
format ("Sandro Botticelli - Idealized Portrai…"). In every one of those cases the picture is
genuinely of its article and a rewritten caption would make it good.

What I did **not** ignore, because it is not cosmetic: a caption that names something other than
what is in the frame (3/12 "Nisqually Glacier" over a photograph of Mount Rainier), a caption that
is unreadable as English (3/04 "2% of the sun, therefore the moon is perfectly centered over the
sun", 9/04 "5 m) Hooker telescope at Mount Wilson…"), a caption in another language, and a caption
that says nothing at all about the picture (7/08 "General hotel" under a photograph of a Seychelles
cove).

The nearest comparable figure from round 2 is its 67% substantive-problem rate, so about a third of
that sample was well served against 48% here. The definitions are not identical, so treat that as a
direction, not a measurement.

### What the rebuild fixed

1. **Non-English captions are down sharply**: 9 in this sample against 27 in round 2 and "at least
   22" in round 1. The WordNet check works on whole captions; what it misses is a caption made
   entirely of proper nouns, which is how all nine survivors got through.
2. **No placeholders.** No "identified by ID", no "with ID", in the sample or on the screens. Third
   round of this holding.
3. **No duplicate captions inside the sample at all** (round 2 had ten strings shared by 22
   pictures; the library now has six groups covering 12 records), and **no near-duplicate picture
   pair** in the 120 I opened. This is the first round with a zero in that row.
4. **The denylist is enforced.** `scripts/media/denylist.json` holds 131 titles taken from my drop
   verdicts and **not one record in the library matches a denylisted title**.
5. **Excluded kinds are nearly gone from the data**: 4 records of kind `flag` (round 2: 41) and 0
   `emblem` (round 2: 21).
6. **Starry Night is gone** from the library, which was round 2's P1 and the root of N15.

### What the rebuild did not fix

1. **Caption truncation is untouched.** 706 of 3,986 stored captions (18%) still end in an ellipsis,
   exactly the round-2 rate, and 40 of the 200 sampled do. This is in the data, not the rendering.
2. **Kinds from titles have not made the pictures English or relevant.** The excluded-kind rate is
   16% of what I opened: research figures (3/02 germ-layer chart, 3/14 back-arc schematic, 7/02
   isometric chamber drawing, 7/10 muscle nomenclature diagram), pages of text (1/10 a manuscript
   page under space/constellation, 7/05 a printable pH scale, 9/03 a swimming certificate, 9/19 a
   book title page under people/charles-darwin, 10/15 a shark warning notice), marketing and product
   shots (7/01 phone shelves under an "asda mobile" banner, 9/20 a gas-leak-detector spray bottle,
   10/09 a "Solar System Walk Decal" sign, 10/17 a camcorder-and-VCR shot), and composites (1/19,
   9/01, 9/12, 10/08).
3. **Artwork is still filed as photography.** 37 records whose `kind` is `photo` describe themselves
   as a mosaic, drawing, illustration, engraving or map. Two artist's-concept paintings of Mars
   reached this sample (1/04, 9/02).
4. **Relevance is still the weakest rule.** 25 of 120 pictures do not show their article:
   7/09 elephant skin under `body/skin`, 5/01 an animal jawbone under `body/bone`, 3/07 a trailside
   plaque under `space/mercury`, 3/10 a man at a COP30 podium under `inventions/solar-energy`,
   9/13 a White House signing ceremony under `countries/azerbaijan`, 10/05 a modern fantasy painting
   under `ancient/aztecs`, 10/08 an asteroid under `space/comet`.
5. **Three round-1 and round-2 rejects are back under new ids or unchanged.**
   5/19 `80318a` is the same pair of framed oval prints captioned "Electric current, by Leo Daft"
   that I dropped twice as round 1's 1/10 and 5/10 — a new id, the same picture, the same caption.
   9/18 `2a9f15` is another near-black frame captioned "Light and dark in the night", the exact
   caption of round 1's 8/11 and 9/04. 10/11 `e607e8` is unchanged and still misspells
   "decomissioned", flagged now for the third round running.
6. **Five pictures I asked to keep-and-recaption kept the faulty caption.** `e607e8`, `5eca1b`
   ("Charging on rubbing", 4/04), `024e3a` (the dictionary-definition lightning caption, 8/07),
   `5ba459` (now shortened to the bare credit "By Elisa Schorn", 6/15) and `d4463c` (now
   "Depicted person: Isaac Newton – …", 1/14). The denylist carried the drops through; nothing
   carried the rewrites through.
7. **Article crowding persists**: nine articles appear three or more times in a 200-picture sample
   drawn from 480 articles — `physics/battery` four times, and `inventions/washing-machine`,
   `physics/static-electricity`, `people/florence-nightingale`, `physics/ohms-law`,
   `ancient/great-zimbabwe`, `space/uranus`, `ancient/renaissance`, `physics/voltage` three times
   each. `ancient/great-zimbabwe` draws three pictures and two of them (3/06 a bush landscape, 9/17
   a hillside of aloes) do not show the ruins.

### Part A, the 120 pictures I opened

Cells are sheet/cell, counting rows of five from the top left. Only cells with a fault are listed;
the rest are good as they stand.

#### Sheet 1
| cell | id | article | what | action |
|---|---|---|---|---|
| 1/04 | bbce56 | space/mars | An artist's concept painting of the Curiosity rover, not a photograph. Caption says so and is then cut off. Second Mars artist's concept in this sample with 9/02. | drop |
| 1/08 | 4c4591 | body/breathing | A washed-out white-blue blur in which nothing can be made out; caption "In 33 degree weather" explains nothing. | drop |
| 1/10 | df0ab8 | space/constellation | A manuscript page of Arabic script with a small star chart. A page of text, and the caption is a parenthetical fragment. | drop |
| 1/18 | 4d5f74 | arts/guitar | Two orange paper coasters reading "Guten Appetit". No guitar in the frame; caption is German. | drop |
| 1/19 | c9616c | physics/static-electricity | A two-panel composite with drawn + and - symbols over the photographs. Composites are excluded, and the symbols are a diagram laid on a picture. | drop |
| 1/02 | 667c68 | wildlife/frog | A clear frog on bark; the caption names a botanical garden and never the animal. | keep, rewrite caption |
| 1/05, 1/06, 1/12 | e99aac, b748d3, 849789 | arts/theatre, inventions/robot, space/hubble-space-telescope | Three strong photographs (Epidaurus, the TOPIO robot, Hubble over Earth) with captions cut off mid-sentence. | keep, fix captions |
| 1/07 | ba2c33 | ancient/temple-of-artemis | A carved column drum in a museum; caption "Column drum Ephesus" is a label, not a sentence. | keep, rewrite caption |
| 1/09 | 41ca35 | inventions/washing-machine | A row of commercial washers; caption is a product name. | keep, rewrite caption |
| 1/11 | 533150 | body/heart | Students handling an anatomical torso model; the caption never mentions the heart and is cut off. | keep, rewrite caption |
| 1/14 | d4463c | people/isaac-newton | The Newton engraving round 1 flagged at 3/01 for not naming him. It now names him, behind the residue "Depicted person:". | keep, fix caption |

#### Sheet 3
| cell | id | article | what | action |
|---|---|---|---|---|
| 3/02 | 001e9c | body/cell | A multi-panel germ-layer chart of tiny labelled cells. A research figure, unreadable at strip size. | drop |
| 3/06 | 750577 | ancient/great-zimbabwe | Bush and low hills with one small building; the stone ruins are not identifiable. Caption is the bare article name. | drop |
| 3/07 | 96a0b1 | space/mercury | A metal plaque on a rock at a "planet trail". Shows a sign, not the planet. | drop |
| 3/08 | e52bca | science/energy | A branded petrol station at dusk. Brand-forward, and energy is not what a child sees. | drop |
| 3/10 | e7dd8f | inventions/solar-energy | A man in a suit at a COP30 podium. No solar energy in the frame. | drop |
| 3/13 | b8b32b | science/iron | Black powder in a petri dish, captioned "Iron(II,III) oxide, Fe 3 O 4" with broken subscripts. A child sees black dust. | drop |
| 3/14 | ba30ae | earth/plate-tectonics | A labelled back-arc-basin schematic citing "(after Artemieva, 2023)". A research figure. | drop |
| 3/17 | 220b8f | countries/tuvalu | A met-office building behind a wire fence on an empty road, as a child's first view of Tuvalu. | drop |
| 3/04 | 14c744 | space/solar-eclipse | A fine annular eclipse; the caption starts mid-sentence ("2% of the sun, therefore the moon is perfectly centered over the sun"). | keep, rewrite caption |
| 3/05 | 8ccfe4 | wildlife/owl | A clear Keulemans plate of laughing owls; caption is an artist-and-species label. | keep, rewrite caption |
| 3/09 | fa36ff | arts/ballet | A 17th-century costume drawing; caption "The ballet was choreographed in 1653" describes an event, not the picture. | keep, rewrite caption |
| 3/11 | 3343d8 | physics/electrical-circuit | A circuit board close-up with a caption in component jargon. | keep, rewrite caption |
| 3/12 | a7ee26 | earth/mount-rainier | An excellent photograph of Mount Rainier captioned "Nisqually Glacier", which names neither the mountain nor what fills the frame. | keep, rewrite caption |
| 3/15, 3/20 | e22f27, 67d3b5 | inventions/typewriter, arts/olympic-games | A museum Chinese typewriter and the 1964 Paralympic opening, both with captions cut off. | keep, fix captions |
| 3/16 | a3b008 | people/kofi-annan | Annan and Carter at a press scrum; caption lowercases "jan 9, 2011". | keep, fix caption |
| 3/18 | 7dd41a | countries/indonesia | Two men mid-movement in a hall, possibly a martial-arts demonstration; the caption is only a district name, so a reader cannot tell what is happening. | keep, rewrite caption |

#### Sheet 5
| cell | id | article | what | action |
|---|---|---|---|---|
| 5/01 | dcc003 | body/bone | An animal jawbone on a beach, under the article about the human skeleton's bones. | drop |
| 5/04 | 774487 | people/florence-nightingale | Her commemorative statue in Derby. An object, not the person; this article has a real portrait at 7/14. | drop |
| 5/05 | 4619ee | ancient/middle-ages | A "Europe in 1360" map whose place names are illegible at any size offered here. | drop |
| 5/06 | bc57b8 | ancient/inca-empire | A mountain path and peaks captioned "Machu Picchu station, Aguas Calientes"; neither the station nor any Inca structure is visible. | drop |
| 5/09 | fd0391 | body/stomach | An endoscopy frame of the inside of a stomach with burned-in clinic metadata and a patient's age. Clinical and off-putting at this age. | drop |
| 5/11 | e4e63d | arts/museum | A union picket line outside the Philadelphia Museum of Art. A labour dispute as the museum article's picture. | drop |
| 5/16 | 7d9c93 | science/sound | Two people posing beside studio speakers, captioned with their names. Nothing about sound. | drop |
| 5/19 | 80318a | physics/electric-current | The framed oval prints again, captioned "Electric current, by Leo Daft". Dropped twice already in round 1 (1/10, 5/10) and back under a new id. | drop |
| 5/08 | 00ac0a | earth/mount-etna | A superb night eruption; caption "Etna's NSEC eruption" is an acronym. | keep, rewrite caption |
| 5/10 | 718fce | inventions/helicopter | A Hiller flying platform in flight; caption is the model code only. | keep, rewrite caption |
| 5/14 | f2aa11 | body/hair | A fluorescent hair strand; the caption is a melanin factoid that never describes the picture and is cut off. | keep, rewrite caption |
| 5/20 | dcdbe2 | countries/saint-vincent-and-the-grenadines | A garden and church tower; caption "Vincent, Karibik - St" is broken German. | keep, rewrite caption |
| 5/02, 5/07, 5/13 | 4712d9, d272ee, 627862 | arts/usain-bolt, inventions/refrigerator, ancient/renaissance | Bolt's victory pose, a museum refrigerator exhibit and the Cobbe portrait, all with captions cut off. | keep, fix captions |
| 5/12 | 858134 | arts/photography | A phone photographing people; caption is brand-forward and reads "to photograph persons". | keep, rewrite caption |
| 5/18 | be8a53 | wildlife/polar-bear | A lovely mother and cubs; caption is two sentences run together without punctuation. | keep, fix caption |

#### Sheet 7
| cell | id | article | what | action |
|---|---|---|---|---|
| 7/01 | 412cb6 | inventions/mobile-phone | Supermarket phone shelves under an "asda mobile — Keeping you connected" advertising banner. Advertising. | drop |
| 7/02 | 586d4d | ancient/great-pyramid-of-giza | A faint isometric line drawing of the Queen's chamber with tiny labels. | drop |
| 7/05 | 5b860a | science/acid | A printable black-and-white pH scale. A page of text. | drop |
| 7/09 | e0351e | body/skin | Elephant skin in close-up, under the human skin article. | drop |
| 7/10 | 7db0e3 | body/muscle | A sparse line diagram of neck muscles with red labels. A technical figure. | drop |
| 7/11 | a78c1a | body/heart | A hand holding a raw animal heart outdoors, captioned "Heart! ❤". A raw organ with an emoji is the wrong register for a ten-year-old. | drop |
| 7/17 | 09a7e5 | science/atom | A neon emission spectrum of red bands, captioned "through a grid (1000 dashes / mm)". Opaque. | drop |
| 7/06 | 941313 | science/gas | Good gas-hob flames; caption "Gas flame dyeing with salt" is not English as written. | keep, rewrite caption |
| 7/07 | 7bdf31 | ancient/kingdom-of-aksum | An 18th-century engraving of an Aksumite stele; the caption is a Yale accession line with a file number. | keep, rewrite caption |
| 7/08 | 810adb | countries/seychelles | A beautiful cove, captioned "General hotel". The caption is meaningless and the picture is one of the best in the sample. | keep, rewrite caption |
| 7/04, 7/12, 7/13, 7/15, 7/18 | 6834ea, 79b627, ff0813, 31ccef, 126664 | earth/atlantic-ocean, inventions/washing-machine, ancient/renaissance, earth/himalayas, wildlife/zebra | Five good pictures (Camps Bay, a Miele rotor washer, a Botticelli portrait, Paro Taktsang, zebras at a waterhole) with captions cut off. | keep, fix captions |

#### Sheet 9
| cell | id | article | what | action |
|---|---|---|---|---|
| 9/01 | 4ac5cb | people/mahatma-gandhi | Two portraits side by side as one picture. A composite, though it does show Gandhi. | keep only as a single frame |
| 9/02 | 00e714 | space/mars | A NASA artist's conception painting of a crewed Mars base. Not a photograph. | drop |
| 9/03 | 7c1fbd | arts/swimming | A scan of a swimming certificate carrying a named child's handwritten details. A page of text, and personal. | drop |
| 9/06 | 803ac5 | countries/djibouti | A blank wall and a restaurant sign on an empty street, as a child's first view of Djibouti. | drop |
| 9/09 | e30d86 | arts/wolfgang-amadeus-mozart | Mozart's birthplace facade. With 4/13 (his piano), the article's pictures are buildings and objects, not the composer. | drop |
| 9/10 | 4465dd | wildlife/bat | Goya's "The sleep of reason produces monsters": a slumped figure swarmed by night creatures. Nightmarish, and not a bat a child can learn from. | drop |
| 9/12 | 2e045a | space/uranus | Two Uranus disks side by side. A composite. | keep only as a single frame |
| 9/13 | b0eb40 | countries/azerbaijan | A White House signing ceremony, captioned with an archive code. Contemporary politics as the country's picture. | drop |
| 9/17 | d7cca7 | ancient/great-zimbabwe | A hillside of aloes; the ruins are not in the frame, and the caption misspells "Vallley". | drop |
| 9/18 | 2a9f15 | science/light | A near-black frame with one distant light, captioned "Light and dark in the night" — the identical caption of the two I dropped in round 1. | drop |
| 9/19 | 29a07f | people/charles-darwin | The title page of "The Best of the World's Classics", on which Darwin is one of four thumbnail portraits. A page of text. | drop |
| 9/20 | ff3562 | science/gas | A bottle of "Camco Gas Leak Detector Pink Spray". A product shot. | drop |
| 9/04 | acb97a | space/telescope | The Hooker telescope, a strong photograph; the caption begins "5 m) Hooker telescope…", mid-parenthesis. | keep, rewrite caption |
| 9/14 | f88f28 | physics/electric-current | A striking blue argon lamp; caption "glows with a blue glow" repeats itself. | keep, rewrite caption |
| 9/15 | 0c0654 | ancient/industrial-revolution | Derby's Silk Mill; caption repeats the museum name and runs two titles together with a semicolon. | keep, rewrite caption |
| 9/05, 9/07, 9/08, 9/11 | 8ee3ee, dfb45f, 2f13e8, ea5adc | science/nuclear-power, people/thomas-edison, people/jane-goodall, ancient/great-zimbabwe | A nuclear plant from the air, an Edison phonograph cylinder, Jane Goodall at a degree ceremony, and an aerial of the Great Enclosure — the one genuinely good Great Zimbabwe picture in the sample — all with captions cut off. | keep, fix captions |

#### Sheet 10
| cell | id | article | what | action |
|---|---|---|---|---|
| 10/01 | 0fdc86 | people/mahatma-gandhi | A sculptor beside his Gandhi statue, captioned with the sculptor's name. Not Gandhi. | drop |
| 10/04 | 2625af | countries/zambia | A tribal linguistic map whose legend and labels are illegible at this size. | drop |
| 10/05 | 2bd56c | ancient/aztecs | A dense modern fantasy painting "with an Aztec theme", captioned starting "14". Not Aztec work. | drop |
| 10/08 | 3118f2 | space/comet | A two-panel Hubble image of active asteroid P/2013 P5, captioned "Asteroid v", under the comet article. | drop |
| 10/09 | abd2ee | space/uranus | A "Solar System Walk Decal — Uranus" sign with a QR code. A graphic, not a picture of the planet. | drop |
| 10/10 | 92c2a2 | countries/colombia | A politician's head-shot. Shows nothing of Colombia. | drop |
| 10/15 | dafca9 | wildlife/shark | A Natal Sharks Board warning notice: a wall of text, and it warns rather than shows. | drop |
| 10/17 | 591a5b | inventions/camera | A camcorder and a VHS deck on a table, captioned with model numbers. | drop |
| 10/03 | d41517 | ancient/industrial-revolution | A museum case of 1775 tea ware; caption carries an escaped quote (`England\'s`) and is cut off. | keep, fix caption |
| 10/07 | 0a799d | science/chemical-element | A shop-window installation of element letter cards and produce, captioned "ELEMENTS - The beauty of chemistry #1". A series title, and the picture is hard to read. | keep, rewrite caption |
| 10/11 | e607e8 | inventions/mobile-phone | A pile of phone scrap; caption still keyword-stuffed and still misspells "decomissioned". Third round flagged. | keep, fix caption |
| 10/14 | 1959ee | space/supernova | A beautiful G299 remnant; the caption begins with the literal residue "html ". | keep, fix caption |
| 10/16 | 4a9229 | wildlife/frog | A toad in a plastic tub, captioned "A random toad that I found on the ground". First-person, and a toad under the frog article. | keep, rewrite caption |
| 10/13, 10/18, 10/19, 10/20 | 5d7651, e91bc1, 6cb585, 986798 | physics/insulator, body/vaccine, earth/mount-fuji, physics/static-electricity | Four serviceable pictures with weak captions: jargon and a cut-off, a two-word "Several vaccines", a lowercase "mount Fuji 2015", and a cut-off product line. | keep, fix captions |

## Part B: the screens

The captures were written at 05:22, after the last source change at 05:19, so unlike round 2 every
verdict below is **what I can see**, not what the code intends. Where I add a source reference it is
to say where the fix lives, not to stand in for a screen.

| | verdict | what I see |
|---|---|---|
| **N1** Pictures photo table white, not coral | **FIXED** | The grid now sits on the coral `#FF8662` photo table behind a torn-paper edge, at both 1440 and 390. The prints have white borders, rotation, tape and handwritten captions, so the screen that is all photographs now looks like the Home scrapbook. |
| **N2** captions are raw Commons titles, not plain English | **NOT FIXED** | The first 60 prints still read "H02 The Tongue", "Royal Regalia", "Artery of Qureshi", "Korak BW 1", "British MuseumFotoThalerTamas", "Säkyamuni, Lao Tzu and Confucius - Google Art Project FXD", and three that are not English at all: "Ankerbau zur Selbstversorgung auf Guadalcanal Salomonen", "Umspannwerk Teinach am E-Werk Teinach Station Teinach", "Acceso a Abai", "Cahaya Pertama Monyunari Puncak". |
| **N3** unresolved "identified by ID" placeholders | **FIXED** | None on the screen, none in the 200-picture sample, none in the 3,986 records. |
| **N4** captions truncate mid-word | **NOT FIXED** | On the screen: "…the Lockheed Electra in which sho…", "Crowds came out in thousands to cheer…", "Mud houses on the center island at Lao Dobo (Lake Dobo), a wide section of the…", "Martin Luther King Jr grew up in a time of extreme segregation, but he did not…". 706 of 3,986 stored captions end in an ellipsis; at 390 px the cut comes earlier still. |
| **N5** adjacent duplicates in the grid | **FIXED** | No duplicate pair among the first 60, and no caption repeats anywhere in the 200-picture sample. Twelve records library-wide still share a caption across six groups, down from 22 across ten. |
| **N6** kind filter offers Flags and Emblems | **PARTLY** | The chip row is now Every kind, Art, Diagrams, Flags, Maps, Photographs, Portraits. Emblems is gone (`MediaScreen.tsx:75` filters it, and no `emblem` records remain). **Flags is still offered**, because four `flag` records survive — see R10. |
| **N7** on a phone the filters push the first picture off screen | **FIXED** | At 390 px the chip walls are replaced by two dropdowns, Subject and Kind. "Showing 60 of 3986 pictures." and the first print are both visible without scrolling past a wall of controls, and nothing overflows horizontally. |
| **N8** margin note is interface instruction and says "tap" | **FIXED, with the P3 caveat intact** | The note now reads "3986 pictures, and every licence checked against Commons." It is a statement, not an instruction. It is still an audit claim the page cannot evidence, which is P3 and R8 below. |
| **N9** article strip shows two prints, Req 15 asks four | **FIXED** | The Colosseum "More pictures" strip shows seven prints. |
| **N10** article lead caption is a file name | **NOT FIXED** | The lead print still reads "Colosseum-Entrance LII". |
| **N11** no author or licence on the strip itself | **PARTLY** | The strip note says "From Wikimedia Commons, shown as small copies resized to 480 px. Open one for its author and licence." It tells the reader where the credit is; no print in the strip carries an author or a licence. |
| **N12** nothing says the picture was resized | **FIXED** | Twice on screen: the article strip note above, and the credits page's "Resized copies of photos from Wikimedia Commons". |
| **N13** Picture of the day truncates its own caption | **CANNOT CHECK — still not in frame** | The `home-1440` capture again stops at "Your stamp book", exactly as in round 1. Picture of the day has now been unverifiable on screen for three rounds, though round 2 confirmed the slice is gone from `PictureOfTheDay.tsx`. A capture that scrolls past the stamp book would close this. |
| **N14** the question asks about the app, not the world | **FIXED** | Question 1 reads "What is this a picture of?" |
| **N15** the question is not answerable from its picture | **PARTLY** | Starry Night is gone from the library, and question 1 now uses a real star-field photograph. But the four options are Mars, Star, Supernova, Neptune, and a bright nebula reads as plausibly "Supernova" as "Star" — see R7. 37 `photo`-kind records are still artworks or diagrams, so the filter the fix relies on is still only as good as that field. |
| **N16** the quiz credits every picture under one licence | **FIXED** | The footer reads "Pictures from Wikimedia Commons; each picture's author and licence are shown with its answer." No blanket "(CC BY-SA 4.0)". |
| **N17** the quiz picture is not a print | **FIXED** | The quiz picture now has a white border, a slight rotation and a print shadow, and reads as a photograph on the page rather than a flat rectangle. |
| **N18** credits table breaks words mid-letter at 1440 px | **FIXED** | "Licence" is whole, "Public domain" wraps between words, and only the Commons URLs in the last column break mid-string. |
| **N19** credits page has almost nothing of the scrapbook in it | **PARTLY** | Two hand-cut headline strips and one margin note ("Every picture here has a name, an author and a licence."), so rule 3 is met. Still no torn-paper divider, no print, no object crossing a boundary, and the body is plain tables on white: rules 1, 4 and 5 unmet. It is still the page that answers "could a template have made this?" with yes. |
| **N20** Castle and quiz primary buttons are charcoal, not yellow | **NOT FIXED** | "Check my answer" renders charcoal on the quiz capture while `design.md` line 14 assigns yellow `#FFD23F` to "accents, buttons and chalk highlights". `QuestionCard.tsx:115` is `btn btn--ink` and `disabled` only gates the click, so this is the chosen colour, not a disabled state — and line 151's "next" button in the same component *is* `btn--yellow`, so the two primary actions of one card disagree. The Castle capture was not opened; the Castle uses this same component. |

Fixed outright: **N1, N3, N5, N7, N8, N9, N12, N14, N16, N17, N18** (eleven).
Partly: **N6, N11, N15, N19** (four). Still standing: **N2, N4, N10, N20** (four).
Unverifiable from these captures: **N13**.

### Round-2 defects P1-P8, revisited

| | verdict | what I see |
|---|---|---|
| **P1** artwork stored as `kind: photo` | **PARTLY** | Starry Night is gone. 37 `photo` records still describe themselves as a mosaic, drawing, illustration, engraving or map. |
| **P2** the article lead is the weakest Colosseum picture | **NOT FIXED** | The lead is still the entrance arch, while the strip directly below opens with a dusk panorama and a clear exterior. |
| **P3** the Pictures margin note makes an audit claim | **NOT FIXED** | "3986 pictures, and every licence checked against Commons." Now with a count that goes stale too. |
| **P4** the strip is cut off mid-print at the right edge | **NOT FIXED** | The seventh print ("Map of antiqu… Rome, drawing") is sliced by the viewport with no arrow, fade or other sign that the strip scrolls. |
| **P5** strip captions truncate | **NOT FIXED** | "A 4x4 segment panorama of the Colosseum at dusk" survives whole; "Map of antiqu…" does not, and see R5. |
| **P6** the credits page speaks to developers | **NOT FIXED — and round 2's verdict was wrong** | The capture still reads "the `npm run credits` check (and a Kiro hook) fails if one is missing" and "`npm run licences` asks the Commons API … the submission check fails on any mismatch". Round 2 checked `CreditsScreen.tsx` and found no "npm run"; the wording is not in the component, it is in `/Users/mac/workplace/awari/CREDITS.md` (lines 5, 10, 13, and again at 63 and 106), which the screen renders raw. Fixing the component could never have fixed this. |
| **P7** the picture-quiz screen has none of the scrapbook furniture | **PARTLY** | It now has a hand-cut two-line title strip, a margin note and a print. Still no coral, no torn edge and nothing crossing a boundary, so rules 4 and 5 are unmet. |
| **P8** a stale end-to-end check pins the removed wording | **FIXED** | "Which page does this picture belong to?" no longer appears anywhere in `scripts/` or `src/`. I did not run the check. |

### New defects

**R1 — the Pictures screen opens on the library's weakest material.** The first print in the grid is
"A pen placed on paper"; the fifth is "Artery of Qureshi", a faint ink drawing. Of the 60 prints on
the first page, a large group are exactly the excluded kinds Part A keeps dropping: anatomical
diagrams ("H02 The Tongue", "A 3D Medical illustration showing different terminating ends of
Bronchi…", "Mechanisms of target cell recognition by natural killer (NK) cells", "Depending on the
metabolism of cells in culture, the color of cell culture medium change"), two world maps side by
side, a museum-scan artwork and a near-black "Einstein cross". Nothing orders the grid by how good a
picture is, so the first impression of 3,986 pictures is made by its diagrams.

**R2 — the English-language check passes captions made entirely of proper nouns.** All nine
non-English captions in the sample, and all four on the Pictures screen, are place names, institution
names or product names: "Umspannwerk Teinach am E-Werk Teinach", "Ankerbau zur Selbstversorgung auf
Guadalcanal Salomonen", "Cahaya Pertama Monyunari Puncak", "Nagrobek Zygmunta Starego i Zygmunta
Augusta". A WordNet check over the whole caption cannot see these, because a proper noun is not in
the dictionary either way. The check needs a rule about captions with no dictionary words at all, not
a better dictionary.

**R3 — the Colosseum article prints the same two sentences twice within one screen.** The summary
beside the lead print and the first paragraph of the body are identical: "The Colosseum, also known
as the Flavian Amphitheatre, is a large artefact or structure in the city of Rome. The construction
of the Colosseum started around 70-72 AD and was finished in 80 AD." A reader meets the same text
twice before reaching anything new, and "a large artefact or structure" tells a ten-year-old nothing.

**R4 — the article strip is presented as pictures of the place but is mixed in kind.** Of the seven
"More pictures", three are drawings or engravings and one is a map. The note above speaks only about
resizing and licences, so nothing tells a child that four of the seven are not photographs of the
Colosseum as it stands.

**R5 — three faults in the strip captions that are not truncation.** "Colosseum 1000659" is a bare
file number. "Coliso medieval" is Spanish and misspelled (round 1 saw this picture as "Coliseo
medieval"). "Cole Thomas Interior of the Colosseum Rome 1932" dates a Thomas Cole painting to 1932,
83 years after he died, so the caption is not merely ugly but wrong.

**R6 — the quiz margin note is interface instruction.** "Stuck? Every question has three hints."
This is the fault N8 raised about the Pictures note, reappearing on another screen. Rule 3 reserves
margin notes for a question or one true checked fact, and the hint panel beside the card already says
"3 hints left" with a "Give me a nudge" button, so the note is duplicate chrome.

**R7 — question 1's right answer is not visually separable from a distractor.** The picture is a
bright star-forming nebula; the options are Mars, Star, Supernova and Neptune. A child who reads a
glowing cloud of gas as a supernova has read the picture sensibly and is marked wrong. This is a
narrower version of N15: the filter now guarantees a photograph, but nothing guarantees that the
photograph distinguishes its answer from the three distractors drawn beside it.

**R8 — the Pictures margin note now carries a number that must be maintained by hand.** "3986
pictures, and every licence checked against Commons." It is rendered from `index.data.count`, so the
count moves with the library, but the audit claim beside it does not, and the next rebuild that adds
an unchecked picture makes the sentence false without changing a line of code.

**R9 — the drop lists have pushed fourteen articles below the four-picture floor Req 15 sets.** Round
2 found five; the library now has `physics/electricity`, `science/force`, `science/matter` and
`science/molecule` with **one** picture each, `body/thumb`, `science/light`, `science/mass` and
`science/speed-of-light` with two, and `ancient/hanging-gardens-of-babylon`,
`ancient/wonders-of-the-world`, `countries/ivory-coast`, `arts/painting`, `people/chinua-achebe` and
`science/chemical-reaction` with three. The denylist, the relevance rule and the English check all
remove pictures; nothing back-fills the articles they empty.

**R10 — four flag records survive, and one of them is the contested pair round 1 flagged.**
`countries/somalia` holds `File:Flag of Puntland and Flag of Somalia.jpg`, which is the same
Somaliland-and-Somalia political sensitivity I raised at round 1's 3/18 under a different file. The
other three are `countries/belarus`, `countries/iraq` ("Flag of the Zubayrids") and
`countries/uzbekistan` ("Flag of the Emirate of Bukhara"). Flags are an excluded lead kind, and
while four is a great improvement on 41, these four are why the Flags chip is still on the screen.

**R11 — five pictures I asked to keep and recaption still carry the faulty caption, and one got
worse.** `e607e8`, `5eca1b`, `024e3a` and `d4463c` are unchanged in substance, and `5ba459` (body/eye)
has been shortened from a long credit line to the bare credit "By Elisa Schorn", which now says
nothing about the picture at all. The pipeline has a mechanism for carrying my drops through
(`denylist.json`) and none for carrying my rewrites through.

## What I could not check

1. **Eighty of the 200 pictures were never opened.** Sheets 2, 4, 6 and 8 were judged from
   `index.json` captions and article pairings only, to stay inside the twelve-image budget. Caption
   counts in this report are over all 200 because the captions are text; the subject, kind,
   suitability and duplicate counts are over the 120 pictures on sheets 1, 3, 5, 7, 9 and 10, and
   the round-3 column of the by-kind table is a rate, not a like-for-like count against rounds 1
   and 2.
2. **Six of the twelve captures were not opened**: all five remaining 390 px captures (article,
   home, quiz, credits, castle) and `castle-space-1440`. Phone-width behaviour is verified for the
   Pictures screen only, and N20 on the Castle is inferred from the quiz capture plus the shared
   `QuestionCard` component rather than seen.
3. **Picture of the day is still not in the Home capture**, which stops at "Your stamp book" for the
   second round running. N13 and Req 19's appearance on the page remain unverified on screen.
4. **The end of the credits page was not in frame** again; it stops partway through the design-kit
   photo table. Req 22's grouping by subject and the pagination of the media list are unverified.
5. **The large picture view was never exercised.** Req 17 and 21 are judged from the strip note and
   the credits page; `MediaViewer.tsx` was not opened in a browser.
6. **Nothing was executed.** No build, no test, no `offline-check`, no browser. Every data figure
   here comes from reading `public/media/*.json`, `scripts/media/denylist.json` and
   `docs/kiro-evidence/crew/media-sheets/index.json`.
7. **Only the first 60 of 3,986 pictures appear on the Pictures capture.** Search, "Surprise me",
   the Kind and Subject filters and pagination were not exercised, so R1 describes the first page,
   not the ordering of the whole library.
8. **Judgement was again made at contact-sheet size** (about 280x130 px per cell) from the first six
   characters of each id. Small in-picture text, watermarks, logos and non-adjacent near-duplicates
   can be missed, and the zero in the near-duplicate row should be read as "none visible among the
   120 I opened", not as proof the library has none.
9. **Licences, authors, sha1, thumbnail sizes, the 150 MB budget, the picture floor and the
   eight-per-country rule were not checked.** They belong to the licence auditor. What I read from
   the data is structural: kinds, caption text, per-article counts, denylist coverage.
10. **Motion, hover, reduced motion, screen-reader behaviour and numeric contrast were not tested.**
    Static captures cannot show them.
11. **`@kirocrew-computer` was unavailable again** (declared by the agent spec, not configured), so I
    could not drive a browser to capture the screens I had no budget to open, or to scroll Home far
    enough to see Picture of the day. That is the same gap as rounds 1 and 2.
