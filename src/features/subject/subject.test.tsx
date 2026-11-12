import { render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { BUNDLED_PACKS, SUBJECTS, SUBJECT_PACKS } from '../../lib/packs/subjects.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import { SubjectList, SubjectPage } from './SubjectScreen.tsx';

const index = (pack: string): PackIndex => JSON.parse(readFileSync(`public/packs/${pack}/index.json`, 'utf8')) as PackIndex;

describe('subject packs and pages (15-subject-packs)', () => {
  beforeEach(() => servePacksFromDisk());

  it('Property 1: each subject pack holds 25-35 articles with unique ids. _Req 1.1_', () => {
    for (const pack of SUBJECT_PACKS) {
      const items = index(pack).items;
      expect(items.length, pack).toBeGreaterThanOrEqual(25);
      expect(items.length, pack).toBeLessThanOrEqual(35);
      expect(new Set(items.map((i) => i.id)).size, pack).toBe(items.length);
    }
  });

  it('Property 2: every index item has an article with a photo and credit, and a quiz of three or more valid questions. _Req 1.2, 1.3_', () => {
    const quizzes = JSON.parse(readFileSync('public/packs/quizzes/index.json', 'utf8')) as {
      quizzes: Array<{ pack: string; id: string; questions: number }>;
    };
    for (const pack of SUBJECT_PACKS) {
      for (const item of index(pack).items) {
        const article = JSON.parse(readFileSync(`public/packs/${pack}/${item.id}.json`, 'utf8')) as {
          photos: Array<{ file: string; credit: { author?: string; licence: string } }>;
          notes: Array<{ kind: string; proof?: string }>;
        };
        expect(article.photos[0]?.credit.author, `${pack}/${item.id}`).toBeTruthy();
        expect(article.photos[0]?.credit.licence, `${pack}/${item.id}`).toBeTruthy();
        const q = quizzes.quizzes.find((x) => x.pack === pack && x.id === item.id);
        expect(q?.questions ?? 0, `quiz ${pack}/${item.id}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('Property 3: subject ids are unique and each is a bundled pack', () => {
    expect(new Set(SUBJECTS.map((s) => s.id)).size).toBe(SUBJECTS.length);
    expect(SUBJECTS.map((s) => s.id)).toEqual([...BUNDLED_PACKS]);
    expect(SUBJECTS).toHaveLength(11);
  });

  it('Property 4: the page lists exactly the articles of the pack. _Req 2.1, 2.2_', async () => {
    render(<SubjectPage id="wildlife" />);
    const wall = (await screen.findByRole('status')).nextElementSibling as HTMLElement;
    const links = within(wall).getAllByRole('link');
    const items = index('wildlife').items;
    expect(links).toHaveLength(items.length);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(items.map((i) => `/article/wildlife/${i.id}`));
    expect(screen.getByRole('link', { name: 'Visit the castle wing' })).toHaveAttribute('href', '/castle/wildlife');
    expect(screen.getByRole('link', { name: 'See it on the timeline' })).toHaveAttribute('href', '/timeline?subject=wildlife');
    expect(screen.getByRole('link', { name: 'Take a quiz' })).toHaveAttribute('href', '/quizzes#quizzes-wildlife');
  });

  it('shows Countries by continent, and says so in words for an unknown subject. _Req 2.3_', async () => {
    const { unmount } = render(<SubjectPage id="countries" />);
    expect(await screen.findByRole('heading', { name: /^Oceania/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nigeria' })).toHaveAttribute('href', '/article/countries/nigeria');
    unmount();
    render(<SubjectPage id="nothing" />);
    expect(screen.getByRole('alert')).toHaveTextContent('There is no subject called “nothing”');
    expect(screen.getByRole('link', { name: 'See every subject' })).toHaveAttribute('href', '/subjects');
  });

  it('lists every subject', () => {
    render(<SubjectList />);
    expect(screen.getAllByRole('link')).toHaveLength(11);
  });
});
