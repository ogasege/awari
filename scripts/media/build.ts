/**
 * Builds the media library from the collected candidates (23-media-library Req 11-14).
 *
 *   npx tsx scripts/media/build.ts --thumbs [--limit N]   download and convert thumbnails (resumable)
 *   npx tsx scripts/media/build.ts --records              write public/media/<subject>.json and index.json
 *
 * The thumbnail pass skips every file that already exists, so it can be stopped and started again. The records
 * pass only lists pictures whose thumbnail exists, and reports the rest.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { authorName } from './allow.ts';
import { captionWithBasis } from './caption.ts';
import type { Collected } from './collect.ts';
import { requestCount } from './http.ts';
import { readRecords } from './licences.ts';
import { MIN_PER_ARTICLE, commonsTitle, keepFor, kindOf, qualityOf, selectForArticle, subjectOf, type Kind } from './select.ts';
import { IMG_DIR, ensureThumb, folderBytes, thumbName } from './thumbs.ts';

const CANDIDATES = join('data', 'media', 'candidates');
const OUT = join('public', 'media');

interface Saved {
  article: { key: string; pack: string; id: string; title: string };
  links?: { enTitle?: string; category?: string };
  candidates: Collected[];
}

/** What one picture is in the library. */
export interface MediaItem {
  id: string;
  article: string;
  articleTitle: string;
  kind: Kind;
  title: string;
  page: string;
  author: string;
  licence: string;
  licenceUrl: string;
  caption: string;
  captionFrom: string;
  alt: string;
  description: string;
  width: number;
  height: number;
  thumb: string;
  tw: number;
  th: number;
  verified: string;
  /** 3 Commons Featured picture, 2 Quality image, 1 Valued image, 0 none. */
  quality: number;
  /** The first picture of its article (the lead). */
  lead: boolean;
}

function* articles(): Generator<{ saved: Saved; chosen: Collected[] }> {
  for (const f of readdirSync(CANDIDATES).filter((x) => x.endsWith('.json')).sort()) {
    const saved = JSON.parse(readFileSync(join(CANDIDATES, f), 'utf8')) as Saved;
    // Candidates saved before titles were normalised may carry another wiki's "Datei:" or "Archivo:".
    saved.candidates = saved.candidates.map((c) => ({ ...c, title: commonsTitle(c.title) }));
    yield { saved, chosen: selectForArticle(saved.candidates, keepFor(saved.article.pack), subjectOf(saved.article, saved.links)) };
  }
}

function report(failed: string[]): void {
  const f = folderBytes();
  console.log(`${f.files} thumbnails, ${(f.bytes / 1048576).toFixed(1)} MB.`);
  if (failed.length > 0) console.log(`Failed (retried on the next run): ${failed.length}\n  ${failed.slice(0, 8).join('\n  ')}`);
}

async function thumbs(limit: number): Promise<void> {
  mkdirSync(IMG_DIR, { recursive: true });
  let made = 0;
  let kept = 0;
  const failed: string[] = [];
  for (const { saved, chosen } of articles()) {
    for (const c of chosen) {
      if (existsSync(join(IMG_DIR, thumbName(c.sha1)))) {
        kept++;
        continue;
      }
      if (made >= limit) {
        console.log(`Stopped at the limit: ${made} made, ${kept} already there.`);
        report(failed);
        return;
      }
      try {
        await ensureThumb(c.sha1, c.thumbUrl);
        made++;
        if (made % 25 === 0) console.log(`  ${made} made (${saved.article.key}), ${requestCount()} requests`);
      } catch (error) {
        failed.push(`${c.title}: ${String(error).slice(0, 80)}`);
      }
    }
  }
  console.log(`Done: ${made} made, ${kept} already there.`);
  report(failed);
}

/** The Commons titles already used by bundled photographs (leads, covers, kit), which the picture of the day avoids. */
function bundledTitles(): Set<string> {
  return new Set(readRecords(readFileSync('CREDITS.md', 'utf8')).map((r) => r.title.toLowerCase()));
}

/** A small stable hash, to order pictures the same way every build. */
function hashOf(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * The picture of each day of the year (366): large photographs with a real caption, taken round the subjects in
 * turn so no subject runs for days, and never one that a bundled photograph already shows (Req 19, Property 3).
 */
export function dailyPictures(items: readonly MediaItem[]): Array<Pick<MediaItem, 'id' | 'article' | 'articleTitle' | 'caption' | 'tw' | 'th' | 'author' | 'licence' | 'licenceUrl' | 'page'>> {
  const used = bundledTitles();
  const good = items
    .filter((m) => m.kind === 'photo' && m.width >= 1600 && m.captionFrom === 'description' && m.caption.length >= 12 && !used.has(m.title.toLowerCase()))
    .sort((a, b) => hashOf(a.id) - hashOf(b.id));
  const groups = new Map<string, MediaItem[]>();
  for (const m of good) groups.set(m.article.split('/')[0] ?? '', [...(groups.get(m.article.split('/')[0] ?? '') ?? []), m]);
  const order: MediaItem[] = [];
  for (let round = 0; order.length < 366 && [...groups.values()].some((g) => g[round]); round++) {
    for (const g of groups.values()) if (g[round] && order.length < 366) order.push(g[round] as MediaItem);
  }
  const pick = (m: MediaItem) => ({ id: m.id, article: m.article, articleTitle: m.articleTitle, caption: m.caption, tw: m.tw, th: m.th, author: m.author, licence: m.licence, licenceUrl: m.licenceUrl, page: m.page });
  return Array.from({ length: 366 }, (_, i) => pick(order[i % Math.max(1, order.length)] as MediaItem)).filter(Boolean);
}

/** Subjects whose pictures look good on a first screen: not anatomy, not apparatus. */
const SHOWY = new Set(['wildlife', 'earth', 'space', 'ancient', 'countries', 'arts', 'people']);

/**
 * The default order of the Pictures screen (24-review-4 Req 3). Tiers, best first: Commons Featured, Quality and
 * Valued photographs and art of the showy subjects; the lead pictures of those; other recognised pictures; other
 * leads; the rest. Inside a tier one picture per article comes before any article repeats, and the articles are
 * mixed by a hash so no subject runs. Body pictures, maps, diagrams and flags never open the screen. Returns each
 * picture's position (0 is first).
 */
export function rankPictures(items: readonly Pick<MediaItem, 'id' | 'article' | 'kind' | 'quality' | 'lead'>[]): Map<string, number> {
  const tierOf = (m: Pick<MediaItem, 'article' | 'kind' | 'quality' | 'lead'>): number => {
    const showy = SHOWY.has(m.article.split('/')[0] ?? '') && !['map', 'diagram', 'flag', 'emblem'].includes(m.kind);
    if (showy && m.quality > 0) return 0;
    if (showy && m.lead) return 1;
    if (m.quality > 0 && m.kind !== 'diagram') return 2;
    if (m.lead) return 3;
    return 4;
  };
  const seenInArticle = new Map<string, number>();
  const keyed = items.map((m) => {
    const n = seenInArticle.get(m.article) ?? 0;
    seenInArticle.set(m.article, n + 1);
    return { m, tier: tierOf(m), n };
  });
  keyed.sort((a, b) => a.tier - b.tier || a.n - b.n || b.m.quality - a.m.quality || hashOf(a.m.article) - hashOf(b.m.article) || a.m.id.localeCompare(b.m.id));
  return new Map(keyed.map((k, i) => [k.m.id, i]));
}

async function records(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const bySubject = new Map<string, MediaItem[]>();
  const missing: string[] = [];
  const short: string[] = [];
  const seen = new Set<string>();
  const captionsInPack = new Set<string>();
  for (const { saved, chosen } of articles()) {
    const items: MediaItem[] = [];
    for (const c of chosen) {
      const file = thumbName(c.sha1);
      if (!existsSync(join(IMG_DIR, file))) {
        missing.push(c.title);
        continue;
      }
      const id = file.replace('.webp', '');
      // One picture is listed once, with the first article that chose it (the thumbnail file is shared).
      if (seen.has(id)) continue;
      const cap = captionWithBasis(c.description, c.title);
      const meta = await sharp(join(IMG_DIR, file)).metadata();
      if (!cap) continue; // selection already drops these; a file with nothing honest to say is not listed
      // The same caption twice in one subject reads as the same picture twice in the grid.
      const capKey = `${saved.article.pack}|${cap.text.toLowerCase()}`;
      if (captionsInPack.has(capKey)) continue;
      captionsInPack.add(capKey);
      seen.add(id);
      items.push({
        id,
        article: saved.article.key,
        articleTitle: saved.article.title,
        kind: kindOf(c),
        title: c.title,
        page: c.page,
        author: authorName(c.author),
        licence: c.licence,
        licenceUrl: c.licenceUrl,
        caption: cap.text,
        captionFrom: cap.source,
        alt: cap.text,
        description: cap.basis.slice(0, 400),
        width: c.width,
        height: c.height,
        thumb: `img/${file}`,
        // The size of the file on disk, so the <img> never shifts by a pixel.
        tw: meta.width ?? 480,
        th: meta.height ?? Math.round((480 * c.height) / Math.max(1, c.width)),
        verified: today,
        quality: qualityOf(c),
        lead: items.length === 0,
      });
    }
    if (items.length < MIN_PER_ARTICLE) short.push(`${saved.article.key} (${items.length})`);
    bySubject.set(saved.article.pack, [...(bySubject.get(saved.article.pack) ?? []), ...items]);
  }
  mkdirSync(OUT, { recursive: true });
  const index: Array<[string, string, string, number, number, string, number]> = [];
  const rank = rankPictures([...bySubject.values()].flat());
  for (const [subject, items] of bySubject) {
    writeFileSync(join(OUT, `${subject}.json`), `${JSON.stringify({ subject, built: today, count: items.length, items })}\n`);
    for (const m of items) index.push([m.id, m.article, m.kind, m.tw, m.th, m.caption, rank.get(m.id) ?? 0]);
  }
  writeFileSync(join(OUT, 'index.json'), `${JSON.stringify({ built: today, count: index.length, subjects: [...bySubject.keys()].sort(), items: index })}\n`);
  writeFileSync(join(OUT, 'daily.json'), `${JSON.stringify({ built: today, days: dailyPictures([...bySubject.values()].flat()) })}\n`);
  // A thumbnail no record points to (a picture dropped by a later filter) is removed, so the folder holds only credited files.
  let removed = 0;
  for (const f of readdirSync(IMG_DIR).filter((x) => x.endsWith('.webp'))) {
    if (!seen.has(f.replace('.webp', ''))) {
      unlinkSync(join(IMG_DIR, f));
      removed++;
    }
  }
  if (removed > 0) console.log(`Removed ${removed} thumbnails no record uses.`);
  console.log(`${index.length} pictures in ${bySubject.size} subject files.`);
  if (missing.length > 0) console.log(`No thumbnail yet for ${missing.length} chosen pictures.`);
  if (short.length > 0) console.log(`Articles under ${MIN_PER_ARTICLE} pictures: ${short.length} (first: ${short.slice(0, 6).join(', ')})`);
}

const args = process.argv.slice(2);
if (process.argv[1]?.endsWith('build.ts')) {
  if (args.includes('--thumbs')) {
    await thumbs(Number(args[args.indexOf('--limit') + 1] || Infinity));
  } else if (args.includes('--records')) {
    await records();
  } else {
    console.log('Use --thumbs [--limit N] or --records.');
  }
}
