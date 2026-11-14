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
