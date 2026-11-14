/**
 * The lead of every committed article, checked against the findings of
 * the independent design review (26-final-review D-17 to D-22). "Lead"
 * means what a student sees first: the `summary` in the pack index,
 * which is also the first sentences of the article's first paragraph.
 *
 * A lead fails if it carries an empty or unbalanced bracket, a citation
 * marker such as "[4]", does not end in a full stop, or runs over 45
 * words. Each check is also run against a defect of its own kind, so a
 * check that stops biting fails the suite instead of passing in silence.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Article, PackIndex } from '../../src/lib/packs/types.ts';
import { SUBJECTS } from '../../src/lib/packs/subjects.ts';
import { cleanLead } from '../../src/lib/text/leads.ts';
import { MAX_SUMMARY_WORDS, summarise, wordCount } from '../../src/lib/text/sections.ts';
import { LEAD_TEXT_OVERRIDES } from './lead-text-overrides.ts';

const DIR = join('public', 'packs');

interface Lead {
  key: string;
  title: string;
  /** The index summary: the lead a card, the atlas and search show. */
  summary: string;
  /** The article's first paragraph. */
  paragraph: string;
  article: Article;
}

function loadLeads(): Lead[] {
  const out: Lead[] = [];
  for (const subject of SUBJECTS) {
    const dir = join(DIR, subject.id);
    const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) as PackIndex;
    const summaries = new Map(index.items.map((item) => [item.id, item.summary]));
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.json') || file === 'index.json' || file === 'facts.json') continue;
      const article = JSON.parse(readFileSync(join(dir, file), 'utf8')) as Article;
      if (!Array.isArray(article.sections)) continue;
      out.push({
        key: `${subject.id}/${article.id}`,
        title: article.title,
        summary: summaries.get(article.id) ?? '',
        paragraph: article.sections[0]?.paragraphs[0] ?? '',
        article,
      });
    }
  }
  return out;
}

const LEADS = loadLeads();

/** An empty bracket, a bracket opening on punctuation, or an unbalanced pair. */
export function hasBracketArtifact(lead: string): boolean {
  const opens = (lead.match(/\(/g) ?? []).length;
  const closes = (lead.match(/\)/g) ?? []).length;
  return (
    opens !== closes ||
    /\(\s*\)/.test(lead) ||
    /\(\s*[,;:/)]/.test(lead) ||
    /[,;(]\s*\)/.test(lead)
  );
}

/** A citation marker the extract left in: "in Southeast Asia.[4]". */
export function hasCitationMarker(lead: string): boolean {
  return /\[\d{1,3}\]/.test(lead);
}

/** True when the lead does not end in a full stop (or "!"/"?"). */
export function unfinished(lead: string): boolean {
  return !/[.!?]["”’)]?$/.test(lead.trim());
}

/** True when the lead is longer than the budget a young reader gets. */
export function tooLong(lead: string): boolean {
  return wordCount(lead) > MAX_SUMMARY_WORDS;
}

const CHECKS: ReadonlyArray<readonly [string, (lead: string) => boolean, string]> = [
  ['an empty or unbalanced bracket', hasBracketArtifact, 'Cape Verde ( ()) or Cabo Verde ( (), ) is an island country.'],
  ['a citation marker', hasCitationMarker, 'Laos is a country in Southeast Asia.[4]'],
  ['no full stop at the end', unfinished, 'Mount Fuji is the tallest mountain in Japan, at'],
  [
    `over ${MAX_SUMMARY_WORDS} words`,
    tooLong,
    `Basketball ${'is a team sport where two teams of five players play against each other on a court '.repeat(4)}.`,
  ],
];

describe('every committed lead (26-final-review D-17 to D-22)', () => {
  it('reads the leads of all the bundled packs', () => {
    expect(LEADS.length).toBeGreaterThanOrEqual(483);
    expect(new Set(LEADS.map((l) => l.key.split('/')[0])).size).toBe(SUBJECTS.length);
    for (const lead of LEADS) {
      expect(lead.summary, `${lead.key} has no index summary`).not.toBe('');
    }
  });

  for (const [what, check, defect] of CHECKS) {
    it(`has none with ${what}`, () => {
      expect(check(defect), `the check for ${what} does not catch "${defect}"`).toBe(true);
      expect(LEADS.filter((l) => check(l.summary)).map((l) => l.key)).toEqual([]);
    });
  }

  it('has no bracket artifact or citation marker in the article’s first paragraph either', () => {
    const bad = LEADS.filter(
      (l) => hasBracketArtifact(l.paragraph) || hasCitationMarker(l.paragraph) || unfinished(l.paragraph),
    );
    expect(bad.map((l) => l.key)).toEqual([]);
  });

  it('starts every lead with Latin letters a student can read and no phonetic brackets (D-22)', () => {
    const nonLatin =
      /[\u0370-\u1DFF\u2C00-\u2DFF\u2E80-\uA6FF\uA800-\uABFF\uAC00-\uD7FF\uF900-\uFDFF\uFE70-\uFEFF\uFF00-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/;
    const ipa = /\[[^\]]*[\u0250-\u02AF\u02B0-\u02FF][^\]]*\]|\/[^/]*[\u02C8\u02CC][^/]*\//;
    const firstSentence = (lead: string): string => /^.*?[.!?](?=\s|$)/.exec(lead)?.[0] ?? lead;
    expect(LEADS.filter((l) => nonLatin.test(firstSentence(l.summary))).map((l) => l.key)).toEqual([]);
    expect(LEADS.filter((l) => ipa.test(l.summary)).map((l) => l.key)).toEqual([]);
  });

  it('is neither a hatnote nor a disambiguation stub (D-18, D-20)', () => {
    const hatnote = /^\s*(?:not to be (?:mistaken|confused)|this (?:article|page) is about|for other uses)/i;
    expect(LEADS.filter((l) => hatnote.test(l.summary)).map((l) => l.key)).toEqual([]);
    expect(LEADS.filter((l) => l.summary.trim().endsWith(':')).map((l) => l.key)).toEqual([]);
  });

  it('is the summary the lead rules produce, so the index and the article agree', () => {
    const wrong = LEADS.filter((l) => summarise(l.article.sections) !== l.summary);
    expect(wrong.map((l) => l.key)).toEqual([]);
  });

  it('is already clean: running the rules again changes nothing', () => {
    const changed = LEADS.filter(
      (l) => cleanLead(l.article.sections)[0]?.paragraphs[0] !== l.paragraph,
    );
    expect(changed.map((l) => l.key)).toEqual([]);
  });

  it('keeps every hand-written repair in the committed text', () => {
    for (const [key, override] of LEAD_TEXT_OVERRIDES) {
      const lead = LEADS.find((l) => l.key === key);
      expect(lead, `${key} is not a committed article`).toBeDefined();
      expect(lead?.paragraph, `${key} lost its repair`).toContain(override.replace);
      expect(lead?.paragraph, `${key} still carries the broken text`).not.toContain(override.find);
    }
  });

  it('fixes the five worst leads the review quoted', () => {
    const lead = (key: string): string => LEADS.find((l) => l.key === key)?.summary ?? '';
    expect(lead('countries/cape-verde')).toBe(
      'Cape Verde or Cabo Verde, officially the Republic of Cabo Verde, is an island country in Africa. ' +
        'It is a group of islands in the Atlantic Ocean, 570 km (354 mi) off the coast of Western Africa.',
    );
    expect(lead('arts/muhammad-ali')).toMatch(/^Muhammad Ali \(born Cassius Marcellus Clay Jr\.; .*was an American boxer\./);
    expect(lead('science/energy')).toMatch(/^In physics, energy is a property of matter and space\./);
    expect(lead('earth/mount-fuji')).toBe(
      'Mount Fuji (Fuji-san) is the tallest mountain in Japan, at 3,776 metres (12,388 ft) high. It is also a volcano.',
    );
    expect(lead('arts/basketball')).toMatch(
      /^Basketball is a team sport where two teams, usually of five players, play against each other on a basketball court,/,
    );
    expect(lead('science/iron')).toMatch(/^Iron is a chemical element and a metal\./);
    expect(lead('countries/laos')).toBe(
      "Laos, officially the Lao People's Democratic Republic (LPDR), is a country in Southeast Asia.",
    );
    expect(lead('inventions/helicopter')).toMatch(/^A helicopter is a kind of flying machine or aircraft\./);
    expect(lead('countries/hungary')).toMatch(/^Hungary is a landlocked country in Southeastern Central Europe\./);
  });

  it('still credits Simple English Wikipedia for every lead it kept', () => {
    for (const lead of LEADS) {
      expect(lead.article.source.licence, lead.key).toBe('CC BY-SA 4.0');
      expect(lead.article.source.url, lead.key).toContain('wikipedia.org');
    }
  });
});
