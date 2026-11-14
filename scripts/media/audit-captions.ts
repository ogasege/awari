/**
 * Counts the caption defects of the committed library (26-final-review D-2, D-3, D-14 to D-16, D-36 to D-39), so the
 * before and after of a caption rule change can be compared. Reads `public/media/*.json` only; writes nothing.
 *
 *   npx tsx scripts/media/audit-captions.ts            counts, with a few examples of each
 *   npx tsx scripts/media/audit-captions.ts --all      every offending caption
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEFECTS, captionDefect, captionDefects } from './caption.ts';
import { MIN_PER_ARTICLE } from './select.ts';

const DIR = join('public', 'media');

interface Row {
  article: string;
  title: string;
  caption: string;
  lead: boolean;
}

/** Every picture in the library, in record order. */
export function libraryCaptions(dir = DIR): Row[] {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(f));
  return files.flatMap((f) => (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { items: Row[] }).items);
}

/** The articles of every pack, so an article with no picture at all is counted too. */
function packArticles(): string[] {
  const root = join('public', 'packs');
  const out: string[] = [];
  for (const d of readdirSync(root, { withFileTypes: true })) {
    const index = join(root, d.name, 'index.json');
    if (!d.isDirectory() || !existsSync(index)) continue;
    for (const a of (JSON.parse(readFileSync(index, 'utf8')) as { items?: Array<{ id: string }> }).items ?? []) out.push(`${d.name}/${a.id}`);
  }
  return out;
}

const rows = libraryCaptions();
const all = process.argv.includes('--all');
console.log(`${rows.length} captions in ${readdirSync(DIR).filter((f) => f.endsWith('.json')).length - 3} subject files.\n`);
console.log('| Defect | Count |');
console.log('| --- | --- |');
const examples = new Map<string, Row[]>();
for (const r of rows) {
  for (const d of captionDefects(r.caption)) examples.set(d, [...(examples.get(d) ?? []), r]);
}
for (const name of DEFECTS) console.log(`| ${name} | ${(examples.get(name) ?? []).length} |`);
console.log(`| **any defect** | ${rows.filter((r) => captionDefect(r.caption) !== undefined).length} |`);

const perArticle = new Map<string, number>();
for (const r of rows) perArticle.set(r.article, (perArticle.get(r.article) ?? 0) + 1);
const low = packArticles()
  .filter((a) => (perArticle.get(a) ?? 0) < MIN_PER_ARTICLE)
  .map((a) => `${a} (${perArticle.get(a) ?? 0})`);
console.log(`\nArticles under ${MIN_PER_ARTICLE} pictures: ${low.length}\n  ${low.join('\n  ')}`);

for (const [name, list] of [...examples].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n## ${name} (${list.length})`);
  for (const r of all ? list : list.slice(0, 6)) console.log(`  ${r.lead ? 'LEAD ' : '     '}${r.article} | ${r.caption}`);
}
