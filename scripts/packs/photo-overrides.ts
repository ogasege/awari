/**
 * Hand-picked lead photos, keyed by "<pack>/<slug>". Each one replaced
 * an automatic pick that was doubtful for a children's encyclopedia or
 * did not show the subject well. Every override still goes through the
 * Commons licence, author and suitability checks at build time, so a
 * file whose licence changes fails the build instead of shipping.
 */
import type { PhotoOverride } from './photos.ts';

/** Curated Commons files, checked by `npm run packs`. */
export const PHOTO_OVERRIDES: ReadonlyMap<string, PhotoOverride> = new Map([
  [
    'countries/equatorial-guinea',
    { file: 'Atardecer en la playa de Ureca (Ureka) Guinea Ecuatorial.jpg', caption: 'Sunset at Ureca', alt: 'Sunset on the beach at Ureca on Bioko island, Equatorial Guinea' },
  ],
  [
    'physics/electric-charge',
    { file: 'Van de Graaff at American Museum of Science and Energy Oak Ridge.jpg', caption: 'Van de Graaff generator', alt: 'A woman touching the terminal of a Van de Graaff generator' },
  ],
  [
    'physics/electric-current',
    { file: 'Multimeter Strommessung.JPG', caption: 'Measuring electric current', alt: 'A digital multimeter measuring electric current' },
  ],
  [
    'physics/voltage',
    { file: 'CH Capdella, 3 voltímetres.jpg', caption: 'Three old voltmeters', alt: 'Three antique voltmeters on the switchboard of a hydropower plant' },
  ],
  [
    'physics/electrical-resistance',
    { file: 'Electronic-Axial-Lead-Resistors-Array.jpg', caption: 'Resistors in a row', alt: 'An array of resistors with different resistances' },
  ],
  [
    'physics/static-electricity',
    { file: 'Electric spark.jpg', caption: 'An electric spark', alt: 'A purple electric spark in a static electricity experiment' },
  ],
]);
