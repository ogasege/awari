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
    expect(screen.getByText(/of 197 countries discovered/)).toBeInTheDocument();
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

  it('draws progress as one stamp sheet per continent with its own count (21-review-2 Req 15)', async () => {
    render(<AtlasScreen />);
    await screen.findByRole('application', { name: /Globe/ });
    const sheets = document.querySelectorAll('.stamp-sheet');
    expect(sheets).toHaveLength(6);
    let stamps = 0;
    for (const sheet of sheets) {
      expect(sheet.querySelector('.stamp-sheet__name')?.textContent).toBeTruthy();
      expect(sheet.querySelector('.stamp-sheet__count')?.textContent).toMatch(/^\d+ of \d+$/);
      stamps += sheet.querySelectorAll('.stamp-sheet__stamps span').length;
    }
    expect(stamps).toBe(197);
  });
});
