/**
 * Downloads the reviewed subject cover photographs (src/lib/packs/covers.ts)
 * from Wikimedia Commons into public/photos/covers/, after checking each
 * file's licence and author against Commons itself (21-review-2 Req 5).
 *
 *   npx tsx scripts/prepare-cover-photos.ts          # check only, print the table
 *   npx tsx scripts/prepare-cover-photos.ts --write  # download, resize, print CREDITS rows
 */
import { mkdirSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { SUBJECT_COVERS } from '../src/lib/packs/covers.ts';

const write = process.argv.includes('--write');
const OPEN = /^(public domain|pd|cc0|cc[- ]by(?:[- ]sa)?[- ][0-9.]+)/i;
const API = 'https://commons.wikimedia.org/w/api.php';

interface Meta {
  author: string;
  licence: string;
  url: string;
  page: string;
  width: number;
}

interface ImageInfo {
  url: string;
  thumburl?: string;
  descriptionurl: string;
  width: number;
  extmetadata?: Record<string, { value?: string }>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function meta(file: string, attempt = 0): Promise<Meta> {
  await sleep(2500);
  const q = new URLSearchParams({
    action: 'query',
    titles: `File:${file}`,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '960',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': 'Awari/0.1 (hackathon; cover photo check)' } });
  const text = await res.text();
  if (text.startsWith('You are') && attempt < 4) {
    await sleep(15_000);
    return meta(file, attempt + 1);
  }
  const json = JSON.parse(text) as { query: { pages: Record<string, { imageinfo?: ImageInfo[] }> } };
  const info = Object.values(json.query.pages)[0]?.imageinfo?.[0];
  if (!info) throw new Error(`${file}: not on Commons`);
  const ext = info.extmetadata ?? {};
  const strip = (s: string | undefined) => (s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return {
    author: strip(ext.Artist?.value) || 'unknown',
    licence: strip(ext.LicenseShortName?.value),
    url: info.thumburl ?? info.url,
    page: info.descriptionurl,
    width: info.width,
  };
}

mkdirSync('public/photos/covers', { recursive: true });
let bad = 0;
for (const cover of SUBJECT_COVERS) {
  if (cover.source === 'bundled') {
    console.log(`${cover.subject.padEnd(11)} bundled ${cover.file}`);
    continue;
  }
  try {
    const m = await meta(cover.commons);
    const open = OPEN.test(m.licence);
    if (!open) bad++;
    console.log(`${cover.subject.padEnd(11)} ${open ? 'ok ' : 'BAD'} ${m.licence} | ${m.author.slice(0, 40)} | ${cover.commons} | ${m.width}px`);
    if (write && open) {
      const img = await fetch(m.url, { headers: { 'User-Agent': 'Awari/0.1 (hackathon; cover photo)' } });
      const out = `public/photos/covers/${cover.subject}.jpg`;
      await sharp(Buffer.from(await img.arrayBuffer()))
        .resize({ width: 960, height: 900, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 72, mozjpeg: true })
        .toFile(out);
      console.log(`  -> ${out} ${Math.round(statSync(out).size / 1024)} KB`);
      console.log(`  | ${out.replace('public/', '')} | ${cover.caption} | ${m.author} | ${m.licence} | ${m.page} |`);
    }
  } catch (e) {
    bad++;
    console.log(`${cover.subject.padEnd(11)} ERR ${(e as Error).message}`);
  }
}
if (bad > 0) {
  console.error(`${bad} cover(s) failed the licence check`);
  process.exit(1);
}
