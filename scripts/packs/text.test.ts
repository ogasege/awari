// @vitest-environment node
/** Tests for slugs, section splitting, sentences and summaries. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { slugify, stripParenthetical } from './slug.ts';
import {
  DROPPED_HEADINGS,
  collapseSpaces,
  splitSections,
  splitSentences,
  summarise,
} from './text.ts';

const SAMPLE = [
  'Nigeria is a country in Africa. ',
  'The capital city is Abuja.',
  '',
  '',
  '== History ==',
  'From 1901 to 1960, the United Kingdom ruled Nigeria.',
  '',
  '=== Independence ===',
  'The country gained independence on 1 October 1960.',
  '== Geography ==',
  '=== Rivers ===',
  'The Niger  and the Benue meet at Lokoja.',
  'I=VRorV=IR.',
  '== Related pages ==',
  'List of countries',
  '=== Lists ===',
  'More lists',
  '== References ==',
  '',
].join('\n');

describe('slugify', () => {
  it('follows the documented rule', () => {
    expect(slugify("Côte d'Ivoire")).toBe('cote-divoire');
    expect(slugify('South Africa')).toBe('south-africa');
    expect(slugify('Georgia (country)')).toBe('georgia');
    expect(slugify("Ohm's law")).toBe('ohms-law');
    expect(slugify('São Tomé and Príncipe')).toBe('sao-tome-and-principe');
    expect(slugify('Guinea-Bissau')).toBe('guinea-bissau');
    expect(stripParenthetical('Insulator (electricity)')).toBe('Insulator');
  });

  it('Property 2: slugs are hyphen-joined [a-z0-9] runs and idempotent (Req 2.3)', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'grapheme', maxLength: 40 }), (s) => {
        const slug = slugify(s);
        expect(slug).toMatch(/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/);
        expect(slugify(slug)).toBe(slug);
      }),
    );
  });
});

describe('splitSections', () => {
  it('splits at headings and drops back matter', () => {
    const sections = splitSections(SAMPLE);
    expect(sections.map((s) => s.heading)).toEqual([
      '',
      'History',
      'Independence',
      'Rivers',
    ]);
    expect(sections[0]?.paragraphs).toEqual([
      'Nigeria is a country in Africa.',
      'The capital city is Abuja.',
    ]);
    expect(sections[3]?.paragraphs).toEqual([
      'The Niger and the Benue meet at Lokoja.',
    ]);
  });

  const line = fc.oneof(
    fc.string({ maxLength: 30 }),
    fc
      .tuple(
        fc.constantFrom('==', '===', '===='),
        fc.oneof(
          fc.constantFrom(...DROPPED_HEADINGS, 'History', 'Geography'),
          fc.string({ minLength: 1, maxLength: 12 }),
        ),
      )
      .map(([eq, h]) => `${eq} ${h} ${eq}`),
  );

  it('Property 1: sections are clean, non-empty and drawn from the input in order (Req 2.5, 2.6)', () => {
    fc.assert(
      fc.property(fc.array(line, { maxLength: 30 }), (lines) => {
        const extract = lines.join('\n');
        const sections = splitSections(extract);
        const collapsedInput = lines.map(collapseSpaces);
        let cursor = 0;
        for (const s of sections) {
          expect(DROPPED_HEADINGS.has(s.heading.toLowerCase())).toBe(false);
          expect(s.paragraphs.length).toBeGreaterThan(0);
          for (const p of s.paragraphs) {
            expect(p).not.toBe('');
            expect(p).toBe(p.trim());
            const at = collapsedInput.indexOf(p, cursor);
            expect(at).toBeGreaterThanOrEqual(cursor);
            cursor = at + 1;
          }
        }
      }),
    );
  });
});

describe('splitSentences and summarise', () => {
  it('splits sentences but not abbreviations', () => {
    expect(
      splitSentences('Dr. Ada met J. Smith in the U.S. Army. It was 1960. Done!'),
    ).toEqual(['Dr. Ada met J. Smith in the U.S. Army.', 'It was 1960.', 'Done!']);
  });

  it('returns substrings of the paragraph', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 80 }), (p) => {
        for (const s of splitSentences(p)) {
          expect(p.includes(s)).toBe(true);
        }
      }),
    );
  });

  it('summarises with one or two lead sentences', () => {
    const sections = splitSections(SAMPLE);
    expect(summarise(sections)).toBe('Nigeria is a country in Africa.');
    expect(
      summarise([{ heading: '', paragraphs: ['One. Two. Three.'] }]),
    ).toBe('One. Two.');
    const long = summarise([{ heading: '', paragraphs: ['word '.repeat(100)] }], 50);
    expect(long.length).toBeLessThanOrEqual(50);
  });
});
