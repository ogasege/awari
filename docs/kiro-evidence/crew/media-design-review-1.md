# Media library design review

Reviewer: awari-design-reviewer. Date: 14 November 2026.
Evidence: `docs/kiro-evidence/crew/media-sheets/` (10 contact sheets, `index.json`) and
`docs/kiro-evidence/crew/media-screens/` (1440 px and 390 px captures).
Measured against `.kiro/steering/design.md` and `.kiro/specs/23-media-library/requirements.md`
(Req 12, 14, 15, 17-22).

## Counts

| | |
|---|---|
| Pictures reviewed | 200 of 200 (all ten sheets, twenty cells each) |
| Pictures with a problem | 124 (62%) |
| Suggested drop | 87 |
| Suggested keep with a rewritten caption | 37 |
| Screens reviewed | 6 (Pictures, article, Home, picture quiz, credits, Castle wing), 7 captures |
| Screen defects | 20 (N1-N20) |

Problems by kind, each picture counted once under its main fault:

| kind | count |
|---|---|
| Caption wrong, not English, truncated, or a placeholder | 52 |
| Does not show what its article is about | 36 |
| Excluded kind (flag, collage, screenshot, page of text, research figure, marketing graphic) | 24 |
| Unsuitable for a ten-year-old | 7 |
| Near-duplicate of another picture on the sheets | 5 (three sets) |

At least 22 captions are in a language other than English (German, French, Spanish, Portuguese,
Dutch, Norwegian, Italian, Azerbaijani, Latin). Seven pictures carry the "identified by ID" or
"with ID" placeholder or an equivalent unfilled template.

The three duplicate sets: 2/09 and 4/14 (Westerlund 1, identical caption), 1/10 and 5/10 (the same
framed print under `physics/electric-current`), 8/11 and 9/04 (both "Light and dark in the night").

The seven unsuitable pictures, in priority order: 5/06 Zwarte Piet costume (racial caricature),
10/07 and 7/20 military imagery, 7/04 a brain in a specimen jar, 1/08 a dead whale, 4/17 disaster
aftermath, 3/18 a contested political claim in the caption.

## Part A: the 200 pictures

Cells are given as sheet/cell, counting rows of five from the top left.

### Sheet 1
| cell | id | article | what | action |
|---|---|---|---|---|
| 1/03 | c07b3b | earth/mekong-river | A flag (yellow star on blue/red bands) captioned "Flag of Mekong Federation". Flags are excluded as lead images (Req 8) and no "Mekong Federation" exists, so the caption is invented, not from a Commons description (Req 14). | drop |
| 1/04 | 9adaf5 | arts/jesse-owens | A Madame Tussauds waxwork, not Jesse Owens. A reader sees a model and believes it is the athlete. | drop |
| 1/07 | 0b1387 | earth/plate-tectonics | A faint, unreadable survey chart; caption is raw archive metadata ("Goos Mante; Vening Meinesz, KXIII Gravimetrics Measurements Sumatra, 193001-193002"), not plain English. | drop |
| 1/08 | 9bf9d7 | wildlife/blue-whale | A dead whale beached on a shore with onlookers; caption is archive text with tags and "[sic]", and names a humpback under the blue whale article. | drop |
| 1/09 | 58171c | body/digestion | German-only caption ("Absorption der Monosaccharide im Dünndarm") on a technical cell diagram. | drop |
| 1/10 | bb95ff | physics/electric-current | Two framed oval prints; nothing in the picture reads as electric current, and "Electric current, by Leo Daft" describes an attribution, not the picture. | drop |
| 1/14 | a68cd5 | people/alan-turing | A teddy bear. True of Turing but shows nothing of him; weak as one of few Turing pictures (see also 4/11). | drop |
| 1/15 | 01d144 | body/thumb | A Sulawesi bear cuscus in a cage, filed under the human thumb. Complete subject mismatch. | drop |
| 1/17 | 0a6855 | science/oxygen | A blast furnace casting; the link to oxygen is invisible to a child and the caption never mentions it. | drop |
| 1/18 | 9d4527 | earth/niger-river | Good picture, French-only caption ("Un jeune garçon qui ramène sa pirogue"). | keep, rewrite caption in English |
| 1/19 | a1d0e9 | countries/the-gambia | A portrait of a man captioned only "The Gambia"; the caption does not describe the picture. | keep, caption must name the person |
| 1/20 | 5e2fbc | body/hormone | A two-panel composite (human figure + plant); collages are excluded (Req 8) and the caption "Left: …" depends on a crop the reader cannot see. | drop |
| 1/02 | c4e234 | countries/cape-verde | Generic street scene captioned only "Cape Verde". | keep, caption needs a place |
| 1/13 | ace3a7 | countries/lesotho | Fine district map; caption "lesotho" uncapitalised. | keep, fix caption |

### Sheet 2
| cell | id | article | what | action |
|---|---|---|---|---|
| 2/03 | 139fbe | science/temperature | Azerbaijani-only caption on a rainfall/temperature chart; unreadable for the audience. | drop |
| 2/07 | 545370 | people/wright-brothers | A scan of a 1906 newspaper page: a page of text, excluded as a kind. | drop |
| 2/08 | 98da7f | body/vaccine | A street view of a company site captioned "Fluart Innovative Vaccines Ltd"; shows a fence and a building, not vaccination, and reads as corporate signage. | drop |
| 2/09 | 429e1c | space/milky-way | Near-duplicate of 4/14 (same Westerlund 1 picture, identical caption, different id). | drop one of the pair |
| 2/10 | 8d3d46 | body/hair | Spanish-only caption and a feline follicle micrograph under the human hair article. | drop |
| 2/12 | 2b7515 | science/force | The picture is a portrait of Galileo; the caption is the single word "Force". Caption does not fit the picture. | drop |
| 2/13 | fc6fe2 | wildlife/giant-panda | Good panda plate; caption is a truncated French book title ("Recherches pour servir à l'histoire naturelle des mammifères (Pl"). | keep, rewrite caption |
| 2/15 | 8103a8 | earth/yangtze-river | A Chinese giant salamander in an aquarium tank under the Yangtze river article. | drop |
| 2/16 | 026beb | earth/pacific-ring-of-fire | Tephra layers on Deception Island, Antarctica, which is not on the Pacific Ring of Fire; caption is specialist jargon. | drop |
| 2/17 | 82414b | body/stomach | Spanish-only caption ("Cavidad gástrica"). | keep, rewrite caption |
| 2/20 | b34555 | space/hubble-space-telescope | A two-panel press graphic (composite) captioned with a press-release headline ("Hubble stretches the stellar tape measure ten times further") that describes a result, not the picture. | drop |
| 2/02 | 7a6f38 | ancient/mali-empire | Good Catalan Atlas detail; caption opens with archive wording "Sheet 6 out of 12." | keep, trim caption |
| 2/06 | 3756ba | people/tim-berners-lee | Good photo; caption starts with a stray "*" from wikitext. | keep, fix caption |
| 2/11 | 761bd9 | space/moon | Good photo; caption names Neil Armstrong where the figure shown is the other astronaut. | keep, verify name |

### Sheet 3
| cell | id | article | what | action |
|---|---|---|---|---|
| 3/01 | d4463c | people/isaac-newton | Portrait engraving whose caption ("A portrait from the Welsh Portrait Collection at the National Library of Wales") never says who is shown. | keep, caption must name Newton |
| 3/03 | 984f28 | ancient/pompeii | Good street view; caption "Old house pompei site" is not English and misspells Pompeii. | keep, rewrite caption |
| 3/06 | 523d6b | inventions/radio | A block-diagram of labelled boxes and arrows: mostly small text, closer to a schematic page than a picture, and unreadable at strip size. | drop |
| 3/08 | 1f0995 | people/albert-einstein | An arcaded courtyard captioned "Casa foscolo". No connection to Einstein; caption is a foreign-language place name. | drop |
| 3/09 | 77d6ab | science/force | A vehicle force diagram captioned with the single word "Force"; the caption describes the topic, not the picture. | keep, rewrite caption |
| 3/12 | 2f7a51 | inventions/helicopter | A bare Sikorsky engine on a stand; a child reading about helicopters sees machinery, not a helicopter. Caption is jargon ("H-34 engine AAT"). | drop |
| 3/16 | 8b6391 | body/muscle | A two-panel microscope plate (muscle fibre and orbital gland): a composite, clinical, and unreadable at this size. | drop |
| 3/18 | aeb1df | countries/somalia | A flag on a pole against empty sky, captioned "Somali national flag flying in Hargeisa, State of Somaliland…". It is a flag (excluded as lead) and the caption asserts a contested political claim about Somaliland on the Somalia article. | drop |
| 3/20 | f0f596 | earth/atlantic-ocean | Fishermen handling catch; caption is a Norwegian museum accession line ("Bildet er hentet fra Nordlandsmuseet bildesamling etter Kanstad") that says nothing about the ocean. | drop |
| 3/02 | 25b28a | inventions/submarine | Good photo; caption is the bare word "Submarine". | keep, rewrite caption |

### Sheet 4
| cell | id | article | what | action |
|---|---|---|---|---|
| 4/01 | 382360 | people/malala-yousafzai | A large prize-ceremony group photo in which Malala is one small figure; French-only caption. | drop |
| 4/04 | c0141a | space/solar-system | A Blender render of Earth, not a photograph (Rule 1 asks for real photographs), and it shows one planet under the Solar System article. | drop |
| 4/08 | b0094f | body/leg | A cropped shot of two people's bare lower legs, captioned only with a photographer's name, "Morgan Sessions 2015". Caption carries no information and the framing is odd for the article. | drop |
| 4/11 | 6dd362 | people/alan-turing | Turing's OBE medal in a case: an object, not the person. With 1/14 (teddy bear) two of Turing's pictures show possessions instead of him. | drop |
| 4/14 | 179734 | space/milky-way | Near-duplicate of 2/09: the same Westerlund 1 image and the same caption. | drop one of the pair |
| 4/15 | 383bdc | physics/lightning | An orange-red cloud burst on black that reads as an explosion rather than lightning; caption "Thunder under the stars during Baltic trip" names a sound. | drop |
| 4/17 | d9e94e | physics/battery | Emptied shop shelves after the Tohoku tsunami, with Japanese signage. Disaster context, and nothing about batteries is visible. | drop |
| 4/18 | d23a00 | inventions/television | A branded LG TV showing an app screen: a product shot containing a screenshot, captioned with a press release ("LG Electronics will launch a smart TV application on December 1, 2011"). Promotional. | drop |
| 4/19 | 9ceb34 | people/marie-curie | Marie Curie's printed visiting card: a page of text, excluded as a kind; caption still carries the "(translated)" marker and a street address. | drop |
| 4/20 | 285e30 | wildlife/zebra | Faint rock paintings, hard to read even at full size, under the zebra article; French-only caption with a trailing "(4)". | drop |
| 4/02 | 0f0b74 | arts/tennis | A 19th-century painting captioned only "Tennis". | keep, rewrite caption |
| 4/09 | e6f859 | arts/piano | Good photo; caption truncated mid-word ("…at the MIM, Berlin, Kat"). | keep, fix caption |
| 4/10 | 50bdad | ancient/lighthouse-of-alexandria | Good painting; French-only caption ("Alexandrie et phare"). | keep, rewrite caption |
| 4/16 | e0f5c4 | inventions/steamboat | The picture does show a paddle steamer, but the caption ("Mississippi River in Louisiana") never mentions the boat. | keep, rewrite caption |

### Sheet 5
| cell | id | article | what | action |
|---|---|---|---|---|
| 5/01 | 76a98a | science/carbon | A dissolved-inorganic-carbon world map with a numeric colour scale: a research figure, not a picture a ten-year-old can read. | drop |
| 5/03 | c5f95a | inventions/train | A Brio wooden toy train. Under the invention of the train this teaches the wrong thing. | drop |
| 5/04 | 0970a5 | ancient/great-zimbabwe | A faint surveyor's site plan on white; illegible in a print strip. | drop |
| 5/06 | 1ec98f | inventions/steamboat | A Sinterklaas arrival boat crewed by figures in "Zwarte Piet" costume. Racial-caricature imagery, unsuitable for children; Dutch-only caption; and it is not about steamboats. | drop (highest priority) |
| 5/09 | 20ff43 | wildlife/shark | A two-panel tracking "heat map" of shark movements: a composite research figure. | drop |
| 5/10 | db6d7a | physics/electric-current | Exact duplicate of 1/10: the same framed oval print with the same caption, under the same article, with a different id. | drop (keep neither; see 1/10) |
| 5/14 | 13da4e | earth/atlantic-ocean | A bathymetry colour map captioned "StLawrence Gulf bathymetry" (missing space, specialist term). | drop |
| 5/15 | f19335 | science/matter | A boxes-and-words classification chart: a page of text, excluded as a kind. | drop |
| 5/16 | 534e16 | physics/electricity | A close-up of a surface-mount chip, captioned in component jargon with a vendor URL ("from arduino.cc"). Shows nothing a child would recognise as electricity. | drop |
| 5/02 | 17d8be | arts/drum | Good drums; caption ("At Museo de Artesania Iberoamerica 2023") never says drum. | keep, rewrite caption |
| 5/08 | d9d031 | earth/mount-everest | Good summit photo; Spanish-only caption. | keep, rewrite caption |
| 5/18 | 8ad036 | countries/sao-tome-and-principe | Good photo; French-only caption with a trailing "(2)". | keep, rewrite caption |
| 5/19 | 195496 | physics/electrical-circuit | Good breadboard photo; Portuguese-only caption ("Análise de circuitos"). | keep, rewrite caption |

### Sheet 6
| cell | id | article | what | action |
|---|---|---|---|---|
| 6/01 | f503cc | ancient/great-zimbabwe | A faint line plan captioned only "Great Zimbabwe"; a reader expecting the stone ruins sees an unreadable drawing. Second weak plan for this article with 5/04. | drop |
| 6/02 | 26a4d8 | physics/electricity | The picture is a portrait engraving of Benjamin Franklin; the caption is the single word "Electricity". Caption does not fit the picture. | drop |
| 6/05 | ca2d05 | earth/amazon-river | A cathedral in Santarém; no river in the frame, under the Amazon river article. | drop |
| 6/06 | 00502a | people/malala-yousafzai | A pavement star plaque, not Malala. With 4/01 both her pictures fail to show her. | drop |
| 6/07 | 348953 | physics/electric-charge | A battery charger unit. The match is the word "charge", not the subject. | drop |
| 6/12 | 965e2f | earth/mount-aso | The Matterhorn in Switzerland, filed under Mount Aso in Japan. Factually wrong picture. | drop |
| 6/14 | da4d7f | countries/indonesia | A screenshot of a SPARQL query map tool, caption and all. Screenshots are excluded as a kind. | drop |
| 6/16 | f8964e | countries/peoples-republic-of-china | A tourist posing on a bridge, captioned with the photographer's name ("Movchan Maxim, China, Xian, 2023"). | drop |
| 6/18 | aefa02 | physics/electrical-circuit | A black diagram of two labelled text boxes, captioned "Made with PowerPoint": a text figure, and the caption credits the tool. | drop |
| 6/03 | 307fc6 | wildlife/frog | Good frog; caption is a Latin binomial only ("Pristimantis aniptopalmatus"). | keep, add an English caption |
| 6/09 | 1a1fae | earth/sahara | Good satellite view; "Sahara real color" is not a sentence of English. | keep, rewrite caption |
| 6/13 | 7e31cd | countries/senegal | Empty roadside scene captioned only "Senegal". | keep, rewrite caption |
| 6/17 | 6e39a7 | wildlife/cheetah | Useful range map; caption is data-source jargon ("Acinonyx jubatus jubatus range IUCN 2015"). | keep, rewrite caption |
| 6/19 | cb732a | arts/mask | Good museum masks; caption is German plus inventory numbers ("Kamerun Ekoi Aufsatzmasken Linden-Museum 45455 47707"). | keep, rewrite caption |

### Sheet 7
| cell | id | article | what | action |
|---|---|---|---|---|
| 7/01 | b18ea6 | inventions/plastic | A company's marketing world map, "Global footprint of Cosmo Films", complete with corporate legend. Advertising, not an encyclopedia picture. | drop |
| 7/02 | 24bb3f | people/marco-polo | A medieval world map captioned only "Marco Polo". The caption names a person the picture does not show. | keep, rewrite caption as the map it is |
| 7/04 | 9329f8 | body/brain | A preserved chimpanzee brain in a labelled specimen jar. Clinical and off-putting for a ten-year-old, and it is not a human brain. | drop |
| 7/08 | 643e5b | earth/krakatoa | A botanical plate of a fan palm; the volcano is nowhere in the picture, and the caption is archive prose with a plate number. | drop |
| 7/10 | 78cdc7 | wildlife/chimpanzee | A memorial plaque for a zoo chimpanzee, in French. A plaque, not an animal. | drop |
| 7/12 | b86c5d | body/brain | A decorative painting of a brain with flowers. Shows nothing anatomical; with 7/04 this article's pictures are a jar and an artwork. | drop |
| 7/13 | 165c30 | ancient/middle-ages | A modern reconstruction flag of the Kingdom of Altava. Flags are excluded, and the subject is far too obscure for the Middle Ages article. | drop |
| 7/15 | 81f2bf | ancient/aztecs | A rooftop cityscape captioned "A monument in Mexico, identified by ID". The caption is an unresolved placeholder and no monument is visible. | drop |
| 7/20 | 198169 | inventions/computer | A uniformed US Marine at a laptop in a field tent, captioned with a military-operations line. Military framing and nothing about computers. | drop |
| 7/05 | 2ae4e8 | inventions/solar-energy | Good ISS photo; caption truncated mid-sentence. | keep, fix caption |
| 7/18 | fdc755 | arts/literature | A group photo captioned with a bare list of names ("Adonis, Mohamed Dib, Habib Tengour, Edmond El Maleh, Mohamed Bennis"). | keep, rewrite caption |
| 7/19 | cee975 | earth/mount-fuji | Good Hokusai print; caption truncated ("One Hundred Views of Mt"). | keep, fix caption |

### Sheet 8
| cell | id | article | what | action |
|---|---|---|---|---|
| 8/01 | 3efc9a | people/nikola-tesla | A framed watercolour of sailing boats, under Nikola Tesla. No connection at all. | drop |
| 8/03 | 70633c | body/sleep | A gold-ground Byzantine menologion miniature, captioned with archive jargon ("Constantinople. 985. Miniature Minology Vasily II. Vatican Library"). Religious manuscript art under an article about sleep. | drop |
| 8/04 | 8c5cf9 | countries/turkmenistan | An offshore rig with a gas flare, captioned only "Turkmenistan". The caption describes nothing, and the picture is a poor first impression of a country. | drop |
| 8/05 | 3b7daa | arts/hip-hop | A distant festival crowd captioned "Blockfest 2017"; nothing identifies hip hop. | drop |
| 8/09 | 94ffd7 | ancient/mali-empire | A flag ("Flag Of Cayor") belonging to a different kingdom, under the Mali Empire. Flag and wrong subject. | drop |
| 8/11 | 105763 | science/light | An almost entirely black frame with one small light, captioned "Light and dark in the night". Near-useless at thumbnail size, and the same caption appears again at 9/04. | drop |
| 8/12 | 3d97cb | earth/pacific-ring-of-fire | Mount Fuji over a lake, captioned with stock-site metadata and hashtags ("500px provided description: Kambolnay Volkan [#nature photograph,#nature pics]") naming a different volcano. | drop |
| 8/15 | b78248 | arts/fifa-world-cup | A golden-boot award in a display case, captioned "FIFA World Cup". It is not the World Cup trophy, and the caption does not describe what is shown. | drop |
| 8/07 | 772db0 | science/solid | Good polished minerals; Spanish-only caption ("Minerales ya pulidos y tallado"). | keep, rewrite caption |
| 8/14 | 739d32 | countries/kyrgyzstan | Good mountains; caption ends in a file serial ("- 45"). | keep, fix caption |

### Sheet 9
| cell | id | article | what | action |
|---|---|---|---|---|
| 9/01 | dbc2c6 | body/ear | An Arctic fox in snow, filed under the human ear. Complete subject mismatch. | drop |
| 9/04 | 963139 | science/light | A near-black frame with one distant light; the same caption as 8/11 and visually the same idea. Near-duplicate and uninformative. | drop |
| 9/08 | f40ab6 | wildlife/kangaroo | A fossil palate of the extinct Sthenurus, captioned "Palatal view of Sthenurus (species unknown)". A bone fragment no child will read as a kangaroo. | drop |
| 9/10 | 4c063f | physics/electrical-circuit | A schematic labelled "Figure T-2", lifted from an FCC exam study guide. A technical figure from a text page. | drop |
| 9/15 | 6d3c01 | wildlife/rhinoceros | An illustration of the extinct Elasmotherium captioned with a file code ("Elasmotherium cauc1DB"), under the rhinoceros article. | drop |
| 9/16 | c11942 | body/thumb | A hand squeezing a red grip exerciser, captioned with the single word "Thumb". The caption does not describe the picture. | drop |
| 9/19 | 9a7921 | physics/electrical-conductor | A product-style 3D rendering of copper-clad aluminium bars, captioned in trade jargon. Not a photograph, and opaque to the audience. | drop |
| 9/03 | d82793 | space/telescope | Good photo; caption misspells "Auxilary". | keep, fix caption |
| 9/12 | ceba17 | countries/cameroon | Good statue photo; French-only caption. | keep, rewrite caption |
| 9/14 | b6ebd1 | earth/mount-st-helens | Good crater view; caption is specialist and truncated ("…east flank view of Mount St"). | keep, rewrite caption |
| 9/20 | e607e8 | inventions/mobile-phone | Fine photo; caption is keyword-stuffed and misspells "decomissioned". | keep, rewrite caption |

### Sheet 10
| cell | id | article | what | action |
|---|---|---|---|---|
| 10/02 | 8d60d8 | inventions/mobile-phone | A photograph of a "No Cell Phones in Library" notice: a page of text, excluded as a kind. | drop |
| 10/03 | f698a8 | physics/lightning | A wall-mounted electrical box captioned "Museu Romàntic Can Papiol". Nothing to do with lightning. | drop |
| 10/05 | d41459 | body/skin | A side-by-side composite of a Meitei letterform and a skin cross-section. A collage, and the lead element is a written character. | drop |
| 10/06 | 095a33 | body/lung | An axolotl, captioned "Axolotl ganz" (German), under the human lung article. | drop |
| 10/07 | 6131ae | countries/brazil | Naval warships on exercise, captioned 'Operação "Poseidon 2021'. Military imagery and a broken quoted caption as a child's first view of Brazil. | drop |
| 10/11 | 4a2c09 | body/muscle | A multi-panel electron micrograph plate: a composite, clinical, unreadable at strip size. | drop |
| 10/16 | d1f729 | physics/electric-charge | A branded BMW charging socket. Brand-forward, and again the match is the word "charge". | drop |
| 10/10 | 4f3ec3 | ancient/great-pyramid-of-giza | The Khufu solar barque in its museum hall, captioned "Giseh Sonnenbarke" (German). Not the pyramid, and not English. | drop |
| 10/13 | 5763eb | arts/olympic-games | A world map tiled with national flags: effectively a flag collage, with a truncated caption. | drop |
| 10/15 | e25f04 | space/milky-way | A schematic polar plot captioned only "Milky Way"; the third Milky Way entry after the 2/09-4/14 duplicate pair. | drop |
| 10/20 | 620e4f | wildlife/gorilla | Dense vegetation in which the gorilla nest cannot be made out; no gorilla in frame. | drop |
| 10/19 | ea4e2e | ancient/rosetta-stone | Good detail of Demotic script; caption lowercases "rosetta stone". | keep, fix caption |

## Part B: the new screens

**N1 — Pictures screen, the photo table is white, not coral (both widths).** Home lays its subject prints on the coral `#FF8662` "photo table" between torn-paper edges. The Pictures screen puts 60 prints straight onto white graph paper with no torn boundary and no object crossing it, so the one screen that is entirely photographs is the one that drops the photo-table colour and rules 5 and 9 of `design.md`. Coherence defect against Req 18 ("in the Home scrapbook style").

**N2 — Captions on the prints are raw Commons titles, not plain English (Req 14).** Visible in the first 60 cells: "Vestigios de Tenochtitlan", "Mapa de Siguenza", "Maler der Grabkammer der Itet", "Coliseo medieval", "Palacio Real de Aranjuez (España)", "KINGS of MACEDON Alexander III the Great…", "1511 Grossi Allegorical Map of the Dardanelles with…". Several are not English at all.

**N3 — Unresolved placeholders reach the screen.** "A monument in Mexico, identified by ID" and "A Natura 2000 protected area with ID" are rendered as captions. "identified by ID" is a template that was never filled in; the same text appears in the sheets at 7/15.

**N4 — Captions truncate mid-word in the handwriting face.** "Amenemhat (a privat person, not the pharaoh of…", "Hypnos and Thanatos carrying the body of…". At 390 px the cut comes earlier, so most captions end in an ellipsis. Covered By Your Grace at caption size plus a hard cut makes the strip hard to read, which is the one thing `design.md` says must never be sacrificed ("always readable").

**N5 — Adjacent duplicates in the grid.** "1511 Grossi Allegorical Map of the Dardanelles with…" appears twice side by side, and "Vestigios de Tenochtitlan" appears twice in the same row-pair. Whatever de-duplication runs over the library does not catch same-caption neighbours, and placing them adjacently makes it obvious.

**N6 — The "kind" filter offers Flags and Emblems, which Req 8 excludes.** The chip row is: Every kind, Art, Diagrams, Emblems, Flags, Maps, Photographs, Portraits. Req 8 excludes logos, signatures and coats of arms as lead images; offering Emblems and Flags as first-class browsing kinds advertises the material the collector was told to skip, and Part A found flags used as article leads (1/03, 3/18, 7/13, 8/09).

**N7 — On a phone the filters push the first picture off the first screen.** At 390 px the subject chips take eight rows and the kind chips four more, so roughly 600 px of controls sit between the intro and "Showing 60 of 4106 pictures." A child opening Pictures on a phone sees a wall of buttons, not pictures. No horizontal overflow, and the 2-column grid is contained.

**N8 — The handwritten margin note says "Tap a picture to see it big" on the 1440 layout.** Rule 3 of `design.md` reserves margin notes for a question or one true checked fact; this one is interface instruction, and it says "tap" on the laptop-first layout where the action is a click. It is also the only margin note on the screen, so rule 3 is otherwise unmet.

**N9 — Article "More pictures" strip shows two prints (Req 15 asks four per article).** On `article-ancient-colosseum` the strip holds exactly two prints, "A 4x4 segment panorama of the…" and "Colosseum, Rome, Italy", with the lead print above making three pictures for the article. Req 15 sets a floor of four per article and Req 17 asks for a strip.

**N10 — The article lead caption is a file name, not a sentence.** The lead print reads "Colosseum-Entrance LII", which is a Commons title, not the shortened plain-English description Req 14 requires.

**N11 — No author or licence on the strip itself.** Neither the lead print nor the two strip prints shows an author or a licence line. Req 21 asks for author and licence "where it is viewed"; if that only appears after opening the large view, the strip view is uncredited.

**N12 — Nothing anywhere says the picture was resized (Req 21).** `grep` over `src/features/media/` finds no resize note in `MediaViewer.tsx`, `ArticleGallery.tsx` or `PictureOfTheDay.tsx`. The viewer credits author, licence and Commons page, and says honestly when offline that "The bigger picture needs a connection. This is the small copy saved on this device." (`/Users/mac/workplace/awari/src/features/media/MediaViewer.tsx`, line 79) — but Req 21 also asks for "a note that it was resized", and the 1280 px view from Commons carries no such line.

**N13 — Picture of the day truncates its own print caption to 38 characters** (`/Users/mac/workplace/awari/src/features/media/PictureOfTheDay.tsx`, line 42) while printing the full caption again in the text column beside it, so the handwritten caption under the print is the cut-off copy of a sentence the reader can see in full 2 cm to the right.

**N14 — The picture question asks about the app, not the world.** Question 1 of the Space pictures quiz reads "Which page does this picture belong to?" with options Moon, Milky Way, International Space Station, Yuri Gagarin. That tests where the library filed the picture. Req 20's own example is "Which country is this landmark in?", a question about the subject.

**N15 — That question is not answerable from its picture, and a distractor is visibly in it.** The picture is Van Gogh's *The Starry Night*. A crescent moon is one of the brightest things in the frame, so a child who picks "Moon" has read the picture correctly and is still marked wrong. A painting cannot carry the fact the question asks for; this should not have passed question validation.

**N16 — The quiz credits every picture under one licence.** The footer says "Questions built from Wikimedia Commons pictures, each credited in its answer (CC BY-SA 4.0)". The credits page shows the library actually mixes public domain, CC BY 2.0/4.0 and CC BY-SA 2.0/2.5/3.0/4.0, so a blanket "(CC BY-SA 4.0)" misstates the licence of most pictures. Req 21 wants author and licence where the picture is viewed; at question time the picture carries neither.

**N17 — The quiz picture is not a print.** It sits in the card as a flat rectangle: no white border, no rotation, no tape, no handwritten caption, unlike every other picture in Awari. Rule 1 of `design.md` asks for photographs shown as physical prints, and the quiz is now the one place a library picture appears bare.

**N18 — Credits table breaks words mid-letter at 1440 px.** The header renders as "Licenc / e", and cells as "Public / domai / n", "photos/eleph / ant.jpg", "photos/cover / s/countries.jp / g". Full Commons URLs are printed as raw text in the last column and force the other columns narrow. On the laptop-first layout there is room; this is a column-sizing fault, and a licence name broken across lines is a credit that no longer reads as the licence.

**N19 — The credits page has almost nothing of the scrapbook in it.** Two hand-cut headline strips, then plain tables on white: no torn-paper divider, no prints, no margin note, no doodle, nothing crossing a boundary. Rules 1, 3, 4 and 5 are unmet, and this is the page that answers "could a template have made this?" with yes. The page does state "Resized copies of photos from Wikimedia Commons", which is the resize wording Req 21 wants and N12 finds missing at the point of viewing.

**N20 — Castle and quiz primary buttons are charcoal, not the palette's yellow.** "Check my answer" renders dark grey on both screens where `design.md` assigns yellow `#FFD23F` to buttons. If this is the disabled state before an option is chosen it is correct and this defect falls away; it could not be confirmed from a static capture, so it needs a look at the enabled state.

The Space wing itself is the strongest of the new screens: navy board, hand-cut title strip, twelve drawn doors on wobbly shelf lines, "0 of 12 rooms lit" in words as well as drawn objects, and a handwritten "next!" arrow at door one. It honours rules 2, 4, 6 and 7, and nothing overflows at 390 px.

## What I could not check

1. **Four captures were not opened**, to stay inside this session's image budget: the article and
   the quiz and the Castle wing at 1440 px, and Home, credits and the quiz at 390 px. Each screen
   was seen at one width only, except Pictures, which was seen at both. Phone-width faults on
   credits and laptop-width faults on the article strip are therefore unexamined.
2. **Home's Picture of the day was not visible.** The `home-1440` capture ends at "Your stamp
   book", above the picture. I read `/Users/mac/workplace/awari/src/features/media/PictureOfTheDay.tsx`
   instead: it exists, rotates over 366 days, and prints caption, author, licence link and Commons
   page link, so Req 19 is met in code. Its appearance on the page is unverified.
3. **The end of the credits page was not in the capture**, which stops at the Logo table. Req 22's
   grouping by subject and pagination of the media list are unverified; what I saw was the
   design-kit photo table.
4. **No picture question was visible in the Castle.** Room 1 of the Space wing is a text gap-fill,
   so Req 20's picture questions in the Castle are unconfirmed.
5. **The large view was never opened.** Req 17 and 21 (large picture with caption, author, licence,
   Commons link) were judged from `MediaViewer.tsx` only, not exercised. Its offline line is honest:
   "The bigger picture needs a connection. This is the small copy saved on this device."
6. **Only the first 60 of 4,106 pictures appear on the Pictures screen capture.** Search, "Surprise
   me", the filters and pagination were not exercised, and my duplicate check covers only the 200
   pictures on the sheets, not the library.
7. **Judgement was made at contact-sheet size** (roughly 280x130 px per cell) with the first six
   characters of each id. Small text inside a picture, watermarks, faint logos and near-duplicates
   that are not adjacent could be missed.
8. **Licences, Commons titles, sha1, thumbnail sizes, the 150 MB budget, the 3,000 picture floor and
   the eight-per-country rule were not checked.** They belong to the licence auditor and are not
   visible in this evidence.
9. **Motion, hover, reduced-motion, screen-reader hiding and numeric contrast were not tested**;
   static captures cannot show them.
10. **The `@kirocrew-computer` MCP server was not available in this session** (declared by the agent
    spec, not configured), so I could not drive a browser; everything above comes from the supplied
    captures and the repository source.
