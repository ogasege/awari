import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SAVED_NOTICE_KEY, setOfflineStatusForTests, setSaveProgressForTests } from '../lib/offline/register.ts';
import { Header, headerStatus } from './Header.tsx';

const NOTICE = 'Saved. Awari now works without a connection.';

function setOnline(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });
  window.dispatchEvent(new Event(value ? 'online' : 'offline'));
}

describe('header offline status (25-desktop task 8)', () => {
  // Node 25's own localStorage shadows jsdom's; use a plain in-memory one.
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    });
  });
  afterEach(() => {
    act(() => {
      setOfflineStatusForTests('unsupported');
      setSaveProgressForTests(null);
      setOnline(true);
    });
    vi.unstubAllGlobals();
  });

  it('says nothing while online and saved, or online with no service worker', () => {
    expect(headerStatus('ready', true)).toBeNull();
    expect(headerStatus('unsupported', true)).toBeNull();
  });

  it('shows the saving progress while the first save runs', () => {
    expect(headerStatus('preparing', true)).toBe('Saving for offline…');
    expect(headerStatus('preparing', true, { saved: 400, total: 1600 })).toBe('Saving for offline… 25%');
    // Never claims 100% before the worker says it is done.
    expect(headerStatus('preparing', true, { saved: 1600, total: 1600 })).toBe('Saving for offline… 99%');
  });

  it('shows a quiet "Offline" whenever the connection is gone', () => {
    for (const s of ['ready', 'preparing', 'unsupported'] as const) {
      expect(headerStatus(s, false)).toBe('Offline');
    }
  });

  it('shows the saved notice once, and never again after it is dismissed', () => {
    const { unmount } = render(<Header />);
    expect(screen.queryByText(NOTICE)).toBeNull();
    act(() => setOfflineStatusForTests('preparing'));
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Saving for offline…');
    act(() => setOfflineStatusForTests('ready'));
    expect(screen.getByText(NOTICE)).toBeInTheDocument();
    expect(screen.queryByText(/Works offline/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByText(NOTICE)).toBeNull();
    expect(localStorage.getItem(SAVED_NOTICE_KEY)).toBe('1');
    unmount();
    render(<Header />);
    expect(screen.queryByText(NOTICE)).toBeNull();
  });

  it('shows "Offline" when the connection drops and clears it when it returns', () => {
    act(() => setOfflineStatusForTests('ready'));
    render(<Header />);
    act(() => setOnline(false));
    expect(screen.getByText('Offline')).toBeInTheDocument();
    act(() => setOnline(true));
    expect(screen.queryByText('Offline')).toBeNull();
  });
});
