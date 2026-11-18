import { describe, expect, it } from 'vitest';
import type { Question } from '../../lib/packs/types.ts';
import { initialState, reduce } from './quizMachine.ts';

const q: Question = {
  id: 'x/1',
  articleId: 'x',
  pack: 'countries',
  prompt: 'Which?',
  options: ['A', 'B', 'C', 'D'],
  answer: 2,
  hints: { nudge: 'n', whereToLook: 'w', removed: [0, 1] },
  proof: 'C.',
  proofSection: '',
};

describe('a tried ticket is marked and cannot be picked again (owner feedback, 18 Nov)', () => {
  it('records the wrong pick, refuses it a second time, and clears on the next question', () => {
    let s = reduce([q, q], initialState(), { type: 'select', option: 0 });
    s = reduce([q, q], s, { type: 'check' });
    expect(s.status).toBe('wrong');
    expect(s.tried).toEqual([0]);
    expect(reduce([q, q], s, { type: 'select', option: 0 }).selected).toBeNull();
    s = reduce([q, q], s, { type: 'select', option: 2 });
    s = reduce([q, q], s, { type: 'check' });
    expect(s.status).toBe('right');
    s = reduce([q, q], s, { type: 'next' });
    expect(s.tried).toEqual([]);
  });
});
