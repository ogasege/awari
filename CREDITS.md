# Credits

Awari is built from openly licensed material. Every bundled photo and data
file under `public/` is listed here with its source and licence; the
`npm run credits` check (and a Kiro hook) fails if one is missing.

## Design kit photos

Resized copies of photos from Wikimedia Commons, used on Home and as
stamps. On 2026-11-12 each author and licence below was checked against
the Commons file page of the matching file (same subject, same author),
linked in the last column. The kit does not record which exact file of
a series was used, so the owner should confirm the page matches the
picture before submitting (step in `docs/runbook.md`).

| File | Subject | Author | Licence | Commons page |
| --- | --- | --- | --- | --- |
| photos/earth.jpg | The Earth seen from Apollo 17 | NASA (Apollo 17 crew) | Public domain | https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg |
| photos/milkyway.jpg | Centre of the Milky Way | NASA/JPL-Caltech/ESA/CXC/STScI | Public domain | https://commons.wikimedia.org/wiki/File:Center_of_the_Milky_Way_Galaxy_IV_%E2%80%93_Composite.jpg |
| photos/falls.jpg | Victoria Falls | Diego Delso | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Cataratas_Victoria,_Zambia-Zimbabue,_2018-07-27,_DD_30-34_PAN.jpg |
| photos/kili.jpg | Kilimanjaro | Diego Delso | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kilimanjaro,_Tanzania,_2024-05-22,_DD_15.jpg |
| photos/elephant.jpg | Elephant and calf | Charles J. Sharp | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:African_bush_elephant_(Loxodonta_africana)_with_calf_Serengeti.jpg |
| photos/pyramids.jpg | All Gizah Pyramids | Ricardo Liberato | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg |
| photos/lightning.jpg | Lightning at night | Mathias Krumbholz | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Lightning_Pritzerbe_01_(MK).jpg |
| photos/castle.jpg | Fasilides Palace, Gondar | Bernard Gagnon | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Fasilides_Palace_02.jpg |
| photos/zuma.jpg | Zuma Rock in the dry season | Hui Linbo | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Zuma_Rock_in_the_dry_season.jpg |
| photos/lokoja.jpg | The Niger from Mount Patti, Lokoja | Samlokoja | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:View_of_River_Niger_and_River_Venue_from_the_top_of_Mount_Patti_in_Lokoja_(Confluence_city).jpg |
| photos/covers/countries.jpg | Countries | Annatsach | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Flags_of_the_world.jpg |
| photos/covers/wildlife.jpg | Wildlife | Kevin Pluck | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Lion_waiting_in_Namibia.jpg |
| photos/covers/space.jpg | Space | NASA / JPL / Space Science Institute | Public domain | https://commons.wikimedia.org/wiki/File:Saturn_during_Equinox.jpg |
| photos/covers/earth.jpg | Mountains and rivers | Luca Galuzzi (Lucag) | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg |
| photos/covers/body.jpg | The human body | Mr Khubaib Sani | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Human_Skeleton_2.jpg |
| photos/covers/science.jpg | Science | Stanislav.nevyhosteny | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Erlenmeyer_flasks.jpg |
| photos/covers/physics.jpg | Physics and chemistry | Luc Viatour | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Plasma-lamp_2.jpg |
| photos/covers/inventions.jpg | Inventions | John T. Daniels | Public domain | https://commons.wikimedia.org/wiki/File:First_flight2.jpg |
| photos/covers/people.jpg | Famous people | Ferdinand Schmutzer / Adam Cuerden | Public domain | https://commons.wikimedia.org/wiki/File:Einstein_1921_by_F_Schmutzer_-_restoration.jpg |
| photos/covers/arts.jpg | Arts, music and sport | Leonardo da Vinci | Public domain | https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg |

## Logo

| File | Description | Licence |
| --- | --- | --- |
| logo/awari-logo.svg | Awari logo from the design kit, used unchanged | MIT (this project) |
| logo/awari-icon.svg | Awari app icon and favicon from the design kit | MIT (this project) |
| logo/awari-icon.png | PNG of the app icon, used for the web app manifest | MIT (this project) |

## Quizzes

Built by `scripts/quizzes/build.ts` from the article text (Simple English
Wikipedia, CC BY-SA 4.0) and Wikidata facts (CC0). Each question quotes
its proof sentence from the article, so the quiz files are adaptations
of the articles and share their licence, CC BY-SA 4.0.

- `packs/quizzes/countries/*.json`
- `packs/quizzes/physics/*.json`
- `packs/quizzes/wildlife/*.json`, `packs/quizzes/space/*.json`, `packs/quizzes/ancient/*.json`
- `packs/quizzes/earth/*.json`, `packs/quizzes/body/*.json`, `packs/quizzes/science/*.json`
- `packs/quizzes/inventions/*.json`, `packs/quizzes/people/*.json`, `packs/quizzes/arts/*.json`
- `packs/quizzes/*.json` (the quiz index)

## Home rotation

- `packs/home.json`: featured articles and margin notes for Home, built by
  `scripts/packs/home.ts` from the packs above. Each fact note is an article sentence
  word for word (Simple English Wikipedia, CC BY-SA 4.0); each photo reference points at
  a pack photo credited below.

## Any article on demand

Articles opened with "search any topic" are fetched by the student's own browser from
Simple English Wikipedia (or English Wikipedia when Simple has none), CC BY-SA 4.0, with
their lead photo from Wikimedia Commons when its licence is accepted and its author is
named; word meanings outside the bundled dictionary come from Wiktionary (CC BY-SA 4.0).
They are kept only on the student's device and credited on the page. None is bundled.

## App icon manifest

- `manifest.webmanifest`: the web app manifest, written for this project (MIT).

## Fonts

All fonts are self-hosted from the `@fontsource` npm packages and are
licensed under the SIL Open Font License 1.1.

- Bricolage Grotesque, by The Bricolage Grotesque Project Authors (Mathieu Triay, Atelier Triay)
- Figtree, by Erik Kennedy
- Covered By Your Grace, by Kimberly Geswein

<!-- packs:begin -->
## Content packs

Generated by `npm run packs` (scripts/packs) from open data retrieved
on or before 2026-11-11. This section is rewritten on every build.

### Articles: Simple English Wikipedia

Article text is from Simple English Wikipedia, licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Each
article file names its source page; text was split into sections and
some back-matter sections were removed.

- `packs/countries/*.json` (country articles and the pack index)
- `packs/physics/*.json` (electricity articles and the pack index)
- `packs/wildlife/*.json` (wildlife subject pack articles and index)
- `packs/space/*.json` (space subject pack articles and index)
- `packs/ancient/*.json` (ancient subject pack articles and index)
- `packs/earth/*.json` (earth subject pack articles and index)
- `packs/body/*.json` (body subject pack articles and index)
- `packs/science/*.json` (science subject pack articles and index)
- `packs/inventions/*.json` (inventions subject pack articles and index)
- `packs/people/*.json` (people subject pack articles and index)
- `packs/arts/*.json` (arts subject pack articles and index)

### Facts: Wikidata

Country facts in `packs/countries/facts.json` come from Wikidata,
dedicated to the public domain under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

### Timeline: Wikidata

- `packs/timeline.json`: dates and labels read from Wikidata (CC0) for a
  hand-picked list of items; each sentence is a fixed template filled
  with those fields, and each event names its Wikidata page.

### Atlas: Natural Earth

- `packs/atlas/*.json`: country shapes from Natural Earth 1:110m
  admin-0 countries (public domain, naturalearthdata.com), with
  coordinates rounded and properties trimmed.

### Dictionary: Open English WordNet

- `packs/dictionary/*.json`: word senses from Open English WordNet
  (github.com/globalwordnet/english-wordnet), licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

### Manifest

- `packs/manifest.json`: list of generated files (no third-party
  content).

### Photos: Wikimedia Commons

Resized to at most 800 px. Each links to its Commons file page.

| File | Subject | Author | Licence | Source |
| --- | --- | --- | --- | --- |
| packs/img/afghanistan.jpg | Afghanistan | Sven Dirks, Wien | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Kabul_TV_Hill_view.jpg |
| packs/img/albania.jpg | Albania | Pasztilla aka Attila Terbócs | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Byty%C3%A7,_Albania_landscape_2018-05_01.jpg |
| packs/img/algeria.jpg | Algeria | Bernard Gagnon | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Landscape_of_Baniane.jpg |
| packs/img/ancient-alexander-the-great.jpg | Alexander the Great | Unknown author Unknown author | Public domain | https://commons.wikimedia.org/wiki/File:Alexander_the_Great_mosaic_(cropped).jpg |
| packs/img/ancient-ancient-egypt.jpg | Ancient Egypt | en:User:Hajor | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Egypt.Giza.Sphinx.01.jpg |
| packs/img/ancient-ancient-greece.jpg | Ancient Greece | Phanatic | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Parthenon_(30276156187).jpg |
| packs/img/ancient-aztecs.jpg | Aztecs | Maunus | Public domain | https://commons.wikimedia.org/wiki/File:StaCeciliaAcatitlan.jpg |
| packs/img/ancient-colosseum.jpg | Colosseum | WarpFlyght | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Colosseum-Entrance_LII.jpg |
| packs/img/ancient-colossus-of-rhodes.jpg | Colossus of Rhodes | gravure sur bois de Sidney Barclay numérisée Google | Public domain | https://commons.wikimedia.org/wiki/File:Colosse_de_Rhodes_(Barclay).jpg |
| packs/img/ancient-great-pyramid-of-giza.jpg | Great Pyramid of Giza | Berthold Werner | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Gizeh_Cheops_BW_1.jpg |
| packs/img/ancient-great-wall-of-china.jpg | Great Wall of China | Severin.stalder | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:The_Great_Wall_of_China_at_Jinshanling-edit.jpg |
| packs/img/ancient-great-zimbabwe.jpg | Great Zimbabwe | Image taken by Jan Derk in 1997 in Zimbabwe . | Public domain | https://commons.wikimedia.org/wiki/File:Great-Zimbabwe-2.jpg |
| packs/img/ancient-hanging-gardens-of-babylon.jpg | Hanging Gardens of Babylon | Unknown author Unknown author | Public domain | https://commons.wikimedia.org/wiki/File:Hanging_Gardens_of_Babylon.jpg |
| packs/img/ancient-inca-empire.jpg | Inca Empire | icelight from Boston, MA, US | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Before_Machu_Picchu.jpg |
| packs/img/ancient-industrial-revolution.jpg | Industrial Revolution | Philip James de Loutherbourg | Public domain | https://commons.wikimedia.org/wiki/File:Philipp_Jakob_Loutherbourg_d._J._002.jpg |
| packs/img/ancient-julius-caesar.jpg | Julius Caesar | Ángel M. Felicísimo from Mérida, España | Public domain | https://commons.wikimedia.org/wiki/File:Retrato_de_Julio_C%C3%A9sar_(26724093101).jpg |
| packs/img/ancient-kingdom-of-aksum.jpg | Kingdom of Aksum | Tesfawel | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Aksum_obelisk.jpg |
| packs/img/ancient-lighthouse-of-alexandria.jpg | Lighthouse of Alexandria | Pudelek | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Miniuni_Ostrava_-_Lighthouse_of_Alexandria.JPG |
| packs/img/ancient-machu-picchu.jpg | Machu Picchu | Martin St-Amant ( S23678 ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:80_-_Machu_Picchu_-_Juin_2009_-_edit.2.jpg |
| packs/img/ancient-mali-empire.jpg | Mali Empire | Félix Dubois (1862-1945) | Public domain | https://commons.wikimedia.org/wiki/File:Djenne_Mosque_Dubois_1911.jpg |
| packs/img/ancient-mayan-civilization.jpg | Mayan civilization | Wolfgang Sauber ( User:Xenophon ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Maya-Maske.jpg |
| packs/img/ancient-middle-ages.jpg | Middle Ages | Jules & Jenny from Lincoln, UK | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Canterbury_Cathedral,_window_nXV_detail_(46220634195).jpg |
| packs/img/ancient-pompeii.jpg | Pompeii | Carsten Steger | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Aerial_image_of_Pompeii_and_Mount_Vesuvius_(view_from_the_southeast).jpg |
| packs/img/ancient-renaissance.jpg | Renaissance | Raphael | Public domain | https://commons.wikimedia.org/wiki/File:La_scuola_di_Atene.jpg |
| packs/img/ancient-roman-empire.jpg | Roman Empire | Nicholas Hartmann | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Roman_Forum_looking_East.jpg |
| packs/img/ancient-rosetta-stone.jpg | Rosetta Stone | Ken Eckert | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Rosetta_Stone,_196_BC.jpg |
| packs/img/ancient-silk-road.jpg | Silk Road | Party Fabrics | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:China_silk-crystalblue.jpg |
| packs/img/ancient-sphinx.jpg | Sphinx | Hamerani | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Great_Sphinx_of_Giza_(2).jpg |
| packs/img/ancient-stonehenge.jpg | Stonehenge | No machine-readable author provided. Wigulf~commonswiki assumed (based on copyright claims). | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:Stonehenge.jpg |
| packs/img/ancient-temple-of-artemis.jpg | Temple of Artemis | Adam Carr | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Ac_artemisephesus.jpg |
| packs/img/ancient-tutankhamun.jpg | Tutankhamun | Roland Unger | Public domain | https://commons.wikimedia.org/wiki/File:CairoEgMuseumTaaMaskMostlyPhotographed.jpg |
| packs/img/ancient-vikings.jpg | Vikings | Marieke Kuijjer Camera location 50° 05′ 31.28″ N, 14° 24′ 14.1″ E View this and other nearby images on: OpenStreetMap 50.092022; 14.403918 | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Viking_helmet.jpg |
| packs/img/ancient-wonders-of-the-world.jpg | Wonders of the World | Maerten van Heemskrerck | Public domain | https://commons.wikimedia.org/wiki/File:Maerten_van_Heemskrerck.jpg |
| packs/img/andorra.jpg | Andorra | Krzysztof Golik | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Pyrenees_in_Andorra_(10).jpg |
| packs/img/angola.jpg | Angola | Erik Cleves Kristensen | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Namib_desert_Angola.jpg |
| packs/img/antigua-and-barbuda.jpg | Antigua and Barbuda | Vincent van Zeijst | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Antigua_and_Barbuda,_English_Harbour_(24).jpg |
| packs/img/argentina.jpg | Argentina | Fernando | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Llao_Llao_Peninsula.jpg |
| packs/img/armenia.jpg | Armenia | Vyacheslav Argenberg | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Geghard_Monastery,_Armenia.jpg |
| packs/img/arts-ballet.jpg | Ballet | Rick Dikeman | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Snowdance.jpg |
| packs/img/arts-basketball.jpg | Basketball | kris krüg from Vancouver, Canada | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:USA_vs._China_Mens_Basketball_-_Beijing_2008_Olympic_Games_(2751923597).jpg |
| packs/img/arts-chess.jpg | Chess | Alan Light | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:ChessSet.jpg |
| packs/img/arts-cricket.jpg | Cricket | Rae Allen from Brisbane, Australia | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Muttiah_Muralitharan.jpg |
| packs/img/arts-dance.jpg | Dance | Barry Goyette from San Luis Obispo, USA | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Two_dancers.jpg |
| packs/img/arts-drum.jpg | Drum | Photo by Infrogmation of New Orleans | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:DrumsMG1998.jpg |
| packs/img/arts-fifa-world-cup.jpg | FIFA World Cup | Haena96 | CC0 | https://commons.wikimedia.org/wiki/File:Jeonju_World_Cup_stadium_interior.jpg |
| packs/img/arts-football.jpg | Football | Fanny Schertzer | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_and_Lionel_Messi_-_Portugal_vs_Argentina,_9th_February_2011.jpg |
| packs/img/arts-guitar.jpg | Guitar | Jonathan Tessier | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Sonic_Vista_Stduios_(Guitar_Wall).jpg |
| packs/img/arts-hip-hop.jpg | Hip hop | Muhammed amine benloulou | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Hip_hop_dance.jpg |
| packs/img/arts-jesse-owens.jpg | Jesse Owens | Acme News Photos | Public domain | https://commons.wikimedia.org/wiki/File:Jesse_Owens_1936.jpg |
| packs/img/arts-lionel-messi.jpg | Lionel Messi | Кирилл Венедиктов | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Lionel_Messi_20180626.jpg |
| packs/img/arts-literature.jpg | Literature | Lienhard Schulz | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:Printing3_Walk_of_Ideas_Berlin.JPG |
| packs/img/arts-ludwig-van-beethoven.jpg | Ludwig van Beethoven | Joseph Karl Stieler | Public domain | https://commons.wikimedia.org/wiki/File:Beethoven.jpg |
| packs/img/arts-mask.jpg | Mask | Carole Raddato from FRANKFURT, Germany ( FollowingHadrian ); derivative work: Speravir | Public domain | https://commons.wikimedia.org/wiki/File:Mosaic_depicting_theatrical_masks_of_Tragedy_and_Comedy_(Thermae_Decianae).jpg |
| packs/img/arts-movie-theatre.jpg | Movie theatre | Anthony22 ( talk ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Regal_Cinemas_Imax_Theatre.jpg |
| packs/img/arts-muhammad-ali.jpg | Muhammad Ali | Ira Rosenberg | Public domain | https://commons.wikimedia.org/wiki/File:Muhammad_Ali_NYWTS.jpg |
| packs/img/arts-museum.jpg | Museum | LuisCG11 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Museo_Chileno_de_Arte_Precolombino_-_2020_-_10.jpg |
| packs/img/arts-olympic-games.jpg | Olympic Games | No machine-readable author provided. MatthiasKabel assumed (based on copyright claims). | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:Roman_bronze_copy_of_Myron%E2%80%99s_Discobolos,_2nd_century_CE_(Glyptothek_Munich).jpg |
| packs/img/arts-opera.jpg | Opera | Jaakko H. | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Macbeth_applause_at_Savonlinna_Opera_festival_in_2007_-_panoramio.jpg |
| packs/img/arts-orchestra.jpg | Orchestra | Ritter Alexa | Public domain | https://commons.wikimedia.org/wiki/File:Dohnanyi_Orchestra_Budafok.JPG |
| packs/img/arts-painting.jpg | Painting | Leonardo da Vinci | Public domain | https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg |
| packs/img/arts-photography.jpg | Photography | Diliff | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:Radcliffe_Camera,_Oxford_-_Oct_2006.jpg |
| packs/img/arts-piano.jpg | Piano | User:Gryffindor and User:Megodenas | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Grand_piano_and_upright_piano.jpg |
| packs/img/arts-swimming.jpg | Swimming | Affebook | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Barnbarn.jpg |
| packs/img/arts-tennis.jpg | Tennis | Brendan Dennis | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:2013_Australian_Open_-_Guillaume_Rufin.jpg |
| packs/img/arts-theatre.jpg | Theatre | Photo: Andreas Praefcke | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Rutentheater_2006_Hymne.jpg |
| packs/img/arts-usain-bolt.jpg | Usain Bolt | Doha Stadium Plus Qatar from Doha, Qatar | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Usain_Bolt_2011.jpg |
| packs/img/arts-violin.jpg | Violin | Daniel Jason Karjadi ; cropped by Eugenio Hansen, OFS | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Violin_by_Daniel_Jason_Karjadi.jpg |
| packs/img/arts-wolfgang-amadeus-mozart.jpg | Wolfgang Amadeus Mozart | Barbara Krafft | Public domain | https://commons.wikimedia.org/wiki/File:Wolfgang-amadeus-mozart_1.jpg |
| packs/img/australia.jpg | Australia | Diliff | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_-_Dec_2008.jpg |
| packs/img/austria.jpg | Austria | Diliff | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Graz,_Austria_skyline_-_July_2004.jpg |
| packs/img/azerbaijan.jpg | Azerbaijan | Radosław Botev | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Landscape_in_Lahic_Azerbaijan_(1).jpg |
| packs/img/bahrain.jpg | Bahrain | Jayson De Leon | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Road_and_towers_in_Manama.jpg |
| packs/img/bangladesh.jpg | Bangladesh | Mahbub Hossain Shaheed (mahosha) | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Ahsan_Manzil-Front_View.jpg |
| packs/img/barbados.jpg | Barbados | Postdlf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Saint_Andrew,_Barbados_038.jpg |
| packs/img/battery.jpg | Battery | RAIL P ( RAIL.PHOTOGRAPHY ) | CC0 | https://commons.wikimedia.org/wiki/File:IKEA_LADDA_rechargeable_AA-batteries.jpg |
| packs/img/belarus.jpg | Belarus | zedlik | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Strusta_Lake_-_Panorama.jpg |
| packs/img/belgium.jpg | Belgium | [cipher ] | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Brussels_waffle.jpg |
| packs/img/belize.jpg | Belize | epiphyllumlover | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:The_Belize_River_-_panoramio.jpg |
| packs/img/benin.jpg | Benin | Dr. Ondřej Havelka (cestovatel) | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Benin_village_on_water_Ganvi%C3%A9.jpg |
| packs/img/bhutan.jpg | Bhutan | Christopher J. Fynn | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Himalayan_peak_from_Bumthang.jpg |
| packs/img/body-artery.jpg | Artery | StatPearls Illustration | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Artery_of_Adamkiewicz-01.jpg |
| packs/img/body-blood-vessel.jpg | Blood vessel | Ryan Somma | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Blood_Vessels_in_the_Penis.jpg |
| packs/img/body-blood.jpg | Blood | Wesalius | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Venous_and_arterial_blood.jpg |
| packs/img/body-bone.jpg | Bone | Mr Khubaib Sani | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Human_Skeleton_2.jpg |
| packs/img/body-brain.jpg | Brain | Gaetan Lee . Tilt corrected by Kaldari . | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Chimp_Brain_in_a_jar.jpg |
| packs/img/body-breathing.jpg | Breathing | Yale Rosen from USA | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Normal_lung_(3661529848).jpg |
| packs/img/body-cell.jpg | Cell | IP69.226.103.13 | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:DAPIMitoTrackerRedAlexaFluor488BPAE.jpg |
| packs/img/body-digestion.jpg | Digestion | Tekks ( talk ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Digestive_hormones.jpg |
| packs/img/body-dna.jpg | DNA | NIH Image Gallery from Bethesda, Maryland, USA | Public domain | https://commons.wikimedia.org/wiki/File:DNA_Double_Helix_(20468181866).jpg |
| packs/img/body-ear.jpg | Ear | RWhitwam | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Model_of_human_ear.jpg |
| packs/img/body-eye.jpg | Eye | Kamil Saitov | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Human_eye_iris_3.jpg |
| packs/img/body-hair.jpg | Hair | Girl | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Beautiful_healty_hair.JPG |
| packs/img/body-heart.jpg | Heart | Patrick J. Lynch, medical illustrator | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:Heart_anterior_exterior_view.jpg |
| packs/img/body-hormone.jpg | Hormone | Mcfall2016 | Public domain | https://commons.wikimedia.org/wiki/File:Free_Hormone_Hypothesis_2.jpg |
| packs/img/body-human-body.jpg | Human body | Leonardo da Vinci | Public domain | https://commons.wikimedia.org/wiki/File:Da_Vinci_Vitruve_Luc_Viatour_(cropped).jpg |
| packs/img/body-human-skeleton.jpg | Human skeleton | Sklmsta | CC0 | https://commons.wikimedia.org/wiki/File:Human-Skeleton.jpg |
| packs/img/body-immune-system.jpg | Immune system | Nadar | Public domain | https://commons.wikimedia.org/wiki/File:Ilya_Mechnikov_nobel.jpg |
| packs/img/body-leg.jpg | Leg | Basile Morin | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Hypomeces_squamosus.jpg |
| packs/img/body-liver.jpg | Liver | Tvanbr | Public domain | https://commons.wikimedia.org/wiki/File:Anatomy_Abdomen_Tiesworks.jpg |
| packs/img/body-lung.jpg | Lung | Gray's Anatomy | Public domain | https://commons.wikimedia.org/wiki/File:Heart-and-lungs.jpg |
| packs/img/body-muscle.jpg | Muscle | OpenStax College | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Biceps_Muscle_CNX.jpg |
| packs/img/body-nose.jpg | Nose | LHOON | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Neus1.jpg |
| packs/img/body-pancreas.jpg | Pancreas | Don Bliss (Illustrator) | Public domain | https://commons.wikimedia.org/wiki/File:Pancreas_and_nearby_organs.jpg |
| packs/img/body-skin.jpg | Skin | Greg Willis from Denver, CO, usa | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Elephant_skin_(3689577529).jpg |
| packs/img/body-sleep.jpg | Sleep | Domenico Fetti | Public domain | https://commons.wikimedia.org/wiki/File:Domenico_Fetti_-_Sleeping_Girl_-_WGA7863.jpg |
| packs/img/body-stomach.jpg | Stomach | Photographer: Scott Hansen, U.S. Geological Survey | Public domain | https://commons.wikimedia.org/wiki/File:Brown_pelican_stomach_ingested_objects.jpg |
| packs/img/body-taste.jpg | Taste | Saurabh R. Patil | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Tongue_and_taste_buds.jpg |
| packs/img/body-thumb.jpg | Thumb | Bwyell80 | CC0 | https://commons.wikimedia.org/wiki/File:Liam_Thumb.jpg |
| packs/img/body-tooth.jpg | Tooth | dozenist | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:06-10-06smile.jpg |
| packs/img/body-vaccine.jpg | Vaccine | Photo Credit: James Gathany Content Providers(s): CDC | Public domain | https://commons.wikimedia.org/wiki/File:Smallpox_vaccine.jpg |
| packs/img/bolivia.jpg | Bolivia | Christopher Crouzet | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Copacabana,_Bolivia.jpg |
| packs/img/bosnia-and-herzegovina.jpg | Bosnia and Herzegovina | Boabo | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Tuzla_View_of_Tuzla.jpg |
| packs/img/botswana.jpg | Botswana | FaysaL Bin DaruL | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Botswana_National_Stadium_20150928_115938.jpg |
| packs/img/brazil.jpg | Brazil | Donatas Dabravolskas | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Redentor_Over_Clouds_1.jpg |
| packs/img/brunei.jpg | Brunei | DeltaSquad833 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Brunei_Pumpjack-1.jpg |
| packs/img/bulgaria.jpg | Bulgaria | Boby Dimitrov from Sofia, Bulgaria | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Downtown_Sofia_Boby_Dimitrov_1.jpg |
| packs/img/burkina-faso.jpg | Burkina Faso | c.hug | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Waterfalls_at_Karfiguela,_Burkina_Faso.jpg |
| packs/img/burundi.jpg | Burundi | d_proffer | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Burundi_landscape.jpg |
| packs/img/cambodia.jpg | Cambodia | Juan Antonio Segal from Madrid, Spain | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:People_and_landscapes_of_Cambodia_(16288249485).jpg |
| packs/img/cameroon.jpg | Cameroon | Buma Peter | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Landscape_of_Mount_Cameroon.jpg |
| packs/img/canada.jpg | Canada | Tobias Alt, Tobi 87 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Peyto_Lake-Banff_NP-Canada.jpg |
| packs/img/cape-verde.jpg | Cape Verde | David Trainer | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Mount_fogo.jpg |
| packs/img/central-african-republic.jpg | Central African Republic | Alllexxxis | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Bangui_City_Centre.jpg |
| packs/img/chad.jpg | Chad | Ken Doerr from Chester, UK | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Storm_clouds_over_N%27Djamena_(15386229016).jpg |
| packs/img/chile.jpg | Chile | mtchm from - | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Parinacota_volcano.jpg |
| packs/img/colombia.jpg | Colombia | User: (WT-shared) CONOCER at wts wikivoyage | Public domain | https://commons.wikimedia.org/wiki/File:Cartagena_Old_City.JPG |
| packs/img/comoros.jpg | Comoros | Frédéric Ducarme | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Sakouli_baobabs.jpg |
| packs/img/costa-rica.jpg | Costa Rica | Creator:Edwin Dalorzo | Public domain | https://commons.wikimedia.org/wiki/File:Iglesia_Inmaculada_Concepcion_Ujarras.jpg |
| packs/img/croatia.jpg | Croatia | Quahadi Añtó 10:33, 1 October 2014 (UTC) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Ston_i_solana_sa_zidina_9280657.JPG |
| packs/img/cuba.jpg | Cuba | Didier Baertschiger | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Cuba_-_Cayo_Coco.jpg |
| packs/img/cyprus.jpg | Cyprus | Michal Osmenda from Brussels, Belgium | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Near_Trodos,_Cyprus_(8132780501).jpg |
| packs/img/czech-republic.jpg | Czech Republic | Petar Milošević | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Prague_skyline_at_dawn.jpg |
| packs/img/democratic-republic-of-the-congo.jpg | Democratic Republic of the Congo | Garcia-Pavilion | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Vue_Kinshasa.jpg |
| packs/img/denmark.jpg | Denmark | Jebulon | CC0 | https://commons.wikimedia.org/wiki/File:Window_Roskilde_Denmark.jpg |
| packs/img/djibouti.jpg | Djibouti | Clovis conchou | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%C3%8Ele_maskali,_Djibouti.jpg |
| packs/img/dominica.jpg | Dominica | Aneil Lutchman | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Dominica_Hiking_Path.JPG |
| packs/img/dominican-republic.jpg | Dominican Republic | Bogdan from Timisoara, Romania | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Dominican_landscape_(3965528732).jpg |
| packs/img/earth-alps.jpg | Alps | Earth explorer | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:2008_Jungfrau.jpg |
| packs/img/earth-amazon-river.jpg | Amazon River | Neil Palmer/CIAT | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Amazon_CIAT_(2).jpg |
| packs/img/earth-andes.jpg | Andes | Jorge Morales Piderit | Public domain | https://commons.wikimedia.org/wiki/File:Cordillera_de_los_Andes.jpg |
| packs/img/earth-arctic-ocean.jpg | Arctic Ocean | Patrick Kelley | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Arctic_ice.jpg |
| packs/img/earth-atlantic-ocean.jpg | Atlantic Ocean | Tiago Fioreze | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Clouds_over_the_Atlantic_Ocean.jpg |
| packs/img/earth-congo-river.jpg | Congo River | User:Vberger | Public domain | https://commons.wikimedia.org/wiki/File:Congo_maluku.jpg |
| packs/img/earth-danube.jpg | Danube | Visions of Domino | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:View_from_Gell%C3%A9rt_Hill_to_the_Danube,_Hungary_-_Budapest_(28493220635).jpg |
| packs/img/earth-ganges.jpg | Ganges | Babasteve | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Varanasiganga.jpg |
| packs/img/earth-great-barrier-reef.jpg | Great Barrier Reef | NASA, by MISR | Public domain | https://commons.wikimedia.org/wiki/File:GreatBarrierReef-EO.JPG |
| packs/img/earth-himalayas.jpg | Himalayas | NASA | Public domain | https://commons.wikimedia.org/wiki/File:Himalayas.jpg |
| packs/img/earth-krakatoa.jpg | Krakatoa | SentinelHub | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Anak_Krakatau,_Indonesia_2.jpg |
| packs/img/earth-mekong-river.jpg | Mekong River | Bjørn Christian Tørrissen | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Mekong-River-Near-Luang-Prabang.jpg |
| packs/img/earth-mississippi-river.jpg | Mississippi River | NPS photo | Public domain | https://commons.wikimedia.org/wiki/File:Efmo_View_from_Fire_Point.jpg |
| packs/img/earth-mount-aso.jpg | Mount Aso | Immanuelle | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Mount_Aso_clouds.jpg |
| packs/img/earth-mount-etna.jpg | Mount Etna | Josep Renalias | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:EtnaAvi%C3%B3.JPG |
| packs/img/earth-mount-everest.jpg | Mount Everest | Mount_Everest_as_seen_from_Drukair2.jpg : shrimpo1967 derivative work: Papa Lima Whiskey 2 ( talk ) | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg |
| packs/img/earth-mount-fuji.jpg | Mount Fuji | 名古屋太郎 | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:080103_hakkai_fuji.jpg |
| packs/img/earth-mount-kilimanjaro.jpg | Mount Kilimanjaro | Diego Delso | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kilimanjaro,_Tanzania,_2024-05-22,_DD_109.jpg |
| packs/img/earth-mount-merapi.jpg | Mount Merapi | Fahmi Widayat | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Pendidikan_Karakter_Dan_Nasionalisme.jpg |
| packs/img/earth-mount-rainier.jpg | Mount Rainier | Lyn Topinka (USGS) | Public domain | https://commons.wikimedia.org/wiki/File:Mount_Rainier_over_Tacoma.jpg |
| packs/img/earth-mount-st-helens.jpg | Mount St. Helens | Lyn Topinka | Public domain | https://commons.wikimedia.org/wiki/File:MSH82_st_helens_plume_from_harrys_ridge_05-19-82.jpg |
| packs/img/earth-mount-tambora.jpg | Mount Tambora | Jialiang Gao (peace-on-earth.org) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Caldera_Mt_Tambora_Sumbawa_Indonesia.jpg |
| packs/img/earth-mount-vesuvius.jpg | Mount Vesuvius | pietro scerrato | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Il_cratere_del_Vulcano_-_panoramio.jpg |
| packs/img/earth-murray-river.jpg | Murray River | Mattinbgn ( talk · contribs ) | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Nyah_Murray_River_002.JPG |
| packs/img/earth-niger-river.jpg | Niger River | NigerTZai | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Niger,_Niamey,_Pont_Kennedy_(1).jpg |
| packs/img/earth-nile.jpg | Nile | Jordan Busson | Public domain | https://commons.wikimedia.org/wiki/File:Dhows_on_the_Nile.jpg |
| packs/img/earth-pacific-ring-of-fire.jpg | Pacific Ring of Fire | Alexander Gerst | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Ring_of_Fire_-_Feuerring.jpg |
| packs/img/earth-plate-tectonics.jpg | Plate tectonics | NOAA Photo Library | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Rifted_lava_flow_(Expl6466_9784118753).jpg |
| packs/img/earth-popocatepetl.jpg | Popocatépetl | Jakub Hejtmánek | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Mexico-Popocatepetl.jpg |
| packs/img/earth-rhine-river.jpg | Rhine River | Dietmar Rabich | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:D%C3%BCsseldorf,_Rheinturm_--_2015_--_8172.jpg |
| packs/img/earth-rocky-mountains.jpg | Rocky Mountains | Gorgo | Public domain | https://commons.wikimedia.org/wiki/File:Moraine_Lake_17092005.jpg |
| packs/img/earth-sahara.jpg | Sahara | NASA | Public domain | https://commons.wikimedia.org/wiki/File:Sahara_satellite_hires.jpg |
| packs/img/earth-volcano.jpg | Volcano | Cyrus Read Geophysicist USGS, Alaska Volcano Observatory cread@usgs.gov | Public domain | https://commons.wikimedia.org/wiki/File:Augustine_volcano_Jan_24_2006_-_Cyrus_Read.jpg |
| packs/img/earth-yangtze-river.jpg | Yangtze River | Jialiang Gao www.peace-on-earth.org | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Cn1202-03.jpg |
| packs/img/east-timor.jpg | East Timor | Nick Hobgood | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Dili_and_Atauro_Island.jpg |
| packs/img/ecuador.jpg | Ecuador | Stephen Montgomery from Kallangur, Australia | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Rabida_Island_-_panorama.jpg |
| packs/img/egypt.jpg | Egypt | Ricardo Liberato | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg |
| packs/img/el-salvador.jpg | El Salvador | Wanmei Liang | Public domain | https://commons.wikimedia.org/wiki/File:San_Salvador_metropolitan_area.jpg |
| packs/img/electric-charge.jpg | Electric charge | doe-oakridge . 82-25 DOE photo by Frank Hoffman | Public domain | https://commons.wikimedia.org/wiki/File:Van_de_Graaff_at_American_Museum_of_Science_and_Energy_Oak_Ridge.jpg |
| packs/img/electric-current.jpg | Electric current | wdwd | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Multimeter_Strommessung.JPG |
| packs/img/electrical-circuit.jpg | Electrical circuit | Mitch Barrie from Reno, NV, USA | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:First_LED_circuit_(48433844026).jpg |
| packs/img/electrical-conductor.jpg | Electrical conductor | Dmitry G | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Copper_cable_resistance.jpg |
| packs/img/electrical-resistance.jpg | Electrical resistance | Evan-Amos | Public domain | https://commons.wikimedia.org/wiki/File:Electronic-Axial-Lead-Resistors-Array.jpg |
| packs/img/electricity.jpg | Electricity | Aatu Liimatta | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:Electric_wiring_near_Helsinki.JPG |
| packs/img/equatorial-guinea.jpg | Equatorial Guinea | Francesca Calisti | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Atardecer_en_la_playa_de_Ureca_(Ureka)_Guinea_Ecuatorial.jpg |
| packs/img/eritrea.jpg | Eritrea | Temesgen | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:Eritrean_Highlands.jpg |
| packs/img/estonia.jpg | Estonia | Abrget47j | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:M%C3%A4nnikj%C3%A4rve_raba_tornist.jpg |
| packs/img/eswatini.jpg | Eswatini | Umkhaya | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Mbabane_Landscape.jpg |
| packs/img/ethiopia.jpg | Ethiopia | Bernard Gagnon | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Bete_Giyorgis_03.jpg |
| packs/img/federated-states-of-micronesia.jpg | Federated States of Micronesia | Erin Magee/AusAID | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Federated_States_of_Micronesia_landscape_(10694963426).jpg |
| packs/img/fiji.jpg | Fiji | JaredWiltshire | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Bounty_Island_beach_Fiji.jpg |
| packs/img/finland.jpg | Finland | Lobke Thijssen | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:Koli_hill_view.jpg |
| packs/img/france.jpg | France | Benh LIEU SONG | Public domain | https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons.jpg |
| packs/img/gabon.jpg | Gabon | Lengai101 | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:DIGITAL_CROSSING_-_KONGOU_03.jpg |
| packs/img/georgia.jpg | Georgia | Radosław Botev | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Landscape_near_Vardzia_-_Georgia_(3).jpg |
| packs/img/germany.jpg | Germany | Softeis | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Castle_Neuschwanstein.jpg |
| packs/img/ghana.jpg | Ghana | Erik Kristensen | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Beach_with_palms_Ghana.jpg |
| packs/img/greece.jpg | Greece | Jebulon | CC0 | https://commons.wikimedia.org/wiki/File:Landscape_at_Cape_Sounion,_Greece.jpg |
| packs/img/grenada.jpg | Grenada | ImagePerson | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Bougainvillia_flowers_Grenada_7749.jpg |
| packs/img/guatemala.jpg | Guatemala | Christopher Crouzet | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:View_from_Volcano_Pacaya,_Guatemala.jpg |
| packs/img/guinea-bissau.jpg | Guinea-Bissau | Joehawkins | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Lagoa_com_hipop%C3%B3tamos_03_(cropped).jpg |
| packs/img/guinea.jpg | Guinea | Flucco | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Plage_de_Roume.jpg |
| packs/img/guyana.jpg | Guyana | Stephane Lesbats (IFREMER, Pôle Images, Centre Bretagne - ZI de la Pointe du Diable - CS 10070 - 29280 Plouzané, France) | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Ilet_Cupidon_(Guyane)_(Ifremer_00807-91876_-_52994).jpg |
| packs/img/haiti.jpg | Haiti | Bdx | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Landscape_in_Palmes,_Petit-Go%C3%A2ve,_Haiti,_2017.jpg |
| packs/img/honduras.jpg | Honduras | LeRoc | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Pedernales_La_Paz_Honduras.jpg |
| packs/img/hungary.jpg | Hungary | Cserlajos | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Hungarian_landscape,_near_obanya.jpg |
| packs/img/iceland.jpg | Iceland | Fran Cano Cabal | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Icelandic_landscapes.jpg |
| packs/img/india.jpg | India | Dhirad , picture edited by J. A. Knudsen | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Taj_Mahal_in_March_2004.jpg |
| packs/img/indonesia.jpg | Indonesia | Gunawan Kartapranata | Public domain | https://commons.wikimedia.org/wiki/File:Borobudur-Nothwest-view.jpg |
| packs/img/insulator.jpg | Insulator | Thermos | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Insulator_railways.jpg |
| packs/img/inventions-airplane.jpg | Airplane | Quintin Soloviev | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:ANA_777-300_Taking_off_from_JFK.jpg |
| packs/img/inventions-automobile.jpg | Automobile | Celica21gtfour at English Wikipedia | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:2005_Toyota_Corolla_(ZZE122R_5Y)_Ascent_sedan_01.jpg |
| packs/img/inventions-bicycle.jpg | Bicycle | Øyvind Holmstad | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Sykkel_st%C3%B8ttestang_2.JPG |
| packs/img/inventions-calculator.jpg | Calculator | Mc681 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Casio_calculator_JS-20WK_in_201901_002.jpg |
| packs/img/inventions-camera.jpg | Camera | Luis Cozeto from Portugal | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:HOUGHTON_,_Triple_Victo_,_1914_,_shutter_PROSCH_MFG,_Triplex_(17143509932).jpg |
| packs/img/inventions-clock.jpg | Clock | Sun Ladder | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:2010-07-20_Black_windup_alarm_clock_face.jpg |
| packs/img/inventions-computer.jpg | Computer | Erik Pitti | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:IBM_System360_Mainframe.jpg |
| packs/img/inventions-elevator.jpg | Elevator | Chris McKenna ( Thryduulf ) | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Borough_tube_station_lifts_01.jpg |
| packs/img/inventions-helicopter.jpg | Helicopter | Fly45yt | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:VH-SUF_Taking_Off.jpg |
| packs/img/inventions-light-bulb.jpg | Light bulb | KMJ | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Gluehlampe_01_KMJ.jpg |
| packs/img/inventions-microscope.jpg | Microscope | Zephyris at English Wikipedia | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Microscope.jpg |
| packs/img/inventions-mobile-phone.jpg | Mobile phone | Bodoque57 | Public domain | https://commons.wikimedia.org/wiki/File:Siemens_AX72_mobile_phone.jpg |
| packs/img/inventions-paper.jpg | Paper | Laitche | Public domain | https://commons.wikimedia.org/wiki/File:Cranes_made_by_Origami_paper.jpg |
| packs/img/inventions-plastic.jpg | Plastic | Cjp24 | Public domain | https://commons.wikimedia.org/wiki/File:Plastic_objects.jpg |
| packs/img/inventions-printing-press.jpg | Printing press | Magnussen, Friedrich (1914-1987) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Druckerei_der_Kieler_Nachrichten_(KN)_in_der_Fleeth%C3%B6rn_(Kiel_38.232).jpg |
| packs/img/inventions-radio.jpg | Radio | Alex Brasetvik | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Tyholt_taarnet.jpg |
| packs/img/inventions-refrigerator.jpg | Refrigerator | W.carter | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Open_refrigerator_with_food_at_night.jpg |
| packs/img/inventions-robot.jpg | Robot | NASA | Public domain | https://commons.wikimedia.org/wiki/File:K10_black_rover_at_Haughton_Crater.jpg |
| packs/img/inventions-sewing-machine.jpg | Sewing machine | Vincent de Groot - http://www.videgro.net | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Singer_sewing_machine_detail1.jpg |
| packs/img/inventions-solar-energy.jpg | Solar energy | WiNG | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Electrical_and_Mechanical_Services_Department_Headquarters_Photovoltaics.jpg |
| packs/img/inventions-steam-engine.jpg | Steam engine | Tony Hisgett from Birmingham, UK | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Engine_House_(3452966818).jpg |
| packs/img/inventions-steamboat.jpg | Steamboat | Bo | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Belle_of_Louisville_2.jpg |
| packs/img/inventions-submarine.jpg | Submarine | John Webber CET | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:VICTORIA_CLASS_SUBMARINE_2021.jpg |
| packs/img/inventions-telephone.jpg | Telephone | Bartosz Senderek | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:Philips_SE245_DECT.jpg |
| packs/img/inventions-television.jpg | Television | Photographer: Hana Kirana | Public domain | https://commons.wikimedia.org/wiki/File:Early_portable_tv.jpg |
| packs/img/inventions-train.jpg | Train | Алексей Задонский | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%D0%9F%D0%BE%D0%B5%D0%B7%D0%B4_%D0%BD%D0%B0_%D1%84%D0%BE%D0%BD%D0%B5_%D0%B3%D0%BE%D1%80%D1%8B_%D0%A8%D0%B0%D1%82%D1%80%D0%B8%D1%89%D0%B5._%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B5%D0%B6%D1%81%D0%BA%D0%B0%D1%8F_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C.jpg |
| packs/img/inventions-typewriter.jpg | Typewriter | GodeNehler | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:MEK_II-371.jpg |
| packs/img/inventions-washing-machine.jpg | Washing machine | LG전자 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:LG_%EB%93%9C%EB%9F%BC%EC%84%B8%ED%83%81%EA%B8%B0%EC%99%80_%EC%8B%9D%EA%B8%B0%EC%84%B8%EC%B2%99%EA%B8%B0,_%EC%98%81%EA%B5%AD%EC%84%9C_%EB%AC%BC%EC%82%AC%EC%9A%A9_%ED%9A%A8%EC%9C%A8_%EC%B5%9C%EC%9A%B0%EC%88%98_%EC%A0%9C%ED%92%88_%EC%88%98%EC%83%81.jpg |
| packs/img/inventions-wheel.jpg | Wheel | Heidi B | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:Wagenraeder-FH000008_1.JPG |
| packs/img/inventions-wind-turbine.jpg | Wind turbine | Hans Hillewaert | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Windmills_D1-D4_(Thornton_Bank).jpg |
| packs/img/iran.jpg | Iran | Hansueli Krapf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Persepolis_24.11.2009_11-18-45.jpg |
| packs/img/iraq.jpg | Iraq | Hasan a. almoosawi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Farm_land_in_albasrah_iraq_01.jpg |
| packs/img/israel.jpg | Israel | AbuAssab | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Haifa_Bay_Panorama.jpg |
| packs/img/italy.jpg | Italy | Nicholas Hartmann | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Rome_Colosseum_exterior_1.jpg |
| packs/img/ivory-coast.jpg | Ivory Coast | Mickaël T. | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Yamoussoukro_panorama.jpg |
| packs/img/jamaica.jpg | Jamaica | This picture has been taken by Oleg Yunakov . Contact e-mail: yunakov gmail.com . Image can be used in accordance with the terms of the СС-BY-SA license. Other photos can be seen here . | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Jamaica_-_Negril_-_047.jpg |
| packs/img/japan.jpg | Japan | David Kernan | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Minato_City,_Tokyo,_Japan.jpg |
| packs/img/jordan.jpg | Jordan | Vyacheslav Argenberg | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Wadi_Musa,_Jordan,_Mountains.jpg |
| packs/img/kazakhstan.jpg | Kazakhstan | Казбеков Нуржан Есенгельдиевич | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Burabay_winter.jpg |
| packs/img/kenya.jpg | Kenya | Lafleursauvage | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Amboseli_Park_-_Kilimanjaro_elephant.jpg |
| packs/img/kiribati.jpg | Kiribati | User Mark Tranchant on en.wikipedia | Public domain | https://commons.wikimedia.org/wiki/File:Bikeman_island_1975.jpg |
| packs/img/kosovo.jpg | Kosovo | KastriotThaqi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kosovo_B_Power_Station.jpg |
| packs/img/kuwait.jpg | Kuwait | Zainqasem | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kuwait_beach_with_sunrise.jpg |
| packs/img/kyrgyzstan.jpg | Kyrgyzstan | Bgag | CC0 | https://commons.wikimedia.org/wiki/File:Tian_Shan_in_Kyrgyzstan_02.jpg |
| packs/img/latvia.jpg | Latvia | simka | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Winter_landscape_in_Latvia,_2012.jpg |
| packs/img/lebanon.jpg | Lebanon | Eusebius | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Pano_Baalbek_1.jpg |
| packs/img/lesotho.jpg | Lesotho | Sheane Moji | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Landscape_View,.jpg |
| packs/img/liberia.jpg | Liberia | David Stanley | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Liberian_Capitol_Building.jpg |
| packs/img/libya.jpg | Libya | David Holt | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Temple_of_Zeus_Cyrene.jpg |
| packs/img/lightning.jpg | Lightning | Postdlf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Lightning_in_Arlington.jpg |
| packs/img/lithuania.jpg | Lithuania | Wojsyl | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Lithuania_Centre_of_Europe.jpg |
| packs/img/luxembourg.jpg | Luxembourg | Ipigott | CC0 | https://commons.wikimedia.org/wiki/File:Luxembourg_Moselle_Vinyards_Machtum.JPG |
| packs/img/madagascar.jpg | Madagascar | Bernard Gagnon | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Landscape_Madagascar_05.jpg |
| packs/img/malawi.jpg | Malawi | Dr. Ondřej Havelka (cestovatel) | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Malawi_Village.jpg |
| packs/img/malaysia.jpg | Malaysia | Pangalau | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Parliament_House_of_Malaysia_(cropped_4to3_landscape).jpg |
| packs/img/maldives.jpg | Maldives | O'Dea | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Aquanaut_Explorer,_1987.jpg |
| packs/img/mali.jpg | Mali | Dr. Ondřej Havelka (cestovatel) | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Koro,_Mali.jpg |
| packs/img/malta.jpg | Malta | Peter Flass | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Malta_Corners,_Malta_NY.jpg |
| packs/img/mauritania.jpg | Mauritania | LBM1948 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Mauritania,_desierto_1997_02.jpg |
| packs/img/mauritius.jpg | Mauritius | Hansueli Krapf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Landscape_near_Les_Mariannes,_Mauritius,_2007-09-09.jpg |
| packs/img/mexico.jpg | Mexico | Daniel Schwen | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chichen_Itza_3.jpg |
| packs/img/moldova.jpg | Moldova | Duesseljan | CC0 | https://commons.wikimedia.org/wiki/File:Jewish_Cultural_Centre_Chisinau_1.jpg |
| packs/img/monaco.jpg | Monaco | VictiniFan360 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Monaco_Souvenir_Passport-Notes_page.jpg |
| packs/img/mongolia.jpg | Mongolia | Bernard Gagnon | CC0 | https://commons.wikimedia.org/wiki/File:Landscape_of_Kh%C3%B6vsg%C3%B6l_Province.jpg |
| packs/img/montenegro.jpg | Montenegro | Daniya.Mostovaya | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Wind_Park_Mozura_Montenegro_(1).jpg |
| packs/img/morocco.jpg | Morocco | Rosino | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Erg_Chebbi_Maroc.jpg |
| packs/img/mozambique.jpg | Mozambique | Paulo Oliveira at English Wikipedia | Public domain | https://commons.wikimedia.org/wiki/File:Gurue_Mount_Murresse.jpg |
| packs/img/myanmar.jpg | Myanmar | Jakub Hałun | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:20160813_Shwedagon_Pagoda_9949_DxO.jpg |
| packs/img/namibia.jpg | Namibia | Hans Hillewaert | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Equus_burchelli_4.jpg |
| packs/img/nauru.jpg | Nauru | U.S. Department of Energy's Atmospheric Radiation Measurement Program | Public domain | https://commons.wikimedia.org/wiki/File:Aerial_view_of_Nauru.jpg |
| packs/img/nepal.jpg | Nepal | Vyacheslav Argenberg | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Himalayas,_Cholatse,_Nepal.jpg |
| packs/img/netherlands.jpg | Netherlands | Fractal Caleidoscope | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Winter_landscape_in_the_Netherlands.jpg |
| packs/img/nicaragua.jpg | Nicaragua | Adrian Sampson from Bainbridge Island, WA, USA | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Down_to_laguna_(landscape).jpg |
| packs/img/niger.jpg | Niger | Roland Hunziker https://www.flickr.com/photos/rolandh/ | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Elephants_bath_park_w_Niger_2006.jpg |
| packs/img/nigeria.jpg | Nigeria | Hui Linbo | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Zuma_Rock_in_the_dry_season.jpg |
| packs/img/north-korea.jpg | North Korea | Kok Leng Yeo from Singapore, Singapore | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:North_Korea-Pyongyang-Arirang_Mass_Games-01_(1).jpg |
| packs/img/north-macedonia.jpg | North Macedonia | Alekishere at English Wikipedia | Public domain | https://commons.wikimedia.org/wiki/File:Macedonian_parliament_interior.jpg |
| packs/img/norway.jpg | Norway | Johannes Groll followhansi | CC0 | https://commons.wikimedia.org/wiki/File:Lofoten,_Norway_(Unsplash).jpg |
| packs/img/ohms-law.jpg | Ohm's law | Daniel Villafruela . | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Saint_%C3%89tienne-Georg_Ohm-20140328.jpg |
| packs/img/oman.jpg | Oman | Sakralamn | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Nakhal_Fort_Sultanate_of_Oman_001.jpg |
| packs/img/pakistan.jpg | Pakistan | Muhammad Umair Mirza | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Badshahi_Mosque_(Lahore).jpg |
| packs/img/palestine.jpg | Palestine | Addshore | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Palestine_with_sheep_panorama.jpg |
| packs/img/panama.jpg | Panama | Dozenist | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Panama_City_from_Administration_Buildling_01.jpg |
| packs/img/papua-new-guinea.jpg | Papua New Guinea | Mschlauch | Public domain | https://commons.wikimedia.org/wiki/File:Port_Moresby_Town_Mschlauch.JPG |
| packs/img/paraguay.jpg | Paraguay | Cmasi | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Tebicuary_landscape_IMG_8300.JPG |
| packs/img/people-ada-lovelace.jpg | Ada Lovelace | Alfred Edward Chalon | Public domain | https://commons.wikimedia.org/wiki/File:Ada_Lovelace_portrait.jpg |
| packs/img/people-alan-turing.jpg | Alan Turing | Elliott & Fry | Public domain | https://commons.wikimedia.org/wiki/File:Alan_turing_header.jpg |
| packs/img/people-albert-einstein.jpg | Albert Einstein | Ferdinand Schmutzer / Adam Cuerden | Public domain | https://commons.wikimedia.org/wiki/File:Einstein_1921_by_F_Schmutzer_-_restoration.jpg |
| packs/img/people-amelia-earhart.jpg | Amelia Earhart | Underwood & Underwood (active 1880 – c. 1950) [1] | Public domain | https://commons.wikimedia.org/wiki/File:Amelia_Earhart_standing_under_nose_of_her_Lockheed_Model_10-E_Electra,_small_(cropped).jpg |
| packs/img/people-barack-obama.jpg | Barack Obama | Official White House Photo by Pete Souza | Public domain | https://commons.wikimedia.org/wiki/File:President_Barack_Obama_(1).jpg |
| packs/img/people-charles-darwin.jpg | Charles Darwin | Peter_Glyn | CC0 | https://commons.wikimedia.org/wiki/File:Statue_of_Charles_Darwin_Shrewsbury.jpg |
| packs/img/people-chinua-achebe.jpg | Chinua Achebe | Stuart C. Shapiro | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Chinua_Achebe_-_Buffalo_25Sep2008_crop.jpg |
| packs/img/people-christopher-columbus.jpg | Christopher Columbus | AgnosticPreachersKid | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Christopher_Columbus_Monument_4.JPG |
| packs/img/people-florence-nightingale.jpg | Florence Nightingale | H. Lenthall, London | Public domain | https://commons.wikimedia.org/wiki/File:Florence_Nightingale_CDV_by_H_Lenthall.jpg |
| packs/img/people-haile-selassie-i.jpg | Haile Selassie I | unknown; according to [1] and [2] an official portrait of which b/w copies were distributed by the Ethiopian government | Public domain | https://commons.wikimedia.org/wiki/File:Haile_Selassie_in_full_dress_(3x4_cropped).jpg |
| packs/img/people-helen-keller.jpg | Helen Keller | Los Angeles Times; restored by User:Rhododendrites | Public domain | https://commons.wikimedia.org/wiki/File:Helen_Keller_circa_1920_-_restored.jpg |
| packs/img/people-ibn-battuta.jpg | Ibn Battuta | Imre Solt | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Ibn_Battuta_Mall_on_2_June_2007_Pict_3.jpg |
| packs/img/people-isaac-newton.jpg | Isaac Newton | Godfrey Kneller | Public domain | https://commons.wikimedia.org/wiki/File:GodfreyKneller-IsaacNewton-1689.jpg |
| packs/img/people-jane-goodall.jpg | Jane Goodall | U.S. Department of State from United States | Public domain | https://commons.wikimedia.org/wiki/File:Deputy_Secretary_Higginbottom_Poses_for_a_Photo_With_Dr._Jane_Goodall_and_the_State_Department%27s_Global_Health_Diplomacy_Director_Jordan_in_Washington_(22365513310)_(2)_(cropped_2).jpg |
| packs/img/people-kofi-annan.jpg | Kofi Annan | US Mission in Geneva | Public domain | https://commons.wikimedia.org/wiki/File:Kofi_Annan_2012_(cropped).jpg |
| packs/img/people-mahatma-gandhi.jpg | Mahatma Gandhi | Elliott & Fry | Public domain | https://commons.wikimedia.org/wiki/File:Mahatma-Gandhi,_studio,_1931.jpg |
| packs/img/people-malala-yousafzai.jpg | Malala Yousafzai | flowcomm | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Malala_Yousafzai_2023_portrait_2x3.jpg |
| packs/img/people-mansa-musa.jpg | Mansa Musa | attributed to Abraham Cresques | Public domain | https://commons.wikimedia.org/wiki/File:Catalan_Atlas_BNF_Sheet_6_Mansa_Musa_(cropped).jpg |
| packs/img/people-marco-polo.jpg | Marco Polo | xiquinhosilva | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Statue_of_Marco_Polo_(Ulaanbaatar_-_54510007902).jpg |
| packs/img/people-marie-curie.jpg | Marie Curie | Henri Manuel | Public domain | https://commons.wikimedia.org/wiki/File:Marie_Curie_c1920.jpg |
| packs/img/people-martin-luther-king-jr.jpg | Martin Luther King Jr. | Bernie Faingold | Public domain | https://commons.wikimedia.org/wiki/File:Martin_Luther_King,_Jr..jpg |
| packs/img/people-mother-teresa.jpg | Mother Teresa | Túrelio | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:MotherTeresa_090.jpg |
| packs/img/people-nelson-mandela.jpg | Nelson Mandela | Kingkongphoto & www.celebrity-photos.com from Laurel | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Nelson_Mandela_1994_(2).jpg |
| packs/img/people-nikola-tesla.jpg | Nikola Tesla | Napoleon Sarony | Public domain | https://commons.wikimedia.org/wiki/File:Tesla_circa_1890.jpeg |
| packs/img/people-rosa-parks.jpg | Rosa Parks | John Mathew Smith & www.celebrity-photos.com from Laurel Maryland, USA | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Rosa_Parks_1997.jpg |
| packs/img/people-stephen-hawking.jpg | Stephen Hawking | Tanya Hart | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Relative_time_(2886233692)_(Stephen_Hawking_cropped).jpg |
| packs/img/people-thomas-edison.jpg | Thomas Edison | Louis Bachrach, Bachrach Studios , restored by Michel Vuijlsteke | Public domain | https://commons.wikimedia.org/wiki/File:Thomas_Edison2.jpg |
| packs/img/people-tim-berners-lee.jpg | Tim Berners-Lee | Paul Clarke | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Sir_Tim_Berners-Lee.jpg |
| packs/img/people-winston-churchill.jpg | Winston Churchill | Original: Greg78uk Derivative work: Off2riorob ( talk ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Winston_Spencer-Churchill_(1997).jpg |
| packs/img/people-wright-brothers.jpg | Wright brothers | Unknown author Unknown author | Public domain | https://commons.wikimedia.org/wiki/File:Orville_Wright.jpg |
| packs/img/peoples-republic-of-china.jpg | People's Republic of China | Velatrix | CC0 | https://commons.wikimedia.org/wiki/File:Great_Wall_of_China_July_2006.JPG |
| packs/img/peru.jpg | Peru | Allard Schmidt (The Netherlands) | Public domain | https://commons.wikimedia.org/wiki/File:Peru_Machu_Picchu_Sunrise.jpg |
| packs/img/philippines.jpg | Philippines | Wolfgang Hägele | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chocolate_Hills_Carmen_Bohol_2019.jpg |
| packs/img/poland.jpg | Poland | This photo was taken by Przemysław Jahr Autorem zdjęcia jest Przemysław Jahr Wykorzystując zdjęcie proszę podać jako autora: Przemysław Jahr / Wikimedia Commons | Public domain | https://commons.wikimedia.org/wiki/File:Wilan%C3%B3w_Palace.jpg |
| packs/img/portugal.jpg | Portugal | Berit Watkin from London/ UK, UK | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Landscape_in_Portugal_(17021425272).jpg |
| packs/img/qatar.jpg | Qatar | Lilac landscape | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Lilac_landscape_qatar_(cropped).JPG |
| packs/img/republic-of-ireland.jpg | Republic of Ireland | Sixflashphoto | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Dublin_City_Hall_1.jpg |
| packs/img/republic-of-the-congo.jpg | Republic of the Congo | Bsm15 | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Sunrise_on_the_Congo_River_-_2.JPG |
| packs/img/romania.jpg | Romania | Thalpha | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Retezat_Mountain_-_Spring_Waterfall_02.JPG |
| packs/img/russia.jpg | Russia | Petar Milošević | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Sant_Vasily_cathedral_in_Moscow.JPG |
| packs/img/rwanda.jpg | Rwanda | Carine06 from UK | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Rwandan_landscape_(8219706414).jpg |
| packs/img/saint-kitts-and-nevis.jpg | Saint Kitts and Nevis | Gertjan R. | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Basseterre_from_sea_2.JPG |
| packs/img/saint-lucia.jpg | Saint Lucia | P. Hughes | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Saint_Lucia_-_Castries_Harbor.jpg |
| packs/img/samoa.jpg | Samoa | Stephen Glauser | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Beach_on_Upolu_Island,_Samoa,_2009.jpg |
| packs/img/sao-tome-and-principe.jpg | São Tomé and Príncipe | David Stanley from Nanaimo, Canada | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Sao_Tome_Street_(20101565569)_(2).jpg |
| packs/img/saudi-arabia.jpg | Saudi Arabia | BroadArrow at English Wikipedia | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Abha_from_Abha_Palace_Hotel.JPG |
| packs/img/science-acid.jpg | Acid | Chemicalinterest | Public domain | https://commons.wikimedia.org/wiki/File:Zn_reaction_with_HCl.JPG |
| packs/img/science-atom.jpg | Atom | Ernest Rutherford | Public domain | https://commons.wikimedia.org/wiki/File:Rutherford-atom-for-carbon_lg.jpg |
| packs/img/science-carbon.jpg | Carbon | Robert M. Lavinsky | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Graphite-and-diamond-with-scale.jpg |
| packs/img/science-chemical-element.jpg | Chemical element | Deglr6328 at the English Wikipedia . | Public domain | https://commons.wikimedia.org/wiki/File:Sulfur.jpg |
| packs/img/science-chemical-reaction.jpg | Chemical reaction | No machine-readable author provided. Miskatonic assumed (based on copyright claims). | CC BY 2.5 | https://commons.wikimedia.org/wiki/File:Rust03102006.JPG |
| packs/img/science-energy.jpg | Energy | Colin | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Plasma_globe_60th.jpg |
| packs/img/science-force.jpg | Force | US Air Force from USA | Public domain | https://commons.wikimedia.org/wiki/File:Pushing_to_the_finish_line_(14887290649).jpg |
| packs/img/science-gas.jpg | Gas | Macluskie | Public domain | https://commons.wikimedia.org/wiki/File:Purplesmoke.jpg |
| packs/img/science-gold.jpg | Gold | James St. John | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Gold_nugget_(Australia)_4_(16848647509).jpg |
| packs/img/science-gravity.jpg | Gravity | NASA | Public domain | https://commons.wikimedia.org/wiki/File:GPB_circling_earth.jpg |
| packs/img/science-heat.jpg | Heat | Hinode JAXA/NASA | Public domain | https://commons.wikimedia.org/wiki/File:171879main_LimbFlareJan12_lg.jpg |
| packs/img/science-hydrogen.jpg | Hydrogen | Edward William Cocks | Public domain | https://commons.wikimedia.org/wiki/File:Cocks,_Balloon_Leaving_Dover_(1840).jpg |
| packs/img/science-iron.jpg | Iron | Photographic Collection from Australia | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Iron_ore,_Newcastle_(3057429699).jpg |
| packs/img/science-light.jpg | Light | Pittigrilli | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Light_spectrum_on_a_wall_caused_by_sunlight_going_through_prism_and_then_handmade_glass.jpg |
| packs/img/science-liquid.jpg | Liquid | José Manuel Suárez from Spain | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Water_drop_001.jpg |
| packs/img/science-magnet.jpg | Magnet | GOKLuLe 盧樂 | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Magnetite_sample_with_neodymium_magnet.jpg |
| packs/img/science-mass.jpg | Mass | Coyau | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Poids_fonte_2_kg_03_(cropped).jpg |
| packs/img/science-matter.jpg | Matter | Henryk Niestrój | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:L%C3%B3d_na_jeziorze.jpg |
| packs/img/science-molecule.jpg | Molecule | Kota Iwata et al. | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:PTCDA_AFM.jpg |
| packs/img/science-nuclear-power.jpg | Nuclear power | Hansueli Krapf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:2011-05-10_18-57-46_Switzerland_-_Wil_crop.jpg |
| packs/img/science-oxygen.jpg | Oxygen | U.S. Air Force/Staff Sgt. Jim Araos | Public domain | https://commons.wikimedia.org/wiki/File:Liquid_oxygen_in_a_beaker_4.jpg |
| packs/img/science-periodic-table.jpg | Periodic table | José A. Flores-Livas, Lilia Boeri, Antonio Sanna, Gianni Profeta, Ryotaro Arita, Mikhail Eremets | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Periodic_table_with_superconducting_temperatures.jpg |
| packs/img/science-pressure.jpg | Pressure | Fumikas Sagisavas | CC0 | https://commons.wikimedia.org/wiki/File:Pressure_gauge_of_brake_pipe.jpg |
| packs/img/science-radioactive-decay.jpg | Radioactive decay | Department of Energy | Public domain | https://commons.wikimedia.org/wiki/File:Plutonium_pellet.jpg |
| packs/img/science-salt.jpg | Salt | Didier Descouens | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Selpologne.jpg |
| packs/img/science-solid.jpg | Solid | NASA/Marshall | Public domain | https://commons.wikimedia.org/wiki/File:Insulincrystals.jpg |
| packs/img/science-sound.jpg | Sound | Infrogmation of New Orleans | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Thoth08BigasDrumEvansChalmette.jpg |
| packs/img/science-speed-of-light.jpg | Speed of light | InSapphoWeTrust | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Luxor_Light_Beam_by_inSapphoWeTrust.jpeg |
| packs/img/science-temperature.jpg | Temperature | No machine-readable author provided. CambridgeBayWeather assumed (based on copyright claims). | Public domain | https://commons.wikimedia.org/wiki/File:Maximum_thermometer_close_up_2.JPG |
| packs/img/science-water.jpg | Water | Jason Auch | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Iceberg_from_overhead_IMG_0320.jpg |
| packs/img/senegal.jpg | Senegal | Dorothy Voorhees | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:On_the_road_to_Dimboli-Senegal(2).jpg |
| packs/img/serbia.jpg | Serbia | Elemirus | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Elemir_landscape_001.jpeg |
| packs/img/seychelles.jpg | Seychelles | Hajira Amla, Seychelles News Agency | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:North_Island_Seychelles_landscape.jpg |
| packs/img/sierra-leone.jpg | Sierra Leone | LindsayStark | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Sierra_Leone_Road.jpg |
| packs/img/singapore.jpg | Singapore | Kroisenbrunner . | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Singapore_port_panorama.jpg |
| packs/img/slovakia.jpg | Slovakia | Michalsmr | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Sitno_nov_2023.jpg |
| packs/img/slovenia.jpg | Slovenia | Doremo | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Zakal_Slovenia_-_landscape.jpg |
| packs/img/solomon-islands.jpg | Solomon Islands | U.S. Central Intelligence Agency | Public domain | https://commons.wikimedia.org/wiki/File:Solomon_Islands_1989.jpg |
| packs/img/somalia.jpg | Somalia | Rahim Alpa | Public domain | https://commons.wikimedia.org/wiki/File:Somalia,_Puntland,_Bari,_Bargal_(01).jpg |
| packs/img/south-africa.jpg | South Africa | South African Tourism from South Africa | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Table_Mountain_from_Blouberg,_South_Africa_(4028515275).jpg |
| packs/img/south-korea.jpg | South Korea | Frank Schulenburg | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Gyeonghoeru_(Royal_Banquet_Hall)_at_Gyeongbokgung_Palace,_Seoul.jpg |
| packs/img/south-sudan.jpg | South Sudan | Lomondi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Landscape_of_my_house.jpg |
| packs/img/space-apollo-11.jpg | Apollo 11 | Neil Armstrong | Public domain | https://commons.wikimedia.org/wiki/File:Aldrin_Apollo_11_original.jpg |
| packs/img/space-asteroid.jpg | Asteroid | 243_ida.jpg : NASA/JPL derivative work: Chzz ► | Public domain | https://commons.wikimedia.org/wiki/File:243_ida_crop.jpg |
| packs/img/space-big-bang.jpg | Big Bang | NASA/WMAP Science Team | Public domain | https://commons.wikimedia.org/wiki/File:CMB_Timeline300_no_WMAP.jpg |
| packs/img/space-black-hole.jpg | Black hole | Event Horizon Telescope | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Black_hole_-_Messier_87.jpg |
| packs/img/space-comet.jpg | Comet | E. Kolmhofer, H. Raab; Johannes-Kepler-Observatory, Linz, Austria ( https://sternwarte.at ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Comet_Hale-Bopp_1995O1.jpg |
| packs/img/space-constellation.jpg | Constellation | Jan Heweliusz | Public domain | https://commons.wikimedia.org/wiki/File:Orion_constellation_-_Prodromus_astronomiae_1690_(5590584).jpg |
| packs/img/space-galaxy.jpg | Galaxy | European Space Agency | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Birds_of_a_feather_(50071190086).jpg |
| packs/img/space-hubble-space-telescope.jpg | Hubble Space Telescope | NASA | Public domain | https://commons.wikimedia.org/wiki/File:Hubble_2009_close-up_2.jpg |
| packs/img/space-international-space-station.jpg | International Space Station | NASA/Crew of STS-132 | Public domain | https://commons.wikimedia.org/wiki/File:International_Space_Station_after_undocking_of_STS-132.jpg |
| packs/img/space-jupiter.jpg | Jupiter | NASA, ESA, and A. Simon (Goddard Space Flight Center) | Public domain | https://commons.wikimedia.org/wiki/File:Jupiter_and_its_shrunken_Great_Red_Spot.jpg |
| packs/img/space-mars.jpg | Mars | ESA & MPS for OSIRIS Team MPS/UPD/LAM/IAA/RSSD/INTA/UPM/DASP/IDA, CC BY-SA 3.0 IGO | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:OSIRIS_Mars_true_color.jpg |
| packs/img/space-mercury.jpg | Mercury | NASA / Johns Hopkins University Applied Physics Laboratory / Carnegie Institution of Washington . Edited version of Image:Mercury in color - Prockter07.jpg by Papa Lima Whiskey . | Public domain | https://commons.wikimedia.org/wiki/File:Mercury_in_color_-_Prockter07_centered.jpg |
| packs/img/space-milky-way.jpg | Milky Way | ESO/ Y. Beletsky | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:ESO-VLT-Laser-phot-33a-07.jpg |
| packs/img/space-moon.jpg | Moon | Neil A. Armstrong | Public domain | https://commons.wikimedia.org/wiki/File:Aldrin_Apollo_11.jpg |
| packs/img/space-nebula.jpg | Nebula | David (Deddy) Dayag | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Trifid_Nebula_by_Deddy_Dayag.jpg |
| packs/img/space-neil-armstrong.jpg | Neil Armstrong | Unknown author Unknown author | Public domain | https://commons.wikimedia.org/wiki/File:Neil_Armstrong_pose.jpg |
| packs/img/space-neptune.jpg | Neptune | NASA / Jet Propulsion Lab / U.S. Geological Survey | Public domain | https://commons.wikimedia.org/wiki/File:Triton_moon_mosaic_Voyager_2_(large).jpg |
| packs/img/space-pluto.jpg | Pluto | NASA / Johns Hopkins University Applied Physics Laboratory / Southwest Research Institute | Public domain | https://commons.wikimedia.org/wiki/File:Pluto-01_Stern_03_Pluto_Color_TXT.jpg |
| packs/img/space-saturn.jpg | Saturn | NASA/JPL | Public domain | https://commons.wikimedia.org/wiki/File:Cassini_Saturn_Orbit_Insertion.jpg |
| packs/img/space-solar-eclipse.jpg | Solar eclipse | Luc Viatour | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Solar_eclipse_1999_4.jpg |
| packs/img/space-solar-system.jpg | Solar System | wikipedia user Brian0918 | Public domain | https://commons.wikimedia.org/wiki/File:Terrestrial_planet_size_comparisons.jpg |
| packs/img/space-space-shuttle.jpg | Space Shuttle | NASA; edited by jjron (tilt corrected) | Public domain | https://commons.wikimedia.org/wiki/File:STS120LaunchHiRes-edit1.jpg |
| packs/img/space-star.jpg | Star | Matúš Motlo | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:The_Sun_in_white_light.jpg |
| packs/img/space-sun.jpg | Sun | Matúš Motlo | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:The_Sun_in_white_light.jpg |
| packs/img/space-supernova.jpg | Supernova | David Mülheims (David Muelheims) | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:SN2005cs.jpg |
| packs/img/space-telescope.jpg | Telescope | Andrew Dunn | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:100inchHooker.jpg |
| packs/img/space-uranus.jpg | Uranus | NASA | Public domain | https://commons.wikimedia.org/wiki/File:Uranus_Final_Image.jpg |
| packs/img/space-venus.jpg | Venus | NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington | Public domain | https://commons.wikimedia.org/wiki/File:Venus_2_Approach_Image.jpg |
| packs/img/space-voyager-1.jpg | Voyager 1 | NASA | Public domain | https://commons.wikimedia.org/wiki/File:Great_Red_Spot_From_Voyager_1.jpg |
| packs/img/space-yuri-gagarin.jpg | Yuri Gagarin | Александр Моклецов / СовИнформБюро | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Yuri_Gagarin_with_awards_(cropped)_2.jpg |
| packs/img/spain.jpg | Spain | Suicasmo | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Exterior_of_the_Sagrada_Fam%C3%ADlia_20171225.jpg |
| packs/img/sri-lanka.jpg | Sri Lanka | Christophe Meneboeuf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:SriLanka_Elephants_(pixinn.net).jpg |
| packs/img/static-electricity.jpg | Static electricity | Sagadattolembay | CC0 | https://commons.wikimedia.org/wiki/File:Electric_spark.jpg |
| packs/img/sudan.jpg | Sudan | walter callens | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Western_Deffufa_-_Kerma.jpg |
| packs/img/suriname.jpg | Suriname | Forrestjunky | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Suriname_rainforest_villages.jpg |
| packs/img/sweden.jpg | Sweden | Pudelek | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Swedish_landscape_near_Bj%C3%B6rnlunda_(by_Pudelek)_01.jpg |
| packs/img/switzerland.jpg | Switzerland | Benjamin Gimmel BenHur | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Schweiz_Schloss_Chillon_Gesamtansicht.jpg |
| packs/img/syria.jpg | Syria | Somar Samrah | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:The_Umayyad_square.jpg |
| packs/img/taiwan.jpg | Taiwan | TaiwanBro | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Taichung_Metropolitan_Park_Lake.jpg |
| packs/img/tajikistan.jpg | Tajikistan | Шухрат Саъдиев | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Tajikistan_Fan-Mountains_-_landscape_03.JPG |
| packs/img/tanzania.jpg | Tanzania | Diego Delso | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kilimanjaro,_Tanzania,_2024-05-22,_DD_15.jpg |
| packs/img/thailand.jpg | Thailand | Vyacheslav Argenberg | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Krabi,_Limestone_karst_landscape,_Thailand.jpg |
| packs/img/the-bahamas.jpg | The Bahamas | Gervacio Rosales | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Nassau,_The_Bahamas_-_panoramio_(3).jpg |
| packs/img/the-gambia.jpg | The Gambia | Mark Hodson Photos | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Makasutu_Forest,_The_Gambia_(16223036065).jpg |
| packs/img/togo.jpg | Togo | Erik Kristensen | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Togo_Taberma_house_02.jpg |
| packs/img/tonga.jpg | Tonga | Duncan from Wellington, NZ | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Eua_National_Park,_Tonga.jpg |
| packs/img/trinidad-and-tobago.jpg | Trinidad and Tobago | cheesy 42 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Castara_Bay_(Tobago_2009).jpg |
| packs/img/tunisia.jpg | Tunisia | Amanimersni | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Natur_tunisia(1).jpg |
| packs/img/turkey.jpg | Turkey | Benh LIEU SONG ( Flickr ) | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Cappadocia_Aerial_View_Landscape.jpg |
| packs/img/turkmenistan.jpg | Turkmenistan | ILMur | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Panorama_From_Ashgabat_TV_Tower.JPG |
| packs/img/tuvalu.jpg | Tuvalu | Stefan Lins | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Tuvalu_Funafuti_atoll_beach.jpg |
| packs/img/uganda.jpg | Uganda | not not phil from SF, CA, US | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Uganda_-_growing_millet.jpg |
| packs/img/ukraine.jpg | Ukraine | Zyoru | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Oblasts_of_Ukraine_(in_Kashmiri).jpg |
| packs/img/united-arab-emirates.jpg | United Arab Emirates | Like My Travel from Peru | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Dubai_downtown,_United_Arab_Emirates_(49786413631).jpg |
| packs/img/united-kingdom.jpg | United Kingdom | Diliff | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Tower_Bridge_London_Feb_2006.jpg |
| packs/img/united-states.jpg | United States | Daniel Schwen | Public domain | https://commons.wikimedia.org/wiki/File:Statue_of_Liberty_frontal_2.jpg |
| packs/img/uruguay.jpg | Uruguay | Libertinus | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:R%C3%ADo_Uruguay_en_Bella_Uni%C3%B3n.jpg |
| packs/img/uzbekistan.jpg | Uzbekistan | Bgag | CC0 | https://commons.wikimedia.org/wiki/File:Kyzylkum_Desert_in_Uzbekistan.jpg |
| packs/img/vanuatu.jpg | Vanuatu | Phillip Capper from Wellington, New Zealand | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Port_Vila_aerial.jpg |
| packs/img/vatican-city.jpg | Vatican City | Krzysztof Golik | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Gardens_in_the_Vatican_City_(3).jpg |
| packs/img/venezuela.jpg | Venezuela | Wilfredor | CC0 | https://commons.wikimedia.org/wiki/File:Panoramic_of_Juan_Griego_45.jpg |
| packs/img/vietnam.jpg | Vietnam | Thomas Hirsch / User:Ravn | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Halong_Bay_in_Vietnam.jpg |
| packs/img/voltage.jpg | Voltage | Contraix | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:CH_Capdella,_3_volt%C3%ADmetres.jpg |
| packs/img/wildlife-bat.jpg | Bat | MathKnight | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Wikipedia-Bats-001-v01.jpg |
| packs/img/wildlife-blue-whale.jpg | Blue whale | NOAA Photo Library | Public domain | https://commons.wikimedia.org/wiki/File:Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg |
| packs/img/wildlife-butterfly.jpg | Butterfly | Thomas Bresson | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Gonepteryx_rhamni_-_Citron-1.jpg |
| packs/img/wildlife-camel.jpg | Camel | No machine-readable author provided. EmmanuelFAIVRE assumed (based on copyright claims). | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Bactrian_Camel.jpg |
| packs/img/wildlife-cheetah.jpg | Cheetah | Charles J. Sharp | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Cheetah_(Acinonyx_jubatus)_female_2.jpg |
| packs/img/wildlife-chimpanzee.jpg | Chimpanzee | Charles J. Sharp | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Common_chimpanzee_(Pan_troglodytes_schweinfurthii)_feeding.jpg |
| packs/img/wildlife-crocodile.jpg | Crocodile | Leigh Bedford | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Nile_crocodile_head.jpg |
| packs/img/wildlife-dolphin.jpg | Dolphin | NASA | Public domain | https://commons.wikimedia.org/wiki/File:Tursiops_truncatus_01.jpg |
| packs/img/wildlife-elephant.jpg | Elephant | Charles J. Sharp | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Desert_elephant_(Loxodonta_africana)_spraying_sand.jpg |
| packs/img/wildlife-frog.jpg | Frog | Charlie Jackson | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Red-eyed_Leaf_Frog_(49661076226).jpg |
| packs/img/wildlife-giant-panda.jpg | Giant panda | Jeff Kubina | Public domain | https://commons.wikimedia.org/wiki/File:Giant_Panda_2004-03-2.jpg |
| packs/img/wildlife-giraffe.jpg | Giraffe | Miroslav Duchacek (from Czech Republic) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Giraffe_standing.jpg |
| packs/img/wildlife-gorilla.jpg | Gorilla | Thurundir | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Gorille_des_plaines_de_l%27ouest_%C3%A0_l%27Espace_Zoologique.jpg |
| packs/img/wildlife-hippopotamus.jpg | Hippopotamus | Nevit Dilmen ( talk ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Hippopotamus_amphibius_in_Tanzania_4041_Nevit.jpg |
| packs/img/wildlife-honey-bee.jpg | Honey bee | Tanner Smida | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:The_Lone_Pollinator.jpg |
| packs/img/wildlife-hummingbird.jpg | Hummingbird | Charles J. Sharp | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Trinidad_and_Tobago_hummingbirds_composite.jpg |
| packs/img/wildlife-kangaroo.jpg | Kangaroo | Charles J. Sharp | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Forester_kangaroo_(Macropus_giganteus_tasmaniensis)_juvenile_hopping_Esk_Valley.jpg |
| packs/img/wildlife-koala.jpg | Koala | Diliff | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Koala_climbing_tree.jpg |
| packs/img/wildlife-komodo-dragon.jpg | Komodo dragon | Charles J. Sharp | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Komodo_dragon_(Varanus_komodoensis).jpg |
| packs/img/wildlife-lion.jpg | Lion | Giles Laurent | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg |
| packs/img/wildlife-octopus.jpg | Octopus | albert kok | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Octopus2.jpg |
| packs/img/wildlife-owl.jpg | Owl | Athene_noctua_(portrait).jpg : Trebol-a derivative work: Stemonitis ( talk ) | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Athene_noctua_(cropped).jpg |
| packs/img/wildlife-penguin.jpg | Penguin | Godot13 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:South_Shetland-2016-Deception_Island%E2%80%93Chinstrap_penguin_(Pygoscelis_antarctica)_04.jpg |
| packs/img/wildlife-platypus.jpg | Platypus | Klaus | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Wild_Platypus_4.jpg |
| packs/img/wildlife-polar-bear.jpg | Polar bear | Alan Wilson | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Polar_Bear_-_Alaska_(cropped).jpg |
| packs/img/wildlife-rhinoceros.jpg | Rhinoceros | Giles Laurent | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:081_White_rhinoceros_(male)_in_the_Kalahari_Desert_of_Namibia_Photo_by_Giles_Laurent.jpg |
| packs/img/wildlife-shark.jpg | Shark | Hermanus Backpackers | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Great_white_shark_south_africa.jpg |
| packs/img/wildlife-tiger.jpg | Tiger | Rahulsharma photography | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Royal_Bengal_Tiger_at_Kanha_National_Park.jpg |
| packs/img/wildlife-wolf.jpg | Wolf | Retron | Public domain | https://commons.wikimedia.org/wiki/File:Howlsnow.jpg |
| packs/img/wildlife-zebra.jpg | Zebra | Yathin S Krishnappa | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Equus_quagga_(Namutoni,_2012).jpg |
| packs/img/yemen.jpg | Yemen | Bernard Gagnon | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Yemen_landscape_05.jpg |
| packs/img/zambia.jpg | Zambia | DBrianWilson | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Big_Tree_Natl_Mont_Kabwe.JPG |
| packs/img/zimbabwe.jpg | Zimbabwe | JackyR | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Curled_trunk.jpg |
<!-- packs:end -->
