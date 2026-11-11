import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { lemmaCandidates, shardFor } from '../../lib/dictionary/lemmatize.ts';
import { lookupWord, type ShardLoader } from '../../lib/dictionary/lookup.ts';
import type { Article, CountryFacts, DictionaryShard, Source } from '../../lib/packs/types.ts';
import { isWord, splitWords } from '../../lib/text/tokens.ts';
import { articleCredits, factRows } from './credit.ts';

const src: Source = {
  name: 'Simple English Wikipedia: X',
  url: 'https://simple.wikipedia.org/wiki/X',
  licence: 'CC BY-SA 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  retrieved: '2026-11-11',
};

const lemma = fc.stringMatching(/^[a-z]{2,10}$/);

/** A loader over an in-memory dictionary. */
function loaderFor(words: readonly string[]): ShardLoader {
  return async (shard) => {
    const entries: DictionaryShard['entries'] = {};
    for (const w of words) {
      if (shardFor(w) === shard) entries[w] = [{ pos: 'n', gloss: `meaning of ${w}` }];
    }
    return { shard, entries, source: src };
  };
}

describe('articles and dictionary (03-articles-dictionary)', () => {
  it('Property 1: tokens join back to the text; word tokens are words (Req 1.1, 3.1)', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (text) => {
        const tokens = splitWords(text);
        expect(tokens.map((t) => t.text).join('')).toBe(text);
        for (const t of tokens) if (t.word) expect(isWord(t.text)).toBe(true);
      }),
    );
  });

  it('Property 2: a found lemma is a candidate and in the dictionary (Req 3.1, 3.2)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(lemma, { maxLength: 30 }), lemma, async (dict, word) => {
        const found = await lookupWord(word, loaderFor(dict));
        if (found) {
          expect(lemmaCandidates(word)).toContain(found.lemma);
          expect(dict).toContain(found.lemma);
        }
      }),
    );
  });

  it('Property 3: never a false “not found” (Req 3.2, 3.5)', async () => {
    await fc.assert(
      fc.asyncProperty(lemma, fc.constantFrom('', 's', 'es', 'ed', 'ing'), async (base, suffix) => {
        const word = base + suffix;
        const dict = [lemmaCandidates(word).at(-1) as string];
        expect(await lookupWord(word, loaderFor(dict))).not.toBeNull();
      }),
    );
  });

  it('Property 4: lookup ignores case (Req 3.2)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(lemma, { maxLength: 20 }), lemma, async (dict, word) => {
        const a = await lookupWord(word, loaderFor(dict));
        const b = await lookupWord(word.toUpperCase(), loaderFor(dict));
        expect(b?.lemma).toBe(a?.lemma);
      }),
    );
  });

  it('Property 5: credits always name and link source and licence (Req 2.1, 2.2)', () => {
    const photo = fc.record({
      file: fc.constant('img/x.jpg'),
      width: fc.nat(),
      height: fc.nat(),
      alt: fc.string(),
      caption: fc.string(),
      credit: fc.record({
        name: fc.string({ minLength: 1 }),
        url: fc.webUrl(),
        licence: fc.constantFrom('CC BY-SA 4.0' as const, 'CC0' as const, 'Public domain' as const),
        licenceUrl: fc.webUrl(),
        author: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
        retrieved: fc.constant('2026-11-11'),
      }),
    });
    fc.assert(
      fc.property(fc.array(photo, { maxLength: 4 }), (photos) => {
        const article: Article = {
          id: 'x', pack: 'countries', title: 'X', summary: '', sections: [], notes: [], photos, source: src,
        };
        const lines = articleCredits(article);
        expect(lines).toHaveLength(1 + photos.length);
        expect(lines[0]?.text).toContain('CC BY-SA 4.0');
        for (const l of lines) {
          expect(l.source.url).toMatch(/^https?:/);
          expect(l.source.licenceUrl).toMatch(/^https?:/);
          expect(l.text).toContain(l.source.licence);
        }
        lines.slice(1).forEach((l) => expect(l.text).toMatch(/by .+,/));
      }),
    );
  });

  it('Property 6: fact rows never show NaN or undefined (Req 1.4)', () => {
    fc.assert(
      fc.property(
        fc.option(fc.double(), { nil: undefined }),
        fc.option(fc.double(), { nil: undefined }),
        fc.array(fc.string({ minLength: 1, maxLength: 8 }), { maxLength: 3 }),
        (population, areaKm2, languages) => {
          const f: CountryFacts = {
            id: 'x', qid: 'Q1', name: 'X', iso3: 'XXX', continent: 'Africa', population, areaKm2,
            languages, neighbours: [], source: src,
          };
          for (const r of factRows(f)) {
            expect(r.value).not.toMatch(/NaN|undefined|Infinity/);
          }
        },
      ),
    );
  });
});
