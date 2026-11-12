// @vitest-environment node
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { UNSUITABLE_NOTE, deriveNotes, noteFor } from './notes.ts';

describe('margin notes stay suitable for 9 to 14 year olds', () => {
  it('drops a sentence about a killing, a war or a death, however numeric', () => {
    expect(noteFor('The largest elephant ever recorded was shot in Angola in 1974.')).toBeNull();
    expect(noteFor('About 2,000 people died in the war in 1912.')).toBeNull();
    expect(noteFor('The bridge was opened in 1932 by the mayor.')).toBe('The bridge was opened in 1932 by the mayor!');
  });

  it('property: no derived note ever contains an unsuitable word', () => {
    const word = fc.constantFrom('The', 'river', 'is', 'long', 'shot', 'died', 'in', '1974', 'war', 'tall', 'city', 'was', 'built');
    const sentence = fc.array(word, { minLength: 4, maxLength: 10 }).map((w) => `The ${w.join(' ')} 1990.`);
    fc.assert(
      fc.property(fc.array(sentence, { minLength: 1, maxLength: 8 }), (sentences) => {
        for (const n of deriveNotes([{ heading: '', paragraphs: [sentences.join(' ')] }])) {
          expect(UNSUITABLE_NOTE.test(n.text)).toBe(false);
        }
      }),
    );
  });
});
