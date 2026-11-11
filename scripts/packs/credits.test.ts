// @vitest-environment node
/** Tests for the CREDITS.md pack region. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { uncreditedFiles } from '../lib/rules.ts';
import { MARK_BEGIN, MARK_END, renderCredits, replaceRegion } from './credits.ts';

const photo = {
  path: 'packs/img/nigeria.jpg',
  subject: 'Nigeria',
  photo: {
    file: 'img/nigeria.jpg',
    width: 800,
    height: 533,
    alt: 'Zuma Rock',
    caption: 'Zuma Rock',
    credit: {
      name: 'Wikimedia Commons: Zuma Rock.jpg',
      url: 'https://commons.wikimedia.org/wiki/File:Zuma_Rock.jpg',
      licence: 'CC BY-SA 4.0' as const,
      licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      author: 'A | B',
      retrieved: '2026-11-11',
    },
  },
};

describe('replaceRegion', () => {
  it('appends markers once and then rewrites only the region', () => {
    const start = '# Credits\n\nFonts.\n';
    const first = replaceRegion(start, 'one');
    expect(first).toBe(`# Credits\n\nFonts.\n\n${MARK_BEGIN}\none\n${MARK_END}\n`);
    const withTail = `${first}\n## After\n`;
    expect(replaceRegion(withTail, 'two')).toBe(
      `# Credits\n\nFonts.\n\n${MARK_BEGIN}\ntwo\n${MARK_END}\n\n## After\n`,
    );
    expect(() => replaceRegion(`a ${MARK_BEGIN} b`, 'x')).toThrow();
  });

  const free = fc.string({ maxLength: 40 }).filter((s) => !s.includes('<!--'));

  it('Property 10: text outside the markers never changes and rewriting is idempotent (Req 9.2)', () => {
    fc.assert(
      fc.property(free, free, free, free, (before, inside, after, region) => {
        const text = `${before}${MARK_BEGIN}${inside}${MARK_END}${after}`;
        const out = replaceRegion(text, region);
        expect(out.startsWith(`${before}${MARK_BEGIN}`)).toBe(true);
        expect(out.endsWith(`${MARK_END}${after}`)).toBe(true);
        expect(replaceRegion(out, region)).toBe(out);
        const appended = replaceRegion(before, region);
        expect(appended.startsWith(before)).toBe(true);
        expect(appended).toContain(MARK_BEGIN);
        expect(replaceRegion(appended, region)).toBe(appended);
      }),
    );
  });
});

describe('renderCredits', () => {
  it('credits every pack file and photo for npm run credits (Req 9.3, 9.5)', () => {
    const text = renderCredits([photo], '2026-11-11');
    expect(text).toContain('| packs/img/nigeria.jpg | Nigeria | A \\| B | CC BY-SA 4.0 |');
    const files = [
      'packs/countries/nigeria.json',
      'packs/countries/index.json',
      'packs/countries/facts.json',
      'packs/physics/ohms-law.json',
      'packs/dictionary/d.json',
      'packs/atlas/countries.json',
      'packs/manifest.json',
      'packs/img/nigeria.jpg',
    ];
    expect(uncreditedFiles(files, text)).toEqual([]);
    expect(uncreditedFiles(['packs/img/ghana.jpg'], text)).toEqual(['packs/img/ghana.jpg']);
  });
});
