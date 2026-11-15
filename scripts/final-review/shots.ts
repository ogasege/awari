/**
 * `npx tsx scripts/final-review/shots.ts <base-url>`: viewport screenshots of every screen type at 1440 and 390 px,
 * composed into contact sheets small enough for the design reviewer (docs/final-review/sheets/). The single
 * screenshots go to docs/final-review/shots/ (not committed).
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';

const base = (process.argv[2] ?? 'https://d3txwsv4mn6ye9.cloudfront.net').replace(/\/$/, '');
const SCREENS: Array<[string, string]> = [
  ['home', '/'],
  ['article-country', '/article/countries/nigeria'],
  ['article-wildlife', '/article/wildlife/lion'],
  ['article-science', '/article/science/temperature'],
  ['article-movie-theatre', '/article/arts/movie-theatre'],
  ['article-carbon', '/article/science/carbon'],
  ['quiz', '/quiz/countries/nigeria'],
  ['quizzes', '/quizzes'],
  ['castle', '/castle'],
  ['atlas', '/atlas?c=nigeria'],
  ['timeline', '/timeline'],
  ['pictures', '/media'],
  ['tours', '/tours'],
  ['tour', '/tours/rivers'],
  ['subjects', '/subjects'],
  ['subject', '/subject/space'],
  ['stamps', '/stamps'],
  ['stamps-africa', '/stamps/africa'],
  ['search', '/search?q=nile'],
  ['search-none', '/search?q=zzqxjvk'],
  ['credits', '/credits'],
  ['not-found', '/no-such-page'],
];
mkdirSync('docs/final-review/shots', { recursive: true });
mkdirSync('docs/final-review/sheets', { recursive: true });
const browser = await chromium.launch();
for (const [vp, width, height, perSheet, cols] of [['1440', 1440, 900, 4, 2], ['390', 390, 844, 8, 4]] as const) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const files: string[] = [];
  for (const [name, path] of SCREENS) {
    await page.goto(`${base}${path}`, { waitUntil: 'load' });
    await page.waitForFunction(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length > 30, undefined, { timeout: 8000 }).catch(() => undefined);
    await page.waitForTimeout(900);
    if (name === 'pictures') await page.locator('.tile').first().waitFor({ timeout: 5000 }).catch(() => undefined);
    const file = `docs/final-review/shots/${name}-${vp}.jpg`;
    const buf = await page.screenshot({ type: 'jpeg', quality: 62 });
    await sharp(buf).toFile(file);
    files.push(file);
  }
  const cellW = vp === '1440' ? 800 : 300;
  const cellH = Math.round((cellW * height) / width);
  for (let s = 0; s * perSheet < files.length; s++) {
    const group = files.slice(s * perSheet, (s + 1) * perSheet);
    const rows = Math.ceil(group.length / cols);
    const tiles = await Promise.all(group.map(async (f, i) => ({ input: await sharp(f).resize(cellW, cellH).toBuffer(), left: (i % cols) * (cellW + 6), top: Math.floor(i / cols) * (cellH + 6) })));
    await sharp({ create: { width: cols * (cellW + 6), height: rows * (cellH + 6), channels: 3, background: '#888' } })
      .composite(tiles)
      .jpeg({ quality: 70 })
      .toFile(`docs/final-review/sheets/sheet-${vp}-${s + 1}.jpg`);
    console.log(`sheet-${vp}-${s + 1}: ${group.map((f) => f.split('/').pop()?.replace(/\.jpg$/, '')).join(', ')}`);
  }
  await ctx.close();
}
await browser.close();
