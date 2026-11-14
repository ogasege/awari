/** Time until the app is usable on a slow 3G profile (400 kbps down, 400 ms), cold cache, on the live site. */
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const base = (process.argv[2] ?? 'https://d3txwsv4mn6ye9.cloudfront.net').replace(/\/$/, '');
const out: string[] = ['# Slow 3G (400 kbps, 400 ms round trip), cold cache, headless Chromium', '', `Base: ${base}. Run: ${new Date().toISOString()}.`, '', '| Page | Usable (main text visible) | Load event | Bytes transferred |', '|---|---|---|---|'];
const browser = await chromium.launch();
for (const [name, path, selector] of [['Home', '/', 'main h1, main h2'], ['An article', '/article/countries/nigeria', '.article__body p'], ['A quiz', '/quiz/countries/nigeria', 'input[type=radio]']] as const) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });
  let bytes = 0;
  cdp.on('Network.loadingFinished', (e: { encodedDataLength: number }) => (bytes += e.encodedDataLength));
  const t0 = Date.now();
  await page.goto(`${base}${path}`, { waitUntil: 'commit' });
  await page.locator(selector).first().waitFor({ timeout: 120_000 });
  const usable = (Date.now() - t0) / 1000;
  await page.waitForLoadState('load', { timeout: 120_000 });
  const load = (Date.now() - t0) / 1000;
  out.push(`| ${name} | ${usable.toFixed(1)} s | ${load.toFixed(1)} s | ${Math.round(bytes / 1024)} KB |`);
  await ctx.close();
}
await browser.close();
writeFileSync('docs/final-review/slow3g.md', `${out.join('\n')}\n`);
console.log(out.join('\n'));
