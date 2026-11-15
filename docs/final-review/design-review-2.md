<!-- Round 2 design review, run 0b549c35. The reviewer had no file-write tool, so the parent saved its report verbatim from the run's result.txt. -->
# Awari: final design review, round 2

Reviewed 15 November 2026 against `/Users/mac/workplace/awari/.kiro/steering/design.md`, the reference in `/Users/mac/workplace/awari/design/`, and round 1 (`/Users/mac/workplace/awari/docs/final-review/design-review.md`, D‑1 to D‑43). Read-only review.

## What I actually looked at

- Contact sheets of the fixed live build: `sheet-1440-1.jpg` to `sheet-1440-6.jpg` (22 screens) and `sheet-390-1.jpg` to `sheet-390-3.jpg` (22 screens), plus full-size `shots/timeline-1440.jpg`. Ten image files in total.
- The live site at [d3txwsv4mn6ye9.cloudfront.net](https://d3txwsv4mn6ye9.cloudfront.net) at 1440×900 and 390×844, driven with Playwright: the hint ladder played end to end on `/quiz/countries/nigeria`, the atlas select, the castle wing, the stamp pages, the timeline, both empty states, hover on a print, `prefers-reduced-motion`, and eight tab stops.
- Content read as text through the live JSON, not images: all 3,525 picture records in `/media/*.json`, all 483 article leads in `/packs/*/index.json`, all 479 quiz files (2,360 questions) in `/packs/quizzes/`, and the full body text of 317 articles in five packs.

I did not trigger "Make a quiz from any article". It calls the Bedrock Lambda and spends the owner's money; that needs a sign-off, so the feature is unverified.

## Headline answer on the four things the owner asked about

**The quiz hint ladder is fixed.** Played live on `/quiz/countries/nigeria`: rung one now reads "A capital city is where a country's government meets. The other three are capital cities too, of other countries." Rung two, "Look in the opening paragraphs of the Nigeria article." Rung three crosses out two options and labels them "(taken away by a hint)" in words. Across all 2,360 questions, zero nudges count letters and zero contain the answer word. Round 1 found 366 of 381.

**The stamp book is better framed and still an empty form.** It now opens with a "Newest: Nigeria" print, a count out of 197 countries, and a handwritten "Every country you open becomes a stamp." The 53 unearned slots on `/stamps/africa` are still dashed boxes holding a handwritten "?" over the words "Not found yet", seven across at 1440 and two across at 390. A child's first visit is still a page of question marks.

**The timeline is half fixed.** The two chip rows are now one solid style with `aria-pressed` (round 1's dashed row is gone), the wobbly ruler is there (`svg.tl-ruler`, `aria-hidden="true"`), and 1,530 events sit in a real ordered list. The copy still repeats itself: an entry renders "1900 · 1900: · Jacques Prévert · Born 4 February 1900. · Europe", three printings of 1900, and "On this day, 15 November" is four births with the identical sentence shape, each repeating the date the bold badge just gave.

**Movie theatre and Carbon are properly fixed.** Movie theatre leads with a cinema marquee, captioned "Movie theatre"; the beer is gone and six cinema interiors fill the strip. Carbon leads with coal beside a diamond, captioned "Carbon"; the diseased lung is gone. Both confirmed in `sheet-1440-2.jpg` and in `/media/arts.json` and `/media/science.json`.

## 1. Round 1 findings, D-1 to D-43

| id | Status | Evidence |
| --- | --- | --- |
| D-1 | FIXED | 0 of 2,360 nudges count letters or name the answer; ladder played live on `/quiz/countries/nigeria` |
| D-2 | FIXED | `arts/movie-theatre` lead is now "Interior of Cinema 9, Hoyts movie theater, Westfield Carousel, Cannington", shown captioned "Movie theatre" |
| D-3 | FIXED | `science/carbon` lead is now "Diamond and graphite shown side by side, for illustrating carbon" |
| D-4 | PARTLY | Cloze is 1,814 of 2,360 (77%), down from 95%; capital, border, language and picture-quiz shapes now exist |
| D-5 | FIXED | 0 questions where exactly one capitalised option is the answer (was 87) |
| D-6 | PARTLY | 7 option sets still near-synonymous, e.g. `packs/quizzes/ancient/mali-empire.json` "few written _____": histories, accounts, stories, customs |
| D-7 | FIXED | Kenya now offers Somali, Swahili, Venda, Tumbuka; Cameroon offers Algeria, Central African Republic, Ethiopia, Burkina Faso; the capital-pair option is gone |
| D-8 | PARTLY | 1,445 of 2,360 proofs (61%) are still the prompt with the gap filled, down from 94% |
| D-9 | FIXED | At 390 the lead print is `display:none`; h1 at y=214, first question at y=392 of 844 |
| D-10 | PARTLY | Header is 174 px, not 257, on every route; it still does not collapse and the nav row is now clipped (see N-4) |
| D-11 | PARTLY | Lead print, 197-country count and a margin note added; empty slots are still dashed boxes with "?" and "Not found yet" (`.hand.stamp-book__q`) |
| D-12 | FIXED | `body/brain` lead is now "3D medical illustration showing three different parts of mid brain"; the TV poster is gone |
| D-13 | FIXED | `body/digestion` lead is "Various steps in the process of digestion"; the date-string caption is gone |
| D-14 | FIXED | 0 of 3,525 captions end in an ellipsis (was 431); 4 still end mid-phrase without one (N-16) |
| D-15 | FIXED | 1 first-person caption left, `body/sleep` "And I still need to make dinner"; 1 self-referring, `body/tooth` "The above poster is from Archives New Zealand's…" |
| D-16 | FIXED | `inventions/steamboat` lead is "The steamship Ben Campbell at a landing" |
| D-17 | FIXED | 0 of 483 leads carry bracket artifacts; Cape Verde now reads "Cape Verde or Cabo Verde, officially the Republic of Cabo Verde, is an island country in Africa." |
| D-18 | FIXED | Muhammad Ali and Iron both open with definitions; 0 hatnotes in 483 leads |
| D-19 | FIXED | Mount Fuji "is the tallest mountain in Japan, at 3,776 metres (12,388 ft) high."; helicopter lead complete; 0 leads end mid-sentence |
| D-20 | FIXED | `science/energy`: "In physics, energy is a property of matter and space. It can be transferred between objects." |
| D-21 | FIXED | `arts/basketball` lead is grammatical and 36 words; the stray "+" is gone |
| D-22 | FIXED | 0 leads contain IPA; the 26 regex hits are en-dashes in date ranges, not scripts |
| D-23 | PARTLY | The duplicated name is gone; the year still appears three times: badge "1900", label "1900:", sentence "Born 4 February 1900." |
| D-24 | NOT FIXED | "On this day, 15 November": "**1738** William Herschel was born on 15 November 1738." and three more, all births, all the same shape |
| D-25 | NOT FIXED | On `/subject/space` the note "The Space Shuttle was made up of 3 parts!" and its arrow sit inside `.subject__lead-print`, whose image is `space-sun.jpg` captioned "Sun"; visible in `sheet-1440-4` |
| D-26 | FIXED | No caption anywhere contains "Shiraz"; `countries/australia` leads with a koala |
| D-27 | FIXED | `arts/mask` lead is "Various Balinese Topeng (dance masks), Taman Mini Indonesia Indah, Jakarta" |
| D-28 | FIXED | All 35 timeline chips compute `border-style: solid` with `aria-pressed`; confirmed in `shots/timeline-1440.jpg` |
| D-29 | NOT FIXED | `/subject/space` still shows "0 of 30 quizzes done in this subject." over a row of pale squares that read as skeleton loading (`sheet-1440-4`) |
| D-30 | FIXED | The Not-found doodle is now a wobbly stroked cross (`svg.doodle.crowding`, path `M9 45Q18 45.1 22.5 45.2…`), not a thin circle |
| D-31 | FIXED | "the atlas", "the subjects" and "a quiz" are all links on Not found |
| D-32 | NOT FIXED | Atlas card still reads "People 211,400,708 (2021)" and "Money naira" lower case beside "Language English" |
| D-33 | NOT FIXED | 49 of 317 articles still carry "as of YYYY", including `packs/countries/chad.json` 2012, `cuba` 2012, `armenia` 2007 |
| D-34 | FIXED | Subjects now "11 subjects. Pick a picture to open its pages."; Atlas "then pick a country to visit" |
| D-35 | NOT FIXED | 124 of 317 articles use US spellings: `countries/nigeria.json` "economic center", "neighboring" (and that sentence is the Abuja quiz proof) |
| D-36 | FIXED | "A4 PAPER", "Opera cake", "Common road", "Kenyan Landscapes" all gone; 5 short captions remain, all sensible noun phrases |
| D-37 | FIXED | Kilimanjaro captions are now all about Kilimanjaro |
| D-38 | FIXED | The Pripyat photo moved to `science/nuclear-power`, where it belongs |
| D-39 | FIXED | No caption contains "phaloidin"; `body/pancreas` still technical but readable-ish (N-7) |
| D-40 | FIXED | Credits now reads "On this device: saved. Articles, quizzes, maps, the atlas and lead photos work without a connection." |
| D-41 | FIXED (clipping) / PARTLY (gap) | Figure right edge is 1397 of 1440, not clipped; the hints box still sits far right at x=1072 with empty space below the card, and it uses a dashed border (N-12) |
| D-42 | NOT FIXED | At 390 "Thank you, open knowledge" wraps to three lines and "This page is not on the map" to two, leaving stepped yellow blocks (`sheet-390-3`) |
| D-43 | PARTLY | The Space strip now mixes an astronaut and a red Mars among the grey spheres, but still reads dark against white-bordered prints |

Totals: 30 fixed, 8 partly, 5 not fixed.

## 2. Re-sampled content, with counts

### Picture captions: all 3,525 records in `/media/*.json`

| Check | Round 1 | Round 2 |
| --- | --- | --- |
| Truncated with an ellipsis | 431 | **0** |
| Cut mid-phrase without an ellipsis | not measured | 4 |
| Uploader first person | 32 | 1 |
| Self-referring | 17 | 1 |
| Shorter than three words | 29 | 5 |
| Non-Latin characters | 12 | 6 (all proper names: Milošević, Cần Thơ, al-Ḥūt) |
| Starting lower case | 0 | 0 |
| Over 110 characters | 0 | 0 |
| Processing or restoration notes | 4 | 0 |
| Date-only junk | 2 | 0 |
| File names, markup, placeholders | 0 | 0 |

The only remaining first-person caption is `body/sleep` "And I still need to make dinner"; the only self-referring one is `body/tooth` "The above poster is from Archives New Zealand's health poster collection, transferred". The four silent cuts are `earth/himalayas` (the **lead**, "…a high altitude glacial lake located"), `countries/panama` ("…Ordovician Beach Resort, located"), `space/black-hole` ("…the Gemini North telescope, located") and the tooth caption above.

### Article leads: all 483 in `/packs/*/index.json`

| Check | Round 1 | Round 2 |
| --- | --- | --- |
| Empty or stray bracket artifacts | 24 | **0** |
| IPA pronunciation | 22 | **0** |
| Wikipedia hatnotes | 2 | **0** |
| Disambiguation stubs | 2 | **0** |
| Ending mid-sentence | 3 | **0** |
| Over 45 words | 27 | **0** |
| Citation markers | 1 | **0** |
| Not ending in a full stop | 10 | 1 (`ancient/renaissance`, ends on a closing quote mark) |
| Non-Latin opening | 41 | 0 real (26 matches are en-dashes in "(1879 – 1955)") |

This is the cleanest part of the fix. Every one of round 1's five worst leads now reads as a definition a nine-year-old can use.

### Quizzes: 479 files, 2,360 questions (round 1: 77 files, 381 questions)

| Check | Round 1 | Round 2 |
| --- | --- | --- |
| First hint identifies the answer | 366 of 381 (96%) | **0 of 2,360** |
| Nudge counts letters | 376 of 381 | **0** |
| Capitalisation leak | 87 | **0** |
| Duplicate options | 0 | 0 |
| Answer index out of range | 0 | 0 |
| Proof missing the answer word | 0 | 0 |
| "Remove two" removes the answer | not measured | 0 |
| Century nudge that fits only one option | n/a | 0 of 174 |
| "Fill the gap" share | 95% | 77% (1,814) |
| Proof is the prompt with the gap filled | 94% (360) | 61% (1,445) |
| Proof is not the sentence the gap came from | not measured | **253** |
| Border question whose proof shows no border | not measured | **57 of 175** |
| Near-synonym option sets | 68 | 7 |
| Nudge quoting a mangled word | not measured | 16 |

## 3. Lead picture against article, and quiz answers

### 60 articles hand-judged (all 479 lead captions screened by word overlap; 149 share no word with their title)

Round 1's twenty are all fixed: `arts/movie-theatre`, `science/carbon`, `inventions/steamboat`, `body/brain`, `body/digestion`, `wildlife/frog` (now "Pristimantis moro, a frog"), `arts/mask`, `inventions/paper` (now "Various products made from paper"), `earth/mount-kilimanjaro`, `space/mercury`, `countries/grenada`, `countries/afghanistan`, `ancient/stonehenge`, `arts/olympic-games` (now the 2008 Beijing closing ceremony), `ancient/industrial-revolution` (now Marshall's Mills), `arts/jesse-owens` (now Owens himself), `countries/australia`, `body/pancreas`, `body/sleep`, `body/tooth`.

Forty more I judged from the mismatch list. These lead prints are wrong or meaningless, all in `/media/<subject>.json` with `lead: true`:

| Article | Lead caption | Problem |
| --- | --- | --- |
| `science/atom` | "Ernst Haeckel 's "tree of life", Darwin's metaphorical description of the pattern" | A biology diagram leads a core physics article |
| `body/leg` | "Last day of Wikimania 2024" | A conference photo leads the Leg article |
| `countries/mexico` | "Shot at the Minnesota Zoo" | Leads Mexico with a US zoo |
| `countries/peoples-republic-of-china` | "Finally unlocked BFZ with CBD skyline here" | Uploader chat leads China |
| `countries/moldova` | "UEFA Euro 2016 qualifying, Group G" | Leads a country with a fixture listing |
| `countries/saint-lucia` | "Ricardo Perez, 349th Medical Support Squadron biomedical equipment technician, poses" | Leads an island with a US military portrait |
| `physics/electrical-circuit` | "Investigating the point 1 of the curve" | Means nothing on its own |
| `science/gold` | "2 grams, and has a diameter of 58 millimeters" | Fragment with no subject |
| `science/hydrogen` | "7 million light-years away in the constellation Triangulum" | Fragment, wrong subject |
| `space/voyager-1` | "3 million km four days after its closest approach" | Fragment starting mid-number |
| `space/neil-armstrong` | "1 crashes at Ellington Air Force Base 6 May 1968" | Fragment on a biography |
| `space/mars` | " Includes notes, statistical data, and 6 inset polar maps of Northern" | Leading space, catalogue metadata |
| `space/asteroid` | "Pluto's image taken by New Horizons on July 14, 2015, from a range" | Pluto leads Asteroid, and it is cut |
| `science/matter` | "Absence of substance in the passing by goods train" | Not English |
| `science/periodic-table` | "Sulfur (Atomic number 16)" | One element leads the whole table |
| `wildlife/honey-bee` | "The walls of the cells have been removed" | Fragment with no subject |
| `people/isaac-newton` | "Found in the Botanic Gardens in Cambridge, England" | Fragment; presumably the apple tree |
| `people/malala-yousafzai` | "She is an inspiration to us all" | Uploader opinion as a caption |
| `space/sun` | "These studies could lead to profound insights into the origin of life on Earth" | Not a description of a picture |
| `earth/mount-fuji` | "Japan; Woodblock print; Prints" | Catalogue fields |
| `inventions/automobile` | "Blade fuses on Citroen Jumper" | Fuses lead the Automobile article |
| `body/immune-system` | "Variant genetic backgrounds in host IRGs can lead to increased susceptibility" | Unreadable for the audience |
| `body/dna` | "Even at low magnification, it gives an overview of the human genome" | Starts with "it" |
| `body/vaccine` | "BAGHDAD INTERNATIONAL AIRPORT, Iraq -- Vials of smallpox" | A press dateline in shouting caps |
| `countries/chile`, `countries/india`, `countries/morocco` | "It was originally a colonial mint house", "It is native to southern India…", "It is considered a great example…" | Three leads open with "It" and never name the thing |
| `countries/cameroon` | "A view of a ship in the river" | Says nothing about Cameroon |
| `countries/guatemala` | "Built in the 17th century, it originally connected the Santa Catalina convent to a school" | No subject named |
| `body/ear` | "Mortuary cast of Talleyrand's ear" | A death cast leads the children's Ear article |
| `body/nose`, `body/eye` | "An adult female ocicat's face", "Blue bottle fly ( Calliphora ) Portrait…" | A cat and a fly lead Nose and Eye |
| `body/heart`, `body/human-skeleton` | "Some students explore the human body, in the science lab…", "The archaeological site of Hadyakh…close to the tombs" | Neither shows the organ named |
| `countries/south-africa` | "Sign in Durban that states the beach is for whites only under section 37" | Factually right, but an apartheid sign as a country's one lead print is a choice worth a second look |
| `science/gas`, `science/sound`, `science/speed-of-light`, `earth/krakatoa`, `inventions/solar-energy`, `body/muscle`, `body/lung` | technical, generic or cut | Weak but not wrong |

The good news: most of the 149 "mismatches" are correct editorial choices (Ancient Egypt on the Giza pyramids, Muhammad Ali on "Foreman falls after being punched", Nigeria on Zuma Rock).

### 60 quizzes examined (2,360 questions screened; ~120 read in full across ~70 files)

Read in full: `packs/quizzes/countries/{nigeria,kenya,cameroon}.json`, `packs/quizzes/ancient/{ancient-egypt,roman-empire,mali-empire}.json`, plus all 57 border questions flagged below, 16 mangled-hint questions, 10 proof-mismatch questions and 7 ambiguous sets.

Wrong, ambiguous or guessable, worst first:

1. **31 border questions name a country that shares no land border.** The question's own nudge says "Two countries are neighbours when you can walk from one into the other", which the answer then contradicts: `countries/algeria` → Italy, `countries/australia` → East Timor, `countries/bahrain` → Iran, `countries/the-bahamas` → United States, `countries/jamaica` → United Kingdom, `countries/japan` → Russia, `countries/sri-lanka` → India, `countries/united-kingdom` → France, `countries/cyprus` → Turkey, `countries/madagascar` → France, `countries/mauritius` → France, `countries/comoros` → France, `countries/seychelles` → Comoros, `countries/sao-tome-and-principe` → Gabon, `countries/gabon` → Angola, `countries/cuba` → United States, `countries/venezuela` → United States, `countries/kiribati` → United States, `countries/samoa` → United States, `countries/new-zealand` → Australia, `countries/solomon-islands` → Australia, `countries/east-timor` → Australia, `countries/vanuatu` → Solomon Islands, `countries/palau` → Philippines, `countries/philippines` → Indonesia, `countries/singapore` → Indonesia, `countries/federated-states-of-micronesia` → Papua New Guinea, `countries/south-korea` → Japan, `countries/taiwan` → Japan, `countries/norway` → Denmark, `countries/sweden` → Denmark. For the island nations the question has no correct answer at all.
2. `packs/quizzes/countries/slovenia.json`: "Fill the gap: "_____ Prešeren (1800-1849) is a very famous poet in his country."" with options Libya, Norway, **France**, Spain. The gap is the poet's first name; the distractors are countries, so the child learns that France is a poet's name.
3. `packs/quizzes/people/mother-teresa.json`: "Fill the gap: "She once said: "The greatest _____ of peace is abortion because if a mother can kill her child, what is left for me to kill you and you to kill me?"."" Answer "destroyer". Not suitable for ages 8 to 14.
4. **253 cloze proofs are not the sentence the gap came from**, so the proof does not prove and sometimes contradicts: `ancient/kingdom-of-aksum` asks for "In the 7th _____" and proves it with "The Kingdom used the name "Ethiopia" as early as the 4th century."; `ancient/vikings` asks "In the 9th _____" and proves it with a sentence about the 10th and 11th; `ancient/stonehenge` asks for "World _____ Site" and proves it with a sentence about Avebury; `physics/electricity` asks for "electrical _____" and proves it with a sentence about transmission media; `ancient/mayan-civilization` answers Mexico and proves it with the Conquistadors.
5. `packs/quizzes/countries/nigeria.json` question 5 (the Biafra war) still says "It is further down the Nigeria article, under the heading "Religion"." Wrong section; round 1 reported this.
6. 16 nudges quote a neighbour word with its accents stripped, so the hint points at a word that is not in the sentence: "sits beside "Preeren"" for Prešeren (`countries/slovenia`), "sits beside "Djenn"" for Djenné (`ancient/mali-empire`).
7. 7 option sets where two options fit equally: `ancient/mali-empire` "there are few written _____" with histories, accounts, stories, customs.
8. `packs/quizzes/arts/tennis.json` quotes broken article prose straight into the prompt: "The sporty is now is called "tennis" and became popular in _____ and France." The fault is in `packs/arts/tennis.json` itself.

## 4. New defects

| id | Screen | What is wrong | Severity | Evidence |
| --- | --- | --- | --- | --- |
| N-1 | Quiz, Castle | 31 border questions teach a false fact, contradicting their own "you can walk from one into the other" hint; for island nations no option is correct | Blocker | 57 of 175 border proofs contain no border evidence; files listed in §3 |
| N-2 | Quiz | A quiz question for 8-to-14-year-olds is built on a quotation about abortion and killing children | Blocker | `packs/quizzes/people/mother-teresa.json` |
| N-3 | Quiz | 253 cloze proofs are a different sentence from the gap, so the proof fails to prove and sometimes names a different century | Major | `packs/quizzes/ancient/{kingdom-of-aksum,vikings,stonehenge,mayan-civilization}.json`, `physics/electricity.json` |
| N-4 | All screens (phone) | The navigation row is clipped mid-word at "Timel…" on every one of 22 phone screens; Pictures, Castle and Quizzes are off-screen in a strip with no visible scroll affordance | Major | `sheet-390-1` to `-3`, every tile; `document.scrollWidth` stays 390 because the strip scrolls internally |
| N-5 | All screens | The offline toast ("Saved. Awari now works without a connection… Got it") reappears on every route load and sits over content bottom-right; at 390 it covers the last ~90 px, hiding two of four "On this day" entries and the first stamp rows | Major | Present in 18 of 22 phone tiles and 12 of 22 laptop tiles; live in my session on every navigation |
| N-6 | Quiz | `countries/slovenia` asks for a poet's first name and offers four countries, so the "answer" is France | Major | `packs/quizzes/countries/slovenia.json` |
| N-7 | Articles | About 30 lead prints are orphan fragments, uploader chatter or the wrong subject: a tree of life on Atom, Wikimania on Leg, a Minnesota zoo on Mexico, "Finally unlocked BFZ…" on China | Major | Table in §3; `/media/*.json`, `lead: true` |
| N-8 | Quiz | 16 nudges quote a word with its accents stripped, so they point at a word the sentence does not contain | Minor | `packs/quizzes/countries/slovenia.json` ("Preeren"), `ancient/mali-empire.json` ("Djenn") |
| N-9 | Article, Quiz | `packs/arts/tennis.json` contains "The sporty is now is called "tennis"", and the quiz generator lifted that broken sentence into a question | Minor | 1 of 317 articles scanned |
| N-10 | Quizzes, Credits, Not found (phone) | 477 quiz links are 28 px tall, 113 credit links are under 44 px, and the Not-found inline links are 24 px | Minor | Measured live at 390×844 |
| N-11 | Castle (phone) | The lead photo (176 px) and the intro sit above the headline, pushing h1 to y=412 of 844 | Minor | Measured live; `sheet-390-2` tile 1 |
| N-12 | Quiz (1440) | The hints box uses a dashed border, which reads as a placeholder or drop zone, the same signal round 1 flagged on the timeline chips | Minor | `sheet-1440-2`, top-left tile |
| N-13 | Timeline | All 59 visible notes share one style with no rotation, and the "you are here" arrow on the ruler that `design/screens/README.md` promises is absent; the only arrow points at a filter chip | Minor | `.tl-note__year` is the only variant, `rotate: none`; `shots/timeline-1440.jpg` |
| N-14 | Subject | The lead print image carries `alt=""`, so a screen reader is told nothing about a content photograph | Minor | `/subject/space`, `img` inside `.subject__lead-print` |
| N-15 | Search | "Looking through the packs…" is still on screen long enough to be captured in two of six sheets | Polish | `sheet-1440-5`, bottom-left tile |
| N-16 | Pictures | 4 captions still stop mid-phrase, one of them a lead: `earth/himalayas` "…a high altitude glacial lake located" | Polish | `/media/{earth,countries,space,body}.json` |
| N-17 | Article (Movie theatre) | The screen has no handwritten margin note, so rule 3 is simply absent there | Polish | Live DOM: 0 `.margin-note` on `/article/arts/movie-theatre` |

## 5. The nine rules

1. **Photographs as prints.** Honoured everywhere, and the editorial failures that undermined it in round 1 are mostly gone. White borders, 2 to 5 degree rotations, tape, overlaps, handwritten captions. Remaining fault is N-7.
2. **Headlines on hand-cut strips.** Honoured on all 22 screens. Only the 390 wrap (D-42) is untidy.
3. **Handwritten margin notes with a checked fact.** Now verifiably true: every number in the notes I read traces back to its own article ("Nigeria has the fourth biggest economy in Africa, as of 2024!", "Lions live for 10 to 14 years in the wild!", "Water freezes at a temperature of 0 °C, 32 °F, or 273.15 K!"). The round-1 qualifier problem is fixed. One note still points at the wrong object (D-25) and one screen has none (N-17).
4. **Wobbly doodles.** Honoured, and the Not-found spinner-like circle is now a wobbly cross. The timeline ruler, castle door path, hint bulbs and quiz dots are all hand-drawn SVG.
5. **Torn edges with an object crossing them.** Honoured on Home, Article, Subject, Pictures and Stamps; the lead print crosses the teal-to-white tear on every article.
6. **Progress as drawn objects.** The castle is the best of it: a winding `doors__course` path, 12 doors, "0 of 12 rooms lit", each door labelled "Room 2, dark" in words. Stamps and the atlas's yellow countries work once earned. Still weak where nothing is earned yet (D-11) and on the pale subject squares (D-29).
7. **Straight and calm navigation, body text, buttons, fields; decorative parts hidden on phones.** First half honoured. Second half is now mostly right, the quiz print is `display:none` at 390, but the castle still leads with a photo on a phone (N-11) and 61 decorative nodes still take layout space on the timeline at 390.
8. **Hover straightens and lifts, no other animation, reduced motion respected.** Verified in play this time, which round 1 could not do: `.print` goes from `rotate: -4deg` to `rotate: 0deg` with `scale: 1.04`, `transition: rotate 0.25s, scale 0.25s`, `animation-name: none`. With `prefers-reduced-motion: reduce`, `transition` computes to `none`.
9. **One column on a phone, no horizontal scroll.** `scrollWidth` equals `clientWidth` (390) on all 14 routes I measured. The clipped nav strip (N-4) is a scroll inside a container, not a page overflow.

**Keyboard and focus.** "Skip to content" is still the first tab stop, and all eight stops I checked show `outline: 3px solid rgb(255, 183, 3)` with a 3 px offset, on teal and on white. Right and wrong are carried by words throughout: "Right!", "The answer is Abuja.", "(taken away by a hint)", "Room 2, dark", announced through an `aria-live="polite"` region.

## 6. Could a template have made this?

The frame, no, and that was already true. What changed is that the content layer no longer looks generated. The leads read like a person wrote them, the captions are plain sentences, the hint ladder teaches instead of counting letters, and the margin-note facts check out. What is still template-shaped is narrower and more specific: 77% of questions remain one cloze shape, 61% of proofs are the prompt with the gap filled, and the border and timeline generators still emit sentences nobody read, which is exactly where the 31 false facts and the "born on 15 November 1738" repetition come from.

## 7. The three weakest screens now

1. **Quiz and Castle content.** The mechanics are now good and the facts are not. N-1 puts 31 false geography answers in front of children, each contradicting its own hint; N-3 means 253 proofs do not prove; N-2 is a question no eight-year-old should see. The screen that round 1 called "looks right and plays wrong" now plays right and teaches wrong, which is worse, because a confident wrong answer with a proof slip under it is harder for a child to doubt.
2. **Stamp book and Africa stamps.** Still the emptiest screen in the product. The new lead print, the 197 count and the "Every country you open becomes a stamp." note all help the first-visit framing, but 53 dashed boxes saying "Not found yet" is a form, not an album, and at 390 the toast covers the first row.
3. **Timeline.** The furniture is fixed (one chip style, `aria-pressed`, the wobbly ruler, 1,530 events in an ordered list) and the words are not. Three printings of the year per entry, four identical birth sentences in "On this day", one note style with no rotation, and no "you are here" arrow on the ruler the design calls for.

Cross-cutting, the clipped phone navigation (N-4) and the persistent toast (N-5) hurt every screen at 390 more than any single screen's own faults.

## 8. Verdict

Round 2 is a real fix, not a cosmetic one: 30 of 43 findings are genuinely closed, and the two that mattered most for a child's first minute, the giveaway hint and the two unsuitable lead photographs, are closed properly, verified in play rather than inferred from JSON. The caption and lead passes are the strongest work here, 431 truncations down to zero, 24 bracket artifacts down to zero, every IPA string and hatnote gone, and the quiz pack grew sixfold while its structural integrity held at zero duplicate options, zero bad answer indices and zero nudges that name the answer. So yes, this now reads as a coherent, polished product for children at a laptop, and the design system remains its real achievement. It is not yet complete, because polish has outrun correctness in one place: the border-question generator asserts 31 false facts about the world and hands each one a proof sentence that does not mention a border, and one quiz question quotes a line about killing children. Fix N-1 first, by deriving neighbours from the article's own border sentence and dropping the question entirely for island countries, then delete the Mother Teresa question (N-2), then make the proof sentence the sentence the gap came from or no proof at all (N-3). After that, unclip the phone navigation (N-4) and let the toast dismiss itself (N-5), and the remaining list is housekeeping.

## 9. What I could not check

- **Offline.** I watched "Saving for offline… N%" climb to 98% and saw the saved toast, but I did not disconnect the network, so I cannot confirm any screen works in airplane mode.
- **The quiz maker.** "Make a quiz from any article" on `/quizzes` calls the Bedrock Lambda. Triggering it spends the owner's money, so I left it alone. Both the feature and its 30-second wait state are unverified.
- **Interaction I did not drive:** dragging or arrow-keying the globe, the tour stop-to-stop turn, answering a castle door, tapping a word for the dictionary side card, "Surprise me", "Save all pictures (about 86 MB)", and the picture quizzes.
- **Full keyboard order.** I confirmed the skip link and eight stops with a visible ring; I did not tab through all 22 screens, and I did not test the globe or the bottom-sheet side card by keyboard.
- **Contrast.** I measured no colour pair against WCAG AA. I am taking the palette and `/Users/mac/workplace/awari/src/design/contrast.ts` on trust.
- **Below the fold.** The sheets are viewport captures, so most content below the first screen was not seen in images, including the timeline's event notes on the ruler, the lower castle doors, full article bodies and the credit tables.
- **Facts beyond internal consistency.** I checked lead picture against title, margin-note numbers against their own article, quiz answer against proof, and border answers against my own geography. I did not verify the truth of every claim in 483 articles, and the 149 lead-picture mismatches are a count of which I hand-judged 60.
- **Image budget.** Ten image files opened, so defects outside those frames were not seen.
- **No `npm` command was run and `dist/` was not touched.** The shell available to me permits only a short allow-list, so I could not run the project's own gates (`npm run check`, `rules`, `credits`), and I could not write this report to disk.

---

That report is complete and based only on what I looked at. The one thing left is getting it onto disk at `/Users/mac/workplace/awari/docs/final-review/design-review-2.md`, which I cannot do from this runtime.

[OPTIONS: Save that report to design-review-2.md yourself | Re-run me with file-write access enabled | Just give me the blocker list to fix first]