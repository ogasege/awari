/** 24-review-4 Req 3: the Pictures screen opens on the best pictures. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { rankPictures } from './build.ts';
import type { Kind } from './select.ts';

const pic = (id: string, article: string, kind: Kind = 'photo', quality = 0, lead = false) => ({ id, article, kind, quality, lead });

describe('default picture order', () => {
  it('puts recognised pictures first, then leads, one per article before any repeats', () => {
    const items = [
      pic('a2', 'wildlife/lion'),
      pic('a1', 'wildlife/lion', 'photo', 0, true),
      pic('b1', 'wildlife/zebra', 'photo', 3, true),
      pic('b2', 'wildlife/zebra', 'photo', 3),
      pic('c1', 'wildlife/owl', 'photo', 0, true),
    ];
    const r = rankPictures(items);
    const order = [...r.entries()].sort((x, y) => x[1] - y[1]).map(([id]) => id);
    expect(order.slice(0, 2).sort()).toEqual(['b1', 'b2']);
    expect(order.indexOf('a1')).toBeLessThan(order.indexOf('a2'));
    expect(order.indexOf('c1')).toBeLessThan(order.indexOf('a2'));
  });

  it('never opens on anatomy, maps, diagrams or flags, even when they are Featured', () => {
    const items = [pic('x', 'body/heart', 'photo', 3, true), pic('m', 'countries/chad', 'map', 3, true), pic('p', 'space/moon', 'photo', 0, true)];
    const r = rankPictures(items);
    expect(r.get('p')).toBe(0);
    expect(r.get('x')).toBeGreaterThan(0);
    expect(r.get('m')).toBeGreaterThan(0);
  });

  it('the first screen of the built library is photographs of showy subjects, one per article', () => {
    const index = JSON.parse(readFileSync('public/media/index.json', 'utf8')) as { items: Array<[string, string, string, number, number, string, number]> };
    const first = [...index.items].sort((a, b) => a[6] - b[6]).slice(0, 60);
    expect(new Set(first.map((r) => r[1])).size).toBe(60);
    expect(first.filter((r) => r[1].startsWith('body/') || ['map', 'diagram', 'flag'].includes(r[2]))).toEqual([]);
    expect(new Set(first.map((r) => r[1].split('/')[0])).size).toBeGreaterThanOrEqual(5);
  });
});
