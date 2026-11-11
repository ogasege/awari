import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Question } from '../../lib/packs/types.ts';
import { initialState, MAX_HINTS, reduce, visibleOptions, type Action, type QuizState } from './quizMachine.ts';

const question = fc
  .record({ answer: fc.integer({ min: 0, max: 3 }), order: fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 }) })
  .map(({ answer, order }): Question => {
    const wrong = order.filter((i) => i !== answer);
    return {
      id: 'q', articleId: 'a', pack: 'countries', prompt: 'p?', options: ['a', 'b', 'c', 'd'], answer,
      hints: { nudge: 'n', whereToLook: 'w', removed: [wrong[0] as number, wrong[1] as number] },
      proof: 'x', proofSection: '',
    };
  });

const action: fc.Arbitrary<Action> = fc.oneof(
  fc.integer({ min: 0, max: 3 }).map((option) => ({ type: 'select' as const, option })),
  fc.constant({ type: 'check' as const }),
  fc.constant({ type: 'hint' as const }),
  fc.constant({ type: 'next' as const }),
);

function run(qs: Question[], actions: Action[], check: (prev: QuizState, next: QuizState, a: Action) => void) {
  let s = initialState();
  for (const a of actions) {
    const n = reduce(qs, s, a);
    check(s, n, a);
    s = n;
  }
  return s;
}

describe('quiz state machine (05-quizzes)', () => {
  it('Property 4: hints are revealed one at a time, in order, never more than three (Req 2.1)', () => {
    fc.assert(
      fc.property(fc.array(question, { minLength: 1, maxLength: 5 }), fc.array(action, { maxLength: 80 }), (qs, as) => {
        run(qs, as, (prev, next) => {
          expect(next.hintsUsed).toBeLessThanOrEqual(MAX_HINTS);
          if (next.index === prev.index) {
            expect(next.hintsUsed - prev.hintsUsed).toBeGreaterThanOrEqual(0);
            expect(next.hintsUsed - prev.hintsUsed).toBeLessThanOrEqual(1);
          } else {
            expect(next.hintsUsed).toBe(0);
          }
        });
      }),
    );
  });

  it('Property 5: after hint 3 exactly the answer and one wrong option remain (Req 2.3)', () => {
    fc.assert(
      fc.property(question, (q) => {
        const visible = visibleOptions(q, 3);
        expect(visible).toHaveLength(2);
        expect(visible).toContain(q.answer);
        expect(visibleOptions(q, 2)).toHaveLength(4);
      }),
    );
  });

  it('Property 5b: a removed option can never be selected (Req 2.3)', () => {
    fc.assert(
      fc.property(question, fc.array(action, { maxLength: 40 }), (q, as) => {
        run([q], as, (_prev, next) => {
          if (next.hintsUsed >= 3 && next.selected !== null && next.index === 0) {
            expect(q.hints.removed).not.toContain(next.selected);
          }
        });
      }),
    );
  });

  it('Property 7: score is 0..n and counts questions answered right before reveal (Req 3.5)', () => {
    fc.assert(
      fc.property(fc.array(question, { minLength: 1, maxLength: 5 }), fc.array(action, { maxLength: 120 }), (qs, as) => {
        let rights = 0;
        const end = run(qs, as, (prev, next) => {
          if (prev.status !== 'right' && next.status === 'right') rights += 1;
          expect(next.status === 'right' && prev.status === 'revealed').toBe(false);
        });
        expect(end.score).toBe(rights);
        expect(end.score).toBeGreaterThanOrEqual(0);
        expect(end.score).toBeLessThanOrEqual(qs.length);
      }),
    );
  });

  it('a perfect run scores five', () => {
    const qs = fc.sample(question, 5);
    let s = initialState();
    for (const q of qs) {
      s = reduce(qs, s, { type: 'select', option: q.answer });
      s = reduce(qs, s, { type: 'check' });
      s = reduce(qs, s, { type: 'next' });
    }
    expect(s).toMatchObject({ status: 'done', score: 5 });
  });
});
