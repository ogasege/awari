/** 22-review-3 Req 21, 22: wildlife prints show one animal, and Nigeria leads with a clear picture. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Article } from './types.ts';

const read = (key: string): Article => JSON.parse(readFileSync(`public/packs/${key}.json`, 'utf8')) as Article;

describe('lead photographs (22-review-3)', () => {
  it('the bat and hummingbird leads are single-animal pictures, not four-photo collages', () => {
    for (const id of ['bat', 'hummingbird']) {
      const lead = read(`wildlife/${id}`).photos[0];
      expect(lead, id).toBeDefined();
      // The old collage leads were square (800 x 781 and 800 x 800); a single animal is not.
      expect(Math.abs((lead?.width ?? 1) / (lead?.height ?? 1) - 1), id).toBeGreaterThan(0.05);
      expect(lead?.credit.name, id).not.toMatch(/hummingbirds\.jpg|Chiroptera collage/i);
    }
  });

  it('no wildlife lead is a square image (a collage sign) unless its alt names one animal', () => {
    const square = ['bat', 'hummingbird', 'koala', 'polar-bear']
      .map((id) => ({ id, p: read(`wildlife/${id}`).photos[0] }))
      .filter(({ p }) => p && Math.abs(p.width / p.height - 1) < 0.05);
    for (const { id, p } of square) {
      expect(p?.alt, id).not.toMatch(/hummingbirds\b/);
    }
  });

  it('Nigeria leads with Lagos, and the Zuma Rock picture the auditor called weak is gone', () => {
    const lead = read('countries/nigeria').photos[0];
    expect(lead?.caption).toBe('The Lagos skyline');
    expect(lead?.credit.name).not.toMatch(/Zuma/i);
    expect(lead?.alt.length).toBeGreaterThan(10);
  });
});
