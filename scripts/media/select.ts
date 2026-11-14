/**
 * Which Commons files may enter the library and which are chosen for an article
 * (23-media-library Req 6-8, 15). Pure: the candidates are passed in.
 */
import { UNSUITABLE } from '../packs/photos.ts';
import { readFileSync } from 'node:fs';
import { parseLicence } from './allow.ts';
import { captionFor, hasCaption } from './caption.ts';

/** Files the design reviewer said to drop in two rounds of review (scripts/media/denylist.ts). */
const DENIED = new Set<string>(
  (() => {
    try {
      return (JSON.parse(readFileSync('scripts/media/denylist.json', 'utf8')) as { titles: string[] }).titles;
    } catch {
      return [];
    }
  })(),
);

/** What the collector knows about one Commons file. */
export interface Candidate {
  /** `File:Name.jpg` */
  title: string;
  width: number;
  height: number;
  mime: string;
  /** Commons `LicenseShortName`. */
  licence: string;
  /** Commons `Restrictions`, empty when none. */
  restrictions: string;
  /** `shared` or `local`: hosted on Commons. */
  repository: string;
  description: string;
  /** Commons categories of the file, plain text. */
  categories: readonly string[];
  /** Commons sha1, so the same bitmap under two names is kept once. */
  sha1?: string;
  /** Commons `Artist`, plain text. */
  author?: string;
  /** Where the collector found it: used in the Wikipedia article itself, or only in its Commons category. */
  from?: 'article' | 'category';
}

/** What an article is about: its pack and the words a picture must show some sign of (23-media-library Req 15). */
export interface Subject {
  pack: string;
  terms: readonly string[];
}

/** Words too general to prove a picture belongs to an article. */
const GENERIC = new Set([
  'the', 'and', 'for', 'with', 'from', 'mount', 'mountain', 'mountains', 'river', 'lake', 'ocean', 'sea', 'republic', 'kingdom', 'united', 'states',
  'empire', 'city', 'island', 'islands', 'great', 'new', 'saint', 'north', 'south', 'east', 'west', 'central', 'human', 'world', 'history', 'ancient',
  'people', 'organ', 'ring', 'fire', 'space', 'solar', 'system',
]);

/** The words of an article's names (title, English Wikipedia title, Commons category) that say what it is about. */
export function termsFor(...names: Array<string | undefined>): string[] {
  const out = new Set<string>();
  for (const name of names) {
    for (const w of (name ?? '').replace(/\([^)]*\)/g, ' ').toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (w.length >= 3 && !GENERIC.has(w)) out.add(w);
    }
  }
  return [...out];
}

/** The subject of a saved article: its pack and the words of its names. */
export function subjectOf(article: { pack: string; title: string }, links?: { enTitle?: string; category?: string }): Subject {
  return { pack: article.pack, terms: termsFor(article.title, links?.enTitle, links?.category) };
}

/** True when the text mentions one of the terms (a prefix for long words, so "electric" matches "electricity"). */
export function mentions(text: string, terms: readonly string[]): boolean {
  const t = text.toLowerCase();
  return terms.some((w) => new RegExp(w.length >= 5 ? `\\b${w}` : `\\b${w}\\b`, 'iu').test(t));
}

/** The smallest long side we keep (Req 8). */
export const MIN_SIDE = 800;
export const MIN_PER_ARTICLE = 4;
export const MAX_PER_ARTICLE = 12;
/** What the library actually keeps per article: eight, and ten for a country (more kinds to show). */
export const KEEP_PER_ARTICLE = 8;
export const KEEP_PER_COUNTRY = 10;

export function keepFor(pack: string): number {
  return pack === 'countries' ? KEEP_PER_COUNTRY : KEEP_PER_ARTICLE;
}

const MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
/** Logos, signatures, icons and collages are never shown (Req 8). */
const NEVER = /\blogos?\b|wordmark|signature|autograph|\bicons?\b|\bcollage\b|montage|composite|sprite|screenshot|\bscan of\b|\bsvg\b|\bsequence of\b|\bset of \d+ (?:images|photos|pictures)\b|\btitle page\b|\bfrontispiece\b|\bessay\b|\bpanels?\b|\bleft:|\bright:|\bheat ?map\b|bathymetr|\bconcentrations?\b|gravimetr|\bsite plan\b|\bplan of\b|\bflow ?chart\b|\bchart\b|\bstatistics\b|\bpercentages?\b|\bwaxwork\b|wax (?:figure|museum)|tussauds|\brender(?:ing|ed)?\b|\bblender\b|\b3d model\b|\btoy\b|\bpage from\b|\bold book\b|\bbook from \d{4}\b|\bplaque\b|\binscription\b|global footprint|\bour (?:offices|facilities)\b|corporate office|sales offices|customer footprint|micrograph|\bperspective view\b|\bsynthetic\b|\bsimulation\b|\bmicroscop(?:e|y)\b|\bhistolog/i;
/** Frightening, graphic or sexual material, by title, description or category (Req 8); adds to the lead-photo list. */
const GRAPHIC =
  /nude|naked|nudity|sexual|erotic|porn|gore|graphic|bloody|blood[ -](?:stain|spatter|splatter|pool)|bleeding|mutilat|torture|lynching|hanging body|swastika|nazi|penis|vagina|genital|testic|scrotum|vulva|\banus\b|breast|nipple|sperm|menstru|copulat|mating|field dressing|dressing a deer|gutting|gutted|skinning|\bhunt(?:ing|ed|er|ers)\b|trophy|entrails|viscera|intestin|surgery|surgical|operation|open[- ]heart|wound|injur|\bscar\b|amputat|tumou?r|cancer|disease|infect|\bpus\b|rotting|decompos|roadkill|stuffed|taxiderm/i;

/** More that a ten-year-old should not meet by surprise (23-media-library review, 14 Nov): caricature, specimens, war machines, disaster. */
const EXTRA_UNSUITABLE =
  /zwarte piet|blackface|caricatur|specimen|formalin|preserved in|pathological|beached|stranded|aftermath|\bnavy\b|naval|troops|artillery|warship|battleship|missile|bomber|\bcannons?\b|\btanks?\b|fighter (?:jet|plane|aircraft)|tsunami|earthquake damage|rubble|wreckage|crash(?:ed)?\b|\bcorpses?\b|\bskulls?\b|\bbones? of\b/i;

/** A file title in any wiki's language ("Archivo:", "Datei:", "Fichier:") as the Commons `File:` title. */
export function commonsTitle(title: string): string {
  return title.replace(/^[^:]{2,20}:/, 'File:');
}

/**
 * Whether a file is hosted on Commons, given how it was found. Asked through a Wikipedia, `shared` is Commons and
 * `local` is a file uploaded to that wikipedia itself (often non-free); asked on Commons itself, `local` is Commons.
 */
export function hostedOnCommons(repository: string, from: 'article' | 'category' | undefined): boolean {
  if (repository === 'shared') return true;
  return repository === 'local' && from === 'category';
}

export type Kind = 'photo' | 'portrait' | 'map' | 'flag' | 'emblem' | 'art' | 'diagram';

/** The kind of a picture, read from its title and categories (for variety, Req 15). */
export function kindOf(c: Pick<Candidate, 'title' | 'categories' | 'description'>): Kind {
  // Commons categories are full of "Photographs by ..." and "Buildings with flags in ...": drop those before reading
  // the kind, and match whole words ("graph" is inside "photograph").
  const cats = c.categories.filter((x) => !/photograph|\bphotos?\b|pictures? of|buildings? with|people with|\bwith flags?\b/i.test(x));
  const t = `${c.title} ${cats.join(' ')}`.toLowerCase();
  if (/\bmaps?\b|locator|location map/.test(t)) return 'map';
  // A flag image is "Flag of X"; a photograph of a flag-raising or a row of flagpoles is a photograph.
  if (/^(?:file:)?(?:national )?flags? of\b|\bflags? of the\b|\bflags of\b/i.test(c.title)) return 'flag';
  if (/coats? of arms|\bemblem\b|\bseal\b|\bcrest\b/.test(t)) return 'emblem';
  if (/\bdiagrams?\b|\bcharts?\b|\bgraphs?\b|\bschematic\b|\binfographic\b/.test(t)) return 'diagram';
  if (/\bpaintings?\b|\bdrawings?\b|\billustrations?\b|\bengravings?\b|\blithograph\b|\bsketch\b|\bwoodcut\b/.test(t)) return 'art';
  // One sitter: "portrait" in the name of a lion family or a 29-person conference photograph does not make a portrait.
  if (/\bportraits?\b|\bheadshot\b/.test(t) && !/\b(?:family|group|conference|lions?|tigers?|animals?|couple|team|crowd)\b/.test(t)) return 'portrait';
  return 'photo';
}

/** Why a candidate is rejected, or undefined when it may be used. */
export function rejectReason(c: Candidate, subject?: Subject, opts: { skipCaption?: boolean } = {}): string | undefined {
  if (!hostedOnCommons(c.repository, c.from)) return 'not hosted on Commons';
  if (DENIED.has(c.title)) return 'dropped by a design review';
  if (!parseLicence(c.licence)) return 'licence not on the allow-list';
  if (c.restrictions.trim() !== '') return 'restrictions listed';
  // CC BY and CC BY-SA need the author named; a file whose Commons page names none cannot be credited properly.
  if (parseLicence(c.licence)?.family !== 'pd' && (c.author ?? '').trim() === '') return 'no author named for an attribution licence';
  if (!MIMES.has(c.mime)) return 'not a plain picture file';
  if (Math.max(c.width, c.height) < MIN_SIDE) return 'under 800 px on the long side';
  if (opts.skipCaption !== true && !hasCaption(c.description, c.title)) return 'nothing honest to say about it';
  const text = `${c.title} ${c.description} ${c.categories.join(' ')}`;
  if (NEVER.test(text)) return 'logo, signature, icon or collage';
  if (GRAPHIC.test(text) || UNSUITABLE.test(text) || EXTRA_UNSUITABLE.test(text)) return 'unsuitable for children';
  if (subject) {
    const kind = kindOf(c);
    if (kind === 'emblem') return 'an emblem or coat of arms';
    if (kind === 'flag' && subject.pack !== 'countries') return 'a flag outside a country';
    if (kind === 'diagram' && recognition(c) === 0) return 'a diagram: too small to read in a print';
    // A PNG that is not a map is nearly always a diagram, a figure or a graphic: not a picture for a print.
    if (c.mime === 'image/png' && kind !== 'map' && recognition(c) === 0) return 'a PNG graphic';
    // A picture found through the Wikipedia article (or, outside the countries, its category) must show some sign of
    // the subject in its title, description or categories, so a teddy bear is not Alan Turing and the Matterhorn is
    // not Mount Aso. A country's Commons category is trusted: its files rarely name the country.
    if ((c.from === 'article' || subject.pack !== 'countries') && subject.terms.length > 0 && recognition(c) === 0 && !mentions(`${c.title} ${c.description} ${c.categories.join(' ')}`, subject.terms)) {
      return 'no sign that it is about the article';
    }
  }
  return undefined;
}

/** Featured, Quality and Valued pictures first (Req 8). */
function recognition(c: Candidate): number {
  const cats = c.categories.join(' ').toLowerCase();
  let n = 0;
  if (/featured pictures/.test(cats)) n += 30;
  if (/quality images/.test(cats)) n += 20;
  if (/valued images/.test(cats)) n += 15;
  return n;
}

/** A score for an allowed candidate: recognition, then use in the article itself, a landscape frame and size. */
export function score(c: Candidate): number {
  const ratio = c.width / Math.max(1, c.height);
  const frame = ratio >= 1.2 && ratio <= 2 ? 6 : ratio >= 0.7 && ratio < 1.2 ? 3 : 0;
  const size = Math.min(4, Math.floor(Math.max(c.width, c.height) / 1500));
  return recognition(c) + (c.from === 'article' ? 8 : 0) + frame + size;
}

/**
 * The series a file belongs to: its name without numbers, dates, camera counters and brackets, so
 * "A horse rider at the A.B.U carnival 02.jpg" and "... 03.jpg" share one stem.
 */
export function stemOf(title: string): string {
  return title
    .replace(/^File:/i, '')
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(?:img|dsc|dscn|p|dsf|_mg)[ _-]?\d+\b/gi, ' ')
    .replace(/[0-9]+/g, ' ')
    .replace(/[^\p{L}]+/gu, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .slice(0, 4)
    .join(' ');
}

/** At most this many pictures of one series in one article's set. */
export const SERIES_CAP = 2;

/**
 * The pictures chosen for one article: allowed candidates only, best first, at most `max`, spread over kinds so a
 * country gets a landscape, a map, a flag and so on rather than twelve of one kind (Req 15). Emblems never lead.
 * Returns fewer than `min` when the article simply has fewer allowed pictures; the caller lists the gap.
 */
export function selectForArticle<T extends Candidate>(candidates: readonly T[], max = MAX_PER_ARTICLE, subject?: Subject): T[] {
  const seen = new Set<string>();
  const allowed = candidates
    .filter((c) => rejectReason(c, subject) === undefined)
    .filter((c) => {
      // The same bitmap under two names is kept once (Commons sha1), and so is the same title.
      const key = c.sha1 ? `sha1:${c.sha1}` : c.title;
      if (seen.has(key) || seen.has(c.title)) return false;
      seen.add(key);
      seen.add(c.title);
      // Two pictures with the same caption in one article are one picture twice (near-duplicates).
      const cap = `caption:${(captionFor(c.description, c.title)?.text ?? '').toLowerCase()}`;
      if (seen.has(cap)) return false;
      seen.add(cap);
      return true;
    })
    .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title));
  // A series of near-identical shots (same stem) adds one or two pictures, not twelve.
  const perStem = new Map<string, number>();
  const varied = allowed.filter((c) => {
    const stem = stemOf(c.title);
    const n = perStem.get(stem) ?? 0;
    perStem.set(stem, n + 1);
    return n < SERIES_CAP;
  });
  const byKind = new Map<Kind, T[]>();
  for (const c of varied) {
    const k = kindOf(c);
    byKind.set(k, [...(byKind.get(k) ?? []), c]);
  }
  // Round-robin over kinds in the order of each kind's best score; photos take the extra places.
  const order = [...byKind.entries()].sort((a, b) => score(b[1][0] as T) - score(a[1][0] as T));
  const chosen: T[] = [];
  const perKindCap: Record<Kind, number> = { photo: max, portrait: 3, map: 2, flag: 2, emblem: 1, art: 3, diagram: 2 };
  for (let round = 0; chosen.length < max && round < max; round++) {
    let added = false;
    for (const [kind, list] of order) {
      const c = list[round];
      if (c && round < perKindCap[kind] && chosen.length < max) {
        chosen.push(c);
        added = true;
      }
    }
    if (!added) break;
  }
  // The first picture is never an emblem.
  chosen.sort((a, b) => (kindOf(a) === 'emblem' ? 1 : 0) - (kindOf(b) === 'emblem' ? 1 : 0) || score(b) - score(a) || a.title.localeCompare(b.title));
  return chosen;
}
