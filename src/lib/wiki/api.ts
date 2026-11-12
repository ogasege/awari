/**
 * Loads any article on demand (14-any-article): Simple English Wikipedia
 * first, English Wikipedia only when Simple has no such page. Every call
 * takes a `fetch` so tests run with no network.
 */
import type { Article } from '../packs/types.ts';
import {
  WikiError,
  apiTitle,
  toArticle,
  type PhotoMeta,
  type WikiId,
  type WikiPage,
} from './convert.ts';

type FetchImpl = typeof fetch;

const HOSTS: Record<WikiId, string> = {
  simple: 'https://simple.wikipedia.org/w/api.php',
  en: 'https://en.wikipedia.org/w/api.php',
};
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
/** Width of the lead photo kept on the device. */
export const PHOTO_WIDTH = 800;

function query(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  const all = { action: 'query', format: 'json', formatversion: '2', origin: '*', ...params };
  for (const [k, v] of Object.entries(all)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

async function getJson<T>(url: string, fetchImpl: FetchImpl): Promise<T> {
  let res: Response;
  try {
    res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  } catch (error) {
    throw new WikiError('offline', `Could not reach Wikipedia: ${String(error)}`);
  }
  if (!res.ok) {
    throw new WikiError('failed', `Wikipedia answered ${res.status}`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new WikiError('failed', 'Wikipedia sent something unreadable');
  }
}

interface PageReply {
  query?: {
    pages?: Array<{
      title: string;
      missing?: boolean;
      invalid?: boolean;
      extract?: string;
      pageimage?: string;
      thumbnail?: { source: string; width: number; height: number };
      pageprops?: { wikibase_item?: string };
    }>;
  };
}

/** Fetches one page from a wiki, or null when it has none. */
export async function fetchPage(wiki: WikiId, title: string, fetchImpl: FetchImpl): Promise<WikiPage | null> {
  const url = query(HOSTS[wiki], {
    prop: 'extracts|pageprops|pageimages',
    explaintext: '1',
    exsectionformat: 'wiki',
    redirects: '1',
    ppprop: 'wikibase_item',
    piprop: 'thumbnail|name',
    pithumbsize: String(PHOTO_WIDTH),
    titles: apiTitle(title),
  });
  const reply = await getJson<PageReply>(url, fetchImpl);
  const page = reply.query?.pages?.[0];
  if (!page || page.missing || page.invalid || !page.extract) {
    return null;
  }
  return {
    wiki,
    title: page.title,
    extract: page.extract,
    qid: page.pageprops?.wikibase_item,
    fetched: new Date().toISOString(),
    thumb: page.thumbnail,
    pageimage: page.pageimage,
  };
}

interface CommonsReply {
  query?: {
    pages?: Array<{
      imageinfo?: Array<{
        mime?: string;
        extmetadata?: Record<string, { value?: string } | undefined>;
      }>;
    }>;
  };
}

/** Author, licence and description of a Commons file, if it has them. */
export async function fetchPhotoMeta(fileName: string, fetchImpl: FetchImpl): Promise<PhotoMeta | undefined> {
  const url = query(COMMONS, {
    prop: 'imageinfo',
    iiprop: 'extmetadata|mime',
    titles: `File:${fileName.replace(/_/g, ' ')}`,
  });
  const reply = await getJson<CommonsReply>(url, fetchImpl);
  const info = reply.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) {
    return undefined;
  }
  const m = info.extmetadata ?? {};
  return {
    artist: m['Artist']?.value ?? m['Attribution']?.value,
    licenceShort: m['LicenseShortName']?.value,
    description: m['ImageDescription']?.value,
    restrictions: m['Restrictions']?.value,
    mime: info.mime,
  };
}

/** A loaded article with the bytes of its lead photo, when it has one. */
export interface LoadedArticle {
  article: Article;
  photo?: Blob;
}

/** Downloads the lead photo; a failure only means no photo. */
async function fetchPhotoBytes(url: string, fetchImpl: FetchImpl): Promise<Blob | undefined> {
  try {
    const res = await fetchImpl(url, { mode: 'cors' });
    return res.ok ? await res.blob() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Loads an article by title: Simple English first, then English. Rejects
 * with a `WikiError` whose reason says whether the network is gone, no
 * page exists or the page has no text.
 */
export async function loadWikiArticle(title: string, fetchImpl: FetchImpl = fetch): Promise<LoadedArticle> {
  let page = await fetchPage('simple', title, fetchImpl);
  if (!page) {
    page = await fetchPage('en', title, fetchImpl);
  }
  if (!page) {
    throw new WikiError('notfound', `No page called "${apiTitle(title)}"`);
  }
  let meta: PhotoMeta | undefined;
  if (page.pageimage && page.thumb) {
    try {
      meta = await fetchPhotoMeta(page.pageimage, fetchImpl);
    } catch {
      meta = undefined; // no photo is better than no article
    }
  }
  const article = toArticle(page, meta);
  const lead = article.photos[0];
  const photo = lead ? await fetchPhotoBytes(lead.file, fetchImpl) : undefined;
  return { article: photo || !lead ? article : { ...article, photos: [] }, ...(photo ? { photo } : {}) };
}
