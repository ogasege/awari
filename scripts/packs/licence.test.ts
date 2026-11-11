// @vitest-environment node
/** Tests for licence normalisation, licence URLs and the image filter. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  ACCEPTED_LICENCES,
  isUnwantedImage,
  licenceUrl,
  normaliseLicence,
} from './licence.ts';

describe('normaliseLicence', () => {
  it('maps Commons short names', () => {
    expect(normaliseLicence('CC BY-SA 4.0')).toBe('CC BY-SA 4.0');
    expect(normaliseLicence('cc-by-sa-3.0-de')).toBe('CC BY-SA 3.0');
    expect(normaliseLicence('CC BY 2.0')).toBe('CC BY 2.0');
    expect(normaliseLicence('CC0')).toBe('CC0');
    expect(normaliseLicence('Public domain')).toBe('Public domain');
    expect(normaliseLicence('PD-US')).toBe('Public domain');
    expect(normaliseLicence('CC BY-NC-SA 2.0')).toBeNull();
    expect(normaliseLicence('CC BY-ND 4.0')).toBeNull();
    expect(normaliseLicence('GFDL')).toBeNull();
    expect(normaliseLicence('CC BY-SA 1.0')).toBeNull();
    expect(normaliseLicence('Attribution')).toBeNull();
  });

  it('Property 3: only accepted licences come out, NC/ND/GFDL never do (Req 5.2, 9.1)', () => {
    const accepted = new Set<string>(ACCEPTED_LICENCES);
    fc.assert(
      fc.property(
        fc.string({ maxLength: 30 }),
        fc.constantFrom('', 'NC', 'ND', 'GFDL'),
        (s, poison) => {
          const out = normaliseLicence(s);
          expect(out === null || accepted.has(out)).toBe(true);
          if (poison === 'NC' || poison === 'ND') {
            expect(normaliseLicence(`CC BY-${poison} ${s}`)).toBeNull();
            expect(normaliseLicence(`CC BY-SA-${poison}-4.0`)).toBeNull();
          }
          if (poison === 'GFDL') {
            expect(normaliseLicence(`GFDL${s.replace(/[^a-z ]/gi, '')}`)).toBeNull();
          }
        },
      ),
    );
    for (const licence of ACCEPTED_LICENCES) {
      expect(normaliseLicence(licence)).toBe(licence);
    }
  });

  it('gives deed URLs', () => {
    expect(licenceUrl('CC BY-SA 4.0')).toBe(
      'https://creativecommons.org/licenses/by-sa/4.0/',
    );
    expect(licenceUrl('CC BY 2.5')).toBe(
      'https://creativecommons.org/licenses/by/2.5/',
    );
    expect(licenceUrl('CC0')).toContain('publicdomain/zero');
  });
});

describe('isUnwantedImage', () => {
  it('rejects flags, maps and non-JPEGs and keeps photos', () => {
    expect(isUnwantedImage('File:Flag of Nigeria.svg')).toBe(true);
    expect(isUnwantedImage('File:Flag of Nigeria.jpg')).toBe(true);
    expect(isUnwantedImage('File:Nigeria map.jpg')).toBe(true);
    expect(isUnwantedImage('File:Coat of arms of Nigeria.jpg')).toBe(true);
    expect(isUnwantedImage('File:Lagos skyline.png')).toBe(true);
    expect(isUnwantedImage('File:Lagos skyline.jpg')).toBe(false);
    expect(isUnwantedImage('File:Zuma Rock.JPG', ['Pages with maps'])).toBe(
      false,
    );
    expect(isUnwantedImage('File:Abuja.jpg', ['Maps of Nigeria'])).toBe(true);
    expect(isUnwantedImage('File:Mapungubwe hill.jpg')).toBe(false);
  });

  it('Property 11: unwanted words or non-JPEG extensions are always rejected (Req 5.2)', () => {
    const word = fc.constantFrom(
      'flag',
      'Flags',
      'map',
      'Coat of arms',
      'emblem',
      'Seal',
      'logo',
      'locator',
      'icon',
      'symbol',
    );
    const filler = fc.stringMatching(/^[A-Za-z0-9 ]{0,12}$/);
    fc.assert(
      fc.property(filler, word, filler, (a, w, b) => {
        expect(isUnwantedImage(`File:${a} ${w} ${b}.jpg`)).toBe(true);
      }),
    );
    fc.assert(
      fc.property(
        filler,
        fc.constantFrom('.svg', '.png', '.gif', '.tif', '.webp'),
        (a, ext) => {
          expect(isUnwantedImage(`File:${a}${ext}`)).toBe(true);
        },
      ),
    );
  });
});
