import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Article } from '../../lib/packs/types.ts';
import { unsuitableTopic } from '../../lib/text/suitability.ts';
import { didYouKnow } from './scrapbook.tsx';

const packs = readdirSync('public/packs', { withFileTypes: true }).filter((d) => d.isDirectory() && !['img', 'quizzes', 'atlas'].includes(d.name));

describe('"Did you know?" notes come from the article\'s own words (28-every-screen-like-home task 3)', () => {
  it('Property: at most three, each a sentence of the article, short, suitable and not about war or conflict', () => {
    let articles = 0;
    let withNotes = 0;
    for (const pack of packs) {
      for (const file of readdirSync(`public/packs/${pack.name}`).filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'facts.json')) {
        const article = JSON.parse(readFileSync(`public/packs/${pack.name}/${file}`, 'utf8')) as Article;
        if (!article.sections) continue;
        articles += 1;
        const text = article.sections.flatMap((s) => s.paragraphs).join(' ');
        const notes = didYouKnow(article.sections, []);
        if (notes.length) withNotes += 1;
        expect(notes.length).toBeLessThanOrEqual(3);
        for (const n of notes) {
          expect(text.includes(n), `${file}: ${n}`).toBe(true);
          expect(n.length).toBeLessThanOrEqual(150);
          expect(unsuitableTopic(n)).toBeNull();
          expect(/\b(war|conflict|attack|kill|slave|armed)\b/i.test(n), `${file}: ${n}`).toBe(false);
        }
      }
    }
    expect(articles).toBeGreaterThan(400);
    expect(withNotes / articles).toBeGreaterThan(0.6);
  });
});
