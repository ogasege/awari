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
await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;

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
await page.getByRole('status').filter({ hasText: 'Works offline' }).waitFor({ timeout: 90_000 });
console.log('Saved. Going offline (airplane mode).');
await context.setOffline(true);

// 2. Every pack feature, with the network gone.
await step('Home opens and the badge says offline', async (p) => {
  await open(p, '/');
  await p.getByRole('status').filter({ hasText: 'Offline, still working' }).waitFor({ timeout: 10_000 });
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
  await p.getByText(/Showing 123 events\./).waitFor({ timeout: 10_000 });
});

await step('Stamp book opens', async (p) => {
  await open(p, '/stamps');
  await p.getByRole('heading', { name: 'Africa' }).waitFor({ timeout: 10_000 });
});

await step('Search finds an article', async (p) => {
  await open(p, '/search?q=egypt');
  await p.getByRole('link', { name: 'Egypt' }).first().waitFor({ timeout: 10_000 });
});

await step('A route never visited opens (navigation fallback)', async (p) => {
  await open(p, '/credits');
  await p.getByRole('heading', { name: /open knowledge/i }).first().waitFor({ timeout: 10_000 });
});

await browser.close();
server.close();

console.log(results.join('\n'));
if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s) offline:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nOffline check passed: every pack feature works in airplane mode.');
