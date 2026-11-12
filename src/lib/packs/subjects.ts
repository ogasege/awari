/**
 * The subjects Awari is organised into, shared by the app, the content
 * pipeline and the tests (15-subject-packs). A subject is either the
 * Countries pack, the Electricity pack or one of the nine subject packs.
 */

/** The nine curated subject packs added after Countries and Electricity. */
export type SubjectPackId =
  | 'wildlife'
  | 'space'
  | 'ancient'
  | 'earth'
  | 'body'
  | 'science'
  | 'inventions'
  | 'people'
  | 'arts';

/** Every pack of bundled articles. `wiki` articles are loaded on demand. */
export type BundledPackId = 'countries' | 'physics' | SubjectPackId;

export interface Subject {
  /** Same as the pack id. */
  id: BundledPackId;
  name: string;
  /** One friendly sentence for the subject page and Home. */
  blurb: string;
  /** Short handwritten label for prints. */
  label: string;
}

/** In display order. */
export const SUBJECTS: readonly Subject[] = [
  { id: 'countries', name: 'Countries of the world', label: 'Countries', blurb: 'Every country on the globe: its places, people, facts and stamp.' },
  { id: 'wildlife', name: 'Wildlife', label: 'Wildlife', blurb: 'Animals big and small, from elephants and whales to bees and bats.' },
  { id: 'space', name: 'Space', label: 'Space', blurb: 'Planets, stars, rockets and the people who explore beyond the sky.' },
  { id: 'ancient', name: 'Ancient worlds and history', label: 'Ancient worlds', blurb: 'Pyramids, empires and the ideas that built the world we know.' },
  { id: 'earth', name: 'Earth', label: 'Mountains and rivers', blurb: 'Mountains, volcanoes, rivers and oceans: how our planet is shaped.' },
  { id: 'body', name: 'The human body', label: 'The human body', blurb: 'How your heart, brain, bones and senses work.' },
  { id: 'science', name: 'Physics and chemistry', label: 'Physics and chemistry', blurb: 'Atoms, forces, light, sound and the stuff everything is made of.' },
  { id: 'physics', name: 'Electricity', label: 'Electricity', blurb: 'Sparks, circuits, batteries and lightning.' },
  { id: 'inventions', name: 'Inventions and technology', label: 'Inventions', blurb: 'Machines and ideas that changed how people live.' },
  { id: 'people', name: 'Famous people', label: 'Famous people', blurb: 'Scientists, leaders, explorers and thinkers who shaped history.' },
  { id: 'arts', name: 'Arts, music and sport', label: 'Arts, music and sport', blurb: 'Painting, music, games and the athletes who inspire us.' },
];

const BY_ID = new Map<string, Subject>(SUBJECTS.map((s) => [s.id, s]));

/** The subject with this id, if there is one. */
export function subjectById(id: string): Subject | undefined {
  return BY_ID.get(id);
}

/** The nine subject packs, in display order. */
export const SUBJECT_PACKS: readonly SubjectPackId[] = [
  'wildlife',
  'space',
  'ancient',
  'earth',
  'body',
  'science',
  'inventions',
  'people',
  'arts',
];

/** Every bundled pack id: Countries, Electricity and the nine subject packs. */
export const BUNDLED_PACKS: readonly BundledPackId[] = SUBJECTS.map((s) => s.id);

/** True for an id of a bundled pack. */
export function isBundledPack(id: string): id is BundledPackId {
  return BY_ID.has(id);
}

/** The six continents with countries, in display order. */
export const CONTINENTS = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
] as const;

export type Continent = (typeof CONTINENTS)[number];

/** Continents timeline events may name: the six above and Antarctica. */
export const EVENT_CONTINENTS = [...CONTINENTS, 'Antarctica'] as const;

export type EventContinent = (typeof EVENT_CONTINENTS)[number];

/** URL slug of a continent, such as "north-america". */
export function continentSlug(continent: string): string {
  return continent.toLowerCase().replace(/\s+/g, '-');
}

/** The continent for a slug, if there is one. */
export function continentFromSlug(slug: string): Continent | undefined {
  return CONTINENTS.find((c) => continentSlug(c) === slug);
}

/** Countries with this continent name count towards the six continents. */
export function normaliseContinent(name: string | undefined): Continent | undefined {
  if (name === 'Insular Oceania') {
    return 'Oceania';
  }
  return CONTINENTS.find((c) => c === name);
}
