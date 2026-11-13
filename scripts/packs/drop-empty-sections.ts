/**
 * Applies the empty-section rule (22-review-3 Req 12) to the articles already
 * in public/packs, without fetching anything:
 *
 *   npx tsx scripts/packs/drop-empty-sections.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isEmptySection } from '../../src/lib/text/sections.ts';
import type { Article } from '../../src/lib/packs/types.ts';
import { MANIFEST_FILE, buildManifest } from './manifest.ts';

const DIR = join('public', 'packs');
let changed = 0;
for (const pack of readdirSync(DIR, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const f of readdirSync(join(DIR, pack.name))) {
    if (!f.endsWith('.json') || f === 'index.json' || f === 'facts.json') continue;
    const path = join(DIR, pack.name, f);
    const a = JSON.parse(readFileSync(path, 'utf8')) as Article;
    if (!Array.isArray(a.sections)) continue;
    const kept = a.sections.filter((s) => s.paragraphs.length > 0 && !isEmptySection(s));
    if (kept.length !== a.sections.length) {
      changed++;
      console.log(`${pack.name}/${f}: dropped ${a.sections.filter((s) => !kept.includes(s)).map((s) => s.heading).join(', ')}`);
      writeFileSync(path, `${JSON.stringify({ ...a, sections: kept })}\n`);
    }
  }
}
if (changed > 0) {
  const previous = JSON.parse(readFileSync(join(DIR, MANIFEST_FILE), 'utf8')) as { built: string };
  writeFileSync(join(DIR, MANIFEST_FILE), `${JSON.stringify(buildManifest(DIR, previous.built))}\n`);
}
console.log(`${changed} articles changed`);
