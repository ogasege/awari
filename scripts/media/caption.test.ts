/** 23-media-library Property 4 (Req 13): captions are traceable shortenings of Commons text, and every audit defect stays fixed. */
import fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { captionFor, englishPart, hasCaption, isTraceable, nameFromTitle, shorten, useSources } from './caption.ts';

// These rules are tested on their own, without the hand-checked overrides and structured captions of the real library.
beforeEach(() => useSources({ overrides: {}, labels: {} }));
afterEach(() => useSources(undefined));

const text = (d: string, t = 'File:X.jpg') => captionFor(d, t)?.text;

describe('captions', () => {
  it('uses the first sentence of a good description', () => {
    expect(captionFor('The Colosseum in Rome at sunset. Taken from the Palatine Hill in July.', 'File:Colosseum.jpg')).toEqual({ text: 'The Colosseum in Rome at sunset', source: 'description' });
  });

  it('takes the English part of a multilingual description', () => {
    expect(englishPart('English: A red panda in a tree. Deutsch: Ein Roter Panda auf einem Baum.')).toBe('A red panda in a tree.');
  });

  it('never falls back to the file name or the article title', () => {
    expect(captionFor('', 'File:Mount Kenya at dawn (27758444591).jpg')).toBeUndefined();
    expect(captionFor('IMG_2043', 'File:DSC_0042.jpg')).toBeUndefined();
    expect(captionFor('Photo by John, uploaded from https://x.org', 'File:DSC_0042.jpg')).toBeUndefined();
    expect(hasCaption('', 'File:20230101 123456.jpg')).toBe(false);
  });

  it('cuts a long text at a word with an ellipsis, never mid-word, and within the limit', () => {
    const long = 'A very long description that goes on and on about a mountain and its many slopes and valleys and rivers and forests';
    const s = shorten(long, 60);
    expect(s.length).toBeLessThanOrEqual(61);
    expect(s.endsWith('…')).toBe(true);
    expect(long.startsWith(s.slice(0, -1))).toBe(true);
    expect(long.slice(s.length - 1, s.length)).toBe(' ');
  });

  it('every caption is traceable to the description or the file title (property)', () => {
    const word = fc.stringMatching(/^[A-Za-z]{2,9}$/);
    const words = fc.array(word, { minLength: 0, maxLength: 30 }).map((w) => w.join(' '));
    fc.assert(
      fc.property(words, words, (description, titleWords) => {
        const title = `File:${titleWords || 'x'}.jpg`;
        const c = captionFor(description, title);
        if (c) {
          expect(isTraceable(c, description, title)).toBe(true);
          expect(c.text.length).toBeLessThanOrEqual(100);
        }
      }),
      { numRuns: 300 },
    );
  });

  it('refuses a name made of camera codes and numbers, and reads hyphenated and parenthesised names', () => {
    expect(nameFromTitle('File:DSC_0042.jpg')).toBe('');
    expect(nameFromTitle('File:20230101 123456.jpg')).toBe('');
    expect(nameFromTitle('File:Lake Victoria at dawn 2.jpg')).toBe('Lake Victoria at dawn');
    expect(nameFromTitle('File:Mt-Grizim-national-park-7920.jpg')).toBe('Mt Grizim national park');
    expect(nameFromTitle('File:Official portrait of Rodney Williams (cropped).png')).toBe('Official portrait of Rodney Williams');
  });

  it('takes boilerplate off the front and refuses key-value metadata', () => {
    expect(text('This is a photo of a monument in Mexico City.')).toBe('A monument in Mexico City');
    expect(text('Photo of the place of the Persian Gate')).toBe('The place of the Persian Gate');
    expect(text('object type: portrait statue - description: Head of Hatshepsut')).toBe('Head of Hatshepsut');
    expect(captionFor('object type: portrait statue', 'File:Bust of Hatshepsut.jpg')).toBeUndefined();
  });

  it('does not use metadata or non-English descriptions as captions', () => {
    expect(captionFor('Version 8.25 from the Textbook OpenStax Anatomy and Physiology Published May 18, 2016', 'File:Heart diagram.jpg')).toBeUndefined();
    expect(captionFor('Royal Regalie, Museum der Präsente anlässlich der Inthronisierung des Sultans', 'File:Sultan crown.jpg')).toBeUndefined();
    expect(captionFor('A lion resting in the shade of a tree', 'File:Lion.jpg')?.source).toBe('description');
  });

  it('does not caption a picture with a sentence about the file, and closes up spaces before commas', () => {
    for (const d of ['This media has been taken in the country of Malta', 'This photo demonstrates the texture and colour of a dog nose', 'This is a visual depicting how T helper cells work', 'Appears to be an albino Elk, located in Sweden']) {
      expect(captionFor(d, 'File:X.jpg')?.source, d).not.toBe('description');
    }
    expect(text('Ravensburg , Germany: Papierkrattler at the carnival')).toBe('Ravensburg, Germany: Papierkrattler at the carnival');
  });

  // The defects of the licence auditor's 5% sample (docs/kiro-evidence/crew/media-audit-review.md).
  describe('stays fixed: the audit defects', () => {
    it('G5: a good first sentence is kept although the description later has boilerplate', () => {
      const d = 'Neil Armstrong works at the LM in the only photo taken of him on the moon. This is a cropped photo. Source http://nasa.gov File:Neil Armstrong.jpg';
      expect(captionFor(d, 'File:Neil Armstrong cropped.jpg')).toEqual({ text: 'Neil Armstrong works at the LM in the only photo taken of him on the moon', source: 'description' });
    });

    it('a trailing (cropped) is dropped from a file name, not a reason to reject it', () => {
      expect(captionFor('', 'File:David - Portrait of Monsieur Lavoisier (cropped).jpg')).toBeUndefined();
    });

    it('G6: an unfilled form field and a fragment ending in a preposition are not captions', () => {
      expect(captionFor('"African people at work" from', 'File:Fernanda Nossa, Guinea-Bissau, photo 3.jpg')).toBeUndefined();
      expect(captionFor('This is an image of Cultural Fashion or Adornment from', 'File:BaAka woman dancing.jpg')).toBeUndefined();
    });

    it('G7: "captures", "features" and "portrays" are about the photograph', () => {
      const c = captionFor('This photograph captures the interior of an ornate Buddhist temple or memorial hall', 'File:DFC 5635 A serene shrine inside a Thai temple.jpg');
      expect(c).toBeUndefined();
    });

    it('G8: a library catalogue line with a bare host is not a caption', () => {
      const d = 'Persistent URL: digital.lib.muohio.edu/u?/snyder,1473 Subject (TGM): Calculators; Window displays';
      expect(captionFor(d, 'File:Burroughs adding machine display in Oxford bank window 1916.jpg')).toBeUndefined();
    });

    it('a first-person making-of and a panel marker are refused', () => {
      expect(captionFor('A map of Saint Lucia that i created, based on a public domain map from the PCL', 'File:Saint Lucia geography map en.png')).toBeUndefined();
      expect(captionFor('• LEFT: A large mass (blue) belongs to the positive sector where it creates a positive curvature', 'File:Conjugate curvatures.png')).toBeUndefined();
    });

    it('a caption never says what the file does not: no article title is borrowed', () => {
      expect(captionFor('', 'File:Stick chart-BHM 1920.530.0032-P8260228.JPG')?.text ?? 'none').not.toMatch(/Marshall Islands/);
    });
  });

  // Round 2 of the licence audit (docs/kiro-evidence/crew/media-audit-review-2.md): 31 of 206 captions missed the English bar.
  describe('stays fixed: the round-2 audit defects', () => {
    it('a description in another script or language falls back to the English file name', () => {
      expect(captionFor('Портрет премьер-министра Сомали Хамзы Абди Барре', 'File:Hamza Abdi Barre 2025 official portrait.jpg')).toBeUndefined();
      expect(captionFor('Უბისის მონასტრის ფრესკა', 'File:Fresco of Ubisi (7).jpg')).toBeUndefined();
      expect(captionFor('ساحل جزیره کیش', 'File:Kish Island, Persian Gulf, Iran.jpg')).toBeUndefined();
      expect(captionFor('Imagen de paisaje de Canadá en 2014', 'File:Canada in 2014.jpg')).toBeUndefined();
      expect(captionFor('Esquelete de necrópole romana', 'File:Esquelete de necrópole romana (7326104804).jpg')).toBeUndefined();
    });

    it('a name with no English source at all is not captioned', () => {
      expect(captionFor('', 'File:ماشین تحریر مظفر الدین شاه قاجار.jpg')).toBeUndefined();
      expect(captionFor('Vestigios de Tenochtitlan', 'File:Vestigios de Tenochtitlan.jpg')).toBeUndefined();
      expect(captionFor('Casa foscolo', 'File:Casa foscolo.jpg')).toBeUndefined();
    });

    it('catalogue fields and camera gear are not captions', () => {
      expect(captionFor('02 Bestanddeelnummer: 252-1255', 'File:Spaarnestad 02 Bestanddeelnummer 252-1255.jpg')?.source).not.toBe('description');
      expect(captionFor('02 Bestanddeelnummer: 252-1255', 'File:DSC_0042.jpg')).toBeUndefined();
      expect(captionFor('Identificatie Titel(s): Kniegelenk Objecttype: foto stereofoto Objectnummer: RP-F-F26541', 'File:Kniegelenk, RP-F-F26541.jpg')?.source).not.toBe('description');
      expect(captionFor('10 mm. Voigtlander lens', 'File:Mountain scene. Best viewed large. (49909617046).jpg')?.text ?? '').not.toMatch(/lens/);
    });

    it('import residue is stripped from a file name: Flickr, Google Art Project, accession numbers, catalogue numbers, language codes, dates, glued digits', () => {
      expect(nameFromTitle('File:Entebbe - Flickr - Dave Proffer.jpg')).toBe('');
      expect(nameFromTitle('File:Kampala skyline - Flickr - Dave Proffer.jpg')).toBe('Kampala skyline');
      expect(nameFromTitle('File:Claude Monet - Arrival of the Normandy Train - Google Art Project.jpg')).toBe('Claude Monet - Arrival of the Normandy Train');
      expect(nameFromTitle('File:Portrait of Marie Curie (1867 - 1934), Polish chemist Wellcome M0000113.jpg')).toBe('Portrait of Marie Curie, Polish chemist');
      expect(nameFromTitle('File:PIA00103 Venus - 3-D Perspective View of Lavinia Planitia.jpg')).toBe('Venus - 3-D Perspective View of Lavinia Planitia');
      expect(nameFromTitle('File:Saint Lucia geography map en.png')).toBe('Saint Lucia geography map');
      expect(nameFromTitle('File:201805 human skeleton.png')).toBe('human skeleton');
      expect(nameFromTitle('File:Castelul Bran2.jpg')).toBe('Castelul Bran');
      expect(nameFromTitle('File:Fernanda Nossa, Guinea-Bissau, photo 3.jpg')).toBe('Fernanda Nossa, Guinea-Bissau');
      expect(nameFromTitle('File:Ring with engraved portrait of Ptolemy VI Philometor (3rd–2nd century BCE) - 2009.jpg')).toBe('Ring with engraved portrait of Ptolemy VI Philometor');
    });

    it('never stops on a word that needs another, drops an unbalanced quote, and strips (cropped) from a description', () => {
      const long = 'Sheikh Zayed and their Highnesses the Rulers of the Emirates during the flag hoisting ceremony at the Union House in Dubai';
      expect(shorten(long, 70).replace(/…$/, '')).not.toMatch(/\b(?:of|the|during|at|in)$/);
      expect(captionFor('Apfelstrudel mit Vanillesoße" at the Edelweisshütte above Sölden, Tyrol', 'File:2015 0731 Apfelstrudel.jpg')?.text ?? '').not.toContain('"');
      expect(captionFor('Official portrait of Rodney Williams (cropped)', 'File:Official portrait of Rodney Williams.png')?.text).toBe('Official portrait of Rodney Williams');
    });
  });
});
