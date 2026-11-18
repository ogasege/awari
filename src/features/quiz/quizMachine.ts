/**
 * The quiz as a pure state machine, shared by the Quiz screen and the
 * Castle. Hints come strictly in order; a wrong answer can be tried
 * again once, then the answer and its proof are shown.
 */
import type { Question } from '../../lib/packs/types.ts';

export type Status = 'asking' | 'wrong' | 'right' | 'revealed' | 'done';

export interface QuizState {
  index: number;
  selected: number | null;
  /** Hints shown for the current question, 0 to 3. */
  hintsUsed: number;
  /** Wrong tries on the current question. */
  tries: number;
  status: Status;
  score: number;
  totalHints: number;
}

export type Action =
  | { type: 'select'; option: number }
  | { type: 'check' }
  | { type: 'hint' }
  | { type: 'next' };

export const MAX_HINTS = 3;
export const MAX_TRIES = 2;

/** A true or false question has two options, so it has no "take away two answers" rung and only one try. */
export const isTwoWay = (q: Question): boolean => q.options.length === 2;
export const maxHints = (q: Question): number => (isTwoWay(q) ? MAX_HINTS - 1 : MAX_HINTS);
export const maxTries = (q: Question): number => (isTwoWay(q) ? 1 : MAX_TRIES);

export function initialState(): QuizState {
  return { index: 0, selected: null, hintsUsed: 0, tries: 0, status: 'asking', score: 0, totalHints: 0 };
}

/** Options still on the card after the hints so far. */
export function visibleOptions(q: Question, hintsUsed: number): number[] {
  const removed: readonly number[] = hintsUsed >= MAX_HINTS ? q.hints.removed : [];
  return q.options.map((_, i) => i).filter((i) => !removed.includes(i));
}

const answering = (s: QuizState): boolean => s.status === 'asking' || s.status === 'wrong';

export function reduce(questions: readonly Question[], s: QuizState, a: Action): QuizState {
  const q = questions[s.index];
  if (!q || s.status === 'done') {
    return s.status === 'done' ? s : { ...s, status: 'done' };
  }
  switch (a.type) {
    case 'select':
      if (!answering(s) || !visibleOptions(q, s.hintsUsed).includes(a.option)) return s;
      return { ...s, selected: a.option };
    case 'hint': {
      if (!answering(s) || s.hintsUsed >= maxHints(q)) return s;
      const hintsUsed = s.hintsUsed + 1;
      const stillVisible = s.selected !== null && visibleOptions(q, hintsUsed).includes(s.selected);
      return { ...s, hintsUsed, totalHints: s.totalHints + 1, selected: stillVisible ? s.selected : null };
    }
    case 'check': {
      if (!answering(s) || s.selected === null) return s;
      if (s.selected === q.answer) {
        return { ...s, status: 'right', score: s.score + 1 };
      }
      const tries = s.tries + 1;
      return { ...s, tries, status: tries >= maxTries(q) ? 'revealed' : 'wrong', selected: tries >= maxTries(q) ? s.selected : null };
    }
    case 'next': {
      if (s.status !== 'right' && s.status !== 'revealed') return s;
      const index = s.index + 1;
      return {
        ...s,
        index,
        selected: null,
        hintsUsed: 0,
        tries: 0,
        status: index >= questions.length ? 'done' : 'asking',
      };
    }
  }
}
