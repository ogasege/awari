#!/usr/bin/env node
/**
 * Kiro agent hook runner for `awari-builder` (.kiro/agents/awari-builder.json).
 *
 * Kiro runs this with the hook event as JSON on stdin (see the hooks
 * documentation: hook_event_name, cwd, tool_name, tool_input, ...). It
 * decides which of Awari's checks the event calls for, runs it, and
 * appends one line to docs/kiro-evidence/hook-firings.jsonl so there is a
 * record of the hook really firing. The record carries KIRO_SESSION_ID
 * (set by Kiro for hook commands); a run without one is marked "manual"
 * and is not evidence of a hook firing.
 *
 * Checks:
 *  - after the write tool saves a source file: eslint on that file and the
 *    tests related to it;
 *  - after a bundled photo, data file or CREDITS.md changes (write tool, or
 *    a shell command that builds the packs): `npm run credits`;
 *  - when the agent stops: `npm run rules` (the hackathon hard rules).
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';

const mode = process.argv[2] ?? '';
let event = {};
try {
  event = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  event = {};
}

const tool = typeof event.tool_name === 'string' ? event.tool_name : '';
const input = event.tool_input ?? {};
const touched = [input.path, ...(Array.isArray(input.operations) ? input.operations.map((o) => o.path) : [])].filter(
  (p) => typeof p === 'string',
);
const command = typeof input.command === 'string' ? input.command : '';
const rel = (p) => p.replace(`${process.cwd()}/`, '');

/** Runs a command, returns { ok, output }. */
function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 150_000 });
  return { ok: r.status === 0, output: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-12).join('\n') };
}

let check = 'none';
let result = { ok: true, output: '' };

if (mode === 'after-write') {
  const sources = touched.map(rel).filter((p) => /^(src|scripts|services\/quiz-lambda\/src)\/.*\.(ts|tsx)$/.test(p));
  const bundled = touched.map(rel).filter((p) => /^(public\/|CREDITS\.md$)/.test(p));
  if (sources.length > 0) {
    check = `eslint + related tests on ${sources.join(', ')}`;
    const lint = run('npx', ['eslint', '--max-warnings', '0', ...sources]);
    const tests = lint.ok ? run('npx', ['vitest', 'run', '--related', ...sources]) : { ok: true, output: '' };
    result = { ok: lint.ok && tests.ok, output: `${lint.output}\n${tests.output}`.trim() };
  } else if (bundled.length > 0) {
    check = 'npm run credits';
    result = run('npm', ['run', '--silent', 'credits']);
  }
} else if (mode === 'after-shell') {
  if (/npm run packs|scripts\/packs\/build\.ts|npm run credits|sharp|public\/(photos|packs)/.test(command)) {
    check = 'npm run credits';
    result = run('npm', ['run', '--silent', 'credits']);
  }
} else if (mode === 'stop') {
  check = 'npm run rules';
  result = run('npm', ['run', '--silent', 'rules']);
} else if (mode === 'spawn') {
  check = 'agent started';
}

const line = {
  at: new Date().toISOString(),
  hook: mode,
  event: event.hook_event_name ?? null,
  tool: tool || null,
  files: touched.map(rel),
  check,
  ok: result.ok,
  source: process.env.KIRO_SESSION_ID ? 'kiro-session' : 'manual',
  session: process.env.KIRO_SESSION_ID ?? null,
  output: result.output.slice(-600),
};
mkdirSync('docs/kiro-evidence', { recursive: true });
appendFileSync('docs/kiro-evidence/hook-firings.jsonl', `${JSON.stringify(line)}\n`);

if (!result.ok) {
  process.stderr.write(`${check} failed:\n${result.output}\n`);
  process.exit(1);
}
