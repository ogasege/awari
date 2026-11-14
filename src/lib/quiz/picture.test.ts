/** 23-media-library Property 6 (Req 20): a picture question never has two correct options or a repeated distractor. */
import { readFileSync } from 'node:fs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { MediaItem } from '../media/media.ts';
import { pictureQuestion, pictureQuestions, seeded, weave } from './picture.ts';

const make = (i: number, article: string, title: string): MediaItem => ({
  id: `id${i}`,
  article,
  articleTitle: title,
  kind: 'photo',
  title: `File:Pic ${i}.jpg`,
  page: 'https://commons.wikimedia.org/wiki/File:Pic.jpg',
  author: 'Jane',
  licence: 'CC BY 4.0',
  licenceUrl: '',
  caption: `Picture ${i} of ${title}`,
  captionFrom: 'description',
  alt: '',
  description: '',
  width: 2000,
  height: 1500,
  thumb: `img/id${i}.webp`,
  tw: 480,
  th: 320,
  verified: '2026-11-14',
});

const items = (n: number): MediaItem[] => Array.from({ length: n }, (_, i) => make(i, `wildlife/a${i % 9}`, `Animal ${i % 9}`));

describe('pictureQuestion (Property 6)', () => {
  it('has four distinct options, exactly one correct, and two removable wrong ones (property)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 4, max: 40 }), (seed, n) => {
        const pool = items(n);
        const picture = pool[seed % pool.length] as MediaItem;
        const q = pictureQuestion(picture, pool, seeded(seed));
        if (!q) return;
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(4);
        expect(q.options.filter((o) => o === picture.articleTitle)).toHaveLength(1);
        expect(q.options[q.answer]).toBe(picture.articleTitle);
        expect(q.hints.removed).not.toContain(q.answer);
        expect(q.hints.removed[0]).not.toBe(q.hints.removed[1]);
        expect(q.image?.alt).not.toContain(picture.articleTitle);
      }),
      { numRuns: 200 },
    );
  });

  it('needs four different articles', () => {
    const pool = [make(1, 'wildlife/a', 'Lion'), make(2, 'wildlife/b', 'Tiger'), make(3, 'wildlife/c', 'Zebra')];
    expect(pictureQuestion(pool[0] as MediaItem, pool, seeded(1))).toBeUndefined();
  });

  it('never offers two pages with the same name, even from different articles', () => {
    const pool = [make(1, 'wildlife/a', 'Mercury'), make(2, 'wildlife/b', 'mercury'), make(3, 'wildlife/c', 'Gold'), make(4, 'wildlife/d', 'Iron'), make(5, 'wildlife/e', 'Salt')];
    const q = pictureQuestion(pool[0] as MediaItem, pool, seeded(3));
    expect(q).toBeDefined();
    expect(new Set(q?.options.map((o) => o.toLowerCase())).size).toBe(4);
  });

  it('gives each picture from a different article and the same questions for the same seed', () => {
    const a = pictureQuestions(items(30), 5, 7);
    const b = pictureQuestions(items(30), 5, 7);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(new Set(a.map((q) => q.articleId)).size).toBe(a.length);
  });

  it('works on the real library: every subject gives questions with valid options', () => {
    for (const f of ['ancient', 'wildlife', 'space']) {
      const file = JSON.parse(readFileSync(`public/media/${f}.json`, 'utf8')) as { items: MediaItem[] };
      for (const q of pictureQuestions(file.items, 6, 11)) {
        expect(new Set(q.options).size).toBe(4);
        expect(q.options[q.answer]).toBeDefined();
      }
    }
  });
});

describe('weave', () => {
  it('puts a picture question after every third question and keeps every question once', () => {
    const text = Array.from({ length: 9 }, (_, i) => ({ id: `t${i}` }) as never);
    const pics = Array.from({ length: 3 }, (_, i) => ({ id: `p${i}` }) as never);
    const out = weave(text, pics, 3) as Array<{ id: string }>;
    expect(out.map((q) => q.id)).toEqual(['t0', 't1', 't2', 'p0', 't3', 't4', 't5', 'p1', 't6', 't7', 't8', 'p2']);
  });
});
