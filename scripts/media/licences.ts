/**
 * `npm run licences` (23-media-library Req 1-5): asks the Commons API about every bundled image and writes
 * `public/media/licences.json`. Exits non-zero for a missing file, an off-list licence, listed restrictions,
 * or an author or licence that differs from what Awari shows.
 *
 *   npm run licences            ask the API (one request at a time, at least 1 s apart)
 *   npm run licences -- --only photos/   only rows whose path starts with this
 *
 * Contact for the User-Agent: AWARI_CONTACT (an e-mail address or URL); a default project URL otherwise.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkRecord, exitCode, type CommonsAnswer, type ShownRecord, type Verified } from './check.ts';
import { titleFromUrl } from './allow.ts';

const API = 'https://commons.wikimedia.org/w/api.php';
const OUT = 'public/media/licences.json';
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Every CREDITS.md row that names a Commons file: `| path | title | author | licence | url |`. */
export function readRecords(credits: string): ShownRecord[] {
  const out: ShownRecord[] = [];
  for (const line of credits.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    const title = titleFromUrl(cells[4] ?? '');
    if (!title) continue;
    out.push({ path: cells[0] ?? '', title, author: cells[2] ?? '', licence: cells[3] ?? '' });
  }
  return out;
}

/** Every picture of the media library: the records written by `build.ts --records`, one subject file each. */
export function readMediaRecords(dir = 'public/media'): ShownRecord[] {
  const out: ShownRecord[] = [];
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(x))) {
    const file = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { items?: Array<{ thumb: string; title: string; author: string; licence: string }> };
    for (const m of file.items ?? []) out.push({ path: `media/${m.thumb}`, title: m.title, author: m.author, licence: m.licence });
  }
  return out;
}

interface Page extends CommonsAnswer {
  title: string;
}

async function ask(titles: string[]): Promise<Map<string, CommonsAnswer>> {
  const contact = process.env['AWARI_CONTACT'] ?? 'https://github.com/awari-encyclopedia (hackathon project)';
  const body = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    maxlag: '5',
    prop: 'imageinfo',
    iiprop: 'extmetadata|url|size|sha1|mime',
    iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Restrictions|ImageDescription|Credit',
    titles: titles.join('|'),
  });
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'User-Agent': `AwariLicenceCheck/1.0 (${contact})`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        error?: { code?: string };
        query?: { normalized?: Array<{ from: string; to: string }>; redirects?: Array<{ from: string; to: string }>; pages?: Page[] };
      };
      if (json.error?.code === 'maxlag') throw new Error('maxlag');
      const byTitle = new Map((json.query?.pages ?? []).map((p) => [p.title, p] as const));
      const alias = new Map<string, string>();
      for (const n of json.query?.normalized ?? []) alias.set(n.from, n.to);
      for (const r of json.query?.redirects ?? []) alias.set(r.from, r.to);
      const out = new Map<string, CommonsAnswer>();
      for (const t of titles) {
        let k = t;
        for (let i = 0; i < 3 && alias.has(k); i++) k = alias.get(k) ?? k;
        const page = byTitle.get(k);
        if (page) out.set(t, page);
      }
      return out;
    } catch (error) {
      if (attempt === 5) throw error;
      await sleep(3000 * attempt);
    }
  }
  return new Map();
}

async function main(): Promise<void> {
  const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] ?? '' : '';
  const records = [...readRecords(readFileSync('CREDITS.md', 'utf8')), ...readMediaRecords()].filter((r) => r.path.startsWith(only));
  const unique = [...new Map(records.map((r) => [r.title, r])).values()];
  console.log(`${records.length} credited images, ${unique.length} Commons files to check.`);
  const answers = new Map<string, CommonsAnswer>();
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50).map((r) => r.title);
    for (const [k, v] of await ask(batch)) answers.set(k, v);
    console.log(`  asked ${Math.min(i + 50, unique.length)} of ${unique.length}`);
    await sleep(1200);
  }
  const results: Verified[] = records.map((r) => checkRecord(r, answers.get(r.title)));
  const bad = results.filter((r) => !r.ok);
  mkdirSync('public/media', { recursive: true });
  let previous: { results: Verified[] } | undefined;
  try {
    previous = only === '' ? undefined : (JSON.parse(readFileSync(OUT, 'utf8')) as { results: Verified[] });
  } catch {
    previous = undefined;
  }
  const merged = previous ? [...previous.results.filter((p) => !p.path.startsWith(only)), ...results] : results;
  writeFileSync(OUT, `${JSON.stringify({ checkedAt: new Date().toISOString(), api: API, count: merged.length, problems: merged.filter((r) => !r.ok).length, results: merged })}\n`);
  for (const b of bad.slice(0, 40)) console.log(`PROBLEM ${b.path}: ${b.problems.join(', ')} (Commons: ${b.commonsLicence}; ${b.commonsAuthor})`);
  console.log(`${results.length - bad.length} of ${results.length} images verified; ${bad.length} problem(s).`);
  process.exit(exitCode(results));
}

if (process.argv[1]?.endsWith('licences.ts')) {
  await main();
}
