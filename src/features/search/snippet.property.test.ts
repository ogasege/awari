/** 22-review-3 Property 4 (Req 13): search snippets end cleanly, start at a word and carry no coordinates. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { snippetOf, withoutCoordinates } from './search.ts';

const COORD = /\d+\s*[°º]|\d+\.\d+\s*,\s*-?\d+\.\d+/;
const word = fc.stringMatching(/^[A-Za-z]{2,9}$/);
const sentence = fc.array(word, { minLength: 3, maxLength: 14 }).map((w) => `${w.join(' ')}.`);
const para = fc.array(sentence, { minLength: 1, maxLength: 12 }).map((s) => s.join(' '));

describe('search snippets (22-review-3 Property 4)', () => {
  it('never exceeds its length and ends at a full stop or with an ellipsis', () => {
    fc.assert(
      fc.property(para, word, (text, q) => {
        const s = snippetOf(text, q, 120);
        expect(s.length).toBeLessThanOrEqual(130);
        expect(/[.!?]$|…$/.test(s)).toBe(true);
      }),
    );
  });

  it('starts at the beginning of a word, never mid-word', () => {
    fc.assert(
      fc.property(para, word, (text, q) => {
        const s = snippetOf(text, q, 120).replace(/^… /, '');
        const first = s.split(' ')[0] ?? '';
        expect(text.split(/\s+/)).toContain(first.replace(/…$/, ''));
      }),
    );
  });

  it('removes coordinate strings', () => {
    expect(withoutCoordinates("Rhodes (approximate coordinates 36°27'04\"N, 28°13'40\"E) by Chares")).toBe('Rhodes by Chares');
    expect(withoutCoordinates('Mount Tambora (8°14’41”S, 117°59’35”E) is an active volcano.')).toBe('Mount Tambora is an active volcano.');
    expect(withoutCoordinates('Found at 34°39′N 135°30′E near the coast.')).not.toMatch(/°/);
  });

  it('is clean for every article summary in the packs', () => {
    for (const d of readdirSync('public/packs', { withFileTypes: true }).filter((x) => x.isDirectory())) {
      let items: Array<{ id: string; summary: string }> = [];
      try {
        items = (JSON.parse(readFileSync(join('public/packs', d.name, 'index.json'), 'utf8')) as { items: typeof items }).items ?? [];
      } catch {
        continue;
      }
      for (const i of items) {
        const s = snippetOf(i.summary ?? '', i.id, 140);
        expect(COORD.test(s), `${d.name}/${i.id}: ${s}`).toBe(false);
        expect(/[.!?:)"”’']$|…$/.test(s) || s === '', `${d.name}/${i.id}: ${s}`).toBe(true);
      }
    }
  });
});
