import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Article } from '../packs/types.ts';
import { autoTerms, buildQuiz } from './generate.ts';
import { validateQuestion } from './validate.ts';

const word = fc.stringMatching(/^[a-z]{3,10}$/);
const sentence = fc
  .array(word, { minLength: 8, maxLength: 24 })
  .map((w) => `${w.join(' ').replace(/^./, (c) => c.toUpperCase())} in ${1500 + (w[0]?.length ?? 0) * 31}.`);

const article = fc
  .record({
    title: fc.stringMatching(/^[A-Z][a-z]{3,9}$/),
    paragraphs: fc.array(fc.array(sentence, { minLength: 1, maxLength: 4 }).map((s) => s.join(' ')), { minLength: 1, maxLength: 6 }),
  })
  .map(
    ({ title, paragraphs }): Article => ({
      id: title.toLowerCase(),
      pack: 'wiki',
      title,
      summary: paragraphs[0] ?? '',
      sections: [{ heading: '', paragraphs }],
      photos: [],
      notes: [],
      source: {
        name: 'Test',
        url: 'https://example.org',
        licence: 'CC BY-SA 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        retrieved: '2026-11-12',
      },
    }),
  );

describe('autoTerms and on-device quizzes (14-any-article 2.2)', () => {
  it('takes terms only from the article, never the title or common words', () => {
    fc.assert(
      fc.property(article, (a) => {
        const text = a.sections.flatMap((s) => s.paragraphs).join(' ').toLowerCase();
        const terms = autoTerms(a);
        expect(terms.length).toBeLessThanOrEqual(60);
        for (const t of terms) {
          expect(text).toContain(t);
          expect(a.title.toLowerCase()).not.toContain(t);
          expect(['which', 'there', 'their', 'would']).not.toContain(t);
        }
      }),
    );
  });

  it('Property 3: every question built for any article passes the shared validator. _Req 5.2_', () => {
    fc.assert(
      fc.property(article, (a) => {
        const qs = buildQuiz(a, undefined, [], autoTerms(a));
        expect(qs.length).toBeLessThanOrEqual(5);
        for (const q of qs) {
          expect(validateQuestion(q, a).ok).toBe(true);
          expect(new Set(q.options).size).toBe(4);
        }
      }),
      { numRuns: 80 },
    );
  });

  it('is deterministic', () => {
    fc.assert(
      fc.property(article, (a) => {
        expect(buildQuiz(a, undefined, [], autoTerms(a))).toEqual(buildQuiz(a, undefined, [], autoTerms(a)));
      }),
      { numRuns: 20 },
    );
  });
});
