/**
 * Counts the quiz faults the final design review found (26-final-review D-1, D-5, D-6, D-7, D-8),
 * over every committed quiz in `public/packs/quizzes`. Run before and after a rebuild to show the
 * fix worked: `npx tsx scripts/quizzes/audit.ts`.
 *
 * Each count has one mechanical definition, printed with the number, so the same command gives the
 * same answer for anyone who runs it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { SUBJECTS } from '../../src/lib/packs/subjects.ts';
import type { FactsPack, QuizSet, Question } from '../../src/lib/packs/types.ts';
import { narrowsToOne } from '../../src/lib/quiz/hints.ts';
import { regionOf, isTwoNames } from '../../src/lib/quiz/generate.ts';
import { looksPlural } from '../../src/lib/quiz/pos.ts';
import { fold } from '../../src/lib/quiz/validate.ts';
import { wordnetPos } from './dictionary-pos.ts';

const ROOT = 'public/packs';
const read = <T>(p: string): T => JSON.parse(readFileSync(`${ROOT}/${p}`, 'utf8')) as T;

const facts = read<FactsPack>('countries/facts.json').countries;
const countryNames = new Set(facts.map((f) => fold(f.name)));
const capitals = new Set(facts.flatMap((f) => (f.capital ? [fold(f.capital)] : [])));
const idByName = new Map(facts.map((f) => [fold(f.name), f.id]));

/** Words that make an adjective gap a judgement about style, not knowledge. */
const SYNONYM_GROUPS = [
  'rich richest wealthy wealthiest richer wealthier affluent prosperous',
  'big biggest large largest huge biggest greatest great vast',
  'small smallest little tiny smaller',
  'old oldest ancient older earliest earlier early',
  'new newest newer modern recent latest',
  'important importance significant main major chief key central vital essential',
  'famous well-known known popular renowned',
  'many much numerous several lots plenty',
  'fast fastest quick quickest rapid',
  'strong strongest powerful mighty',
  'hot hottest warm warmest',
  'cold coldest cool coolest',
  'high highest tall tallest',
  'country nation state land',
  'war battle conflict fighting',
  'people persons humans population inhabitants',
].map((g) => new Set(g.split(' ')));

const sameGroup = (a: string, b: string): boolean =>
  SYNONYM_GROUPS.some((g) => g.has(fold(a)) && g.has(fold(b)));

const isCloze = (q: Question): boolean => q.prompt.startsWith('Fill the gap');
const answerOf = (q: Question): string => q.options[q.answer] ?? '';
const isYear = (s: string): boolean => /^\d{4}$/.test(s);
const isNumber = (s: string): boolean => /^[\d,.]+$/.test(s);

/** The filled-in prompt sentence, for the "proof adds nothing" count. */
function filledPrompt(q: Question): string {
  const inner = /^Fill the gap: “(.*)”$/.exec(q.prompt)?.[1] ?? '';
  return fold(inner.replace('_____', answerOf(q)));
}

const counts: Record<string, number> = {
  files: 0,
  questions: 0,
  cloze: 0,
  nudgeIdentifies: 0,
  letterCountNudges: 0,
  capitalisationLeaks: 0,
  distractorAsGoodOrBetter: 0,
  implausibleDistractors: 0,
  proofIsFilledPrompt: 0,
  wrongWhereToLook: 0,
};
const examples: Record<string, string[]> = {};
const note = (key: string, text: string): void => {
  counts[key] = (counts[key] ?? 0) + 1;
  (examples[key] ??= []).push(text);
};

for (const pack of SUBJECTS.map((s) => s.id)) {
  let files: string[];
  try {
    files = readdirSync(`${ROOT}/quizzes/${pack}`);
  } catch {
    continue;
  }
  for (const file of files) {
    const set = read<QuizSet>(`quizzes/${pack}/${file}`);
    counts['files'] = (counts['files'] ?? 0) + 1;
    for (const q of set.questions) {
      counts['questions'] = (counts['questions'] ?? 0) + 1;
      const answer = answerOf(q);
      const wrong = q.options.filter((_, i) => i !== q.answer);
      const where = `${pack}/${set.articleId} ${q.id}`;

      // D-1: a first hint that leaves exactly one option standing.
      if (narrowsToOne(q.hints.nudge, q.options)) note('nudgeIdentifies', `${where}: ${q.hints.nudge} [${q.options.join(' | ')}]`);
      if (/starts with the letter .{1,3} and has \d+ letters/i.test(q.hints.nudge)) counts['letterCountNudges'] = (counts['letterCountNudges'] ?? 0) + 1;

      // D-8: the proof is the question with the gap filled in.
      if (isCloze(q)) {
        counts['cloze'] = (counts['cloze'] ?? 0) + 1;
        if (filledPrompt(q) === fold(q.proof)) note('proofIsFilledPrompt', where);
      }

      // D-5: exactly one capitalised option, and it is the right one.
      if (isCloze(q) && !isYear(answer) && !isNumber(answer)) {
        const caps = q.options.filter((o) => /^[A-Z]/.test(o));
        if (caps.length === 1 && caps[0] === answer) note('capitalisationLeaks', `${where}: ${q.options.join(' | ')}`);
      }

      // D-6: a wrong answer that fits as well as or better than the right one.
      const place = countryNames.has(fold(answer)) || capitals.has(fold(answer));
      if (isCloze(q) && !isYear(answer) && !isNumber(answer) && !place) {
        const pos = wordnetPos(answer);
        if (pos === 'adj' && !/^[A-Z]/.test(answer)) note('distractorAsGoodOrBetter', `${where}: adjective gap “${answer}” [${q.options.join(' | ')}]`);
        else if (wrong.some((o) => sameGroup(o, answer))) note('distractorAsGoodOrBetter', `${where}: near-synonym [${q.options.join(' | ')}]`);
        else if (wrong.some((o) => looksPlural(o) !== looksPlural(answer))) note('distractorAsGoodOrBetter', `${where}: number mismatch [${q.options.join(' | ')}]`);
      }

      // D-7: a wrong answer no reader could take seriously.
      const bad: string[] = [];
      for (const o of wrong) {
        if (isTwoNames(o)) bad.push(`“${o}” is two names in one option`);
        if (/sign language/i.test(o) && !/sign language/i.test(answer)) bad.push(`“${o}” is a sign language`);
      }
      // A place is plausible only against places of its own sort from its own
      // region: the countries within three borders, or the whole continent when
      // the answer's country has almost no land neighbours (see `regionOf`).
      const borderQuestion = /shares a border with/.test(q.prompt);
      const anchor = borderQuestion ? set.articleId : idByName.get(fold(answer));
      if (countryNames.has(fold(answer)) || borderQuestion) {
        const region = anchor ? new Set(regionOf(anchor, facts).map((c) => c.id)) : null;
        for (const o of wrong) {
          const id = idByName.get(fold(o));
          if (!id) {
            if (capitals.has(fold(o))) bad.push(`“${o}” is a capital city offered as a country`);
            continue;
          }
          if (region && !region.has(id)) bad.push(`“${o}” is outside the region of the answer`);
        }
      }
      if (capitals.has(fold(answer)) && !countryNames.has(fold(answer))) {
        const owner = facts.find((c) => c.capital && fold(c.capital) === fold(answer))?.id;
        const region = owner ? new Set(regionOf(owner, facts).map((c) => c.capital ?? '').map(fold)) : null;
        for (const o of wrong) {
          // Luxembourg and Singapore are a country and a capital at once, so
          // they are fair options in either kind of question.
          if (countryNames.has(fold(o)) && !capitals.has(fold(o))) bad.push(`“${o}” is a country offered where a city belongs`);
          else if (region && capitals.has(fold(o)) && !region.has(fold(o))) bad.push(`“${o}” is outside the region of the answer`);
        }
      }
      if (bad.length > 0) note('implausibleDistractors', `${where}: ${bad.join('; ')}`);

      // The review's named mistake: a where-to-look hint pointing at the wrong section.
      if (q.hints.whereToLook.includes('“') && q.proofSection !== '' && !q.hints.whereToLook.includes(`“${q.proofSection}”`)) {
        note('wrongWhereToLook', `${where}: ${q.hints.whereToLook} but the proof is in “${q.proofSection}”`);
      }
      if (q.proofSection === '' && q.hints.whereToLook.includes('“')) note('wrongWhereToLook', `${where}: ${q.hints.whereToLook} but the proof is in the lead`);
    }
  }
}

const order = [
  'files', 'questions', 'cloze', 'nudgeIdentifies', 'letterCountNudges', 'capitalisationLeaks',
  'distractorAsGoodOrBetter', 'implausibleDistractors', 'proofIsFilledPrompt', 'wrongWhereToLook',
];
for (const key of order) console.log(`${key}: ${counts[key] ?? 0}`);
if (process.argv.includes('--examples')) {
  for (const [key, list] of Object.entries(examples)) {
    console.log(`\n== ${key} (${list.length}) ==`);
    for (const line of list.slice(0, 12)) console.log(`  ${line}`);
  }
}
