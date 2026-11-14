/**
 * `npx tsx scripts/final-review/a11y.ts <base-url> <label>`: axe on every screen type at both widths (zero serious or
 * critical issues is the bar), a keyboard walk of the main paths (every stop reachable, focus visible, every control
 * named), and 200% text zoom plus reduced motion on the main screens. Output: docs/final-review/a11y-<label>.json and .md.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright';

const base = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const label = process.argv[3] ?? 'run';
const axeSource = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const SCREENS: Array<[string, string]> = [
  ['Home', '/'],
  ['Search results', '/search?q=nile'],
  ['Search, no hits', '/search?q=zzqxjvk'],
  ['Country article', '/article/countries/nigeria'],
  ['Subject article', '/article/wildlife/lion'],
  ['Quiz', '/quiz/countries/nigeria'],
  ['Quizzes', '/quizzes'],
  ['Castle', '/castle'],
  ['Atlas', '/atlas'],
  ['Atlas with a country', '/atlas?c=nigeria'],
  ['Pictures', '/media'],
  ['Timeline', '/timeline'],
  ['Tours', '/tours'],
  ['Subjects', '/subjects'],
  ['Subject', '/subject/wildlife'],
  ['Stamps', '/stamps'],
  ['Credits', '/credits'],
  ['Not found', '/no-such-page'],
];

interface Row {
  viewport: string;
  screen: string;
  state: string;
  serious: Array<{ id: string; impact: string; help: string; nodes: number; example: string }>;
}
const rows: Row[] = [];
const keyboard: Array<{ screen: string; stops: number; unnamed: string[]; noFocusRing: string[] }> = [];
const extras: string[] = [];

async function axe(page: Page, viewport: string, screen: string, state: string): Promise<void> {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => {
    const r = await (window as unknown as { axe: { run: (c: Document, o: unknown) => Promise<{ violations: Array<{ id: string; impact: string; help: string; nodes: Array<{ html: string }> }> }> } }).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, example: v.nodes[0]?.html.slice(0, 140) ?? '' }));
  });
  rows.push({ viewport, screen, state, serious: result.filter((v) => v.impact === 'serious' || v.impact === 'critical') });
  const minor = result.filter((v) => v.impact !== 'serious' && v.impact !== 'critical');
  if (minor.length) extras.push(`[${viewport}] ${screen}/${state}: ${minor.map((m) => `${m.id}(${m.impact},${m.nodes})`).join(', ')}`);
}

const browser = await chromium.launch();
for (const [vpName, width, height] of [['1440', 1440, 900], ['390', 390, 844]] as const) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const open = async (path: string): Promise<void> => {
    await page.goto(`${base}${path}`, { waitUntil: 'load' });
    await page.waitForFunction(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length > 30, undefined, { timeout: 8000 }).catch(() => undefined);
    await page.waitForTimeout(500);
  };
  for (const [name, path] of SCREENS) {
    await open(path);
    await axe(page, vpName, name, 'loaded');
  }
  // States: large picture view, word card, a wrong answer with a hint, the make-a-quiz form.
  await open('/media');
  await page.locator('.tile').first().click();
  await page.waitForTimeout(400);
  await axe(page, vpName, 'Pictures', 'large view open');
  await open('/quiz/countries/nigeria');
  await page.getByRole('button', { name: 'Give me a nudge' }).click().catch(() => undefined);
  await page.locator('input[type=radio]').first().check({ force: true }).catch(() => undefined);
  await page.getByRole('button', { name: 'Check my answer' }).click().catch(() => undefined);
  await axe(page, vpName, 'Quiz', 'hint and an answer checked');

  // Keyboard: tab through each main screen; every stop must have a name and a visible focus indicator.
  for (const [name, path] of [['Home', '/'], ['Search results', '/search?q=nile'], ['Country article', '/article/countries/nigeria'], ['Quiz', '/quiz/countries/nigeria'], ['Castle', '/castle'], ['Atlas', '/atlas'], ['Pictures', '/media']] as const) {
    
    await open(path);
    const unnamed = new Set<string>();
    const noRing = new Set<string>();
    const seen = new Set<string>();
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null;
        if (!e || e === document.body) return null;
        const cs = getComputedStyle(e);
        const name = (e.getAttribute('aria-label') ?? e.innerText ?? e.getAttribute('title') ?? (e as HTMLInputElement).placeholder ?? '').trim() || e.getAttribute('aria-labelledby') || (e.id && document.querySelector(`label[for="${e.id}"]`)?.textContent) || (e.closest('label')?.textContent ?? '');
        const host = e.closest('.site-header__search') as HTMLElement | null;
        const hs = host ? getComputedStyle(host) : null;
        const hostRing = !!hs && ((hs.outlineStyle !== 'none' && parseFloat(hs.outlineWidth) > 0) || (hs.boxShadow !== 'none' && hs.boxShadow !== ''));
        const ring = hostRing || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && cs.boxShadow !== '');
        return { key: `${e.tagName}.${e.className}.${(e.getAttribute('href') ?? e.getAttribute('aria-label') ?? e.innerText ?? '').slice(0, 30)}`, name: String(name), ring, tag: e.tagName.toLowerCase(), cls: e.className?.toString().split(' ')[0] ?? '' };
      });
      if (!info) continue;
      seen.add(info.key);
      if (!info.name.trim()) unnamed.add(`${info.tag}.${info.cls}`);
      if (!info.ring) noRing.add(`${info.tag}.${info.cls}`);
    }
    keyboard.push({ screen: `${name} (${vpName})`, stops: seen.size, unnamed: [...unnamed], noFocusRing: [...noRing] });
  }
  // 200% text and reduced motion on the main screens: no overflow, nothing hidden.
  for (const [name, path] of [['Home', '/'], ['Country article', '/article/countries/nigeria'], ['Quiz', '/quiz/countries/nigeria'], ['Pictures', '/media'], ['Credits', '/credits']] as const) {
    await open(path);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.waitForTimeout(300);
    const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    extras.push(`[${vpName}] 200% text on ${name}: ${w.sw > w.iw + 1 ? `OVERFLOW ${w.sw} > ${w.iw}` : 'no horizontal overflow'}`);
  }
  await ctx.close();
}
// Reduced motion and dark scheme.
for (const [what, opts] of [['reduced motion', { reducedMotion: 'reduce' as const }], ['dark colour scheme', { colorScheme: 'dark' as const }], ['light colour scheme', { colorScheme: 'light' as const }]] as const) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const errs: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  for (const p of ['/', '/atlas', '/castle', '/media', '/article/countries/nigeria']) {
    await page.goto(`${base}${p}`, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, anim: document.getAnimations().filter((a) => a.playState === 'running').length, bg: getComputedStyle(document.body).backgroundColor, fg: getComputedStyle(document.body).color }));
    extras.push(`${what} on ${p}: overflow ${w.sw > w.iw + 1 ? 'YES' : 'no'}, running animations ${w.anim}, body ${w.bg} on ${w.fg}${errs.length ? `, ERRORS ${errs.join('|')}` : ''}`);
  }
  await ctx.close();
}
await browser.close();

const bad = rows.filter((r) => r.serious.length);
writeFileSync(`docs/final-review/a11y-${label}.json`, `${JSON.stringify({ base, when: new Date().toISOString(), rows, keyboard, extras }, null, 1)}\n`);
const md = [
  `# Accessibility ${label}`,
  '',
  `Base: ${base}. axe-core ${JSON.parse(readFileSync('node_modules/axe-core/package.json', 'utf8')).version}, rules wcag2a, wcag2aa, wcag21a, wcag21aa and best-practice.`,
  '',
  `- Screens and states checked: ${rows.length} (both widths)`,
  `- Serious or critical violations: ${bad.reduce((n, r) => n + r.serious.length, 0)} on ${bad.length} screens`,
  '',
  '## Serious and critical',
  ...(bad.length ? bad.flatMap((r) => r.serious.map((v) => `- [${r.viewport}] ${r.screen} / ${r.state}: **${v.id}** (${v.impact}) ${v.help}; ${v.nodes} nodes; e.g. \`${v.example.replace(/`/g, "'")}\``)) : ['- none']),
  '',
  '## Keyboard walks (Tab x70 per screen)',
  '',
  '| Screen | Distinct stops | Unnamed | Without a focus indicator |',
  '|---|---|---|---|',
  ...keyboard.map((k) => `| ${k.screen} | ${k.stops} | ${k.unnamed.join(', ') || 'none'} | ${k.noFocusRing.join(', ') || 'none'} |`),
  '',
  '## Moderate and minor axe findings, text zoom, motion, colour scheme',
  ...extras.map((e) => `- ${e}`),
  '',
].join('\n');
writeFileSync(`docs/final-review/a11y-${label}.md`, md);
console.log(md.split('\n').slice(0, 60).join('\n'));
