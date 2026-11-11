/**
 * Simple English Wikipedia and Wikimedia Commons API calls used by the
 * pipeline: plain-text extracts, the files an article uses, Commons file
 * metadata and Commons search. All responses go through the raw cache.
 */
import { fetchJson, withQuery } from './http.ts';
import { slugify } from './slug.ts';

const SIMPLE_API = 'https://simple.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

/** A plain-text article extract. */
export interface Extract {
  /** Title after redirects. */
  title: string;
  extract: string;
  qid?: string;
  /** ISO timestamp of the fetch. */
  fetched: string;
}

/** Fetches the plain-text extract of a Simple English article. */
export async function getExtract(title: string): Promise<Extract> {
  const url = withQuery(SIMPLE_API, {
    action: 'query',
    prop: 'extracts|pageprops',
    ppprop: 'wikibase_item',
    explaintext: 1,
    redirects: 1,
    titles: title,
    format: 'json',
    formatversion: 2,
  });
  const res = await fetchJson<{
    query?: {
      pages?: {
        title: string;
        missing?: boolean;
        extract?: string;
        pageprops?: { wikibase_item?: string };
      }[];
    };
  }>(url, { kind: 'simplewiki', key: `extract-${slugify(title)}` });
  const page = res.body.query?.pages?.[0];
  if (!page || page.missing || !page.extract) {
    throw new Error(`No Simple English Wikipedia article for "${title}"`);
  }
  return {
    title: page.title,
    extract: page.extract,
    qid: page.pageprops?.wikibase_item,
    fetched: res.fetched,
  };
}

/** File names (without "File:") used on a Simple English article. */
export async function getArticleFiles(title: string): Promise<string[]> {
  const url = withQuery(SIMPLE_API, {
    action: 'parse',
    page: title,
    prop: 'images',
    redirects: 1,
    format: 'json',
    formatversion: 2,
  });
  const res = await fetchJson<{ parse?: { images?: string[] } }>(url, {
    kind: 'simplewiki',
    key: `images-${slugify(title)}`,
  });
  return res.body.parse?.images ?? [];
}

/** Searches Commons files; returns file names without "File:". */
export async function searchCommons(query: string): Promise<string[]> {
  const url = withQuery(COMMONS_API, {
    action: 'query',
    list: 'search',
    srnamespace: 6,
    srsearch: `${query} filetype:bitmap`,
    srlimit: 20,
    format: 'json',
    formatversion: 2,
  });
  const res = await fetchJson<{
    query?: { search?: { title: string }[] };
  }>(url, { kind: 'commons', key: `search-${slugify(query)}` });
  return (res.body.query?.search ?? []).map((r) =>
    r.title.replace(/^File:/, ''),
  );
}

/** Commons metadata for one file. */
export interface CommonsFile {
  /** Title with the "File:" prefix. */
  title: string;
  mime: string;
  width: number;
  height: number;
  /** Thumbnail (about 1200 px wide) to download. */
  thumbUrl: string;
  /** File description page. */
  pageUrl: string;
  /** extmetadata values (HTML strings), keyed by field name. */
  meta: Record<string, string>;
  fetched: string;
}

const META_FIELDS = [
  'Artist',
  'LicenseShortName',
  'LicenseUrl',
  'ImageDescription',
  'ObjectName',
  'Categories',
  'Restrictions',
  'AttributionRequired',
  'Attribution',
].join('|');

/** Fetches Commons metadata for up to 50 files per request. */
export async function getCommonsFiles(
  names: readonly string[],
): Promise<Map<string, CommonsFile>> {
  const out = new Map<string, CommonsFile>();
  const titles = [...new Set(names.map((n) => `File:${n.replace(/^File:/, '')}`))];
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const res = await fetchJson<{
      query?: {
        normalized?: { from: string; to: string }[];
        pages?: {
          title: string;
          missing?: boolean;
          imagerepository?: string;
          imageinfo?: {
            mime: string;
            width: number;
            height: number;
            thumburl?: string;
            url: string;
            descriptionurl: string;
            extmetadata?: Record<string, { value: unknown }>;
          }[];
        }[];
      };
    }>(COMMONS_API, {
      kind: 'commons',
      form: {
        action: 'query',
        titles: batch.join('|'),
        prop: 'imageinfo',
        iiprop: 'url|size|mime|extmetadata',
        iiurlwidth: '1200',
        iiextmetadatafilter: META_FIELDS,
        iiextmetadatalanguage: 'en',
        format: 'json',
        formatversion: '2',
      },
    });
    const renamed = new Map(
      (res.body.query?.normalized ?? []).map((n) => [n.to, n.from]),
    );
    for (const page of res.body.query?.pages ?? []) {
      const info = page.imageinfo?.[0];
      if (page.missing || page.imagerepository !== 'local' || !info) {
        continue;
      }
      const meta: Record<string, string> = {};
      for (const [k, v] of Object.entries(info.extmetadata ?? {})) {
        meta[k] = String(v.value ?? '');
      }
      const file: CommonsFile = {
        title: page.title,
        mime: info.mime,
        width: info.width,
        height: info.height,
        thumbUrl: info.thumburl ?? info.url,
        pageUrl: info.descriptionurl,
        meta,
        fetched: res.fetched,
      };
      out.set(page.title, file);
      const from = renamed.get(page.title);
      if (from) {
        out.set(from, file);
      }
    }
  }
  return out;
}
