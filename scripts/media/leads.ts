/**
 * The lead picture of an article, pinned by hand (26-final-review D-2, D-3, D-12, D-13, D-16, D-27, D-36 to D-39).
 *
 * The library orders an article's pictures by recognition and frame, which picked a plate of nachos and a glass of
 * beer for Movie theatre, a smoker's lung for Carbon and a laboratory sensor for Brain. Each line below names a
 * picture already in that article's record (so nothing new has to be collected or licence-checked) that shows what
 * the article is about. `scripts/media/build.ts` moves it to the front of the chosen set in both passes, so it is
 * the picture marked `lead` and the first print in the article strip.
 */

/** Article key (`pack/id`) to the Commons title of its lead picture. */
export const LEAD_PINS: ReadonlyArray<readonly [string, string]> = [
  // The lead was nachos and a glass of beer; this one is the inside of a cinema.
  ['arts/movie-theatre', 'File:Hoyts Carousel Movie Theatre gobeirne.jpg'],
  // The lead was a smoker's emphysema lung; carbon itself is diamond and graphite.
  ['science/carbon', 'File:Graphite-and-diamond-with-scale.jpg'],
  // The lead was a magnetic sensor "about the size of a sugar cube", from File:Brain Sensor.jpg.
  ['body/brain', 'File:3D Medical Animation Mid-Brain Different Parts.jpg'],
  // The lead was a Venus fly trap.
  ['body/digestion', 'File:Various steps in the process of digestion.jpg'],
  // The lead was the Tokyo 1964 Paralympic opening ceremony.
  ['arts/olympic-games', 'File:Birdsclosing.jpg'],
  // The lead was an astronomy painting (Wright of Derby, The Orrery); this is a mill interior with its machines.
  ['ancient/industrial-revolution', "File:Marshall's flax-mill, Holbeck, Leeds - interior - c.1800.jpg"],
  // The lead was the Olympic Village house, a building, on a biography.
  ['arts/jesse-owens', 'File:Jesse Owens 1936.jpg'],
  // The lead was a pair of common toads on the Frog article.
  ['wildlife/frog', 'File:Pristimantis moro.jpg'],
  // The lead was textured craft card, which is card, not paper.
  ['inventions/paper', 'File:Various products made from paper.JPG'],
  // The lead file was File:A Korean Mask.jpg with a caption about a Japanese festival: file and caption disagreed.
  ['arts/mask', 'File:Topeng Bali.jpg'],
  // The lead was captioned "Men climbing a mountain"; this one shows the mountain.
  ['earth/mount-kilimanjaro', 'File:Mlima Kilimanjaro.jpg'],
  // The lead caption was a restoration note; the picture itself is a Featured photograph of the steamboat.
  ['inventions/steamboat', 'File:SteamboatBenCampbellb.jpg'],
  // 26-final-review N-7: leads the round-2 review found wrong, each replaced by a picture already in the article's record.
  // The lead was Haeckel’s tree of life, a biology diagram.
  ["science/atom", "File:202 Two Models of Atomic Structure.jpg"],
  // The lead was a wolf "shot at the Minnesota Zoo".
  ["countries/mexico", "File:Murales Rivera - Markt in Tlatelolco 3.jpg"],
  // The lead was uploader chatter about a train.
  ["countries/peoples-republic-of-china", "File:ThreeGorgesDam-China2009.jpg"],
  // The lead was a football fixture.
  ["countries/moldova", "File:Parliament Building in Chișinău.jpg"],
  // The lead was a portrait of a US Air Force technician.
  ["countries/saint-lucia", "File:Bridge St, Saint Lucia - panoramio.jpg"],
  // The lead was "Investigating the point 1 of the curve".
  ["physics/electrical-circuit", "File:8-1 Decoder Circuit.jpg"],
  // The lead was a coin caption cut to "2 grams, and has a diameter".
  ["science/gold", "File:Fine gold and gold coins.jpg"],
  // The lead was a nebula, cut mid-number.
  ["science/hydrogen", "File:Gase-in-Entladungsroehren.jpg"],
  // The lead was a caption cut mid-number.
  ["space/voyager-1", "File:Record is attached to Voyager 1.jpg"],
  // The lead was a crash, cut mid-sentence.
  ["space/neil-armstrong", "File:As11-40-5886.jpg"],
  // The lead was a map catalogue entry.
  ["space/mars", "File:The Serpent Dust Devil on Mars PIA15116.jpg"],
  // The lead was Pluto, which is not an asteroid.
  ["space/asteroid", "File:Inner solar system linear map.png"],
  // The lead was one element, sulfur.
  ["science/periodic-table", "File:B&W PT.jpg"],
  // The lead was "The walls of the cells have been removed".
  ["wildlife/honey-bee", "File:The Lone Pollinator.jpg"],
  // The lead was a garden sign.
  ["people/isaac-newton", "File:Portrait of Sir Isaac Newton, 1689 (brightened).jpg"],
  // The lead caption was an uploader's opinion.
  ["people/malala-yousafzai", "File:Malala Yousafzai and Kaliash Satyarthi at the Nobel Peace Prize ceremony.jpg"],
  // The lead caption was not about the picture.
  ["space/sun", "File:Sun in fog in Lysekil.jpg"],
  // The lead caption was catalogue fields.
  ["earth/mount-fuji", "File:Fuji, assorted - FujiAssorted6859.jpg"],
  // The lead was blade fuses.
  ["inventions/automobile", "File:2011 Nissan Leaf SL -- 10-28-2011.jpg"],
  // The lead caption was a research sentence.
  ["body/immune-system", "File:Immune Cells Surrounding Hair Follicles in Mouse Skin (7747051716).jpg"],
  // The lead was a press dateline in capitals.
  ["body/vaccine", "File:Priorix.jpg"],
  // The lead caption opened with "It" and named nothing.
  ["countries/chile", "File:Iglesia de Achao - fachada.JPG"],
  // The lead was a moth, captioned "It is native…".
  ["countries/india", "File:Valley of flowers national park, Uttarakhand, India 03 (edit).jpg"],
  // The lead caption opened with "It" and named nothing.
  ["countries/morocco", "File:Volubilis Longshot II.jpg"],
  // The lead was "a ship in the river".
  ["countries/cameroon", "File:Rhumsiki Peak.jpg"],
  // The lead caption opened with "it" and named nothing.
  ["countries/guatemala", "File:Tikal mayan ruins 2009.jpg"],
  // The lead was a mortuary cast of an ear.
  ["body/ear", "File:LimaconChauveau1890MeyCh.jpg"],
  // The lead was a fly.
  ["body/eye", "File:Elana's left eye.jpg"],
  // The lead was a school science lab.
  ["body/heart", "File:Franklin Heart.jpg"],
  // The lead was an archaeological site.
  ["body/human-skeleton", "File:Human-Skeleton.jpg"],
  // The lead was an apartheid sign; a country's one lead print is its landscape.
  ["countries/south-africa", "File:South Africa - Drakensberg (16261357780).jpg"],
];

const PINS = new Map(LEAD_PINS);

/** The Commons title pinned as the lead of an article, if any. */
export function pinnedLead(articleKey: string): string | undefined {
  return PINS.get(articleKey);
}

/**
 * The chosen pictures with the pinned lead first, and the rest in their order. A pin that no longer matches a chosen
 * picture (the file was dropped, or the article has none) changes nothing.
 */
export function pinLead<T extends { title: string }>(articleKey: string, chosen: readonly T[]): T[] {
  const title = PINS.get(articleKey);
  if (title === undefined) return [...chosen];
  const lead = chosen.filter((c) => c.title === title);
  return lead.length === 0 ? [...chosen] : [...lead, ...chosen.filter((c) => c.title !== title)];
}
