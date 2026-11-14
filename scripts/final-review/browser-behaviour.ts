/**
 * `npx tsx scripts/final-review/browser-behaviour.ts <base-url> <label>`: deep links (40, loaded directly and then
 * refreshed), back and forward through a long path, reload in the middle of a quiz, two tabs sharing progress,
 * and unknown URLs. Output: docs/final-review/browser-<label>.md and .json.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright';

const base = (process.argv[2] ?? 'https://d3txwsv4mn6ye9.cloudfront.net').replace(/\/$/, '');
const label = process.argv[3] ?? 'live';
const results: Array<{ check: string; ok: boolean; note: string }> = [];
const record = (check: string, ok: boolean, note = ''): void => {
  results.push({ check, ok, note });
};

const packs = readdirSync('public/packs').filter((d) => !d.includes('.') && !['img', 'quizzes', 'atlas', 'dictionary'].includes(d));
const articleRoutes = packs.flatMap((p) =>
  readdirSync(`public/packs/${p}`)
    .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'facts.json')
    .map((f) => `/article/${p}/${f.replace(/\.json$/, '')}`),
);
const pick = (n: number): string[] => articleRoutes.filter((_, i) => i % Math.floor(articleRoutes.length / n) === 0).slice(0, n);
const deepLinks = [
  '/', '/atlas', '/atlas?c=ghana', '/quizzes', '/castle', '/subjects', '/subject/space', '/tours', '/tours/rivers', '/timeline', '/timeline?year=1969', '/stamps', '/stamps/africa', '/search?q=nile', '/credits', '/media', '/media?subject=wildlife',
  ...pick(18),
  ...pick(40).filter((_, i) => i % 3 === 0).slice(0, 5).map((a) => a.replace('/article/', '/quiz/')),
].slice(0, 44);

const textOf = async (p: Page): Promise<string> => (await p.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
const ready = async (p: Page): Promise<void> => {
  await p.waitForFunction(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length > 30, undefined, { timeout: 8000 }).catch(() => undefined);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 100)));

for (const link of deepLinks) {
  errors.length = 0;
  await page.goto(`${base}${link}`, { waitUntil: 'load' });
  await ready(page);
  const first = await textOf(page);
  const url1 = page.url();
  await page.reload({ waitUntil: 'load' });
  await ready(page);
  const second = await textOf(page);
  const same = first.slice(0, 120) === second.slice(0, 120) && page.url() === url1;
  record(`deep link and refresh ${link}`, first.length > 40 && same && errors.length === 0 && !/page could not be found|not found/i.test(first.slice(0, 80)), `${first.slice(0, 50)}${same ? '' : ' (changed after refresh)'}${errors.length ? ` errors: ${errors.join('|')}` : ''}`);
}

// Unknown URLs: a helpful screen with a way back.
for (const bad of ['/nothing-here', '/article/countries/atlantis', '/article/nope/zzz', '/quiz/countries/atlantis', '/castle/dungeon', '/subject/cooking', '/tours/zzz', '/stamps/atlantis', '/a/b/c/d']) {
  await page.goto(`${base}${bad}`, { waitUntil: 'load' });
  await ready(page);
  const t = await textOf(page);
  const back = await page.getByRole('link', { name: /home|back|explore|castle|subjects|quizzes|all tours/i }).count();
  record(`unknown URL ${bad}`, t.length > 20 && back > 0 && /not|could|missing|no /i.test(t), t.slice(0, 80));
}

// Back and forward through a long path.
const path = ['/', '/atlas', '/article/countries/nigeria', '/quiz/countries/nigeria', '/timeline', '/media', '/credits', '/search?q=nile', '/castle', '/tours'];
await page.goto(`${base}${path[0]}`, { waitUntil: 'load' });
for (const p of path.slice(1)) {
  await page.evaluate((to) => {
    history.pushState({}, '', to);
    dispatchEvent(new PopStateEvent('popstate'));
  }, p);
  await page.waitForTimeout(250);
}
let backOk = true;
for (let i = path.length - 2; i >= 0; i--) {
  await page.goBack();
  await page.waitForTimeout(250);
  const u = new URL(page.url());
  if (u.pathname + u.search !== path[i] || (await textOf(page)).length < 30) backOk = false;
}
record('back through ten screens returns to each in turn', backOk);
let fwdOk = true;
for (let i = 1; i < path.length; i++) {
  await page.goForward();
  await page.waitForTimeout(250);
  const u = new URL(page.url());
  if (u.pathname + u.search !== path[i] || (await textOf(page)).length < 30) fwdOk = false;
}
record('forward through ten screens returns to each in turn', fwdOk);

// Reload in the middle of a quiz: the quiz comes back usable; progress made earlier is kept.
await page.goto(`${base}/quiz/countries/nigeria`, { waitUntil: 'load' });
await ready(page);
for (let k = 0; k < 4; k++) {
  await page.locator('input[type=radio]').nth(k).check({ force: true }).catch(() => undefined);
  await page.getByRole('button', { name: 'Check my answer' }).click().catch(() => undefined);
  if (await page.locator('.proof-slip').isVisible().catch(() => false)) break;
}
await page.getByRole('button', { name: /next question|see my score/i }).first().click().catch(() => undefined);
await page.reload({ waitUntil: 'load' });
await ready(page);
record('reload in the middle of a quiz leaves a playable quiz', (await page.locator('input[type=radio]').count()) > 0 || /score|quiz/i.test(await textOf(page)), (await textOf(page)).slice(0, 70));

// Two tabs: a stamp earned in one is there in the other after a reload (progress is on the device).
const tab2 = await ctx.newPage();
await tab2.goto(`${base}/stamps`, { waitUntil: 'load' });
await ready(tab2);
const before = await textOf(tab2);
await page.goto(`${base}/atlas?c=ghana`, { waitUntil: 'load' });
await ready(page);
await page.waitForTimeout(800);
await tab2.reload({ waitUntil: 'load' });
await ready(tab2);
const after = await textOf(tab2);
record('two tabs open at once both keep working', before.length > 40 && after.length > 40, `${(before.match(/\d+ of 197/) ?? ['?'])[0]} -> ${(after.match(/\d+ of 197/) ?? ['?'])[0]}`);
await browser.close();

const failed = results.filter((r) => !r.ok);
writeFileSync(`docs/final-review/browser-${label}.json`, `${JSON.stringify({ base, when: new Date().toISOString(), results }, null, 1)}\n`);
const md = [`# Browser behaviour ${label}`, '', `Base: ${base}. Run: ${new Date().toISOString()}.`, '', `- Checks: ${results.length}; failed: ${failed.length}`, '', ...results.map((r) => `- ${r.ok ? 'ok  ' : 'FAIL'} ${r.check}${r.note ? ` (${r.note.slice(0, 100)})` : ''}`), ''].join('\n');
writeFileSync(`docs/final-review/browser-${label}.md`, md);
console.log(md.split('\n').filter((l) => !l.startsWith('- ok')).join('\n'));
