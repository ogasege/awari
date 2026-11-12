import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { mergeResults, wikiSearch, type WikiHit } from './search.ts';

const title = fc.array(fc.stringMatching(/^[A-Za-z]{2,7}$/), { minLength: 1, maxLength: 3 }).map((w) => w.join(' '));
const doc = fc.record({ title, text: fc.string({ maxLength: 20 }) }).map((d) => ({ ...d, to: `/article/countries/${d.title.toLowerCase().replace(/ /g, '-')}` }));
const hit = title.map(
  (t): WikiHit => ({ title: t, snippet: 'about it', wiki: 'simple', to: `/article/wiki/${t.replace(/ /g, '_')}` }),
);

describe('merged search results (14-any-article 4.4)', () => {
  it('Property 7: no repeated target or title, and bundled articles replace their wiki twins. _Req 4.1, 4.2_', () => {
    fc.assert(
      fc.property(fc.array(doc, { maxLength: 8 }), fc.array(doc, { maxLength: 8 }), fc.array(hit, { maxLength: 8 }), (bundled, read, online) => {
        const merged = mergeResults(bundled, read, online);
        expect(new Set(merged.map((m) => m.to)).size).toBe(merged.length);
        expect(new Set(merged.map((m) => m.title.toLowerCase())).size).toBe(merged.length);
        for (const b of bundled) {
          expect(merged.some((m) => m.title.toLowerCase() === b.title.toLowerCase())).toBe(true);
        }
        const firstWiki = merged.findIndex((m) => m.origin === 'wikipedia');
        if (firstWiki >= 0) {
          expect(merged.slice(firstWiki).every((m) => m.origin === 'wikipedia')).toBe(true);
        }
        const bundledTitles = new Set(bundled.map((b) => b.title.toLowerCase()));
        for (const m of merged) {
          if (m.origin === 'wikipedia') expect(bundledTitles.has(m.title.toLowerCase())).toBe(false);
        }
      }),
    );
  });

  it('puts bundled first, then read, then online', () => {
    const merged = mergeResults(
      [{ title: 'Nile', text: 'a river', to: '/article/earth/nile' }],
      [{ title: 'Hippo', text: 'read', to: '/article/wiki/Hippo' }],
      [
        { title: 'Nile', snippet: 'twin', wiki: 'simple', to: '/article/wiki/Nile' },
        { title: 'Delta', snippet: 'new', wiki: 'en', to: '/article/wiki/Delta' },
      ],
    );
    expect(merged.map((m) => [m.title, m.origin])).toEqual([
      ['Nile', 'bundled'],
      ['Hippo', 'read'],
      ['Delta', 'wikipedia'],
    ]);
  });
});

describe('wikiSearch (14-any-article 4.1)', () => {
  const reply = (titles: string[]): Response =>
    Response.json({ query: { search: titles.map((t) => ({ title: t, snippet: `<span class="x">${t}</span> is a thing &amp; more` })) } });

  it('uses Simple English first and English only when Simple finds nothing', async () => {
    const hosts: string[] = [];
    const f = (async (input: RequestInfo | URL) => {
      const u = new URL(String(input));
      hosts.push(u.hostname);
      return u.hostname.startsWith('simple') ? reply([]) : reply(['Okapi']);
    }) as typeof fetch;
    const hits = await wikiSearch('okapi', f);
    expect(hosts).toEqual(['simple.wikipedia.org', 'en.wikipedia.org']);
    expect(hits).toEqual([{ title: 'Okapi', snippet: 'Okapi is a thing & more', wiki: 'en', to: '/article/wiki/Okapi' }]);
  });

  it('opens titles with spaces and accents, and answers nothing for a blank query or no network', async () => {
    const f = (async () => reply(['Côte d\'Ivoire'])) as typeof fetch;
    const [h] = await wikiSearch('ivory', f);
    expect(h?.to).toBe('/article/wiki/C%C3%B4te_d\'Ivoire');
    expect(await wikiSearch('  ', f)).toEqual([]);
    const down = (async () => {
      throw new TypeError('offline');
    }) as typeof fetch;
    expect(await wikiSearch('okapi', down)).toEqual([]);
  });
});
