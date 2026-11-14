# Media library design review — round 2

Reviewer: awari-design-reviewer. Date: 14 November 2026.
Round 1: `docs/kiro-evidence/crew/media-design-review-1.md` (124 of 200 pictures had a problem;
20 screen defects N1-N20).
Evidence this round: `docs/kiro-evidence/crew/media-sheets/` (10 fresh contact sheets of a new
200-picture sample, `index.json`), `docs/kiro-evidence/crew/media-screens/` (1440 px and 390 px
captures) and the rebuilt library under `/Users/mac/workplace/awari/public/media/`.
Measured against `.kiro/steering/design.md` and `.kiro/specs/23-media-library/requirements.md`.

## Summary

| | round 1 | round 2 |
|---|---|---|
| Pictures reviewed | 200 | 200 |
| Pictures with a problem | 124 (62%) | 159 (80%) — 134 (67%) if a runs-off English caption is not counted |
| Suggested drop | 87 | 100 |
| Round-1 screen defects fixed outright | — | 4 (N3, N9, N12, N13) |
| Fixed in code but not in this round's captures | — | 7 (N1, N7, N8, N14, N16, N17, N18) |
| Partly fixed | — | 4 (N5, N6, N11, N19) |
| Still standing | — | 5 (N2, N4, N10, N15, N20) |
| New defects | — | 8 (P1-P8, one of which is already fixed in code) |

The rebuild fixed the placeholder captions and the short article strips, and the screen code has since
been changed against most of the round-1 screen list. The picture selection itself did not improve: the
caption, wrong-subject and excluded-kind counts all went up, 35 of the 88 pictures round 1 named are
still in the library, and the N15 quiz fix is defeated by `kind` metadata that calls a Van Gogh painting
a photograph.

## Part A: the 200 pictures

Cells are sheet/cell, counting rows of five from the top left.

### Sheet 1
| cell | id | article | what | action |
|---|---|---|---|---|
| 1/05 | 6b7f3e | body/human-skeleton | Museum case holding a real human skeleton under an exhibit panel reading "bronze age bloodshed"; caption "Younger' Tormarton skeleton" carries a stray apostrophe. Violent-death framing of human remains as the article's picture. | drop |
| 1/08 | 64f52f | arts/photography | A green electron micrograph of a leaf hair, filed under photography. A research figure, and nothing in it is about photography. | drop |
| 1/09 | 795594 | body/hair | Columns of hair cross-sections; the caption begins with the leaked word "Caption:" then German, with an unclosed quote: `Caption: "a Kopfhaar vom Menschen`. | drop |
| 1/13 | f36fc1 | body/hormone | A dense labelled receptor diagram, unreadable at strip size; caption "Illustration from Anatomy & Physiology, Connexions Web site" is a source credit. The same caption is on four pictures library-wide. | drop |
| 1/14 | 6f9aa7 | inventions/television | An LG promotional shot (presenter, logo, parrots on the panel) with a Korean-only caption. Marketing plus a screen image, same fault as round 1's 4/18 under a new id. | drop |
| 1/15 | 9ab50f | ancient/sphinx | A blue-ink drawing of a Greek winged sphinx, not the Great Sphinx; Dutch caption with typos ("kuntenaar"). | drop |
| 1/17 | a382df | ancient/alexander-the-great | A stone block of Greek inscription: a page of text, and it shows writing rather than Alexander. | drop |
| 1/20 | 60c65f | arts/football | An 1896 Ordnance Survey map, faint and unreadable at any size here, under the football article. | drop |
| 1/06 | 8299ad | countries/taiwan | A hospital block captioned "Taipei, Taiwan: National Taiwan University Hospital". Accurate, but a hospital is a poor first picture of a country. | drop |
| 1/11 | 058393 | earth/ganges | A hazy sea with boats; caption "It is also called Meghna in Bangladesh" has no subject and never names the river. | drop |
| 1/02 | b04f48 | science/gold | Striking gold crystals; caption "Synthetic made gold crystals by the chemical transport reaction in chlorine gas" is not English and is chemistry jargon. | keep, rewrite caption |
| 1/04 | 28697c | space/neil-armstrong | Astronaut at the lunar module. Caption "Armstrong on Moon" is not a sentence, and most Apollo 11 surface frames show Aldrin, so the name needs checking (round 1 flagged the same risk at 2/11). | keep, rewrite and verify |
| 1/10 | fe7276 | people/marie-curie | Good portrait; caption "Portrait of Marie Curie , Polish chemist Wellcome M0000113" has a stray space and an archive code. | keep, fix caption |
| 1/12 | 5ba459 | body/eye | Good anatomical painting; caption is a credit line ("By Elisa Schorn. From the anatomical literature and drawings collection at Heidelberg…") and is truncated. | keep, rewrite caption |
| 1/16 | 6ece5f | physics/electrical-conductor | A grey close-up of a crimped contact, opaque at strip size; caption is component jargon. | keep, rewrite caption |
| 1/18 | 5d4a4b | space/sun | Fine Hinode solar image; caption truncated mid-date ("…on Jan"). | keep, fix caption |
| 1/19 | 5eca1b | physics/static-electricity | Good demonstration (rod lifting paper slivers); caption "Charging on rubbing" is not English. | keep, rewrite caption |
| 1/01 | d1252a | arts/hip-hop | Good DJ photo; caption "Dj Marley Marl in Nottingham / England 1999" lowercases DJ and uses a slash for a place. | keep, fix caption |

### Sheet 2
| cell | id | article | what | action |
|---|---|---|---|---|
| 2/05 | 2c5ad5 | wildlife/wolf | A plate of the Falkland Island **fox**, captioned "Falkland Island fox or \"Antarctic Wolf\" by John Gerrard Keulemans, from St" (truncated), under the wolf article. Wrong animal. | drop |
| 2/06 | e27c1b | physics/ohms-law | A whiteboard of handwritten equations: a page of text, unreadable at this size. | drop |
| 2/08 | 6b439d | space/yuri-gagarin | A press scrum in which Gagarin cannot be picked out; caption has a stray closing quote and runs off ("…Yuri Gagarin”. The USSR…"). | drop |
| 2/09 | 2fff6f | body/nose | A photograph of a building's stone drip edge, captioned "Tropfkante -1" (German). No relation to the human nose. | drop |
| 2/10 | d1ebfb | countries/belgium | Wappers' battle painting of the 1830 revolution — fighting and bodies — as a child's first view of Belgium; caption truncated. | drop |
| 2/14 | a70519 | countries/malaysia | A two-tone map with an empty legend, captioned "Malaysia states blank". Nothing is labelled and the caption is not a sentence. | drop |
| 2/16 | cc7fe0 | people/helen-keller | Her birthplace house; the article's picture does not show the person. | drop |
| 2/17 | e8de6c | science/force | A textbook mechanics problem figure ("Dynamics (Classical Mechanics) Problem Image -numeric version"). Round 1 flagged two of these under the same article. | drop |
| 2/20 | bb0e73 | wildlife/octopus | A silhouetted figure on a dark rocky shore, captioned "The Crack". No octopus in the frame. | drop |
| 2/02 | 5d2926 | ancient/renaissance | Spoons on red cloth ("Polish renaissance spoons"); far too narrow to open the Renaissance. | drop |
| 2/12 | 311d48 | countries/costa-rica | A campus crosswalk captioned "General Studies University of Costa Rica". | drop |
| 2/04 | 38745b | arts/ludwig-van-beethoven | Dark lithograph of the premiere; caption truncated with a stray space ("Ludwig van Beethoven 's…"). | keep, fix caption |
| 2/11 | 14534b | physics/electrical-circuit | Good lit paper circuit; caption "A paper circuit I did" is first-person, not a description. | keep, rewrite caption |
| 2/19 | dd9e8d | arts/lionel-messi | Messi is clearly visible; the caption ("Germany and Argentina face off in the final of the World Cup") never names him. | keep, rewrite caption |
| 2/15 | 25260c | people/haile-selassie-i | Good photo; caption is a long protocol line that runs off the end. | keep, trim caption |
| 2/07 | baee74 | people/wright-brothers | Good portrait; caption is archive descriptor wording ("…head and shoulders, with mustache"). | keep, rewrite caption |

### Sheet 3
| cell | id | article | what | action |
|---|---|---|---|---|
| 3/18 | 77e75a | science/chemical-reaction | An entirely black frame captioned "Captodative Effect". Nothing is visible at any size, and the caption is specialist jargon. | drop |
| 3/02 | e58db3 | science/hydrogen | Industrial pipework behind a sign reading "FILL GAS SELECTOR VALVE / HYDROGEN / HELIUM". The subject is a valve label, not hydrogen. | drop |
| 3/04 | 82ad81 | science/magnet | An industrial lifting magnet on steel plate, captioned in German ("Batterie-Lasthebemagnet EPMB"). | drop |
| 3/05 | 4649f6 | body/cell | A building wall and cobbles captioned "Muestra de cultivos microbianos" (Spanish). The caption describes microbial cultures; the picture shows masonry. | drop |
| 3/07 | f19335 | science/matter | A classification chart whose boxes are in Spanish ("Mezclas", "Sustancias puras") under the English caption "Classification of matter". A page of boxed text. **Same id as round 1's 5/15 — still in the library.** | drop |
| 3/08 | 172d7d | body/cell | A chimeric mouse, filed under the cell article. | drop |
| 3/09 | 4e6385 | arts/violin | A trade-show hall of instrument stalls captioned "2016 National Association of Music Merchants Show"; no violin is identifiable. | drop |
| 3/10 | 920083 | space/jupiter | A labelled magnetosphere schematic: a research figure. | drop |
| 3/14 | fdc804 | space/venus | A synthetic three-dimensional perspective render of Maat Mons, not a photograph (round 1 dropped a Blender render at 4/04 on the same ground). | drop |
| 3/16 | 599b97 | science/gold | A Persepolis tribute relief captioned "Indian gold tribute donor Apadana". Not English, and the picture is a stone carving, not gold. | drop |
| 3/11 | 024e3a | physics/lightning | Strong lightning photograph; the caption is a dictionary definition that runs off ("Lightning is a natural phenomenon consisting of electrostatic discharges occurring…") and never describes the picture. | keep, rewrite caption |
| 3/12 | 05c2d2 | wildlife/dolphin | Good leaping dolphin; caption is the Latin binomial only ("Tursiops truncatus"). | keep, add an English caption |
| 3/01 | e71541 | space/pluto | Excellent Pluto view; caption is a long press paragraph that runs off the end. | keep, trim caption |
| 3/03 | a781c2 | wildlife/komodo-dragon | Good dragons; caption carries the Latin binomial and runs off ("…Komodo National Park…"). | keep, trim caption |
| 3/13 | d7982a | space/saturn | Good Saturn; caption is a mission-news paragraph, truncated. | keep, trim caption |
| 3/19 | 89d908 | earth/rhine-river | Good river view; caption is place-name jargon, truncated. | keep, trim caption |
| 3/06 | 0ba0f1 | arts/tennis | Good serve; caption truncated mid-tournament name. | keep, fix caption |

### Sheet 4
| cell | id | article | what | action |
|---|---|---|---|---|
| 4/03 | f567e0 | physics/electric-charge | A bare vector diagram captioned "Problema electrico coulomb" (Spanish). | drop |
| 4/04 | cf9950 | ancient/colossus-of-rhodes | A silver coin showing Helios, under the Colossus of Rhodes; the wonder itself is not shown and the caption runs off. | drop |
| 4/05 | 439779 | arts/literature | A lecture-hall audience captioned with a list of five writers' names. Nothing in the frame is about literature. | drop |
| 4/06 | 3c7da1 | science/molecule | A labelled ball diagram, "Common Molecules", with "AMONIA" misspelled inside the picture. A text figure with an error baked in. | drop |
| 4/09 | 1c9eb8 | body/pancreas | A red corrosion cast of a **cat's** pancreatic vessels on a white table: clinical, and the wrong species for a human-body article. | drop |
| 4/10 | afcc88 | physics/static-electricity | A glass tube in a museum case; opaque to a child, caption runs off. One of four static-electricity pictures in this sample. | drop |
| 4/12 | 582a09 | earth/mississippi-river | An autumn creek with a fallen log, captioned "The first bridge over the Mississippi River, made of a shaped log, on a snowy October…". No snow and no bridge are visible. | drop |
| 4/14 | 87ff50 | science/hydrogen | A wrapped grey cylinder on a table, captioned "Hydrogen pressure cylinder". Shows a container, not hydrogen. | drop |
| 4/15 | 4ee2af | physics/electric-charge | A branded BMW wireless car charger. The match is the word "charge", exactly as round 1's 10/16 — and that round-1 picture (`d1f729`) is still in the library too. | drop |
| 4/19 | 8d8bbe | earth/danube | An old map captioned "LASB K Hellwig": an archive code, not a description. | drop |
| 4/01 | a4bbe2 | wildlife/bat | A stretched-out bat wing on a board, specimen-style, captioned "Wing underside. Attic bat, Charente-M…". Reads as a dissection rather than an animal. | drop |
| 4/17 | deee87 | earth/great-barrier-reef | A good sea-turtle photograph captioned **"You may select the license of your choice"** — licence boilerplate has been stored as the caption. | keep, rewrite caption |
| 4/02 | ad2613 | arts/piano | Good grand piano; caption is a model code ("Hamburg Steinway D-274"). | keep, rewrite caption |
| 4/13 | 89ebee | space/apollo-11 | Good command module; caption truncated at "Steven F.…". | keep, fix caption |
| 4/18 | 519e7f | people/amelia-earhart | Good photograph; caption truncated at "in July…". | keep, fix caption |
| 4/16 | b748d3 | inventions/robot | Usable robot photo; caption is a parenthetical product name that runs off, and "TOSY" branding is in frame. | keep, trim caption |
| 4/20 | 4fe1ad | inventions/camera | A Sony product shot on white. Relevant but brand-forward and styled like marketing. | keep, note brand |
| 4/07 | 66cb80 | earth/popocatepetl | Murky aerial of the plume; readable but weak, caption runs off. | keep, trim caption |

### Sheet 5
| cell | id | article | what | action |
|---|---|---|---|---|
| 5/01 | 604c3c | science/oxygen | A rainbow world map with a numeric colour bar ("Annual mean sea surface dissolved oxygen…"): a research figure, the same kind round 1 dropped at 5/01 — and that carbon map (`76a98a`) is still in the library. | drop |
| 5/09 | 3491ea | body/skin | A pale stitched micrograph strip of **frog** skin on white, unreadable at strip size and the wrong species for a human-body article. | drop |
| 5/10 | c6058c | space/solar-system | A labelled four-planet composite ("Terrestrial planet sizes"): a figure built from separate pictures, not a photograph. | drop |
| 5/11 | c6f78d | people/nikola-tesla | A banquet group photograph in which Tesla cannot be identified. | drop |
| 5/12 | 852fb6 | space/venus | A second synthetic Venus render, captioned with a file code ("PIA00103 Venus - 3-D Perspective View of Lavinia Planitia"). With 3/14 the sample has two renders for Venus. | drop |
| 5/14 | 2541f3 | body/vaccine | A vaccine carton with Portuguese packaging, captioned "Butanvac embalagem". Product packaging, not English. | drop |
| 5/15 | d964f5 | science/atom | A bowling ball beside a penny, captioned "Electrons are much smaller than protons or neutrons". The caption makes a claim the picture cannot carry. | drop |
| 5/19 | a8fe47 | body/human-body | A dense 1905 anatomical plate with tiny labels; unreadable at any size used in the app. | drop |
| 5/20 | bb994f | inventions/wind-turbine | The inside of a turbine tower (tendon cables); opaque, and 4/08 already serves this article well. | drop |
| 5/06 | a5b097 | physics/electrical-resistance | A woman at a 1950s "resistor value tester". Near-duplicate subject with 8/12, which shows the same machine's controls. | drop one of the pair |
| 5/05 | e607e8 | inventions/mobile-phone | Phone scrap; caption is keyword-stuffed and misspells "decomissioned". **Same id and same caption as round 1's 9/20 — unchanged.** | keep, rewrite caption |
| 5/13 | fe5397 | ancient/julius-caesar | A Caesar coin, acceptable as a portrait source; caption "The Caesarians. Julius Caesar" is not a sentence. | keep, rewrite caption |
| 5/03 | 418d44 | space/supernova | Good Hubble remnant; caption runs off ("…in the Large Magellanic…"). | keep, trim caption |
| 5/18 | e22f27 | inventions/typewriter | Good museum typewriter; caption is a bare museum name. | keep, rewrite caption |
| 5/02 | b91297 | people/malala-yousafzai | **Improvement on round 1**: a clear portrait of Malala, correctly captioned. Round 1 had only a crowd shot and a pavement plaque for her. | keep |
| 5/07, 5/08, 5/16, 5/17, 5/04 | fbfae0, 8ff53e, cf6d79, 166182, d236b1 | ecuador, hummingbird, bicycle, rosa-parks, kilimanjaro | Sound pictures with captions that read as English. | keep |

### Sheet 6
| cell | id | article | what | action |
|---|---|---|---|---|
| 6/03 | 1ff44f | science/atom | A Bohr lithium diagram whose labels are in **Russian**, captioned with a file code ("Blausen 0615 Lithium Atom-ru"). | drop |
| 6/04 | ccb24b | science/matter | "Basic taxonomy of matter": a full page of boxed text. Second text chart for this article after 3/07. | drop |
| 6/06 | 2426ed | physics/voltage | A black circuit diagram captioned in German ("Ersatzschaltbild ohmsches Gesetz 2"). | drop |
| 6/08 | 659cee | body/liver | A dense lipoprotein metabolism pathway figure. | drop |
| 6/09 | a5ab16 | body/vaccine | A German-language SARS-CoV-2 vaccination-schedule infographic. With 5/14 both of this article's pictures fail. | drop |
| 6/10 | 009089 | countries/ecuador | A map of Ecuador's territorial claims on Peru, legend in Spanish. A contested political claim as a country's picture, as round 1 found at 3/18. | drop |
| 6/01 | 77ce27 | wildlife/shark | A scientific plate of a sawshark, captioned with a Latin binomial and a naturalist's surname ("Pristiophorus nudipinnis McCoy"). | drop |
| 6/02 | b15f1a | inventions/refrigerator | A warped spherical panorama shot inside a fridge; caption misspells "Inside" ("Indide a fridge, spherical panorama"). | drop |
| 6/05 | 46c530 | people/florence-nightingale | A masked modern church ceremony captioned only with a date and place ("12/05/2021. London, United Kingdom"). Nothing of Nightingale. | drop |
| 6/14 | 4a970e | science/molecule | A hand-drawn structure on paper beside pencils, captioned "Pencils and molecules". | drop |
| 6/15 | 17d54e | arts/hip-hop | The 1520 Sedgwick Avenue building; the caption carries a Cyrillic aside ("(американска панелка)") and runs off. | drop |
| 6/16 | ed4a0b | ancient/aztecs | A 19th-century painting of tortilla makers captioned "Tortilleras Nebel". Not English, and post-conquest, under the Aztecs. | drop |
| 6/17 | 2f5149 | countries/tanzania | A court building captioned "International Criminal Tribunal for Rwanda" — the caption names another country. | drop |
| 6/19 | ea3c42 | countries/zimbabwe | A landscape with a large unreadable text legend pasted into the frame; caption "Mother of Peace Mutoko" explains nothing. | drop |
| 6/13 | bd0518 | ancient/ancient-egypt | Good museum boat model; caption has a missing space and a stray "..)" ("…Boat with Shrine,Egyptian Museum in Cairo, Egypt..)"). | keep, fix caption |
| 6/12 | 89d1d9 | physics/static-electricity | A clean historical line drawing; acceptable, but this is the fourth static-electricity picture in the sample. | keep |
| 6/07, 6/11, 6/18, 6/20 | a90a40, f009e1, 917a48, 833a37 | antigua-and-barbuda, microscope, insulator, computer | Sound pictures with English captions. | keep |

### Sheet 7
| cell | id | article | what | action |
|---|---|---|---|---|
| 7/03 | 3b1aba | countries/federated-states-of-micronesia | A speaker at an advisory-group meeting; nothing in the frame says Micronesia and the caption describes a committee. | drop |
| 7/06 | 47e9e7 | body/pancreas | A purple histology slide captioned in Portuguese and cut off ("1. Ilhota de Langerhans, 2"). With 4/09 both pancreas pictures in the sample are laboratory specimens. | drop |
| 7/08 | e452a9 | earth/plate-tectonics | A cross-section diagram labelled in **Basque**, with a Basque caption ("Irudi honetan kontinente-ertz baten barne egitura…"). | drop |
| 7/12 | da5855 | space/voyager-1 | Valhalla crater on Callisto, filed under the spacecraft article. The probe is not shown. | drop |
| 7/17 | 5377fa | science/molecule | A ball-lattice research render captioned with interaction-energy prose. Third weak molecule picture after 4/06 and 6/14. | drop |
| 7/18 | 0512b2 | body/breathing | A multi-panel engraving of the gills of worms and molluscs: a research plate, and the wrong subject for human breathing. | drop |
| 7/19 | 4cdaa0 | people/mahatma-gandhi | A framed notice of a Gandhi quotation: a page of text, excluded as a kind. | drop |
| 7/20 | 67de80 | body/bone | A bone-and-tooth amulet captioned "Amulet from the Eeyou people, dating to around 1970" — an artefact, not the human skeleton. | drop |
| 7/05 | a4f0b5 | science/pressure | A gauge close-up; caption is unit jargon ("graduation in hpz (hectopieze, 1 hpz = 1 bar)"). | keep, rewrite caption |
| 7/16 | 29c5bb | earth/mount-fuji | Fuji behind an airport terminal; caption names only the airport and is missing a space ("Mt.Fuji Shizuoka Airport"). | keep, rewrite caption |
| 7/01 | 9d8f18 | earth/pacific-ring-of-fire | Strong volcanic plume; caption cut off ("…visible on le"). | keep, fix caption |
| 7/07 | 14c744 | space/solar-eclipse | Excellent annular eclipse; caption carries raw coordinates. | keep, trim caption |
| 7/02 | faf719 | arts/usain-bolt | Good victory photo; caption runs off. | keep, trim caption |
| 7/09 | 1a9642 | space/sun | A 17th-century sun map; acceptable as historical art, caption carries its Latin title and runs off. | keep, trim caption |
| 7/14 | bb4d17 | earth/nile | A 1619 Hondius map; labels unreadable at app sizes, caption is correct English. Third Nile picture with 7/13 and 8/16. | keep, low value |
| 7/04, 7/10, 7/11, 7/13, 7/15 | 30bc44, 988759, f7bd4e, 7e0c51, 54dd14 | steam-engine, plastic, kofi-annan, nile, mali-empire | Sound pictures with English captions. | keep |

### Sheet 8
| cell | id | article | what | action |
|---|---|---|---|---|
| 8/10 | b3e5f8 | space/moon | Van Gogh's *Starry Night* filed under the Moon, captioned "Van Gogh - Starry Night - Google Art Project". **This is the picture behind round-1 screen defect N15, still in the library and still on the Moon article.** | drop |
| 8/08 | f4c11c | physics/battery | An unintelligible archive photograph captioned with raw finding-aid metadata ("Scope and content: The original finding aid described this as: Capture Date: 10/20/1978…"). | drop |
| 8/15 | 772293 | body/lung | A clinic doorway with Hungarian signage; the caption begins with a stray colon (": Lung Care Institute - 6 Laktanya Street…"). | drop |
| 8/16 | ac5b87 | earth/nile | An amateur 1994 pencil sketch; the third Nile picture and the weakest. | drop |
| 8/18 | 92b918 | ancient/vikings | A crude digital illustration of two helmeted figures, captioned with stacked period keywords ("Germanic Iron age, Vendel period, Nordic Iron Age, anglo-saxon man and woman"). | drop |
| 8/12 | baa1f8 | physics/electrical-resistance | The control panel of the same "resistor value tester" shown at 5/06: a near-duplicate subject, and opaque to a child. | drop one of the pair |
| 8/19 | 1ee25c | wildlife/cheetah | Cheetahs feeding on a carcass, with the kill and blood plainly visible. Too grim as the article's picture for a ten-year-old. | drop |
| 8/05 | e0e5de | inventions/sewing-machine | Good factory floor of sewing machines; caption "Serge Fashion2" is a file name. | keep, rewrite caption |
| 8/13 | c69df0 | physics/electrical-conductor | Good overhead line fittings; caption is German place wording ("Umspannwerk Teinach am E-Werk Teinach, Station Teinach"). | keep, rewrite caption |
| 8/02 | 6bfa1c | arts/guitar | Shop interior full of guitars; caption is the shop's name ("Interior Cowtown Guitars"). | keep, rewrite caption |
| 8/04 | e98702 | people/winston-churchill | Good photograph; caption truncated at "the Cit…". | keep, fix caption |
| 8/09 | caec41 | wildlife/kangaroo | Good 19th-century kangaroo plate; caption cut at "Sydney, ca". | keep, fix caption |
| 8/11 | 290cea | earth/mount-fuji | Hazy Fuji view; caption runs off. Third Fuji picture in the sample with 7/16 and 10/02. | keep, trim caption |
| 8/01 | c2f70e | people/barack-obama | Warm, clear photograph; caption runs off mid-sentence. | keep, trim caption |
| 8/07 | 6d3dfe | wildlife/crocodile | A striking eye close-up, but one of three crocodile pictures and the second extreme close-up with 10/19. | keep, watch the cluster |
| 8/03, 8/06, 8/14, 8/17, 8/20 | 14bc55, fce10c, bc9f92, 184787, f9d978 | machu-picchu, pompeii, usain-bolt, roman-empire, bicycle | Sound pictures with English captions. | keep |

### Sheet 9
| cell | id | article | what | action |
|---|---|---|---|---|
| 9/01 | 98bae6 | wildlife/rhinoceros | An illustration of the extinct woolly rhino captioned with a file code and a misspelling ("Wooly Rhino15"). Round 1 found the same pattern at 9/15 (Elasmotherium). | drop |
| 9/02 | ba90ea | wildlife/crocodile | A zoo enclosure in which the crocodile is almost invisible; caption is a Latin binomial that runs off. | drop |
| 9/03 | 6aac11 | countries/kyrgyzstan | A summit group photograph under a Chinese banner, captioned entirely in Russian. Nothing of Kyrgyzstan. | drop |
| 9/06 | 52e2b0 | space/hubble-space-telescope | A studio portrait of Edwin Hubble, pipe in mouth, filed under the telescope. | drop |
| 9/08 | a2dff0 | arts/fifa-world-cup | A choropleth world map, "Amount of times nations were one of the main hosts…": a data figure, and the caption is not idiomatic English. | drop |
| 9/11 | 515e06 | people/albert-einstein | A ship's-deck group in which Einstein cannot be picked out; caption is a file code ("Einstein Apr.1921 SS Rotterdam 32099"). | drop |
| 9/12 | a2549e | space/neil-armstrong | A memorial-service table with his framed portrait and flowers. A funeral display, not the man. | drop |
| 9/19 | 8e509c | science/force | A mass-spring diagram with symbol labels. Third physics diagram pattern this round after 2/17 and 4/03. | drop |
| 9/10 | 29fd6c | countries/ukraine | Fine night view of Kyiv; caption entirely in Ukrainian ("Міст ім. Є. О. Патона, Київ, Набережна Дніпра"). | keep, rewrite caption |
| 9/13 | 195496 | physics/electrical-circuit | Good breadboard photo; caption in Portuguese ("Análise de circuitos"). **Same id and caption as round 1's 5/19 — unchanged.** | keep, rewrite caption |
| 9/17 | d78e2e | countries/greece | Good Monemvasia aerial; caption entirely in Greek. | keep, rewrite caption |
| 9/16 | cdd7cb | arts/orchestra | Good orchestra photo; caption "David De Mata and large ensemble" never says orchestra. | keep, rewrite caption |
| 9/14 | b44be2 | inventions/bicycle | Good shop photo; caption runs off mid-sentence. | keep, trim caption |
| 9/20 | a0a24f | people/chinua-achebe | Good photograph; caption runs off. | keep, trim caption |
| 9/05 | ab4c24 | ancient/great-zimbabwe | **Improvement on round 1**: a close view of the stone wall itself, where round 1 had only two illegible site plans. | keep |
| 9/04, 9/07, 9/09, 9/15, 9/18 | b90eaa, e60990, 8a844f, 52ae41, 161a97 | static-electricity, vesuvius, ring-of-fire, great-wall, hanging-gardens | Sound pictures with English captions. | keep |

### Sheet 10
| cell | id | article | what | action |
|---|---|---|---|---|
| 10/03 | dbc2c6 | body/ear | The Arctic fox again, still filed under the human ear. **Same id as round 1's 9/01 — unchanged.** | drop |
| 10/04 | 0970a5 | ancient/great-zimbabwe | The same faint surveyor's plan round 1 dropped at 5/04, same id, still illegible. | drop |
| 10/05 | 6eb195 | physics/ohms-law | A circuit diagram whose labels are Spanish ("Energía Química → Energía Eléctrica → Calor"), captioned in Spanish. | drop |
| 10/06 | 5339ae | wildlife/polar-bear | A caged polar bear being handled by trainers at a 1970s television rehearsal, captioned in Dutch. Performing-animal imagery. | drop |
| 10/10 | 8d63f2 | body/immune-system | A 1920s "IMMUNIZE" poster: a page of graphic text, excluded as a kind. | drop |
| 10/13 | ed1603 | countries/democratic-republic-of-the-congo | Two presidents in armchairs; the country is not shown. | drop |
| 10/16 | cd4648 | space/solar-system | A dense black mission map in tiny green type: a research figure, unreadable at any size the app uses. | drop |
| 10/17 | 358c27 | wildlife/chimpanzee | A numbered subspecies distribution map; caption cut off at "distribution: 1". | drop |
| 10/18 | 006d55 | countries/south-africa | A BMW iX1 at a charging bay in Cape Town. Brand-forward, and it shows a car park. | drop |
| 10/20 | 584c68 | people/jane-goodall | Painted thatched houses in Rwanda, filed under Jane Goodall. No connection. | drop |
| 10/19 | 0e85b1 | wildlife/crocodile | Nile crocodile head close-up. Near-duplicate framing with 8/07, and one of three crocodile pictures in the sample. | drop one of the pair |
| 10/01 | 630e2d | ancient/ancient-egypt | Good statue; caption truncated mid-phrase with a typo ("Amenemhat (a privat person, not the pharaoh of the 12"). This is the same caption round 1 cited in screen defect N4. | keep, fix caption |
| 10/02 | 2a5245 | earth/mount-fuji | Hokusai's *Red Fuji*, the best Fuji picture in the sample; caption is catalogue metadata ("Japan; Woodblock print; Prints"). | keep, rewrite caption |
| 10/08 | b330de | countries/mauritius | Striking aerial; caption "Underwater waterfall Mauritius HDR" is not a sentence and carries a technique tag. | keep, rewrite caption |
| 10/12 | 4c8beb | arts/tennis | Good handshake photo; the caption is a piece of advice, not a description ("It is good sportsmanship to shake hands with your opponent…"). | keep, rewrite caption |
| 10/14 | 48c6a8 | countries/togo | A colonial-era quayside photograph captioned with German Federal Archive boilerplate ("For documentary purposes the German Federal Archive often retained the original image captions…"), which appears twice in the library. | keep only with a real caption |
| 10/09 | c8ccb1 | arts/muhammad-ali | The Ali-Liston photograph; caption runs off at "the controversial…". | keep, trim caption |
| 10/07, 10/11, 10/15 | e01cf8, a0d8bf, 78a7cd | telephone, honey-bee, andes | Sound pictures with English captions. | keep |

### Part A counts

| | round 1 | round 2 |
|---|---|---|
| Pictures reviewed | 200 | 200 |
| Pictures with a problem | 124 (62%) | **159 (80%)** |
| …excluding those whose only fault is an English caption that runs off | — | 134 (67%) |
| Suggested drop | 87 | **100** |
| Suggested keep with a rewritten caption | 37 | 59 |

Problems by kind, each picture counted once under its main fault, same kinds as round 1:

| kind | round 1 | round 2 |
|---|---|---|
| Caption wrong, not English, truncated, or a placeholder | 52 | **67** |
| Does not show what its article is about | 36 | **44** |
| Excluded kind (flag, collage, screenshot, page of text, research figure, marketing graphic) | 24 | **38** |
| Unsuitable for a ten-year-old | 7 | 6 |
| Near-duplicate of another picture on the sheets | 5 (three sets) | 4 (two sets) |

The two duplicate sets: 5/06 and 8/12 (the same "resistor value tester", machine and controls), 8/07 and
10/19 (two crocodile head close-ups). Looser clusters that are not duplicates but crowd one article:
three Mount Fuji, three Nile, three crocodile, four static-electricity, two science/matter text charts,
two synthetic Venus renders.

**Twenty-seven captions are not English or contain non-English text** (German, Spanish, Portuguese,
Dutch, Russian, Ukrainian, Greek, Korean, Basque, Latin, Bulgarian), against "at least 22" in round 1.

**The placeholder class is fixed.** Round 1 found seven "identified by ID" or "with ID" captions; this
sample has none, and a scan of all 4,106 records finds none either.

**Caption truncation is not fixed, and it is in the data, not the rendering.** 737 of 4,106 stored
captions (18%) end in an ellipsis, and 218 are two words or fewer.

**Round 1's own rejects partly survived the rebuild.** Of the 88 pictures round 1 named, 35 are still in
the library, and five of those were drawn again into this fresh 200-picture sample: `f19335` (3/07),
`0970a5` (10/04), `dbc2c6` (10/03), `e607e8` (5/05), `195496` (9/13). Several survivors were kept but
re-captioned, which answers round 1's caption complaint while leaving the picture fault: `9329f8` is now
"A chimpanzee brain at the Science Museum London" and `8d60d8` now describes its no-phones poster.
Still present as leads: `b3e5f8` (*Starry Night* under space/moon), `a68cd5` and `6dd362` (Turing's
teddy bear and medal), `b18ea6` (the Cosmo Films marketing map), `d1f729` (BMW car under electric charge).

**Library-wide, the excluded kinds are still collected**: 41 records of kind `flag` and 21 of kind
`emblem`. Two articles still open on one: `countries/belarus` and `countries/libya`.
Five articles hold fewer than the four pictures Req 15 asks for: `physics/electricity` (1),
`body/thumb` (2), `science/light` (2), `ancient/wonders-of-the-world` (3), `earth/arctic-ocean` (3).

## Part B: the screens

**The premise of this round is wrong in one respect, and it changes every verdict below.** The screen
captures in `media-screens/` were written at 03:50; the screen sources under
`/Users/mac/workplace/awari/src/features/media/` were modified at 03:57-03:58, after them, and several
carry comments naming my round-1 defect numbers (`media.css` line 283 "media review N1",
`quiz.css` line 376 "media review N17", `MediaScreen.tsx` line 65 on emblem chips). So the captures show
the pre-fix screens while the code has moved on. Where the two disagree I say so and judge the code,
noting that the fix is unverified on screen.

| | verdict | why |
|---|---|---|
| **N1** photo table white, not coral | FIXED in code, unverified on screen | `media.css:283-299` now gives `.media__table` `background: var(--coral)` and `MediaScreen.tsx` wraps the grid in `<TornEdge color="var(--coral)" seed="media-top" height={26} />`. The capture still shows white graph paper with no torn edge. |
| **N2** captions are raw Commons titles, not plain English | NOT FIXED | The tile caption is still the stored caption (`MediaScreen.tsx`, `row[5]`), and the store is unchanged: the capture's first 60 cells include "Tortilleras Nebel", "Coliseo medieval", "Θερμαικος με θεα τον Ολυμπο!", "KINGS of MACEDON Alexander III the Great…". Part A counts 67 caption faults in a fresh sample. |
| **N3** unresolved "identified by ID" placeholders | FIXED | None in the 200-picture sample, none in all 4,106 records, none on the screen. |
| **N4** captions truncate mid-word | NOT FIXED | 737 stored captions end in an ellipsis. The capture shows "Amenemhat (a privat person, not the pharaoh of…" — the same caption I quoted in round 1 — and Part A finds it again at 10/01. |
| **N5** adjacent duplicates in the grid | PARTLY | No duplicate pair is adjacent in the capture's first 60, and no two records share a Commons title now. But ten caption strings are still shared by 22 pictures ("Illustration from Anatomy & Physiology, Connexions Web site" on four), and nothing in the screen suppresses same-caption neighbours. |
| **N6** kind filter offers Flags and Emblems | PARTLY | `MediaScreen.tsx:66` now filters `k !== 'emblem'`, so the Emblems chip goes. **Flags does not**: 41 `flag` records remain, so the chip still renders. The capture still shows both. |
| **N7** on a phone the filters push the first picture off screen | FIXED in code, unverified | `MediaScreen.tsx` now renders chips *and* a `media__selects` pair of dropdowns, and `media.css:334` hides the chips below 900 px in favour of the two selects. I did not open the 390 px capture (image budget), so the phone layout is unverified. |
| **N8** margin note is interface instruction and says "tap" | FIXED in code, with a caveat | The note is now "4106 pictures, and every licence checked against Commons." — a fact, not an instruction. The capture still reads "Tap a picture to see it big." New caveat below (P3): rule 3 wants a *checked* fact, and this one asserts an audit result the page cannot evidence. |
| **N9** article strip shows two prints, Req 15 asks four | FIXED | `ancient/colosseum` now holds 8 pictures and the capture's "More pictures" strip shows seven prints. |
| **N10** article lead caption is a file name | NOT FIXED | The lead print still reads "Colosseum-Entrance LII". The caption comes from the article's own photo credit, not from the media library, so the library rebuild could not fix it. |
| **N11** no author or licence on the strip itself | PARTLY | `ArticleGallery.tsx:31` now prints "From Wikimedia Commons, shown as small copies resized to 480 px. Open one for its author and licence." The strip says where the credit is; it still does not carry the author or licence per print. |
| **N12** nothing says the picture was resized | FIXED | Two places now say it: the strip note above, and `MediaViewer.tsx:82` "Shown resized; the original is on Wikimedia Commons." |
| **N13** Picture of the day truncates its own caption to 38 characters | FIXED | `PictureOfTheDay.tsx` no longer slices anything: the print's caption is `pic.articleTitle` and the full caption sits in the text column. (The only 38 left is a tape position.) Not seen on screen — the Home capture was not opened. |
| **N14** the question asks about the app, not the world | FIXED in code | `src/lib/quiz/picture.ts:52` now asks "What is this a picture of?", or "Which country is this a picture of?" for countries. The capture still shows "Which page does this picture belong to?". |
| **N15** the question is not answerable from its picture | NOT FIXED — the fix is defeated by the data | `pictureQuestions` now keeps only `kind === 'photo'`, and its comment names my Starry Night example. But **Van Gogh's *Starry Night* is stored with `kind: "photo"`** (`public/media/space.json`, id `b3e5f8…`, article `space/moon`), so the filter does not exclude it and the exact round-1 question can be built again. At least 49 `photo`-kind records describe themselves as a painting, drawing, map, mosaic or diagram. |
| **N16** the quiz credits every picture under one licence | FIXED in code | `QuizScreen.tsx:163-171` now renders, for the pictures pack only, "Pictures from Wikimedia Commons; each picture's author and licence are shown with its answer", and each question's `proof` carries that picture's author and licence. The blanket `licence: 'CC BY-SA 4.0'` still sits in the quiz's `source` object (line 235) but is no longer printed; the capture still shows the old blanket line. |
| **N17** the quiz picture is not a print | FIXED in code, unverified | `quiz.css:376-386` adds a print treatment to `.question__image` with the shared `--shadow-print`, commented "media review N17". The capture still shows a flat rectangle, and `QuestionCard.tsx:92` renders a bare `<img>`, so whether it reads as a print depends entirely on that CSS. |
| **N18** credits table breaks words mid-letter at 1440 px | FIXED in code, unverified on screen | `credits.css:45-53` now carries a rule commented "media review N18": the header and licence columns no longer break anywhere, and only file names and URLs in the last column may. The capture still renders "Licenc / e" and "Public / domai / n". |
| **N19** credits page has almost nothing of the scrapbook in it | PARTLY | `CreditsScreen.tsx:43` now adds a `MarginNote`, so rule 3 is met. There is still no `TornEdge`, no print and no object crossing a boundary, so rules 1, 4 and 5 remain unmet, and the capture is still plain tables on white. |
| **N20** Castle and quiz primary buttons are charcoal, not yellow | NOT FIXED — and round 1's doubt is resolved | `QuestionCard.tsx:115` renders the button as `btn btn--ink`, not `btn--yellow`, and `disabled` only gates the click. Charcoal is the chosen colour, not a disabled state, and because both the Castle and the picture quiz use this one component, it is charcoal on both. |

Round-1 defects still standing: **N2, N4, N10, N15, N20** (five), plus **N5, N6, N11, N19** partly.
Fixed outright: **N3, N9, N12, N13**. Fixed in code but not visible in this round's captures:
**N1, N7, N8, N14, N16, N17, N18**.

**The code moved while I was reading it.** `src/features/media/*`, `src/features/quiz/*`,
`src/features/credits/*` and `src/lib/quiz/picture.ts` were all modified during this review. Every
"FIXED in code" verdict above is against the source as of 04:0x on 14 November 2026, and will need
re-reading if those files keep changing.

### New defects

**P1 — *Starry Night* is stored as a photograph.** Covered under N15 above, but it is a data defect in
its own right: `kind` is what the quiz, the Flags/Emblems filter and "photographs only" rules all read,
and at least 49 `photo` records describe themselves as paintings, drawings, mosaics or maps. Any rule
written in terms of `kind` is only as good as this field.

**P2 — the article lead is the weakest Colosseum picture available.** The lead print is an entrance
arch captioned "Colosseum-Entrance LII" while the strip immediately below holds three clear exteriors,
including a dusk panorama. Whatever chooses the lead is not choosing the best picture of the eight.

**P3 — the new Pictures margin note makes an audit claim.** "4106 pictures, and every licence checked
against Commons." Rule 3 of `design.md` allows a margin note to carry one true checked fact; this one
asserts the result of a licence audit that the page itself cannot evidence, and it will silently go
stale the next time the library grows. A fact about the pictures ("the oldest picture here is from
1835") would meet the rule without claiming an audit.

**P4 — the article picture strip is cut off mid-print at the right edge.** On
`article-ancient-colosseum-1440` the seventh print ("Map of antique downtown Rome, drawing") is sliced
by the viewport with no arrow, fade or other sign that the strip scrolls. At 1440 px there is room to
show fewer prints whole, or to mark the overflow.

**P5 — strip captions truncate too.** The same ellipsis fault as N4 appears in the article strip
("A 4x4 segment panorama of the…", "Rome, the Colosseum is a sketch by Maarten…"), so the article page
inherits it from the data.

**P6 — the credits page spoke to developers; already fixed in code.** The capture explains that "the
`npm run credits` check (and a Kiro hook) fails if one is missing" and that "`npm run licences` asks the
Commons API for every one of them… and the submission check fails on any mismatch" — build tooling
described to a child on the page meant to thank the people who shared the pictures. The current
`CreditsScreen.tsx` no longer contains any "npm run" wording, so this is resolved and listed only
because the evidence set still shows it.

**P7 — the picture-quiz screen has none of the scrapbook furniture.** One white card and one margin note
on bare graph paper: no coral, no torn edge, no object crossing a boundary (rules 4 and 5). N17 fixes the
picture inside the card; the screen around it is still the plainest in the app after credits.

**P8 — a stale end-to-end check pins the removed wording.** `scripts/offline-check.ts:221` still waits
for the text "Which page does this picture belong to?", which `picture.ts` no longer produces. The N14
fix will fail that check. I did not run it; this is from reading the file.

## What I could not check

1. **Six captures were not opened**, to stay inside the image budget this round set: Home, the Castle
   wing, and all six 390 px captures. Phone layout is therefore unverified, which matters most for N7
   (the fix is only in code) and N18 (credits columns at 390 px).
2. **The captures predate the current screen code by about seven minutes**, so for N1, N7, N8, N14, N16
   and N17 I am reporting what the code now does, not what a screen does. Those six need a fresh capture
   set before anyone calls them fixed.
3. **Nothing was executed.** No build, no test, no `offline-check`, no browser. P8 and every "FIXED in
   code" verdict is a reading of source, not a run.
4. **The large view was never exercised** again this round. Req 17 and 21 are judged from
   `MediaViewer.tsx`, which now carries the resize line, the author, the licence and the Commons link.
5. **Only the first 60 of 4,106 pictures appear in the Pictures capture.** Search, "Surprise me", the
   kind filters and pagination were not exercised; my duplicate check is over the 200 sampled pictures
   plus whole-library caption and title comparisons, not over the images themselves.
6. **Judgement was again made at contact-sheet size** (about 280x130 px per cell) from the first six
   characters of each id. Small in-picture text, watermarks and non-adjacent near-duplicates can be
   missed.
7. **Licences, authors, sha1, thumbnail sizes, the 150 MB budget, the 3,000-picture floor and the
   eight-per-country rule were not checked.** They belong to the licence auditor. What I did read from
   the data is structural: kinds, caption text, per-article counts.
8. **Motion, hover, reduced motion, screen-reader behaviour and numeric contrast were not tested.**
   Static captures cannot show them.
9. **Whether the 35 surviving round-1 rejects are still used as article leads** was checked only for
   flags and emblems (two: Belarus, Libya). Lead selection for the other articles was not audited.
10. **`@kirocrew-computer` was again unavailable in this session** (declared by the agent spec, not
    configured), so I could not drive a browser to re-capture the six screens whose fixes are
    code-only. That is the single thing that would close the biggest gap in this report.
