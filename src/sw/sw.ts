/**
 * Awari's service worker (09-offline). On install it saves the whole
 * built site, so after one visit every pack feature works with no
 * network. The precache list and version are injected by
 * `scripts/build-sw.ts`. The decisions live in `strategy.ts`.
 */
import { cacheNameFor, planFor, staleCaches } from './strategy.ts';

/** Pictures looked at, kept for offline. Its name does not start with the site prefix, so a new site version keeps it. */
const MEDIA_CACHE = 'media-awari-v1';
/** At most this many pictures are kept; the oldest go first. */
const MEDIA_LIMIT = 800;

declare const __PRECACHE__: string[];
declare const __VERSION__: string;

/** The few worker APIs used here, typed locally so the DOM lib can stay. */
interface WorkerScope {
  location: Location;
  registration: unknown;
  skipWaiting(): Promise<void>;
  clients: {
    claim(): Promise<void>;
    matchAll(options?: { includeUncontrolled?: boolean; type?: string }): Promise<Array<{ postMessage(m: unknown): void }>>;
  };
  addEventListener(type: string, listener: (event: never) => void): void;
}

interface WaitEvent {
  waitUntil(p: Promise<unknown>): void;
}
interface FetchEv {
  request: Request;
  respondWith(r: Promise<Response> | Response): void;
}
interface MessageEv {
  data: unknown;
  ports: ReadonlyArray<{ postMessage(m: unknown): void }>;
}

const scope = self as unknown as WorkerScope;
const CACHE = cacheNameFor(__VERSION__);
const PRECACHE = new Set(__PRECACHE__);
/** Files fetched at once during install. */
const BATCH = 16;

async function announce(type: 'ready'): Promise<void> {
  const clients = await scope.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const c of clients) {
    c.postMessage({ type, version: __VERSION__, files: __PRECACHE__.length });
  }
}

/** Saves every file; any failure rejects, so the install fails whole. */
async function saveSite(): Promise<void> {
  const cache = await caches.open(CACHE);
  const missing = [];
  for (const url of __PRECACHE__) {
    if (!(await cache.match(url))) {
      missing.push(url);
    }
  }
  for (let i = 0; i < missing.length; i += BATCH) {
    await Promise.all(
      missing.slice(i, i + BATCH).map(async (url) => {
        const res = await fetch(url, { cache: 'reload' });
        if (!res.ok) {
          throw new Error(`Could not save ${url} (${res.status})`);
        }
        await cache.put(url, res);
      }),
    );
  }
}

scope.addEventListener('install', (event: WaitEvent) => {
  event.waitUntil(
    saveSite().then(async () => {
      await scope.skipWaiting();
      await announce('ready');
    }),
  );
});

scope.addEventListener('activate', (event: WaitEvent) => {
  event.waitUntil(
    (async () => {
      for (const name of staleCaches(await caches.keys(), CACHE)) {
        await caches.delete(name);
      }
      await scope.clients.claim();
      await announce('ready');
    })(),
  );
});

async function fromCache(url: string): Promise<Response | undefined> {
  const cache = await caches.open(CACHE);
  return cache.match(url, { ignoreSearch: true });
}

async function mediaAnswer(request: Request): Promise<Response> {
  const cache = await caches.open(MEDIA_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  // A picture from Commons arrives as an opaque response in an <img>; it can be kept all the same.
  if (res.ok || res.type === 'opaque') {
    await cache.put(request, res.clone());
    const keys = await cache.keys();
    for (const old of keys.slice(0, Math.max(0, keys.length - MEDIA_LIMIT))) {
      await cache.delete(old);
    }
  }
  return res;
}

async function answer(request: Request): Promise<Response> {
  const plan = planFor(request, scope.location.origin, PRECACHE);
  if (plan === 'network-only') {
    return fetch(request);
  }
  if (plan === 'navigate') {
    return (await fromCache('/index.html')) ?? fetch(request);
  }
  if (plan === 'media') {
    return mediaAnswer(request);
  }
  if (plan === 'precache') {
    return (await fromCache(new URL(request.url).pathname)) ?? fetch(request);
  }
  try {
    return await fetch(request);
  } catch {
    return (await fromCache(new URL(request.url).pathname)) ?? Response.error();
  }
}

scope.addEventListener('fetch', (event: FetchEv) => {
  const plan = planFor(event.request, scope.location.origin, PRECACHE);
  if (plan === 'network-only') {
    return; // let the browser handle it; it is never cached
  }
  event.respondWith(answer(event.request));
});

scope.addEventListener('message', (event: MessageEv) => {
  const data = event.data as { type?: string } | null;
  if (data?.type === 'status') {
    void caches.has(CACHE).then(async (has) => {
      const cache = has ? await caches.open(CACHE) : undefined;
      const saved = cache ? (await cache.keys()).length : 0;
      event.ports[0]?.postMessage({
        type: 'status',
        ready: saved >= __PRECACHE__.length,
        version: __VERSION__,
        files: __PRECACHE__.length,
      });
    });
  }
});
