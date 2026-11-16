/**
 * Rebuilds `public/media/daily.json` (the picture of each day) from the committed records, with no download, and writes
 * the list of all 366 captions to docs/final-review/picture-of-the-day.md (26-final-review, round 3).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dailyPictures, dailyRejection } from './build.ts';

const DIR = 'public/media';
const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(f));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const items: any[] = files.flatMap((f) => (JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')) as { items: unknown[] }).items);

const days = dailyPictures(items);
const built = (JSON.parse(readFileSync(`${DIR}/daily.json`, 'utf8')) as { built: string }).built;
writeFileSync(`${DIR}/daily.json`, `${JSON.stringify({ built, days })}\n`);

const pool = items.filter((m) => dailyRejection(m) === null);
const unique = new Set(days.map((d) => d.id));
const rejected = new Map<string, number>();
for (const m of items) {
  const why = dailyRejection(m);
  if (why) rejected.set(why.replace(/:.*/, ''), (rejected.get(why.replace(/:.*/, '')) ?? 0) + 1);
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LENGTHS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const rows: string[] = [];
let n = 0;
for (let m = 0; m < 12; m++) {
  for (let d = 1; d <= (LENGTHS[m] ?? 0); d++) {
    const p = days[n++];
    rows.push(`| ${d} ${MONTHS[m]} | ${p?.articleTitle ?? ''} | ${p?.caption ?? ''} | ${p?.licence ?? ''} |`);
  }
}
const md = [
  '# Picture of the day: all 366 entries',
  '',
  'Rule (`dailyRejection` in `scripts/media/build.ts`): a photograph of wildlife, earth, space, places or people; Commons Featured, Quality or Valued; at least 1600 px wide; a real caption; no diagram, specimen or medical caption; nothing the suitability scan (`npm run suitability`) rejects; never a picture a bundled photograph already shows.',
  '',
  `The strong set has ${pool.length} pictures; ${unique.size} are used, and the year goes round the set ${(366 / Math.max(1, unique.size)).toFixed(1)} times.`,
  '',
  `Pictures in the library the rule leaves out, by reason: ${[...rejected].map(([k, v]) => `${k} (${v})`).join('; ')}.`,
  '',
  '| Day | Article | Caption | Licence |',
  '| --- | --- | --- | --- |',
  ...rows,
  '',
].join('\n');
writeFileSync('docs/final-review/picture-of-the-day.md', md);
console.log(`pool ${pool.length}, unique ${unique.size}, 366 days written`);
