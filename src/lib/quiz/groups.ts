/**
 * What kind of thing an article is, for picture questions (24-review-4 Req 7). "What is this a picture of?" is a fair
 * question only when the wrong answers are the same kind of thing as the right one (all planets, all animals, all
 * landmarks), and only for articles that are one thing a camera can show. Articles about ideas (the Big Bang,
 * gravity, the Renaissance) have no group and no picture question.
 */

export interface QuizGroup {
  id: string;
  /** The question asked about a picture of this kind of thing. */
  prompt: string;
}

const G = {
  animals: { id: 'animals', prompt: 'Which animal is this a picture of?' },
  countries: { id: 'countries', prompt: 'Which country is this a picture of?' },
  planets: { id: 'planets', prompt: 'Which planet is this a picture of?' },
  sky: { id: 'sky', prompt: 'What is this a picture of?' },
  craft: { id: 'craft', prompt: 'What is this a picture of?' },
  rivers: { id: 'rivers', prompt: 'Which river is this a picture of?' },
  mountains: { id: 'mountains', prompt: 'Which mountain, volcano or range is this a picture of?' },
  seas: { id: 'seas', prompt: 'Which sea or reef is this a picture of?' },
  landmarks: { id: 'landmarks', prompt: 'Which place or monument is this a picture of?' },
  people: { id: 'people', prompt: 'Who is this a picture of?' },
  things: { id: 'things', prompt: 'What is this a picture of?' },
} satisfies Record<string, QuizGroup>;

const SPACE: Record<string, QuizGroup> = {
  mercury: G.planets,
  venus: G.planets,
  mars: G.planets,
  jupiter: G.planets,
  saturn: G.planets,
  uranus: G.planets,
  neptune: G.planets,
  pluto: G.planets,
  star: G.sky,
  sun: G.sky,
  moon: G.sky,
  supernova: G.sky,
  'black-hole': G.sky,
  nebula: G.sky,
  galaxy: G.sky,
  'milky-way': G.sky,
  comet: G.sky,
  asteroid: G.sky,
  'solar-eclipse': G.sky,
  'apollo-11': G.craft,
  'space-shuttle': G.craft,
  'international-space-station': G.craft,
  'hubble-space-telescope': G.craft,
  'voyager-1': G.craft,
  telescope: G.craft,
  'neil-armstrong': G.people,
  'yuri-gagarin': G.people,
};

const EARTH_RIVERS = ['amazon-river', 'congo-river', 'danube', 'ganges', 'mekong-river', 'mississippi-river', 'murray-river', 'niger-river', 'nile', 'rhine-river', 'yangtze-river'];
const EARTH_MOUNTAINS = ['alps', 'andes', 'himalayas', 'rocky-mountains', 'krakatoa', 'popocatepetl', 'volcano'];
const EARTH_SEAS = ['arctic-ocean', 'atlantic-ocean', 'great-barrier-reef'];

const ANCIENT_LANDMARKS = ['colosseum', 'colossus-of-rhodes', 'great-pyramid-of-giza', 'great-wall-of-china', 'great-zimbabwe', 'hanging-gardens-of-babylon', 'lighthouse-of-alexandria', 'machu-picchu', 'pompeii', 'sphinx', 'stonehenge', 'temple-of-artemis'];

/** The group of an article key such as `space/mars`, or undefined when a picture cannot fairly ask what it is. */
export function groupOf(articleKey: string): QuizGroup | undefined {
  const [pack, id = ''] = articleKey.split('/');
  switch (pack) {
    case 'wildlife':
      return G.animals;
    case 'countries':
      return G.countries;
    case 'people':
      return G.people;
    case 'inventions':
      return G.things;
    case 'space':
      return SPACE[id];
    case 'earth':
      if (EARTH_RIVERS.includes(id) || id === 'rhine-river') return G.rivers;
      if (EARTH_MOUNTAINS.includes(id) || id.startsWith('mount-')) return G.mountains;
      if (EARTH_SEAS.includes(id)) return G.seas;
      return undefined;
    case 'ancient':
      if (ANCIENT_LANDMARKS.includes(id)) return G.landmarks;
      return undefined;
    default:
      return undefined;
  }
}

/** The subjects that have picture quizzes: those with articles that are one thing a camera can show. */
export const PICTURE_QUIZ_SUBJECTS: ReadonlySet<string> = new Set(['wildlife', 'countries', 'space', 'earth', 'ancient', 'people', 'inventions']);
