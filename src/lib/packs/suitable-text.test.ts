/** 26-final-review N-2, R-6: no bundled article sentence about abortion or sexual violence or exploitation. */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTICLE_UNSUITABLE } from '../text/suitability.ts';

describe('bundled article text for ages 8 to 14', () => {
  it('has no sentence about abortion or sexual violence or exploitation', () => {
    const bad: string[] = [];
    for (const pack of readdirSync('public/packs').filter((d) => !d.includes('.') && !['img', 'quizzes', 'atlas', 'dictionary'].includes(d))) {
      for (const f of readdirSync(`public/packs/${pack}`).filter((x) => x.endsWith('.json') && x !== 'index.json' && x !== 'facts.json')) {
        const text = readFileSync(`public/packs/${pack}/${f}`, 'utf8');
        if (ARTICLE_UNSUITABLE.test(text)) bad.push(`${pack}/${f}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('the rule leaves ordinary encyclopedia sentences alone', () => {
    expect(ARTICLE_UNSUITABLE.test('Uranus can be seen with the naked eye under perfect conditions.')).toBe(false);
    expect(ARTICLE_UNSUITABLE.test('Taiwan legalised same-sex marriage in 2019.')).toBe(false);
    expect(ARTICLE_UNSUITABLE.test('They also stole things from the Arawaks and raped Arawak women.')).toBe(true);
  });
});
