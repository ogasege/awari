/**
 * A polite, caching HTTP client for the pack pipeline. Every response is
 * stored in `data/raw/<kind>/` so reruns never hit the network for the
 * same request; network requests run one at a time with a pause between
 * them, send a descriptive User-Agent, and retry on 429 and 5xx.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Sent with every request so source operators know who is calling. */
export const USER_AGENT = 'AwariBuild/0.1 (educational open-source project)';

/** Root of the raw download cache (git-ignored). */
export const RAW_DIR = join('data', 'raw');

const GAP_MS = 150;
const MAX_RETRIES = 4;

/** A cached response body with the time it was first fetched. */
export interface Cached<T> {
  url: string;
  /** ISO timestamp of the original network fetch. */
  fetched: string;
  body: T;
}

/** Options for one request. */
export interface FetchOptions {
  /** Cache sub-folder, e.g. "simplewiki" or "commons". */
  kind: string;
  /** Cache file stem; defaults to a hash of the URL and body. */
  key?: string;
  /** Form body; when present the request is a POST. */
  form?: Record<string, string>;
  /** Extra request headers. */
  headers?: Record<string, string>;
}

let chain: Promise<unknown> = Promise.resolve();
let lastRequest = 0;
let networkCount = 0;

/** Number of real network requests made in this process. */
export function networkRequests(): number {
  return networkCount;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cachePath(opts: FetchOptions, url: string, ext: string): string {
  const stem =
    opts.key ??
    createHash('sha1')
      .update(url + JSON.stringify(opts.form ?? {}))
      .digest('hex');
  const dir = join(RAW_DIR, opts.kind);
  mkdirSync(dir, { recursive: true });
  return join(dir, `${stem.replace(/[^A-Za-z0-9._-]/g, '_')}${ext}`);
}

/** Runs one network request in the shared queue with retries. */
function queued(url: string, opts: FetchOptions): Promise<Response> {
  const run = async (): Promise<Response> => {
    for (let attempt = 0; ; attempt++) {
      const wait = lastRequest + GAP_MS - Date.now();
      if (wait > 0) {
        await sleep(wait);
      }
      lastRequest = Date.now();
      networkCount++;
      const init: RequestInit = {
        headers: { 'User-Agent': USER_AGENT, ...opts.headers },
      };
      if (opts.form) {
        init.method = 'POST';
        init.body = new URLSearchParams(opts.form);
      }
      let res: Response | undefined;
      try {
        res = await fetch(url, init);
      } catch (error) {
        if (attempt >= MAX_RETRIES) {
          throw new Error(`Network error for ${url}: ${String(error)}`, {
            cause: error,
          });
        }
      }
      if (res && res.status !== 429 && res.status < 500) {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} for ${url}`);
        }
        return res;
      }
      if (attempt >= MAX_RETRIES) {
        throw new Error(`HTTP ${res?.status ?? 'error'} for ${url}`);
      }
      const retryAfter = Number(res?.headers.get('retry-after') ?? '');
      await sleep(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 1000 * 2 ** attempt,
      );
    }
  };
  const next = chain.then(run, run);
  chain = next.catch(() => undefined);
  return next;
}

/** Fetches JSON, from the cache when present. */
export async function fetchJson<T>(
  url: string,
  opts: FetchOptions,
): Promise<Cached<T>> {
  const path = cachePath(opts, url, '.json');
  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, 'utf8')) as Cached<T>;
  }
  const res = await queued(url, {
    ...opts,
    headers: { Accept: 'application/json', ...opts.headers },
  });
  const cached: Cached<T> = {
    url,
    fetched: new Date().toISOString(),
    body: (await res.json()) as T,
  };
  writeFileSync(path, JSON.stringify(cached));
  return cached;
}

/** Fetches raw bytes, from the cache when present. */
export async function fetchBytes(
  url: string,
  opts: FetchOptions & { ext: string },
): Promise<Cached<Buffer>> {
  const path = cachePath(opts, url, opts.ext);
  const metaPath = `${path}.meta.json`;
  if (existsSync(path) && existsSync(metaPath)) {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as {
      url: string;
      fetched: string;
    };
    return { ...meta, body: readFileSync(path) };
  }
  const res = await queued(url, opts);
  const body = Buffer.from(await res.arrayBuffer());
  const fetched = new Date().toISOString();
  writeFileSync(path, body);
  writeFileSync(metaPath, JSON.stringify({ url, fetched }));
  return { url, fetched, body };
}

/** Builds a URL with query parameters. */
export function withQuery(
  base: string,
  params: Record<string, string | number | boolean>,
): string {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}
