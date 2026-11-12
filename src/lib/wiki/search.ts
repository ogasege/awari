/**
 * Search beyond the bundled packs (14-any-article Req 4): Simple English
 * Wikipedia, then English Wikipedia when Simple finds nothing. Bundled,
 * saved and online results are merged without repeats.
 */
import type { SearchDoc } from '../../features/search/search.ts';
import { stripHtml } from '../text/html.ts';
import { apiTitle, urlTitle, type WikiId } from './convert.ts';

export interface WikiHit {
  title: string;
  /** A short plain-text snippet. */
  snippet: string;
  wiki: WikiId;
  /** In-app path of the article page. */
  to: string;
}

const HOSTS: Record<WikiId, string> = {
  simple: 'https://simple.wikipedia.org/w/api.php',
  en: 'https://en.wikipedia.org/w/api.php',
};

interface SearchReply {
  query?: { search?: Array<{ title: string; snippet?: string }> };
}

async function searchOne(wiki: WikiId, query: string, fetchImpl: typeof fetch): Promise<WikiHit[]> {
  const url = new URL(HOSTS[wiki]);
  const params = {
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '8',
    srnamespace: '0',
    srprop: 'snippet',
    format: 'json',
    formatversion: '2',
    origin: '*',
  };
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetchImpl(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    return [];
  }
  const reply = (await res.json()) as SearchReply;
  return (reply.query?.search ?? []).map((r) => ({
    title: r.title,
    snippet: stripHtml(r.snippet ?? ''),
    wiki,
    to: `/article/wiki/${encodeURIComponent(urlTitle(r.title))}`,
  }));
}

/**
 * Searches any topic online. Resolves an empty list when the network is
 * gone (the bundled and saved results still show).
 */
export async function wikiSearch(query: string, fetchImpl: typeof fetch = fetch): Promise<WikiHit[]> {
  const q = query.trim();
  if (q === '') {
    return [];
  }
  try {
    const simple = await searchOne('simple', q, fetchImpl);
    return simple.length > 0 ? simple : await searchOne('en', q, fetchImpl);
  } catch {
    return [];
  }
}

/** One line of merged results. */
export interface Merged {
  title: string;
  text: string;
  to: string;
  /** Where it comes from, for the label next to it. */
  origin: 'bundled' | 'read' | 'wikipedia';
}

const norm = (title: string): string => apiTitle(title).toLowerCase();

/**
 * Merges bundled hits, articles already read and online hits. A target
 * appears once; a wiki result that names a bundled article is dropped in
 * favour of the bundled page, and a read article that is also an online
 * hit is shown as read. Order: bundled, read, online.
 */
export function mergeResults(
  bundled: ReadonlyArray<Pick<SearchDoc, 'title' | 'text' | 'to'>>,
  read: ReadonlyArray<Pick<SearchDoc, 'title' | 'text' | 'to'>>,
  online: readonly WikiHit[],
): Merged[] {
  const out: Merged[] = [];
  const titles = new Set<string>();
  const targets = new Set<string>();
  const add = (m: Merged): void => {
    if (targets.has(m.to) || titles.has(norm(m.title))) {
      return;
    }
    targets.add(m.to);
    titles.add(norm(m.title));
    out.push(m);
  };
  for (const b of bundled) add({ title: b.title, text: b.text, to: b.to, origin: 'bundled' });
  for (const r of read) add({ title: r.title, text: r.text, to: r.to, origin: 'read' });
  for (const o of online) add({ title: o.title, text: o.snippet, to: o.to, origin: 'wikipedia' });
  return out;
}
