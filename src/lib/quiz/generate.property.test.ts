import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Article, CountryFacts, Source } from '../packs/types.ts';
import { buildQuiz, findYear, nudgeFor, PHYSICS_TERMS, whereToLookFor } from './generate.ts';
import { splitSentences } from './sentences.ts';
import { fold, validateQuestion } from './validate.ts';

const src: Source = {
  name: 'test', url: 'https://example.org', licence: 'CC BY-SA 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', retrieved: '2026-11-11',
};

const name = fc.stringMatching(/^[A-Z][a-z]{3,9}$/);
const countries = fc.uniqueArray(
  fc.record({ name, capital: name, language: name, year: fc.integer({ min: 1800, max: 2020 }) }),
  { minLength: 6, maxLength: 12, selector: (c) => c.name },
);

/** Builds a synthetic country article and facts that mention each other. */
function world(cs: Array<{ name: string; capital: string; language: string; year: number }>) {
  const facts: CountryFacts[] = cs.map((c, i) => ({
    id: c.name.toLowerCase(), qid: `Q${i + 1}`, name: c.name, iso3: 'XXX', continent: 'Africa',
    capital: c.capital, languages: [c.language], neighbours: [cs[(i + 1) % cs.length]!.name.toLowerCase()],
    source: src,
  }));
  const c = cs[0]!;
  const n = cs[1]!;
  const article: Article = {
    id: c.name.toLowerCase(), pack: 'countries', title: c.name, summary: '', photos: [], notes: [], source: src,
    sections: [
      { heading: '', paragraphs: [`The capital city of this land is ${c.capital}. People there speak the ${c.language} language every day.`] },
      { heading: 'History', paragraphs: [`The land became independent in ${c.year} after a long struggle. It shares a long border with ${n.name} in the east.`] },
    ],
  };
  return { article, facts };
}

describe('quiz builder (05-quizzes)', () => {
  it('Property 3: the same input always builds the same quiz (Req 1.3)', () => {
    fc.assert(
      fc.property(countries, (cs) => {
        const { article, facts } = world(cs);
        expect(buildQuiz(article, facts[0], facts, PHYSICS_TERMS)).toEqual(
          buildQuiz(article, facts[0], facts, PHYSICS_TERMS),
        );
      }),
    );
  });

  it('Property 6: nudges and where-to-look hints never contain the answer (Req 2.2)', () => {
    fc.assert(
      fc.property(fc.oneof(name, fc.integer({ min: 1000, max: 2025 }).map(String)), name, (answer, title) => {
        expect(fold(nudgeFor(answer))).not.toContain(fold(answer));
        fc.pre(!fold(title).includes(fold(answer)));
        expect(fold(whereToLookFor('History', title))).not.toContain(fold(answer));
      }),
    );
  });

  it('Property 8: every generated question passes the validator, with distinct answers (Req 1.2, 1.5)', () => {
    fc.assert(
      fc.property(countries, (cs) => {
        const { article, facts } = world(cs);
        const qs = buildQuiz(article, facts[0], facts, facts.map((f) => f.name));
        expect(qs.length).toBeGreaterThan(0);
        for (const q of qs) expect(validateQuestion(q, article)).toEqual({ ok: true });
        const answers = qs.map((q) => fold(q.options[q.answer] ?? ''));
        expect(new Set(answers).size).toBe(answers.length);
        expect(new Set(qs.map((q) => q.prompt)).size).toBe(qs.length);
      }),
    );
  });

  it('finds years used as dates but not measurements', () => {
    expect(findYear('It became independent in 1960.')).toBe('1960');
    expect(findYear('on 1 October 1960, it changed')).toBe('1960');
    expect(findYear('Niger (1497 km) and Chad')).toBeUndefined();
    expect(findYear('in 1994, 1998, 2002 and 2010')).toBeUndefined();
  });

  it('splits sentences without losing text', () => {
    fc.assert(
      fc.property(fc.array(name, { minLength: 1, maxLength: 6 }), (ws) => {
        const para = ws.map((w) => `${w} is here.`).join(' ');
        expect(splitSentences(para).join(' ')).toBe(para);
        expect(splitSentences(para)).toHaveLength(ws.length);
      }),
    );
  });
});
