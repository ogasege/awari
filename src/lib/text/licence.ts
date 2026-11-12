/**
 * Licence normalisation and image filtering for Wikimedia Commons files.
 * Only the licences in the `Licence` contract type are ever accepted.
 */
import type { Licence } from '../packs/types.ts';

/** Every licence Awari accepts, in the contract's spelling. */
export const ACCEPTED_LICENCES: readonly Licence[] = [
  'CC BY-SA 4.0',
  'CC BY-SA 3.0',
  'CC BY-SA 2.5',
  'CC BY-SA 2.0',
  'CC BY 4.0',
  'CC BY 3.0',
  'CC BY 2.5',
  'CC BY 2.0',
  'CC0',
  'Public domain',
];

const VERSIONS = new Set(['4.0', '3.0', '2.5', '2.0']);

/**
 * Maps a Commons `LicenseShortName` (e.g. "CC BY-SA 4.0", "cc-by-3.0-de",
 * "Public domain", "CC0") to an accepted licence, or null when the
 * licence is not one Awari accepts (NC, ND, GFDL-only, unknown...).
 * Ported licences ("3.0 de") map to their unported version.
 */
export function normaliseLicence(shortName: string): Licence | null {
  const s = shortName
    .trim()
    .toUpperCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');
  if (/\bNC\b|\bND\b|NONCOMMERCIAL|NODERIV/.test(s)) {
    return null;
  }
  if (/^CC ?0(\b| 1\.0)/.test(s) || s === 'CC ZERO') {
    return 'CC0';
  }
  if (/^(PUBLIC DOMAIN|PD)\b/.test(s)) {
    return 'Public domain';
  }
  const cc = /^CC BY( SA)? (\d\.\d)\b/.exec(s);
  if (cc && VERSIONS.has(cc[2] ?? '')) {
    return `CC BY${cc[1] ? '-SA' : ''} ${cc[2]}` as Licence;
  }
  return null;
}

/** Canonical deed URL for an accepted licence. */
export function licenceUrl(licence: Licence): string {
  if (licence === 'CC0') {
    return 'https://creativecommons.org/publicdomain/zero/1.0/';
  }
  if (licence === 'Public domain') {
    return 'https://creativecommons.org/publicdomain/mark/1.0/';
  }
  const [, kind = 'BY', version = '4.0'] =
    /^CC (BY(?:-SA)?) (\d\.\d)$/.exec(licence) ?? [];
  return `https://creativecommons.org/licenses/${kind.toLowerCase()}/${version}/`;
}

/** Words in a file title or category that mark a non-photo. */
const UNWANTED = [
  'flag',
  'map',
  'coat of arms',
  'coat_of_arms',
  'arms of',
  'emblem',
  'seal',
  'logo',
  'locator',
  'location',
  'orthographic',
  'icon',
  'symbol',
  'banner',
  'banknote',
  'coin',
  'stamp',
  'signature',
  'diagram',
  'chart',
  'graph',
];

/**
 * True when a Commons file should never be used as a photo: not a JPEG,
 * or its title or one of its categories names a flag, map, coat of arms,
 * emblem, seal, logo, locator, icon, symbol or similar.
 */
export function isUnwantedImage(
  title: string,
  categories: readonly string[] = [],
): boolean {
  if (!/\.jpe?g$/i.test(title)) {
    return true;
  }
  const name = title.toLowerCase().replace(/_/g, ' ');
  const inTitle = UNWANTED.some((word) =>
    new RegExp(`(^|[^a-z])${word.replace(/_/g, ' ')}s?([^a-z]|$)`).test(
      name,
    ),
  );
  // Categories such as "Pages with maps" are added to ordinary photos,
  // so only categories that classify the file itself count.
  const inCategory = categories.some((c) =>
    UNWANTED_CATEGORY.test(c.replace(/_/g, ' ')),
  );
  return inTitle || inCategory;
}

const UNWANTED_CATEGORY =
  /^(flags|maps|locator maps|coats of arms|emblems|seals|logos|icons|symbols|diagrams|charts|banknotes|coins|stamps)\b/i;
