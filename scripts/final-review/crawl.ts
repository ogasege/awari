/**
 * `npx tsx scripts/final-review/crawl.ts <base-url> <label> [--offline]` (26-final-review tasks 2, 3 and 8).
 *
 * Phase A, routes: visits every fixed route, subject, article, a spread of quizzes, Castle wings and tours, plus every
 * in-app link found on the way, at 1440 and 390 px. For each it records page and console errors, failed requests,
 * broken images, horizontal overflow, blank screens, and (phone) controls under 44 px.
 * Phase B, controls: on key screens it activates every button and tab, one at a time, and records what happened.
 * With `--offline` it first saves the site, then goes offline, and any failed request or broken picture is a failure.
 *
 * Output: docs/final-review/crawl-<label>.json (raw) and crawl-<label>.md (totals). Nothing here claims a pass it did not run.
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { runJourneys, type Act } from './journeys.ts';

const base = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const label = process.argv[3] ?? 'run';
const offlineMode = process.argv.includes('--offline');
const journeysOnly = process.argv.includes('--journeys-only');
const routesOnly = process.argv.includes('--routes-only');
/** Live runs visit a defined sample (every country, a third of the other articles) and do not follow every link found. */
const noFollow = process.argv.includes('--no-follow');
/** Small controls on the phone layout, grouped by component (tag and first class). */
const smallByComponent = new Map<string, number>();
let placeholderTotal = 0;
let screensWithPlaceholders = 0;
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

interface Visit {
  viewport: string;
  route: string;
  ok: boolean;
  problems: string[];
  smallTargets: number;
  links: number;
}
interface Activation {
  type?: string;
  viewport: string;
  screen: string;
  control: string;
  ok: boolean;
  note: string;
}

const packs = readdirSync('public/packs').filter((d) => !d.includes('.') && !['img', 'quizzes', 'atlas', 'dictionary'].includes(d));
const articles: string[] = [];
for (const p of packs) for (const f of readdirSync(`public/packs/${p}`)) if (f.endsWith('.json') && f !== 'index.json' && f !== 'facts.json') articles.push(`/article/${p}/${f.replace(/\.json$/, '')}`);
const quizzes = articles.filter((_, i) => i % 4 === 0).map((a) => a.replace('/article/', '/quiz/'));
const subjects = ['ancient', 'arts', 'body', 'countries', 'earth', 'inventions', 'people', 'physics', 'science', 'space', 'wildlife'].map((s) => `/subject/${s}`);
const fixed = ['/', '/atlas', '/quizzes', '/castle', '/subjects', '/tours', '/timeline', '/stamps', '/search', '/search?q=nile', '/search?q=zzqxj', '/search?q=a', '/credits', '/media', '/no-such-page', '/article/wiki/Okapi'];
// Offline pass: the fixed screens, every subject, 60 articles spread over all subjects and a few quizzes.
const spread = articles.filter((_, i) => i % Math.max(1, Math.floor(articles.length / 60)) === 0).slice(0, 60);
const liveSample = articles.filter((a) => a.startsWith('/article/countries/') || articles.indexOf(a) % 3 === 0);
const seeds = noFollow && !offlineMode ? [...new Set([...fixed, ...subjects, ...liveSample, ...quizzes.slice(0, 40)])] : offlineMode ? [...new Set([...fixed.filter((f) => !f.includes('wiki')), ...subjects, ...spread, ...quizzes.slice(0, 12)])] : [...new Set([...fixed, ...subjects, ...articles, ...quizzes])];
// `index.json` and `facts.json` are data files, not articles; their routes are checked once as not-found.

const visits: Visit[] = [];
const activations: Activation[] = [];
const journeyActs: Act[] = [];

function attach(page: Page, problems: string[]): void {
  page.on('pageerror', (e) => problems.push(`page error: ${e.message.slice(0, 160)}`));
  page.on('console', (m) => {
    // Offline, the browser logs a console line for every request it could not make (an unsaved picture, the online Wikipedia search); the app handles each one, and what is checked instead is broken images, page errors and failed requests for anything else.
    if (m.type() === 'error' && !(offlineMode && /net::ERR_(FAILED|INTERNET_DISCONNECTED)/.test(m.text()))) problems.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on('requestfailed', (r) => {
    const u = new URL(r.url());
    // Offline, a library picture that was never saved fails by design; what matters is that a placeholder replaces it (checked as broken images and counted below).
    // A request the page itself cancelled by moving on (net::ERR_ABORTED) is not a failure.
    if (u.origin === new URL(base).origin && r.failure()?.errorText !== 'net::ERR_ABORTED' && !(offlineMode && u.pathname.startsWith('/media/img/'))) problems.push(`request failed: ${u.pathname}`);
  });
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (u.origin === new URL(base).origin && r.status() >= 400 && !u.pathname.startsWith('/api/')) problems.push(`HTTP ${r.status()}: ${u.pathname}`);
  });
}

async function inspect(page: Page, vp: string): Promise<{ problems: string[]; small: number; links: string[]; smallKeys: string[]; placeholders: number }> {
  await page.evaluate(() => document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'))).catch(() => undefined);
  await page.waitForFunction(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length >= 40, undefined, { timeout: 8000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  return page.evaluate((isPhone) => {
    const problems: string[] = [];
    const imgs = [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0 && !i.src.endsWith('.svg'));
    if (imgs.length) problems.push(`broken images: ${imgs.length} (${imgs[0]?.getAttribute('src')})`);
    if (document.documentElement.scrollWidth > window.innerWidth + 1) problems.push(`horizontal overflow: ${document.documentElement.scrollWidth} > ${window.innerWidth}`);
    const main = document.querySelector('main') ?? document.body;
    if ((main.textContent ?? '').trim().length < 40) problems.push('blank or near-empty screen');
    if (/\b(undefined|NaN|\[object Object\])\b/.test(main.textContent ?? '')) problems.push('developer text on screen (undefined, NaN or [object Object])');
    let small = 0;
    const smallKeys: string[] = [];
    if (isPhone) {
      for (const el of document.querySelectorAll('button, input, select, [role="tab"], summary, a.btn, nav a, header a, .stamp-sheet__link, .tl-note__link')) {
        // A radio button or checkbox is operated through its label, so the label's box is the target.
        const box = el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox') ? (el.closest('label') ?? el) : el;
        const r = (box as HTMLElement).getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && Math.min(r.width, r.height) < 44) {
          small += 1;
          smallKeys.push(`${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(' ')[0] ?? ''}`);
        }
      }
    }
    const links = [...document.querySelectorAll('a[href^="/"]')].map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? '');
    return { problems, small, links, smallKeys, placeholders: document.querySelectorAll('.pic-missing').length };
  }, vp === '390');
}

async function visit(ctx: BrowserContext, vp: (typeof VIEWPORTS)[number], route: string): Promise<string[]> {
  const page = await ctx.newPage();
  const problems: string[] = [];
  attach(page, problems);
  let links: string[] = [];
  let small = 0;
  try {
    await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 30_000 });
    const r = await inspect(page, vp.name);
    problems.push(...r.problems);
    small = r.small;
    placeholderTotal += r.placeholders;
    if (r.placeholders > 0) screensWithPlaceholders += 1;
    for (const k of r.smallKeys) smallByComponent.set(k, (smallByComponent.get(k) ?? 0) + 1);
    links = r.links;
  } catch (e) {
    problems.push(`navigation failed: ${(e as Error).message.split('\n')[0]}`);
  }
  const expectNotFound = route === '/no-such-page';
  const ok = expectNotFound ? !problems.some((p) => !p.startsWith('HTTP 404')) : problems.length === 0;
  visits.push({ viewport: vp.name, route, ok, problems: [...new Set(problems)].slice(0, 6), smallTargets: small, links: links.length });
  await page.close();
  return links;
}

const SKIP_CONTROL = /reset|clear|delete|erase|start over|remove/i;

async function activate(ctx: BrowserContext, vp: (typeof VIEWPORTS)[number], route: string): Promise<void> {
  const page = await ctx.newPage();
  const problems: string[] = [];
  attach(page, problems);
  await page.goto(`${base}${route}`, { waitUntil: 'load' }).catch(() => undefined);
  await page.waitForTimeout(400);
  const count = await page.locator('main button, main [role="tab"], header button, summary').count();
  for (let i = 0; i < Math.min(count, 60); i++) {
    const before = problems.length;
    const el = page.locator('main button, main [role="tab"], header button, summary').nth(i);
    const name = ((await el.getAttribute('aria-label').catch(() => null)) ?? (await el.innerText({ timeout: 1000 }).catch(() => ''))).trim().replace(/\s+/g, ' ').slice(0, 60);
    if (SKIP_CONTROL.test(name) || !(await el.isVisible().catch(() => false)) || !(await el.isEnabled().catch(() => false))) continue;
    let note = 'clicked';
    try {
      await el.click({ timeout: 3000 });
      await page.waitForTimeout(250);
      if (await page.getByRole('dialog').count()) {
        note = 'opened a dialog';
        await page.keyboard.press('Escape');
      }
    } catch (e) {
      note = `could not click: ${(e as Error).message.split('\n')[0]?.slice(0, 80)}`;
    }
    const blank = await page.evaluate(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length < 20);
    const ok = problems.length === before && !blank && !note.startsWith('could not');
    activations.push({ viewport: vp.name, screen: route, control: name || '(unnamed button)', ok, note: ok ? note : `${note}; ${problems.slice(before).join('; ')}${blank ? '; blank screen' : ''}`.slice(0, 200) });
    if (new URL(page.url()).pathname + new URL(page.url()).search !== route) await page.goto(`${base}${route}`, { waitUntil: 'load' }).catch(() => undefined);
  }
  await page.close();
}

const browser = await chromium.launch();
for (const vp of VIEWPORTS.filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, serviceWorkers: 'allow' });
  if (offlineMode) {
    const warm = await ctx.newPage();
    await warm.goto(base, { waitUntil: 'load' });
    await warm.getByText('Saved. Awari now works without a connection.').waitFor({ timeout: 600_000 });
    // The one-time notice sits over the bottom of the screen until dismissed; a visitor would dismiss it, so the crawl does too.
    await warm.getByRole('button', { name: 'Got it' }).click().catch(() => undefined);
    await warm.close();
    await ctx.setOffline(true);
  }
  const seen = new Set<string>();
  const queue = journeysOnly ? [] : [...seeds];
  while (queue.length) {
    const route = queue.shift() as string;
    if (seen.has(route)) continue;
    seen.add(route);
    const links = await visit(ctx, vp, route);
    if (!noFollow && seen.size < 1500) {
      for (const l of links) {
        const clean = l.split('#')[0] ?? '';
        if (clean && !seen.has(clean) && !clean.startsWith('/article/wiki/') && !clean.startsWith('/assets/') && !clean.startsWith('/media/img') && !queue.includes(clean)) queue.push(clean);
      }
    }
    if (seen.size % 50 === 0) console.log(`[${vp.name}] ${seen.size} screens, ${queue.length} queued`);
  }
  if (!journeysOnly && !offlineMode) for (const r of ['/', '/atlas', '/quizzes', '/castle', '/subjects', '/tours', '/timeline', '/stamps', '/search?q=nile', '/credits', '/media', '/article/countries/nigeria', '/quiz/countries/nigeria']) {
    await activate(ctx, vp, r);
  }
  if (!routesOnly) await runJourneys(ctx, base, vp.name, journeyActs, offlineMode);
  await ctx.close();
}
await browser.close();

mkdirSync('docs/final-review', { recursive: true });
const failedVisits = visits.filter((v) => !v.ok);
for (const a of activations) a.type = 'sweep of buttons';
const allActs: Activation[] = [...activations, ...journeyActs];
const failedAct = allActs.filter((a) => !a.ok);
const perType = new Map<string, { n: number; failed: number }>();
for (const a of allActs) {
  const t = perType.get(a.type ?? '?') ?? { n: 0, failed: 0 };
  t.n += 1;
  if (!a.ok) t.failed += 1;
  perType.set(a.type ?? '?', t);
}
writeFileSync(`docs/final-review/crawl-${label}.json`, `${JSON.stringify({ base, offlineMode, when: new Date().toISOString(), visits, activations: allActs, smallByComponent: Object.fromEntries(smallByComponent) }, null, 1)}\n`);
const smallByVp = visits.filter((v) => v.viewport === '390').reduce((n, v) => n + v.smallTargets, 0);
const md = [
  `# Crawl ${label}`,
  '',
  `Base: ${base}${offlineMode ? ' (offline after saving)' : ''}. Run: ${new Date().toISOString()}.`,
  '',
  `- Screens visited: ${visits.length} (${new Set(visits.map((v) => v.route)).size} distinct routes, both widths)`,
  `- Controls activated: ${allActs.length} (${activations.length} in the button sweep, ${journeyActs.length} in scripted journeys)`,
  `- Screen failures: ${failedVisits.length}; control failures: ${failedAct.length}`,
  `- Designed picture placeholders shown (pictures not saved yet): ${placeholderTotal} on ${screensWithPlaceholders} screens`,
  `- Controls under 44 px on the phone layout (not counted as failures, listed for review): ${smallByVp}`,
  '',
  '## Controls activated per screen type',
  '',
  '| Screen type | Activated | Failed |',
  '|---|---|---|',
  ...[...perType].sort().map(([t, v]) => `| ${t} | ${v.n} | ${v.failed} |`),
  '',
  '## Small controls on the phone layout, by component',
  '',
  ...[...smallByComponent].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, n]) => `- \`${k}\`: ${n}`),
  '',
  '## Failing screens (first 60)',
  ...failedVisits.slice(0, 60).map((v) => `- [${v.viewport}] \`${v.route}\`: ${v.problems.join(' | ')}`),
  '',
  '## Failing controls (first 80)',
  ...failedAct.slice(0, 80).map((a) => `- [${a.viewport}] (${a.type}) \`${a.screen}\` "${a.control}": ${a.note}`),
  '',
].join('\n');
writeFileSync(`docs/final-review/crawl-${label}.md`, md);
console.log(md.split('\n').slice(0, 40).join('\n'));
