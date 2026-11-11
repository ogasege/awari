// @vitest-environment node
/** Tests for margin-note derivation. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { MAX_NOTES, NOTE_LIMIT, deriveNotes, noteFor } from './notes.ts';
import { articleText } from './text.ts';

describe('deriveNotes', () => {
  it('quotes short numeric sentences and skips the rest', () => {
    const notes = deriveNotes([
      {
        heading: '',
        paragraphs: [
          'Nigeria is a country in Africa. It became a republic in 1963.',
          'The country gained independence on 1 October 1960.',
          'Nigeria has the fourth biggest economy in Africa, as of 2024.',
          'Lagos has 15 million people.',
        ],
      },
    ]);
    expect(notes).toEqual([
      {
        kind: 'fact',
        text: 'The country gained independence on 1 October 1960!',
        proof: 'The country gained independence on 1 October 1960.',
      },
      {
        kind: 'fact',
        text: 'Nigeria has the fourth biggest economy in Africa, as of 2024!',
        proof: 'Nigeria has the fourth biggest economy in Africa, as of 2024.',
      },
    ]);
    expect(noteFor('About (12) people live here.')).toBeNull();
    expect(noteFor('There are 36 states in the country.')).toBeNull();
  });

  const sentence = fc
    .tuple(
      fc.constantFrom('The', 'Lagos', 'Rivers', 'It', 'There', 'A'),
      fc.array(fc.stringMatching(/^[a-z0-9,]{1,9}$/), { minLength: 1, maxLength: 12 }),
      fc.constantFrom('.', '!', '?', ''),
    )
    .map(([first, words, end]) => `${first} ${words.join(' ')}${end}`);
  const sections = fc.array(
    fc.record({
      heading: fc.constantFrom('', 'History', 'Geography'),
      paragraphs: fc.array(
        fc.array(sentence, { minLength: 1, maxLength: 4 }).map((s) => s.join(' ')),
        { minLength: 1, maxLength: 4 },
      ),
    }),
    { maxLength: 4 },
  );

  it('Property 9: notes are short, proved by an exact article sentence and quote it (Req 8.1-8.4)', () => {
    fc.assert(
      fc.property(sections, (secs) => {
        const notes = deriveNotes(secs);
        const text = articleText(secs);
        expect(notes.length).toBeLessThanOrEqual(MAX_NOTES);
        for (const note of notes) {
          expect(note.kind).toBe('fact');
          expect(note.text.length).toBeLessThan(NOTE_LIMIT);
          expect(note.proof).toBeDefined();
          expect(text.includes(note.proof ?? '\u0000')).toBe(true);
          expect(note.text).toBe(`${(note.proof ?? '').slice(0, -1)}!`);
          expect(note.proof).toMatch(/\d/);
        }
      }),
    );
  });
});
