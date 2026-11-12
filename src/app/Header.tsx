/**
 * The shared header: logo, main navigation, search and the offline badge.
 * Everything here is straight and calm (design rule 7).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { useOfflineStatus, type OfflineStatus } from '../lib/offline/register.ts';
import { Link, navigate, usePath } from './navigation.tsx';
import { matchRoute, type RouteName } from './router.ts';
import './header.css';

const NAV: ReadonlyArray<{ to: string; label: string; routes: RouteName[] }> = [
  { to: '/', label: 'Explore', routes: ['home', 'article', 'search', 'stamps'] },
  { to: '/atlas', label: 'Atlas', routes: ['atlas'] },
  { to: '/timeline', label: 'Timeline', routes: ['timeline'] },
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

/** Says in words whether the site is saved for offline use (09-offline Req 3.1). */
export function badgeText(saved: OfflineStatus, online: boolean): string {
  if (saved === 'ready') {
    return online ? 'Works offline' : 'Offline, still working';
  }
  if (saved === 'preparing') {
    return online ? 'Saving for offline…' : 'Offline, still saving';
  }
  return online ? 'Not saved for offline yet' : 'Offline';
}

export function Header() {
  const path = usePath();
  const route = matchRoute(path).name;
  const online = useOnline();
  const offline = useOfflineStatus();
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
      <span className="site-header__badge" role="status">
        {offline === 'ready' ? (
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : null}
        {badgeText(offline, online)}
      </span>
    </header>
  );
}
