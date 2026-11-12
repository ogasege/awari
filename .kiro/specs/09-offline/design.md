# Design: Offline

## Pieces

- `src/sw/strategy.ts`: pure decisions shared by the worker and its
  tests: `planFor`, `cacheNameFor`, `staleCaches`, `precacheList`,
  `versionOf`.
- `src/sw/sw.ts`: the worker. Install saves the precache in batches,
  activate removes stale caches and claims clients, fetch applies
  `planFor`, a `status` message reports readiness. It posts `ready` to
  every window when install finishes.
- `scripts/build-sw.ts`: walks `dist/`, hashes every file, bundles
  `sw.ts` with esbuild and defines `__PRECACHE__` and `__VERSION__`.
  Runs as the last step of `npm run build`.
- `src/lib/offline/register.ts`: registers `/sw.js` in production,
  keeps a small store (`unsupported`, `preparing`, `ready`) fed by the
  `ready` message and by asking the worker for its status, and exposes
  `useOfflineStatus()` for the header badge.
- Progress (discovered countries, quiz results, castle rooms) is stored
  in IndexedDB by `src/lib/store` and falls back to memory.
- `public/manifest.webmanifest`: makes the app installable.
- `scripts/offline-check.ts`: Playwright run described in Requirement 4.

## Plans

| request | plan |
| --- | --- |
| non-GET, cross-origin, `/api/…` | network only |
| navigation (same origin) | cached `/index.html` |
| path in the precache | cache first |
| anything else same-origin | network, then cache |

## Correctness properties

1. Requests that are not same-origin GETs, and every `/api/` request, are
   planned as network-only, whatever the precache holds.
2. Every same-origin GET for a precached path that is not a navigation is
   planned cache-first.
3. Every same-origin navigation is planned as a navigation, so each route
   opens offline.
4. `staleCaches` never contains the current cache and only contains
   Awari caches.
5. `precacheList` always contains `/` and `/index.html`, never `sw.js`
   or source maps, and has no duplicates.
6. `versionOf` does not depend on file order, and changes when any file's
   path or contents change.
