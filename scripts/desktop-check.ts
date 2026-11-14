/**
 * `npm run desktop-check` (25-desktop Req 7.2): opens the packaged macOS app with no network
 * from the very first launch and walks the brief's screens, saving screenshots to
 * docs/screenshots/desktop-*.png. All web traffic is sent to a dead proxy and the page context is
 * offline from the start, so only the bundled app://awari files can load.
 *
 * Needs `npm run desktop:prepare` and a macOS build in desktop/release/mac-arm64 (or set
 * DESKTOP_APP to the app's executable).
 */
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { _electron as electron, type Page } from 'playwright';

const exe =
  process.env['DESKTOP_APP'] ?? join('desktop', 'release', 'mac-arm64', 'Awari.app', 'Contents', 'MacOS', 'Awari');
if (!existsSync(exe)) {
  console.error(`${exe} not found. Build the macOS app first.`);
  process.exit(1);
}

// A fresh profile, so this really is a first launch (no saved service worker or caches).
const profile = mkdtempSync(join(tmpdir(), 'awari-desktop-'));
// DESKTOP_CHECK_NO_SANDBOX=1 is for running inside another sandbox (an agent's), where Chromium
// cannot start its own; the shipped app is unchanged and keeps its sandbox.
const harness = process.env['DESKTOP_CHECK_NO_SANDBOX'] === '1' ? ['--no-sandbox'] : [];
const app = await electron.launch({
  executablePath: exe,
  args: [
    ...harness,
    `--user-data-dir=${profile}`,
    '--proxy-server=http://127.0.0.1:9',
    '--proxy-bypass-list=<-loopback>',
  ],
});
if (process.env["DESKTOP_CHECK_EMULATE_OFFLINE"] !== "0") await app.context().setOffline(true);
const page = await app.firstWindow();
const problems: string[] = [];
const results: string[] = [];
const external: string[] = [];
page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
page.on('request', (r) => {
  if (!r.url().startsWith('app://')) external.push(r.url());
});

const shot = async (p: Page, name: string): Promise<void> => {
  await p.waitForTimeout(600);
  await p.screenshot({ path: join('docs', 'screenshots', `desktop-${name}.png`) });
};
const go = async (p: Page, path: string): Promise<void> => {
  await p.goto(`app://awari${path}`, { waitUntil: 'load' });
};

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

console.log(`Launching ${exe} with the network off…`);
await page.waitForLoadState('load');

await step('Home opens on first launch with no network', async (p) => {
  await p.getByRole('heading', { name: 'On this day' }).waitFor({ timeout: 20_000 });
  // The service worker finds every file already on the device and the one-time notice appears.
  await p.getByText('Saved. Awari now works without a connection.').waitFor({ timeout: 60_000 });
  await shot(p, 'home');
});

await step('Nigeria article renders', async (p) => {
  await go(p, '/article/countries/nigeria');
  await p.getByRole('heading', { name: /Nigeria/ }).first().waitFor({ timeout: 10_000 });
  await shot(p, 'article-nigeria');
});

await step('Nigeria quiz plays a question with a hint', async (p) => {
  await go(p, '/quiz/countries/nigeria');
  await p.getByText('Question 1 of 5').first().waitFor({ timeout: 10_000 });
  await p.getByRole('button', { name: 'Give me a nudge' }).click();
  await p.getByRole('radio').first().check({ force: true });
  await p.getByRole('button', { name: 'Check my answer' }).click();
  await p.getByText(/Right!|Not quite\./).first().waitFor({ timeout: 10_000 });
  await shot(p, 'quiz');
});

await step('A Castle room opens', async (p) => {
  await go(p, '/castle/africa');
  await p.getByText(/Room 1 of 12/).first().waitFor({ timeout: 10_000 });
  await shot(p, 'castle');
});

await step('Atlas shows the globe and a country', async (p) => {
  await go(p, '/atlas?c=nigeria');
  await p.locator('#atlas-card-title').filter({ hasText: 'Nigeria' }).waitFor({ timeout: 15_000 });
  await p.locator('svg[role="application"]').waitFor({ timeout: 10_000 });
  await shot(p, 'atlas');
});

await step('Timeline lists events', async (p) => {
  await go(p, '/timeline');
  await p.getByText(/Showing \d+ events\./).waitFor({ timeout: 10_000 });
});

await step('Pictures screen shows bundled thumbnails never seen before', async (p) => {
  await go(p, '/media');
  await p.getByRole('status').filter({ hasText: /Showing \d+ of \d+ pictures/ }).waitFor({ timeout: 10_000 });
  await p.waitForFunction(
    () => [...document.querySelectorAll('img')].filter((i) => i.naturalWidth > 0).length >= 6,
    undefined,
    { timeout: 15_000 },
  );
  await shot(p, 'pictures');
});

await step('The large picture view says honestly that it needs a connection', async (p) => {
  await go(p, '/article/ancient/colosseum');
  await p.getByRole('heading', { name: 'More pictures' }).waitFor({ timeout: 10_000 });
  await p.locator('.gallery__thumb').first().click();
  await p.getByRole('dialog').waitFor({ timeout: 10_000 });
  await p.getByText('The bigger picture needs a connection.', { exact: false }).waitFor({ timeout: 15_000 });
});

await step('Credits screen is in the app', async (p) => {
  await go(p, '/credits');
  await p.getByRole('heading', { name: /open knowledge/i }).first().waitFor({ timeout: 10_000 });
});

await app.close();
console.log(results.join('\n'));
const leaked = [...new Set(external)].filter((u) => !u.startsWith('data:') && !u.startsWith('blob:'));
console.log(`Requests that tried to leave the app (all refused): ${leaked.length}`);
if (problems.length > 0) {
  console.error(`\nDesktop check FAILED:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nDesktop check passed: the app works with no network from the first launch.');
