import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  lemmaCandidates,
  normaliseWord,
  shardFor,
  tokenise,
} from './lemmatize.ts';

const word = fc.stringMatching(/^[a-z]{1,12}$/);

describe('lemmatiser', () => {
  it('finds base forms of common inflections', () => {
    expect(lemmaCandidates('Deltas')).toContain('delta');
    expect(lemmaCandidates('rivers')).toContain('river');
    expect(lemmaCandidates('countries')).toContain('country');
    expect(lemmaCandidates('running')).toContain('run');
    expect(lemmaCandidates('charged')).toContain('charge');
    expect(lemmaCandidates('Nigeria’s')).toEqual(['nigeria']);
  });

  it('Property 1: the normalised word is always the first candidate', () => {
    fc.assert(
      fc.property(word, (w) => {
        expect(lemmaCandidates(w)[0]).toBe(w);
      }),
    );
  });

  it('Property 2: candidates are unique, non-empty and lowercase', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const c = lemmaCandidates(s);
        expect(new Set(c).size).toBe(c.length);
        for (const w of c) {
          expect(w.length).toBeGreaterThan(0);
          expect(w).toBe(w.toLowerCase());
        }
      }),
    );
  });

  it('Property 3: case and surrounding punctuation never change lookup', () => {
    fc.assert(
      fc.property(word, fc.constantFrom('', '.', ',', '!', '"'), (w, p) => {
        expect(lemmaCandidates(`${p}${w.toUpperCase()}${p}`)).toEqual(
          lemmaCandidates(w),
        );
      }),
    );
  });

  it('Property 4: tokens rebuilt from tokenise are words of the text', () => {
    fc.assert(
      fc.property(fc.array(word, { minLength: 1, maxLength: 10 }), (ws) => {
        expect(tokenise(ws.join(', '))).toEqual(ws);
      }),
    );
  });

  it('Property 5: every lemma maps to exactly one shard', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const shard = shardFor(normaliseWord(s));
        expect(/^([a-z]|other)$/.test(shard)).toBe(true);
      }),
    );
  });
});
