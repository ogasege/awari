/** 24-review-4 Req 8, Property 3: the wrong answers of a fill-the-gap question are the same part of speech as the answer. */
import { readFileSync, readdirSync } from 'node:fs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { wordnetPos } from '../../../scripts/quizzes/dictionary-pos.ts';
import type { QuizSet } from '../packs/types.ts';
import { heuristicPos, looksPlural, sameKind } from './pos.ts';

describe('fill-the-gap wrong answers', () => {
  it('the owner’s example: "gives", "million", "energy" and "photosphere" do not stand in for one another', () => {
    expect(wordnetPos('gives')).toBe('verb');
    expect(wordnetPos('million')).toBe('num');
    expect(wordnetPos('energy')).toBe('noun');
    expect(wordnetPos('photosphere')).toBe('noun');
    expect(sameKind('gives', 'photosphere', wordnetPos)).toBe(false);
    expect(sameKind('million', 'photosphere', wordnetPos)).toBe(false);
    expect(sameKind('energy', 'photosphere', wordnetPos)).toBe(true);
  });

  it('a plural noun is not offered for a singular one', () => {
    expect(looksPlural('atoms')).toBe(true);
    expect(looksPlural('gas')).toBe(false);
    expect(sameKind('atoms', 'energy', wordnetPos)).toBe(false);
    expect(sameKind('sunspots', 'atoms', wordnetPos)).toBe(true);
  });

  it('sameKind is reflexive and symmetric for any words (property)', () => {
    const word = fc.stringMatching(/^[a-z]{3,10}$/);
    fc.assert(
      fc.property(word, word, (a, b) => {
        expect(sameKind(a, a, heuristicPos)).toBe(true);
        expect(sameKind(a, b, heuristicPos)).toBe(sameKind(b, a, heuristicPos));
      }),
      { numRuns: 300 },
    );
  });

  it('in every built quiz, every wrong answer of a word gap is the same part of speech and number as the answer', () => {
    const bad: string[] = [];
    let gaps = 0;
    for (const pack of readdirSync('public/packs/quizzes', { withFileTypes: true }).filter((d) => d.isDirectory())) {
      if (pack.name === 'countries') continue; // country gaps blank names and capitals, not words
      for (const f of readdirSync(`public/packs/quizzes/${pack.name}`)) {
        const set = JSON.parse(readFileSync(`public/packs/quizzes/${pack.name}/${f}`, 'utf8')) as QuizSet;
        for (const q of set.questions) {
          const answer = q.options[q.answer] as string;
          if (!q.prompt.startsWith('Fill the gap') || /^\d{4}$/.test(answer) || /^[\d,.]+$/.test(answer)) continue;
          gaps++;
          for (const o of q.options) if (o !== answer && !sameKind(o, answer, wordnetPos)) bad.push(`${pack.name}/${set.articleId}: ${q.options.join(' | ')} [${answer}]`);
        }
      }
    }
    expect(gaps).toBeGreaterThan(200);
    expect([...new Set(bad)]).toEqual([]);
  });
});
