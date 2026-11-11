/**
 * Loads content packs on demand from `/packs/…`. Requests are shared and
 * cached in memory; the service worker caches them on disk for offline.
 */
import { useEffect, useState } from 'react';

const cache = new Map<string, Promise<unknown>>();

/** Fetches and parses a pack file once per session. */
export function loadPack<T>(path: string, fetchImpl: typeof fetch = fetch): Promise<T> {
  const url = `/packs/${path.replace(/^\/+/, '')}`;
  let p = cache.get(url);
  if (!p) {
    p = fetchImpl(url).then((res) => {
      if (!res.ok) {
        throw new Error(`Could not open ${url} (${res.status})`);
      }
      return res.json() as Promise<unknown>;
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p as Promise<T>;
}

export type PackState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; error: string };

/** React hook around loadPack. Pass null to skip loading. */
export function usePack<T>(path: string | null): PackState<T> {
  const [state, setState] = useState<{ path: string | null; value: PackState<T> }>({
    path,
    value: { status: 'loading' },
  });
  useEffect(() => {
    if (!path) {
      return;
    }
    let live = true;
    loadPack<T>(path).then(
      (data) => live && setState({ path, value: { status: 'ready', data } }),
      (e: unknown) =>
        live &&
        setState({
          path,
          value: { status: 'error', error: e instanceof Error ? e.message : String(e) },
        }),
    );
    return () => {
      live = false;
    };
  }, [path]);
  return state.path === path ? state.value : { status: 'loading' };
}

/** Public URL of a pack asset such as a photo. */
export function packUrl(file: string): string {
  return `/packs/${file.replace(/^\/+/, '')}`;
}
