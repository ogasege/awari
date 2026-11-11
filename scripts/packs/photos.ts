/**
 * Lead photos from Wikimedia Commons: candidate search, licence and
 * content checks, author/licence credit, and resizing with sharp.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp, { type OutputInfo } from 'sharp';
import type { Licence, Photo } from '../../src/lib/packs/types.ts';
import { fetchBytes } from './http.ts';
import { isUnwantedImage, licenceUrl, normaliseLicence } from './licence.ts';
import { isoDate } from './sources.ts';
import {
  getArticleFiles,
  getCommonsFiles,
  searchCommons,
  type CommonsFile,
} from './wikipedia.ts';

/** Largest output size and the byte budget per photo. */
export const MAX_SIDE = 800;
export const TARGET_BYTES = 90 * 1024;
const QUALITIES = [72, 64, 57, 50];

/** Decodes the HTML entities Commons metadata uses. */
export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Strips HTML tags and entities and collapses whitespace. */
export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Licence and author of a file Awari may use. */
export interface Acceptance {
  licence: Licence;
  author: string;
}

/** Words that mark official portraits and events, unwanted for places. */
const PEOPLE_EVENTS =
  /president|minister|portrait|\bking\b|queen|prince|official|summit|meeting|visit|ambassador|secretary|governor|senator|delegation|conference/i;

/**
 * Decides whether a Commons file can be a lead photo (Requirement 5.2):
 * a JPEG at least 480 px wide, not a flag/map/emblem/logo and similar,
 * with an accepted licence, a named author and no usage restriction.
 */
export function acceptImage(
  file: Pick<CommonsFile, 'title' | 'mime' | 'width' | 'meta'>,
  place = false,
): Acceptance | null {
  const categories = (file.meta.Categories ?? '').split('|');
  if (
    file.mime !== 'image/jpeg' ||
    file.width < 480 ||
    isUnwantedImage(file.title, categories) ||
    (place && PEOPLE_EVENTS.test(file.title))
  ) {
    return null;
  }
  const licence = normaliseLicence(stripHtml(file.meta.LicenseShortName ?? ''));
  if (!licence || stripHtml(file.meta.Restrictions ?? '') !== '') {
    return null;
  }
  const author =
    stripHtml(file.meta.Artist ?? '') ||
    stripHtml(file.meta.Attribution ?? '');
  if (author === '' || author.length > 200) {
    return null;
  }
  return { licence, author };
}

/** File title without "File:" and extension, underscores as spaces. */
function plainName(title: string): string {
  return title
    .replace(/^File:/, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/_/g, ' ')
    .trim();
}

/**
 * A caption of two to five words: the file's object name when it reads
 * as words, else a phrase built from the article title.
 */
export function captionFor(
  objectName: string,
  title: string,
  pack: 'countries' | 'physics',
): string {
  const words = stripHtml(objectName)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[_,;:]+/g, ' ')
    .split(/\s+/)
    .filter((w) => /^[A-Za-zÀ-ÿ'’-]+$/.test(w) && !/^(img|dsc|jpg)$/i.test(w));
  const clean = words.join(' ');
  const allWords = stripHtml(objectName).split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 5 && words.length === allWords.length) {
    return clean;
  }
  const phrase = pack === 'countries' ? `A view of ${title}` : `${title} up close`;
  const count = phrase.split(' ').length;
  return count <= 5 ? phrase : title.split(' ').slice(0, 5).join(' ');
}

/** Plain alt text: the description's first sentence, else the name. */
export function altFor(file: Pick<CommonsFile, 'title' | 'meta'>, title: string): string {
  const description = stripHtml(file.meta.ImageDescription ?? '');
  const first = description.split(/(?<=[.!?])\s/)[0] ?? '';
  if (first.length >= 8 && first.length <= 160) {
    return first;
  }
  const name = stripHtml(file.meta.ObjectName ?? '') || plainName(file.title);
  return name.length >= 4 ? `Photo: ${name}` : `Photo for the article about ${title}`;
}

/** What a photo is wanted for. */
export interface PhotoSubject {
  slug: string;
  title: string;
  wikiTitle: string;
  pack: 'countries' | 'physics';
  /** Commons search phrases tried after the article's own files. */
  queries: string[];
}

/** A chosen photo with its credit. */
export interface ChosenPhoto {
  photo: Photo;
  subject: string;
}

/**
 * Finds, checks, downloads and resizes a lead photo, writing it to
 * `<outDir>/img/<slug>.jpg`. Returns null when no candidate qualifies.
 */
export async function choosePhoto(
  subject: PhotoSubject,
  outDir: string,
): Promise<ChosenPhoto | null> {
  const place = subject.pack === 'countries';
  const lists: string[][] = [await getArticleFiles(subject.wikiTitle)];
  for (const q of subject.queries) {
    lists.push(await searchCommons(q));
  }
  for (const names of lists) {
    const quick = names.filter((n) => !isUnwantedImage(`File:${n}`));
    if (quick.length === 0) {
      continue;
    }
    const files = await getCommonsFiles(quick);
    const accepted = quick
      .map((n) => files.get(`File:${n.replace(/_/g, ' ')}`) ?? files.get(`File:${n}`))
      .filter((f): f is CommonsFile => f !== undefined)
      .map((f) => ({ f, ok: acceptImage(f, place) }))
      .filter((x): x is { f: CommonsFile; ok: Acceptance } => x.ok !== null);
    // Prefer landscape photos; keep source order otherwise.
    accepted.sort(
      (a, b) =>
        Number(b.f.width >= b.f.height * 1.2) -
        Number(a.f.width >= a.f.height * 1.2),
    );
    const best = accepted[0];
    if (best) {
      return { photo: await savePhoto(best.f, best.ok, subject, outDir), subject: subject.title };
    }
  }
  return null;
}

/** Downloads, resizes and writes one photo and returns its record. */
async function savePhoto(
  file: CommonsFile,
  ok: Acceptance,
  subject: PhotoSubject,
  outDir: string,
): Promise<Photo> {
  const raw = await fetchBytes(file.thumbUrl, { kind: 'commons-img', ext: '.jpg' });
  let out: { data: Buffer; info: OutputInfo } | undefined;
  for (const quality of QUALITIES) {
    out = await sharp(raw.body)
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    if (out.data.length <= TARGET_BYTES) {
      break;
    }
  }
  if (!out) {
    throw new Error(`Could not encode ${file.title}`);
  }
  const rel = `img/${subject.slug}.jpg`;
  mkdirSync(join(outDir, 'img'), { recursive: true });
  writeFileSync(join(outDir, rel), out.data);
  const licenceLink = stripHtml(file.meta.LicenseUrl ?? '');
  return {
    file: rel,
    width: out.info.width,
    height: out.info.height,
    alt: altFor(file, subject.title),
    caption: captionFor(file.meta.ObjectName ?? plainName(file.title), subject.title, subject.pack),
    credit: {
      name: `Wikimedia Commons: ${file.title.replace(/^File:/, '')}`,
      url: file.pageUrl,
      licence: ok.licence,
      licenceUrl: /^https?:\/\//.test(licenceLink) ? licenceLink : licenceUrl(ok.licence),
      author: ok.author,
      retrieved: isoDate(file.fetched),
    },
  };
}
