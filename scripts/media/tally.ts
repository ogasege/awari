/**
 * Counts what the library would hold from the collected candidates (23-media-library Req 15, 16):
 * pictures per article, the total, and the articles under four (the gap list).
 *
 *   npx tsx scripts/media/tally.ts
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Collected } from './collect.ts';
import { MIN_PER_ARTICLE, commonsTitle, keepFor, selectForArticle, subjectOf } from './select.ts';

const DIR = join('data', 'media', 'candidates');

export interface Tally {
  articles: number;
  total: number;
  unique: number;
  short: Array<{ key: string; count: number; found: number }>;
  bySubject: Record<string, number>;
}

export function tally(): Tally {
  const out: Tally = { articles: 0, total: 0, unique: 0, short: [], bySubject: {} };
  const seen = new Set<string>();
  for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json')).sort()) {
    const d = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as { article: { key: string; pack: string; title: string }; links?: { enTitle?: string; category?: string }; candidates: Collected[] };
    const chosen = selectForArticle(d.candidates.map((c) => ({ ...c, title: commonsTitle(c.title) })), keepFor(d.article.pack), subjectOf(d.article, d.links));
    out.articles++;
    out.total += chosen.length;
    for (const c of chosen) seen.add(c.sha1 || c.title);
    out.bySubject[d.article.pack] = (out.bySubject[d.article.pack] ?? 0) + chosen.length;
    if (chosen.length < MIN_PER_ARTICLE) out.short.push({ key: d.article.key, count: chosen.length, found: d.candidates.length });
  }
  out.unique = seen.size;
  return out;
}

if (process.argv[1]?.endsWith('tally.ts')) {
  const t = tally();
  console.log(`${t.articles} articles, ${t.total} pictures chosen (${t.unique} distinct files).`);
  console.log(JSON.stringify(t.bySubject));
  console.log(`Under ${MIN_PER_ARTICLE}: ${t.short.length}`);
  for (const s of t.short) console.log(`  ${s.key}: ${s.count} (of ${s.found} found)`);
}
