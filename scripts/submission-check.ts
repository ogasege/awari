/**
 * `npm run submission-check` (12-submission-pack Req 2, rules-alignment
 * brief item 9): fails if the entry could be disqualified or its write-up
 * says something the repository does not back. It never publishes or
 * spends anything.
 *
 * Order: `.kiro` folders and git ignores, the MIT licence, required
 * documents, the write-up prompts and wording, generated numbers, named
 * features, the video script, a secret scan, then the rules and credits
 * gates and the full `npm run check`.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { ROUTES } from '../src/app/router.ts';
import { readMediaRecords } from './media/licences.ts';
import { computeStats } from './stats.ts';
import { fillNumbers } from './lib/writeup.ts';
import { REQUIRED_DOCS, findSecrets, parseShots, shotListProblems } from './lib/submission.ts';
import {
  featureProblems,
  isStandardMit,
  numberProblems,
  untaggedCounts,
  videoNameProblems,
  writeupProblems,
  type PromptId,
} from './lib/writeup.ts';

const problems: string[] = [];
const note = (message: string): void => {
  problems.push(message);
};
const read = (p: string): string => (existsSync(p) ? readFileSync(p, 'utf8') : '');

// 1. .kiro has specs, hooks and steering, and git ignores none of them.
for (const dir of ['.kiro/specs', '.kiro/hooks', '.kiro/steering']) {
  if (!existsSync(dir) || readdirSync(dir).length === 0) {
    note(`${dir} is missing or empty`);
    continue;
  }
  const ignored = spawnSync('git', ['check-ignore', '-q', dir]).status === 0;
  const sample = readdirSync(dir).find((f) => statSync(`${dir}/${f}`).isFile() || statSync(`${dir}/${f}`).isDirectory());
  const sampleIgnored = sample ? spawnSync('git', ['check-ignore', '-q', `${dir}/${sample}`]).status === 0 : false;
  if (ignored || sampleIgnored) {
    note(`${dir} is ignored by git`);
  }
}

// 2. The standard MIT text at the root, so GitHub shows it in About.
if (!isStandardMit(read('LICENSE'))) {
  note('LICENSE is not the standard MIT text at the repository root');
}

// 3. Documents.
for (const doc of REQUIRED_DOCS) {
  if (!existsSync(doc) || statSync(doc).size === 0) {
    note(`${doc} is missing or empty`);
  }
}

// 4. The write-up covers every prompt that was really used, in the rules'
//    order, and does not overclaim. Kiro powers were not used, so they may
//    be left out (docs/kiro-usage.json lists what was used).
const usage = existsSync('docs/kiro-usage.json')
  ? (JSON.parse(read('docs/kiro-usage.json')) as { used: PromptId[] })
  : { used: [] as PromptId[] };
if (usage.used.length === 0) {
  note('docs/kiro-usage.json is missing or lists no Kiro features');
}
const writeups = ['README.md', 'docs/devpost.md'];
for (const doc of writeups) {
  for (const p of writeupProblems(doc, read(doc), usage.used)) note(p);
}
for (const doc of ['docs/blog-post.md', 'docs/social-post.md']) {
  for (const p of writeupProblems(doc, read(doc), [])) note(p);
}

// 5. Numbers come from `npm run stats`, not from hands.
const statsPath = 'docs/generated/stats.json';
// The gate recomputes every generated number from the repository and refills the tagged numbers
// (22-review-3 Req 23). A write-up or stats file that was out of date is rewritten AND reported, so a
// stale README or write-up cannot pass quietly: commit the refreshed files and run the gate again.
{
  // Counts that change with every commit or build (commits, log rows, ticked tasks, built script size)
  // are refreshed silently; committing them would change them again.
  const MOVING = new Set(['commits', 'logEntries', 'specTasksDone', 'mainScriptKB']);
  const withoutMoving = (o: Record<string, number | string>): string =>
    JSON.stringify(Object.fromEntries(Object.entries(o).filter(([k]) => !MOVING.has(k))));
  const freshStats = computeStats(false) as Record<string, number | string>;
  const fresh = `${JSON.stringify(freshStats, null, 2)}\n`;
  const storedText = read(statsPath);
  if (storedText !== fresh) {
    const stored = storedText === '' ? {} : (JSON.parse(storedText) as Record<string, number | string>);
    mkdirSync('docs/generated', { recursive: true });
    writeFileSync(statsPath, fresh);
    if (withoutMoving(stored) !== withoutMoving(freshStats)) {
      note(`${statsPath} was stale and has been regenerated`);
    }
  }
  for (const doc of [...writeups, 'docs/blog-post.md', 'docs/social-post.md', 'docs/judges.md', 'docs/video-script.md']) {
    const before = read(doc);
    const after = before === '' ? before : fillNumbers(before, freshStats);
    if (after !== before) {
      writeFileSync(doc, after);
      // Only a content number being out of date is a failure.
      const stale = fillNumbers(before, Object.fromEntries(Object.entries(freshStats).filter(([k]) => !MOVING.has(k))));
      if (stale !== before) note(`${doc} had stale generated numbers and has been refilled`);
    }
  }
}
const stats = existsSync(statsPath) ? (JSON.parse(read(statsPath)) as Record<string, number | string>) : {};
if (Object.keys(stats).length === 0) {
  note(`${statsPath} is missing: run npm run stats`);
}
let checked = 0;
for (const doc of [...writeups, 'docs/blog-post.md', 'docs/social-post.md', 'docs/judges.md', 'docs/video-script.md']) {
  const text = read(doc);
  const result = numberProblems(doc, text, stats);
  checked += result.checked;
  for (const p of result.problems) note(p);
  for (const p of untaggedCounts(doc, text)) note(p);
}

// 5b. Licences come from the Commons API (23-media-library Req 3): the saved answer must be recent, cover every
//     credited image, and have no problem. Run `npm run licences` to refresh it.
{
  const path = 'public/media/licences.json';
  if (!existsSync(path)) {
    note(`${path} is missing: run npm run licences`);
  } else {
    const saved = JSON.parse(read(path)) as { checkedAt: string; problems: number; count: number };
    const ageDays = (Date.now() - Date.parse(saved.checkedAt)) / 86_400_000;
    if (!(ageDays <= 7)) note(`${path} is ${Math.floor(ageDays)} days old: run npm run licences`);
    if (saved.problems > 0) note(`${path} lists ${saved.problems} image(s) with a licence problem`);
    const credited =
      read('CREDITS.md').split('\n').filter((l) => l.startsWith('|') && l.includes('commons.wikimedia.org/wiki/File:')).length +
      readMediaRecords().length;
    if (saved.count < credited) note(`${path} covers ${saved.count} of ${credited} credited images: run npm run licences`);
  }
}

// 6. Every feature the README, write-up or video names has a route and a test.
const routes = new Set(Object.keys(ROUTES));
for (const doc of [...writeups, 'docs/video-script.md']) {
  for (const p of featureProblems(doc, read(doc), routes, existsSync)) note(p);
}

// 7. The video script: 2:55 at most, 40 s of Kiro, no brands or tracks.
const script = read('docs/video-script.md');
for (const p of shotListProblems(parseShots(script))) note(`docs/video-script.md: ${p}`);
for (const p of videoNameProblems(script)) note(p);

// 8. Secrets, in every file that is committed or could be.
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
console.log(`Secret scan: ${files.length} files, ${secrets.length} finding(s). Numbers checked: ${checked}.`);

// 9. The existing gates (hard rules, credits for every bundled asset) and
//    the full check, run as real commands.
function run(name: string, args: string[]): void {
  console.log(`\n$ npm run ${args.join(' ')}`);
  const result = spawnSync('npm', ['run', ...args], { stdio: 'inherit' });
  if (result.status !== 0) {
    note(`${name} failed`);
  }
}
run('hard-rule check', ['rules']);
run('suitability check (ages 8 to 14)', ['suitability']);
run('credits check', ['credits']);
if (!process.argv.includes('--docs-only')) {
  run('lint, typecheck, tests, build and bundle budget', ['check']);
}

if (problems.length > 0) {
  console.error(`\nSubmission check FAILED (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nSubmission check passed: .kiro, licence, documents, write-up, numbers, features, video, secrets, rules, credits, build and tests.');
