/** 24-review-4 Req 1, Property 1: no caption is a file name, a catalogue number or another language. The strings are the owner's examples. */
import fc from 'fast-check';
import { afterEach, describe, expect, it } from 'vitest';
import { captionFor, useSources } from './caption.ts';
import { parseDecisions } from './overrides.ts';

afterEach(() => useSources(undefined));

/** Texts the owner saw as captions in the retaken screenshots (docs/review-4.md, item 1). */
const OWNER_EXAMPLES = [
  'British Museum.FotoThalerTamas',
  'Colosseum 1000689',
  'Colosseum-Entrance LII',
  'Coliseo medieval',
  '1402 The Tongue',
  'Sakyamuni, Lao Tzu, and Confucius - Google Art ProjectFXD',
  'Glimpse of the Eddington@Sundy event',
  'Raizal Biocultural Landscape of San Andrés $',
  'Ackerbau zur Selbstversorgung auf Guadalcanal, Salomonen',
  'Acceso a Abai',
  'Cahaya Pertama Menyinari Puncak',
  'Global hair texture map version translated into Spanish',
];

describe('review 4: captions', () => {
  it.each(OWNER_EXAMPLES)('"%s" is not a caption, from the description or from a structured label', (text) => {
    // Most of these are file names: a file name is not a source at all.
    useSources({ overrides: {}, labels: {} });
    expect(captionFor('', `File:${text}.jpg`)).toBeUndefined();
    // Whatever the description or the Commons label says, the text itself is refused.
    expect(captionFor(text, 'File:X.jpg')).toBeUndefined();
    useSources({ overrides: {}, labels: { 'File:X.jpg': text } });
    expect(captionFor('', 'File:X.jpg')).toBeUndefined();
  });

  it('a plain English description still makes a caption, and a structured caption is the second source', () => {
    useSources({ overrides: {}, labels: { 'File:Y.jpg': 'The Colosseum at dusk' } });
    expect(captionFor('The Colosseum in Rome at sunset', 'File:Y.jpg')).toEqual({ text: 'The Colosseum in Rome at sunset', source: 'description' });
    expect(captionFor('', 'File:Y.jpg')).toEqual({ text: 'The Colosseum at dusk', source: 'structured' });
  });

  it('a hand-checked override replaces the caption, and null drops the picture', () => {
    useSources({ overrides: { 'File:A.jpg': 'The Great Mosque of Djenné', 'File:B.jpg': null }, labels: {} });
    expect(captionFor('IMG 1234', 'File:A.jpg')).toEqual({ text: 'The Great Mosque of Djenné', source: 'override' });
    expect(captionFor('A nice view of the lake at dawn', 'File:B.jpg')).toBeUndefined();
  });

  it('fragments, credits, bare dates and frame numbers are not captions', () => {
    for (const t of ['S. Marine Corps on parade', 'By Elisa Schorn', 'JUNE 11, 2001', 'Nan Madol megalithic site, Pohnpei (Micronesia) 13', 'Winter in Mongolia18', 'Pic by Neil Palmer (CIAT)', '(taken from national highway between Jakar and Ura)']) {
      expect(captionFor(t, 'File:Z.jpg'), t).toBeUndefined();
    }
  });

  it('an abbreviation ends no sentence: "c." and initials stay inside the caption', () => {
    expect(captionFor('The Chandos portrait, likely depicting Shakespeare, c. 1610. It hangs in London.', 'File:W.jpg')?.text).toBe('The Chandos portrait, likely depicting Shakespeare, c. 1610');
  });

  it('no caption from any description or label is a file name (property)', () => {
    useSources({ overrides: {}, labels: {} });
    const word = fc.stringMatching(/^[A-Za-z]{2,9}$/);
    const name = fc.array(word, { minLength: 1, maxLength: 6 }).map((w) => w.join(' '));
    fc.assert(
      fc.property(name, (n) => {
        // A file title with an empty description yields nothing, however name-like the title is.
        expect(captionFor('', `File:${n}.jpg`)).toBeUndefined();
      }),
      { numRuns: 200 },
    );
  });

  it('decision lines are parsed', () => {
    expect(parseDecisions('drop|Bank DNA\nset|thunder|=>A thunder storm\n')).toEqual([
      { action: 'drop', prefix: 'Bank DNA' },
      { action: 'set', prefix: 'thunder', to: 'A thunder storm' },
    ]);
  });
});
