// @vitest-environment node
/** Tests for Commons photo acceptance, suitability, captions and alt text. */
import { describe, expect, it } from 'vitest';
import {
  ALT_LIMIT,
  acceptImage,
  altFrom,
  captionFrom,
  placeMentions,
  preferenceScore,
  stripHtml,
} from './photos.ts';

const base = {
  title: 'File:Lagos Island skyline.jpg',
  mime: 'image/jpeg',
  width: 3000,
  height: 2000,
  meta: {
    Artist: '<a href="//commons.wikimedia.org/wiki/User:Ada">Ada &amp; Co</a>',
    LicenseShortName: 'CC BY-SA 4.0',
    Categories: 'Lagos|Pages with maps',
    ImageDescription: '<p>The skyline of Lagos Island at dusk. Taken in 2019.</p>',
    ObjectName: 'Lagos Island skyline',
  },
};

const withMeta = (meta: Record<string, string>) => ({
  ...base,
  meta: { ...base.meta, ...meta },
});

describe('acceptImage (Req 5.2, 5.3)', () => {
  it('accepts a freely licensed photo and strips the author HTML', () => {
    expect(acceptImage(base)).toEqual({ licence: 'CC BY-SA 4.0', author: 'Ada & Co' });
  });

  it('rejects non-free, restricted, unattributed, non-JPEG and map files', () => {
    expect(acceptImage(withMeta({ LicenseShortName: 'CC BY-NC 2.0' }))).toBeNull();
    expect(acceptImage(withMeta({ Restrictions: 'trademarked' }))).toBeNull();
    expect(acceptImage(withMeta({ Artist: '' }))).toBeNull();
    expect(acceptImage({ ...base, mime: 'image/png' })).toBeNull();
    expect(acceptImage({ ...base, title: 'File:Lagos locator map.jpg' })).toBeNull();
    expect(acceptImage(withMeta({ Categories: 'Flags of Nigeria' }))).toBeNull();
    expect(acceptImage({ ...base, title: 'File:President visit Lagos.jpg' }, true)).toBeNull();
  });

  it('rejects subjects unsuitable for children, artworks and pre-1900 works', () => {
    expect(acceptImage({ ...base, title: 'File:Child labor in Ethiopia 2.jpg' })).toBeNull();
    expect(acceptImage(withMeta({ ImageDescription: 'Refugee camp near the border.' }))).toBeNull();
    expect(acceptImage(withMeta({ ImageDescription: 'A school damaged during the civil war.' }))).toBeNull();
    expect(acceptImage(withMeta({ ObjectName: 'Caricature by Thomas Rowlandson' }))).toBeNull();
    expect(acceptImage(withMeta({ ImageDescription: 'Engraving of the harbour, 1820.' }))).toBeNull();
    expect(acceptImage(withMeta({ ImageDescription: 'MODIS image of the coast.' }), true)).toBeNull();
  });

  it('prefers landscapes, landmarks, wildlife and cities', () => {
    expect(preferenceScore(base)).toBeGreaterThan(
      preferenceScore({ ...base, title: 'File:Afang soup.jpg', width: 600, height: 800, meta: { ObjectName: 'Afang soup', ImageDescription: 'A bowl of soup.' } }),
    );
  });
});

describe('place checks (Req 5.1, 5.2)', () => {
  const others = ['Cameroon', 'Togo', 'Niger', 'Democratic Republic of the Congo', 'Republic of the Congo'];

  it('tells which places a text names', () => {
    expect(placeMentions('Flooding in Cameroon', ['Equatorial Guinea'], others)).toEqual({ self: false, other: true });
    expect(placeMentions('Rocks in Benin and Togo', ['Benin'], others)).toEqual({ self: true, other: true });
    expect(placeMentions('Bumba, Democratic Republic of the Congo', ['Republic of the Congo'], others)).toEqual({ self: false, other: true });
    expect(placeMentions('The Niger Delta, Nigeria', ['Nigeria'], others)).toEqual({ self: true, other: false });
  });
});

describe('captions and alt text (Req 5.5)', () => {
  it('captions with two to five plain words, never a generic phrase', () => {
    expect(captionFrom('Lagos Island skyline')).toBe('Lagos Island skyline');
    expect(captionFrom('Le Morne Peninsula in Mauritius (53697779236)')).toBe('Le Morne Peninsula in Mauritius');
    expect(captionFrom('Tanzania landscape 01')).toBe('Tanzania landscape');
    expect(captionFrom('DSC 0042')).toBeNull();
    expect(captionFrom('Lightning')).toBeNull();
    expect(captionFrom('A very long object name with many words')).toBeNull();
  });

  it('takes alt text only from a complete English description', () => {
    expect(altFrom(base.meta.ImageDescription)).toBe('The skyline of Lagos Island at dusk.');
    expect(altFrom('English: View of the falls from the bridge.')).toBe('View of the falls from the bridge.');
    expect(altFrom('This is an image of food from')).toBeNull();
    expect(altFrom('Eigen foto, gemaakt op 15-10-2006 in Kampala.')).toBeNull();
    expect(altFrom('Per filename')).toBeNull();
    const long = altFrom(`The view ${'over the wide green hills '.repeat(10)}at dawn.`);
    expect(long?.length).toBeLessThanOrEqual(ALT_LIMIT);
    expect(long?.endsWith('…')).toBe(true);
    expect(stripHtml('<b>a</b>&nbsp;b')).toBe('a b');
  });
});
