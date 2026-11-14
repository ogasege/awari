/**
 * The shared header: logo, main navigation, search and the offline badge.
 * Everything here is straight and calm (design rule 7).
 */
import { useEffect, useState, type FormEvent } from 'react';
import {
  dismissSavedNotice,
  savedNoticePending,
  useOfflineStatus,
  useSaveProgress,
  type OfflineStatus,
  type SaveProgress,
} from '../lib/offline/register.ts';
import { Link, navigate, usePath } from './navigation.tsx';
import { matchRoute, type RouteName } from './router.ts';
import './header.css';

const NAV: ReadonlyArray<{ to: string; label: string; routes: RouteName[] }> = [
  { to: '/', label: 'Explore', routes: ['home', 'article', 'search', 'stamps', 'continentStamps'] },
  { to: '/subjects', label: 'Subjects', routes: ['subjects', 'subject'] },
  { to: '/atlas', label: 'Atlas', routes: ['atlas'] },
  { to: '/tours', label: 'Tours', routes: ['tours', 'tour'] },
  { to: '/timeline', label: 'Timeline', routes: ['timeline'] },
  { to: '/media', label: 'Pictures', routes: ['media'] },
  { to: '/castle', label: 'Castle', routes: ['castle', 'wing'] },
  { to: '/quizzes', label: 'Quizzes', routes: ['quizzes', 'quiz'] },
];

/** Tracks the browser's online state. */
function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = (): void => setOnline(true);
    const off = (): void => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/**
 * What the header says about offline use (25-desktop task 8, owner feedback): nothing while
 * online and saved, the progress while the first save runs, and a quiet "Offline" while the
 * connection is gone. Returns null when there is nothing to say.
 */
export function headerStatus(
  saved: OfflineStatus,
  online: boolean,
  progress: SaveProgress | null = null,
): string | null {
  if (!online) {
    return 'Offline';
  }
  if (saved === 'preparing') {
    if (progress && progress.total > 0) {
      return `Saving for offline… ${Math.min(99, Math.floor((progress.saved / progress.total) * 100))}%`;
    }
    return 'Saving for offline…';
  }
  return null;
}

/** The one-time notice when the first save completes; dismissed for good with its button. */
export function SavedNotice() {
  const saved = useOfflineStatus();
  const [pending, setPending] = useState(savedNoticePending);
  if (saved !== 'ready' || !pending) {
    return null;
  }
  return (
    <div className="saved-notice" role="status">
      <span>Saved. Awari now works without a connection. Pictures beyond the lead photos are kept as you look at them.</span>
      <button
        type="button"
        className="saved-notice__close"
        onClick={() => {
          dismissSavedNotice();
          setPending(false);
        }}
      >
        Got it
      </button>
    </div>
  );
}

export function Header() {
  const path = usePath();
  const route = matchRoute(path).name;
  const online = useOnline();
  const offline = useOfflineStatus();
  const progress = useSaveProgress();
  const status = headerStatus(offline, online, progress);
  const [query, setQuery] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo" aria-label="Awari home">
        <img src="/logo/awari-logo.svg" alt="" width={134} height={62} />
      </Link>
      <nav aria-label="Main" className="site-header__nav">
        {NAV.map((item) => {
          const current = item.routes.includes(route);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={current ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form role="search" className="site-header__search" onSubmit={submit}>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D5F0F3" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <label htmlFor="site-search" className="sr-only">
          Search Awari
        </label>
        <input
          id="site-search"
          type="search"
          placeholder="Search anything"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <span
        className={
          status
            ? `site-header__badge${online ? '' : ' site-header__badge--offline'}`
            : 'sr-only'
        }
        role="status"
      >
        {status ?? ''}
      </span>
      <SavedNotice />
    </header>
  );
}
