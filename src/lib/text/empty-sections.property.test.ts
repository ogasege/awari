/** 22-review-3 Property 6 (Req 11, 12): no empty sections in any pack article; one dated, sourced population. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Article, FactsPack } from '../packs/types.ts';
import { conflictsWithFact } from './population.ts';
import { isEmptySection, splitSections } from './sections.ts';

const DIR = join('public', 'packs');

function articles(): Array<{ file: string; article: Article }> {
  const out: Array<{ file: string; article: Article }> = [];
  for (const d of readdirSync(DIR, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    for (const f of readdirSync(join(DIR, d.name))) {
      if (!f.endsWith('.json') || f === 'index.json' || f === 'facts.json') continue;
      const article = JSON.parse(readFileSync(join(DIR, d.name, f), 'utf8')) as Article;
      if (Array.isArray(article.sections)) out.push({ file: `${d.name}/${f}`, article });
    }
  }
  return out;
}

describe('empty sections (22-review-3 Req 12)', () => {
  it('splitSections drops a heading with no text and a heading that only introduces a missing table', () => {
    const s = splitSections(
      'Nigeria is a country.\n\n== Cities ==\nThese are the cities in Nigeria with over 1 million people as of 2012.\n\n== Empty ==\n\n== Geography ==\nIt has rivers.',
    );
    expect(s.map((x) => x.heading)).toEqual(['', 'Geography']);
  });

  it('keeps a real section that merely mentions a number of people', () => {
    expect(isEmptySection({ heading: 'Cities', paragraphs: ['Lagos has more than 15 million people and is the largest city.'] })).toBe(false);
  });

  it('no shipped article has a heading without content', () => {
    const bad = articles().flatMap(({ file, article }) =>
      article.sections.filter((s) => s.paragraphs.length === 0 || isEmptySection(s)).map((s) => `${file}: ${s.heading}`),
    );
    expect(bad).toEqual([]);
  });
});

describe('population figures (22-review-3 Req 11)', () => {
  const facts = JSON.parse(readFileSync(join(DIR, 'countries', 'facts.json'), 'utf8')) as FactsPack;

  it('every country with a population states its year and has a source', () => {
    for (const c of facts.countries) {
      if (c.population !== undefined) {
        expect(c.populationYear, c.id).toBeGreaterThan(1900);
        expect(c.source.url, c.id).toMatch(/^https:\/\/www\.wikidata\.org\//);
      }
    }
  });

  it('no country article gives its own headcount as a different number', () => {
    const byFile = new Map(articles().map((x) => [x.file, x.article]));
    for (const c of facts.countries) {
      if (c.population === undefined) continue;
      const article = byFile.get(`countries/${c.id}.json`);
      if (!article) continue;
      for (const p of article.sections.flatMap((s) => s.paragraphs)) {
        for (const sentence of p.match(/[^.!?]+(?:\.\d+)?[^.!?]*[.!?]+|[^.!?]+$/g) ?? []) {
          expect(conflictsWithFact(sentence, c.id, article.title, c.population), `${c.id}: ${sentence}`).toBe(false);
        }
      }
    }
  });

  it('Nigeria gives one figure: the 2021 Wikidata count on the facts card, not 232 million in the text', () => {
    const nigeria = readFileSync(join(DIR, 'countries', 'nigeria.json'), 'utf8');
    expect(nigeria).not.toMatch(/232,679,478/);
    expect(conflictsWithFact('It is the most populated country in Africa, with over 232,679,478 people.', 'nigeria', 'Nigeria', 211_400_708)).toBe(true);
    expect(conflictsWithFact('Lagos has over 15,000,000 people.', 'nigeria', 'Nigeria', 211_400_708)).toBe(false);
  });
});
