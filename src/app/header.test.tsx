import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { setOfflineStatusForTests } from '../lib/offline/register.ts';
import { Header, badgeText } from './Header.tsx';

describe('offline badge (09-offline 4.1)', () => {
  afterEach(() => act(() => setOfflineStatusForTests('unsupported')));

  it('says in words whether the site is saved. _Req 3.1_', () => {
    expect(badgeText('ready', true)).toBe('Works offline');
    expect(badgeText('ready', false)).toBe('Offline, still working');
    expect(badgeText('preparing', true)).toBe('Saving for offline…');
    expect(badgeText('preparing', false)).toBe('Offline, still saving');
    expect(badgeText('unsupported', true)).toBe('Not saved for offline yet');
    expect(badgeText('unsupported', false)).toBe('Offline');
  });

  it('never claims offline support before the site is saved, and updates when it is', () => {
    render(<Header />);
    expect(screen.getByRole('status')).toHaveTextContent('Not saved for offline yet');
    act(() => setOfflineStatusForTests('preparing'));
    expect(screen.getByRole('status')).toHaveTextContent('Saving for offline…');
    act(() => setOfflineStatusForTests('ready'));
    expect(screen.getByRole('status')).toHaveTextContent('Works offline');
  });
});
