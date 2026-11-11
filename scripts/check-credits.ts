/**
 * Fails when a bundled photo or data file under public/ has no licence
 * entry in CREDITS.md.
 */
import { existsSync, readFileSync } from 'node:fs';
import { listFiles } from './lib/files.ts';
import { uncreditedFiles } from './lib/rules.ts';

const credits = existsSync('CREDITS.md')
  ? readFileSync('CREDITS.md', 'utf8')
  : '';
const bundled = listFiles('public');
const missing = uncreditedFiles(bundled, credits);

if (missing.length > 0) {
  console.error(
    `${missing.length} bundled file(s) have no entry in CREDITS.md:\n- ` +
      missing.slice(0, 50).join('\n- '),
  );
  process.exit(1);
}
console.log(`Credits check passed (${bundled.length} bundled files).`);
