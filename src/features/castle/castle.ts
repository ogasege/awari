/** Pure rules for the Castle (06-castle). */
import type { PackId, Question, QuizSet } from '../../lib/packs/types.ts';
import { reduce, type Action, type QuizState } from '../quiz/quizMachine.ts';

export const ROOMS = 12;

export interface Wing {
  id: string;
  name: string;
  pack: PackId;
  /** Which pack articles feed the wing. */
  continent?: string;
  blurb: string;
}

export const WINGS: readonly Wing[] = [
  { id: 'africa', name: 'The Africa wing', pack: 'countries', continent: 'Africa', blurb: 'Twelve doors, one for each journey across Africa.' },
  { id: 'electricity', name: 'The Electricity wing', pack: 'physics', blurb: 'Twelve doors that hum with sparks, circuits and lightning.' },
];

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
