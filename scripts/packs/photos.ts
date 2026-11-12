/**
 * Lead photos from Wikimedia Commons: candidate search, licence,
 * suitability and content checks, author/licence credit, curated
 * overrides, and resizing with sharp.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp, { type OutputInfo } from 'sharp';
import type { Licence, PackId, Photo } from '../../src/lib/packs/types.ts';
import { stripHtml } from '../../src/lib/text/html.ts';
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

export { decodeEntities, stripHtml } from '../../src/lib/text/html.ts';

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

/** Subjects unsuitable for a children's lead photo. */
export const UNSUITABLE =
  /child[ _-]?labou?r|\bwars?\b|warfare|conflict|refugee|poverty|corpse|\bdead\b|death|killed|protest|\briots?\b|caricature|cartoon|damaged|destroyed|rebel|militia|soldier|\barmy\b|military|weapon|\bguns?\b|slum|famine|starv|execution|genocide|massacre|prison|slave|funeral|wounded|injur|\bbomb|attack|terror|violence|disaster|flood/i;

/** Old artworks: paintings, prints and drawings. */
const ARTWORK =
  /painting|engraving|lithograph|etching|woodcut|drawing|illustration|sketch|watercolou?r|aquatint|\bprint by\b/i;

/** A year before 1900 written in the text. */
const OLD_YEAR = /\b1[0-8]\d\d\b/;

/** Subjects a lead photo should preferably show. */
const PREFERRED =
  /landscape|view|panorama|mountain|\bmount\b|\bpeak\b|hill|valley|lake|river|falls|waterfall|beach|coast|bay|island|desert|dune|savann?ah?|forest|park|reserve|wildlife|elephant|lion|giraffe|zebra|antelope|gorilla|bird|city|skyline|street|market|harbou?r|\bport\b|mosque|church|cathedral|temple|palace|fort|castle|tower|bridge|monument|pyramid|ruins|old town|village|sunset|sunrise/gi;

/** File title without "File:" and extension, underscores as spaces. */
function plainName(title: string): string {
  return title
    .replace(/^File:/, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/_/g, ' ')
    .trim();
}

/** What a Commons file says about itself, for the checks below. */
export function fileText(file: Pick<CommonsFile, 'title' | 'meta'>): string {
  return [
    plainName(file.title),
    stripHtml(file.meta.ObjectName ?? ''),
    stripHtml(file.meta.ImageDescription ?? ''),
    stripHtml(file.meta.Categories ?? '').replace(/\|/g, ' '),
  ].join(' ');
}

/**
 * Decides whether a Commons file can be a lead photo (Requirement 5.2):
 * a JPEG at least 480 px wide, not a flag/map/emblem/logo and similar,
 * nothing unsuitable for children, no artwork or work dated before 1900,
 * with an accepted licence, a named author and no usage restriction.
 * For places, official portraits, events and satellite images are
 * rejected too.
 */
export function acceptImage(
  file: Pick<CommonsFile, 'title' | 'mime' | 'width' | 'meta'>,
  place = false,
): Acceptance | null {
  const categories = (file.meta.Categories ?? '').split('|');
  const text = `${fileText(file)} ${stripHtml(file.meta.Artist ?? '')}`;
  if (
    file.mime !== 'image/jpeg' ||
    file.width < 480 ||
    isUnwantedImage(file.title, categories) ||
    UNSUITABLE.test(text) ||
    ARTWORK.test(text) ||
    OLD_YEAR.test(text) ||
    (place && (PEOPLE_EVENTS.test(text) || SATELLITE.test(text)))
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

/** How strongly a file shows a preferred subject (0 = not at all). */
export function preferenceScore(
  file: Pick<CommonsFile, 'title' | 'meta' | 'width' | 'height'>,
): number {
  const hits = fileText(file).match(PREFERRED) ?? [];
  const landscape = file.width >= file.height * 1.2 ? 1 : 0;
  return new Set(hits.map((h) => h.toLowerCase())).size * 2 + landscape;
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

/**
 * A caption of two to five words naming what the photo shows, taken
 * from the Commons object name (or file name) with bracketed parts and
 * trailing numbers removed; null when it does not read as plain words.
 */
export function captionFrom(name: string): string | null {
  const clean = stripHtml(name)
    .replace(/\s*\btitle QS:.*$/, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[\s_-]+\d[\d\s_-]*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const words = clean.split(' ').filter(Boolean);
  const plain = words.every((w) => /^[A-Za-zÀ-ÿ'’-]+,?$/.test(w));
  return plain && words.length >= 2 && words.length <= 5 ? clean : null;
}

/** Longest alt text, in characters. */
export const ALT_LIMIT = 140;

const WEAK_DESCRIPTION =
  /^(this (is an |is a |)(image|photo)|per filename|it |uploaded|own work|photographed)/i;

/**
 * Plain alt text from the Commons description: its first sentence when
 * it reads as a complete English description, shortened at a word
 * boundary to at most 140 characters; null when there is none.
 */
export function altFrom(description: string): string | null {
  const text = stripHtml(description).replace(/^English:\s*/i, '');
  const first = (text.split(/(?<=[.!?])\s/)[0] ?? '').trim();
  const letters = first.replace(/[^\p{L}]/gu, '');
  const latin = letters !== '' && /^[A-Za-zÀ-ÿ]+$/.test(letters);
  // "in" and "a" are left out: Dutch, German and French share them.
  const english =
    /^[A-Z]/.test(first) &&
    /\b(the|of|and|at|on|with|near|from|an|is|to|for|by|over|into|are|was)\b/i.test(
      first,
    );
  const unfinished = /(\bfrom|\bof|\bthe|\bwith|:)$/i.test(
    first.replace(/[.!?]$/, ''),
  );
  if (
    first.split(/\s+/).length < 3 ||
    !latin ||
    !english ||
    /\b[a-z]{2}:|500px|QS:/.test(first) ||
    WEAK_DESCRIPTION.test(first) ||
    unfinished
  ) {
    return null;
  }
  if (first.length <= ALT_LIMIT) {
    return first;
  }
  return `${first.slice(0, ALT_LIMIT - 1).replace(/[\s,;:]+\S*$/, '')}…`;
}

/** A hand-picked Commons file for one article, checked like any other. */
export interface PhotoOverride {
  /** File name on Commons, without "File:". */
  file: string;
  /** Two to five words naming what the photo shows. */
  caption: string;
  /** Plain description; defaults to the Commons description. */
  alt?: string;
}

/** What a photo is wanted for. */
export interface PhotoSubject {
  slug: string;
  title: string;
  wikiTitle: string;
  pack: PackId;
  /** Commons search phrases tried after the article's own files. */
  queries: string[];
  /** For places: names of this place, and of every other place. */
  names?: string[];
  otherNames?: string[];
  override?: PhotoOverride;
}

/** A chosen photo with its credit. */
export interface ChosenPhoto {
  photo: Photo;
  subject: string;
}

interface Candidate {
  file: CommonsFile;
  ok: Acceptance;
  alt: string;
  caption: string;
  score: number;
}

/**
 * Finds, checks, downloads and resizes a lead photo, writing it to
 * `<outDir>/img/<slug>.jpg`. An override is used when given (and must
 * pass the same checks). Otherwise candidates come from the files used
 * on the article, then Commons searches; each must pass `acceptImage`
 * and have an alt text and a caption. For places, a file used on the
 * article must not name another country without naming this one, and
 * a search result must name this place and no other. The best-scoring
 * candidate (preferred subjects, landscape format) wins; the search
 * stops at the first source that offers a preferred subject.
 */
export async function choosePhoto(
  subject: PhotoSubject,
  outDir: string,
): Promise<ChosenPhoto | null> {
  if (subject.override) {
    const photo = await applyOverride(subject, subject.override, outDir);
    return { photo, subject: subject.title };
  }
  const place = subject.pack === 'countries';
  const names = subject.names ?? [subject.title];
  const others = subject.otherNames ?? [];
  const sources: (() => Promise<string[]>)[] = [
    () => getArticleFiles(subject.wikiTitle),
    ...subject.queries.map((q) => () => searchCommons(q)),
  ];
  const pool: Candidate[] = [];
  for (const [i, source] of sources.entries()) {
    const quick = (await source()).filter((n) => !isUnwantedImage(`File:${n}`));
    if (quick.length === 0) {
      continue;
    }
    const files = await getCommonsFiles(quick);
    for (const n of quick) {
      const file =
        files.get(`File:${n.replace(/_/g, ' ')}`) ?? files.get(`File:${n}`);
      if (!file || pool.some((c) => c.file.title === file.title)) {
        continue;
      }
      if (place) {
        const m = placeMentions(fileText(file), names, others);
        if (i === 0 ? !m.self && m.other : !m.self || m.other) {
          continue;
        }
      }
      const ok = acceptImage(file, place);
      const alt = altFrom(file.meta.ImageDescription ?? '');
      const caption =
        captionFrom(file.meta.ObjectName ?? '') ??
        captionFrom(plainName(file.title));
      if (ok && alt && caption) {
        pool.push({ file, ok, alt, caption, score: preferenceScore(file) });
      }
    }
    if (pool.some((c) => c.score >= 2)) {
      break;
    }
  }
  const best = [...pool].sort((a, b) => b.score - a.score)[0];
  if (!best) {
    return null;
  }
  return {
    photo: await savePhoto(best.file, best.ok, subject, outDir, best.alt, best.caption),
    subject: subject.title,
  };
}

/** Uses a hand-picked file, failing loudly when it does not qualify. */
async function applyOverride(
  subject: PhotoSubject,
  override: PhotoOverride,
  outDir: string,
): Promise<Photo> {
  const files = await getCommonsFiles([override.file]);
  const file = files.get(`File:${override.file.replace(/_/g, ' ')}`);
  if (!file) {
    throw new Error(`Override ${override.file} for ${subject.slug} is not on Commons`);
  }
  const ok = acceptImage(file, false);
  if (!ok) {
    throw new Error(
      `Override ${override.file} for ${subject.slug} fails the licence or suitability checks`,
    );
  }
  const alt = override.alt ?? altFrom(file.meta.ImageDescription ?? '');
  if (!alt) {
    throw new Error(`Override ${override.file} for ${subject.slug} needs an alt text`);
  }
  return savePhoto(file, ok, subject, outDir, alt, override.caption);
}

/** Downloads, resizes and writes one photo and returns its record. */
async function savePhoto(
  file: CommonsFile,
  ok: Acceptance,
  subject: PhotoSubject,
  outDir: string,
  alt: string,
  caption: string,
): Promise<Photo> {
  const raw = await fetchBytes(file.thumbUrl, { kind: 'commons-img', ext: '.jpg' });
  let out: { data: Buffer; info: OutputInfo } | undefined;
  for (const quality of QUALITIES) {
    out = await sharp(raw.body)
      .rotate()
      .resize({
        width: MAX_SIDE,
        height: MAX_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })
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
    alt,
    caption,
    credit: {
      name: `Wikimedia Commons: ${file.title.replace(/^File:/, '')}`,
      url: file.pageUrl,
      licence: ok.licence,
      licenceUrl: /^https?:\/\//.test(licenceLink)
        ? licenceLink
        : licenceUrl(ok.licence),
      author: ok.author,
      retrieved: isoDate(file.fetched),
    },
  };
}
