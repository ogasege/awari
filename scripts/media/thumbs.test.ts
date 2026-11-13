/** 23-media-library Req 11: WebP at 480 px, near 25 KB, within the budget. */
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { BUDGET_BYTES, MAX_BYTES, THUMB_WIDTH, budgetProblem, thumbName, toWebp } from './thumbs.ts';

async function noisy(width: number, height: number): Promise<Buffer> {
  // Smooth colour fields with a little noise, like a photograph.
  const raw = Buffer.alloc(width * height * 3);
  const noise = randomBytes(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      raw[i] = (x * 255) / width + (noise[i] ?? 0) / 24;
      raw[i + 1] = (y * 255) / height + (noise[i + 1] ?? 0) / 24;
      raw[i + 2] = 128 + (noise[i + 2] ?? 0) / 24;
    }
  }
  return sharp(raw, { raw: { width, height, channels: 3 } }).jpeg({ quality: 90 }).toBuffer();
}

describe('thumbnails', () => {
  it('makes a WebP 480 px wide, within the per-file ceiling', async () => {
    const t = await toWebp(await noisy(1600, 1000));
    const meta = await sharp(t.buffer).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(THUMB_WIDTH);
    expect(t.buffer.length).toBeLessThanOrEqual(MAX_BYTES);
  });

  it('never enlarges a small picture', async () => {
    const t = await toWebp(await noisy(300, 200));
    expect(t.width).toBe(300);
  });

  it('names a file by its sha1 so one picture is stored once', () => {
    expect(thumbName('0123456789abcdef0123456789abcdef01234567')).toBe('0123456789abcdef.webp');
  });

  it('reports a folder over the 150 MB budget and not one under it', () => {
    expect(budgetProblem(BUDGET_BYTES + 1)).toMatch(/over the 150 MB budget/);
    expect(budgetProblem(BUDGET_BYTES)).toBeUndefined();
    expect(budgetProblem(3000 * 25 * 1024)).toBeUndefined();
  });
});
