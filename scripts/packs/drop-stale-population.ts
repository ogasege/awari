/**
 * Removes sentences that give a country's own headcount as a number other than
 * the checked Wikidata figure (22-review-3 Req 11), from the shipped packs:
 *
 *   npx tsx scripts/packs/drop-stale-population.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { withoutConflictingPopulation } from '../../src/lib/text/population.ts';
import { isEmptySection } from '../../src/lib/text/sections.ts';
import type { Article, FactsPack } from '../../src/lib/packs/types.ts';
import { MANIFEST_FILE, buildManifest } from './manifest.ts';

const DIR = join('public', 'packs');
const facts = JSON.parse(readFileSync(join(DIR, 'countries', 'facts.json'), 'utf8')) as FactsPack;
let changed = 0;
for (const c of facts.countries) {
  if (c.population === undefined) continue;
  const path = join(DIR, 'countries', `${c.id}.json`);
  let a: Article;
  try {
    a = JSON.parse(readFileSync(path, 'utf8')) as Article;
  } catch {
    continue;
  }
  const sections = a.sections
    .map((s) => ({ ...s, paragraphs: withoutConflictingPopulation(s.paragraphs, c.id, a.title, c.population as number) }))
    .filter((s) => s.paragraphs.length > 0 && !isEmptySection(s));
  const before = JSON.stringify(a.sections);
  if (JSON.stringify(sections) !== before) {
    changed++;
    console.log(`${c.id}: changed`);
    // A note or a quiz question whose proof sentence is gone goes with it.
    const text = sections.flatMap((s) => s.paragraphs).join(' ');
    const notes = a.notes.filter((n) => n.proof === undefined || text.includes(n.proof));
    writeFileSync(path, `${JSON.stringify({ ...a, sections, notes })}\n`);
    const quizPath = join(DIR, 'quizzes', 'countries', `${c.id}.json`);
    try {
      const quiz = JSON.parse(readFileSync(quizPath, 'utf8')) as { questions: Array<{ proof: string }> };
      const questions = quiz.questions.filter((q) => text.includes(q.proof));
      if (questions.length !== quiz.questions.length) {
        console.log(`  ${c.id}: ${quiz.questions.length - questions.length} quiz question(s) removed`);
        writeFileSync(quizPath, `${JSON.stringify({ ...quiz, questions })}\n`);
      }
    } catch {
      // no quiz file for this country
    }
  }
}
if (changed > 0) {
  const previous = JSON.parse(readFileSync(join(DIR, MANIFEST_FILE), 'utf8')) as { built: string };
  writeFileSync(join(DIR, MANIFEST_FILE), `${JSON.stringify(buildManifest(DIR, previous.built))}\n`);
}
console.log(`${changed} articles changed`);
