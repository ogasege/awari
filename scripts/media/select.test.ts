/** 23-media-library Property 5 (Req 6-8): `select` never returns a file it must not. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { parseLicence } from './allow.ts';
import { MAX_PER_ARTICLE, MIN_SIDE, commonsTitle, hostedOnCommons, kindOf, mentions, subjectOf, termsFor, rejectReason, score, selectForArticle, stemOf, type Candidate } from './select.ts';

const good: Candidate = {
  title: 'File:Mount Kenya at dawn.jpg',
  width: 3000,
  height: 2000,
  mime: 'image/jpeg',
  licence: 'CC BY-SA 4.0',
  author: 'Jane Doe',
  restrictions: '',
  repository: 'local',
  from: 'category',
  description: 'The peaks of Mount Kenya at dawn',
  categories: ['Mount Kenya'],
};

const candidate: fc.Arbitrary<Candidate> = fc.record({
  title: fc.stringMatching(/^File:[A-Za-z ]{3,20}\.jpg$/),
  width: fc.integer({ min: 200, max: 6000 }),
  height: fc.integer({ min: 200, max: 6000 }),
  mime: fc.constantFrom('image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp', 'application/pdf'),
  licence: fc.constantFrom('CC BY-SA 4.0', 'CC BY 2.0', 'Public domain', 'CC0', 'CC BY-NC 4.0', 'CC BY-ND 2.0', 'GFDL', 'Fair use', ''),
  author: fc.constantFrom('Jane Doe', '', 'Someone'),
  restrictions: fc.constantFrom('', '', '', 'personality', 'trademarked'),
  repository: fc.constantFrom('shared', 'local', 'enwiki', 'foreign'),
  from: fc.constantFrom<'article' | 'category'>('article', 'category'),
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
          expect(hostedOnCommons(c.repository, c.from)).toBe(true);
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
    const mk = (n: number, extra: Partial<Candidate> = {}): Candidate => ({ ...good, title: `File:Pic ${n}.jpg`, description: `A view of Mount Kenya, number ${n}`, ...extra });
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
    const arms: Candidate = { ...good, title: 'File:Coat of arms of Kenya.png', description: 'The coat of arms of Kenya', categories: ['Coats of arms'], width: 3000, height: 3000, mime: 'image/png' };
    const chosen = selectForArticle([arms, { ...good, title: 'File:Lake.jpg', description: 'A blue lake in the hills' }]);
    expect(kindOf(chosen[0] as Candidate)).not.toBe('emblem');
  });

  it('returns fewer than four when the article has fewer allowed pictures, never padding with rejected ones', () => {
    const chosen = selectForArticle([good, { ...good, title: 'File:Small.jpg', width: 400, height: 300 }]);
    expect(chosen).toHaveLength(1);
  });

  it('keeps at most two pictures of one series and prefers pictures used in the article', () => {
    const series = Array.from({ length: 6 }, (_, i): Candidate => ({ ...good, title: `File:A horse rider at the carnival 0${i}.jpg`, description: `A horse rider at the carnival, shot ${i}`, from: 'category' }));
    const other: Candidate = { ...good, title: 'File:Lake at dawn.jpg', description: 'A lake at dawn', repository: 'shared', from: 'article' };
    const chosen = selectForArticle([...series, other]);
    expect(chosen.filter((c) => stemOf(c.title) === stemOf(series[0]?.title ?? '')).length).toBeLessThanOrEqual(2);
    expect(chosen[0]?.title).toBe('File:Lake at dawn.jpg');
    expect(stemOf('File:Fuji, assorted - FujiAssorted6854.jpg')).toBe(stemOf('File:Fuji, assorted - FujiAssorted6859.jpg'));
  });

  it('rejects anatomical, hunting and surgical pictures', () => {
    for (const t of ['File:Penis asiatischer Elefant.JPG', 'File:Field dressing a deer 2.jpg', 'File:Open heart surgery.jpg', 'File:Roadkill fox.jpg']) {
      expect(rejectReason({ ...good, title: t }), t).toBeDefined();
    }
  });

  it('keeps blood vessels and blood cells for the body pack, and still rejects blood stains', () => {
    expect(rejectReason({ ...good, title: 'File:Blood vessel diagram.jpg' })).toBeUndefined();
    expect(rejectReason({ ...good, title: 'File:Red blood cells.jpg' })).toBeUndefined();
    expect(rejectReason({ ...good, title: 'File:Blood stain on a floor.jpg' })).toBeDefined();
  });

  it('rejects an attribution licence with no author, but not a public-domain file without one', () => {
    expect(rejectReason({ ...good, author: '' })).toBeDefined();
    expect(rejectReason({ ...good, licence: 'Public domain', author: '' })).toBeUndefined();
    expect(commonsTitle('Archivo:Vasodilation.jpg')).toBe('File:Vasodilation.jpg');
    expect(commonsTitle('Datei:Blutgefäße (1).jpg')).toBe('File:Blutgefäße (1).jpg');
    expect(commonsTitle('File:Lake.jpg')).toBe('File:Lake.jpg');
  });

  it('treats a file local to a Wikipedia as not on Commons, but a local Commons file as on Commons', () => {
    expect(rejectReason({ ...good, repository: 'local', from: 'article' })).toBeDefined();
    expect(rejectReason({ ...good, repository: 'shared', from: 'article' })).toBeUndefined();
    expect(rejectReason({ ...good, repository: 'local', from: 'category' })).toBeUndefined();
  });

  // The defects the licence auditor showed in its 5% sample (docs/kiro-evidence/crew/media-audit-review.md).
  it('G1: "photograph" in a category does not make a photo a diagram, but a real diagram is one', () => {
    const photo = { title: 'File:Nassau traffic policeman.jpg', categories: ['Photographs by Jay Jarosz', 'Featured photographs in the public domain'], description: 'A policeman' };
    expect(kindOf(photo)).toBe('photo');
    expect(kindOf({ title: 'File:Heart diagram.png', categories: [], description: '' })).toBe('diagram');
    expect(kindOf({ title: 'File:Uninsured population chart.png', categories: ['Charts of the United States'], description: '' })).toBe('diagram');
  });

  it('G2: a "flags" category does not make a palace or a climber a flag', () => {
    expect(kindOf({ title: 'File:Presidential palace Bissau.jpg', categories: ['Buildings with flags in Guinea-Bissau'], description: '' })).toBe('photo');
    expect(kindOf({ title: 'File:Everest summit.jpg', categories: ['Photographs of the national flag of the Dominican Republic'], description: '' })).toBe('photo');
    expect(kindOf({ title: 'File:Flag of Kenya.svg.png', categories: [], description: '' })).toBe('flag');
  });

  it('G3: a title page, a sequence of images and a panel figure are not pictures to show', () => {
    expect(rejectReason({ ...good, title: 'File:GreenEssay.png', description: 'An Essay on the Application of Mathematical Analysis to the Theories of Electricity. Title page' })).toBeDefined();
    expect(rejectReason({ ...good, description: 'This sequence of Hubble Space Telescope images shows Neptune' })).toBeDefined();
    expect(rejectReason({ ...good, description: 'Left: a large mass. Right: a small mass' })).toBeDefined();
  });

  it('a picture with no honest caption (nothing in the description, a file name of camera codes) is not used', () => {
    expect(rejectReason({ ...good, title: 'File:DSC_0042.jpg', description: '' })).toBeDefined();
    expect(rejectReason({ ...good, title: 'File:Lake Victoria at dawn.jpg', description: '' })).toBeUndefined();
  });

  it('keeps one of two files with the same sha1', () => {
    const a: Candidate = { ...good, title: 'File:Lake Victoria at dawn.jpg', sha1: 'abc' };
    const b: Candidate = { ...good, title: 'File:Lake Victoria at dawn (copy).jpg', sha1: 'abc' };
    expect(selectForArticle([a, b])).toHaveLength(1);
  });

  // The design reviewer's 200-picture sample (docs/kiro-evidence/crew/media-design-review.md): 124 had a problem.
  describe('relevance and suitability (design review)', () => {
    const turing = subjectOf({ pack: 'people', title: 'Alan Turing' }, { enTitle: 'Alan Turing', category: 'Alan Turing' });

    it('a picture found through the article must show a sign of the subject (the Matterhorn is not Mount Aso)', () => {
      const aso = subjectOf({ pack: 'earth', title: 'Mount Aso' }, { enTitle: 'Mount Aso', category: 'Mount Aso' });
      const matterhorn: Candidate = { ...good, repository: 'shared', from: 'article', title: 'File:Matterhorn from Zermatt.jpg', description: 'The Matterhorn above Zermatt in Switzerland', categories: ['Matterhorn'] };
      expect(rejectReason(matterhorn, aso)).toMatch(/no sign/);
      expect(rejectReason({ ...matterhorn, title: 'File:Mount Aso crater.jpg', description: 'The crater of Mount Aso in Kyushu', categories: ['Mount Aso'] }, aso)).toBeUndefined();
      // Outside the countries a category member must show the sign too; a country's own category is trusted.
      expect(rejectReason({ ...matterhorn, from: 'category' }, aso)).toMatch(/no sign/);
      expect(rejectReason({ ...matterhorn, from: 'category' }, { pack: 'countries', terms: ['kenya'] })).toBeUndefined();
      // A Featured picture is not asked for the sign.
      expect(rejectReason({ ...matterhorn, categories: ['Featured pictures'] }, aso)).toBeUndefined();
      expect(rejectReason({ ...good, repository: 'shared', from: 'article', title: 'File:Teddy bear.jpg', description: 'A small brown teddy bear on a shelf' }, turing)).toMatch(/no sign/);
    });

    it('terms: general words do not count, long words match by prefix', () => {
      expect(termsFor('Mount Everest', 'Mount Everest')).toEqual(['everest']);
      expect(termsFor('United States')).toEqual([]);
      expect(mentions('Static electricity at work', ['electric'])).toBe(true);
      expect(mentions('Cattle in a field', ['cat'])).toBe(false);
    });

    it('flags and emblems only for countries, diagrams only when recognised', () => {
      const flag = { ...good, repository: 'shared' as const, title: 'File:Flag of Kenya.png', description: 'The flag of Kenya flying' };
      expect(rejectReason(flag, { pack: 'wildlife', terms: [] })).toMatch(/flag/);
      expect(rejectReason(flag, { pack: 'countries', terms: [] })).toBeUndefined();
      const diagram = { ...good, title: 'File:Heart diagram.png', description: 'A diagram of the heart chambers' };
      expect(rejectReason(diagram, { pack: 'body', terms: [] })).toMatch(/diagram/);
      expect(rejectReason({ ...diagram, categories: ['Quality images'] }, { pack: 'body', terms: [] })).toBeUndefined();
    });

    it('rejects caricature, specimens, war machines, wax figures, renders, research figures and toys', () => {
      for (const d of ['A boat with Zwarte Piet figures', 'A brain in a specimen jar', 'A navy warship at sea', 'A waxwork at Madame Tussauds', 'A Blender render of Earth', 'A bathymetry colour map of the gulf', 'A wooden toy train']) {
        expect(rejectReason({ ...good, description: d }), d).toBeDefined();
      }
    });

    it('rejects captions that are only a photographer and a year, or accented text with no English in it', () => {
      expect(rejectReason({ ...good, title: 'File:DSC_0042.jpg', description: 'Morgan Sessions 2015' })).toBeDefined();
      expect(rejectReason({ ...good, title: 'File:Un jeune garçon.jpg', description: 'Un jeune garçon qui ramène sa pirogue' })).toBeDefined();
    });

    it('two pictures with the same caption in one article are one picture twice', () => {
      const a: Candidate = { ...good, title: 'File:Westerlund 1 a.jpg', description: 'The star cluster Westerlund 1', sha1: '1' };
      const b: Candidate = { ...good, title: 'File:Westerlund 1 b.jpg', description: 'The star cluster Westerlund 1', sha1: '2' };
      expect(selectForArticle([a, b])).toHaveLength(1);
    });
  });
});
