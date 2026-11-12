/**
 * Second half of `npm run stats`: writes the generated numbers into every
 * tagged number (`<!--n:key-->…<!--/n-->`) of the write-up documents, so
 * no count is ever typed by hand (rules-alignment brief, item 1).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fillNumbers } from './lib/writeup.ts';

const stats = JSON.parse(readFileSync('docs/generated/stats.json', 'utf8')) as Record<string, number | string>;
const docs = ['README.md', 'docs/devpost.md', 'docs/blog-post.md', 'docs/social-post.md', 'docs/judges.md', 'docs/video-script.md'];
let changed = 0;
for (const doc of docs) {
  if (!existsSync(doc)) continue;
  const before = readFileSync(doc, 'utf8');
  const after = fillNumbers(before, stats);
  if (after !== before) {
    writeFileSync(doc, after);
    changed += 1;
  }
}
console.log(`Filled numbers in ${changed} document(s).`);
