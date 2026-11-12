/**
 * Opens every stop of every tour in a real browser at 1440 and 390 px and
 * checks the globe is painted from the design tokens (not the SVG default
 * black), nothing overflows sideways, and the stop article opens.
 *
 * Usage: npx tsx scripts/check-tours.ts [baseUrl]   (the dev or preview server must be running)
 */
import { chromium } from 'playwright';
import { TOURS } from '../src/features/tours/tours.ts';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const problems: string[] = [];
let opened = 0;

const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const tour of TOURS) {
    for (let i = 0; i < tour.stops.length; i++) {
      const where = `${tour.id} stop ${i + 1} @${width}`;
      await page.goto(`${base}/tours/${tour.id}?stop=${i + 1}`, { waitUntil: 'networkidle' });
      const globe = page.locator('.globe__ocean').first();
      try {
        await globe.waitFor({ timeout: 10_000 });
      } catch {
        problems.push(`${where}: no globe drawn`);
        continue;
      }
      const paint = await page.evaluate(
        `({
          sea: getComputedStyle(document.querySelector('.globe__ocean')).fill,
          land: document.querySelector('.globe__land') ? getComputedStyle(document.querySelector('.globe__land')).fill : 'missing',
        })`,
      ) as { sea: string; land: string };
      // rgb(0, 0, 0) is the SVG default: the stylesheet did not apply.
      if (paint.sea === 'rgb(0, 0, 0)') problems.push(`${where}: sea is black`);
      if (paint.land === 'rgb(0, 0, 0)') problems.push(`${where}: land is black`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) problems.push(`${where}: ${overflow}px horizontal overflow`);
      const stopBar = await page.getByText(new RegExp(`Stop ${i + 1} of ${tour.stops.length}`)).count();
      if (stopBar === 0) problems.push(`${where}: no "Stop ${i + 1} of ${tour.stops.length}" label`);
      opened++;
    }
  }
  await page.close();
}
await browser.close();

console.log(`Opened ${opened} tour stops.`);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Every tour stop shows a painted globe, no overflow.');
