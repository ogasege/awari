/** 23-media-library Req 22, 24-review-4 Req 9: the Credits screen pages its long lists and searches them. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearMediaCache, type MediaFile } from '../../lib/media/media.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import CreditsScreen from './CreditsScreen.tsx';
import { MediaCredits } from './MediaCredits.tsx';
import { PAGE_SIZE, matching } from './Paged.tsx';

describe('picture credits', () => {
  beforeEach(() => {
    clearMediaCache();
    servePacksFromDisk();
  });

  it('lists 100 pictures at a time for a subject, each with author, licence and Commons page', async () => {
    const user = userEvent.setup();
    const file = JSON.parse(readFileSync('public/media/ancient.json', 'utf8')) as MediaFile;
    render(<MediaCredits />);
    await user.selectOptions(screen.getByLabelText(/Subject/), 'ancient');
    expect(await screen.findByRole('status')).toHaveTextContent(`of ${file.items.length}.`);
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(Math.min(PAGE_SIZE, file.items.length));
    for (const row of rows) {
      expect(within(row).getAllByRole('link').length).toBeGreaterThanOrEqual(3);
    }
    expect(file.items.length).toBeGreaterThan(PAGE_SIZE);
    await user.click(screen.getByRole('button', { name: `Next ${PAGE_SIZE}` }));
    expect(screen.getByRole('status')).toHaveTextContent(`Pictures ${PAGE_SIZE + 1} to`);
  });

  it('searches the pictures of a subject by caption, article or author', async () => {
    const user = userEvent.setup();
    render(<MediaCredits />);
    await user.selectOptions(screen.getByLabelText(/Subject/), 'wildlife');
    await screen.findByRole('table');
    await user.type(screen.getByRole('searchbox'), 'zebra');
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(PAGE_SIZE);
    for (const r of rows) expect(r.textContent?.toLowerCase()).toContain('zebra');
  });
});

describe('the whole Credits screen', () => {
  beforeEach(() => {
    clearMediaCache();
    servePacksFromDisk();
  });

  it('is short: no table shows more than 100 rows, and the long photo table is paged and searchable', async () => {
    const user = userEvent.setup();
    render(<CreditsScreen />);
    const tables = screen.getAllByRole('table');
    for (const t of tables) expect(within(t).getAllByRole('row').length - 1).toBeLessThanOrEqual(PAGE_SIZE);
    const total = tables.reduce((n, t) => n + within(t).getAllByRole('row').length, 0);
    expect(total).toBeLessThan(300);
    expect(screen.getByRole('button', { name: `Next ${PAGE_SIZE}` })).toBeEnabled();
    await user.type(screen.getAllByRole('searchbox')[0] as HTMLElement, 'Colosseum');
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(/of \d+\./);
  });

  it('the summary and the non-picture credits come before the long tables', () => {
    render(<CreditsScreen />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings.indexOf('Fonts')).toBeGreaterThanOrEqual(0);
    expect(headings.indexOf('Pictures in the library')).toBeGreaterThan(headings.indexOf('Fonts'));
  });
});

describe('matching', () => {
  it('needs every word, ignores case, and returns all rows for an empty search', () => {
    const rows = ['Great Wall, Jane, CC BY', 'Great Pyramid, Omar, CC0'];
    expect(matching(rows, '', (r) => r)).toHaveLength(2);
    expect(matching(rows, 'great omar', (r) => r)).toEqual([rows[1]]);
    expect(matching(rows, 'WALL cc', (r) => r)).toEqual([rows[0]]);
  });
});
