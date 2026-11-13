import { describe, expect, it } from 'vitest';
import { isProcess, questionFor, withArticle } from './questions.ts';

describe('questionFor (21-review-2 Property 5)', () => {
  it('gives a thing its article in lower case', () => {
    expect(questionFor('Violin', 'common', 0)).toBe('Ever wondered about the violin?');
    expect(questionFor('Komodo dragon', 'common', 2)).toBe('How much do you know about the Komodo dragon?');
  });

  it('gives a named feature "the" and keeps its capitals', () => {
    expect(withArticle('Nile', 'name')).toBe('the Nile');
    expect(withArticle('Milky Way', 'common')).toBe('the Milky Way');
    expect(withArticle('Silk Road', 'name')).toBe('the Silk Road');
    expect(withArticle('Mississippi River', 'name')).toBe('the Mississippi River');
  });

  it('leaves a person or a place without an article', () => {
    expect(questionFor('Yuri Gagarin', 'name', 1)).toBe('What is Yuri Gagarin really like?');
    expect(questionFor('Pompeii', 'name', 0)).toBe('Ever wondered about Pompeii?');
  });

  it('leaves a person in a common subject without an article', () => {
    expect(questionFor('Lionel Messi', 'common', 2)).toBe('How much do you know about Lionel Messi?');
  });

  it('turns a process into "how X works"', () => {
    expect(isProcess('Digestion')).toBe(true);
    expect(questionFor('Digestion', 'common', 0)).toBe('Ever wondered how digestion works?');
    expect(questionFor('Gravity', 'common', 1)).toBe('Ever wondered how gravity works?');
  });

  it('never produces a bare capitalised common noun after "about"', () => {
    for (const t of ['Elephant', 'Owl', 'Heart', 'Lighthouse', 'Telescope']) {
      for (let p = 0; p < 3; p += 1) {
        expect(questionFor(t, 'common', p)).not.toMatch(new RegExp(`(about|is|know about) ${t}\\b`));
      }
    }
  });
});
