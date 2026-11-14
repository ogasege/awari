# Awari: final design review

Reviewed 14 November 2026 against .kiro/steering/design.md (the nine rules, the Lagoon
palette, the type) and the reference in design/ (home.html, home.png, screens/README.md).
Read-only review: this file is the only thing I wrote.

## What I actually looked at

- Contact sheets: docs/final-review/sheets/sheet-1440-1.jpg to sheet-1440-5.jpg (20 screens)
  and sheet-390-1.jpg to sheet-390-3.jpg (20 screens on a phone).
- Full-size shot: docs/final-review/shots/timeline-1440.jpg.
- The live app at https://d3txwsv4mn6ye9.cloudfront.net, at 1440x900 and 390x844, for things
  a still image cannot answer: the empty-search state, header height, tap-target sizes,
  horizontal scroll, the focus ring, the hint ladder in play, and the reduced-motion rule.
- Content read as text, not images: all 3,720 picture records in public/media/*.json, all 483
  article leads from public/packs/*/index.json, 77 quiz files (381 questions) from
  public/packs/quizzes/, and the full text of 66 articles.

Sample sizes are larger than the brief asked for because the packs are fetchable in bulk:
3,720 captions (not 200) and 483 leads (not 100).

## 1. The first minute for a new visitor

At 1440 this works. Home leads with "What will you discover today?" on hand-cut strips, one
plain sentence that says what Awari is ("An encyclopedia you explore by place, by date, or by
playing. It keeps working when the internet does not."), and two buttons: Spin the globe,
Surprise me. The globe sits to the right with three handwritten facts and a "go on, give it a
spin" note pointing at it. A child knows what this is and what to press. Nothing to fix.

At 390 the same content takes too long to arrive. Measured on the live site: the header is
257 px tall on an 844 px viewport, which is 30% of the screen before any content. It holds the
logo, the offline pill, eight navigation links on two rows, and a search field, and none of it
collapses. The h1 starts at y=277, the explanatory sentence at y=472, and "Spin the globe" at
y=598. The globe itself begins at y=776 and is cut off. So on a phone the first thing a child
sees is a wall of navigation, and the one object that invites a tap is barely on screen.

The quiz screen is worse on a phone, and it matters more because the quiz is a headline
feature. On /quiz/countries/nigeria at 390 the decorative Lagos print renders at y=14, the
"Nigeria quiz" headline at y=515, and the first question at y=718 of 844. The child must
scroll past a photo they did not ask for to reach the task. Design rule 7 says decorative
things are hidden on phones where they would crowd the content; here the print is the first
thing on the page.

## 2. Consistency across screens

The design system itself is consistent and it is the strongest thing in this submission. Every
screen uses the same header, the same two-line headline on a white strip plus a yellow strip
with a hard offset shadow, the same teal board to white paper torn edge, the same coral photo
table, the same handwritten teal margin note in the top-right corner. Body text is always dark
on white and never rotated. Buttons are the same yellow pill and white outline pill everywhere.
Filters are ordinary toggle buttons. The atlas country picker is a native select. Credits sit
in a plain table. That is rule 7 honoured properly.

Specific inconsistencies and rough edges I can point at:

- Timeline has two rows of filter chips in two different styles: subject chips with a solid
  border, continent chips with a dashed border (confirmed live: button.timeline__chip with
  dashed border-style for "Everywhere", "Africa", "Asia", "Europe", "North America", "South
  America"). Nothing explains the difference, and dashed reads as disabled or unfinished. In
  both the 1440 and 390 sheets the dashed row is sliced by the fold, which makes it look like a
  loading skeleton that never resolved.
- The Space subject page progress ("0 of 30 quizzes done in this subject.") is a grid of very
  pale teal squares that reads as skeleton loading, not as collected objects. Rule 6 asks for
  progress as drawn objects; the stamps and castle doors do this well, these squares do not.
- The stamp book is a wall of placeholders. At 1440, continent pages show grids of small grey
  "?" boxes; the Africa page shows seven large dashed boxes across, each reading "Not found
  yet". At 390 it is two per row. A child opening their stamp book for the first time sees an
  empty form, not an album.
- On the quiz screen at 1440 the question card sits left, the "3 hints left" box sits far right,
  and the space between them is empty; the lead print is clipped by the right edge.
- At 390 the yellow headline strip wraps onto two lines on Credits ("Thank you, open
  knowledge") and Not found ("This page is not on the map"), which leaves a stepped, ragged
  yellow block. It is survivable in a cut-paper style but it looks accidental rather than cut.
- Copy says "Tap" on desktop: Subjects at 1440 reads "11 subjects. Tap a picture to open its
  pages." and Atlas reads "Drag the Earth to turn it, then tap a country to visit."
- Article text mixes US spellings into a British-English app: countries/nigeria.json has
  "economic center" and "neighboring" while the interface says licence, colour and practise.

Tap targets and scrolling are fine, which I expected to be a problem and was not. Measured at
390: no horizontal scroll (scrollWidth 390, clientWidth 390); navigation links are 50 px tall;
only three interactive elements are under 44 px in any dimension (Atlas 39x50, Tours 42x50,
and the inline "spin the globe" link at 117x22 in the empty-search sentence).

Keyboard: there is a "Skip to content" link first in the tab order, and the focus ring is
3 px solid rgb(255,183,3), the --focus token, clearly visible on teal and on white.

## 3. Loading, empty, error and offline states

- The empty search state is good, and the contact sheet misled me about it. Both sheets show
  "Looking through the packs..." for the query zzqxjvk, which is the loading state caught
  mid-flight. On the live site the final state reads: "0 results for zzqxjvk. Nothing matched.
  Try a shorter word, or wander instead: spin the globe or pick a quiz." That is warm, useful
  and offers two ways out. Keep it. Worth noting that the search was still loading when the
  screenshots were taken, so the loading state is visible long enough to be photographed.
- Not found is good copy: "This page is not on the map" and "We looked in every drawer. Try the
  atlas, or head back to the start." Two faults: the doodle is a plain thin teal circle that
  reads as a loading spinner rather than a wobbly sketch (rule 4 asks for wobbly strokes,
  stars, arrows, small sketches), and "Try the atlas" is plain text, not a link, so the only
  way out is "Back to Home". The screen is also almost entirely empty at 1440.
- The offline indicator is honest and visible: a "Saving for offline... N%" pill in the header
  that climbs across screens, and a toast reading "Saved. Awari now works without a connection.
  Pictures beyond the lead photos are kept as you look at them." with a "Got it" button.
- Credits says "On this device: still saving for use without a connection." The phrasing is
  awkward for a child; "Still saving. Awari will work without the internet soon." is closer to
  the voice used elsewhere.

## 4. Copy audit

### Picture captions: all 3,720 records in public/media/*.json

| Check | Count |
| --- | --- |
| File names or file-name-like captions | 0 |
| Placeholder or developer words (undefined, NaN, null, braces, markup, coordinates) | 0 |
| Captions starting lower case | 0 |
| Captions over 110 characters | 0 |
| Non-English or non-Latin characters | 12 |
| Truncated with an ellipsis | 431 |
| ...of those, broken on a function word | 15 |
| Shorter than three words | 29 |
| Written in the uploader first person | 32 |
| Referring to themselves ("this image", "the above") | 17 |
| Date-only junk | 2 |
| Uploader processing notes (cropped, denoised, random) | 4 |
| Misspelt | 1 |

The good news is real: no file names, no markup, no undefined, nothing shouting NaN. My first
pass reported 36 placeholders and all 36 were my own regex matching "nan" inside Nantong and
Nandini; the tightened pass found zero. The licence and author fields are populated throughout.

The bad news is that 431 captions (11.6%) are cut off with an ellipsis, and the cut often lands
mid-phrase, so a handwritten caption under a print ends in the middle of an idea. Fifteen break
on a function word, which is the worst version of it.

### Ten worst captions

| # | Caption as written | File |
| --- | --- | --- |
| 1 | "Cropped, with artifacts removed, mild denoising/sharpening, and levels adjusted" (this is the LEAD print) | public/media/inventions.json, inventions/steamboat |
| 2 | "A plate of nachos with salsa sauce and a glass of beer" (LEAD) | public/media/arts.json, arts/movie-theatre |
| 3 | "Gross pathology of lung showing centrilobular emphysema characteristic of smoking" (LEAD) | public/media/science.json, science/carbon |
| 4 | "6/, Jun 19, 2013" | public/media/body.json, body/digestion and public/media/science.json, science/atom |
| 5 | "A random toad that I found on the ground" | public/media/wildlife.json, wildlife/frog |
| 6 | "Unbelievable, instead of sending my letter to Granada (Spain), USPS sent it to Grenada" | public/media/countries.json, countries/grenada |
| 7 | "Shiraz wine is the most famous wine previously produced in Iran" (in the Australia article) | public/media/countries.json, countries/australia |
| 8 | "NASA The dark region at the center of this image" (LEAD) | public/media/space.json, space/mercury |
| 9 | "Afghanistan countryside, this photo is not taken by me" | public/media/countries.json, countries/afghanistan |
| 10 | "Ambhibians in Ayyanmada cave" and "Common road" (for Bufo melanostictus, a toad) | public/media/wildlife.json, wildlife/frog |

Runners-up worth the same fix: "So exhausted, I collapsed" (body/sleep), "I noticed this
contrast between two smiles" (body/tooth), "Stonehenge on my birthday" (ancient/stonehenge),
"A4 PAPER" (inventions/paper), "Kenyan Landscapes" for a photo in the Mount Kilimanjaro article
(earth/mount-kilimanjaro, and Kilimanjaro is in Tanzania), "Abandoned Schoolhouse - Pripyat
Ghost Town - Chernobyl Exclusion Zone" in the Paper article (inventions/paper), and
"Postprocessed photo (fusion of two) of beta cells in pancreas stained by phaloidin+TRITC..."
(body/pancreas), which no nine-year-old can read.

These are Commons descriptions passed through without an editor. The fix is not more filtering,
it is a rule: if the caption is not a plain sentence about what the picture shows, fall back to
the article title plus the subject, and never show a processing note.

### Article leads: all 483 in public/packs/*/index.json

| Check | Count |
| --- | --- |
| Empty or stray bracket artifacts | 24 |
| Opening with non-Latin script | 41 |
| Containing IPA pronunciation brackets | 22 |
| Over 45 words | 27 |
| Not ending in a full stop | 10 |
| Ending mid-sentence | 3 |
| Wikipedia hatnotes instead of definitions | 2 |
| Disambiguation stubs | 2 |
| Citation markers left in | 1 |
| Placeholder or developer words | 0 |

The worst five leads, quoted exactly:

1. countries/cape-verde.json: "Cape Verde ( ()) or Cabo Verde ( (), ) (Portuguese: Cabo Verde,
   pronounced: [kabu verde]), officially the Republic of Cabo Verde, is an island country in
   Africa." The empty brackets are where audio and IPA templates were stripped. It should read
   "Cape Verde, officially the Republic of Cabo Verde, is an island country in Africa."
2. arts/muhammad-ali.json: "Not to be mistaken for the Muhammad Ali who became Muhammad Ali
   Pasha, Wali of Egypt and Sudan". That is a Wikipedia hatnote, not a lead. The child is told
   who this is not before being told who he is. It should read "Muhammad Ali was an American
   boxer and three-time world heavyweight champion."
3. science/energy.json: "Energy can mean various things:". A disambiguation stub ending in a
   colon, on a core physics topic. It should define energy in one sentence.
4. earth/mount-fuji.json: "Mount Fuji (Fuji-san) is the tallest mountain in Japan, at". The
   sentence stops at "at" because the height was inside a stripped template.
5. arts/basketball.json: "Basketball is a team sport where two teams (usually consisting of
   five players) + Bench players making up the rest of the roster. They play against each other
   on a basketball court it a rectangular playing surface consisting of four straight
   boundaries arranged into two pairs of parallel lines." There is a stray "+", and "court it a
   rectangular playing surface" is not a sentence. 49 words of it.

Also: science/iron.json opens "This article is about iron the metal. For the tool called iron,
see ironing."; countries/laos.json ends "is a country in Southeast Asia.[4]";
inventions/helicopter.json ends "A helicopter lifts up off"; and 41 leads open with a script a
child cannot read, for example countries/hungary.json: "Hungary (Hungarian: Magyarorszag
[IPA] ()) is a landlocked country in Southeastern Central Europe." The native name is
worth keeping; it belongs in the facts card, not in front of the first verb.

## 5. Content sanity

### Articles: lead picture against article (66 articles read in full, all 483 lead pictures checked by word overlap)

164 of the lead pictures share no significant word with their article title. Most of those are
fine (Ancient Egypt leading with "All Giza Pyramids in one shot" is correct). I inspected ten
by hand and these are genuinely wrong:

- body/brain: the lead is "NIST atom-based magnetic sensor, about the size of a sugar cube",
  chosen from File:Brain Sensor.jpg. The Brain article leads with a photo of laboratory kit. The
  same article carries "The official poster for the series second season", a television poster.
  Record in public/media/body.json.
- body/digestion: the lead is "The trap of a Venus fly trap, showing trigger hairs". Three
  pictures total, one of which is the date string in the table above.
- arts/movie-theatre: the lead is nachos and a glass of beer. Alcohol should not be the lead
  print on a screen built for eight to fourteen year olds, and it does not show a cinema. Three
  better pictures are already in the same record, including "A movie theater concession stand in
  Hiawassee, Georgia".
- science/carbon: the lead is a smoker emphysema lung. Not suitable as the first photograph a
  child sees on the Carbon article.
- arts/mask: the lead file is File:A Korean Mask.jpg but the caption reads "South Korean
  delegation at the 2009 Kamakura Matsuri", so file and caption disagree.
- arts/olympic-games: the lead shows the Tokyo 1964 Paralympic opening ceremony on the Olympic
  Games article.
- ancient/industrial-revolution: the lead is "A public lecture about a model solar system"
  (Wright of Derby, The Orrery), an astronomy painting for the Industrial Revolution.
- arts/jesse-owens: the lead is "US track team house at the 1936 Berlin Olympic Village", a
  building, on a biography.
- wildlife/frog: the lead is "A pair of common toads migrating in the foliage of the mixed
  forest". Toads on the Frog page.
- inventions/paper: the lead is "Textured craft card, in a variety of colours", which is card,
  not paper, while "Various products made from paper" sits unused in the same record.

Out-of-date or date-anchored facts, from the 66 articles read in full:

- Atlas facts card, Nigeria: "People 211,400,708 (2021)". Four years stale; Nigeria is about
  230 million. The year label is honest, but this is the flagship card on the Atlas screen.
  Also "Money naira" is lower case while "Language English" above it is capitalised.
- packs/countries/chad.json still says "as of 2012"; packs/space/voyager-1.json "as of 2018";
  packs/arts/olympic-games.json "as of 2004" plus "currently" and "recent";
  packs/countries/afghanistan.json mixes "as of 2004", "as of 2022" and "as of 2025" in one
  article.

### Quizzes: 77 files, 381 questions

This is the weakest content in the product, and it is the part the README sells hardest.

- 366 of 381 questions (96%) have a first hint that identifies the answer on its own. The nudge
  template is "It starts with the letter X and has N letters." With four options, exactly one
  ever matches. Verified in the running app, not just in the JSON: on /quiz/countries/nigeria I
  clicked "Give me a nudge" for "What is the capital city of Nigeria?" with options Nairobi,
  Freetown, Algiers, Abuja, and got "It starts with the letter A and has 5 letters." That is the
  answer. The product promises "hints that teach (nudge, where to look, two wrong answers
  removed)"; rung one of the ladder is a giveaway, and it is also a letter-counting word puzzle
  rather than anything about the subject. 376 of 381 nudges use this one template.
- 362 of 381 questions (95%) are "Fill the gap:" cloze. The only other shapes in the whole
  sample are "What is the capital city of X?", "Which of these countries shares a border with
  X?" and "Which language is an official language of X?". The castle, the subject pages and the
  article pages all funnel into the same single question type.
- 87 cloze questions leak the answer through capitalisation: exactly one option starts with a
  capital letter and it is the correct one. Examples from packs/quizzes/ancient/ancient-egypt.json:
  "Egyptians, religious, stone, built" and "structures, engineers, Pyramids, taxes"; from
  packs/quizzes/ancient/roman-empire.json: "Byzantine, romans, important, built". A child who
  cannot read the article still scores.
- 68 cloze questions have a distractor at least as good as the answer. The clearest is
  packs/quizzes/ancient/mali-empire.json: "For such a _____ empire, there are few written
  accounts of its greatness." with options prolific, richest, wealthiest, african, answer
  "prolific". "A prolific empire" is odd English and both "richest" and "wealthiest" fit better.
  Also packs/quizzes/ancient/ancient-egypt.json: "The afterlife was also very _____ to
  Egyptians" with earliest, important, world, stone, where only "important" is grammatical, so
  grammar answers the question instead of knowledge.
- Implausible distractors. packs/quizzes/countries/kenya.json asks "Which language is an
  official language of Kenya?" and offers "Zimbabwe Sign Language | Swahili | Xhosa | Bobo".
  packs/quizzes/countries/cameroon.json asks which country borders Cameroon and offers
  "Mozambique | Lesotho | Cape Verde | Central African Republic". packs/quizzes/countries/
  nigeria.json question 3 asks which country the Bakassi conflict involves and offers "Sri
  Jayawardenepura Kotte, Colombo" (a pair of capital cities, not a country), "Saint Lucia",
  "Serbia", "Cameroon".
- 360 of 381 proof sentences are the question with the gap filled in, so the promised "sentence
  from the article that proves it" tells the child nothing they have not just read.
- packs/quizzes/countries/nigeria.json question 4 is about the Biafra war, and its
  "where to look" hint says: "Look in the Religion part of the Nigeria article." Wrong place.

Nothing structural is broken: no duplicate options, no answer index out of range, no question
that contains its own answer text outside the cloze pattern, and every proof sentence does
contain the answer. The engine is sound; the questions are not.

### Timeline entries

Confirmed live on /timeline: the list is a real ordered list of 59 visible items and the wobbly
century ruler exists (svg.tl-ruler, 1000x150). The text is redundant. An entry renders as
"1900  1900: Jacques Prevert  Jacques Prevert was born on 4 February 1900." The year appears
three times and the name twice. "On this day, 14 November" has the same problem in a smaller
way, six times over: a bold year badge "1765" followed by "Robert Fulton was born on 14
November 1765." Five of the six entries are births with an identical sentence shape. For a
screen whose job is to make a child curious, the copy should carry one interesting clause:
"Robert Fulton, who built the first commercial steamboat, was born today in 1765."

## Findings

| id | Screen | What is wrong | Severity | Evidence |
| --- | --- | --- | --- | --- |
| D-1 | Quiz | First hint identifies the answer in 366 of 381 questions ("It starts with the letter A and has 5 letters." for Abuja) | Blocker | Clicked live on /quiz/countries/nigeria; packs/quizzes/*, 77 files |
| D-2 | Article (Movie theatre) | Lead print is "A plate of nachos with salsa sauce and a glass of beer": alcohol as the lead photo for ages 8-14, and it does not show a cinema | Blocker | public/media/arts.json, arts/movie-theatre, lead:true |
| D-3 | Article (Carbon) | Lead print is "Gross pathology of lung showing centrilobular emphysema characteristic of smoking" | Blocker | public/media/science.json, science/carbon, lead:true |
| D-4 | Quiz, Castle, Subject | 95% of all questions are one "Fill the gap:" template; three other shapes exist in 381 questions | Major | packs/quizzes/*, 362 of 381 |
| D-5 | Quiz | 87 cloze questions leak the answer by capitalisation (one capitalised option, always correct) | Major | packs/quizzes/ancient/ancient-egypt.json, roman-empire.json |
| D-6 | Quiz | 68 cloze questions have a distractor as good as or better than the answer ("For such a _____ empire": prolific vs richest, wealthiest) | Major | packs/quizzes/ancient/mali-empire.json |
| D-7 | Quiz | Implausible distractors: "Zimbabwe Sign Language" for an official language of Kenya; "Sri Jayawardenepura Kotte, Colombo" offered as a country | Major | packs/quizzes/countries/kenya.json, nigeria.json q3 |
| D-8 | Quiz | 360 of 381 proof sentences are the question with the gap filled, so the proof adds nothing | Major | packs/quizzes/*, all subjects |
| D-9 | Quiz (phone) | Decorative print at y=14 and a 257 px header push the first question to y=718 of 844; the core task starts below the fold | Major | Measured live at 390x844; sheet-390-1, row 2 tile 1 |
| D-10 | All screens (phone) | Header is 257 px of an 844 px viewport (30%): logo, offline pill, eight nav links on two rows, search field, none collapsing | Major | Measured live at 390x844; every tile in sheet-390-1 to 3 |
| D-11 | Stamp book, Africa stamps | Both pages read as empty forms: grids of grey "?" boxes at 1440, seven dashed "Not found yet" boxes across, two per row at 390 | Major | sheet-1440-4 bottom row; sheet-390-2 bottom row tile 4 |
| D-12 | Article (Brain) | Lead print is a NIST magnetic sensor "about the size of a sugar cube", picked from File:Brain Sensor.jpg; the article also carries a television series poster | Major | public/media/body.json, body/brain |
| D-13 | Article (Digestion) | Lead print is a Venus fly trap; a second picture is captioned "6/, Jun 19, 2013" | Major | public/media/body.json, body/digestion |
| D-14 | Pictures, all article strips | 431 of 3,720 captions are cut off with an ellipsis, 15 breaking on a function word ("protected on all...", "Pakistan is...") | Major | public/media/*.json, 11.6% of all records |
| D-15 | Pictures, all article strips | 32 captions in uploader first person ("A random toad that I found on the ground", "So exhausted, I collapsed") and 17 self-referring ("this photo is not taken by me") | Major | public/media/wildlife.json, body.json, countries.json |
| D-16 | Article (Steamboat) | Lead caption is a restoration note: "Cropped, with artifacts removed, mild denoising/sharpening, and levels adjusted" | Major | public/media/inventions.json, inventions/steamboat, lead:true |
| D-17 | Article leads | 24 leads carry empty bracket artifacts: "Cape Verde ( ()) or Cabo Verde ( (), )" | Major | packs/countries/index.json: cape-verde, andorra, bolivia, croatia, hungary, albania, algeria, austria, belize, estonia, grenada, iceland and 12 more |
| D-18 | Article leads | Two leads are Wikipedia hatnotes, not definitions: "Not to be mistaken for the Muhammad Ali who became Muhammad Ali Pasha"; "This article is about iron the metal." | Major | packs/arts/muhammad-ali.json, packs/science/iron.json |
| D-19 | Article leads | Three leads end mid-sentence: "is the tallest mountain in Japan, at"; "A helicopter lifts up off" | Major | packs/earth/mount-fuji.json, packs/inventions/helicopter.json |
| D-20 | Article lead (Energy) | Lead is a disambiguation stub: "Energy can mean various things:" | Major | packs/science/energy.json |
| D-21 | Article lead (Basketball) | Ungrammatical and 49 words: "(usually consisting of five players) + Bench players making up the rest of the roster" and "on a basketball court it a rectangular playing surface" | Major | packs/arts/basketball.json |
| D-22 | Article leads | 41 leads open with a script a child cannot read and 22 with IPA brackets before the first verb | Major | packs/countries/hungary.json, libya.json, bosnia-and-herzegovina.json, packs/earth/yangtze-river.json |
| D-23 | Timeline | Entries repeat the year three times and the name twice: "1900  1900: Jacques Prevert  Jacques Prevert was born on 4 February 1900." | Major | Read live from the ordered list on /timeline |
| D-24 | Timeline, On this day | Five of six entries are "X was born on 14 November YYYY." after a bold year badge that already says the year | Major | shots/timeline-1440.jpg, the cream card |
| D-25 | Subject (Space) | The margin note "The Space Shuttle was made up of 3 parts!" has its arrow pointing at a photograph of the Sun. Rule 3 says the arrow points at the thing | Major | sheet-1440-4, top-right tile |
| D-26 | Article (Australia) | Picture captioned "Shiraz wine is the most famous wine previously produced in Iran" sits in the Australia article | Major | public/media/countries.json, countries/australia |
| D-27 | Article (Mask) | Lead file is File:A Korean Mask.jpg but the caption reads "South Korean delegation at the 2009 Kamakura Matsuri" | Minor | public/media/arts.json, arts/mask |
| D-28 | Timeline | Two chip rows in two styles: subject chips solid, continent chips dashed, with no stated meaning; dashed reads as disabled or still loading | Minor | Confirmed live (button.timeline__chip, dashed); sheet-1440-3 and shots/timeline-1440.jpg bottom edge |
| D-29 | Subject (Space) | Quiz progress squares are pale enough to read as skeleton loading rather than collected objects | Minor | sheet-1440-4, "0 of 30 quizzes done in this subject." |
| D-30 | Not found | The doodle is a plain thin teal circle that reads as a loading spinner, not a wobbly sketch (rule 4) | Minor | sheet-1440-5, bottom-right tile |
| D-31 | Not found | "Try the atlas" is plain text, not a link; the only way out is "Back to Home" | Minor | sheet-1440-5 and sheet-390-3, bottom-right tiles |
| D-32 | Atlas | Facts card shows "People 211,400,708 (2021)", four years out of date, and "Money naira" is lower case while "Language English" is capitalised | Minor | sheet-1440-2, bottom-right tile |
| D-33 | Articles | Date-anchored facts left in: "as of 2012" (Chad), "as of 2018" (Voyager 1), "as of 2004" plus "currently" (Olympic Games) | Minor | packs/countries/chad.json, packs/space/voyager-1.json, packs/arts/olympic-games.json |
| D-34 | Subjects, Atlas | "Tap a picture to open its pages" and "then tap a country" shown at 1440 on a laptop | Minor | sheet-1440-4 top-left; sheet-1440-2 bottom-right |
| D-35 | Articles | US spellings inside a British-English app: "economic center", "neighboring" against the interface licence, colour, practise | Minor | packs/countries/nigeria.json |
| D-36 | Pictures, article strips | 29 captions under three words, some shouting: "A4 PAPER", "Opera cake", "Common road", "Kenyan Landscapes" | Minor | public/media/inventions.json, arts.json, wildlife.json, earth.json |
| D-37 | Article (Kilimanjaro) | A picture is captioned "Kenyan Landscapes"; Kilimanjaro is in Tanzania | Minor | public/media/earth.json, earth/mount-kilimanjaro |
| D-38 | Article (Paper) | Picture strip includes "Abandoned Schoolhouse - Pripyat Ghost Town - Chernobyl Exclusion Zone" | Minor | public/media/inventions.json, inventions/paper |
| D-39 | Article (Pancreas) | Caption unreadable for the audience: "Postprocessed photo (fusion of two) of beta cells in pancreas stained by phaloidin+TRITC..." | Minor | public/media/body.json, body/pancreas |
| D-40 | Credits | "On this device: still saving for use without a connection." is awkward for a child | Polish | sheet-1440-5, bottom-left tile |
| D-41 | Quiz (1440) | Wide empty gap between the question card and the "3 hints left" box; the lead print is clipped by the right edge | Polish | sheet-1440-2, top-left tile |
| D-42 | Credits, Not found (390) | The yellow headline strip wraps onto two lines and leaves a stepped, ragged block | Polish | sheet-390-3, tiles 3 and 4 |
| D-43 | Subject (Space) | The picture strip is four near-identical grey and white spheres on black, which reads as monotonous and dark among white-bordered prints | Polish | sheet-1440-4, top-right tile |

## The nine rules, screen by screen

1. Photographs as prints: honoured everywhere. White borders, 2 to 5 degree rotations, tape in
   three colours (tape--clear, tape--teal, tape--yellow), overlaps, handwritten captions. Home,
   Subjects, Tours, Castle wings and Pictures all do this well. The failures are editorial, not
   visual: D-2, D-3, D-12, D-13, D-16.
2. Headlines on hand-cut strips: honoured on all 20 screens, white strip over yellow strip at
   slightly different angles with a hard offset shadow. Only complaint is the wrap at 390 (D-42).
3. Handwritten margin notes: present on nearly every screen and most carry a checked fact or a
   real question ("3720 pictures, and every licence checked against Commons.", "Which of these
   happened on your birthday?", "who do you think lived in a castle like this?", "How many can
   you get without a hint?"). One note points at the wrong object (D-25).
4. Wobbly doodles: the globe stars and crosses, the "go on, give it a spin" arrow, the timeline
   chip arrow (svg.doodle.timeline__chip-arrow), the castle doors, the hint light bulbs, the
   drawn quiz dots, the century ruler (svg.tl-ruler). One exception, the Not found circle (D-30).
5. Torn edges with an object crossing them: honoured on Home (the globe print crosses into the
   coral band), Article (the lead print crosses the teal to white tear), Subject (the Sun print
   crosses), Pictures (prints cross into the coral table).
6. Progress as drawn objects: stamps, castle doors with yellow lights, three light bulbs for
   hints, five drawn dots for questions, discovered countries filled yellow on the globe. Good,
   with two weak spots: the empty stamp pages (D-11) and the pale subject squares (D-29).
7. Straight and calm navigation, body text, buttons, fields: honoured. Body text is never
   rotated, headings inside articles are straight, the atlas uses a native select, filters are
   ordinary toggles, credits are a plain table. The failure is the second half of the rule:
   decorative parts are marked aria-hidden="true" but 17 of them still take layout space at 390,
   and on the quiz and castle screens the decorative print comes before the headline (D-9).
8. Hover straightens and lifts, no other animation, reduced motion respected: I can confirm the
   mechanism exists in CSS and that @media (prefers-reduced-motion: reduce) sets transition:
   none !important and neutralises .lift:hover. I could not watch the hover.
9. One column on a phone, no horizontal scroll: honoured. scrollWidth equals clientWidth at 390
   on every screen I measured, and every screen is a single column.

## Could a template have made this?

For the frame, no. The header, the strips, the tape, the torn edges, the handwritten notes, the
drawn doors and stamps and the globe are specific, consistent and clearly made by hand in code.
No off-the-shelf theme produces this, and it does not look like any 1990s product; it looks
like a scrapbook.

For the quizzes, yes, and literally: 362 of 381 questions are one string template with a gap
punched in a Wikipedia sentence, and 376 of 381 first hints are one string template counting
letters. For the timeline entries, yes: "X was born on DATE" generated from Wikidata, with the
year printed three times. For 431 picture captions, yes: a Commons description field truncated
at a character count. The hand-made surface is sitting on top of generated content that has not
had an editor over it.

## The three weakest screens

1. Quiz and Quizzes. D-1 (blocker), D-4, D-5, D-6, D-7, D-8 (major), D-9 (major), D-41
   (polish). The screen looks right and plays wrong. A child can clear almost any quiz by
   pressing the nudge button and reading the letter count, or by picking the one capitalised
   word, and the proof sentence they get for being right is the sentence they just filled in.
   This is the feature the README leads with and the one the product promises never to cut.
2. Stamp book and Africa stamps. D-11 (major), plus D-10 (major) because the phone header eats
   the top third before the first row of stamps. On a new device the stamp book is a page of
   question marks and the words "Not found yet" repeated fourteen times. The idea is good and the
   drawn stamps are good once filled; the empty state needs something to look at, for example
   three or four countries already stamped from the tour, or faint continent outlines in the
   empty slots rather than "?" in a dashed box.
3. Timeline. D-23, D-24 (major), D-28 (minor). The furniture is all there, including the wobbly
   ruler and a real ordered list, but the words are machine-made and repeat themselves, the two
   chip rows disagree about their own style, and the dashed row is cut by the fold on both
   widths so the screen looks like it is still loading.

Honourable mention for the Article screen, which is the best screen in the product at 1440: the
lead print crossing the torn edge, the facts card, the picture strip and the credit line all
work, and it is let down only by its content (D-12, D-14, D-17, D-22).

## Verdict

Awari looks like a complete and coherent product and does not yet read like one. The design
system is the real achievement: twenty screens share one voice, the nine rules are followed
closely enough that I had to hunt for exceptions, the accessibility basics are right (a skip
link, a 3 px amber focus ring, 50 px navigation targets, no horizontal scroll at 390, reduced
motion respected, right and wrong carried by words), and the open-licence story is visible on
every screen rather than buried. A child at a laptop would understand it in ten seconds and
would want to press the globe. But the content layer has not been edited. Two lead photographs
are unsuitable for the stated audience (a glass of beer, a diseased lung), a few dozen article
leads still carry Wikipedia plumbing ("Cape Verde ( ()) or Cabo Verde ( (), )", a hatnote where
a definition should be, three sentences that stop mid-clause), one caption in nine is cut off
mid-thought, and the quizzes, the feature the product says it would never cut, give the answer
away on the first hint in 96% of cases and ask the same templated question 95% of the time. None
of this is structural: the engine is sound, the data is complete, the licences are credited, and
every fault above is a content pass rather than a rebuild. Fix the two unsuitable lead photos,
replace the letter-count nudge with a hint about the subject, stop truncating captions
mid-phrase, and clean the two dozen bracket artifacts in the leads, and this goes from "looks
polished" to "is polished".

## What I could not check

- Offline behaviour. I saw the "Saving for offline... N%" pill climb and the "Saved. Awari now
  works without a connection." toast on the live site, but I did not disconnect the network or
  test airplane mode, so I cannot confirm that any screen actually works offline.
- Motion. Rule 8 (hover straightens and lifts, no other animation) cannot be seen in still
  images. I read the CSS and found the .lift:hover mechanism and the reduced-motion override,
  but I did not watch a print straighten, and I did not verify that nothing else animates.
- Interaction I did not drive: dragging the globe, rotating it with arrow keys, the tour
  stop-to-stop turn, opening a castle door, the dictionary side card on tap-a-word, the picture
  of the day rotating, and "Save all pictures" on Credits.
- Full keyboard order. I confirmed the skip link is first and that the focus ring is visible and
  uses the --focus token, but I did not tab through all 20 screens in order.
- Contrast. I did not measure a single colour pair against WCAG AA; I am taking the palette and
  src/design/contrast.ts on trust.
- Below the fold. The contact sheets are viewport captures, so most of what sits below the first
  screen on each route was not seen, including the rest of the castle doors, the full article
  body and side card, and the lower part of Credits.
- Facts. I checked internal consistency (lead picture against article, stale date markers, quiz
  answer against proof sentence), not the truth of every claim. The 164 lead-picture mismatches
  are a count; I judged ten of them by hand and listed those.
- Image budget. I opened nine images in total, so defects outside those frames were not seen.
- The desktop installers, the Lambda quiz service and the service worker were out of scope.

One housekeeping note: a tool call of mine wrote an unwanted scratch file,
docs/final-review/_tmp-skip.txt, holding the first caption-audit output. The sandboxed shell
available to me has no delete command, so it is still there and should be removed by hand. No
other file was touched.
