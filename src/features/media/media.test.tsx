/** 23-media-library: the article strip (Property 3), the viewer and the Pictures screen (Req 12, 17, 18). */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearMediaCache, type MediaIndex, type MediaItem } from '../../lib/media/media.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import { ArticleGallery, galleryFor, leadFileName } from './ArticleGallery.tsx';
import MediaScreen, { filterRows, surprise } from './MediaScreen.tsx';

const index = JSON.parse(readFileSync('public/media/index.json', 'utf8')) as MediaIndex;
const item = (over: Partial<MediaItem>): MediaItem => ({
  id: 'a',
  article: 'wildlife/lion',
  articleTitle: 'Lion',
  kind: 'photo',
  title: 'File:A lion.jpg',
  page: 'https://commons.wikimedia.org/wiki/File:A_lion.jpg',
  author: 'Jane',
  licence: 'CC BY 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
  caption: 'A lion',
  captionFrom: 'description',
  alt: 'A lion',
  description: '',
  width: 2000,
  height: 1500,
  thumb: 'img/a.webp',
  tw: 480,
  th: 360,
  verified: '2026-11-14',
  ...over,
});

describe('galleryFor (Property 3)', () => {
  it('lists the article\'s pictures and leaves out the lead photo\'s own Commons file', () => {
    const items = [item({ id: '1', title: 'File:Lead.jpg' }), item({ id: '2', title: 'File:Other.jpg' }), item({ id: '3', article: 'wildlife/tiger', title: 'File:Tiger.jpg' })];
    expect(galleryFor(items, 'wildlife/lion', 'Wikimedia Commons: Lead.jpg').map((m) => m.id)).toEqual(['2']);
    expect(leadFileName('Wikimedia Commons: Lead.jpg')).toBe('Lead.jpg');
  });
});

describe('ArticleGallery', () => {
  beforeEach(() => {
    clearMediaCache();
    servePacksFromDisk();
  });

  it('shows distinct pictures with alt text for an article that has some', async () => {
    const key = index.items[0]?.[1] ?? '';
    const { container } = render(<ArticleGallery articleKey={key} />);
    await screen.findByRole('heading', { name: 'More pictures' });
    const imgs = [...container.querySelectorAll('.gallery__thumb img')];
    expect(imgs.length).toBeGreaterThan(0);
    expect(new Set(imgs.map((i) => i.getAttribute('src'))).size).toBe(imgs.length);
    for (const i of imgs) expect(i.getAttribute('alt')?.length).toBeGreaterThan(1);
  });

  it('renders nothing for an article with no pictures', async () => {
    const { container } = render(<ArticleGallery articleKey="countries/not-a-country" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('.gallery')).toBeNull();
  });

  it('opens the large view with the credit, and closes with Escape', async () => {
    const user = userEvent.setup();
    const key = index.items[0]?.[1] ?? '';
    render(<ArticleGallery articleKey={key} />);
    const first = (await screen.findAllByRole('button', { name: /./ }))[0] as HTMLElement;
    await user.click(first);
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText(/^By /)).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Commons page' })).toHaveAttribute('href', expect.stringContaining('commons.wikimedia.org'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Pictures screen', () => {
  beforeEach(() => {
    clearMediaCache();
    servePacksFromDisk();
    window.history.replaceState(null, '', '/media');
  });

  it('says how many pictures it shows and filters by search words', async () => {
    const user = userEvent.setup();
    render(<MediaScreen />);
    expect(await screen.findByRole('status')).toHaveTextContent(new RegExp(`of ${index.count} pictures`));
    const word = (index.items[0]?.[5] ?? '').split(' ').find((w) => w.length > 4) ?? 'the';
    await user.type(screen.getByLabelText('Search the pictures'), word);
    const expected = filterRows(index.items, 'all', 'all', word).length;
    expect(screen.getByRole('status')).toHaveTextContent(`of ${expected} pictures`);
  });

  it('makes a surprise pile of distinct pictures', async () => {
    const user = userEvent.setup();
    render(<MediaScreen />);
    await screen.findByRole('status');
    await user.click(screen.getByRole('button', { name: 'Surprise me' }));
    const pile = screen.getByRole('region', { name: 'A surprise pile' });
    const srcs = [...pile.querySelectorAll('img')].map((i) => i.getAttribute('src'));
    expect(srcs.length).toBe(Math.min(8, index.count));
    expect(new Set(srcs).size).toBe(srcs.length);
  });
});

describe('filterRows and surprise (property)', () => {
  it('filterRows only returns rows that match, and surprise never repeats', () => {
    const word = fc.constantFrom('lion', 'map', 'rome', 'the', '');
    fc.assert(
      fc.property(word, fc.constantFrom('all', 'photo', 'map'), (w, kind) => {
        for (const r of filterRows(index.items, 'all', kind, w)) {
          if (kind !== 'all') expect(r[2]).toBe(kind);
          if (w) expect(`${r[5]} ${r[1]}`.toLowerCase().replace(/-/g, ' ')).toContain(w);
        }
        const s = surprise(index.items, 8);
        expect(new Set(s.map((r) => r[0])).size).toBe(s.length);
      }),
      { numRuns: 30 },
    );
  });
});
