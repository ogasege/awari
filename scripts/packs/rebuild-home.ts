/**
 * Rebuilds only `public/packs/home.json` and the manifest from the pack
 * articles already on disk, for changes to Home's notes that need no
 * Wikipedia or Commons access (21-review-2 Req 7-8).
 *
 *   npx tsx scripts/packs/rebuild-home.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Article } from '../../src/lib/packs/types.ts';
import { SUBJECTS } from '../../src/lib/packs/subjects.ts';
import { buildHome } from './home.ts';
import { MANIFEST_FILE, buildManifest } from './manifest.ts';

const DIR = join('public', 'packs');
const articles: Article[] = [];
for (const s of SUBJECTS) {
  for (const f of readdirSync(join(DIR, s.id))) {
    if (f === 'index.json' || !f.endsWith('.json')) continue;
    articles.push(JSON.parse(readFileSync(join(DIR, s.id, f), 'utf8')) as Article);
  }
}
const home = buildHome(articles);
writeFileSync(join(DIR, 'home.json'), `${JSON.stringify(home)}\n`);
const previous = JSON.parse(readFileSync(join(DIR, MANIFEST_FILE), 'utf8')) as { built: string };
writeFileSync(join(DIR, MANIFEST_FILE), `${JSON.stringify(buildManifest(DIR, previous.built))}\n`);
console.log(`home.json: ${home.notes.length} notes, ${articles.length} articles read`);
