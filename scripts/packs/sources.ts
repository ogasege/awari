/**
 * Builders for the `Source` record each data set attaches to what it
 * contributes, so every pack record names its origin and licence.
 */
import type { Source } from '../../src/lib/packs/types.ts';
import { licenceUrl } from './licence.ts';

/** Simple English Wikipedia base URL for article pages. */
export const SIMPLE_WIKI = 'https://simple.wikipedia.org/wiki/';

/** URL of a wiki page from its title (spaces become underscores). */
export function wikiUrl(base: string, title: string): string {
  return base + encodeURIComponent(title.replace(/ /g, '_'))
    .replace(/%2C/g, ',')
    .replace(/%27/g, "'")
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');
}

/** Source for one Simple English Wikipedia article (CC BY-SA 4.0). */
export function wikipediaSource(title: string, retrieved: string): Source {
  return {
    name: `Simple English Wikipedia: ${title}`,
    url: wikiUrl(SIMPLE_WIKI, title),
    licence: 'CC BY-SA 4.0',
    licenceUrl: licenceUrl('CC BY-SA 4.0'),
    retrieved,
  };
}

/** Source for the Simple English Wikipedia as a whole. */
export function wikipediaPackSource(retrieved: string): Source {
  return {
    name: 'Simple English Wikipedia',
    url: 'https://simple.wikipedia.org/',
    licence: 'CC BY-SA 4.0',
    licenceUrl: licenceUrl('CC BY-SA 4.0'),
    retrieved,
  };
}

/** Source for one Wikidata item (CC0), or for Wikidata as a whole. */
export function wikidataSource(
  retrieved: string,
  qid?: string,
  label?: string,
): Source {
  return {
    name: qid ? `Wikidata: ${label ?? qid} (${qid})` : 'Wikidata',
    url: qid
      ? `https://www.wikidata.org/wiki/${qid}`
      : 'https://www.wikidata.org/',
    licence: 'CC0',
    licenceUrl: licenceUrl('CC0'),
    retrieved,
  };
}

/** Source for Open English WordNet (CC BY 4.0). */
export function wordnetSource(version: string, retrieved: string): Source {
  return {
    name: `Open English WordNet ${version}`,
    url: 'https://github.com/globalwordnet/english-wordnet',
    licence: 'CC BY 4.0',
    licenceUrl: licenceUrl('CC BY 4.0'),
    author: 'The Open English WordNet team',
    retrieved,
  };
}

/** Source for Natural Earth (public domain). */
export function naturalEarthSource(retrieved: string): Source {
  return {
    name: 'Natural Earth 1:110m admin-0 countries',
    url: 'https://www.naturalearthdata.com/',
    licence: 'Public domain',
    licenceUrl: licenceUrl('Public domain'),
    author: 'Natural Earth',
    retrieved,
  };
}

/** ISO date (YYYY-MM-DD) of a timestamp. */
export function isoDate(at: Date | string): string {
  return new Date(at).toISOString().slice(0, 10);
}
