import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** 26-final-review F-006: the crawl found "such as the Salsa_music and undefined" in the Cuba article. */
describe('article text has no leftover markup or developer words', () => {
  const dirs = readdirSync('public/packs').filter((d) => !d.includes('.') && !['img', 'quizzes', 'atlas', 'dictionary'].includes(d));
  it('no article in any pack contains undefined, NaN, [object Object] or a Word_with_underscore link name', () => {
    const bad: string[] = [];
    for (const d of dirs) {
      for (const f of readdirSync(`public/packs/${d}`)) {
        if (!f.endsWith('.json') || f === 'index.json' || f === 'facts.json') continue;
        const text = readFileSync(`public/packs/${d}/${f}`, 'utf8');
        const prose = text.replace(/"(?:url|src|source|credit[A-Za-z]*|file|photo|licenceUrl)":"[^"]*"/g, '');
        if (/\b(undefined|NaN)\b|\[object Object\]|\b[A-Z][a-z]+_[a-z]+\b/.test(prose)) bad.push(`${d}/${f}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
