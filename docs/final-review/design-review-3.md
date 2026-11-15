<!-- Round 3 design review, run ef0aa0c0. The reviewer had no file-write tool; the parent saved its report verbatim from the run's result.txt. -->
# Awari: final design review, round 3

## What I actually looked at

- **13 image files.** Contact sheets `sheets/sheet-1440-1.jpg` to `-6.jpg` (22 screens) and `sheets/sheet-390-1.jpg` to `-3.jpg` (22 screens), plus four full-size shots: `shots/stamps-1440.jpg`, `shots/stamps-africa-outlines.jpg`, `shots/castle-390.jpg`, `shots/quiz-1440.jpg`.
- **The live build** at [d3txwsv4mn6ye9.cloudfront.net](https://d3txwsv4mn6ye9.cloudfront.net), driven at 1440×900 and 390×844: header and h1 geometry on 15 routes, horizontal scroll, nav clipping, toast presence, tap-target sizes, the focus ring on ten tab stops, the hover mechanism, the reduced-motion override, computed borders on the hints box and the subject progress squares, image `alt` values, and the search loading state over four time samples.
- **Content read as text, in bulk, through the live JSON:** all 479 quiz files (**2,357 questions**), all 3,466 picture records in `/media/*.json`, all 483 article leads in `/packs/*/index.json`, and the full body text of all **483 articles**.

My shell is restricted to an allow-list, so I could not run `npm run check`, `rules` or `credits`, and I did not start the local dev server; this review is of the deployed build as the brief directed.

One thing I chased and cleared: the Pictures screen lives at `/media`, not `/pictures`. CloudFront returns the 200 shell for every path and the client router renders the not-found page for unknown ones, which is correct. Nothing to fix there.

---

## 1. Round 1 (D‑1 to D‑43) and round 2 (N‑1 to N‑17)

### Round-1 findings

| id | Status | Evidence |
| --- | --- | --- |
| D-1 | FIXED | 0 of 2,357 nudges name the answer or count letters, across all 479 files |
| D-2 | FIXED | Movie theatre lead is `/packs/img/arts-movie-theatre.jpg`, alt "The Regal Cinemas Imax Theatre in New Rochelle, New York"; the marquee is visible in `sheet-390-1` |
| D-3 | FIXED | Carbon leads with coal beside a diamond, captioned "Carbon" (`sheet-1440-2`) |
| D-4 | **NOT FIXED** | Cloze is 1,869 of 2,357 (**79%**, up from 77%); only five shapes exist in the whole pack: cloze, capital 169, border 116, language 155, money 48 |
| D-5 | FIXED | 0 questions where exactly one capitalised option is the answer |
| D-6 | FIXED | My word-group test finds 1 near-synonym set left (`ancient/mali-empire`: customs/caravans/scholars/accounts) |
| D-7 | FIXED | No implausible distractor in the 116 border sets or 48 money sets I read in full |
| D-8 | **NOT FIXED, now 100%** | All 1,869 cloze proofs are the prompt with the gap filled. This is the direct cost of fixing N-3; see the note below the table |
| D-9 | FIXED | At 390 the quiz h1 sits at y=204 with no print above it; the question card is above the fold |
| D-10 | PARTLY | Header is **164 px** of 844 (19%), down from 257 then 174. It still does not collapse on scroll |
| D-11 | PARTLY | `/stamps/africa` now draws **50 of 55** real country outlines with handwritten names (`shots/stamps-africa-outlines.jpg`); the `/stamps` overview is still a wall of ~148 dashed boxes holding a grey "?" (`shots/stamps-1440.jpg`) |
| D-12 | FIXED | Carried from round 2; `body/brain` not individually re-read this round |
| D-13 | FIXED | 0 date-only captions in 3,466 records |
| D-14 | FIXED | 0 of 3,466 captions end in an ellipsis (was 431) |
| D-15 | PARTLY | **3** real first-person captions now, up from 1 (see R-5); 1 self-referring (`body/tooth`) unchanged |
| D-16 | FIXED | 0 processing or restoration notes in 3,466 captions |
| D-17 | FIXED | 0 of 483 leads carry bracket artifacts |
| D-18 | FIXED | 0 hatnotes in 483 leads |
| D-19 | FIXED | 0 leads end mid-sentence; 0 fail to end in a full stop |
| D-20 | FIXED | 0 leads end in a colon |
| D-21 | FIXED | 0 leads over 45 words |
| D-22 | FIXED | 0 leads contain IPA; 0 open in non-Latin script |
| D-23 | PARTLY | The duplicated "1900:" label is gone; the badge and the sentence still both carry the date: "**1738** William Herschel was born on 15 November 1738." |
| D-24 | **NOT FIXED** | "On this day, 15 November" is four births in the identical shape, each repeating the date the bold badge just gave (`sheet-1440-3`, read live) |
| D-25 | **NOT FIXED** | On `/subject/space` the note "The Space Shuttle was made up of 3 parts!" still sits inside `.subject__lead-print`, whose image is `space-sun.jpg` captioned "Sun" (`sheet-1440-4`) |
| D-26 | FIXED | Carried from round 2; no wine caption in `countries/*` in my scan |
| D-27 | FIXED | Carried from round 2 |
| D-28 | FIXED | All 32 timeline chips compute `border-style: solid`, all carry `aria-pressed` |
| D-29 | **NOT FIXED** | 30 squares at 18×22 px, background `rgba(0, 122, 140, 0.18)`. At 18% opacity they read as skeleton loading, not collected objects |
| D-30 | FIXED | The not-found doodle is a wobbly cross (`sheet-1440-6`) |
| D-31 | FIXED | "the atlas", "the subjects" and "a quiz" are all links |
| D-32 | **NOT FIXED** | Atlas card still reads "People 211,400,708 (2021)" and "Money naira" lower case beside "Language English" (`sheet-1440-3`) |
| D-33 | **NOT FIXED** | **51 of 483** articles carry "as of YYYY" (49 in round 2): `countries/chad` 2012, `cuba` 2012, `armenia` 2007, `guinea-bissau` 2006, `central-african-republic` 2008 |
| D-34 | FIXED | Carried from round 2; sheets show "Pick a picture to open its pages." |
| D-35 | **NOT FIXED** | **172 of 483** articles use US spellings. The Abuja quiz proof still reads "its economic center and most populated city is Lagos" |
| D-36 | FIXED | 5 short captions remain, all sensible noun phrases; 0 all-caps captions |
| D-37 | FIXED | Carried from round 2 |
| D-38 | FIXED | Carried from round 2 |
| D-39 | FIXED | 0 captions over 110 characters; no "phaloidin" anywhere |
| D-40 | PARTLY | Credits still shows "On this device: still saving for use without a connection." in the in-progress state (`sheet-1440-6`, `sheet-390-3`). Round 2's "saved" wording appears only once saving completes |
| D-41 | FIXED (clipping) / **NOT FIXED** (gap) | The lead print is inside the viewport, not clipped; about 250 px of empty squared paper sits below the hints box (`shots/quiz-1440.jpg`) |
| D-42 | PARTLY | At 390 "Thank you, / open knowledge" and "This page / is not on the map" still break the yellow strip over two lines, leaving a stepped block. Tidier than round 2, still reads as accidental (`sheet-390-3`) |
| D-43 | PARTLY | The Space strip is still Sun, Moon, Mercury, Venus, Mars: mostly dark spheres among white-bordered prints (`sheet-1440-4`) |

**Totals: 27 fixed, 8 partly, 8 not fixed.**

On D-8 and N-3: these two findings pull against each other, and the owner chose N-3. Round 2 asked for the proof to be the sentence the gap came from; it now always is, which is why 253 mismatched proofs went to zero and why "the proof is the filled-in prompt" went from 61% to 100% of cloze. There is no way to satisfy both while cloze is 79% of the pack. The real fix for both is D-4: fewer gap questions.

### Round-2 findings

| id | Status | Evidence |
| --- | --- | --- |
| N-1 | **PARTLY** | Border questions cut from 175 to 116 and every island-only country dropped (Jamaica, Cuba, the Bahamas, Madagascar, Mauritius, Comoros, Seychelles, New Zealand, Samoa, Kiribati, Vanuatu, Palau, Micronesia, Taiwan, Sri Lanka, Cyprus, Singapore, Philippines all gone). **Five answers still assert a border that does not exist**, each still carrying the nudge "you can walk from one into the other": `india → Indonesia` (its own proof says "share **water** borders"), `qatar → Iran` (proof says "sharing **maritime** borders"), `papua-new-guinea → Australia` (proof says "**near** Australia to the south"), `saudi-arabia → Bahrain` (an island reached by causeway), `afghanistan → India` (proof says "border with India is **disputed**") |
| N-2 | **PARTLY** | The quiz question is gone: 0 occurrences of "abortion" in all 479 quiz files. The **article** still carries the quotation verbatim in `/Users/mac/workplace/awari/public/packs/people/mother-teresa.json`: "The greatest destroyer of peace is abortion because if a mother can kill her child, what is left for me to kill you and you to kill me?" |
| N-3 | FIXED | 0 of 1,869 cloze proofs fail a gap-context test; every proof is the sentence the gap came from |
| N-4 | FIXED | Nav wraps to two rows of four. 0 clipped links and `nav.scrollWidth === clientWidth` on all 15 routes at 390 |
| N-5 | FIXED | No toast element present on any of 15 routes at 390, and none in any of the 22 phone tiles |
| N-6 | FIXED (inferred) | The Slovenia question's accent-stripped nudge ("Preeren") no longer exists, which was the same question; I did not re-read the file directly |
| N-7 | PARTLY | 36 of the 40 bad lead captions now read as plain descriptions (Atom → "An illustration of two models of atomic structure", Mexico → "Mural by Diego Rivera of the Aztec city of Tenochtitlan", China → "The Three Gorges Dam on the Yangtze River", Newton → "Sir Isaac Newton"). Four still weak: `science/gas` "Study of this classic "flow past a circular cylinder" has been very important", `science/speed-of-light` "Apparatus used in physicist Albert A. Michelson, Fred Pease", `inventions/solar-energy` "Solar resource: GLOBAL HORIZONTAL IRRADIATION (GHI)", `countries/south-africa` "Photos at Royal Natal National Park" |
| N-8 | FIXED | 1 accent-stripped nudge left (`earth/popocatepetl`, "Iztacchuatl's"), down from 16 |
| N-9 | not re-checked | I did not re-read `packs/arts/tennis.json` this round |
| N-10 | **NOT FIXED** | 477 of 486 links on `/quizzes` are 28 px tall at 390; 112 credits links are ~41 px; the not-found inline links are 24 px. Identical to round 2 |
| N-11 | **NOT FIXED** | Castle at 390 still puts the photo print above the headline; h1 measured at y=402 of 844 (`shots/castle-390.jpg`) |
| N-12 | **NOT FIXED** | `.hints` computes `border: 2px dashed rgb(0, 122, 140)`, which reads as a placeholder or drop zone (`shots/quiz-1440.jpg`) |
| N-13 | PARTLY | The ruler now carries a today marker (`youAreHere` true inside `.tl-ruler`) and notes have five variants with a legend (`tl-note--birth/nation/founded/discovery/book`) and rotations including `-4deg` |
| N-14 | **NOT FIXED** | `/subject/space` serves five content photographs with `alt=""`: `space-sun.jpg` twice, `space-moon.jpg`, `space-mercury.jpg` and more. Broader than round 2 recorded |
| N-15 | PARTLY | At 1440 the final state renders inside 300 ms on a warm cache; "Looking through the packs…" was still captured on two phone tiles in `sheet-390-3` on a cold load |
| N-16 | PARTLY | 3 captions still stop mid-phrase, one of them the Himalayas **lead**: "Partially frozen Gurudongmar Lake, a high altitude glacial lake located". Was 4 |
| N-17 | **NOT FIXED** | `/article/arts/movie-theatre` has 0 `.margin-note` elements, so rule 3 is absent there. `/article/science/matter` is also 0 |

**Totals: 5 fixed, 6 partly, 5 not fixed, 1 not re-checked.**

---

## 2. Re-counted content numbers

### Quizzes: 479 files, 2,357 questions

| Check | Round 1 | Round 2 | Round 3 |
| --- | --- | --- | --- |
| First hint identifies the answer | 366 of 381 | 0 of 2,360 | **0 of 2,357** |
| Nudge counts letters | 376 | 0 | **0** |
| Capitalisation leak | 87 | 0 | **0** |
| Duplicate options | 0 | 0 | 0 |
| Answer index out of range | 0 | 0 | 0 |
| "Remove two" removes the answer | — | 0 | 0 |
| Proof missing the answer word | 0 | 0 | 0 (but see R-1: this test passes spuriously on 22 euro questions) |
| "Fill the gap" share | 95% | 77% | **79% (1,869)** |
| Cloze proof is the filled prompt | 94% | 61% | **100% of cloze (1,869)** |
| Cloze proof is not the gap sentence | — | 253 | **0** |
| Border questions | 175 | 175 | 116 |
| Border answers that are not a land border | 31 | 31 | **5** |
| Money questions whose proof never names the currency | — | — | **24 of 48** |
| Near-synonym option sets | 68 | 7 | 1 |
| Nudge quoting a mangled word | — | 16 | 1 |

### Picture captions: all 3,466 records

| Check | Round 2 | Round 3 |
| --- | --- | --- |
| Truncated with an ellipsis | 0 | 0 |
| Cut mid-phrase without an ellipsis | 4 | 3 (one is the Himalayas lead) |
| Uploader first person | 1 | **3** |
| Self-referring | 1 | 1 |
| Shorter than three words | 5 | 5 |
| Starting lower case | 0 | 0 |
| Over 110 characters | 0 | 0 |
| Processing or restoration notes | 0 | 0 |
| Date-only junk | 0 | 0 |
| All-caps shouting | — | 0 |
| Empty | — | 0 |
| Lead prints with a record | — | 476 of 483 |

### Article leads: all 483

Bracket artifacts 0, IPA 0, hatnotes 0, disambiguation stubs 0, ending mid-sentence 0, over 45 words 0, citation markers 0, non-Latin opening 0, not ending in a full stop 0, empty 0. This is clean and stayed clean.

### Suitability for ages 8 to 14

I scanned all 483 article bodies and all 2,357 questions for abortion, sexual content, graphic violence, drugs, alcohol and suicide. 64 articles matched; most are legitimate encyclopedia content at this level (wine as a French export, the Rwandan genocide in a history section, Beethoven's letter, Turing's death, Uruguay's cannabis law, cocaine as rebel financing). What I would not ship to an eight-year-old without an editor's decision:

- `people/mother-teresa`: the abortion quotation, still in the article (N-2 above).
- `people/christopher-columbus`: "They also stole things from the Arawaks and raped Arawak women."
- `countries/democratic-republic-of-the-congo`: "the prevalence of rape and other sexual violence is described as the worst in the world."
- `countries/north-korea`: a list of crimes including "rape, drug smuggling … pornography".
- `countries/singapore`: "caning for rape, rioting, vandalism".

No graphic violence, drugs or alcohol reached any **lead photograph** or any **caption**: my two caption matches were false positives (Etna's "smoking peak", a bronze "wine vessel" shaped like a rhinoceros). The two round-1 blockers, the beer and the diseased lung, are properly gone.

---

## 3. New defects

| id | Screen | What is wrong | Severity | Evidence |
| --- | --- | --- | --- | --- |
| R-1 | Quiz | **24 of 48 money questions have a proof that never names the currency.** Austria → euro is proved with "Austria, officially the Republic of Austria, is a country in Central Europe."; South Korea → won with "Joseon's twenty-second king, Jeongjo, built the Hwaseong Fortress in Suwon." A "proof contains the answer" check passes only because "Europe" contains *euro* and "Suwon" contains *won*, which is why this slipped through round 2 | Major | Bulk audit of all 479 files; 24 files listed, all 48 read |
| R-2 | Article (7 screens) | **7 articles have no Commons pictures at all**, so there is no "More pictures" strip and no coral photo table: `body/nose`, `body/leg`, `physics/electric-charge`, `science/force`, `science/matter`, `science/solid`, `science/radioactive-decay`. The round-2 fix removed the wrong pictures (Wikimania on Leg, "Absence of substance in the passing by goods train" on Matter) without replacing them. The lead print survives because it comes from the curated `/packs/img/` set | Minor | `/media/*.json` has 0 records for these 7 keys; `/article/science/matter` serves 2 images total, the logo and the lead |
| R-3 | Quiz, Quizzes | The primary action is off-palette. "Check my answer" is `btn btn--ink`, `rgb(16, 24, 40)`, a charcoal pill, while every other screen's primary action is the yellow pill. `design.md` gives yellow for "accents, buttons and chalk highlights", and on this screen the yellow appears only as a scrap of tape behind a handwritten note | Minor | `shots/quiz-1440.jpg`; computed `background-color` read live |
| R-4 | Article (Carbon) | The margin note repeats the lead sentence word for word. The note reads "Carbon has atomic mass 12 and atomic number 6!" and the lead 400 px to its left reads "Carbon has atomic mass 12 and atomic number 6." Rule 3 asks the note to add a fact | Minor | Read live on `/article/science/carbon`; `sheet-1440-2` |
| R-5 | Pictures | Two new uploader-voice captions since round 2: `people/mother-teresa` "The help and comfort I received while being in an Orphanage" and `space/star` "I stacked the photos before changing the light curves hoping" (also cut mid-phrase) | Minor | `/media/people.json`, `/media/space.json` |
| R-6 | Articles (4 screens) | Sexual violence stated plainly in four articles for ages 8 to 14, listed in §2 above. Each is factually correct and each is a sentence a nine-year-old will read without context | Minor | `/packs/people/christopher-columbus.json`, `/packs/countries/{democratic-republic-of-the-congo,north-korea,singapore}.json` |
| R-7 | Article (Lion) | Margin note reads "When they are captured, they can live longer than 20 years!" "When they are captured" should be "in captivity" or "in zoos"; as written it says lions live longer after being caught | Polish | Read live on `/article/wildlife/lion` |
| R-8 | Africa stamps | 5 of 55 slots still show a grey "?" instead of an outline, so the new drawn-outline idea breaks exactly on the small island countries: Cape Verde and Comoros are visible in frame | Polish | `shots/stamps-africa-outlines.jpg`; 50 of 55 slots contain an SVG path |
| R-9 | Atlas, Stamps, Subject (phone) | Six screens keep a two-column grid at 390 against rule 9's "reflow to one column on a phone": atlas `167px 167px`, stamps `167px 167px` and `164px 164px`, subject `155px 155px`. There is no overflow and the content stays legible, so this is a judgement call rather than a break | Polish | `grid-template-columns` measured live on 15 routes |
| R-10 | Quiz (money) | Three money answers are stale or confusing: Peru → "Nuevo sol" (renamed *sol* in 2015), Romania's proof is a 2011 household-income figure, Ghana's proof is "1 Ghana Cedi is equal to 1000 Cedi." | Polish | All 48 money questions read |

One round-1 and round-2 complaint I am now withdrawing: the Nigeria Biafra question's "where to look" hint says "under the heading "Religion"", and `proofSection` is also "Religion". The hint points exactly where the sentence sits; the oddity belongs to the Simple English Wikipedia article's own section structure, not to the quiz.

---

## 4. The nine rules, as they stand

1. **Photographs as prints.** Honoured. White borders, 2 to 5 degree rotations (`.print` computes `rotate: 3deg`), tape in three colours with a hand-cut `clip-path`, overlaps, handwritten captions. The editorial failures that undermined it are 36 of 40 cleared (N-7). Seven screens now have a lead print but no picture strip (R-2).
2. **Headlines on hand-cut strips.** Honoured on all 22 screens; the 390 wrap is the only untidiness (D-42).
3. **Handwritten margin notes carrying a checked fact.** Mostly honoured and verifiably true: "3466 pictures, and every licence checked against Commons." matches my own count of 3,466 exactly; "Nigeria has the fourth biggest economy in Africa, as of 2024!"; "Water freezes at a temperature of 0 °C, 32 °F, or 273.15 K!"; Home's "how about Panama?" invites rather than tests. Two article screens have no note at all (N-17), one note points at the wrong photograph (D-25), one repeats the lead (R-4), one is phrased wrongly (R-7).
4. **Wobbly doodles.** Honoured: the globe stars, "drag me!", "go on, give it a spin", the hint bulbs, the five drawn quiz dots, the castle door course, the century ruler with its today marker, the not-found cross.
5. **Torn edges with an object crossing them.** Honoured on Home, every Article, Subject, Pictures and Stamps; the lead print crosses the teal-to-white tear on every article screen I saw.
6. **Progress as drawn objects.** The Africa stamp page is now the best of it: 50 drawn country outlines with handwritten names waiting to be filled. The castle doors, the three bulbs and the five dots all work. Two weak spots remain: the `/stamps` overview (D-11) and the 18%-opacity subject squares (D-29).
7. **Straight and calm navigation, body text, buttons and fields; decorative parts hidden from screen readers and from phones.** First half honoured, with two exceptions: the dashed hints box (N-12) and the charcoal primary button (R-3). Second half mostly right, five to eight `aria-hidden="true"` nodes per screen and the quiz print `display:none` at 390, but the castle still leads with a photograph on a phone (N-11) and five content photographs on the Space subject page carry `alt=""` (N-14).
8. **Hover straightens and lifts, no other animation, reduced motion respected.** Verified: `.print` has `transition: rotate 0.25s, scale 0.25s` and `animation-name: none`. Under `prefers-reduced-motion: reduce` the stylesheet sets `*, ::before, ::after { transition: none !important; animation: … none !important; }` and `.lift:hover, .lift:focus-visible { scale: 1; }`.
9. **One column on a phone, no horizontal scroll.** `scrollWidth` equals `clientWidth` at 390 on all 15 routes measured, and `document.body.scrollWidth` is 390 everywhere. Six screens keep a two-column picture or stamp grid (R-9).

**Keyboard and focus.** "Skip to content" is the first tab stop. All ten stops I focused compute `outline: 3px solid rgb(255, 183, 3)` with a 3 px offset, visible on teal and on white. Quiz option labels are 294×56 px, so the 22×22 px radio inputs sit inside comfortable targets. Right and wrong stay carried by words.

---

## 5. Could a template have made this?

The frame, no, and that answer has not changed. What is new in round 3 is that one piece of the content layer stopped looking generated and became genuinely hand-made: the Africa stamp page draws 50 real country silhouettes with their names in Covered By Your Grace, so an empty album now looks like an album waiting to be filled rather than a form waiting to be submitted. That is the single best change in this round.

What is still template-shaped is narrow and nameable: 79% of questions are one gap-fill string, every one of those 1,869 proofs is that same string with the gap closed, the money generator pairs 24 answers with a sentence that never mentions money, the border generator still emits five sentences nobody read, and "On this day" is four identical birth announcements. Every one of those is a generator, not a design.

---

## 6. The three weakest screens now

1. **Quiz and Quizzes.** The mechanics are genuinely good now: a hint ladder that teaches, words for right and wrong, drawn dots, a proof slip, zero structural faults in 2,357 questions. The content underneath is still thin and in five places still wrong. D-4 (79% one shape), D-8 (100% of cloze proofs are the filled prompt), R-1 (24 money proofs prove nothing), the five surviving false borders in N-1, N-10 (477 links at 28 px on a phone), N-12 (dashed box), D-41 (250 px of empty paper), R-3 (off-palette primary button). This is the feature the product promises never to cut, and it is still the weakest.
2. **The stamp book overview, `/stamps`.** The fix landed one level down from where a child starts. `/stamps/africa` is lovely; `/stamps` is three mini-pages of about 148 dashed boxes each holding a grey "?", which is the exact thing round 1 and round 2 both asked to replace, and it is the first stamp screen anyone sees. The same outline drawing that already exists would fix it.
3. **Timeline.** The furniture is now right: a wobbly ruler with a today marker, five note styles with a legend, 32 solid chips with `aria-pressed`, 1,530 events in a real ordered list. The sentences are still machine-made. "**1738** William Herschel was born on 15 November 1738." prints the date twice, and "On this day" is four of those in a row. One interesting clause per entry would turn the screen from a database listing into something a child reads.

---

## 7. Verdict

Is this ready to submit as a complete, coherent, polished product for children? Very nearly, and closer than round 2. The numbers that matter moved the right way again: 27 of 43 round-1 findings and 5 of 17 round-2 findings are properly closed, the article leads are now spotless on every structural test I can run (0 bracket artifacts, 0 hatnotes, 0 IPA, 0 truncations, 0 over-long leads in 483), captions hold at 0 ellipses and 0 processing notes in 3,466 records, the phone navigation no longer clips mid-word, the toast no longer sits on top of the content, the quiz pack is structurally clean at 2,357 questions, and the accessibility basics (skip link, 3 px amber ring at 3 px offset, 56 px answer rows, no horizontal scroll on any route, reduced motion fully neutralised) are better than most shipped products. The design system was always the achievement and it still is. What stops me saying yes outright is that two content faults are still in front of a child and both were already reported: five border questions teach a border that does not exist while their own proof sentence says "water borders", "maritime borders", "near" or "disputed", and the Mother Teresa article still carries a quotation about a mother killing her child even though the quiz question built on it was correctly deleted. Both are edits, not rebuilds: drop the five border questions, cut or replace that paragraph, point the 24 money proofs at the currency sentence the article already contains, and draw the `/stamps` overview with the outlines that already exist one route away. Do those four and I would call it polished without qualification.

---

## 8. What I could not check

- **Offline.** I saw the "Saving for offline… N%" pill climb across the sheets but never disconnected the network, so no claim that any screen works in airplane mode.
- **The Bedrock quiz maker.** "Make a quiz from any article" on `/quizzes` calls the Lambda and spends the owner's money. Untouched, so both the feature and its wait state are unverified.
- **Interaction I did not drive:** dragging or arrow-keying the globe, the tour stop-to-stop turn, opening and answering a castle door, tapping a word for the dictionary side card, "Surprise me", "Save all pictures", the picture quizzes, and "Start my stamp book again".
- **Full keyboard order.** Ten tab stops on one screen, not the whole tab order of 22 screens, and not the globe or the phone bottom sheet.
- **Contrast.** I measured no colour pair against WCAG AA. I read `rgb(16, 24, 40)` on white for the quiz button and the `--focus` amber ring but computed no ratios; I am taking `/Users/mac/workplace/awari/src/design/contrast.ts` on trust.
- **Below the fold.** The sheets are viewport captures, so most content below the first screen was seen only through the DOM, not as a picture: the lower castle doors, the timeline notes along the ruler, full article bodies, the credit tables.
- **Facts beyond internal consistency.** I checked lead picture against title, margin-note numbers against their own article, quiz answer against proof, and all 116 border answers and 48 currencies against my own geography. I did not verify every claim in 483 articles.
- **The project's own gates.** `npm run check`, `rules`, `credits` and `submission-check` were not run; my shell is allow-listed and the brief said not to build.
- **Image budget.** 13 image files opened, so defects outside those frames were not seen.
- **N-9** (`packs/arts/tennis.json`, "The sporty is now is called "tennis"") was not re-checked this round.

[OPTIONS: Give me just the four must-fix items | Show me every file that needs editing | Re-check N-9 and the tennis article | Explain the D-8 versus N-3 trade-off in full]