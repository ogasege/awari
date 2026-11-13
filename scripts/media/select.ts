/**
 * Which Commons files may enter the library and which are chosen for an article
 * (23-media-library Req 6-8, 15). Pure: the candidates are passed in.
 */
import { UNSUITABLE } from '../packs/photos.ts';
import { parseLicence } from './allow.ts';

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
  /** Where the collector found it: used in the Wikipedia article itself, or only in its Commons category. */
  from?: 'article' | 'category';
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
const NEVER = /\blogos?\b|wordmark|signature|autograph|\bicons?\b|\bcollage\b|montage|composite|sprite|screenshot|\bscan of\b|\bsvg\b/i;
/** Frightening, graphic or sexual material, by title, description or category (Req 8); adds to the lead-photo list. */
const GRAPHIC =
  /nude|naked|nudity|sexual|erotic|porn|gore|graphic|bloody|blood[ -](?:stain|spatter|splatter|pool)|bleeding|mutilat|torture|lynching|hanging body|swastika|nazi|penis|vagina|genital|testic|scrotum|vulva|\banus\b|breast|nipple|sperm|menstru|copulat|mating|field dressing|dressing a deer|gutting|gutted|skinning|\bhunt(?:ing|ed|er|ers)\b|trophy|entrails|viscera|intestin|surgery|surgical|operation|open[- ]heart|wound|injur|\bscar\b|amputat|tumou?r|cancer|disease|infect|\bpus\b|rotting|decompos|roadkill|stuffed|taxiderm/i;

export type Kind = 'photo' | 'portrait' | 'map' | 'flag' | 'emblem' | 'art' | 'diagram';

/** The kind of a picture, read from its title and categories (for variety, Req 15). */
export function kindOf(c: Pick<Candidate, 'title' | 'categories' | 'description'>): Kind {
  const t = `${c.title} ${c.categories.join(' ')}`.toLowerCase();
  if (/\bmaps?\b|locator|location map/.test(t)) return 'map';
  if (/\bflags?\b/.test(t)) return 'flag';
  if (/coats? of arms|emblem|\bseal\b|\bcrest\b/.test(t)) return 'emblem';
  if (/diagram|chart|graph|schematic|infographic/.test(t)) return 'diagram';
  if (/painting|drawing|illustration|engraving|lithograph|sketch|woodcut/.test(t)) return 'art';
  if (/portrait|headshot/.test(t)) return 'portrait';
  return 'photo';
}

/** Why a candidate is rejected, or undefined when it may be used. */
export function rejectReason(c: Candidate): string | undefined {
  if (c.repository !== 'shared' && c.repository !== 'local') return 'not hosted on Commons';
  if (!parseLicence(c.licence)) return 'licence not on the allow-list';
  if (c.restrictions.trim() !== '') return 'restrictions listed';
  if (!MIMES.has(c.mime)) return 'not a plain picture file';
  if (Math.max(c.width, c.height) < MIN_SIDE) return 'under 800 px on the long side';
  const text = `${c.title} ${c.description} ${c.categories.join(' ')}`;
  if (NEVER.test(text)) return 'logo, signature, icon or collage';
  if (GRAPHIC.test(text) || UNSUITABLE.test(text)) return 'unsuitable for children';
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
export function selectForArticle<T extends Candidate>(candidates: readonly T[], max = MAX_PER_ARTICLE): T[] {
  const seen = new Set<string>();
  const allowed = candidates
    .filter((c) => rejectReason(c) === undefined)
    .filter((c) => (seen.has(c.title) ? false : (seen.add(c.title), true)))
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
