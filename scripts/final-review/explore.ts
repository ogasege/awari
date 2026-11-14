/** Walks a quiz and a picture viewer on the live site, printing the controls at each step, to plan the journeys. */
import { chromium, type Page } from 'playwright';
const base = process.argv[2] ?? 'https://d3txwsv4mn6ye9.cloudfront.net';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const list = async (page: Page, sel = 'main a, main button, main input, [role=dialog] button, [role=dialog] a'): Promise<string> =>
  (await page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => `${e.tagName.toLowerCase()}${e.getAttribute('type') ? `(${e.getAttribute('type')})` : ''} "${(e.getAttribute('aria-label') ?? (e as HTMLElement).innerText ?? '').trim().replace(/\s+/g, ' ').slice(0, 36)}"`).join(' | '), sel)).slice(0, 700);
await p.goto(`${base}/quiz/countries/nigeria`);
await p.waitForTimeout(1200);
for (let i = 0; i < 3; i++) {
  console.log(`\nQ${i}:`, await list(p));
  await p.getByRole('button', { name: 'Give me a nudge' }).click().catch(() => undefined);
  await p.locator('input[type=radio]').first().check({ force: true }).catch(() => undefined);
  await p.getByRole('button', { name: 'Check my answer' }).click().catch(() => undefined);
  await p.waitForTimeout(300);
  console.log(`after check ${i}:`, await list(p));
  const next = p.getByRole('button', { name: /next|finish|see/i }).first();
  if (await next.count()) await next.click(); else break;
  await p.waitForTimeout(300);
}
await p.goto(`${base}/media`);
await p.waitForTimeout(1500);
await p.locator('.tile').first().click();
await p.waitForTimeout(600);
console.log('\nviewer:', await list(p));
await p.goto(`${base}/castle/countries`);
await p.waitForTimeout(1200);
console.log('\nwing:', await list(p));
await p.goto(`${base}/`);
await p.waitForTimeout(1500);
console.log('\nhome buttons:', await list(p, 'main button'));
await p.goto(`${base}/tours`);
await p.getByRole('link', { name: /Start the tour/ }).first().click();
await p.waitForTimeout(1200);
console.log('\ntour:', await list(p, 'main a, main button, nav button, nav a'));
await b.close();
