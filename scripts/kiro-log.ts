/**
 * Appends a dated entry to docs/kiro-log.md recording which spec, hook or
 * steering file drove a piece of work.
 *
 * Usage: npm run log -- --spec 05-quizzes --task 2.1 \
 *   --by spec --note "Hint ladder engine"
 */
import { appendFileSync, existsSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    spec: { type: 'string' },
    task: { type: 'string' },
    by: { type: 'string', default: 'spec' },
    note: { type: 'string' },
  },
});

if (!values.note) {
  console.error('--note is required');
  process.exit(1);
}

const path = 'docs/kiro-log.md';
if (!existsSync(path)) {
  writeFileSync(
    path,
    '# Kiro log\n\nA dated record of which spec, hook or steering file ' +
      'drove each piece of work.\n\n' +
      '| Date (UTC) | Driven by | Spec / task | Work |\n' +
      '| --- | --- | --- | --- |\n',
  );
}
const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
const where = [values.spec, values.task].filter(Boolean).join(' ');
const note = values.note.replace(/\|/g, '\\|');
appendFileSync(
  path,
  `| ${date} | ${values.by} | ${where || '-'} | ${note} |\n`,
);
console.log(`Logged: ${where} ${note}`);
