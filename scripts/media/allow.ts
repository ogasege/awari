/**
 * The licence allow-list and the comparison rules for the Commons check
 * (23-media-library Req 2, 6, 7). Pure: no network, no files.
 */

/** Licence families Awari may show: public domain, CC0, CC BY and CC BY-SA of any version. */
export type LicenceKey = { family: 'pd' | 'by' | 'by-sa'; version?: string };

/**
 * Reads a Commons `LicenseShortName` (or the licence column of CREDITS.md) into a family and version.
 * Returns undefined for anything that is not on the allow-list: NC, ND, GFDL-only, "Copyrighted free use",
 * or a string that cannot be read.
 */
export function parseLicence(text: string | undefined): LicenceKey | undefined {
  const s = (text ?? '').trim().toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ');
  if (s === '') return undefined;
  if (/\b(nc|nd)\b|non-?commercial|no-?derivs|gfdl|fair use/.test(s)) return undefined;
  if (/^(public domain|cc0|pd[ -])/.test(s) || /public domain/.test(s) || /^cc[ -]?zero/.test(s) || s === 'cc0 1.0 universal') {
    return { family: 'pd' };
  }
  const m = /^cc[ -]by(?:[ -](sa))?[ -]?(\d\.\d)?(?:\b|$)/.exec(s);
  if (m) {
    return { family: m[1] ? 'by-sa' : 'by', ...(m[2] ? { version: m[2] } : {}) };
  }
  return undefined;
}

/** True when the two readings are the same licence: same family, and the same version when both state one. */
export function sameLicence(a: LicenceKey, b: LicenceKey): boolean {
  if (a.family !== b.family) return false;
  return a.version === undefined || b.version === undefined || a.version === b.version;
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#39;': "'", '&nbsp;': ' ' };

/** Plain text of a Commons metadata value (it is HTML), with whitespace collapsed. */
export function plainText(html: string | undefined): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#0?39|nbsp);/g, (e) => ENTITIES[e] ?? e)
    .replace(/\s+/g, ' ')
    .trim();
}

/** A comparable form of an author: lower case, no punctuation, single spaces. */
export function authorKey(text: string | undefined): string {
  return plainText(text)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Whether the author Awari shows is the author Commons names: equal after normalising, or one contains
 * the other (Commons often adds a website or "(talk)" to the name).
 */
export function sameAuthor(shown: string | undefined, commons: string | undefined): boolean {
  const a = authorKey(shown);
  const b = authorKey(commons);
  if (a === '' || b === '') return false;
  return a === b || a.includes(b) || b.includes(a);
}

/** The `File:` title in a Commons page URL, decoded (the title is what the API is asked for). */
export function titleFromUrl(url: string): string | undefined {
  const m = /commons\.wikimedia\.org\/wiki\/(File:[^?#]+)/.exec(url);
  if (!m?.[1]) return undefined;
  try {
    return decodeURIComponent(m[1]).replace(/_/g, ' ');
  } catch {
    return undefined;
  }
}
