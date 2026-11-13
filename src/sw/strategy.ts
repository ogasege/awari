/**
 * Pure decisions behind the service worker (09-offline), kept free of
 * browser APIs so they can be property-tested and bundled into the
 * worker and the build script alike.
 */

/** Prefix of every cache Awari creates. */
export const CACHE_PREFIX = 'awari-';

/** What the worker does with one request. */
export type Plan = 'network-only' | 'navigate' | 'precache' | 'network-first' | 'media';

/** Library thumbnails: too many to save on the first visit, so they are kept as they are looked at (23-media-library Req 21). */
export const MEDIA_PREFIX = '/media/img/';

/** The parts of a request the decision needs. */
export interface RequestInfo {
  method: string;
  url: string;
  /** `request.mode`; "navigate" for page loads. */
  mode: string;
}

/**
 * Chooses how to answer a request (Req 2). Anything that is not a
 * same-origin GET, and the quiz service under /api/, never touches the
 * cache.
 */
export function planFor(
  request: RequestInfo,
  origin: string,
  precache: ReadonlySet<string>,
): Plan {
  const url = new URL(request.url, origin);
  if (request.method !== 'GET') {
    return 'network-only';
  }
  if (url.origin !== origin) {
    // The larger view of a library picture, served by Commons, is kept once looked at (Req 21).
    return url.protocol === 'https:' && url.hostname === 'commons.wikimedia.org' && url.pathname.startsWith('/wiki/Special:FilePath/') ? 'media' : 'network-only';
  }
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    return 'network-only';
  }
  if (request.mode === 'navigate') {
    return 'navigate';
  }
  if (url.pathname.startsWith(MEDIA_PREFIX)) {
    return 'media';
  }
  return precache.has(url.pathname) ? 'precache' : 'network-first';
}

/** The cache name for a version. */
export function cacheNameFor(version: string): string {
  return `${CACHE_PREFIX}${version}`;
}

/** Awari caches other than the current one, which are safe to delete. */
export function staleCaches(names: readonly string[], current: string): string[] {
  return names.filter((n) => n.startsWith(CACHE_PREFIX) && n !== current);
}

/**
 * The URLs to save, from the paths of the built files (relative to
 * dist, without a leading slash): the files themselves, "/" and
 * "/index.html", minus the worker and source maps (Req 1.2).
 */
export function precacheList(files: readonly string[]): string[] {
  const urls = new Set<string>(['/', '/index.html']);
  for (const f of files) {
    const path = `/${f.replace(/^\/+/, '')}`;
    if (path === '/sw.js' || path.endsWith('.map') || path.startsWith(MEDIA_PREFIX)) {
      continue;
    }
    urls.add(path);
  }
  return [...urls].sort();
}

/**
 * A short version name from `[path, content hash]` pairs. Order does not
 * matter; any change to a path or hash changes the result.
 */
export function versionOf(entries: ReadonlyArray<readonly [string, string]>): string {
  const text = entries
    .map(([path, hash]) => `${path}\u0000${hash}`)
    .sort()
    .join('\n');
  // FNV-1a over UTF-16 code units, twice with different seeds, for 64 bits.
  const fnv = (seed: number): string => {
    let h = seed >>> 0;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  };
  return `${fnv(2166136261)}${fnv(0x9e3779b1)}`;
}
