/**
 * Builds `dist/sw.js` (09-offline Req 1.1): lists the built files,
 * hashes them into a version and bundles `src/sw/sw.ts` with both
 * injected. Runs as the last step of `npm run build`.
 */
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import { precacheList, versionOf } from '../src/sw/strategy.ts';
import { listFiles } from './lib/files.ts';

const DIST = 'dist';

if (!statSync(join(DIST, 'index.html'), { throwIfNoEntry: false })) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const files = listFiles(DIST).filter((f) => f !== 'sw.js');
const urls = precacheList(files);
const hash = (f: string): string =>
  createHash('sha1').update(readFileSync(join(DIST, f))).digest('hex').slice(0, 12);
const version = versionOf(files.map((f) => [`/${f}`, hash(f)] as const));

await build({
  entryPoints: ['src/sw/sw.ts'],
  outfile: join(DIST, 'sw.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2022',
  define: {
    __PRECACHE__: JSON.stringify(urls),
    __VERSION__: JSON.stringify(version),
  },
  logLevel: 'warning',
});

console.log(`Service worker: ${urls.length} files, version ${version}.`);
