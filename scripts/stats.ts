/**
 * `npm run stats`: every number the write-up quotes, computed from the
 * repository instead of typed by hand (rules-alignment brief, item 1).
 * Writes docs/generated/stats.json. Pass --no-tests to reuse the last
 * test report instead of running the suites (the tests row is then the
 * previous run's).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROUTES } from '../src/app/router.ts';
import { WINGS } from '../src/features/castle/castle.ts';
import { TOURS } from '../src/features/tours/tours.ts';
import { SUBJECTS } from '../src/lib/packs/subjects.ts';
import { listFiles } from './lib/files.ts';

export interface Stats {
  [key: string]: number | string;
}

const read = (p: string): string => readFileSync(p, 'utf8');
const json = <T>(p: string): T => JSON.parse(read(p)) as T;
const count = (p: string, re: RegExp): number => (read(p).match(re) ?? []).length;

function testReport(dir: string, out: string, run: boolean): { total: number; passed: number; files: number } {
  if (run) {
    spawnSync('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${join(process.cwd(), out)}`], {
      cwd: dir,
      stdio: 'ignore',
    });
  }
  const report = existsSync(out)
    ? json<{ numTotalTests: number; numPassedTests: number; testResults: unknown[] }>(out)
    : null;
  return { total: report?.numTotalTests ?? 0, passed: report?.numPassedTests ?? 0, files: report?.testResults.length ?? 0 };
}

export function computeStats(runTests: boolean): Stats {
  mkdirSync('data/build', { recursive: true });
  const specs = readdirSync('.kiro/specs').filter((d) => statSync(join('.kiro/specs', d)).isDirectory());
  let tasksDone = 0;
  let tasksAll = 0;
  for (const s of specs) {
    const t = join('.kiro/specs', s, 'tasks.md');
    if (existsSync(t)) {
      tasksDone += count(t, /^\s*- \[x\]/gim);
      tasksAll += count(t, /^\s*- \[[ x]\]/gim);
    }
  }

  const testFiles = [
    ...listFiles('src').map((f) => `src/${f}`),
    ...listFiles('scripts').map((f) => `scripts/${f}`),
    ...listFiles('services/quiz-lambda/test').map((f) => `services/quiz-lambda/test/${f}`),
  ].filter((f) => /\.test\.tsx?$/.test(f));
  const properties = testFiles.reduce(
    (n, f) => n + count(f, /\b(?:it|test)(?:\.each\([^)]*\))?\(\s*['"`]Property \d+/g),
    0,
  );

  const app = testReport('.', 'data/build/vitest-app.json', runTests);
  const lambda = testReport('services/quiz-lambda', 'data/build/vitest-lambda.json', runTests);
  const tfRuns = listFiles('infra/terraform/tests')
    .filter((f) => f.endsWith('.tftest.hcl'))
    .reduce((n, f) => n + count(`infra/terraform/tests/${f}`, /^run "/gm), 0);

  const packs = 'public/packs';
  const idx = (pack: string): number => json<{ items: unknown[] }>(`${packs}/${pack}/index.json`).items.length;
  const bundled = SUBJECTS.map((s) => ({ id: s.id, n: existsSync(`${packs}/${s.id}/index.json`) ? idx(s.id) : 0 }));
  const subjectArticles = bundled
    .filter((b) => b.id !== 'countries' && b.id !== 'physics')
    .reduce((n, b) => n + b.n, 0);
  const quizIndex = existsSync(`${packs}/quizzes/index.json`)
    ? json<{ quizzes: Array<{ questions: number }> }>(`${packs}/quizzes/index.json`).quizzes
    : [];
  const events = existsSync(`${packs}/timeline.json`)
    ? json<{ events: Array<{ subject: string; continent?: string }> }>(`${packs}/timeline.json`).events
    : [];
  const lemmas = existsSync(`${packs}/dictionary`)
    ? readdirSync(`${packs}/dictionary`).reduce(
        (n, f) => n + Object.keys(json<{ entries: object }>(`${packs}/dictionary/${f}`).entries).length,
        0,
      )
    : 0;
  const atlas = existsSync(`${packs}/atlas/countries.json`)
    ? json<{ features: unknown[] }>(`${packs}/atlas/countries.json`).features.length
    : 0;
  const packFiles = listFiles(packs);
  const packBytes = packFiles.reduce((n, f) => n + statSync(join(packs, f)).size, 0);
  const photos = packFiles.filter((f) => f.startsWith('img/')).length;

  const stats: Stats = {
    specs: specs.length,
    specTasksDone: tasksDone,
    specTasks: tasksAll,
    properties,
    testFiles: app.files,
    tests: app.total,
    testsPassed: app.passed,
    lambdaTests: lambda.total,
    terraformTests: tfRuns,
    steering: readdirSync('.kiro/steering').filter((f) => f.endsWith('.md')).length,
    ideHooks: readdirSync('.kiro/hooks').filter((f) => f.endsWith('.kiro.hook')).length,
    agents: readdirSync('.kiro/agents').filter((f) => f.endsWith('.json')).length,
    mcpServers: existsSync('.kiro/settings/mcp.json')
      ? Object.keys(json<{ mcpServers: object }>('.kiro/settings/mcp.json').mcpServers).length
      : 0,
    commits: Number(spawnSync('git', ['rev-list', '--count', 'HEAD'], { encoding: 'utf8' }).stdout.trim() || 0),
    logEntries: count('docs/kiro-log.md', /^\| 20\d\d-/gm),
    subjects: SUBJECTS.length,
    countries: idx('countries'),
    electricityArticles: idx('physics'),
    subjectArticles,
    articles: bundled.reduce((n, b) => n + b.n, 0),
    photos,
    quizzes: quizIndex.length,
    questions: quizIndex.reduce((n, q) => n + q.questions, 0),
    events: events.length,
    eventContinents: new Set(events.map((e) => e.continent).filter(Boolean)).size,
    lemmas,
    atlasShapes: atlas,
    wings: WINGS.length,
    tours: TOURS.length,
    tourStops: TOURS.reduce((n, t) => n + t.stops.length, 0),
    routes: Object.keys(ROUTES).length,
    packsMB: (packBytes / 1024 / 1024).toFixed(1),
    packFiles: packFiles.length,
  };
  for (const b of bundled) {
    stats[`articles_${b.id}`] = b.n;
  }
  if (existsSync('dist/index.html')) {
    const html = read('dist/index.html');
    const scripts = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)]
      .map((m) => m[1] as string)
      .filter((u) => u.startsWith('/'));
    const bytes = scripts.reduce((n, u) => n + (existsSync(`dist${u}`) ? statSync(`dist${u}`).size : 0), 0);
    stats['mainScriptKB'] = (bytes / 1000).toFixed(0);
  }
  return stats;
}

if (process.argv[1]?.endsWith('stats.ts')) {
  const stats = computeStats(!process.argv.includes('--no-tests'));
  mkdirSync('docs/generated', { recursive: true });
  writeFileSync('docs/generated/stats.json', `${JSON.stringify(stats, null, 2)}\n`);
  console.log(`Wrote docs/generated/stats.json (${Object.keys(stats).length} numbers).`);
}
