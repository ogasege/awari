import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetForTests, update, withDiscovered } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import StampsScreen from './StampsScreen.tsx';

describe('Stamp book screen (08-stamp-book 3.2)', () => {
  beforeEach(() => {
    servePacksFromDisk();
    resetForTests();
  });

  it('says the book is empty in words and shows 54 empty African slots. _Req 3.1, 3.4_', async () => {
    render(<StampsScreen />);
    expect(await screen.findByText(/Your book is empty so far/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Spin the globe' })).toHaveAttribute('href', '/atlas');
    expect(screen.getAllByText('Not found yet')).toHaveLength(54);
    expect(screen.getByRole('status')).toHaveTextContent('0 of 54 African countries');
  });

  it('turns discovered countries into linked stamps and counts them. _Req 3.1-3.3_', async () => {
    await update((p) => withDiscovered(withDiscovered(withDiscovered(p, 'nigeria'), 'ghana'), 'france'));
    render(<StampsScreen />);
    expect(await screen.findByText(/2 of 54/)).toBeInTheDocument();
    expect(screen.getAllByText('Not found yet')).toHaveLength(52);
    const nigeria = screen.getByRole('link', { name: /Nigeria/ });
    expect(nigeria).toHaveAttribute('href', '/article/countries/nigeria');
    const world = screen.getByRole('heading', { name: 'Around the world' }).nextElementSibling as HTMLElement;
    expect(within(world).getByRole('link', { name: /France/ })).toHaveAttribute('href', '/article/countries/france');
    expect(screen.getByRole('status')).toHaveTextContent('3 stamps in all');
  });
});
