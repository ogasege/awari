/**
 * Phone header check (26-final-review N-4): at 320, 360, 390 and 430 px, after the first save, no navigation link is
 * clipped or off-screen, every link is at least 44 px tall, the page does not scroll sideways, and the header height
 * is printed. Usage: npx tsx scripts/final-review/phone-header.ts <base-url>
 */
import { chromium } from 'playwright';

const base = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const b = await chromium.launch();
let failed = 0;
for (const w of [320, 360, 390, 430]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/`);
  await p.getByText('Saved. Awari now works without a connection.').waitFor({ timeout: 180_000 }).catch(() => undefined);
  await p.goto(`${base}/quizzes`);
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const links = [...document.querySelectorAll('.site-header__nav a')] as HTMLElement[];
    return {
      header: Math.round(document.querySelector('header')?.getBoundingClientRect().height ?? 0),
      clipped: links.filter((a) => a.scrollWidth > a.clientWidth + 1 || a.getBoundingClientRect().right > window.innerWidth || a.getBoundingClientRect().left < 0).map((a) => a.textContent),
      minHeight: Math.round(Math.min(...links.map((a) => a.getBoundingClientRect().height))),
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  const ok = r.clipped.length === 0 && r.minHeight >= 44 && r.scrollWidth <= w;
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${w} px: header ${r.header} px, smallest link ${r.minHeight} px, page width ${r.scrollWidth}${r.clipped.length ? `, clipped: ${r.clipped.join(', ')}` : ''}`);
  await ctx.close();
}
await b.close();
process.exit(failed ? 1 : 0);
