/**
 * Measures the Atlas in a real browser (21-review-2 Req 14): at 1440 px the
 * globe must be at least 45% of the viewport width and the largest thing on
 * the screen; at 390 px nothing may overflow sideways.
 *
 *   npx tsx scripts/check-atlas-layout.ts [baseUrl]
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch();
let failed = false;
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${base}/atlas`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForSelector('svg.globe', { timeout: 15_000 });
  const m = await page.evaluate(() => {
    const globe = document.querySelector('svg.globe')?.getBoundingClientRect();
    const card = document.querySelector('.atlas__card-slot')?.getBoundingClientRect();
    const picker = document.querySelector('.atlas__picker')?.getBoundingClientRect();
    return {
      gap: card && picker ? card.top - picker.bottom : 0,
      globeW: globe?.width ?? 0,
      globeArea: (globe?.width ?? 0) * (globe?.height ?? 0),
      cardArea: (card?.width ?? 0) * (card?.height ?? 0),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  const ratio = m.globeW / width;
  console.log(`${width}px: globe ${Math.round(m.globeW)}px (${(ratio * 100).toFixed(0)}%), overflow ${m.overflow}px, ${Math.round(m.gap)}px between picker and facts note`);
  if (width === 1440 && m.gap > 60) failed = true;
  if (m.overflow > 0) failed = true;
  if (width === 1440 && (ratio < 0.45 || m.globeArea <= m.cardArea)) failed = true;
  await page.close();
}
await browser.close();
if (failed) {
  console.error('atlas layout check failed');
  process.exit(1);
}
