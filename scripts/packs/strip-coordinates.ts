/**
 * Cuts coordinate strings out of the committed pack articles, their summaries and the pack indexes (24-review-4
 * Req 11) without a full `npm run packs` rebuild: the Colossus of Rhodes lead said "(approximate coordinates
 * 36°27'04"N, 28°13'40"E)". New builds are clean already, because `toArticle` applies the same function. Run
 * `scripts/quizzes/build.ts` and `scripts/packs/rebuild-home.ts` afterwards (quiz proofs and the manifest follow
 * the text).
 *
 *   npx tsx scripts/packs/strip-coordinates.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SUBJECTS } from '../../src/lib/packs/subjects.ts';
import { stripCoordinates } from '../../src/lib/text/coordinates.ts';

const DIR = join('public', 'packs');
let files = 0;
let changed = 0;

const clean = stripCoordinates;

for (const s of SUBJECTS) {
  for (const f of readdirSync(join(DIR, s.id)).filter((x) => x.endsWith('.json'))) {
    const path = join(DIR, s.id, f);
    const json = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const before = JSON.stringify(json);
    if (f === 'index.json') {
      for (const item of (json['items'] as Array<{ summary?: string }>) ?? []) if (item.summary) item.summary = clean(item.summary);
    } else if (Array.isArray(json['sections'])) {
      if (typeof json['summary'] === 'string') json['summary'] = clean(json['summary']);
      for (const sec of json['sections'] as Array<{ paragraphs: string[] }>) sec.paragraphs = sec.paragraphs.map(clean);
    } else {
      continue;
    }
    files++;
    if (JSON.stringify(json) !== before) {
      writeFileSync(path, `${JSON.stringify(json)}\n`);
      changed++;
      console.log(`  cleaned ${s.id}/${f}`);
    }
  }
}
console.log(`${files} files read, ${changed} changed.`);
