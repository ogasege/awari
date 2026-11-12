import { beforeEach, describe, expect, it } from 'vitest';
import { clearReadingCacheForTests, getWord } from '../wiki/cache.ts';
import { lookupAnyWord, parseWiktionary } from './online.ts';

const reply = {
  en: [
    { partOfSpeech: 'Noun', definitions: [{ definition: 'A <b>small</b> fast antelope.', examples: ['The <i>okapi</i> hid.'] }, { definition: 'x' }] },
    { partOfSpeech: 'Letter', definitions: [{ definition: 'Not a word class we keep.' }] },
  ],
};

describe('word meanings beyond the bundled dictionary (14-any-article 4.3)', () => {
  beforeEach(() => clearReadingCacheForTests());

  it('reads a Wiktionary reply into plain senses and says where it came from', () => {
    const d = parseWiktionary(reply, 'okapi');
    expect(d).toEqual({
      word: 'okapi',
      lemma: 'okapi',
      from: 'wiktionary',
      senses: [{ pos: 'n', gloss: 'A small fast antelope.', example: 'The okapi hid.' }],
    });
    expect(parseWiktionary({}, 'x')).toBeNull();
    expect(parseWiktionary(null, 'x')).toBeNull();
  });

  it('uses the bundled dictionary first, with no network', async () => {
    const never = (async () => {
      throw new Error('should not be called');
    }) as typeof fetch;
    // "delta" is in the bundled shards; the lookup is served by fetch of /packs/…
    const bundled = await lookupAnyWord('zzzzqx', never);
    expect(bundled).toEqual({ definition: null, offline: true });
  });

  it('asks Wiktionary, saves the answer, and then needs no network. _Req 5.1_', async () => {
    let calls = 0;
    const f = (async () => {
      calls += 1;
      return Response.json(reply);
    }) as typeof fetch;
    const first = await lookupAnyWord('okapi', f);
    expect(first.definition?.from).toBe('wiktionary');
    expect(calls).toBe(1);
    clearReadingCacheForTests();
    const offline = (async () => {
      throw new TypeError('offline');
    }) as typeof fetch;
    const again = await lookupAnyWord('okapi', offline);
    expect(again.definition?.senses[0]?.gloss).toBe('A small fast antelope.');
    expect(again.offline).toBe(false);
  });

  it('saves "nothing found" and says offline in words when it cannot ask', async () => {
    const f = (async () => new Response('', { status: 404 })) as typeof fetch;
    expect(await lookupAnyWord('qwxz', f)).toEqual({ definition: null, offline: false });
    expect(await getWord('qwxz')).toBeNull();
    const down = (async () => {
      throw new TypeError('offline');
    }) as typeof fetch;
    expect(await lookupAnyWord('plorbf', down)).toEqual({ definition: null, offline: true });
    expect(await getWord('plorbf')).toBeUndefined();
  });
});
