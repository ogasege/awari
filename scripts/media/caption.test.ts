/** 23-media-library Property 4 (Req 13): captions are traceable shortenings of Commons text. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { captionFor, englishPart, isTraceable, nameFromTitle, shorten } from './caption.ts';

describe('captions', () => {
  it('uses the first sentence of a good description', () => {
    const c = captionFor('The Colosseum in Rome at sunset. Taken from the Palatine Hill in July.', 'File:Colosseum.jpg', 'Colosseum');
    expect(c).toEqual({ text: 'The Colosseum in Rome at sunset', source: 'description' });
  });

  it('takes the English part of a multilingual description', () => {
    expect(englishPart('English: A red panda in a tree. Deutsch: Ein Roter Panda auf einem Baum.')).toBe('A red panda in a tree.');
  });

  it('falls back to the file name, then to the article title, never to invented words', () => {
    expect(captionFor('', 'File:Mount Kenya at dawn (27758444591).jpg', 'Kenya')).toEqual({ text: 'Mount Kenya at dawn', source: 'title' });
    expect(captionFor('IMG_2043', 'File:DSC_0042.jpg', 'Kenya')).toEqual({ text: 'Kenya', source: 'article' });
    expect(captionFor('Photo by John, uploaded from https://x.org', 'File:DSC_0042.jpg', 'Kenya').source).toBe('article');
  });

  it('cuts a long text at a word with an ellipsis, never mid-word, and within the limit', () => {
    const long = 'A very long description that goes on and on about a mountain and its many slopes and valleys and rivers and forests';
    const s = shorten(long, 60);
    expect(s.length).toBeLessThanOrEqual(61);
    expect(s.endsWith('…')).toBe(true);
    expect(long.startsWith(s.slice(0, -1))).toBe(true);
    expect(long[s.length - 1]).toBeDefined();
    expect(long.slice(s.length - 1, s.length)).toBe(' ');
  });

  it('every caption is traceable to the description, the file title or the article title (property)', () => {
    const word = fc.stringMatching(/^[A-Za-z]{2,9}$/);
    const text = fc.array(word, { minLength: 0, maxLength: 30 }).map((w) => w.join(' '));
    fc.assert(
      fc.property(text, text, word, (description, titleWords, article) => {
        const title = `File:${titleWords || 'x'}.jpg`;
        const c = captionFor(description, title, article);
        expect(isTraceable(c, description, title, article)).toBe(true);
        expect(c.text.length).toBeLessThanOrEqual(100);
      }),
      { numRuns: 300 },
    );
  });

  it('refuses a name made of camera codes and numbers', () => {
    expect(nameFromTitle('File:DSC_0042.jpg')).toBe('');
    expect(nameFromTitle('File:20230101 123456.jpg')).toBe('');
    expect(nameFromTitle('File:Lake Victoria at dawn 2.jpg')).toBe('Lake Victoria at dawn');
  });

  it('takes boilerplate off the front and refuses key-value metadata', () => {
    expect(captionFor('This is a photo of a monument in Mexico City.', 'File:X.jpg', 'Mexico').text).toBe('A monument in Mexico City');
    expect(captionFor('Photo of the place of the Persian Gate', 'File:X.jpg', 'Iran').text).toBe('The place of the Persian Gate');
    expect(captionFor('object type: portrait statue - description: Head of Hatshepsut', 'File:X.jpg', 'Egypt').text).toBe('Head of Hatshepsut');
    expect(captionFor('object type: portrait statue', 'File:Bust of Hatshepsut.jpg', 'Egypt')).toEqual({ text: 'Bust of Hatshepsut', source: 'title' });
  });

  it('does not use metadata or non-English descriptions as captions', () => {
    expect(captionFor('Version 8.25 from the Textbook OpenStax Anatomy and Physiology Published May 18, 2016', 'File:Heart diagram.jpg', 'Heart').source).toBe('title');
    expect(captionFor('Royal Regalie, Museum der Präsente anlässlich der Inthronisierung des Sultans', 'File:Sultan regalia.jpg', 'Oman').source).toBe('title');
    expect(captionFor('A lion resting in the shade of a tree', 'File:Lion.jpg', 'Lion').source).toBe('description');
  });
});
