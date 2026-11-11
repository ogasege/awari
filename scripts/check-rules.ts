/**
 * Fails when a hackathon hard rule is broken: `.kiro` missing or ignored,
 * the banned product name in tracked files, or a non-MIT licence.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { findBannedMentions, gitignoreHidesKiro } from './lib/rules.ts';
import { listFiles } from './lib/files.ts';

const problems: string[] = [];

for (const dir of ['.kiro/steering', '.kiro/specs', '.kiro/hooks']) {
  if (listFiles(dir).length === 0) {
    problems.push(`${dir} is missing or empty`);
  }
}

const gitignore = existsSync('.gitignore')
  ? readFileSync('.gitignore', 'utf8')
  : '';
if (gitignoreHidesKiro(gitignore)) {
  problems.push('.gitignore hides the .kiro folder');
}

const tracked = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { encoding: 'utf8' },
)
  .split('\n')
  .filter((p) => p !== '' && existsSync(p))
  .filter((p) => !/\.(png|jpe?g|webp|woff2?|ico)$/i.test(p))
  .filter((p) => !p.startsWith('public/packs/'));
const files = tracked.map((path) => ({
  path,
  text: readFileSync(path, 'utf8'),
}));
for (const path of findBannedMentions(files)) {
  problems.push(`${path} mentions the banned product name`);
}

const licence = existsSync('LICENSE') ? readFileSync('LICENSE', 'utf8') : '';
if (!licence.startsWith('MIT License')) {
  problems.push('LICENSE is missing or is not MIT');
}

if (problems.length > 0) {
  console.error(`Hard-rule check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Hard-rule check passed (${files.length} files scanned).`);
