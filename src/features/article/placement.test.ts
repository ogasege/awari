import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { MediaItem } from '../../lib/media/media.ts';
import type { Article } from '../../lib/packs/types.ts';
import { galleryFor } from '../media/ArticleGallery.tsx';
import { placePictures, spreadNotes } from './scrapbook.tsx';

const media = (pack: string): MediaItem[] => (JSON.parse(readFileSync(`public/media/${pack}.json`, 'utf8')) as { items: MediaItem[] }).items;
const article = (pack: string, id: string): Article => JSON.parse(readFileSync(`public/packs/${pack}/${id}.json`, 'utf8')) as Article;

describe('pictures sit beside the section they are about (28-every-screen-like-home task 3, owner feedback 19 Nov)', () => {
  it('Property: every placed picture shares a whole word with its section, one picture per section, none twice', () => {
    for (const [pack, id] of [['countries', 'nigeria'], ['countries', 'france'], ['wildlife', 'lion'], ['space', 'apollo-11'], ['science', 'carbon']] as const) {
      const a = article(pack, id);
      const pics = galleryFor(media(pack), `${pack}/${id}`);
      const placed = placePictures(a, pics);
      const ids = [...placed.values()].map((m) => m.id);
      expect(new Set(ids).size, `${id}: a picture twice`).toBe(ids.length);
      for (const [si, m] of placed) {
        const section = a.sections[si];
        expect(si).toBeGreaterThan(0);
        const words = new Set(`${section?.heading} ${section?.paragraphs.join(' ')}`.toLowerCase().match(/\p{L}{4,}/gu) ?? []);
        const caption = m.caption.toLowerCase().match(/\p{L}{4,}/gu) ?? [];
        expect(caption.some((w) => words.has(w)), `${id} section ${si}: ${m.caption}`).toBe(true);
      }
    }
  });

  it('does not put the dam in the history of the slave trade, nor the mountain view in the conflicts', () => {
    const a = article('countries', 'nigeria');
    const placed = placePictures(a, galleryFor(media('countries'), 'countries/nigeria'));
    for (const [si, m] of placed) {
      const heading = a.sections[si]?.heading ?? '';
      if (/dam|four openings/i.test(m.caption)) expect(heading).not.toBe('History');
      if (/mountain/i.test(m.caption)) expect(heading).not.toMatch(/conflict/i);
    }
  });

  it('spreads the sticky notes through the article, one section each', () => {
    const at = spreadNotes(['a', 'b', 'c'], 9);
    expect([...at.keys()].sort((x, y) => x - y)).toEqual([2, 5, 7]);
    expect(spreadNotes(['a'], 1).size).toBe(0);
  });
});
