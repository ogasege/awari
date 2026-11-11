/** 01-app-shell Req 5.4: every handwritten fact on Home is in its article. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Article } from '../../lib/packs/types.ts';
import { HERO_NOTES, SUBJECT_NOTES, type HomeNote } from './notes.ts';

const notes: HomeNote[] = [...Object.values(HERO_NOTES), ...Object.values(SUBJECT_NOTES)];

describe('Home margin notes', () => {
  it('has at least one fact and one question', () => {
    expect(notes.some((n) => n.kind === 'fact')).toBe(true);
    expect(notes.some((n) => n.kind === 'question')).toBe(true);
  });

  for (const note of notes.filter((n) => n.kind === 'fact')) {
    it(`fact "${note.text}" is proved by its article`, () => {
      expect(note.article).toBeTruthy();
      expect(note.proof).toBeTruthy();
      const [pack, id] = (note.article as string).split('/');
      const article = JSON.parse(readFileSync(`public/packs/${pack}/${id}.json`, 'utf8')) as Article;
      const text = article.sections.flatMap((s) => s.paragraphs).join(' ');
      expect(text).toContain(note.proof as string);
      expect(note.to).toBe(`/article/${note.article}`);
    });
  }
});
