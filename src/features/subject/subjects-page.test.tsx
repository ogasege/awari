/** 22-review-3 Req 4: /subjects shows cover prints, and every number comes from the data. */
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearPackCache } from '../../lib/packs/load.ts';
import { SUBJECTS } from '../../lib/packs/subjects.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import SubjectsScreen from './SubjectsScreen.tsx';

describe('/subjects (22-review-3 Req 4)', () => {
  beforeEach(() => {
    clearPackCache();
    servePacksFromDisk();
  });

  it('shows one cover print per subject, linked to its page, with the real article count', async () => {
    const { container } = render(<SubjectsScreen />);
    const prints = container.querySelectorAll('.subjects-table__item');
    expect(prints).toHaveLength(SUBJECTS.length);
    for (const s of SUBJECTS) {
      const count = (JSON.parse(readFileSync(`public/packs/${s.id}/index.json`, 'utf8')) as { items: unknown[] }).items.length;
      const link = container.querySelector(`a[href="/subject/${s.id}"]`);
      expect(link).not.toBeNull();
      const item = link?.closest('.subjects-table__item');
      expect(await screen.findAllByText(`${count} ${count === 1 ? 'article' : 'articles'}`)).not.toHaveLength(0);
      expect(item?.querySelector('img')?.getAttribute('src')).toMatch(/^\/photos\//);
    }
  });

  it('states no number by hand in the intro', () => {
    const { container } = render(<SubjectsScreen />);
    const note = container.querySelector('.subjects-intro')?.textContent ?? '';
    expect(note).toContain(String(SUBJECTS.length));
    expect(note).not.toMatch(/\b(30|197)\b/);
  });
});
