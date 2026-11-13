/**
 * Properties of the service worker's pure decisions (09-offline 2.1).
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  CACHE_PREFIX,
  cacheNameFor,
  planFor,
  precacheList,
  staleCaches,
  versionOf,
} from './strategy.ts';

const ORIGIN = 'https://awari.example';
const segment = fc.stringMatching(/^[a-z0-9_-][a-z0-9._-]{0,7}$/);
const path = fc.array(segment, { minLength: 1, maxLength: 4 }).map((s) => `/${s.join('/')}`);
const precacheSet = fc.array(path, { maxLength: 20 }).map((p) => new Set(p));
const mode = fc.constantFrom('navigate', 'cors', 'no-cors', 'same-origin');

describe('planFor (Property 1-3)', () => {
  it('Property 1: non-GET, cross-origin and /api/ requests are network-only. _Req 2.3_', () => {
    fc.assert(
      fc.property(precacheSet, path, mode, (pre, p, m) => {
        for (const meth of ['POST', 'PUT', 'DELETE', 'HEAD']) {
          expect(planFor({ method: meth, url: `${ORIGIN}${p}`, mode: m }, ORIGIN, pre)).toBe('network-only');
        }
        expect(planFor({ method: 'GET', url: `https://elsewhere.example${p}`, mode: m }, ORIGIN, pre)).toBe(
          'network-only',
        );
        const api = new Set([...pre, '/api/quiz']);
        for (const url of [`${ORIGIN}/api/quiz`, `${ORIGIN}/api/quiz?x=1`, `${ORIGIN}/api`, `${ORIGIN}/api/${p}`]) {
          expect(planFor({ method: 'GET', url, mode: m }, ORIGIN, api)).toBe('network-only');
        }
      }),
    );
  });

  it('Property 2: a precached path is cache-first unless it is a navigation. _Req 2.1_', () => {
    fc.assert(
      fc.property(precacheSet.filter((s) => s.size > 0), fc.constantFrom('cors', 'no-cors', 'same-origin'), (pre, m) => {
        for (const p of pre) {
          if (p === '/api' || p.startsWith('/api/')) continue;
          expect(planFor({ method: 'GET', url: `${ORIGIN}${p}?v=1`, mode: m }, ORIGIN, pre)).toBe('precache');
        }
      }),
    );
  });

  it('Property 3: every same-origin navigation is a navigation, so each route opens offline. _Req 2.2_', () => {
    fc.assert(
      fc.property(precacheSet, path, (pre, p) => {
        fc.pre(p !== '/api' && !p.startsWith('/api/'));
        expect(planFor({ method: 'GET', url: `${ORIGIN}${p}`, mode: 'navigate' }, ORIGIN, pre)).toBe('navigate');
      }),
    );
  });

  it('tries the network first for same-origin files that were not saved. _Req 2.4_', () => {
    expect(planFor({ method: 'GET', url: `${ORIGIN}/packs/new.json`, mode: 'cors' }, ORIGIN, new Set())).toBe(
      'network-first',
    );
  });
});

describe('caches and versions', () => {
  it('Property 4: stale caches never include the current one and are only Awari caches. _Req 1.4_', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(segment.map((s) => cacheNameFor(s)), segment.map((s) => `other-${s}`)), { maxLength: 12 }),
        segment,
        (names, v) => {
          const current = cacheNameFor(v);
          const stale = staleCaches([...names, current], current);
          expect(stale).not.toContain(current);
          expect(stale.every((n) => n.startsWith(CACHE_PREFIX))).toBe(true);
          expect(stale).toEqual(names.filter((n) => n.startsWith(CACHE_PREFIX) && n !== current));
        },
      ),
    );
  });

  it('Property 5: the precache has / and /index.html, never the worker or source maps, and no repeats. _Req 1.2_', () => {
    fc.assert(
      fc.property(fc.array(fc.oneof(path.map((p) => p.slice(1)), fc.constantFrom('sw.js', 'assets/a.js.map', 'index.html')), { maxLength: 30 }), (files) => {
        const list = precacheList(files);
        expect(list).toContain('/');
        expect(list).toContain('/index.html');
        expect(list).not.toContain('/sw.js');
        expect(list.some((u) => u.endsWith('.map'))).toBe(false);
        expect(new Set(list).size).toBe(list.length);
        for (const f of files) {
          if (f !== 'sw.js' && !f.endsWith('.map')) expect(list).toContain(`/${f}`);
        }
      }),
    );
  });

  it('Property 6: the version ignores file order and changes with any path or content. _Req 1.1_', () => {
    const entry = fc.tuple(path, fc.stringMatching(/^[0-9a-f]{8}$/));
    fc.assert(
      fc.property(fc.uniqueArray(entry, { selector: (e) => e[0], minLength: 1, maxLength: 15 }), fc.nat(), (entries, k) => {
        const v = versionOf(entries);
        expect(versionOf([...entries].reverse())).toBe(v);
        const i = k % entries.length;
        const changed = entries.map((e, j) => (j === i ? ([e[0], `${e[1]}x`] as const) : e));
        expect(versionOf(changed)).not.toBe(v);
        const renamed = entries.map((e, j) => (j === i ? ([`${e[0]}x`, e[1]] as const) : e));
        expect(versionOf(renamed)).not.toBe(v);
        expect(v).toMatch(/^[0-9a-f]{16}$/);
      }),
    );
  });
});

describe('library thumbnails (23-media-library Req 21)', () => {
  it('are answered by the media plan and left out of the install-time precache', () => {
    expect(planFor({ method: 'GET', url: `${ORIGIN}/media/img/0123456789abcdef.webp`, mode: 'cors' }, ORIGIN, new Set())).toBe('media');
    const list = precacheList(['index.html', 'media/index.json', 'media/img/a.webp', 'media/img/b.webp', 'assets/app.js']);
    expect(list).toContain('/media/index.json');
    expect(list.filter((u) => u.startsWith('/media/img/'))).toEqual([]);
  });
});

describe('large view of a library picture (23-media-library Req 21)', () => {
  it('is kept when it comes from the Commons FilePath address, and nothing else from another origin is', () => {
    const big = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lagos%20skyline.jpg?width=1024';
    expect(planFor({ method: 'GET', url: big, mode: 'no-cors' }, ORIGIN, new Set())).toBe('media');
    expect(planFor({ method: 'GET', url: 'https://commons.wikimedia.org/w/api.php', mode: 'cors' }, ORIGIN, new Set())).toBe('network-only');
    expect(planFor({ method: 'GET', url: 'http://commons.wikimedia.org/wiki/Special:FilePath/x.jpg', mode: 'no-cors' }, ORIGIN, new Set())).toBe('network-only');
    expect(planFor({ method: 'POST', url: big, mode: 'cors' }, ORIGIN, new Set())).toBe('network-only');
  });
});
