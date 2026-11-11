/**
 * History-API navigation: a hook that tracks the current path, a
 * `navigate` function and a `Link` that avoids full page loads.
 */
import {
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

function currentPath(): string {
  return window.location.pathname + window.location.search;
}

/** Changes the address without reloading and notifies subscribers. */
export function navigate(to: string, replace = false): void {
  if (to === currentPath()) {
    return;
  }
  if (replace) {
    window.history.replaceState(null, '', to);
  } else {
    window.history.pushState(null, '', to);
  }
  window.scrollTo({ top: 0 });
  listeners.forEach((l) => l());
}

/** The current path, re-rendering on navigation and back/forward. */
export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath, () => '/');
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** An in-app link: plain `<a>` semantics, client-side navigation. */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (event: MouseEvent<HTMLAnchorElement>): void => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest} />;
}
