/**
 * Takes full-page screenshots of app screens at laptop (1440 px) and phone
 * (390 px) widths into docs/screenshots/, and reports any horizontal
 * overflow and console errors.
 *
 * Usage: npx tsx scripts/screenshot.ts [baseUrl] [path ...]
 *   e.g. npx tsx scripts/screenshot.ts http://127.0.0.1:5173 / /atlas
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const [base = 'http://127.0.0.1:5173', ...paths] = process.argv.slice(2);
const targets = paths.length > 0 ? paths : ['/'];
mkdirSync('docs/screenshots', { recursive: true });

const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  // Seed the reference progress once per browser context.
  await page.goto(`${base}/?demo=reference`, { waitUntil: 'networkidle' });
  for (const path of targets) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Scroll through once so lazy images load before the full-page shot.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    const name = (path === '/' ? 'home' : path.slice(1).replace(/[/?=&]+/g, '-')) || 'home';
    const file = `docs/screenshots/${name}-${width}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${file} overflow=${overflow}px`);
  }
  if (errors.length > 0) {
    console.log(`console errors at ${width}px:\n  ${errors.join('\n  ')}`);
  }
  await page.close();
}
await browser.close();
