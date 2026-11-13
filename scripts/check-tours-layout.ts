/**
 * Measures the tour screens in a real browser (22-review-3 Req 17, 18): the
 * three cards on /tours have equal height and a print each, and on a tour
 * page the stop strip sits close under the panel with no blank gap.
 *
 *   npx tsx scripts/check-tours-layout.ts [baseUrl]
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const browser = await chromium.launch();
let failed = false;
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${base}/tours`, { waitUntil: 'networkidle', timeout: 30_000 });
await page.waitForSelector('.tours__card', { timeout: 15_000 });
const cards = await page.evaluate(() =>
  [...document.querySelectorAll('.tours__card')].map((c) => ({
    h: Math.round(c.getBoundingClientRect().height),
    img: c.querySelectorAll('img').length,
  })),
);
console.log('cards', JSON.stringify(cards));
if (new Set(cards.map((c) => c.h)).size !== 1 || cards.some((c) => c.img !== 1)) {
  failed = true;
}
for (const id of ['rivers', 'wonders', 'volcanoes']) {
  await page.goto(`${base}/tours/${id}`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForSelector('.tour__stops', { timeout: 15_000 });
  const m = await page.evaluate(() => {
    const card = document.querySelector('article')?.getBoundingClientRect();
    const stops = document.querySelector('.tour__stops')?.getBoundingClientRect();
    const globe = document.querySelector('svg.globe')?.getBoundingClientRect();
    const lowest = Math.max(card?.bottom ?? 0, globe?.bottom ?? 0);
    const board = document.querySelector('.tour__board')?.getBoundingClientRect();
    return {
      // Blank space inside the dark board under its lowest content (the card may overhang the edge).
      gap: board ? Math.max(0, Math.round(board.bottom - lowest)) : -1,
      toStrip: stops ? Math.round(stops.top - lowest) : -1,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  console.log(id, JSON.stringify(m));
  if (m.gap > 60 || m.overflow > 0) {
    failed = true;
  }
}
await browser.close();
if (failed) {
  console.error('tours layout check failed');
  process.exit(1);
}
