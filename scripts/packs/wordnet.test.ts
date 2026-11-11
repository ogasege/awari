// @vitest-environment node
/** Tests for the WordNet parser, lemma selection and sharding. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Source, WordSense } from '../../src/lib/packs/types.ts';
import { lemmaCandidates, shardFor, tokenise } from '../../src/lib/dictionary/lemmatize.ts';
import { MAX_SENSES, parseWordNet, selectEntries, shardEntries } from './wordnet.ts';

const escape = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

interface GenEntry {
  form: string;
  senses: WordSense[];
}

/** Serialises entries as WN-LMF XML, one synset per sense. */
function toLmf(entries: readonly GenEntry[]): string {
  let n = 0;
  const lexical: string[] = [];
  const synsets: string[] = [];
  for (const e of entries) {
    const senses = e.senses.map((s) => {
      const id = `oewn-${String(++n).padStart(8, '0')}-${s.pos}`;
      synsets.push(
        `    <Synset id="${id}" ili="i${n}" members="x" partOfSpeech="${s.pos}" lexfile="x">\n` +
          `      <Definition>${escape(s.gloss)}</Definition>\n` +
          `      <SynsetRelation relType="hypernym" target="oewn-1-n"/>\n` +
          (s.example !== undefined
            ? `      <Example>${escape(s.example)}</Example>\n      <Example>second</Example>\n`
            : '') +
          '    </Synset>',
      );
      return `      <Sense id="s${n}" synset="${id}"/>`;
    });
    lexical.push(
      `    <LexicalEntry id="oewn-e${n}">\n` +
        `      <Lemma writtenForm="${escape(e.form)}" partOfSpeech="n"/>\n` +
        `${senses.join('\n')}\n    </LexicalEntry>`,
    );
  }
  return `<?xml version="1.0"?>\n<LexicalResource>\n  <Lexicon id="oewn">\n${lexical.join('\n')}\n${synsets.join('\n')}\n  </Lexicon>\n</LexicalResource>\n`;
}

const text = fc.stringMatching(/^[A-Za-z0-9 ,.;'"&<>()-]{1,30}$/).map((s) => s.trim()).filter((s) => s !== '');
const sense: fc.Arbitrary<WordSense> = fc.record(
  {
    pos: fc.constantFrom<WordSense['pos']>('n', 'v', 'a', 's', 'r'),
    gloss: text,
    example: text,
  },
  { requiredKeys: ['pos', 'gloss'] },
);

const SOURCE: Source = {
  name: 'Open English WordNet test',
  url: 'https://example.org',
  licence: 'CC BY 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
  retrieved: '2026-01-01',
};

describe('parseWordNet', () => {
  it('interleaves senses of entries sharing a lemma', () => {
    const lex = parseWordNet(
      toLmf([
        { form: 'charge', senses: [{ pos: 'n', gloss: 'n1' }, { pos: 'n', gloss: 'n2' }] },
        { form: 'charge', senses: [{ pos: 'v', gloss: 'v1', example: 'charge it' }] },
        { form: 'Delta', senses: [{ pos: 'n', gloss: 'a low triangular area', example: 'the Nile delta' }] },
      ]),
    );
    expect(lex.get('charge')?.map((s) => s.gloss)).toEqual(['n1', 'v1', 'n2']);
    expect(lex.get('delta')).toEqual([
      { pos: 'n', gloss: 'a low triangular area', example: 'the Nile delta' },
    ]);
  });

  it('Property 6: parsing serialised LMF returns every lemma with its senses (Req 6.1, 6.3)', () => {
    const entries = fc.uniqueArray(
      fc.record({
        form: fc.stringMatching(/^[A-Za-z][A-Za-z' &-]{0,10}$/),
        senses: fc.array(sense, { minLength: 1, maxLength: 4 }),
      }),
      { selector: (e) => e.form.toLowerCase(), maxLength: 15 },
    );
    fc.assert(
      fc.property(entries, (list) => {
        const lex = parseWordNet(toLmf(list));
        expect(lex.size).toBe(list.length);
        for (const e of list) {
          expect(lex.get(e.form.toLowerCase())).toEqual(e.senses);
        }
      }),
    );
  });
});

describe('selectEntries and shardEntries', () => {
  it('Property 7: selection is exactly the known candidates of the tokens, capped and sharded (Req 6.2-6.4)', () => {
    const word = fc.stringMatching(/^[a-z]{1,8}$/);
    fc.assert(
      fc.property(
        fc.array(fc.array(word, { maxLength: 8 }).map((w) => w.join(' ')), { maxLength: 6 }),
        fc.dictionary(word, fc.array(sense, { minLength: 1, maxLength: 6 }), { maxKeys: 30 }),
        (texts, dict) => {
          const lexicon = new Map(Object.entries(dict));
          const tokens = texts.flatMap(tokenise);
          const selected = selectEntries(tokens, lexicon);
          const expected = new Set(
            tokens.flatMap(lemmaCandidates).filter((c) => lexicon.has(c)),
          );
          expect(new Set(selected.keys())).toEqual(expected);
          for (const [lemma, senses] of selected) {
            expect(senses.length).toBeLessThanOrEqual(MAX_SENSES);
            expect(senses).toEqual(lexicon.get(lemma)?.slice(0, MAX_SENSES));
          }
          for (const shard of shardEntries(selected, SOURCE)) {
            for (const lemma of Object.keys(shard.entries)) {
              expect(shardFor(lemma)).toBe(shard.shard);
            }
          }
        },
      ),
    );
  });

  it('finds "delta" from "Delta"', () => {
    const lexicon = new Map([['delta', [{ pos: 'n' as const, gloss: 'river mouth' }]]]);
    expect([...selectEntries(tokenise('the Niger Delta.'), lexicon).keys()]).toEqual(['delta']);
  });
});
