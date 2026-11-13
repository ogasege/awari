/**
 * Applies the lead-photo overrides to the committed packs without a full
 * `npm run packs` rebuild (21-review-2 Req 20): for each override, checks the
 * Commons licence, downloads and resizes the file into public/packs/img,
 * rewrites the article's lead photo, then regenerates the CREDITS packs
 * region and the manifest. An override whose file fails a check, or whose
 * download fails (for example Commons throttling), is reported and skipped;
 * run it again to retry only the ones still missing.
 *
 *   npx tsx scripts/packs/apply-lead-overrides.ts
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SUBJECTS } from '../../src/lib/packs/subjects.ts';
import type { Article } from '../../src/lib/packs/types.ts';
import { renderCredits, replaceRegion, type PhotoCredit } from './credits.ts';
import { LEAD_OVERRIDES } from './lead-overrides.ts';
import { MANIFEST_FILE, buildManifest } from './manifest.ts';
import { choosePhoto } from './photos.ts';

const DIR = join('public', 'packs');
const read = (key: string): Article => JSON.parse(readFileSync(join(DIR, `${key}.json`), 'utf8')) as Article;

const failed: string[] = [];
let applied = 0;
for (const [key, override] of LEAD_OVERRIDES) {
  const article = read(key);
  const current = article.photos[0];
  if (current?.caption === override.caption && current.credit.name.endsWith(override.file)) {
    continue; // already applied
  }
  try {
    const slug = current ? (current.file.replace(/^img\//, '').replace(/\.jpg$/, '')) : article.id;
    const chosen = await choosePhoto(
      { slug, title: article.title, wikiTitle: article.title, pack: article.pack, queries: [], override },
      DIR,
    );
    if (!chosen) throw new Error('no photo chosen');
    writeFileSync(join(DIR, `${key}.json`), `${JSON.stringify({ ...article, photos: [chosen.photo] })}\n`);
    applied += 1;
    console.log(`ok   ${key} <- ${override.file} (${chosen.photo.credit.licence}, ${chosen.photo.credit.author ?? '?'})`);
  } catch (error) {
    failed.push(key);
    console.log(`FAIL ${key}: ${(error as Error).message.slice(0, 160)}`);
  }
}

// The countries index carries a thumbnail per country (the stamps use it).
const indexPath = join(DIR, 'countries', 'index.json');
const countryIndex = JSON.parse(readFileSync(indexPath, 'utf8')) as { items: Array<{ id: string; thumb?: string }> };
for (const item of countryIndex.items) {
  const file = (JSON.parse(readFileSync(join(DIR, 'countries', `${item.id}.json`), 'utf8')) as Article).photos[0]?.file;
  if (file && item.thumb !== file) item.thumb = file;
}
writeFileSync(indexPath, `${JSON.stringify(countryIndex)}\n`);

// CREDITS: one row per article lead photo, as the full build writes them.
const credits: PhotoCredit[] = [];
for (const s of SUBJECTS) {
  for (const f of readdirSync(join(DIR, s.id))) {
    if (f === 'index.json' || !f.endsWith('.json')) continue;
    const a = JSON.parse(readFileSync(join(DIR, s.id, f), 'utf8')) as Partial<Article>;
    const photo = a.photos?.[0];
    if (a.title && photo) credits.push({ path: `packs/${photo.file}`, subject: a.title, photo });
  }
}
const before = readFileSync('CREDITS.md', 'utf8');
const retrieved = /on or before (\d{4}-\d{2}-\d{2})/.exec(before)?.[1] ?? new Date().toISOString().slice(0, 10);
writeFileSync('CREDITS.md', replaceRegion(before, renderCredits(credits, retrieved)));
const prev = JSON.parse(readFileSync(join(DIR, MANIFEST_FILE), 'utf8')) as { built: string };
writeFileSync(join(DIR, MANIFEST_FILE), `${JSON.stringify(buildManifest(DIR, prev.built))}\n`);
console.log(`${applied} applied, ${failed.length} failed${failed.length ? `: ${failed.join(', ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
