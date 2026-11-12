import { render, screen } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import ArticleScreen from '../article/ArticleScreen.tsx';
import TourScreen, { ToursList } from './TourScreen.tsx';
import { TOURS } from './tours.ts';

describe('guided tours on the committed packs (20-tours)', () => {
  beforeEach(() => servePacksFromDisk());

  it('Property 3: every stop of every tour has an article in the packs. _Req 2, 6_', () => {
    for (const t of TOURS) {
      for (const s of t.stops) {
        expect(existsSync(`public/packs/${s.article}.json`), s.article).toBe(true);
      }
    }
  });

  it('lists the three tours with their stop counts. _Req 1_', () => {
    render(<ToursList />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Great rivers of the world',
      'Wonders of the ancient world',
      'Volcanoes of the Ring of Fire',
    ]);
    expect(screen.getByRole('link', { name: /Start the tour \(8 stops\)/ })).toHaveAttribute('href', '/tours/rivers');
  });

  it('turns to a stop, shows its article summary and opens the article. _Req 3, 4_', async () => {
    window.history.replaceState(null, '', '/tours/rivers?stop=2');
    render(<TourScreen params={{ id: 'rivers' }} />);
    expect(await screen.findByRole('status')).toHaveTextContent('Stop 2 of 8: The Amazon, near Manaus, Brazil.');
    const globe = await screen.findByRole('application', { name: /Globe turned to The Amazon/ });
    expect(globe).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open the article' })).toHaveAttribute('href', '/article/earth/amazon-river?tour=rivers&stop=2');
    expect(screen.getByRole('link', { name: 'Previous stop' })).toHaveAttribute('href', '/tours/rivers?stop=1');
    expect(screen.getByRole('link', { name: 'Next stop' })).toHaveAttribute('href', '/tours/rivers?stop=3');
    expect(await screen.findByText(/Amazon/, { selector: '.tour__summary' })).toBeInTheDocument();
  });

  it('has no previous stop at the start and a finish at the end; unknown tours say so', async () => {
    window.history.replaceState(null, '', '/tours/volcanoes?stop=1');
    const first = render(<TourScreen params={{ id: 'volcanoes' }} />);
    expect(screen.queryByRole('link', { name: 'Previous stop' })).not.toBeInTheDocument();
    first.unmount();
    window.history.replaceState(null, '', '/tours/volcanoes?stop=99');
    render(<TourScreen params={{ id: 'volcanoes' }} />);
    expect(screen.getByRole('link', { name: 'Finish the tour' })).toHaveAttribute('href', '/tours');
    expect(screen.getByRole('status')).toHaveTextContent('Stop 7 of 7');
  });

  it('shows a tour bar on the stop article, and only there. _Req 5_', async () => {
    window.history.replaceState(null, '', '/article/earth/nile?tour=rivers&stop=1');
    const { unmount } = render(<ArticleScreen params={{ pack: 'earth', id: 'nile' }} />);
    const bar = await screen.findByRole('navigation', { name: 'Tour' });
    expect(bar).toHaveTextContent('Great rivers of the world: stop 1 of 8');
    expect(screen.getByRole('link', { name: 'Next stop' })).toHaveAttribute('href', '/article/earth/amazon-river?tour=rivers&stop=2');
    expect(screen.getByRole('link', { name: 'Back to the tour' })).toHaveAttribute('href', '/tours/rivers?stop=1');
    unmount();
    window.history.replaceState(null, '', '/article/earth/amazon-river?tour=rivers&stop=1');
    render(<ArticleScreen params={{ pack: 'earth', id: 'amazon-river' }} />);
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('navigation', { name: 'Tour' })).not.toBeInTheDocument();
  });
});
