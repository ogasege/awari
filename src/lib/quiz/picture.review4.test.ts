/** 24-review-4 Req 7, Property 2: picture questions use photographs of one clear subject, and wrong answers are the same kind of thing. */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { MediaItem } from '../media/media.ts';
import { groupOf } from './groups.ts';
import { isQuizPhoto, pictureQuestion, pictureQuestions, seeded } from './picture.ts';

const base = { kind: 'photo', article: 'space/star', articleTitle: 'Star', title: 'File:X.jpg', tw: 480, th: 320 };

describe('picture questions only use photographs of one clear subject', () => {
  it('the owner’s example, a diagram comparing star sizes, is not a picture question', () => {
    expect(isQuizPhoto({ ...base, caption: 'Size comparison of stars: the Sun, Sirius and Rigel, a diagram' })).toBe(false);
    expect(isQuizPhoto({ ...base, kind: 'diagram', caption: 'A star' })).toBe(false);
    expect(isQuizPhoto({ ...base, kind: 'map', caption: 'A map of the star Sirius' })).toBe(false);
    expect(isQuizPhoto({ ...base, caption: 'A collage of stars' })).toBe(false);
    expect(isQuizPhoto({ ...base, caption: 'The star Sirius seen from Earth' })).toBe(true);
  });

  it('the caption must name the subject: the answer is the picture’s own article', () => {
    expect(isQuizPhoto({ ...base, article: 'wildlife/lion', articleTitle: 'Lion', caption: 'A male lion resting' })).toBe(true);
    expect(isQuizPhoto({ ...base, article: 'wildlife/lion', articleTitle: 'Lion', caption: 'A savanna at dusk' })).toBe(false);
  });

  it('articles about ideas have no picture question', () => {
    expect(groupOf('space/big-bang')).toBeUndefined();
    expect(groupOf('science/gravity')).toBeUndefined();
    expect(groupOf('ancient/renaissance')).toBeUndefined();
  });

  it('on the real library every question is a qualifying photograph of its own article with wrong answers of the same kind', () => {
    const files = readdirSync('public/media').filter((f) => /^[a-z]+\.json$/.test(f) && !['index.json', 'daily.json', 'licences.json'].includes(f));
    let asked = 0;
    for (const f of files) {
      const items = (JSON.parse(readFileSync(`public/media/${f}`, 'utf8')) as { items: MediaItem[] }).items;
      const titleOf = new Map(items.map((m) => [m.articleTitle, m.article]));
      for (let seed = 1; seed <= 6; seed++) {
        for (const q of pictureQuestions(items, 8, seed)) {
          asked++;
          const id = q.id.replace('picture/', '');
          const pic = items.find((m) => m.id === id) as MediaItem;
          expect(isQuizPhoto(pic), `${pic.title}: ${pic.caption}`).toBe(true);
          expect(q.options[q.answer]).toBe(pic.articleTitle);
          const groups = new Set(q.options.map((o) => groupOf(titleOf.get(o) ?? '')?.id));
          expect([...groups], q.options.join(' / ')).toHaveLength(1);
          expect([...groups][0]).toBe(groupOf(pic.article)?.id);
        }
      }
    }
    expect(asked).toBeGreaterThan(100);
  });

  it('planets are offered only with planets', () => {
    const planet = (id: string, title: string): MediaItem => ({ id, article: `space/${id}`, articleTitle: title, kind: 'photo', title: `File:${title}.jpg`, page: '', author: '', licence: '', licenceUrl: '', caption: `The planet ${title}`, captionFrom: 'description', alt: '', description: '', width: 2000, height: 1500, thumb: `img/${id}.webp`, tw: 480, th: 320, verified: '' });
    const pool = [planet('mars', 'Mars'), planet('venus', 'Venus'), planet('saturn', 'Saturn'), planet('neptune', 'Neptune'), planet('star', 'Star')];
    const q = pictureQuestion(pool[0] as MediaItem, pool, seeded(2));
    expect(q?.options).not.toContain('Star');
    expect(q?.prompt).toBe('Which planet is this a picture of?');
  });
});
