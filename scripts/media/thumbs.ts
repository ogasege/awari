/**
 * Thumbnails for the media library (23-media-library Req 11): WebP, 480 px wide, aimed at about 25 KB, with a
 * hard ceiling per file and a budget for the whole folder (under 150 MB).
 *
 *   npx tsx scripts/media/thumbs.ts --check     size of public/media/img against the budget
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { fetchBinary } from './http.ts';

export const THUMB_WIDTH = 480;
/** The size we aim at, the ceiling for one file, and the budget for the whole folder. */
export const TARGET_BYTES = 25 * 1024;
export const MAX_BYTES = 45 * 1024;
export const BUDGET_BYTES = 150 * 1024 * 1024;
export const IMG_DIR = join('public', 'media', 'img');

export interface Thumb {
  buffer: Buffer;
  width: number;
  height: number;
  quality: number;
}

/** Converts a picture to WebP at 480 px wide, lowering the quality until it is near the target size. */
export async function toWebp(input: Buffer, target = TARGET_BYTES): Promise<Thumb> {
  let last: Thumb | undefined;
  for (const quality of [72, 64, 56, 48, 40, 34]) {
    const { data, info } = await sharp(input)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    last = { buffer: data, width: info.width, height: info.height, quality };
    if (data.length <= target) break;
  }
  return last as Thumb;
}

/** The file name of a thumbnail: the first 16 hex digits of the Commons sha1, so one file is stored once. */
export function thumbName(sha1: string): string {
  return `${sha1.slice(0, 16)}.webp`;
}

/** Downloads (through the queue), converts and writes one thumbnail; an existing file is kept. */
export async function ensureThumb(sha1: string, url: string): Promise<{ file: string; bytes: number; width: number; height: number }> {
  mkdirSync(IMG_DIR, { recursive: true });
  const file = thumbName(sha1);
  const path = join(IMG_DIR, file);
  if (existsSync(path)) {
    const meta = await sharp(path).metadata();
    return { file, bytes: statSync(path).size, width: meta.width ?? 0, height: meta.height ?? 0 };
  }
  const t = await toWebp(await fetchBinary(url));
  writeFileSync(path, t.buffer);
  return { file, bytes: t.buffer.length, width: t.width, height: t.height };
}

/** A sentence when the folder is over the budget, otherwise undefined. */
export function budgetProblem(totalBytes: number, limit = BUDGET_BYTES): string | undefined {
  return totalBytes > limit ? `thumbnails use ${(totalBytes / 1048576).toFixed(1)} MB, over the ${(limit / 1048576).toFixed(0)} MB budget` : undefined;
}

export function folderBytes(dir = IMG_DIR): { files: number; bytes: number; biggest: number } {
  if (!existsSync(dir)) return { files: 0, bytes: 0, biggest: 0 };
  const sizes = readdirSync(dir)
    .filter((f) => f.endsWith('.webp'))
    .map((f) => statSync(join(dir, f)).size);
  return { files: sizes.length, bytes: sizes.reduce((a, b) => a + b, 0), biggest: Math.max(0, ...sizes) };
}

if (process.argv[1]?.endsWith('thumbs.ts') && process.argv.includes('--check')) {
  const f = folderBytes();
  console.log(`${f.files} thumbnails, ${(f.bytes / 1048576).toFixed(1)} MB, biggest ${(f.biggest / 1024).toFixed(0)} KB, average ${f.files ? Math.round(f.bytes / f.files / 1024) : 0} KB.`);
  const problem = budgetProblem(f.bytes) ?? (f.biggest > MAX_BYTES * 1.5 ? `a thumbnail is ${(f.biggest / 1024).toFixed(0)} KB` : undefined);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }
}
