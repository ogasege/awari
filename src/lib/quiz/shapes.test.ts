/**
 * 27-quiz-variety: the mix of question shapes in the committed quizzes, and the fact test that re-derives every
 * fact-built answer from the packs (Req 5.2, 5.3, 5.4).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { CountryFacts, FactsPack, Question, QuizSet, TimelinePack } from '../packs/types.ts';
import { unsuitableTopic } from '../text/suitability.ts';
import { fold } from './validate.ts';

const ROOT = 'public/packs';
const facts = (JSON.parse(readFileSync(`${ROOT}/countries/facts.json`, 'utf8')) as FactsPack).countries;
const byName = new Map(facts.map((c) => [fold(c.name), c]));
const events = (JSON.parse(readFileSync(`${ROOT}/timeline.json`, 'utf8')) as TimelinePack).events;

interface Found {
  where: string;
  pack: string;
  title: string;
  set: QuizSet;
  q: Question;
}
const sets: Array<{ pack: string; set: QuizSet }> = [];
const all: Found[] = [];
for (const pack of readdirSync(`${ROOT}/quizzes`, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const file of readdirSync(`${ROOT}/quizzes/${pack.name}`)) {
    const set = JSON.parse(readFileSync(`${ROOT}/quizzes/${pack.name}/${file}`, 'utf8')) as QuizSet;
    sets.push({ pack: pack.name, set });
    for (const q of set.questions) all.push({ where: q.id, pack: pack.name, title: set.title, set, q });
  }
}
const kindOf = (q: Question): string => q.kind ?? 'cloze';
const answerOf = (q: Question): string => q.options[q.answer] ?? '';

describe('the mix of question shapes (27-quiz-variety Req 5.3)', () => {
  it('keeps fill-the-gap at 40% of all questions or less, and no other shape above it', () => {
    const counts = new Map<string, number>();
    for (const { q } of all) counts.set(kindOf(q), (counts.get(kindOf(q)) ?? 0) + 1);
    expect((counts.get('cloze') ?? 0) / all.length).toBeLessThanOrEqual(0.4);
    for (const [kind, n] of counts) expect(n / all.length, kind).toBeLessThanOrEqual(0.4);
  });

  it('puts every built shape into at least 30 quizzes', () => {
    for (const kind of ['capital', 'capital-reverse', 'continent', 'currency', 'language', 'neighbour', 'largest', 'first', 'truefalse', 'cloze']) {
      const quizzes = sets.filter(({ set }) => set.questions.some((q) => kindOf(q) === kind)).length;
      expect(quizzes, kind).toBeGreaterThanOrEqual(30);
    }
  });

  it('never fills a quiz with one shape: at most two of any fact shape, four of fill-the-gap (a pack with no timeline or country facts has nothing else)', () => {
    for (const { set } of sets) {
      const counts = new Map<string, number>();
      for (const q of set.questions) counts.set(kindOf(q), (counts.get(kindOf(q)) ?? 0) + 1);
      for (const [kind, n] of counts) expect(n, `${set.articleId} ${kind}`).toBeLessThanOrEqual(kind === 'cloze' ? 4 : 2);
    }
  });

  it('does not lose questions: at least as many as before, and nearly every quiz still has five', () => {
    expect(all.length).toBeGreaterThanOrEqual(2358 * 0.9);
    expect(sets.filter(({ set }) => set.questions.length === 5).length).toBeGreaterThanOrEqual(sets.length - 4);
  });
});

describe('every shape passes the shared rules (Req 5.1, 5.2)', () => {
  it('has distinct options, an answer that is one of them and a proof, and passes the suitability scan', () => {
    for (const { where, q } of all) {
      expect(new Set(q.options.map(fold)).size, where).toBe(q.options.length);
      expect(q.answer, where).toBeGreaterThanOrEqual(0);
      expect(q.answer, where).toBeLessThan(q.options.length);
      expect(q.proof.length, where).toBeGreaterThan(0);
      expect(unsuitableTopic(`${q.prompt} ${q.proof} ${q.options.join(' ')}`), where).toBeNull();
    }
  });

  it('gives true or false exactly two options, no taken-away rung, and no hint that says the answer', () => {
    const tf = all.filter(({ q }) => q.kind === 'truefalse');
    expect(tf.length).toBeGreaterThan(300);
    for (const { where, q } of tf) {
      expect(q.options, where).toEqual(['True', 'False']);
      expect(q.hints.removed, where).toEqual([]);
      expect(fold(q.hints.nudge), where).not.toContain('true');
      expect(fold(q.hints.nudge), where).not.toContain('false');
      expect(q.prompt.startsWith('True or false: “'), where).toBe(true);
    }
  });

  it('keeps about half of the true or false statements false', () => {
    const tf = all.filter(({ q }) => q.kind === 'truefalse');
    const falseShare = tf.filter(({ q }) => q.answer === 1).length / tf.length;
    expect(falseShare).toBeGreaterThan(0.3);
    expect(falseShare).toBeLessThan(0.7);
  });

  it('never lets a hint name the answer of a four-option question', () => {
    for (const { where, q } of all) {
      if (q.options.length !== 4) continue;
      expect(fold(q.hints.nudge).includes(fold(answerOf(q))), where).toBe(false);
      expect(fold(q.hints.whereToLook).includes(fold(answerOf(q))), where).toBe(false);
    }
  });
});

describe('the fact test: every fact-built answer is re-derived from the packs (Req 5.4)', () => {
  const countryOf = (title: string): CountryFacts | undefined => byName.get(fold(title));

  it('capital-reverse, continent, currency and largest agree with the facts', () => {
    let checked = 0;
    for (const { where, q, title } of all) {
      const country = countryOf(title);
      if (q.kind === 'capital-reverse') {
        expect(fold(answerOf(q)), where).toBe(fold(country?.name ?? '?'));
        expect(q.prompt, where).toContain(country?.capital ?? '?');
      } else if (q.kind === 'continent') {
        expect(answerOf(q), where).toBe(country?.continent);
      } else if (q.kind === 'currency') {
        expect(fold(answerOf(q)), where).toBe(fold(country?.currency ?? '?'));
      } else if (q.kind === 'largest') {
        const area = new Map(facts.map((c) => [c.name, c.areaKm2 ?? 0]));
        const top = Math.max(...q.options.map((o) => area.get(o) ?? 0));
        expect(area.get(answerOf(q)), where).toBe(top);
        for (const o of q.options) if (o !== answerOf(q)) expect((area.get(o) ?? 0) * 1.25, where).toBeLessThanOrEqual(top);
      } else continue;
      checked += 1;
    }
    expect(checked).toBeGreaterThan(500);
  });

  it('true or false about a capital or a border is true exactly when the facts say so', () => {
    let checked = 0;
    for (const { where, q, title } of all) {
      if (q.kind !== 'truefalse') continue;
      const country = countryOf(title);
      if (!country) continue;
      const capital = /^True or false: “The capital city of .+ is (.+)\.”$/.exec(q.prompt)?.[1];
      const border = /^True or false: “.+ shares a land border with (.+)\.”$/.exec(q.prompt)?.[1];
      if (capital) {
        expect(q.answer === 0, where).toBe(fold(capital) === fold(country.capital ?? ''));
      } else if (border) {
        const other = byName.get(fold(border));
        expect(other, where).toBeDefined();
        expect(q.answer === 0, where).toBe(country.neighbours.includes(other?.id ?? '?'));
      } else continue;
      checked += 1;
    }
    expect(checked).toBeGreaterThan(20);
  });

  it('first: the answer is born at least ten years before (or after) every other option, by the timeline', () => {
    const born = new Map<string, number>();
    for (const e of events) if (/ was born on /.test(e.text)) born.set(e.label, Number(e.date.slice(0, 4)));
    let checked = 0;
    for (const { where, q } of all) {
      if (q.kind !== 'first') continue;
      const years = q.options.map((o) => born.get(o));
      expect(years.every((y) => y !== undefined), where).toBe(true);
      const mine = born.get(answerOf(q)) as number;
      const others = q.options.filter((_, i) => i !== q.answer).map((o) => born.get(o) as number);
      const earliest = q.prompt.includes('first');
      for (const y of others) expect(earliest ? y - mine : mine - y, where).toBeGreaterThanOrEqual(10);
      checked += 1;
    }
    expect(checked).toBeGreaterThanOrEqual(30);
  });
});
