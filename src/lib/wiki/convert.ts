/**
 * Pure conversion of a live Wikipedia response into an `Article`
 * (14-any-article Req 1, 2): sections without back matter, a source,
 * and a lead photo only when its licence and author qualify.
 */
import type { Article, Licence, Photo, Source } from '../packs/types.ts';
import { stripCoordinates } from '../text/coordinates.ts';
import { stripHtml } from '../text/html.ts';
import { licenceUrl, normaliseLicence } from '../text/licence.ts';
import { deriveNotes } from '../text/notes.ts';
import { slugify } from '../text/slug.ts';
import { splitSections, summarise } from '../text/sections.ts';

/** Which wiki an article came from. */
export type WikiId = 'simple' | 'en';

const WIKIS: Record<WikiId, { name: string; host: string }> = {
  simple: { name: 'Simple English Wikipedia', host: 'simple.wikipedia.org' },
  en: { name: 'English Wikipedia', host: 'en.wikipedia.org' },
};

/** Longest article text kept, in characters, so storage stays small. */
export const MAX_TEXT = 60_000;
/** Shortest text that makes a page. */
export const MIN_TEXT = 80;

/** A page as the MediaWiki API reports it. */
export interface WikiPage {
  wiki: WikiId;
  title: string;
  extract: string;
  qid?: string;
  /** ISO timestamp of the fetch. */
  fetched: string;
  thumb?: { source: string; width: number; height: number };
  /** Commons file name of the page image, without "File:". */
  pageimage?: string;
}

/** Commons metadata for the page image. */
export interface PhotoMeta {
  artist?: string;
  licenceShort?: string;
  description?: string;
  restrictions?: string;
  mime?: string;
}

/** "Mount_Everest" or "mount everest" -> "Mount Everest" for the API. */
export function apiTitle(urlTitle: string): string {
  return urlTitle.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

/** "Mount Everest" -> "Mount_Everest" for the address bar. */
export function urlTitle(title: string): string {
  return title.replace(/\s+/g, '_');
}

/** The article id: the same slug rule the packs use. */
export function titleSlug(title: string): string {
  return slugify(apiTitle(title));
}

/** The page URL of a title on a wiki. */
export function pageUrl(wiki: WikiId, title: string): string {
  return `https://${WIKIS[wiki].host}/wiki/${encodeURIComponent(urlTitle(title))}`;
}

/** The credit for a page's text (CC BY-SA 4.0). */
export function pageSource(wiki: WikiId, title: string, fetched: string): Source {
  return {
    name: `${WIKIS[wiki].name}: ${title}`,
    url: pageUrl(wiki, title),
    licence: 'CC BY-SA 4.0',
    licenceUrl: licenceUrl('CC BY-SA 4.0'),
    retrieved: fetched.slice(0, 10),
  };
}

/** Keeps at most `max` characters of text, cutting at a paragraph. */
function capText(sections: ReturnType<typeof splitSections>, max: number): ReturnType<typeof splitSections> {
  let used = 0;
  const out: ReturnType<typeof splitSections> = [];
  for (const s of sections) {
    const paragraphs: string[] = [];
    for (const p of s.paragraphs) {
      if (used + p.length > max) {
        break;
      }
      used += p.length;
      paragraphs.push(p);
    }
    if (paragraphs.length > 0) {
      out.push({ heading: s.heading, paragraphs });
    }
  }
  return out;
}

/**
 * Decides whether a lead photo can be shown: an accepted licence, a
 * named author, no usage restriction, and a JPEG or PNG. Returns the
 * `Photo` credit, or undefined.
 */
export function acceptPhoto(
  page: Pick<WikiPage, 'title' | 'thumb' | 'pageimage' | 'fetched'>,
  meta: PhotoMeta | undefined,
  alt?: string,
): Photo | undefined {
  if (!page.thumb || !page.pageimage || !meta) {
    return undefined;
  }
  const licence: Licence | null = normaliseLicence(stripHtml(meta.licenceShort ?? ''));
  const author = stripHtml(meta.artist ?? '');
  if (!licence || author === '' || author.length > 200 || stripHtml(meta.restrictions ?? '') !== '') {
    return undefined;
  }
  if (meta.mime && !/^image\/(jpeg|png)$/.test(meta.mime)) {
    return undefined;
  }
  const description = stripHtml(meta.description ?? '');
  const text = alt ?? (description !== '' && description.length <= 140 ? description : `A picture of ${page.title}`);
  const fileUrl = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage.replace(/ /g, '_'))}`;
  return {
    file: page.thumb.source,
    width: page.thumb.width,
    height: page.thumb.height,
    alt: text,
    caption: page.title.length <= 40 ? page.title : page.title.slice(0, 37) + '…',
    credit: {
      name: `Wikimedia Commons: ${page.pageimage.replace(/_/g, ' ')}`,
      url: fileUrl,
      licence,
      licenceUrl: licenceUrl(licence),
      author,
      retrieved: page.fetched.slice(0, 10),
    },
  };
}

/** Thrown when a page cannot become an article. */
export class WikiError extends Error {
  constructor(
    readonly reason: 'offline' | 'notfound' | 'empty' | 'failed',
    message: string,
  ) {
    super(message);
    this.name = 'WikiError';
  }
}

/** Converts a page (and optional photo metadata) into an `Article`. */
export function toArticle(page: WikiPage, meta?: PhotoMeta): Article {
  // Position strings ("30°54′N 31°07′E / 30.900; 31.117") are not text a child reads: cut them from every line, keeping the line breaks.
  const extract = stripCoordinates(page.extract);
  const sections = capText(splitSections(extract), MAX_TEXT);
  const length = sections.reduce((n, s) => n + s.paragraphs.join(' ').length, 0);
  if (length < MIN_TEXT) {
    throw new WikiError('empty', `"${page.title}" has no text to show`);
  }
  const photo = acceptPhoto(page, meta);
  return {
    id: titleSlug(page.title),
    pack: 'wiki',
    title: page.title.replace(/\s*\([^()]*\)\s*$/, '').trim() || page.title,
    summary: summarise(sections),
    sections,
    photos: photo ? [photo] : [],
    notes: deriveNotes(sections),
    ...(page.qid ? { qid: page.qid } : {}),
    source: pageSource(page.wiki, page.title, page.fetched),
  };
}
