/** Counts quiz questions and picture captions that touch an unsuitable topic (26-final-review N-2). `--list` prints them. */
import { readdirSync, readFileSync } from 'node:fs';
import { unsuitableTopic } from '../../src/lib/text/suitability.ts';

const list = process.argv.includes('--list');
let questions = 0;
let captions = 0;
for (const pack of readdirSync('public/packs/quizzes').filter((d) => !d.includes('.'))) {
  for (const f of readdirSync(`public/packs/quizzes/${pack}`)) {
    const quiz = JSON.parse(readFileSync(`public/packs/quizzes/${pack}/${f}`, 'utf8')) as { questions: Array<{ prompt: string; proof: string; options: string[] }> };
    for (const q of quiz.questions) {
      const topic = unsuitableTopic(`${q.prompt} ${q.proof} ${q.options.join(' ')}`);
      if (topic) {
        questions += 1;
        if (list) console.log(`quiz ${pack}/${f} [${topic}] ${q.prompt.slice(0, 110)}`);
      }
    }
  }
}
for (const f of readdirSync('public/media').filter((x) => x.endsWith('.json') && !['index.json', 'licences.json', 'daily.json'].includes(x))) {
  const file = JSON.parse(readFileSync(`public/media/${f}`, 'utf8')) as { items: Array<{ id: string; article: string; caption: string; alt?: string }> };
  for (const m of file.items) {
    const topic = unsuitableTopic(`${m.caption} ${m.alt ?? ''}`);
    if (topic) {
      captions += 1;
      if (list) console.log(`picture ${m.article} ${m.id} [${topic}] ${m.caption.slice(0, 110)}`);
    }
  }
}
console.log({ questions, captions });
if (questions + captions > 0) process.exit(1);
