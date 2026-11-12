import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { searchDocs, tokens, type SearchDoc } from './search.ts';

const word = fc.stringMatching(/^[a-z]{2,8}$/);
const doc = fc.record({
  kind: fc.constantFrom<'article' | 'event'>('article', 'event'),
  id: fc.stringMatching(/^[a-z0-9]{1,6}$/),
  title: fc.array(word, { minLength: 1, maxLength: 3 }).map((w) => w.join(' ')),
  text: fc.array(word, { maxLength: 10 }).map((w) => w.join(' ')),
  to: fc.constant('/x'),
}) as fc.Arbitrary<SearchDoc>;
const docs = fc.array(doc, { maxLength: 30 });

describe('search (13-search 2.1)', () => {
  it('splits a query into lowercase words', () => {
    expect(tokens('  The Niger-Delta, 1960! ')).toEqual(['the', 'niger', 'delta', '1960']);
    expect(tokens('   ')).toEqual([]);
  });

  it('Property 1: every result contains every query word in its title or text. _Req 1.1_', () => {
    fc.assert(
      fc.property(docs, fc.array(word, { minLength: 1, maxLength: 3 }), (list, q) => {
        for (const hit of searchDocs(list, q.join(' '))) {
          const hay = `${hit.title} ${hit.text}`.toLowerCase();
          for (const w of q) expect(hay).toContain(w);
        }
      }),
    );
  });

  it('Property 1 (completeness): documents containing every word are all returned', () => {
    fc.assert(
      fc.property(docs, word, (list, w) => {
        const expected = list.filter((d) => `${d.title} ${d.text}`.toLowerCase().includes(w)).length;
        expect(searchDocs(list, w)).toHaveLength(expected);
      }),
    );
  });

  it('Property 2: results are ordered by score, then title. _Req 1.2_', () => {
    fc.assert(
      fc.property(docs, word, (list, w) => {
        const hits = searchDocs(list, w);
        for (let i = 1; i < hits.length; i++) {
          const a = hits[i - 1]!;
          const b = hits[i]!;
          expect(a.score).toBeGreaterThanOrEqual(b.score);
          if (a.score === b.score) expect(a.title.localeCompare(b.title)).toBeLessThanOrEqual(0);
        }
      }),
    );
  });

  it('puts title matches above text matches', () => {
    const list: SearchDoc[] = [
      { kind: 'article', id: 'a', title: 'Rivers', text: 'The Nile is long.', to: '/a' },
      { kind: 'article', id: 'b', title: 'The Nile', text: 'A river.', to: '/b' },
    ];
    expect(searchDocs(list, 'nile').map((h) => h.id)).toEqual(['b', 'a']);
  });

  it('Property 3: a blank query returns nothing. _Req 1.3_', () => {
    fc.assert(
      fc.property(docs, fc.constantFrom('', ' ', '  \t', '!!', '...'), (list, q) => {
        expect(searchDocs(list, q)).toEqual([]);
      }),
    );
  });

  it('Property 4: the case of the query does not change the results', () => {
    fc.assert(
      fc.property(docs, word, (list, w) => {
        expect(searchDocs(list, w.toUpperCase())).toEqual(searchDocs(list, w));
      }),
    );
  });
});
