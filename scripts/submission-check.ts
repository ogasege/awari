/**
 * `npm run submission-check` (12-submission-pack Req 2): fails if the
 * entry could be disqualified or is incomplete. Runs, in order: the
 * hard-rule and credit gates, the required documents, the video shot
 * list, a secret scan, then lint, typecheck, tests, the build and the
 * first-load budget. It never publishes or spends anything.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import {
  REQUIRED_DOCS,
  findSecrets,
  parseShots,
  shotListProblems,
} from './lib/submission.ts';

const problems: string[] = [];
const note = (message: string): void => {
  problems.push(message);
};

// 1. Documents.
for (const doc of REQUIRED_DOCS) {
  if (!existsSync(doc) || statSync(doc).size === 0) {
    note(`${doc} is missing or empty`);
  }
}

// 2. The video script's shot list adds up to 2:55.
if (existsSync('docs/video-script.md')) {
  for (const p of shotListProblems(parseShots(readFileSync('docs/video-script.md', 'utf8')))) {
    note(`docs/video-script.md: ${p}`);
  }
}

// 3. Secrets, in every file that is committed or could be.
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
  .split('\n')
  .filter((p) => p !== '' && existsSync(p))
  .filter((p) => !/\.(png|jpe?g|webp|woff2?|ico|gif)$/i.test(p) && !p.endsWith('package-lock.json'))
  .filter((p) => statSync(p).size < 2_000_000);
const secrets = findSecrets(files.map((path) => ({ path, text: readFileSync(path, 'utf8') })));
for (const s of secrets) {
  note(`possible secret (${s.kind}) at ${s.path}:${s.line}`);
}
console.log(`Secret scan: ${files.length} files, ${secrets.length} finding(s).`);

// 4. The existing gates and the full check, run as real commands.
function run(name: string, args: string[]): void {
  console.log(`\n$ npm run ${args.join(' ')}`);
  const result = spawnSync('npm', ['run', ...args], { stdio: 'inherit' });
  if (result.status !== 0) {
    note(`${name} failed`);
  }
}
run('hard-rule check', ['rules']);
run('credits check', ['credits']);
run('lint, typecheck, tests, build and bundle budget', ['check']);

if (problems.length > 0) {
  console.error(`\nSubmission check FAILED:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nSubmission check passed: hard rules, credits, documents, secrets, build and tests.');
