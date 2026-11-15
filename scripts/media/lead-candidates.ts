/** Lists the current lead and the other pictures of the articles round 2 flagged (26-final-review N-7), to pin by hand. */
import { readFileSync } from 'node:fs';

const keys = process.argv.slice(2);
const cache = new Map<string, { items: Array<{ article: string; title: string; caption: string; lead?: boolean; kind?: string }> }>();
for (const key of keys) {
  const pack = key.split('/')[0] as string;
  if (!cache.has(pack)) cache.set(pack, JSON.parse(readFileSync(`public/media/${pack}.json`, 'utf8')));
  const items = cache.get(pack)?.items.filter((m) => m.article === key) ?? [];
  console.log(`\n## ${key} (${items.length})`);
  for (const m of items.slice(0, 9)) console.log(`${m.lead ? '*' : ' '} ${m.title.slice(5, 70)} | ${m.caption.slice(0, 90)}`);
}
