/** 23-media-library Property 3 and Req 19: one picture for each of the 366 days, never one a bundled photograph shows. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readRecords } from '../../../scripts/media/licences.ts';
import { pictureForDay, type DailyPicture } from './PictureOfTheDay.tsx';

const days = (JSON.parse(readFileSync('public/media/daily.json', 'utf8')) as { days: DailyPicture[] }).days;
const index = JSON.parse(readFileSync('public/media/index.json', 'utf8')) as { items: Array<[string, string]> };

describe('picture of the day', () => {
  it('has an entry for each of the 366 days, including 29 February, and each is a library picture', () => {
    expect(days).toHaveLength(366);
    const ids = new Set(index.items.map((r) => r[0]));
    for (const d of days) {
      expect(ids.has(d.id), d.id).toBe(true);
      expect(d.author.length + d.licence.length).toBeGreaterThan(0);
      expect(d.caption.length).toBeGreaterThanOrEqual(12);
    }
    expect(pictureForDay(days, new Date(2024, 1, 29))).toBeDefined();
    expect(pictureForDay(days, new Date(2026, 0, 1))).toBe(days[0]);
    expect(pictureForDay(days, new Date(2026, 11, 31))).toBe(days[365]);
  });

  it('never repeats a picture on consecutive days and never equals a bundled photograph (Property 3)', () => {
    const files = new Set(readRecords(readFileSync('CREDITS.md', 'utf8')).map((r) => r.title.toLowerCase()));
    const titles = new Map<string, string>();
    for (const f of ['ancient', 'arts', 'body', 'countries', 'earth', 'inventions', 'people', 'physics', 'science', 'space', 'wildlife']) {
      for (const m of (JSON.parse(readFileSync(`public/media/${f}.json`, 'utf8')) as { items: Array<{ id: string; title: string }> }).items) titles.set(m.id, m.title.toLowerCase());
    }
    for (let i = 0; i < days.length; i++) {
      expect(days[i]?.id).not.toBe(days[(i + 1) % days.length]?.id);
      expect(files.has(titles.get(days[i]?.id ?? '') ?? ''), days[i]?.id).toBe(false);
    }
  });
});
