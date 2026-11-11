import fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { applyDemoFromUrl } from './demo.ts';
import {
  EMPTY_PROGRESS,
  getProgress,
  loadProgress,
  normalise,
  resetForTests,
  update,
  withDiscovered,
  withQuizResult,
  withRoomsLit,
} from './progress.ts';

const slug = fc.stringMatching(/^[a-z-]{1,12}$/);

describe('progress store (09-offline)', () => {
  beforeEach(async () => {
    resetForTests();
    await update(() => EMPTY_PROGRESS);
    resetForTests();
  });

  it('persists to IndexedDB and reads back', async () => {
    await update((p) => withDiscovered(p, 'nigeria'));
    resetForTests();
    expect((await loadProgress()).discovered).toEqual(['nigeria']);
  });

  it('Property: discovering is idempotent and keeps first-seen order', () => {
    fc.assert(
      fc.property(fc.array(slug), (slugs) => {
        const p = slugs.reduce(withDiscovered, EMPTY_PROGRESS);
        expect(p.discovered).toEqual([...new Set(slugs)]);
        expect(slugs.reduce(withDiscovered, p)).toEqual(p);
      }),
    );
  });

  it('Property: rooms lit never go backwards and stay within 0..12', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: -20, max: 40 })), (steps) => {
        let p = EMPTY_PROGRESS;
        let prev = 0;
        for (const s of steps) {
          p = withRoomsLit(p, 'africa', s);
          const lit = p.castle['africa'] ?? 0;
          expect(lit).toBeGreaterThanOrEqual(prev);
          expect(lit).toBeLessThanOrEqual(12);
          prev = lit;
        }
      }),
    );
  });

  it('Property: a quiz keeps its best score', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 1 }), (scores) => {
        const p = scores.reduce(
          (acc, correct) =>
            withQuizResult(acc, { key: 'countries/nigeria', correct, total: 5, hintsUsed: 0, at: '' }),
          EMPTY_PROGRESS,
        );
        expect(p.quizzes['countries/nigeria']?.correct).toBe(Math.max(...scores));
      }),
    );
  });

  it('Property: normalise always returns a well-formed progress record', () => {
    fc.assert(
      fc.property(fc.anything(), (junk) => {
        const p = normalise(junk);
        expect(Array.isArray(p.discovered)).toBe(true);
        for (const n of Object.values(p.castle)) {
          expect(n).toBeGreaterThanOrEqual(0);
          expect(n).toBeLessThanOrEqual(12);
        }
      }),
    );
  });

  it('demo=reset clears progress only after confirmation, and strips the parameter', async () => {
    await update((p) => withDiscovered(p, 'ghana'));
    window.history.replaceState(null, '', '/?demo=reset&x=1');
    expect(await applyDemoFromUrl('?demo=reset&x=1', () => false)).toBe(false);
    expect(getProgress().discovered).toEqual(['ghana']);
    expect(window.location.search).toBe('?x=1');
    expect(await applyDemoFromUrl('?demo=reset', () => true)).toBe(true);
    expect(getProgress().discovered).toEqual([]);
  });
});
