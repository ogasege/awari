/**
 * Turns the design reviewer's "drop" verdicts (rounds 1 and 2) into a list of Commons files that are never used:
 * `scripts/media/denylist.json`. The reports name pictures by the first six characters of their id; each is
 * resolved against the records that were reviewed (the current `public/media/*.json`), and the Commons file
 * title is stored, so the exclusion survives every rebuild.
 *
 *   npx tsx scripts/media/denylist.ts
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CREW = join('docs', 'kiro-evidence', 'crew');
const reports = ['media-design-review-1.md', 'media-design-review-2.md'];

const titles = new Map<string, string>(); // id prefix (6) -> title
const files = readdirSync('public/media').filter((f) => f.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(f));
for (const f of files) {
  for (const m of (JSON.parse(readFileSync(join('public/media', f), 'utf8')) as { items: Array<{ id: string; title: string }> }).items) {
    titles.set(m.id.slice(0, 6), m.title);
  }
}
const previous = existsSync('scripts/media/denylist.json') ? (JSON.parse(readFileSync('scripts/media/denylist.json', 'utf8')) as { titles: string[] }).titles : [];
const deny = new Set<string>(previous);
let rows = 0;
let unresolved = 0;
for (const r of reports) {
  const text = readFileSync(join(CREW, r), 'utf8');
  for (const line of text.split('\n')) {
    const m = /^\|\s*\d+\/\d+\s*\|\s*([0-9a-f]{6})\s*\|[^|]*\|[^|]*\|\s*(drop[^|]*)\|/.exec(line);
    if (!m) continue;
    rows++;
    const title = titles.get(m[1] ?? '');
    if (title) deny.add(title);
    else unresolved++;
  }
}
writeFileSync(
  'scripts/media/denylist.json',
  `${JSON.stringify({ note: 'Commons files the design reviewer said to drop (rounds 1 and 2); see docs/kiro-evidence/crew/media-design-review-*.md', titles: [...deny].sort() }, null, 1)}\n`,
);
console.log(`${rows} drop verdicts; ${deny.size} titles on the list (${unresolved} no longer in the library).`);
