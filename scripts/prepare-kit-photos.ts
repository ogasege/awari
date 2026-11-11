/**
 * Resizes the ten Wikimedia Commons photos from the design kit
 * (`design/photos`, credited in `design/CREDITS.md`) into web-sized JPEGs
 * under `public/photos/`. Run with `npx tsx scripts/prepare-kit-photos.ts`.
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import sharp from 'sharp';

mkdirSync('public/photos', { recursive: true });
for (const file of readdirSync('design/photos').filter((f) => f.endsWith('.jpg'))) {
  const out = `public/photos/${file}`;
  await sharp(`design/photos/${file}`)
    .resize({ width: 960, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(out);
  console.log(`${out} ${Math.round(statSync(out).size / 1024)} KB`);
}
