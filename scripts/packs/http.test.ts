// @vitest-environment node
/** Tests for the caching, polite HTTP client. */
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { RAW_DIR, USER_AGENT, fetchJson, withQuery } from './http.ts';

const kind = `test-${process.pid}-${Date.now()}`;

afterAll(() => {
  rmSync(join(RAW_DIR, kind), { recursive: true, force: true });
  vi.unstubAllGlobals();
});

describe('fetchJson', () => {
  it('sends the User-Agent, retries a 503 and then serves from cache (Req 1.2, 1.3)', async () => {
    const calls: RequestInit[] = [];
    const responses = [
      new Response('busy', { status: 503 }),
      new Response(JSON.stringify({ ok: 1 }), { status: 200 }),
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => {
        calls.push(init);
        return Promise.resolve(responses.shift());
      }),
    );
    const url = 'https://example.org/api?x=1';
    const first = await fetchJson<{ ok: number }>(url, { kind });
    expect(first.body).toEqual({ ok: 1 });
    expect(calls).toHaveLength(2);
    expect((calls[0]?.headers as Record<string, string>)['User-Agent']).toBe(
      USER_AGENT,
    );
    const second = await fetchJson<{ ok: number }>(url, { kind });
    expect(second).toEqual(first);
    expect(calls).toHaveLength(2);
  });

  it('retries when the connection drops while the body is read', async () => {
    const broken = new ReadableStream({
      start(controller) {
        controller.error(new TypeError('terminated'));
      },
    });
    const responses = [
      new Response(broken, { status: 200 }),
      new Response(JSON.stringify({ ok: 2 }), { status: 200 }),
    ];
    const fetchMock = vi.fn(() => Promise.resolve(responses.shift()));
    vi.stubGlobal('fetch', fetchMock);
    const res = await fetchJson<{ ok: number }>('https://example.org/drop', { kind });
    expect(res.body).toEqual({ ok: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fails clearly on a 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('no', { status: 404 }))),
    );
    await expect(
      fetchJson('https://example.org/missing', { kind }),
    ).rejects.toThrow(/HTTP 404/);
  });
});

describe('withQuery', () => {
  it('encodes parameters', () => {
    expect(withQuery('https://a.org/w', { titles: "Ohm's law", n: 2 })).toBe(
      'https://a.org/w?titles=Ohm%27s+law&n=2',
    );
  });
});
