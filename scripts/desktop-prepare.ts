/**
 * `npm run desktop:prepare` (25-desktop): builds the web app exactly as for the site and copies
 * dist/ plus LICENSE, NOTICE and CREDITS.md into desktop/site/ for the Electron wrapper.
 * The web build is not changed; this only copies its output.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join('desktop', 'site');
if (!existsSync(join('dist', 'sw.js'))) {
  console.error('dist/sw.js not found. Run npm run build first.');
  process.exit(1);
}
rmSync(OUT, { recursive: true, force: true });
cpSync('dist', OUT, { recursive: true });
for (const f of ['LICENSE', 'NOTICE', 'CREDITS.md']) cpSync(f, join(OUT, f));
console.log(`Copied dist/ and the licence files to ${OUT}.`);
