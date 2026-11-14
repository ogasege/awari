/**
 * Commons structured captions (24-review-4 Req 1): the short English caption a Commons editor wrote for a file
 * (the `en` label of its MediaInfo entity). It is a real plain-language caption, so it is the second source after
 * the English description. Fetched politely through the media queue (one request at a time, cached), 50 files per
 * request, and stored in `scripts/media/structured-captions.json` so a rebuild needs no network.
 *
 *   npx tsx scripts/media/structured.ts [--limit N]      fetch labels for every otherwise-allowed file without a caption
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { captionFor } from './caption.ts';
import { api } from './http.ts';
import { rejectReason, subjectOf } from './select.ts';

const COMMONS = 'https://commons.wikimedia.org/w/api.php';
export const STRUCTURED_FILE = join('scripts', 'media', 'structured-captions.json');

export interface StructuredFile {
  note: string;
  /** Commons file title -> English label ('' when the file has none, so it is not asked again). */
  labels: Record<string, string>;
}

export function readStructured(): StructuredFile {
  return existsSync(STRUCTURED_FILE)
    ? (JSON.parse(readFileSync(STRUCTURED_FILE, 'utf8')) as StructuredFile)
    : { note: 'Commons structured captions (en label), fetched by scripts/media/structured.ts', labels: {} };
}

interface QueryReply {
  query?: { pages?: Array<{ pageid?: number; title: string; missing?: boolean }>; normalized?: Array<{ from: string; to: string }> };
}
interface EntitiesReply {
  entities?: Record<string, { labels?: { en?: { value?: string } } }>;
}

/** Labels for up to 50 titles: page ids first, then the MediaInfo entities of those ids. */
export async function fetchLabels(titles: readonly string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const q = await api<QueryReply>(COMMONS, { action: 'query', titles: titles.join('|'), prop: 'info' });
  const byTitle = new Map<string, string>(); // normalised title -> asked title
  for (const t of titles) byTitle.set(t.replace(/_/g, ' '), t);
  for (const n of q.query?.normalized ?? []) if (byTitle.has(n.from)) byTitle.set(n.to, n.from);
  const byId = new Map<string, string>();
  for (const p of q.query?.pages ?? []) {
    const asked = byTitle.get(p.title) ?? p.title;
    out[asked] = '';
    if (p.pageid !== undefined && !p.missing) byId.set(`M${p.pageid}`, asked);
  }
  if (byId.size === 0) return out;
  const e = await api<EntitiesReply>(COMMONS, { action: 'wbgetentities', ids: [...byId.keys()].join('|'), props: 'labels', languages: 'en' });
  for (const [id, entity] of Object.entries(e.entities ?? {})) {
    const asked = byId.get(id);
    const label = entity.labels?.en?.value;
    if (asked !== undefined && label) out[asked] = label.trim();
  }
  return out;
}

/** Titles of files that are allowed in every other respect but have no caption from their description. */
export function titlesNeedingLabels(): string[] {
  const dir = join('data', 'media', 'candidates');
  const need = new Set<string>();
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const s = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { article: { pack: string; title: string }; links?: { enTitle?: string; category?: string }; candidates: Array<Parameters<typeof rejectReason>[0]> };
    const subject = subjectOf(s.article, s.links);
    for (const c of s.candidates) {
      if (rejectReason(c, subject, { skipCaption: true }) !== undefined) continue;
      if (captionFor(c.description, c.title, { onlyDescription: true }) === undefined) need.add(c.title);
    }
  }
  return [...need].sort();
}

if (process.argv[1]?.endsWith('structured.ts')) {
  const args = process.argv.slice(2);
  const limit = Number(args[args.indexOf('--limit') + 1] || Infinity);
  const file = readStructured();
  const todo = titlesNeedingLabels().filter((t) => file.labels[t] === undefined);
  console.log(`${todo.length} files to ask about (${Object.keys(file.labels).length} already known).`);
  let asked = 0;
  for (let i = 0; i < todo.length && asked < limit; i += 50) {
    const batch = todo.slice(i, i + 50);
    Object.assign(file.labels, await fetchLabels(batch));
    asked += batch.length;
    if ((i / 50) % 10 === 9) {
      writeFileSync(STRUCTURED_FILE, `${JSON.stringify(file)}\n`);
      console.log(`  ${asked} asked, ${Object.values(file.labels).filter(Boolean).length} labels so far`);
    }
  }
  writeFileSync(STRUCTURED_FILE, `${JSON.stringify(file)}\n`);
  console.log(`Done: ${asked} asked, ${Object.values(file.labels).filter(Boolean).length} of ${Object.keys(file.labels).length} files have an English label.`);
}
