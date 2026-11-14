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
  if (a === '') return false;
  // The shown name is the readable form of what Commons holds, so compare with both the raw and the readable form.
  return [authorKey(commons), authorKey(authorName(commons))].some((b) => b !== '' && (a === b || a.includes(b) || b.includes(a)));
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

/** A readable name for an account URL ("https://www.flickr.com/people/anoldent/" -> "anoldent on Flickr"), or undefined. */
function nameFromUrl(url: string): string | undefined {
  let u: URL;
  try {
    u = new URL(/^https?:/i.test(url) ? url : `https://${url}`);
  } catch {
    return undefined;
  }
  const host = u.hostname.replace(/^www\./, '');
  const parts = u.pathname.split('/').filter(Boolean).map((p) => decodeURIComponent(p));
  const last = (skip: string[]): string | undefined => parts.filter((p) => !skip.includes(p.toLowerCase())).find((p) => p.length > 0);
  if (host.endsWith('flickr.com')) {
    const who = last(['photos', 'people']);
    return who ? `${who} on Flickr` : 'Flickr';
  }
  if (host.endsWith('pixabay.com')) {
    const who = last(['users', 'it', 'de', 'fr', 'es', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'id', 'sv']);
    return who ? `${who.replace(/-\d+$/, '')} on Pixabay` : 'Pixabay';
  }
  if (host.endsWith('picasaweb.com') || host.endsWith('picasaweb.google.com')) return parts[0] ? `${parts[0]} on Picasa` : 'Picasa';
  const user = /(?:User|Utilizaire|Benutzer|Utilisateur|Usuario):([^/&]+)/i.exec(u.pathname + u.search);
  if (host.endsWith('wikimedia.org') || host.endsWith('wikipedia.org')) return user?.[1] ? `${decodeURIComponent(user[1]).replace(/_/g, ' ')} on ${host.endsWith('wikimedia.org') ? 'Wikimedia Commons' : 'Wikipedia'}` : undefined;
  return host;
}

/**
 * The author as a name a child can read (24-review-4 Req 2). Commons authors are sometimes only a web address
 * ("https://www.flickr.com/people/anoldent/"), carry an address or e-mail in brackets, or hold a whole paragraph of
 * licence text. A bare address becomes the account on its site; an address or e-mail beside a name is cut off;
 * "taken by X" and "X assumed" patterns give X; long boilerplate gives the shortest honest name left.
 */
export function authorName(raw: string | undefined): string {
  let t = plainText(raw);
  if (t === '') return '';
  const URL_RE = /(?:https?:\/\/|www\.)[^\s)>]+/gi;
  const bare = /^(?:https?:\/\/|www\.)\S+$/i.test(t) || /^[\w-]+(?:\.[\w-]+)+(?:\/\S*)?$/.test(t);
  if (bare) return nameFromUrl(t) ?? t;
  const taken = /\b(?:taken|photographed|created) by (.{2,60}?)\s+\./i.exec(t) ?? /\b(?:taken|photographed|created) by ([^.]{2,60}?)\./i.exec(t);
  if (t.length > 100 && taken?.[1]) return taken[1].trim();
  const assumed = /No machine-readable author provided\.\s*(.+?) assumed/i.exec(t);
  if (assumed?.[1]) return assumed[1].replace(/~\w+$/, '').trim();
  if (/kremlin\.ru/i.test(t)) return 'kremlin.ru';
  if (/^public domain\b/i.test(t) && t.length > 60) return 'Public domain';
  t = t
    .replace(/<[^>@\s]+@[^>\s]+>/g, ' ')
    .replace(/\(\s*(?:https?:\/\/|www\.|[\w.+-]+@)[^)]*\)/gi, ' ') // "( www.mikepeel.net )", "(monnierfranck@hotmail.com)"
    .replace(/\bat\s+(?:https?:\/\/|www\.)\S+/gi, ' ')
    .replace(URL_RE, ' ')
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, ' ')
    .replace(/^(?:Artist|Author|Photographer)\s*:\s*/i, '')
    .replace(/\bOriginal uploader was .*$/i, ' ')
    .replace(/\s*[/,&|-]\s*$/g, '')
    .replace(/\s+[/|]\s+(?=\s*$)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:)])/g, '$1')
    .trim()
    .replace(/[\s/,;&.-]+$/, '');
  if (t === '') {
    // Only an uploader was named ("Original uploader was Cormullion at en.wikipedia"): the uploader is the name.
    const uploader = /Original uploader was (.+?)(?: at \S+)?$/i.exec(plainText(raw));
    return uploader?.[1]?.trim() ?? '';
  }
  if (t.length > 90) t = `${t.slice(0, 90).replace(/\s+\S*$/, '')}…`;
  return t;
}
