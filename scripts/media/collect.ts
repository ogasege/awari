/**
 * The media collector (23-media-library Req 9, 10, 15). It never uses search: for each article it lists the images
 * of the matching English Wikipedia article (`generator=images`) and of the article's Commons category
 * (Wikidata P373, `generator=categorymembers`), with their metadata, in as few requests as possible. Answers are
 * cached by `http.ts`, and each article's candidates are saved to `data/media/candidates/`, so a rerun resumes.
 *
 *   npx tsx scripts/media/collect.ts --only countries/nigeria,wildlife/elephant   named articles
 *   npx tsx scripts/media/collect.ts --limit 50                                  the next 50 not yet collected
 *   npx tsx scripts/media/collect.ts                                             everything left
 *
 * Add `--dry` to print what would be chosen without writing the candidate files.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { plainText } from './allow.ts';
import { api, requestCount } from './http.ts';
import { MIN_PER_ARTICLE, commonsTitle, rejectReason, selectForArticle, type Candidate } from './select.ts';

const EN = 'https://en.wikipedia.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const WIKIDATA = 'https://www.wikidata.org/w/api.php';
const OUT = join('data', 'media', 'candidates');
const PACKS = join('public', 'packs');

export interface ArticleRef {
  key: string;
  pack: string;
  id: string;
  title: string;
  qid: string | undefined;
}

/** What the collector keeps for one Commons file. */
export interface Collected extends Candidate {
  page: string;
  thumbUrl: string;
  sha1: string;
  author: string;
  licenceUrl: string;
  from: 'article' | 'category';
}

interface ImagePage {
  title: string;
  missing?: boolean;
  imagerepository?: string;
  imageinfo?: Array<{
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    width?: number;
    height?: number;
    sha1?: string;
    mime?: string;
    extmetadata?: Record<string, { value?: string } | undefined>;
  }>;
}

interface Reply {
  continue?: Record<string, string>;
  query?: { pages?: ImagePage[] };
}

/** Every article in the bundled packs, with its Wikidata item. */
export function listArticles(): ArticleRef[] {
  const out: ArticleRef[] = [];
  for (const d of readdirSync(PACKS, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    const indexPath = join(PACKS, d.name, 'index.json');
    if (!existsSync(indexPath)) continue;
    const index = JSON.parse(readFileSync(indexPath, 'utf8')) as { items?: Array<{ id: string; title: string }> };
    for (const item of index.items ?? []) {
      const file = join(PACKS, d.name, `${item.id}.json`);
      if (!existsSync(file)) continue;
      const a = JSON.parse(readFileSync(file, 'utf8')) as { qid?: string };
      out.push({ key: `${d.name}/${item.id}`, pack: d.name, id: item.id, title: item.title, qid: a.qid });
    }
  }
  return out;
}

/** Where an article's pictures can be found. */
export interface Links {
  enTitle?: string;
  category?: string;
  /** The same article in other Wikipedias, a fallback for articles with few English pictures. */
  others?: Array<{ wiki: string; title: string }>;
}

interface WikidataReply {
  entities?: Record<string, { sitelinks?: Record<string, { title: string } | undefined>; claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: unknown } } }>> }>;
}

/** The English Wikipedia title and Commons category of each item, 50 items per request. */
export async function wikidataLinks(qids: readonly string[]): Promise<Map<string, Links>> {
  const out = new Map<string, Links>();
  for (let i = 0; i < qids.length; i += 50) {
    const reply = await api<WikidataReply>(WIKIDATA, {
      action: 'wbgetentities',
      ids: qids.slice(i, i + 50).join('|'),
      props: 'sitelinks|claims',
      sitefilter: 'enwiki|dewiki|frwiki|eswiki',
    }, { maxlag: false });
    for (const [qid, e] of Object.entries(reply.entities ?? {})) {
      const cat = e.claims?.['P373']?.[0]?.mainsnak?.datavalue?.value;
      const others = (['dewiki', 'frwiki', 'eswiki'] as const).flatMap((w) => {
        const t = e.sitelinks?.[w]?.title;
        return t ? [{ wiki: w.replace('wiki', ''), title: t }] : [];
      });
      out.set(qid, {
        ...(e.sitelinks?.['enwiki']?.title ? { enTitle: e.sitelinks['enwiki'].title } : {}),
        ...(typeof cat === 'string' ? { category: cat } : {}),
        ...(others.length > 0 ? { others } : {}),
      });
    }
  }
  return out;
}

const IMAGE_PARAMS = {
  action: 'query',
  prop: 'imageinfo',
  iiprop: 'extmetadata|url|size|sha1|mime',
  redirects: '1',
  iiurlwidth: '480',
  iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Restrictions|ImageDescription|Categories',
};

function toCollected(p: ImagePage, from: 'article' | 'category'): Collected | undefined {
  const i = p.imageinfo?.[0];
  // A Commons file seen through another wiki is flagged `missing` for that wiki; its imageinfo is what counts.
  if (!i || !(i.thumburl ?? i.url)) return undefined;
  const m = i.extmetadata ?? {};
  return {
    title: commonsTitle(p.title),
    width: i.width ?? 0,
    height: i.height ?? 0,
    mime: i.mime ?? '',
    licence: plainText(m['LicenseShortName']?.value),
    restrictions: plainText(m['Restrictions']?.value),
    repository: p.imagerepository ?? '',
    description: plainText(m['ImageDescription']?.value),
    categories: plainText((m['Categories']?.value ?? '').replace(/\|/g, ' | ')).split(' | ').filter((c) => c !== ''),
    page: i.descriptionurl ?? '',
    thumbUrl: i.thumburl ?? i.url ?? '',
    sha1: i.sha1 ?? '',
    author: plainText(m['Artist']?.value),
    licenceUrl: plainText(m['LicenseUrl']?.value),
    from,
  };
}

/** Follows API continuation up to `pages` times. */
async function listPages(endpoint: string, params: Record<string, string>, from: 'article' | 'category', pages = 3): Promise<Collected[]> {
  const out: Collected[] = [];
  let more: Record<string, string> = {};
  for (let n = 0; n < pages; n++) {
    let reply: Reply;
    try {
      reply = await api<Reply>(endpoint, { ...IMAGE_PARAMS, ...params, ...more });
    } catch (error) {
      // A page or document file (.djvu, .pdf) makes the API refuse the whole request when a thumbnail width is
      // asked for. Ask again without it: those files are rejected by the mime filter anyway.
      if (!String(error).includes('urlparamnormal')) throw error;
      const without: Record<string, string> = { ...IMAGE_PARAMS, ...params, ...more };
      delete without['iiurlwidth'];
      reply = await api<Reply>(endpoint, without);
    }
    for (const p of reply.query?.pages ?? []) {
      const c = toCollected(p, from);
      if (c) out.push(c);
    }
    if (!reply.continue) break;
    more = reply.continue;
  }
  return out;
}

interface SubcatReply {
  query?: { categorymembers?: Array<{ title: string }> };
}

/** The first few subcategories of a Commons category (Elephants has Elephas maximus, Loxodonta africana ...). */
async function subcategories(category: string, count = 4): Promise<string[]> {
  const reply = await api<SubcatReply>(COMMONS, {
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${category}`,
    cmtype: 'subcat',
    cmlimit: '30',
  });
  return (reply.query?.categorymembers ?? [])
    .map((m) => m.title.replace(/^Category:/, ''))
    .filter((t) => !/\b(?:by|in|of) (?:country|year|location|date|photographer|author)|\bmaps?\b|\bhistory\b|\bculture\b|\bmedia\b|\bportal\b|\bartworks?\b|\bstamps?\b|\bdiagrams?\b/i.test(t))
    .slice(0, count);
}

/** All candidates for one article: its English Wikipedia images, then its Commons category. */
export async function collectArticle(links: Links): Promise<Collected[]> {
  const found: Collected[] = [];
  if (links.enTitle) {
    found.push(...(await listPages(EN, { generator: 'images', titles: links.enTitle, gimlimit: '50' }, 'article')));
  }
  if (links.category) {
    found.push(
      ...(await listPages(COMMONS, { generator: 'categorymembers', gcmtitle: `Category:${links.category}`, gcmtype: 'file', gcmlimit: '50' }, 'category', 2)),
    );
  }
  const seen = new Set<string>();
  return found.filter((c) => (seen.has(c.title) ? false : (seen.add(c.title), true)));
}

/** Like `collectArticle`, and when fewer than four pictures qualify, looks one level down the Commons category. */
export async function collectWithFallback(links: Links): Promise<Collected[]> {
  const first = await collectArticle(links);
  if (selectForArticle(first).length >= MIN_PER_ARTICLE) return first;
  const extra: Collected[] = [];
  for (const o of links.others ?? []) {
    extra.push(...(await listPages(`https://${o.wiki}.wikipedia.org/w/api.php`, { generator: 'images', titles: o.title, gimlimit: '50' }, 'article', 2)));
    if (selectForArticle([...first, ...extra]).length >= MIN_PER_ARTICLE + 2) break;
  }
  for (const sub of links.category && selectForArticle([...first, ...extra]).length < MIN_PER_ARTICLE ? await subcategories(links.category) : []) {
    extra.push(...(await listPages(COMMONS, { generator: 'categorymembers', gcmtitle: `Category:${sub}`, gcmtype: 'file', gcmlimit: '30' }, 'category', 1)));
  }
  const seen = new Set(first.map((c) => c.title));
  return [...first, ...extra.filter((c) => (seen.has(c.title) ? false : (seen.add(c.title), true)))];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const arg = (name: string): string | undefined => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const only = arg('--only')?.split(',').filter(Boolean);
  const limit = Number(arg('--limit') ?? Infinity);
  const dry = args.includes('--dry');
  mkdirSync(OUT, { recursive: true });
  let todo = listArticles().filter((a) => (only ? only.includes(a.key) : true));
  if (!only) todo = todo.filter((a) => !existsSync(join(OUT, `${a.key.replace('/', '__')}.json`)));
  todo = todo.slice(0, limit);
  const links = await wikidataLinks([...new Set(todo.map((a) => a.qid).filter((q): q is string => !!q))]);
  let enough = 0;
  const short: string[] = [];
  const failed: string[] = [];
  for (const a of todo) {
    const l: Links = a.qid ? (links.get(a.qid) ?? {}) : {};
    let all: Collected[];
    try {
      all = await collectWithFallback(l);
    } catch (error) {
      failed.push(`${a.key}: ${String(error).slice(0, 120)}`);
      console.log(`${a.key.padEnd(38)} FAILED ${String(error).slice(0, 100)}`);
      continue;
    }
    const chosen = selectForArticle(all);
    const allowed = all.filter((c) => rejectReason(c) === undefined).length;
    if (chosen.length >= MIN_PER_ARTICLE) enough++;
    else short.push(`${a.key} (${chosen.length})`);
    console.log(`${a.key.padEnd(38)} en:${l.enTitle ?? '-'} cat:${l.category ?? '-'} | found ${String(all.length).padStart(3)} allowed ${String(allowed).padStart(3)} chosen ${chosen.length}`);
    if (dry) {
      for (const c of chosen.slice(0, 6)) console.log(`     ${c.title} ${c.width}x${c.height} ${c.licence}`);
    } else {
      writeFileSync(join(OUT, `${a.key.replace('/', '__')}.json`), JSON.stringify({ article: a, links: l, collected: all.length, candidates: all }));
    }
  }
  console.log(`\n${todo.length} articles, ${enough} with at least ${MIN_PER_ARTICLE} pictures, ${requestCount()} network requests.`);
  if (failed.length > 0) console.log(`Failed (will be retried on the next run): ${failed.join('; ')}`);
  if (short.length > 0) console.log(`Short: ${short.join(', ')}`);
}

if (process.argv[1]?.endsWith('collect.ts')) {
  await main();
}
