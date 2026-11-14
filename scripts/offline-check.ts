/**
 * `npm run offline-check` (09-offline Req 4): serves the built site on
 * localhost, visits it once, switches the browser offline (airplane mode)
 * and opens every pack feature, failing if any of them breaks.
 *
 * Needs `npm run build` first and Playwright's Chromium.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium, type Page } from 'playwright';

const DIST = 'dist';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json',
};

if (!existsSync(join(DIST, 'sw.js'))) {
  console.error('dist/sw.js not found. Run npm run build first.');
  process.exit(1);
}

// A static server that falls back to index.html like the real site does.
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) {
    file = join(DIST, 'index.html');
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
// OFFLINE_CHECK_URL=https://... runs the same steps against a deployed site instead of dist/.
const liveUrl = process.env.OFFLINE_CHECK_URL?.replace(/\/$/, '');
if (!liveUrl) await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const base =
  liveUrl ?? `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;

const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: 'allow' });
const page = await context.newPage();
const problems: string[] = [];
const results: string[] = [];
page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));

async function step(name: string, fn: (p: Page) => Promise<void>): Promise<void> {
  try {
    await fn(page);
    results.push(`  ok   ${name}`);
  } catch (error) {
    const message = error instanceof Error ? (error.message.split('\n')[0] ?? '') : String(error);
    problems.push(`${name}: ${message}`);
    results.push(`  FAIL ${name}: ${message}`);
  }
}

const open = async (p: Page, path: string): Promise<void> => {
  await p.goto(`${base}${path}`, { waitUntil: 'load' });
};

// 1. One visit online: wait until the site says it is saved.
console.log(`Visiting ${base} once, online…`);
await page.goto(base, { waitUntil: 'load' });
await page.getByText('Saved. Awari now works without a connection.').waitFor({ timeout: liveUrl ? 600_000 : 90_000 });
// Any article, on demand (14-any-article): read one from Wikipedia while online.
let wikiRead = false;
try {
  await page.goto(`${base}/article/wiki/Okapi`, { waitUntil: 'load' });
  await page.getByRole('heading', { name: 'Okapi' }).first().waitFor({ timeout: 20_000 });
  wikiRead = true;
  console.log('Read the Okapi article from Wikipedia while online.');
} catch {
  console.log('Wikipedia was not reachable: skipping the on-demand article check.');
}
console.log('Saved. Going offline (airplane mode).');
// A picture strip and the Pictures screen, looked at while online: the service worker keeps the pictures it shows.
await page.goto(`${base}/article/ancient/colosseum`, { waitUntil: 'load' });
await page.waitForFunction(
  () => [...document.querySelectorAll('.gallery__thumb img')].some((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0),
  undefined,
  { timeout: 20_000 },
);
await page.goto(`${base}/media`, { waitUntil: 'load' });
await page.getByRole('status').filter({ hasText: /Showing \d+ of \d+ pictures/ }).waitFor({ timeout: 20_000 });
await page.waitForFunction(
  () => [...document.querySelectorAll('.tile img')].slice(0, 6).every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0),
  undefined,
  { timeout: 20_000 },
);
await context.setOffline(true);

// 2. Every pack feature, with the network gone.
await step('Home opens and the header says Offline', async (p) => {
  await open(p, '/');
  await p.getByRole('status').filter({ hasText: /^Offline$/ }).waitFor({ timeout: 10_000 });
  await p.getByRole('heading', { name: 'On this day' }).waitFor({ timeout: 10_000 });
});

await step('Nigeria article renders and "delta" resolves', async (p) => {
  await open(p, '/article/countries/nigeria');
  await p.getByRole('heading', { name: /Nigeria/ }).first().waitFor({ timeout: 10_000 });
  await p.locator('[data-w="Delta"]').first().click();
  await p.locator('.word-card__senses').waitFor({ timeout: 10_000 });
  const text = await p.locator('.word-card__answer').innerText();
  if (!/delta/i.test(text)) throw new Error(`no meaning for delta: ${text}`);
});

await step('Nigeria quiz plays a question with a hint', async (p) => {
  await open(p, '/quiz/countries/nigeria');
  await p.getByText('Question 1 of 5').first().waitFor({ timeout: 10_000 });
  await p.getByRole('button', { name: 'Give me a nudge' }).click();
  await p.getByRole('radio').first().check({ force: true });
  await p.getByRole('button', { name: 'Check my answer' }).click();
  await p.getByText(/Right!|Not quite\./).first().waitFor({ timeout: 10_000 });
});

await step('Quizzes list opens', async (p) => {
  await open(p, '/quizzes');
  await p.getByRole('link', { name: 'Nigeria' }).first().waitFor({ timeout: 10_000 });
});

await step('Atlas shows the globe and a country', async (p) => {
  await open(p, '/atlas?c=nigeria');
  await p.locator('#atlas-card-title').filter({ hasText: 'Nigeria' }).waitFor({ timeout: 15_000 });
  await p.locator('svg[role="application"]').waitFor({ timeout: 10_000 });
});

await step('Castle wing opens', async (p) => {
  await open(p, '/castle/africa');
  await p.getByText(/Room 1 of 12/).first().waitFor({ timeout: 10_000 });
});

await step('Timeline lists events', async (p) => {
  await open(p, '/timeline');
  await p.getByText(/Showing \d+ events\./).waitFor({ timeout: 10_000 });
});

await step('Search finds an article', async (p) => {
  await open(p, '/search?q=egypt');
  await p.getByRole('link', { name: 'Egypt' }).first().waitFor({ timeout: 10_000 });
});

await step('A route never visited opens (navigation fallback)', async (p) => {
  await open(p, '/credits');
  await p.getByRole('heading', { name: /open knowledge/i }).first().waitFor({ timeout: 10_000 });
});

await step('Subjects list and a subject wall open', async (p) => {
  await open(p, '/subjects');
  await p.getByRole('link', { name: /Wildlife/ }).first().waitFor({ timeout: 10_000 });
  await open(p, '/subject/wildlife');
  await p.getByText(/\d+ articles in this subject\./).waitFor({ timeout: 10_000 });
  await p.locator('.subject__print').first().waitFor({ timeout: 10_000 });
});

await step('A subject pack article, its quiz and its castle wing work', async (p) => {
  await open(p, '/article/space/mars');
  await p.getByRole('heading', { name: 'Mars' }).first().waitFor({ timeout: 10_000 });
  await open(p, '/quiz/space/mars');
  await p.getByText('Question 1 of 5').first().waitFor({ timeout: 10_000 });
  await open(p, '/castle/wildlife');
  await p.getByText(/Room 1 of 12/).first().waitFor({ timeout: 10_000 });
});

await step('The stamp book has a page for each continent', async (p) => {
  await open(p, '/stamps');
  await p.getByRole('status').filter({ hasText: 'of 197 countries' }).waitFor({ timeout: 10_000 });
  await open(p, '/stamps/asia');
  await p.getByRole('status').filter({ hasText: 'in the world' }).waitFor({ timeout: 10_000 });
});

await step('A guided tour turns the globe and opens the stop article', async (p) => {
  await open(p, '/tours/rivers?stop=2');
  await p.getByRole('status').filter({ hasText: 'Stop 2 of 8' }).waitFor({ timeout: 15_000 });
  await p.locator('svg.globe').waitFor({ timeout: 10_000 });
  await p.getByRole('link', { name: 'Open the article' }).click();
  await p.getByRole('navigation', { name: 'Tour' }).waitFor({ timeout: 10_000 });
});

await step('The timeline filters by continent', async (p) => {
  await open(p, '/timeline');
  await p.getByRole('button', { name: 'Oceania' }).click();
  await p.getByText(/in Oceania\./).waitFor({ timeout: 10_000 });
});

if (wikiRead) {
  await step('The Wikipedia article read online opens offline', async (p) => {
    await open(p, '/article/wiki/Okapi');
    await p.getByRole('heading', { name: 'Okapi' }).first().waitFor({ timeout: 10_000 });
  });
}

await step('Pictures seen online show offline, and the large view says honestly what is missing', async (p) => {
  await open(p, '/article/ancient/colosseum');
  await p.getByRole('heading', { name: 'More pictures' }).waitFor({ timeout: 10_000 });
  const shown = await p.evaluate(() => [...document.querySelectorAll('.gallery__thumb img')].filter((i) => (i as HTMLImageElement).naturalWidth > 0).length);
  if (shown === 0) throw new Error('no saved picture shows offline');
  await p.locator('.gallery__thumb').first().click();
  await p.getByRole('dialog').waitFor({ timeout: 10_000 });
  await p.getByText(/^By /).waitFor({ timeout: 10_000 });
  await p.getByText('The bigger picture needs a connection.', { exact: false }).waitFor({ timeout: 15_000 });
});

await step('The Pictures screen opens offline and filters', async (p) => {
  await open(p, '/media');
  await p.getByRole('status').filter({ hasText: /Showing \d+ of \d+ pictures/ }).waitFor({ timeout: 10_000 });
  await p.getByLabel('Search the pictures').fill('colosseum');
  await p.getByRole('status').filter({ hasText: /of \d+ pictures/ }).waitFor({ timeout: 10_000 });
});

await step('A picture question plays in the Castle offline', async (p) => {
  await open(p, '/quiz/pictures/ancient');
  await p.getByRole('radio').first().waitFor({ timeout: 10_000 });
  await p.locator('.question__image').waitFor({ timeout: 10_000 });
  await p.getByText(/is this a picture of\?/).first().waitFor({ timeout: 10_000 });
});

await browser.close();
server.close();

console.log(results.join('\n'));
if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s) offline:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nOffline check passed: every pack feature works in airplane mode.');
