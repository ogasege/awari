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
]);
