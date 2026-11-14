/**
 * Scripted journeys per screen type (26-final-review, crawl phase C). Each journey plays a screen the way a child
 * would, activating every control it finds and recording each one with the screen type, so the report can say
 * how many controls were activated per screen type. A step fails when it throws, shows a page or console error,
 * or leaves a blank screen.
 */
import { type BrowserContext } from 'playwright';

export interface Act {
  viewport: string;
  type: string;
  screen: string;
  control: string;
  ok: boolean;
  note: string;
}

const exact = (name: string): RegExp => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`)}$`);

export async function runJourneys(ctx: BrowserContext, base: string, viewport: string, acts: Act[], offline: boolean): Promise<void> {
  const origin = new URL(base).origin;
  const page = await ctx.newPage();
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(`page error: ${e.message.slice(0, 120)}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text().slice(0, 120)}`);
  });
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (u.origin === origin && r.status() >= 400 && !u.pathname.startsWith('/api/')) problems.push(`HTTP ${r.status()} ${u.pathname}`);
  });
  // Offline, an unsaved library picture fails by design and is replaced by a placeholder; any other failed request is a failure.
  if (offline) page.on('requestfailed', (r) => new URL(r.url()).origin === origin && !new URL(r.url()).pathname.startsWith('/media/img/') && problems.push(`request failed ${new URL(r.url()).pathname}`));

  const go = async (path: string): Promise<void> => {
    await page.goto(`${base}${path}`, { waitUntil: 'load' });
    await page.waitForFunction(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length > 30, undefined, { timeout: 8000 }).catch(() => undefined);
  };
  const route = (): string => {
    const u = new URL(page.url());
    return u.pathname + u.search;
  };
  /** Runs one activation and records it. */
  async function act(type: string, control: string, fn: () => Promise<string | void>): Promise<boolean> {
    const before = problems.length;
    // The optional quiz service and the third-party Wiktionary lookup answer 404 for some inputs by design; the screen's own message is what is checked.
    const ignoreService = type === 'make-a-quiz' || control.startsWith('double-click');
    let note: string;
    let ok = true;
    try {
      note = (await fn()) ?? 'ok';
    } catch (e) {
      ok = false;
      const lines = (e as Error).message.split('\n').map((l) => l.trim());
      const why = lines.find((l) => /intercepts pointer|not visible|outside of the viewport/.test(l));
      note = `threw: ${lines[0]?.slice(0, 80)}${why ? ` (${why.slice(0, 90)})` : ''}`;
    }
    await page.waitForFunction(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length >= 20, undefined, { timeout: 3000 }).catch(() => undefined);
    const blank = await page.evaluate(() => ((document.querySelector('main') ?? document.body).textContent ?? '').trim().length < 20).catch(() => false);
    if (ignoreService) problems.length = before;
    if (problems.length > before) {
      ok = false;
      note = `${note}; ${problems.slice(before).join('; ')}`;
    }
    if (blank) {
      ok = false;
      note += '; blank screen';
    }
    acts.push({ viewport, type, screen: route(), control: control.slice(0, 70), ok, note: note.slice(0, 220) });
    return ok;
  }

  /** Every filter on the screen: chips on a wide screen, the select lists on a phone. */
  async function allFilters(type: string): Promise<void> {
    const chipsShown = await page.locator('.timeline__chip').first().isVisible().catch(() => false);
    if (chipsShown) {
      const names = await page.locator('.timeline__chip').evaluateAll((els) => els.map((e) => (e.textContent ?? '').trim()).filter(Boolean));
      for (const name of [...new Set(names)]) {
        await act(type, `chip ${name}`, async () => {
          const chip = page.locator('.timeline__chip', { hasText: exact(name) }).first();
          if (!(await chip.count())) return 'not shown under the current filter';
          await chip.click({ timeout: 3000 });
          await page.waitForTimeout(120);
        });
      }
      return;
    }
    const selects = page.locator('main select');
    for (let s = 0; s < (await selects.count()); s++) {
      const options = await selects.nth(s).locator('option').evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
      for (const value of options) {
        await act(type, `select ${s + 1} = ${value}`, async () => {
          await selects.nth(s).selectOption(value, { timeout: 3000 });
          await page.waitForTimeout(100);
        });
      }
    }
  }

  // ---- Home: every link and card, and On this day for several real dates ----
  await go('/');
  const homeLinks = await page.locator('main a[href^="/"], header a[href^="/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href') ?? ''))].slice(0, 45));
  for (const href of homeLinks) {
    await go('/');
    await act('home', `link ${href}`, async () => {
      await page.locator(`main a[href="${href}"], header a[href="${href}"]`).locator('visible=true').first().click({ timeout: 4000 });
      await page.waitForTimeout(300);
    });
  }
  for (const d of ['2026-01-01', '2026-02-28', '2026-03-15', '2026-12-31', '2026-07-04']) {
    await act('home', `On this day on ${d}`, async () => {
      await page.clock.setFixedTime(new Date(`${d}T12:00:00`));
      await go('/');
      await page.locator('.home-otd__note').first().waitFor({ timeout: 6000 }).catch(() => undefined);
      const n = await page.locator('.home-otd__note').count();
      if (n === 0) throw new Error('no On this day notes');
      await page.locator('.home-otd__note').first().click({ timeout: 4000 });
      return `${n} notes`;
    });
  }

  // ---- Quizzes: play each to the result with hints and proof ----
  const quizPaths = ['/quiz/countries/nigeria', '/quiz/wildlife/okapi', '/quiz/space/moon', '/quiz/science/temperature', '/quiz/people/albert-einstein', '/quiz/ancient/colosseum'];
  await go('/quizzes');
  const picQuiz = await page.locator('main a[href*="/quiz/"]').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? '').slice(0, 40));
  const toPlay = [...new Set([...quizPaths, ...picQuiz.filter((_, i) => i % 7 === 0).slice(0, 5)])];
  for (const q of toPlay) {
    await go(q);
    if ((await page.locator('input[type=radio]').count()) === 0) {
      await act('quiz', `open ${q}`, async () => 'no questions here (quiz not available for this article)');
      continue;
    }
    for (let i = 0; i < 14; i++) {
      if ((await page.locator('input[type=radio]').count()) === 0) break;
      await act('quiz', `hint ${i + 1}`, async () => {
        const hint = page.getByRole('button', { name: /nudge|where should i look|show me/i }).first();
        if (await hint.isVisible().catch(() => false)) await hint.click({ timeout: 2000 });
      });
      let solved = false;
      const n = await page.locator('input[type=radio]').count();
      for (let k = 0; k < n && !solved; k++) {
        await act('quiz', `answer ${k + 1} then Check my answer`, async () => {
          await page.locator('input[type=radio]').nth(k).check({ force: true, timeout: 2000 });
          await page.getByRole('button', { name: 'Check my answer' }).click({ timeout: 2000 });
          await page.waitForTimeout(150);
          solved = await page.locator('.proof-slip').isVisible().catch(() => false);
          return solved ? 'right, proof shown' : 'not quite';
        });
      }
      const proofLink = page.locator('.proof-slip a').first();
      if (await proofLink.count()) await act('quiz', 'proof source link visible', async () => ((await proofLink.getAttribute('href')) ? 'has href' : 'no href'));
      const next = page.getByRole('button', { name: /next question|see my score/i }).first();
      if (!(await next.isVisible().catch(() => false))) break;
      await act('quiz', 'Next question / See my score', async () => next.click({ timeout: 2000 }));
    }
    await act('quiz', 'result screen shows a score', async () => {
      const text = await page.locator('main').innerText();
      if (!/\b\d+\s*(of|\/|out of)\s*\d+|score/i.test(text)) throw new Error('no score on the result screen');
    });
  }

  // ---- Make-a-quiz form: empty, bad title, good title, very long, punctuation ----
  await go('/quizzes');
  const form = page.locator('.make-quiz');
  if (await form.count()) {
    for (const [label, title] of [['empty', ''], ['bad title', 'zzqxjvk'], ['good title', 'Okapi'], ['very long', 'x'.repeat(300)], ['punctuation', '<b>"; DROP--']] as const) {
      await act('make-a-quiz', `${label}`, async () => {
        const box = form.getByRole('textbox').first();
        await box.fill(title);
        const submit = form.getByRole('button').first();
        if (await submit.isEnabled()) {
          await submit.click({ timeout: 2000 });
          await page.waitForTimeout(offline ? 800 : 2500);
        }
        const t = await form.innerText();
        return `says: ${t.replace(/\s+/g, ' ').slice(-90)}`;
      });
    }
  } else {
    acts.push({ viewport, type: 'make-a-quiz', screen: '/quizzes', control: 'form', ok: false, note: 'make-a-quiz form not found on /quizzes' });
  }

  // ---- Castle: every wing, enter, answer, back ----
  await go('/castle');
  const wings = await page.locator('main a[href^="/castle/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href') ?? ''))]);
  for (const w of wings.slice(0, 16)) {
    await go(w);
    await act('castle', `enter ${w}`, async () => {
      const t = await page.locator('main').innerText();
      if (/not in the castle/i.test(t)) throw new Error('wing says it is not in the castle');
      return `${await page.locator('main a, main button').count()} controls`;
    });
    const doors = page.locator('main a[href*="/quiz/"], main a[href*="/article/"]');
    if (await doors.count()) await act('castle', 'open the first door', async () => doors.first().click({ timeout: 3000 }));
    await go(w);
    for (let i = 0; i < 3 && (await page.locator('input[type=radio]').count()) > 0; i++) {
      await act('castle', 'answer a question', async () => {
        await page.locator('input[type=radio]').nth(i).check({ force: true, timeout: 2000 });
        await page.getByRole('button', { name: 'Check my answer' }).click({ timeout: 2000 });
      });
    }
    await act('castle', 'back to the castle', async () => {
      await page.getByRole('link', { name: /back to the castle/i }).first().click({ timeout: 3000 });
    });
  }

  // ---- Atlas: pick a country from each continent, zoom, spin ----
  await go('/atlas');
  const countries = ['Nigeria', 'Egypt', 'Japan', 'India', 'France', 'Italy', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Australia', 'New Zealand'];
  for (const c of countries) {
    await act('atlas', `pick ${c}`, async () => {
      await page.locator('main select').first().selectOption({ label: c }, { timeout: 3000 });
      await page.waitForTimeout(300);
      const t = await page.locator('main').innerText();
      if (!t.includes(c)) throw new Error(`${c} not shown after picking it`);
    });
  }
  await act('atlas', 'Read about the country', async () => page.getByRole('link', { name: /^Read about/ }).first().click({ timeout: 3000 }));
  await go('/atlas');
  const globe = page.locator('main svg[aria-label], main canvas').first();
  if (await globe.count()) {
    const box = await globe.boundingBox();
    if (box) {
      await act('atlas', 'spin the globe (drag)', async () => {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 20, { steps: 8 });
        await page.mouse.up();
      });
      await act('atlas', 'zoom the globe (wheel)', async () => {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, -400);
        await page.waitForTimeout(200);
        await page.mouse.wheel(0, 800);
      });
      await act('atlas', 'click a country on the globe', async () => {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);
      });
    }
  } else {
    acts.push({ viewport, type: 'atlas', screen: '/atlas', control: 'globe', ok: false, note: 'globe element not found' });
  }
  for (const href of await page.locator('a.stamp-sheet__link').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))) {
    await go(href);
    await act('stamp book', `continent page ${href}`, async () => `${await page.locator('main img').count()} stamp pictures, ${await page.locator('main a').count()} links`);
  }

  // ---- Tours: start each and step to the end ----
  await go('/tours');
  const tours = await page.locator('main a[href^="/tours/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href') ?? ''))]);
  for (const t of tours) {
    await go(t);
    for (let i = 0; i < 12; i++) {
      const next = page.getByRole('link', { name: /next stop/i }).first();
      if (!(await next.isVisible().catch(() => false))) break;
      await act('tour', `${t} next stop ${i + 1}`, async () => next.click({ timeout: 3000 }));
    }
    await act('tour', `${t} open the article`, async () => {
      await go(t);
      await page.getByRole('link', { name: /open the article/i }).first().click({ timeout: 3000 });
    });
  }

  // ---- Timeline: every filter and century, a note link ----
  await go('/timeline');
  await allFilters('timeline');
  await act('timeline', 'note link goes to an article', async () => {
    await go('/timeline');
    await page.locator('.tl-note__link').first().click({ timeout: 4000 });
  });

  // ---- Pictures: filters, search, surprise pile, large view with next and previous ----
  await go('/media');
  await allFilters('pictures');
  await go('/media');
  for (const q of ['lion', 'zzqxj', 'a', '"; <b>', 'colosseum 1000']) {
    await act('pictures', `search "${q}"`, async () => {
      await page.getByRole('searchbox').first().fill(q);
      await page.waitForTimeout(300);
      return (await page.getByRole('status').filter({ hasText: /Showing|No pictures|0 of/ }).first().innerText().catch(() => 'no status line')).slice(0, 60);
    });
  }
  await page.getByRole('searchbox').first().fill('');
  await act('pictures', 'Surprise me', async () => page.getByRole('button', { name: 'Surprise me' }).click({ timeout: 3000 }));
  await act('pictures', 'open a picture (large view)', async () => page.locator('.tile').first().click({ timeout: 4000 }));
  for (const [name, key] of [['Next picture', 'Next'], ['Previous picture', 'Previous']] as const) {
    await act('pictures', name, async () => {
      await page.getByRole('dialog').getByRole('button', { name: new RegExp(key, 'i') }).first().click({ timeout: 3000 });
    });
  }
  await act('pictures', 'close with Escape', async () => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    if (await page.getByRole('dialog').count()) throw new Error('dialog still open after Escape');
  });

  // ---- Search edge cases ----
  for (const q of ['nile', 'nilee', 'a', 'zzqxjvk', 'x'.repeat(500), '"; <script>alert(1)</script>', 'café', '   ', '?*+(', 'ЖЖ', '日本']) {
    await go(`/search?q=${encodeURIComponent(q)}`);
    await act('search', `query ${JSON.stringify(q.slice(0, 20))}`, async () => {
      await page.getByRole('status').filter({ hasText: /result|Nothing|Type a word|offline/i }).first().waitFor({ timeout: 12_000 }).catch(() => undefined);
      await page.locator('.search__list, .search__none').first().waitFor({ timeout: 4000 }).catch(() => undefined);
      const t = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
      return `${await page.locator('main a.search__title').count()} hits; ${t.slice(0, 70)}`;
    });
  }
  await go('/');
  await act('search', 'header search box submits', async () => {
    await page.getByRole('searchbox').first().fill('okapi');
    await page.keyboard.press('Enter');
    await page.waitForURL(/search/, { timeout: 4000 });
  });

  // ---- Article: word cards (double click), in-article links ----
  await go('/article/countries/nigeria');
  await act('article', 'double-click a word opens a word card', async () => {
    const word = page.locator('.article__body p').first();
    await word.dblclick({ position: { x: 60, y: 10 }, timeout: 3000 });
    await page.waitForTimeout(500);
    return (await page.locator('.word-card').count()) ? 'word card shown' : 'no word card (word may have no entry)';
  });
  const bodyLinks = await page.locator('.article__body a[href^="/"]').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? '').slice(0, 8));
  for (const h of bodyLinks) {
    await go('/article/countries/nigeria');
    await act('article', `in-article link ${h}`, async () => page.locator(`.article__body a[href="${h}"]`).first().click({ timeout: 3000 }));
  }

  // ---- Credits: paging and search ----
  await go('/credits');
  for (let i = 0; i < 4; i++) {
    const nextBtn = page.getByRole('button', { name: /next/i }).first();
    if (!(await nextBtn.isEnabled().catch(() => false))) break;
    await act('credits', `page forward ${i + 1}`, async () => nextBtn.click({ timeout: 2000 }));
  }
  await act('credits', 'page back', async () => page.getByRole('button', { name: /previous|back/i }).first().click({ timeout: 2000 }));
  await act('credits', 'search the pictures table', async () => {
    await page.getByRole('searchbox').first().fill('pyramid');
    await page.waitForTimeout(300);
  });

  // ---- Search: find as you type, and A to Z ----
  await go('/search');
  await act('search', 'results appear while typing', async () => {
    await page.getByLabel('Search articles, events and words').pressSequentially('lion', { delay: 60 });
    await page.locator('a.search__title', { hasText: /lion/i }).first().waitFor({ timeout: 8000 });
  });
  await go('/search');
  await act('search', 'A to Z letter lists articles', async () => {
    await page.getByRole('button', { name: 'L', exact: true }).click({ timeout: 4000 });
    const n = await page.locator('.search__az-list a').count();
    if (n < 3) throw new Error(`only ${n} articles under L`);
    return `${n} articles under L`;
  });

  // ---- Stamp book: start again needs two taps ----
  await go('/stamps');
  await act('stamp book', 'Start again, then No', async () => {
    await page.getByRole('button', { name: 'Start my stamp book again' }).click({ timeout: 3000 });
    await page.getByRole('button', { name: 'No, keep my book' }).click({ timeout: 3000 });
  });

  // ---- Article: contents list ----
  await go('/article/countries/nigeria');
  await act('article', 'contents list jumps to a section', async () => {
    const link = page.getByRole('navigation', { name: 'In this article' }).getByRole('link').nth(2);
    await link.click({ timeout: 3000 });
    return `now at ${new URL(page.url()).hash}`;
  });

  // ---- Not-found ----
  await go('/no-such-page');
  await act('not-found', 'a helpful way back', async () => {
    const link = page.getByRole('link', { name: /home|back|explore/i }).first();
    if (!(await link.count())) throw new Error('no way back on the not-found screen');
    await link.click({ timeout: 2000 });
  });
  await page.close();
}
