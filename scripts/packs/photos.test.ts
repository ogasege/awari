// @vitest-environment node
/** Tests for Commons photo acceptance, captions and alt text. */
import { describe, expect, it } from 'vitest';
import { acceptImage, altFor, captionFor, placeMentions, stripHtml } from './photos.ts';

const base = {
  title: 'File:Lagos Island skyline.jpg',
  mime: 'image/jpeg',
  width: 3000,
  meta: {
    Artist: '<a href="//commons.wikimedia.org/wiki/User:Ada">Ada &amp; Co</a>',
    LicenseShortName: 'CC BY-SA 4.0',
    Categories: 'Lagos|Pages with maps',
    ImageDescription: '<p>The skyline of Lagos Island at dusk. Taken in 2019.</p>',
    ObjectName: 'Lagos Island skyline',
  },
};

describe('acceptImage (Req 5.2, 5.3)', () => {
  it('accepts a freely licensed photo and strips the author HTML', () => {
    expect(acceptImage(base)).toEqual({ licence: 'CC BY-SA 4.0', author: 'Ada & Co' });
  });

  it('rejects non-free, restricted, unattributed, non-JPEG and map files', () => {
    expect(acceptImage({ ...base, meta: { ...base.meta, LicenseShortName: 'CC BY-NC 2.0' } })).toBeNull();
    expect(acceptImage({ ...base, meta: { ...base.meta, Restrictions: 'trademarked' } })).toBeNull();
    expect(acceptImage({ ...base, meta: { ...base.meta, Artist: '' } })).toBeNull();
    expect(acceptImage({ ...base, mime: 'image/png' })).toBeNull();
    expect(acceptImage({ ...base, title: 'File:Lagos locator map.jpg' })).toBeNull();
    expect(acceptImage({ ...base, meta: { ...base.meta, Categories: 'Flags of Nigeria' } })).toBeNull();
    expect(acceptImage({ ...base, title: 'File:President visit Lagos.jpg' }, true)).toBeNull();
  });
});

describe('place checks (Req 5.1, 5.2)', () => {
  const others = ['Cameroon', 'Togo', 'Niger', 'Democratic Republic of the Congo', 'Republic of the Congo'];

  it('rejects satellite images of places', () => {
    expect(
      acceptImage({ ...base, meta: { ...base.meta, ImageDescription: 'MODIS image of floods' } }, true),
    ).toBeNull();
  });

  it('tells which places a text names', () => {
    expect(placeMentions('Flooding in Cameroon', ['Equatorial Guinea'], others)).toEqual({ self: false, other: true });
    expect(placeMentions('Rocks in Benin and Togo', ['Benin'], others)).toEqual({ self: true, other: true });
    expect(placeMentions('Bumba, Democratic Republic of the Congo', ['Republic of the Congo'], others)).toEqual({ self: false, other: true });
    expect(placeMentions('The Niger Delta, Nigeria', ['Nigeria'], others)).toEqual({ self: true, other: false });
  });
});

describe('captions and alt text (Req 5.5)', () => {
  it('uses short object names and falls back to the title', () => {
    expect(captionFor('Lagos Island skyline', 'Nigeria', 'countries')).toBe('A view of Nigeria');
    expect(captionFor('Beach with palms Ghana', 'Ghana', 'countries')).toBe('Beach with palms Ghana');
    expect(captionFor('Lautsprecherkabel Makro', 'Electrical conductor', 'physics')).toBe('Electrical conductor up close');
    expect(altFor({ title: 'File:Afang Soup.jpg', meta: { ImageDescription: 'This is an image of food from', ObjectName: 'Afang Soup' } }, 'Nigeria')).toBe('Photo: Afang Soup');
    expect(captionFor('DSC 0042', 'Nigeria', 'countries')).toBe('A view of Nigeria');
    expect(captionFor('Lightning', 'Lightning', 'physics')).toBe('Lightning up close');
    expect(
      captionFor('x', 'Democratic Republic of the Congo', 'countries').split(' ').length,
    ).toBeLessThanOrEqual(5);
  });

  it('takes the first sentence of the description as alt', () => {
    expect(altFor(base, 'Nigeria')).toBe('The skyline of Lagos Island at dusk.');
    expect(stripHtml('<b>a</b>&nbsp;b')).toBe('a b');
  });
});
