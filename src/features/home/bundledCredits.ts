/**
 * Credit lines for the photographs bundled with the app (design kit and
 * subject covers), so a page's footer can name exactly the photos it shows
 * (21-review-2 Req 13). `credits.test.ts` checks every entry against the
 * rows of CREDITS.md, which stays the full record.
 */
export interface BundledCredit {
  /** URL path of the file, as used in an <img src>. */
  src: string;
  title: string;
  author: string;
  licence: string;
}

export const BUNDLED_CREDITS: readonly BundledCredit[] = [
  { src: '/photos/earth.jpg', title: 'The Earth', author: 'NASA (Apollo 17 crew)', licence: 'public domain' },
  { src: '/photos/milkyway.jpg', title: 'The Milky Way', author: 'NASA/JPL-Caltech/ESA/CXC/STScI', licence: 'public domain' },
  { src: '/photos/falls.jpg', title: 'Victoria Falls', author: 'Diego Delso', licence: 'CC BY-SA 4.0' },
  { src: '/photos/kili.jpg', title: 'Kilimanjaro', author: 'Diego Delso', licence: 'CC BY-SA 4.0' },
  { src: '/photos/elephant.jpg', title: 'Elephants', author: 'Charles J. Sharp', licence: 'CC BY-SA 4.0' },
  { src: '/photos/pyramids.jpg', title: 'The pyramids', author: 'Ricardo Liberato', licence: 'CC BY-SA 2.0' },
  { src: '/photos/lightning.jpg', title: 'Lightning', author: 'Mathias Krumbholz', licence: 'CC BY-SA 3.0' },
  { src: '/photos/castle.jpg', title: 'The Gondar castle', author: 'Bernard Gagnon', licence: 'CC BY-SA 3.0' },
  { src: '/photos/zuma.jpg', title: 'Zuma Rock', author: 'Hui Linbo', licence: 'CC BY-SA 4.0' },
  { src: '/photos/lokoja.jpg', title: 'The Niger at Lokoja', author: 'Samlokoja', licence: 'CC BY-SA 4.0' },
  { src: '/photos/covers/countries.jpg', title: 'Flags of the world', author: 'Annatsach', licence: 'CC BY 4.0' },
  { src: '/photos/covers/wildlife.jpg', title: 'A lion', author: 'Kevin Pluck', licence: 'CC BY 2.0' },
  { src: '/photos/covers/space.jpg', title: 'Saturn', author: 'NASA / JPL / Space Science Institute', licence: 'public domain' },
  { src: '/photos/covers/earth.jpg', title: 'Mount Everest', author: 'Luca Galuzzi (Lucag)', licence: 'CC BY-SA 2.5' },
  { src: '/photos/covers/body.jpg', title: 'A human skeleton', author: 'Mr Khubaib Sani', licence: 'CC BY-SA 4.0' },
  { src: '/photos/covers/science.jpg', title: 'Laboratory flasks', author: 'Stanislav.nevyhosteny', licence: 'CC BY-SA 4.0' },
  { src: '/photos/covers/physics.jpg', title: 'A plasma ball', author: 'Luc Viatour', licence: 'CC BY-SA 3.0' },
  { src: '/photos/covers/inventions.jpg', title: 'The first flight', author: 'John T. Daniels', licence: 'public domain' },
  { src: '/photos/covers/people.jpg', title: 'Albert Einstein', author: 'Ferdinand Schmutzer / Adam Cuerden', licence: 'public domain' },
  { src: '/photos/covers/arts.jpg', title: 'The Mona Lisa', author: 'Leonardo da Vinci', licence: 'public domain' },
];

/**
 * The credit sentence for exactly the photographs in `shown` (image URLs):
 * one clause per distinct bundled photo, in the order first shown. URLs
 * that are not bundled photos (article photos from a pack) are skipped;
 * they carry their own credit on the article page.
 */
export function creditLine(shown: readonly string[]): string {
  const seen = new Set<string>();
  const clauses: string[] = [];
  for (const src of shown) {
    if (seen.has(src)) continue;
    seen.add(src);
    const c = BUNDLED_CREDITS.find((x) => x.src === src);
    if (c) clauses.push(`${c.title} by ${c.author} (${c.licence})`);
  }
  return clauses.length === 0 ? '' : `Photos from Wikimedia Commons: ${clauses.join('; ')}.`;
}
