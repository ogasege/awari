/**
 * The media collector's HTTP queue (23-media-library Req 10): one request at a time, at least one second apart,
 * a descriptive User-Agent with a contact address from the environment, `maxlag=5`, a 30 s timeout, retry with
 * backoff, and every answer written to `data/raw/media/` so a rerun never repeats a request.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const RAW = join('data', 'raw', 'media');
const GAP_MS = 1100;
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 6;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

let last = 0;
let requests = 0;
let chain: Promise<unknown> = Promise.resolve();

export function requestCount(): number {
  return requests;
}

/** `AWARI_CONTACT` names who is calling (an e-mail address or a URL). */
export function userAgent(): string {
  return `AwariMediaCollector/1.0 (${process.env['AWARI_CONTACT'] ?? 'https://github.com/awari-encyclopedia; educational open-source project'})`;
}

/** POSTs a form to a MediaWiki API, from the cache when the same request was answered before. */
export function api<T>(endpoint: string, params: Record<string, string>, opts: { maxlag?: boolean } = {}): Promise<T> {
  // Wikidata counts its query-service lag in `maxlag`, which says nothing about plain reads, so reads there omit it.
  const form: Record<string, string> = { format: 'json', formatversion: '2', ...(opts.maxlag === false ? {} : { maxlag: '5' }), ...params };
  const key = createHash('sha1').update(endpoint + JSON.stringify(Object.entries(form).sort())).digest('hex');
  mkdirSync(RAW, { recursive: true });
  const file = join(RAW, `${key}.json`);
  if (existsSync(file)) {
    return Promise.resolve(JSON.parse(readFileSync(file, 'utf8')) as T);
  }
  const run = async (): Promise<T> => {
    for (let attempt = 1; ; attempt++) {
      const wait = last + GAP_MS - Date.now();
      if (wait > 0) await sleep(wait);
      last = Date.now();
      requests++;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'User-Agent': userAgent(), 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(form),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
        if (!res.ok) throw new Error(`HTTP ${res.status} (not retried)`);
        const json = (await res.json()) as { error?: { code?: string; info?: string } };
        if (json.error?.code === 'maxlag') throw new Error('maxlag');
        if (json.error) throw new Error(`API error ${json.error.code}: ${json.error.info}`);
        writeFileSync(file, JSON.stringify(json));
        return json as T;
      } catch (error) {
        if (attempt >= MAX_ATTEMPTS || String(error).includes('not retried')) throw error;
        await sleep(2000 * 2 ** (attempt - 1));
      }
    }
  };
  const next = chain.then(run, run);
  chain = next.catch(() => undefined);
  return next;
}
