/**
 * Round-2 review guards over every committed quiz and picture (26-final-review N-1, N-2, N-3, N-6). They read the
 * files the app ships, so a rebuild that brings a defect back fails here.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { unsuitableTopic } from '../text/suitability.ts';

interface Q {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  proof: string;
}
const quizzes: Array<{ file: string; questions: Q[] }> = [];
for (const pack of readdirSync('public/packs/quizzes').filter((d) => !d.includes('.'))) {
  for (const f of readdirSync(`public/packs/quizzes/${pack}`)) {
    quizzes.push({ file: `${pack}/${f}`, questions: (JSON.parse(readFileSync(`public/packs/quizzes/${pack}/${f}`, 'utf8')) as { questions: Q[] }).questions });
  }
}
const all = quizzes.flatMap((q) => q.questions.map((x) => ({ ...x, file: q.file })));
const facts = (JSON.parse(readFileSync('public/packs/countries/facts.json', 'utf8')) as { countries: Array<{ id: string; name: string }> }).countries;
const countryNames = new Set(facts.map((c) => c.name));

describe('unsuitableTopic', () => {
  it('catches each listed topic and leaves ordinary text alone', () => {
    expect(unsuitableTopic('The greatest destroyer of peace is abortion')).toBe('abortion');
    expect(unsuitableTopic('A hotel bar attached to the Cumberland Hotel')).toBe('alcohol');
    expect(unsuitableTopic('She took strong drugs, which led to an addiction to opium.')).toBe('drugs');
    expect(unsuitableTopic('he killed himself by stabbing')).toBe('suicide');
    expect(unsuitableTopic('forced into prostitution')).toBe('sexual content');
    expect(unsuitableTopic('The prisoners were tortured')).toBe('graphic violence');
    expect(unsuitableTopic('Owl-shaped wine vessel, a ritual bronze vessel')).toBeNull();
    expect(unsuitableTopic('Sex hormones are made from cholesterol')).toBeNull();
    expect(unsuitableTopic('The Nile flows north through Egypt.')).toBeNull();
  });
});

describe('every committed quiz question', () => {
  it('touches no topic unsuitable for ages 8 to 14 (N-2)', () => {
    const bad = all.filter((q) => unsuitableTopic(`${q.prompt} ${q.proof} ${q.options.join(' ')}`)).map((q) => q.id);
    expect(bad).toEqual([]);
  });

  it('asks about a border only with a proof sentence that names the border (N-1)', () => {
    const border = all.filter((q) => /shares a border with/.test(q.prompt));
    expect(border.length).toBeGreaterThan(50);
    const bad = border.filter((q) => !/\bborder(s|ed|ing)?\b/i.test(q.proof) || !q.proof.includes(q.options[q.answer] ?? '\u0000')).map((q) => q.id);
    expect(bad).toEqual([]);
  });

  it('has a cloze proof that is the sentence the gap was cut from (N-3)', () => {
    const cloze = all.filter((q) => q.prompt.startsWith('Fill the gap: “'));
    const bad = cloze
      .filter((q) => {
        const blanked = q.prompt.slice('Fill the gap: “'.length, -1);
        const answer = q.options[q.answer] ?? '';
        const filled = blanked.replace('_____', answer);
        return filled.toLowerCase() !== q.proof.toLowerCase();
      })
      .map((q) => q.id);
    expect(bad).toEqual([]);
  });

  it('never offers countries for a gap that is part of a person name (N-6)', () => {
    const bad = all
      .filter((q) => /_____ \p{Lu}/u.test(q.prompt) && countryNames.has(q.options[q.answer] ?? ''))
      .map((q) => q.id);
    expect(bad).toEqual([]);
  });
});

describe('every committed picture caption', () => {
  it('touches no topic unsuitable for ages 8 to 14 (N-2)', () => {
    const bad: string[] = [];
    for (const f of readdirSync('public/media').filter((x) => x.endsWith('.json') && !['index.json', 'licences.json', 'daily.json'].includes(x))) {
      for (const m of (JSON.parse(readFileSync(`public/media/${f}`, 'utf8')) as { items: Array<{ id: string; caption: string; alt?: string }> }).items) {
        if (unsuitableTopic(`${m.caption} ${m.alt ?? ''}`)) bad.push(m.id);
      }
    }
    expect(bad).toEqual([]);
  });
});
