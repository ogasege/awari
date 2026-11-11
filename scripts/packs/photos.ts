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
  /president|minister|portrait|\bking\b|queen|prince|official|summit|meeting|visit|ambassador|embassy|consulate|secretary|governor|senator|delegation|conference/i;

/** Satellite and orbital imagery, unwanted as a place's lead photo. */
const SATELLITE =
  /MODIS|satellite|sat[ée]lite|landsat|sentinel-?\d|observa[çc][ãa]o da terra|earth observatory|astronaut photo/i;

/**
 * Decides whether a Commons file can be a lead photo (Requirement 5.2):
 * a JPEG at least 480 px wide, not a flag/map/emblem/logo and similar,
 * with an accepted licence, a named author and no usage restriction.
 * For places, official portraits, events and satellite images are
 * rejected too.
 */
export function acceptImage(
  file: Pick<CommonsFile, 'title' | 'mime' | 'width' | 'meta'>,
  place = false,
): Acceptance | null {
  const categories = (file.meta.Categories ?? '').split('|');
  const about = [
    file.title,
    stripHtml(file.meta.ImageDescription ?? ''),
    stripHtml(file.meta.Artist ?? ''),
  ].join(' ');
  if (
    file.mime !== 'image/jpeg' ||
    file.width < 480 ||
    isUnwantedImage(file.title, categories) ||
    (place && (PEOPLE_EVENTS.test(file.title) || SATELLITE.test(about)))
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

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when `name` appears in `text` as a whole word or phrase. */
function hasName(text: string, name: string): boolean {
  return new RegExp(`(^|[^\\p{L}])${escapeRegExp(name)}($|[^\\p{L}])`, 'u').test(
    text,
  );
}

/**
 * How a text relates to a place: whether it names the place itself
 * (any of `names`) and whether it names another place from `others`.
 * Other names that contain the place's name ("Democratic Republic of
 * the Congo" for "Republic of the Congo") are removed before looking
 * for the place's own name, and names contained in the place's name
 * ("Niger" in "Nigeria") never count as other places.
 */
export function placeMentions(
  text: string,
  names: readonly string[],
  others: readonly string[],
): { self: boolean; other: boolean } {
  let rest = text;
  for (const o of [...others].sort((a, b) => b.length - a.length)) {
    if (names.some((n) => o !== n && o.includes(n))) {
      rest = rest.split(o).join(' ');
    }
  }
  const self = names.some((n) => hasName(rest, n));
  const other = others.some(
    (o) => !names.some((n) => n.includes(o)) && hasName(text, o),
  );
  return { self, other };
}

/** What a file says about itself: name, object name and description. */
function fileText(file: Pick<CommonsFile, 'title' | 'meta'>): string {
  return [
    plainName(file.title),
    stripHtml(file.meta.ObjectName ?? ''),
    stripHtml(file.meta.ImageDescription ?? ''),
  ].join(' ');
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
 * A caption of two to five words: the file's object name when it is
 * plain words that name the subject (the place, or a word of four or
 * more letters from a physics title), else a phrase from the title.
 */
export function captionFor(
  objectName: string,
  title: string,
  pack: 'countries' | 'physics',
): string {
  const words = stripHtml(objectName).split(/\s+/).filter(Boolean);
  const plain = words.every((w) => /^[A-Za-zÀ-ÿ'’-]+$/.test(w));
  const lower = words.join(' ').toLowerCase();
  const namesSubject =
    pack === 'countries'
      ? lower.includes(title.toLowerCase())
      : title
          .toLowerCase()
          .split(/[^a-z]+/)
          .some((w) => w.length >= 4 && lower.includes(w));
  if (plain && words.length >= 2 && words.length <= 5 && namesSubject) {
    return words.join(' ');
  }
  const phrase = pack === 'countries' ? `A view of ${title}` : `${title} up close`;
  return phrase.split(' ').length <= 5
    ? phrase
    : title.split(' ').slice(0, 5).join(' ');
}

const WEAK_DESCRIPTION =
  /^(this (is an |is a |)(image|photo)|per filename|it |uploaded|own work)/i;

/**
 * Plain alt text: the description's first sentence when it reads as a
 * complete English description, else the file's name.
 */
export function altFor(file: Pick<CommonsFile, 'title' | 'meta'>, title: string): string {
  const description = stripHtml(file.meta.ImageDescription ?? '');
  const first = (description.split(/(?<=[.!?])\s/)[0] ?? '').trim();
  const letters = first.replace(/[^\p{L}]/gu, '');
  const latin = letters !== '' && /^[A-Za-zÀ-ÿ]+$/.test(letters);
  // "in" and "a" are left out: Dutch, German and French share them.
  const english =
    /^[A-Z]/.test(first) &&
    /\b(the|of|and|at|on|with|near|from|an|is|to|for|by|over|into|are|was)\b/i.test(first);
  const unfinished = /(\bfrom|\bof|\bthe|\bwith|:)$/i.test(first.replace(/[.!?]$/, ''));
  if (
    first.split(/\s+/).length >= 3 &&
    first.length <= 160 &&
    latin &&
    english &&
    !/\b[a-z]{2}:|500px|QS:/.test(first) &&
    !WEAK_DESCRIPTION.test(first) &&
    !unfinished
  ) {
    return first;
  }
  const name = cleanName(stripHtml(file.meta.ObjectName ?? '') || plainName(file.title));
  return name.length >= 4 ? `Photo: ${name}` : `Photo for the article about ${title}`;
}

/** Drops Commons structured-data residue, dates and numbers from a name. */
export function cleanName(name: string): string {
  return name
    .replace(/\s*\btitle QS:.*$/, '')
    .replace(/\b\d[\d-]*\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** What a photo is wanted for. */
export interface PhotoSubject {
  slug: string;
  title: string;
  wikiTitle: string;
  pack: 'countries' | 'physics';
  /** Commons search phrases tried after the article's own files. */
  queries: string[];
  /** For places: names of this place, and of every other place. */
  names?: string[];
  otherNames?: string[];
}

/** A chosen photo with its credit. */
export interface ChosenPhoto {
  photo: Photo;
  subject: string;
}

/**
 * Finds, checks, downloads and resizes a lead photo, writing it to
 * `<outDir>/img/<slug>.jpg`. Returns null when no candidate qualifies.
 * For places, a file used on the article must not name another place
 * without naming this one, and a Commons search result must name this
 * place and no other.
 */
export async function choosePhoto(
  subject: PhotoSubject,
  outDir: string,
): Promise<ChosenPhoto | null> {
  const place = subject.pack === 'countries';
  const names = subject.names ?? [subject.title];
  const others = subject.otherNames ?? [];
  const lists: string[][] = [await getArticleFiles(subject.wikiTitle)];
  for (const q of subject.queries) {
    lists.push(await searchCommons(q));
  }
  for (const [i, list] of lists.entries()) {
    const quick = list.filter((n) => !isUnwantedImage(`File:${n}`));
    if (quick.length === 0) {
      continue;
    }
    const files = await getCommonsFiles(quick);
    const accepted = quick
      .map((n) => files.get(`File:${n.replace(/_/g, ' ')}`) ?? files.get(`File:${n}`))
      .filter((f): f is CommonsFile => f !== undefined)
      .filter((f) => {
        if (!place) {
          return true;
        }
        const m = placeMentions(fileText(f), names, others);
        return i === 0 ? m.self || !m.other : m.self && !m.other;
      })
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
