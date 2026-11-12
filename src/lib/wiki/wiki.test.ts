import fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadWikiArticle } from './api.ts';
import { clearReadingCacheForTests, getArticle, getWord, listArticles, putArticle, putWord } from './cache.ts';
import { WikiError, acceptPhoto, apiTitle, titleSlug, toArticle, urlTitle, type WikiPage } from './convert.ts';

const BODY =
  'Mount Everest is the highest mountain on Earth. It is in the Himalayas. People first climbed it in 1953.\n' +
  '== Climbing ==\nMany people try to climb it each year. The air is very thin near the top.\n' +
  '== References ==\nA book. Another book.\n' +
  '== Other websites ==\nA link.';

const page = (over: Partial<WikiPage> = {}): WikiPage => ({
  wiki: 'simple',
  title: 'Mount Everest',
  extract: BODY,
  qid: 'Q513',
  fetched: '2026-11-12T10:00:00.000Z',
  thumb: { source: 'https://upload.wikimedia.org/x/800px-Everest.jpg', width: 800, height: 533 },
  pageimage: 'Everest.jpg',
  ...over,
});

const goodMeta = { artist: '<a href="x">Ann Author</a>', licenceShort: 'CC BY-SA 4.0', description: 'The mountain at dawn', mime: 'image/jpeg' };

describe('toArticle (14-any-article 2.1)', () => {
  it('Property 1: keeps the text, drops back matter, and leaves plain text. _Req 1.2_', () => {
    const a = toArticle(page(), goodMeta);
    expect(a.pack).toBe('wiki');
    expect(a.sections.map((s) => s.heading)).toEqual(['', 'Climbing']);
    const text = a.sections.flatMap((s) => s.paragraphs).join(' ');
    expect(text).not.toMatch(/References|Other websites|<|&amp;|==/);
    expect(a.source).toMatchObject({ licence: 'CC BY-SA 4.0', url: 'https://simple.wikipedia.org/wiki/Mount_Everest' });
    expect(a.qid).toBe('Q513');
    expect(a.summary.length).toBeGreaterThan(0);
  });

  it('refuses a page with no text', () => {
    expect(() => toArticle(page({ extract: '== References ==\nOnly this.' }))).toThrow(WikiError);
  });

  it('Property 2: the id is the same for any case or underscores. _Req 1.3_', () => {
    fc.assert(
      fc.property(fc.array(fc.stringMatching(/^[A-Za-z]{2,8}$/), { minLength: 1, maxLength: 4 }), (words) => {
        const title = words.join(' ');
        expect(titleSlug(urlTitle(title))).toBe(titleSlug(title));
        expect(titleSlug(title.toUpperCase())).toBe(titleSlug(title.toLowerCase()));
        expect(apiTitle(urlTitle(title))).toBe(title);
      }),
    );
  });

  it('Property 6: a photo needs an accepted licence and a named author. _Req 2.1_', () => {
    const p = page();
    const ok = acceptPhoto(p, goodMeta);
    expect(ok).toMatchObject({ credit: { author: 'Ann Author', licence: 'CC BY-SA 4.0' }, alt: 'The mountain at dawn' });
    expect(acceptPhoto(p, { ...goodMeta, artist: '' })).toBeUndefined();
    expect(acceptPhoto(p, { ...goodMeta, licenceShort: 'All rights reserved' })).toBeUndefined();
    expect(acceptPhoto(p, { ...goodMeta, restrictions: 'trademarked' })).toBeUndefined();
    expect(acceptPhoto(p, { ...goodMeta, mime: 'image/svg+xml' })).toBeUndefined();
    expect(acceptPhoto(p, undefined)).toBeUndefined();
    expect(acceptPhoto({ ...p, thumb: undefined }, goodMeta)).toBeUndefined();
    expect(toArticle(p, { ...goodMeta, artist: '' }).photos).toEqual([]);
    fc.assert(
      fc.property(fc.string({ maxLength: 20 }), fc.string({ maxLength: 20 }), (artist, licence) => {
        const photo = acceptPhoto(p, { ...goodMeta, artist, licenceShort: licence });
        if (photo) {
          expect(photo.credit.author).not.toBe('');
          expect(photo.credit.licence).toBeTruthy();
        }
      }),
    );
  });
});

/** A fake fetch that answers the MediaWiki and Commons calls. */
function fakeFetch(pages: Record<string, unknown>, log: string[] = []): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = new URL(typeof input === 'string' ? input : input.toString());
    log.push(`${url.hostname}`);
    if (url.hostname === 'commons.wikimedia.org') {
      return Response.json({
        query: { pages: [{ imageinfo: [{ mime: 'image/jpeg', extmetadata: { Artist: { value: 'Ann Author' }, LicenseShortName: { value: 'CC BY-SA 4.0' }, ImageDescription: { value: 'A mountain' } } }] }] },
      });
    }
    if (url.hostname.endsWith('upload.wikimedia.org')) {
      return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/jpeg' } });
    }
    const reply = pages[url.hostname];
    return reply ? Response.json(reply) : Response.json({ query: { pages: [{ title: 'x', missing: true }] } });
  }) as typeof fetch;
}

const apiPage = (title: string): unknown => ({
  query: { pages: [{ title, extract: BODY, pageimage: 'Everest.jpg', thumbnail: { source: 'https://upload.wikimedia.org/a.jpg', width: 800, height: 533 }, pageprops: { wikibase_item: 'Q513' } }] },
});

describe('loadWikiArticle (14-any-article 3.1)', () => {
  it('Property 5: Simple first; English only when Simple has no page. _Req 1.1_', async () => {
    const log: string[] = [];
    const simple = await loadWikiArticle('Mount_Everest', fakeFetch({ 'simple.wikipedia.org': apiPage('Mount Everest') }, log));
    expect(simple.article.source.name).toContain('Simple English Wikipedia');
    expect(log).not.toContain('en.wikipedia.org');
    expect(simple.photo).toBeDefined();
    expect(simple.article.photos[0]?.credit.author).toBe('Ann Author');

    const log2: string[] = [];
    const english = await loadWikiArticle('Mount Everest', fakeFetch({ 'en.wikipedia.org': apiPage('Mount Everest') }, log2));
    expect(log2.slice(0, 2)).toEqual(['simple.wikipedia.org', 'en.wikipedia.org']);
    expect(english.article.source.name).toContain('English Wikipedia');
    expect(english.article.source.url).toContain('en.wikipedia.org');
  });

  it('says when no page exists and when the network is gone', async () => {
    await expect(loadWikiArticle('Zzzz qqq', fakeFetch({}))).rejects.toMatchObject({ reason: 'notfound' });
    const offline = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    await expect(loadWikiArticle('Mount Everest', offline)).rejects.toMatchObject({ reason: 'offline' });
  });

  it('drops the photo, not the article, when the photo cannot be downloaded', async () => {
    const f = fakeFetch({ 'simple.wikipedia.org': apiPage('Mount Everest') });
    const noPhoto = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('upload.wikimedia.org')) throw new TypeError('blocked');
      return f(input, init);
    }) as typeof fetch;
    const loaded = await loadWikiArticle('Mount Everest', noPhoto);
    expect(loaded.photo).toBeUndefined();
    expect(loaded.article.photos).toEqual([]);
  });
});

describe('reading cache (14-any-article 3.2)', () => {
  beforeEach(() => clearReadingCacheForTests());

  it('Property 4: round-trips an article and its photo bytes through IndexedDB. _Req 3.1_', async () => {
    const loaded = await loadWikiArticle('Mount Everest', fakeFetch({ 'simple.wikipedia.org': apiPage('Mount Everest') }));
    await putArticle('Mount_Everest', loaded);
    clearReadingCacheForTests(); // force a read from IndexedDB
    const back = await getArticle('mount everest');
    expect(back?.article).toEqual(loaded.article);
    expect(back?.photo?.size).toBe(3);
    expect(await getArticle('Mount_Everest')).toBeDefined();
    expect(await getArticle('Mount Kenya')).toBeUndefined();
  });

  it('lists read articles once each, newest first', async () => {
    const loaded = await loadWikiArticle('Mount Everest', fakeFetch({ 'simple.wikipedia.org': apiPage('Mount Everest') }));
    await putArticle('everest', loaded);
    const list = await listArticles();
    expect(list.filter((r) => r.title === 'Mount Everest')).toHaveLength(1);
    expect(list[0]?.slug).toBe('Mount_Everest');
  });

  it('saves word lookups, including "nothing found"', async () => {
    expect(await getWord('Delta')).toBeUndefined();
    await putWord('Delta', { word: 'Delta', lemma: 'delta', senses: [{ pos: 'n', gloss: 'a river mouth' }] });
    await putWord('zzyzx', null);
    clearReadingCacheForTests();
    expect((await getWord('delta'))?.lemma).toBe('delta');
    expect(await getWord('zzyzx')).toBeNull();
  });
});
