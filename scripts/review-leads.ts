/**
 * Contact sheet of the lead photograph of every article on the judges' path
 * and of the thirty most populous countries (21-review-2 Req 20), read from
 * the committed packs. Prints a table and writes a numbered sheet image to
 * the path given, so each lead can be judged by eye.
 *
 *   npx tsx scripts/review-leads.ts <out.png>
 */
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { TOURS } from '../src/features/tours/tours.ts';
import type { Article, FactsPack } from '../src/lib/packs/types.ts';

const out = process.argv[2] ?? 'leads.png';
const facts = JSON.parse(readFileSync('public/packs/countries/facts.json', 'utf8')) as FactsPack;
const top30 = [...facts.countries]
  .filter((c) => typeof c.population === 'number')
  .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
  .slice(0, 30)
  .map((c) => `countries/${c.id}`);
const judges = ['countries/nigeria', 'wildlife/lion', ...TOURS.flatMap((t) => t.stops.map((s) => s.article))];
const keys = [...new Set([...judges, ...top30])];

const CELL = 240;
const COLS = 6;
const rows = Math.ceil(keys.length / COLS);
const tiles: sharp.OverlayOptions[] = [];
keys.forEach((key, i) => {
  const a = JSON.parse(readFileSync(`public/packs/${key}.json`, 'utf8')) as Article;
  const p = a.photos[0];
  console.log(`${String(i + 1).padStart(2)} ${key.padEnd(40)} ${p ? p.file : 'NO PHOTO'} | ${p?.alt ?? ''}`);
  if (!p) return;
  const left = (i % COLS) * CELL;
  const top = Math.floor(i / COLS) * (CELL + 20);
  tiles.push({ input: `public/packs/${p.file}`, left, top });
});
const resized: sharp.OverlayOptions[] = [];
for (const [n, t] of tiles.entries()) {
  const buf = await sharp(t.input as string).resize(CELL - 6, CELL - 6, { fit: 'cover' }).toBuffer();
  resized.push({ input: buf, left: (t.left ?? 0) + 3, top: (t.top ?? 0) + 3 });
  void n;
}
const label = (i: number, key: string): sharp.OverlayOptions => ({
  input: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CELL}" height="20"><text x="4" y="15" font-size="13" font-family="Arial" fill="#000">${i + 1} ${key.split('/')[1]?.slice(0, 26) ?? ''}</text></svg>`,
  ),
  left: (i % COLS) * CELL,
  top: Math.floor(i / COLS) * (CELL + 20) + CELL,
});
await sharp({ create: { width: COLS * CELL, height: rows * (CELL + 20), channels: 3, background: '#fff' } })
  .composite([...resized, ...keys.map((k, i) => label(i, k))])
  .png()
  .toFile(out);
console.log(`${keys.length} articles -> ${out}`);
