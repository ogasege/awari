/**
 * Test helper: serves `/packs/...` requests from the committed files in
 * public/packs, so component tests use real pack data with no network.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { vi } from 'vitest';

export function servePacksFromDisk(overrides: Readonly<Record<string, unknown>> = {}): void {
  vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const path = new URL(url, 'http://localhost').pathname;
    if (!path.startsWith('/packs/')) {
      return new Response('not found', { status: 404 });
    }
    const override = overrides[path];
    if (override !== undefined) {
      return new Response(JSON.stringify(override), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    try {
      const body = await readFile(join(process.cwd(), 'public', path));
      return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } });
    } catch {
      return new Response('not found', { status: 404 });
    }
  });
}
