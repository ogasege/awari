/**
 * Samples for the two crew reviews of the media library (23-media-library Req 24):
 *   - `media-sample.json`: a seeded random 5% of all pictures, for the licence auditor to check against Commons;
 *   - contact sheets: 200 pictures (spread over every subject) as a few small JPEG sheets of 20 thumbnails each with
 *     their caption, for the design reviewer. Sheets are small on purpose: a reviewer that is handed dozens of
 *     full-page screenshots runs into the request-size limit.
 *
 *   npx tsx scripts/media/sample.ts
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { seeded } from '../../src/lib/quiz/picture.ts';
import type { MediaItem } from '../../src/lib/media/media.ts';

const MEDIA = join('public', 'media');
const OUT = join('docs', 'kiro-evidence', 'crew');
const SHEETS = join(OUT, 'media-sheets');
const CELL_W = 300;
const CELL_H = 210;
const LABEL = 34;
const COLS = 5;
const ROWS = 4;

function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function sheet(items: readonly MediaItem[], n: number): Promise<string> {
  const w = COLS * CELL_W;
  const h = ROWS * (CELL_H + LABEL);
  const tiles = await Promise.all(
    items.map(async (m, i) => {
      const x = (i % COLS) * CELL_W;
      const y = Math.floor(i / COLS) * (CELL_H + LABEL);
      const img = await sharp(join(MEDIA, m.thumb)).resize(CELL_W - 8, CELL_H - 8, { fit: 'contain', background: '#eeeeee' }).jpeg({ quality: 78 }).toBuffer();
      const label = `${m.id.slice(0, 6)} ${m.caption}`.slice(0, 44);
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${CELL_W}" height="${LABEL}"><text x="4" y="22" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#101828">${esc(label)}</text></svg>`);
      return [
        { input: img, left: x + 4, top: y + 4 },
        { input: svg, left: x, top: y + CELL_H },
      ];
    }),
  );
  const file = join(SHEETS, `sheet-${String(n).padStart(2, '0')}.jpg`);
  await sharp({ create: { width: w, height: h, channels: 3, background: '#ffffff' } })
    .composite(tiles.flat())
    .jpeg({ quality: 72 })
    .toFile(file);
  return file;
}

const random = seeded(20261116);
const subjects = readdirSync(MEDIA).filter((f) => f.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(f));
const all: MediaItem[] = subjects.flatMap((f) => (JSON.parse(readFileSync(join(MEDIA, f), 'utf8')) as { items: MediaItem[] }).items);

// 1. 5% for the auditor.
const auditN = Math.ceil(all.length * 0.05);
const audit = shuffle(all, random).slice(0, auditN);
mkdirSync(SHEETS, { recursive: true });
writeFileSync(
  join(OUT, 'media-sample.json'),
  `${JSON.stringify({ seed: 20261116, total: all.length, sample: auditN, items: audit.map((m) => ({ id: m.id, path: `media/${m.thumb}`, title: m.title, author: m.author, licence: m.licence, page: m.page })) }, null, 1)}\n`,
);

// 2. 200 pictures spread over the subjects, for the design reviewer.
const perSubject = Math.ceil(200 / subjects.length);
const chosen: MediaItem[] = [];
for (const f of subjects) {
  const items = (JSON.parse(readFileSync(join(MEDIA, f), 'utf8')) as { items: MediaItem[] }).items;
  chosen.push(...shuffle(items, random).slice(0, perSubject));
}
const design = shuffle(chosen, random).slice(0, 200);
let n = 0;
const files: string[] = [];
for (let i = 0; i < design.length; i += COLS * ROWS) {
  files.push(await sheet(design.slice(i, i + COLS * ROWS), ++n));
}
writeFileSync(
  join(SHEETS, 'index.json'),
  `${JSON.stringify({ pictures: design.length, sheets: files.length, items: design.map((m, i) => ({ sheet: Math.floor(i / (COLS * ROWS)) + 1, cell: (i % (COLS * ROWS)) + 1, id: m.id, article: m.article, caption: m.caption })) })}\n`,
);
console.log(`${auditN} pictures for the auditor of ${all.length}; ${design.length} pictures on ${files.length} contact sheets.`);
