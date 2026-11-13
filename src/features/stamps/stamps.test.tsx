import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EMPTY_PROGRESS, resetForTests, update, withDiscovered } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import ContinentStamps from './ContinentStamps.tsx';
import StampsScreen from './StampsScreen.tsx';

describe('World stamp book screens (16-world-stamp-book 3)', () => {
  beforeEach(async () => {
    servePacksFromDisk();
    resetForTests();
    await update(() => EMPTY_PROGRESS); // IndexedDB keeps progress between tests
  });

  it('says the book is empty in words, with the world count and a card per continent. _Req 2_', async () => {
    render(<StampsScreen />);
    expect(await screen.findByText(/Your book is empty so far/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Spin the globe' })).toHaveAttribute('href', '/atlas');
    expect(screen.getByRole('status')).toHaveTextContent('0 of 197 countries');
    const cards = screen.getAllByRole('link', { name: /Open this page$/ });
    expect(cards.map((c) => c.textContent)).toEqual([
      'Africa0 of 54',
      'Asia0 of 49',
      'Europe0 of 45',
      'North America0 of 23',
      'South America0 of 12',
      'Oceania0 of 14',
    ]);
    expect(cards[3]).toHaveAttribute('href', '/stamps/north-america');
  });

  it('counts discovered countries in the world and on their continents. _Req 2, 5_', async () => {
    await update((p) => ['nigeria', 'ghana', 'france', 'japan', 'brazil', 'fiji'].reduce(withDiscovered, p));
    render(<StampsScreen />);
    expect(await screen.findByText(/6 of 197/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Africa: 2 of 54 countries/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Oceania: 1 of 14 countries/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^South America: 1 of 12 countries/ })).toBeInTheDocument();
  });

  it('shows a continent page with a slot per country, found ones linked, the rest in words. _Req 3_', async () => {
    await update((p) => ['nigeria', 'ghana', 'france'].reduce(withDiscovered, p));
    render(<ContinentStamps params={{ continent: 'africa' }} />);
    expect(await screen.findByText(/2 of 54/)).toBeInTheDocument();
    expect(screen.getAllByText('Not found yet')).toHaveLength(52);
    expect(screen.getByRole('link', { name: /Nigeria/ })).toHaveAttribute('href', '/article/countries/nigeria');
    expect(screen.queryByRole('link', { name: /France/ })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('3 of 197 in the world');
  });

  it('has a page for a small continent too, and says so for a place that has none', async () => {
    const { unmount } = render(<ContinentStamps params={{ continent: 'oceania' }} />);
    expect(await screen.findByText(/0 of 14/)).toBeInTheDocument();
    expect(screen.getAllByText('Not found yet')).toHaveLength(14);
    unmount();
    render(<ContinentStamps params={{ continent: 'atlantis' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('There is no stamp page for that place');
    const world = within(document.body).getByRole('link', { name: 'Oceania' });
    expect(world).toHaveAttribute('href', '/stamps/oceania');
  });
});

describe('stamp sheets are one component (22-review-3 Req 5, 6)', () => {
  it('draws six sheets in the stamp book, each with one blank slot per country', async () => {
    const { container } = render(<StampsScreen />);
    await screen.findByText(/Your book is empty so far/);
    const sheets = container.querySelectorAll('.stamp-sheet');
    expect(sheets).toHaveLength(6);
    const slots = [...sheets].reduce((n, s) => n + s.querySelectorAll('.stamp-sheet__stamps span').length, 0);
    expect(slots).toBe(197);
  });
});
