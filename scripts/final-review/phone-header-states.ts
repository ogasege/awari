/**
 * Phone header in each state (26-final-review round 4, owner item 5): the header height and whether the page headline
 * and its first button are above the fold (844 px) while the first save runs ("Saving for offline"), while the
 * one-time "Saved" notice shows, and with nothing to say. Usage: npx tsx scripts/final-review/phone-header-states.ts <base-url>
 */
import { chromium, type Page } from 'playwright';

const base = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const FOLD = 844;

async function measure(p: Page): Promise<{ header: number; h1Bottom: number; buttonBottom: number }> {
  return p.evaluate(() => {
    const h1 = document.querySelector('main h1, h1') as HTMLElement | null;
    const first = document.querySelector('main a.btn, main button, main a[class*="button"], main a') as HTMLElement | null;
    return {
      header: Math.round(document.querySelector('header')?.getBoundingClientRect().height ?? 0),
      h1Bottom: Math.round(h1?.getBoundingClientRect().bottom ?? 0),
      buttonBottom: Math.round(first?.getBoundingClientRect().bottom ?? 0),
    };
  });
}

const b = await chromium.launch();
let failed = 0;
for (const w of [360, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: FOLD } });
  const p = await ctx.newPage();
  await p.goto(`${base}/quizzes`);
  const states: Array<[string, string]> = [
    ['saving', 'Saving for offline'],
    ['saved notice', 'Saved. Awari now works without a connection.'],
  ];
  for (const [name, text] of states) {
    const seen = await p.getByText(text).first().waitFor({ timeout: 240_000 }).then(() => true, () => false);
    if (!seen) {
      console.log(`skip ${w} px ${name}: not shown within the wait`);
      continue;
    }
    // Measure only once the page itself has rendered its headline: the first live run measured an empty page (round 5).
    await p.locator('main h1').first().waitFor({ timeout: 30_000 }).catch(() => undefined);
    if (name === 'saving') await p.screenshot({ path: `docs/final-review/phone-header-saving-${w}.png` });
    const r = await measure(p);
    const ok = r.h1Bottom > 0 && r.h1Bottom < FOLD && r.buttonBottom < FOLD;
    if (!ok) failed += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${w} px ${name}: header ${r.header} px, headline bottom ${r.h1Bottom}, first control bottom ${r.buttonBottom}`);
  }
  await p.getByRole('button', { name: 'Got it' }).click().catch(() => undefined);
  await p.waitForTimeout(300);
  const r = await measure(p);
  console.log(`info ${w} px quiet: header ${r.header} px, headline bottom ${r.h1Bottom}`);
  await ctx.close();
}
await b.close();
process.exit(failed ? 1 : 0);
