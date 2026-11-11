import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Question, QuizSet, Source } from '../../lib/packs/types.ts';
import type { Action } from '../quiz/quizMachine.ts';
import { buildPool, castleReduce, ROOMS, startCastle } from './castle.ts';

const src: Source = { name: 's', url: 'https://x.org', licence: 'CC BY-SA 4.0', licenceUrl: 'https://x.org', retrieved: '2026-11-11' };

const q = (article: string, n: number, answer = 0): Question => ({
  id: `${article}/${n}`, articleId: article, pack: 'countries', prompt: `${article} ${n}?`,
  options: ['a', 'b', 'c', 'd'], answer, hints: { nudge: 'n', whereToLook: 'w', removed: [(answer + 1) % 4, (answer + 2) % 4] },
  proof: 'p', proofSection: '',
});

const sets = fc
  .array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 12 })
  .map((counts) =>
    counts.map((c, i): QuizSet => ({
      articleId: `a${i}`, pack: 'countries', title: `A${i}`, source: src,
      questions: Array.from({ length: c }, (_, n) => q(`a${i}`, n)),
    })),
  );

const action: fc.Arbitrary<Action> = fc.oneof(
  fc.integer({ min: 0, max: 3 }).map((option) => ({ type: 'select' as const, option })),
  fc.constant({ type: 'check' as const }),
  fc.constant({ type: 'hint' as const }),
  fc.constant({ type: 'next' as const }),
);

describe('castle (06-castle)', () => {
  it('Property 1: neighbours in the pool come from different articles when possible (Req 1.3)', () => {
    fc.assert(
      fc.property(sets, (ss) => {
        const pool = buildPool(ss);
        for (let i = 1; i < pool.length; i += 1) {
          if (pool[i]!.articleId === pool[i - 1]!.articleId) {
            // Only allowed once every other article has run out.
            const rest = pool.slice(i - 1).map((x) => x.articleId);
            expect(new Set(rest).size).toBe(1);
          }
        }
      }),
    );
  });

  it('Property 2: the pool holds every question exactly once (Req 1.2)', () => {
    fc.assert(
      fc.property(sets, (ss) => {
        const ids = buildPool(ss).map((x) => x.id).sort();
        expect(ids).toEqual(ss.flatMap((s) => s.questions.map((x) => x.id)).sort());
      }),
    );
  });

  it('Property 3: lit rooms start at the saved count, never drop and never pass 12 (Req 2.2, 2.3, 2.5)', () => {
    fc.assert(
      fc.property(sets, fc.integer({ min: -3, max: 15 }), fc.array(action, { maxLength: 150 }), (ss, saved, as) => {
        const pool = buildPool(ss);
        let s = startCastle(saved, pool.length);
        expect(s.lit).toBe(Math.max(0, Math.min(ROOMS, saved)));
        for (const a of as) {
          const n = castleReduce(pool, s, a);
          expect(n.lit).toBeGreaterThanOrEqual(s.lit);
          expect(n.lit - s.lit).toBeLessThanOrEqual(1);
          expect(n.lit).toBeLessThanOrEqual(ROOMS);
          s = n;
        }
      }),
    );
  });

  it('Property 4: twelve right answers light the whole wing (Req 2.4)', () => {
    fc.assert(
      fc.property(sets, (ss) => {
        const pool = buildPool(ss);
        let s = startCastle(0, pool.length);
        for (let i = 0; i < ROOMS; i += 1) {
          const cur = pool[s.quiz.index]!;
          s = castleReduce(pool, s, { type: 'select', option: cur.answer });
          s = castleReduce(pool, s, { type: 'check' });
          s = castleReduce(pool, s, { type: 'next' });
        }
        expect(s.lit).toBe(ROOMS);
      }),
    );
  });
});
