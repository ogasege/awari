/**
 * Removes from the bundled article packs every sentence about abortion or sexual content (26-final-review N-2, R-6).
 * Wars, genocide and other history stay: they are what an encyclopedia is for at this level, and the round-3 reviewer
 * judged them suitable. Prints what it removed. The pack manifest is rebuilt after it (rebuild-home.ts).
 *
 *   npx tsx scripts/packs/drop-unsuitable-sentences.ts
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { ARTICLE_UNSUITABLE } from '../../src/lib/text/suitability.ts';

const ROOT = 'public/packs';
const SKIP = new Set(['img', 'quizzes', 'atlas', 'dictionary']);

/** The sentences of a paragraph, keeping their punctuation. */
function sentences(p: string): string[] {
  return p.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [p];
}

let removed = 0;
for (const pack of readdirSync(ROOT).filter((d) => !d.includes('.') && !SKIP.has(d))) {
  for (const f of readdirSync(`${ROOT}/${pack}`).filter((x) => x.endsWith('.json') && x !== 'index.json' && x !== 'facts.json')) {
    const path = `${ROOT}/${pack}/${f}`;
    const article = JSON.parse(readFileSync(path, 'utf8')) as { sections: Array<{ heading: string; paragraphs: string[] }> };
    let changed = false;
    for (const s of article.sections) {
      s.paragraphs = s.paragraphs
        .map((p) => {
          const kept = sentences(p).filter((x) => {
            if (ARTICLE_UNSUITABLE.test(x)) {
              console.log(`${pack}/${f} ${x.trim().slice(0, 120)}`);
              removed += 1;
              changed = true;
              return false;
            }
            return true;
          });
          return kept.join('').trim();
        })
        .filter((p) => p.length > 0);
    }
    if (changed) writeFileSync(path, `${JSON.stringify(article)}\n`);
  }
}
console.log(`removed ${removed} sentences`);
