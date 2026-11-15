/** 26-final-review N-7: every hand-pinned lead is the picture the committed records mark as the article's lead. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LEAD_PINS } from './leads.ts';

const items = new Map<string, Array<{ article: string; title: string; lead?: boolean }>>();
const of = (pack: string) => {
  if (!items.has(pack)) items.set(pack, (JSON.parse(readFileSync(`public/media/${pack}.json`, 'utf8')) as { items: Array<{ article: string; title: string; lead?: boolean }> }).items);
  return items.get(pack) ?? [];
};

describe('pinned lead pictures', () => {
  it('each pin is the lead of its article in the committed library', () => {
    const wrong: string[] = [];
    for (const [key, title] of LEAD_PINS) {
      const lead = of(key.split('/')[0] as string).find((m) => m.article === key && m.lead);
      if (lead?.title !== title) wrong.push(`${key}: lead is ${lead?.title ?? 'none'}`);
    }
    expect(wrong).toEqual([]);
  });

  it('no denylisted file is in the library', () => {
    const deny = new Set((JSON.parse(readFileSync('scripts/media/denylist.json', 'utf8')) as { titles: string[] }).titles);
    const found = ['ancient', 'arts', 'body', 'countries', 'earth', 'inventions', 'people', 'physics', 'science', 'space', 'wildlife'].flatMap((p) => of(p).filter((m) => deny.has(m.title)).map((m) => m.title));
    expect(found).toEqual([]);
  });
});
