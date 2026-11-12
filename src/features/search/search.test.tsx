import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import SearchScreen from './SearchScreen.tsx';

describe('Search screen from the committed packs (13-search 3.1)', () => {
  beforeEach(() => {
    servePacksFromDisk();
    window.history.replaceState(null, '', '/search');
  });

  it('asks for a word when the query is blank. _Req 1.3_', async () => {
    render(<SearchScreen />);
    expect(screen.getByText('Type a word or a name to start.')).toBeInTheDocument();
  });

  it('finds the Nigeria article and its quiz from ?q=. _Req 2.1, 2.2_', async () => {
    window.history.replaceState(null, '', '/search?q=nigeria');
    render(<SearchScreen />);
    const link = await screen.findByRole('link', { name: 'Nigeria' });
    expect(link).toHaveAttribute('href', '/article/countries/nigeria');
    expect(screen.getByRole('link', { name: 'Take the Nigeria quiz' })).toHaveAttribute(
      'href',
      '/quiz/countries/nigeria',
    );
  });

  it('finds timeline events and a dictionary meaning. _Req 2.2_', async () => {
    const user = userEvent.setup();
    render(<SearchScreen />);
    await user.type(screen.getByLabelText('Search articles, events and words'), 'delta{enter}');
    expect(await screen.findByRole('heading', { name: 'The word “delta”' })).toBeInTheDocument();
    window.history.replaceState(null, '', '/search');
    await user.clear(screen.getByLabelText('Search articles, events and words'));
    await user.type(screen.getByLabelText('Search articles, events and words'), 'curie{enter}');
    expect(await screen.findByText('Marie Curie was born on 7 November 1867.')).toBeInTheDocument();
  });

  it('says so in words when nothing matches. _Req 2.3_', async () => {
    window.history.replaceState(null, '', '/search?q=zzzxqj');
    render(<SearchScreen />);
    expect(await screen.findByText(/Nothing matched/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'spin the globe' })).toHaveAttribute('href', '/atlas');
  });
});
