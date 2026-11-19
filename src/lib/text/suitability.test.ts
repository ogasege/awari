import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { unsuitableCaption } from './suitability.ts';

describe('picture captions (28-every-screen-like-home, owner feedback 19 Nov)', () => {
  it('rejects killings and charts or maps of statistics, and keeps ordinary captions', () => {
    expect(unsuitableCaption('Homicides by Nigerian state per year and per 1 million inhabitants')).not.toBeNull();
    expect(unsuitableCaption('Dominant religion by state in Nigeria, 2022')).not.toBeNull();
    expect(unsuitableCaption('A map of population density in Austria')).not.toBeNull();
    expect(unsuitableCaption('The Lagos skyline')).toBeNull();
    expect(unsuitableCaption('A lion resting on a rock')).toBeNull();
  });

  it('Property: no picture in the library carries such a caption', () => {
    for (const f of readdirSync('public/media').filter((x) => x.endsWith('.json') && !['index.json', 'licences.json', 'daily.json'].includes(x))) {
      const items = (JSON.parse(readFileSync(`public/media/${f}`, 'utf8')) as { items: Array<{ caption: string }> }).items;
      for (const m of items) expect(unsuitableCaption(m.caption), m.caption).toBeNull();
    }
  });
});
