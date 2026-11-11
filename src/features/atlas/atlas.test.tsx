import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { getProgress, resetForTests } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import AtlasScreen from './AtlasScreen.tsx';

describe('Atlas (04-atlas)', () => {
  beforeEach(() => {
    servePacksFromDisk();
    resetForTests();
    window.history.replaceState(null, '', '/atlas');
  });

  it('draws the Natural Earth shapes and selects Nigeria from the picker', async () => {
    const user = userEvent.setup();
    render(<AtlasScreen />);
    const globe = await screen.findByRole('application', { name: /Globe/ });
    expect(globe.querySelectorAll('path.globe__land').length).toBeGreaterThan(50);

    await user.selectOptions(screen.getByLabelText('Or choose a country'), 'NGA');
    const card = await screen.findByRole('region', { name: 'Nigeria' });
    expect(within(card).getByText('Abuja')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Read about Nigeria' })).toHaveAttribute('href', '/article/countries/nigeria');
    expect(within(card).getByRole('link', { name: 'Take the quiz' })).toHaveAttribute('href', '/quiz/countries/nigeria');
    await waitFor(() => expect(getProgress().discovered).toContain('nigeria'));
    expect(globe.querySelector('path.is-selected')?.getAttribute('data-iso')).toBe('NGA');
    expect(screen.getByText(/of Africa’s 54 countries discovered/)).toBeInTheDocument();
  });

  it('opens with ?c= preselected and turns with the arrow keys', async () => {
    window.history.replaceState(null, '', '/atlas?c=kenya');
    const user = userEvent.setup();
    render(<AtlasScreen />);
    expect(await screen.findByRole('region', { name: 'Kenya' })).toBeInTheDocument();
    const globe = screen.getByRole('application', { name: /Globe/ });
    const before = globe.querySelector('path.is-selected')?.getAttribute('d');
    globe.focus();
    await user.keyboard('{ArrowLeft}');
    expect(globe.querySelector('path.is-selected')?.getAttribute('d')).not.toBe(before);
  });
});
