/**
 * Turns the hand-checked caption decisions (`scripts/media/captions-decisions.txt`) into the override file the
 * caption code reads (`scripts/media/captions-override.json`, keyed by Commons file title).
 *
 * A decision is one line: `drop|<start of the caption>` removes the picture, and
 * `set|<start of the caption>|=><new caption>` replaces the caption. The start of the caption is matched against
 * the captions the library would show now (taken from `--dump <file>`, a JSON list of `{ title, text }`), so a
 * decision survives a rebuild: it is stored against the Commons title, not the caption.
 *
 *   npx tsx scripts/media/overrides.ts --dump .scratch/dump.json
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const OVERRIDES = 'scripts/media/captions-override.json';
const DECISIONS = 'scripts/media/captions-decisions.txt';

export interface Decision {
  action: 'drop' | 'set';
  prefix: string;
  to?: string;
}

export function parseDecisions(text: string): Decision[] {
  const out: Decision[] = [];
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue;
    const [action, prefix, rest] = line.split('|');
    if ((action !== 'drop' && action !== 'set') || !prefix) throw new Error(`Not a decision: ${line}`);
    out.push(action === 'set' ? { action, prefix, to: (rest ?? '').replace(/^=>/, '') } : { action, prefix });
  }
  return out;
}

if (process.argv[1]?.endsWith('overrides.ts')) {
  const args = process.argv.slice(2);
  const dumpFile = args[args.indexOf('--dump') + 1];
  if (!dumpFile) throw new Error('Pass --dump <file>.');
  const rows = JSON.parse(readFileSync(dumpFile, 'utf8')) as Array<{ title: string; text: string }>;
  const decisions = parseDecisions(readFileSync(DECISIONS, 'utf8'));
  const current: { note?: string; captions: Record<string, string | null> } = existsSync(OVERRIDES)
    ? (JSON.parse(readFileSync(OVERRIDES, 'utf8')) as { captions: Record<string, string | null> })
    : { captions: {} };
  const captions = { ...current.captions };
  const unresolved: string[] = [];
  let dropped = 0;
  let rewritten = 0;
  for (const d of decisions) {
    const hits = rows.filter((r) => r.text.startsWith(d.prefix));
    if (hits.length === 0) unresolved.push(d.prefix);
    for (const h of hits) {
      captions[h.title] = d.action === 'drop' ? null : (d.to ?? null);
      if (d.action === 'drop') dropped++;
      else rewritten++;
    }
  }
  const sorted = Object.fromEntries(Object.entries(captions).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    OVERRIDES,
    `${JSON.stringify({ note: 'Hand-checked captions, keyed by Commons file title; null drops the picture. Built from captions-decisions.txt by overrides.ts', captions: sorted }, null, 1)}\n`,
  );
  console.log(`${dropped} pictures dropped, ${rewritten} captions rewritten, ${unresolved.length} decisions matched nothing.`);
  if (unresolved.length > 0) console.log(unresolved.map((u) => `  ${u}`).join('\n'));
}
