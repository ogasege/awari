/** 23-media-library Property 5 (Req 6-8): `select` never returns a file it must not. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { parseLicence } from './allow.ts';
import { MAX_PER_ARTICLE, MIN_SIDE, kindOf, rejectReason, score, selectForArticle, type Candidate } from './select.ts';

const good: Candidate = {
  title: 'File:Mount Kenya at dawn.jpg',
  width: 3000,
  height: 2000,
  mime: 'image/jpeg',
  licence: 'CC BY-SA 4.0',
  restrictions: '',
  repository: 'local',
  description: 'The peaks of Mount Kenya at dawn',
  categories: ['Mount Kenya'],
};

const candidate: fc.Arbitrary<Candidate> = fc.record({
  title: fc.stringMatching(/^File:[A-Za-z ]{3,20}\.jpg$/),
  width: fc.integer({ min: 200, max: 6000 }),
  height: fc.integer({ min: 200, max: 6000 }),
  mime: fc.constantFrom('image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp', 'application/pdf'),
  licence: fc.constantFrom('CC BY-SA 4.0', 'CC BY 2.0', 'Public domain', 'CC0', 'CC BY-NC 4.0', 'CC BY-ND 2.0', 'GFDL', 'Fair use', ''),
  restrictions: fc.constantFrom('', '', '', 'personality', 'trademarked'),
  repository: fc.constantFrom('shared', 'local', 'enwiki', 'foreign'),
  description: fc.constantFrom('A view', 'A soldier with a gun', 'A collage of photos', 'The company logo', 'Children playing'),
  categories: fc.array(fc.constantFrom('Featured pictures', 'Quality images', 'Valued images', 'Maps', 'Flags', 'Portraits', 'Landscapes'), { maxLength: 3 }),
});

describe('rejectReason (Req 6-8)', () => {
  it('accepts a plain, allowed, large, unrestricted picture', () => {
    expect(rejectReason(good)).toBeUndefined();
  });

  it('rejects each named defect', () => {
    expect(rejectReason({ ...good, repository: 'enwiki' })).toBeDefined();
    expect(rejectReason({ ...good, licence: 'CC BY-NC 4.0' })).toBeDefined();
    expect(rejectReason({ ...good, licence: 'CC BY-ND 2.0' })).toBeDefined();
    expect(rejectReason({ ...good, restrictions: 'personality' })).toBeDefined();
    expect(rejectReason({ ...good, width: 700, height: 500 })).toBeDefined();
    expect(rejectReason({ ...good, mime: 'image/svg+xml' })).toBeDefined();
    expect(rejectReason({ ...good, title: 'File:Company logo.png' })).toBeDefined();
    expect(rejectReason({ ...good, description: 'A collage of four photos' })).toBeDefined();
    expect(rejectReason({ ...good, description: 'A soldier holding a gun' })).toBeDefined();
    expect(rejectReason({ ...good, description: 'a graphic nude painting' })).toBeDefined();
  });

  it('keeps an 800 px long side and drops 799', () => {
    expect(rejectReason({ ...good, width: MIN_SIDE, height: 400 })).toBeUndefined();
    expect(rejectReason({ ...good, width: MIN_SIDE - 1, height: 400 })).toBeDefined();
  });
});

describe('selectForArticle (Property 5)', () => {
  it('never returns a restricted, NC/ND, non-Commons or under-800 px file, and never more than twelve (property)', () => {
    fc.assert(
      fc.property(fc.array(candidate, { maxLength: 40 }), (list) => {
        const chosen = selectForArticle(list);
        expect(chosen.length).toBeLessThanOrEqual(MAX_PER_ARTICLE);
        for (const c of chosen) {
          expect(c.restrictions.trim()).toBe('');
          expect(['shared', 'local']).toContain(c.repository);
          expect(Math.max(c.width, c.height)).toBeGreaterThanOrEqual(MIN_SIDE);
          expect(parseLicence(c.licence)).toBeDefined();
          expect(rejectReason(c)).toBeUndefined();
        }
        expect(new Set(chosen.map((c) => c.title)).size).toBe(chosen.length);
      }),
      { numRuns: 200 },
    );
  });

  it('puts Featured pictures first and spreads over kinds', () => {
    const mk = (n: number, extra: Partial<Candidate> = {}): Candidate => ({ ...good, title: `File:Pic ${n}.jpg`, ...extra });
    const list = [
      mk(1),
      mk(2, { categories: ['Featured pictures of Kenya'] }),
      mk(3, { title: 'File:Map of Kenya.png', categories: ['Maps of Kenya'] }),
      mk(4, { title: 'File:Flag of Kenya.jpg', categories: ['Flags of Kenya'] }),
      mk(5),
      mk(6),
    ];
    const chosen = selectForArticle(list);
    expect(chosen[0]?.title).toBe('File:Pic 2.jpg');
    const kinds = new Set(chosen.map(kindOf));
    expect(kinds.has('map') && kinds.has('flag') && kinds.has('photo')).toBe(true);
    expect(score(list[1] as Candidate)).toBeGreaterThan(score(list[0] as Candidate));
  });

  it('never leads with a coat of arms', () => {
    const arms: Candidate = { ...good, title: 'File:Coat of arms of Kenya.png', categories: ['Coats of arms'], width: 3000, height: 3000, mime: 'image/png' };
    const chosen = selectForArticle([arms, { ...good, title: 'File:Lake.jpg' }]);
    expect(kindOf(chosen[0] as Candidate)).not.toBe('emblem');
  });

  it('returns fewer than four when the article has fewer allowed pictures, never padding with rejected ones', () => {
    const chosen = selectForArticle([good, { ...good, title: 'File:Small.jpg', width: 400, height: 300 }]);
    expect(chosen).toHaveLength(1);
  });
});
