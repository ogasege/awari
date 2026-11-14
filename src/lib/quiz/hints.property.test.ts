/**
 * Rung one of the hint ladder (26-final-review D-1).
 *
 * The design reviewer pressed "Give me a nudge" on the live Nigeria quiz and
 * was told "It starts with the letter A and has 5 letters." for the options
 * Nairobi, Freetown, Algiers, Abuja. One option matched, so rung one was the
 * answer; it held for 2,254 of the 2,360 committed questions.
 *
 * These tests read the wording of each committed nudge and work out for
 * themselves which options it could be describing, rather than asking the code
 * that wrote it. A nudge is fair when at least two of the four options still
 * stand after everything it says is applied.
 */
import { readFileSync, readdirSync } from 'node:fs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Question, QuizSet } from '../packs/types.ts';
import { safeNudge } from './hints.ts';

const ROOT = 'public/packs/quizzes';

/** Every question in every committed quiz, with the file it came from. */
function committed(): Array<{ where: string; q: Question }> {
  const out: Array<{ where: string; q: Question }> = [];
  for (const pack of readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const file of readdirSync(`${ROOT}/${pack.name}`)) {
      const set = JSON.parse(readFileSync(`${ROOT}/${pack.name}/${file}`, 'utf8')) as QuizSet;
      for (const q of set.questions) out.push({ where: `${pack.name}/${set.articleId} ${q.id}`, q });
    }
  }
  return out;
}

const CENTURIES = [
  'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth',
  'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first',
];

const letters = (text: string): number => text.replace(/[^A-Za-z]/g, '').length;
const plural = (text: string): boolean => /[^s]s$/.test(text.toLowerCase()) && !/(?:us|is|ss|ics)$/.test(text.toLowerCase());

/**
 * Whether an option fits everything a nudge says about the answer: the first
 * letter, the number of letters, words or digits, the century or decade of a
 * year, and whether the word names one thing or more than one.
 */
function fits(nudge: string, option: string): boolean {
  const o = option.trim();
  const checks: Array<boolean> = [];
  const letter = /starts with the letter ([A-Za-z])/.exec(nudge);
  if (letter) checks.push(o.charAt(0).toUpperCase() === (letter[1] as string).toUpperCase());
  const long = /has (\d+) letters/.exec(nudge);
  if (long) checks.push(letters(o) === Number(long[1]));
  const words = /is (\d+) words long/.exec(nudge);
  if (words) checks.push(o.split(/\s+/).length === Number(words[1]));
  const digits = /number with (\d+) digits?/.exec(nudge);
  if (digits) checks.push(o.replace(/\D/g, '').length === Number(digits[1]));
  const decade = /in the (\d0)s of the/.exec(nudge);
  if (decade) checks.push(/^\d{4}$/.test(o) && Math.floor((Number(o) % 100) / 10) * 10 === Number(decade[1]));
  const century = new RegExp(`the (${CENTURIES.join('|')}) century`).exec(nudge);
  if (century) {
    const want = CENTURIES.indexOf(century[1] as string) + 10;
    checks.push(/^\d{4}$/.test(o) && Math.floor((Number(o) - 1) / 100) + 1 === want);
  }
  if (/names more than one thing/.test(nudge)) checks.push(plural(o));
  else if (/names one thing/.test(nudge)) checks.push(!plural(o));
  return checks.every(Boolean);
}

/** How many of the four options the nudge could be talking about. */
const standing = (q: Question): number => q.options.filter((o) => fits(q.hints.nudge, o)).length;

const all = committed();

describe('the first hint never names the answer (26-final-review D-1)', () => {
  it('reads every committed quiz', () => {
    expect(all.length).toBeGreaterThan(2000);
  });

  it('Property 1: in every committed quiz, at least two options still fit the first hint. _D-1_', () => {
    const guilty = all.filter(({ q }) => standing(q) === 1);
    expect(
      guilty.slice(0, 5).map(({ where, q }) => `${where}: “${q.hints.nudge}” [${q.options.join(' | ')}]`),
    ).toEqual([]);
    expect(guilty).toHaveLength(0);
  });

  it('Property 2: no first hint counts the answer’s letters, names the answer or quotes another option. _D-1_', () => {
    const fold = (t: string): string => t.replace(/\s+/g, ' ').trim().toLowerCase();
    for (const { where, q } of all) {
      const nudge = q.hints.nudge;
      expect(nudge, where).not.toMatch(/starts with the letter .{1,3} and has \d+ letters/i);
      for (const option of q.options) {
        expect(fold(nudge).includes(fold(option)), `${where}: “${nudge}” quotes “${option}”`).toBe(false);
      }
    }
  });

  it('Property 3: for any four options, a nudge the builder keeps leaves at least two of them standing. _D-1_', () => {
    const word = fc.stringMatching(/^[A-Z][a-z]{3,9}$/);
    const year = fc.integer({ min: 1200, max: 2025 }).map(String);
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.oneof(word, year), { minLength: 4, maxLength: 4 }),
        fc.constantFrom('term', 'year', 'capital', 'neighbour', 'language', 'currency' as const),
        word,
        (options, kind, title) => {
          const answer = options[0] as string;
          const nudge = safeNudge(
            { kind, answer, title, beside: options[1], proper: /^[A-Z]/.test(answer) },
            options,
          );
          if (nudge === null) return;
          expect(options.filter((o) => fits(nudge, o)).length).toBeGreaterThanOrEqual(2);
        },
      ),
      { numRuns: 400 },
    );
  });

  it('the reviewer’s own example: the Nigeria capital question no longer counts letters', () => {
    const nigeria = JSON.parse(
      readFileSync(`${ROOT}/countries/nigeria.json`, 'utf8'),
    ) as QuizSet;
    const capital = nigeria.questions.find((q) => q.prompt.includes('capital city'));
    expect(capital?.hints.nudge).toBe(
      'A capital city is where a country’s government meets. The other three are capital cities too, of other countries.',
    );
    expect(standing(capital as Question)).toBe(4);
  });
});
