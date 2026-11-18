/**
 * Builds `/packs/quizzes/<pack>/<id>.json` for every pack article
 * (05-quizzes Req 1.4). Runs after the content packs as part of
 * `npm run packs`, and reports any article it could not fill.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { SUBJECTS } from '../../src/lib/packs/subjects.ts';
import { wordnetPos } from './dictionary-pos.ts';
import { autoTerms, buildQuiz, PHYSICS_TERMS, QUIZ_LENGTH } from '../../src/lib/quiz/generate.ts';
import type {
  Article,
  FactsPack,
  PackId,
  PackIndex,
  QuizSet,
  TimelinePack,
} from '../../src/lib/packs/types.ts';

const ROOT = 'public/packs';
const readJson = <T>(path: string): T => JSON.parse(readFileSync(`${ROOT}/${path}`, 'utf8')) as T;

const events = readJson<TimelinePack>('timeline.json').events;
const facts = readJson<FactsPack>('countries/facts.json').countries;
const factsById = new Map(facts.map((f) => [f.id, f]));
const countryTerms = [
  ...new Set(facts.flatMap((f) => [f.name, f.capital ?? ''].filter((t) => t.length > 3))),
];

/** Index file listing every quiz, for the quizzes screen and the castle. */
interface QuizIndex {
  quizzes: Array<{ pack: PackId; id: string; title: string; questions: number }>;
}

rmSync(`${ROOT}/quizzes`, { recursive: true, force: true });
const index: QuizIndex = { quizzes: [] };
const short: string[] = [];
const shapeTotals = new Map<string, number>();

for (const pack of SUBJECTS.map((x) => x.id)) {
  mkdirSync(`${ROOT}/quizzes/${pack}`, { recursive: true });
  const items = readJson<PackIndex>(`${pack}/index.json`).items;
  // Every term of the pack, so a false true-or-false statement can swap in a word the article never uses (27 Req 1.8).
  const packTerms = [...new Set(items.flatMap((i) => autoTerms(readJson<Article>(`${pack}/${i.id}.json`), 200)))];
  for (const item of items) {
    const article = readJson<Article>(`${pack}/${item.id}.json`);
    const questions = buildQuiz(
      article,
      pack === 'countries' ? factsById.get(article.id) : undefined,
      facts,
      pack === 'countries' ? countryTerms : pack === 'physics' ? PHYSICS_TERMS : autoTerms(article),
      wordnetPos,
      { events, packTerms },
    );
    for (const q of questions) shapeTotals.set(`${pack}|${q.kind ?? 'cloze'}`, (shapeTotals.get(`${pack}|${q.kind ?? 'cloze'}`) ?? 0) + 1);
    if (questions.length < QUIZ_LENGTH) {
      short.push(`${pack}/${item.id} (${questions.length})`);
      if (questions.length < 3) continue;
    }
    const set: QuizSet = { articleId: article.id, pack, title: article.title, questions, source: article.source };
    writeFileSync(`${ROOT}/quizzes/${pack}/${item.id}.json`, JSON.stringify(set));
    index.quizzes.push({ pack, id: item.id, title: article.title, questions: questions.length });
  }
}

writeFileSync(`${ROOT}/quizzes/index.json`, JSON.stringify(index));
console.log(`Built ${index.quizzes.length} quizzes.`);
if (short.length > 0) {
  console.log(`Fewer than ${QUIZ_LENGTH} questions (skipped if under 3): ${short.join(', ')}`);
}

// The table of questions per shape (27 Req 4.3).
const byShape = new Map<string, number>();
for (const [k, n] of shapeTotals) byShape.set(k.split('|')[1] ?? '', (byShape.get(k.split('|')[1] ?? '') ?? 0) + n);
const total = [...byShape.values()].reduce((a, b) => a + b, 0);
console.log('Questions per shape:');
for (const [k, n] of [...byShape].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(16)} ${String(n).padStart(5)}  ${((100 * n) / total).toFixed(1)}%`);
console.log(`  total            ${String(total).padStart(5)}`);
