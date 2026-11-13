/**
 * Measures the Timeline in a real browser (21-review-2 Req 17-19): the page
 * must be under 12,000 px tall at 1440 px, one century is shown, and births
 * are fewer than half of the cards.
 *
 *   npx tsx scripts/check-timeline-layout.ts [baseUrl]
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch();
let failed = false;
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${base}/timeline`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForSelector('ol.timeline__list li', { timeout: 15_000 });
  const m = await page.evaluate(() => {
    const items = [...document.querySelectorAll('ol.timeline__list li')];
    return {
      height: document.documentElement.scrollHeight,
      cards: items.length,
      births: items.filter((li) => /was born/.test(li.textContent ?? '')).length,
      title: document.querySelector('.timeline__century-title')?.textContent ?? '',
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  console.log(`${width}px: ${m.title}, ${m.cards} cards, ${m.births} births, ${m.height}px tall, overflow ${m.overflow}px`);
  if (m.overflow > 0) failed = true;
  if (width === 1440 && (m.height >= 12_000 || m.births * 2 >= m.cards)) failed = true;
  await page.close();
}
await browser.close();
if (failed) {
  console.error('timeline layout check failed');
  process.exit(1);
}
