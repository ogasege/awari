/**
 * The four options and the proof slip of every committed question
 * (26-final-review D-5, D-6, D-7, D-8).
 *
 * The design reviewer could score without reading the article: in 356 gap
 * questions exactly one option was capitalised and it was always the right one
 * (D-5), 370 blanked an adjective so grammar picked the answer (D-6), and wrong
 * answers included "Zimbabwe Sign Language" as an official language of Kenya
 * and "Sri Jayawardenepura Kotte, Colombo" as a country (D-7).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { wordnetPos } from '../../../scripts/quizzes/dictionary-pos.ts';
import type { CountryFacts, FactsPack, Question, QuizSet } from '../packs/types.ts';

const ROOT = 'public/packs';
const fold = (t: string): string => t.replace(/\s+/g, ' ').trim().toLowerCase();

const facts = (JSON.parse(readFileSync(`${ROOT}/countries/facts.json`, 'utf8')) as FactsPack).countries;
const byName = new Map(facts.map((c) => [fold(c.name), c]));
const byCapital = new Map(facts.flatMap((c) => (c.capital ? [[fold(c.capital), c] as const] : [])));

/** Countries a child could confuse with this one: three borders out, or the continent for an island. */
function region(country: CountryFacts): Set<string> {
  const graph = new Map(facts.map((c) => [c.id, c.neighbours]));
  const seen = new Set([country.id]);
  let edge = [country.id];
  for (let hop = 0; hop < 3; hop += 1) {
    const next: string[] = [];
    for (const id of edge) {
      for (const n of graph.get(id) ?? []) if (!seen.has(n)) { seen.add(n); next.push(n); }
    }
    edge = next;
  }
  if (seen.size - 1 >= 3) return seen;
  return new Set(facts.filter((c) => c.continent === country.continent).map((c) => c.id));
}

interface Found { where: string; q: Question }

const all: Found[] = [];
for (const pack of readdirSync(`${ROOT}/quizzes`, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const file of readdirSync(`${ROOT}/quizzes/${pack.name}`)) {
    const set = JSON.parse(readFileSync(`${ROOT}/quizzes/${pack.name}/${file}`, 'utf8')) as QuizSet;
    for (const q of set.questions) all.push({ where: `${pack.name}/${set.articleId} ${q.id}`, q });
  }
}

const answerOf = (q: Question): string => q.options[q.answer] ?? '';
const wrongOf = (q: Question): string[] => q.options.filter((_, i) => i !== q.answer);
const isGap = (q: Question): boolean => q.prompt.startsWith('Fill the gap');
const isNumber = (text: string): boolean => /^[\d,.]+$/.test(text);
/** Two names in one value: "Sucre, La Paz". "Washington, D.C." is one name. */
const twoNames = (value: string): boolean => {
  const parts = value.split(',').map((p) => p.trim());
  return parts.length > 1 && parts.every((p) => p.replace(/[^A-Za-z]/g, '').length >= 3 && !p.includes('.'));
};

describe('the four options of every committed question (26-final-review)', () => {
  it('reads every committed quiz', () => {
    expect(all.length).toBeGreaterThan(2000);
    expect(all.filter(({ q }) => isGap(q)).length).toBeGreaterThan(1000);
  });

  it('Property 4: the four options of a gap question agree on their capitalisation. _D-5_', () => {
    const leaks = all
      .filter(({ q }) => isGap(q) && !isNumber(answerOf(q)))
      .filter(({ q }) => new Set(q.options.map((o) => /^[A-Z]/.test(o))).size > 1)
      .map(({ where, q }) => `${where}: ${q.options.join(' | ')} [${answerOf(q)}]`);
    expect(leaks).toEqual([]);
  });

  it('Property 5: no option is two names in one, and no sign language stands among spoken languages. _D-7_', () => {
    const bad: string[] = [];
    for (const { where, q } of all) {
      for (const o of wrongOf(q)) {
        if (twoNames(o)) bad.push(`${where}: “${o}” is two names`);
        if (/sign language/i.test(o) && !/sign language/i.test(answerOf(q))) bad.push(`${where}: “${o}”`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('Property 6: wrong answers about a place are places of the same sort from the same region. _D-7_', () => {
    const bad: string[] = [];
    for (const { where, q } of all) {
      const answer = answerOf(q);
      const asksCountry = /shares a border with/.test(q.prompt);
      const country = asksCountry
        ? byName.get(fold(q.prompt.replace(/^.*shares a border with /, '').replace(/\?$/, '')))
        : byName.get(fold(answer));
      for (const o of wrongOf(q)) {
        const asCountry = byName.get(fold(o));
        const asCity = byCapital.get(fold(o));
        if (country) {
          if (!asCountry && asCity) bad.push(`${where}: “${o}” is a city offered as a country`);
          else if (asCountry && !region(country).has(asCountry.id)) bad.push(`${where}: “${o}” is outside the region`);
        } else if (byCapital.has(fold(answer)) && !byName.has(fold(answer))) {
          const home = byCapital.get(fold(answer)) as CountryFacts;
          if (asCountry && !asCity) bad.push(`${where}: “${o}” is a country offered as a city`);
          else if (asCity && !region(home).has(asCity.id)) bad.push(`${where}: “${o}” is outside the region`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('Property 7: no gap blanks an adjective, so grammar cannot answer the question. _D-6_', () => {
    const adjectives = all
      .filter(({ q }) => isGap(q) && !isNumber(answerOf(q)))
      .filter(({ q }) => {
        const a = answerOf(q);
        const place = byName.has(fold(a)) || byCapital.has(fold(a));
        return !place && !/^[A-Z]/.test(a) && wordnetPos(a) === 'adj';
      })
      .map(({ where, q }) => `${where}: ${answerOf(q)}`);
    expect(adjectives).toEqual([]);
  });

  it('Property 8: every proof names the answer, and a cloze proof is the sentence its gap was cut from. _D-8, 26-final-review N-3_', () => {
    for (const { where, q } of all) {
      expect(fold(q.proof).includes(fold(answerOf(q))), where).toBe(true);
      if (!isGap(q)) continue;
      const gap = /^Fill the gap: “(.*)”$/.exec(q.prompt)?.[1] ?? '';
      expect(fold(gap.replace('_____', answerOf(q))), where).toBe(fold(q.proof));
    }
  });
});
