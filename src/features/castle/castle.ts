/** Pure rules for the Castle (06-castle). */
import { coverFor } from '../../lib/packs/covers.ts';
import { packUrl } from '../../lib/packs/load.ts';
import { CONTINENTS, SUBJECTS, continentSlug, type Continent } from '../../lib/packs/subjects.ts';
import type { PackId, Question, QuizSet } from '../../lib/packs/types.ts';
import { reduce, type Action, type QuizState } from '../quiz/quizMachine.ts';

export const ROOMS = 12;

export interface Wing {
  id: string;
  name: string;
  pack: PackId;
  /** For a continent wing: which countries feed it. */
  continent?: Continent;
  /** Where the gate page lists it. */
  group: 'world' | 'subject';
  blurb: string;
}

/** Wing id for a subject: the pack id, except Electricity (kept as 'electricity'). */
const subjectWingId = (pack: string): string => (pack === 'physics' ? 'electricity' : pack);

const WORLD_WINGS: readonly Wing[] = CONTINENTS.map((continent) => ({
  id: continentSlug(continent),
  name: `The ${continent} wing`,
  pack: 'countries',
  continent,
  group: 'world',
  blurb: `Twelve doors, one for each journey across ${continent}.`,
}));

const SUBJECT_BLURBS: Record<string, string> = {
  physics: 'Twelve doors that hum with sparks, circuits and lightning.',
  wildlife: 'Twelve doors that growl, flap and rustle with wild animals.',
  space: 'Twelve doors that open onto planets, stars and rockets.',
  ancient: 'Twelve doors into pyramids, empires and the long story of people.',
  earth: 'Twelve doors that rumble with mountains, volcanoes, rivers and seas.',
  body: 'Twelve doors inside you: hearts, brains, bones and senses.',
  science: 'Twelve doors of atoms, forces, light and sound.',
  inventions: 'Twelve doors of wheels, engines and bright ideas.',
  people: 'Twelve doors, each with someone who changed the world.',
  arts: 'Twelve doors of music, art, games and great athletes.',
};

const SUBJECT_WINGS: readonly Wing[] = SUBJECTS.filter((s) => s.id !== 'countries').map((s) => ({
  id: subjectWingId(s.id),
  name: `The ${s.name.replace(/^The /, '')} wing`,
  pack: s.id,
  group: 'subject',
  blurb: SUBJECT_BLURBS[s.id] ?? 'Twelve doors, twelve questions.',
}));

/** Sixteen wings: six continents and ten subjects, twelve rooms each (17-castle-wings). */
export const WINGS: readonly Wing[] = [...WORLD_WINGS, ...SUBJECT_WINGS];

/**
 * Interleaves questions round-robin across quiz sets: every set's first
 * question, then every set's second, and so on.
 */
export function buildPool(sets: readonly QuizSet[]): Question[] {
  const pool: Question[] = [];
  const longest = Math.max(0, ...sets.map((s) => s.questions.length));
  for (let i = 0; i < longest; i += 1) {
    for (const s of sets) {
      const q = s.questions[i];
      if (q) pool.push(q);
    }
  }
  return pool;
}

/** Castle play state: the quiz state over the pool plus rooms lit. */
export interface CastleState {
  quiz: QuizState;
  lit: number;
}

/** Starts a visit at the saved number of lit rooms. */
export function startCastle(savedLit: number, poolLength: number): CastleState {
  const lit = Math.max(0, Math.min(ROOMS, savedLit));
  return {
    lit,
    quiz: {
      index: poolLength > 0 ? lit % poolLength : 0,
      selected: null,
      hintsUsed: 0,
      tries: 0,
      status: lit >= ROOMS ? 'done' : 'asking',
      score: 0,
      totalHints: 0,
    },
  };
}

/** One step: a right answer lights the next room; reveals keep it dark. */
export function castleReduce(pool: readonly Question[], s: CastleState, a: Action): CastleState {
  if (s.lit >= ROOMS || pool.length === 0) {
    return s;
  }
  let quiz = reduce(pool, s.quiz, a);
  let lit = s.lit;
  if (quiz.status === 'right' && s.quiz.status !== 'right') {
    lit = Math.min(ROOMS, lit + 1);
  }
  // Walk round the pool forever instead of ending the quiz.
  if (quiz.status === 'done' && lit < ROOMS) {
    quiz = { ...quiz, index: 0, status: 'asking' };
  }
  return { quiz, lit };
}

/** A reviewed picture for a wing's card: the subject's cover, or a famous place on the continent (22-review-3 Req 19). */
export function wingPrint(wing: Wing): { src: string; alt: string } | undefined {
  if (wing.group === 'subject') {
    const cover = coverFor(wing.pack === 'physics' ? 'physics' : wing.pack);
    return cover ? { src: cover.file, alt: cover.alt } : undefined;
  }
  const place = CONTINENT_PRINTS[wing.continent ?? ''];
  return place ? { src: packUrl(place.file), alt: place.alt } : undefined;
}

const CONTINENT_PRINTS: Readonly<Record<string, { file: string; alt: string }>> = {
  Africa: { file: 'img/egypt.jpg', alt: 'The three great pyramids of Giza standing in the desert' },
  Asia: { file: 'img/india.jpg', alt: 'The white marble Taj Mahal with its dome and four tall towers' },
  Europe: { file: 'img/france.jpg', alt: 'The Eiffel Tower in Paris' },
  'North America': { file: 'img/united-states.jpg', alt: 'The Statue of Liberty holding up her torch, seen from the front' },
  'South America': { file: 'img/brazil.jpg', alt: 'The statue of Christ the Redeemer above the clouds in Rio de Janeiro' },
  Oceania: { file: 'img/australia.jpg', alt: 'The Sydney Opera House lit up at night, its white shells beside the harbour with the city skyline behind' },
};
