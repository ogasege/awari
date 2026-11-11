import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { createHandler } from '../src/handler.ts';
import type { Converse } from '../src/model.ts';
import { BAD, event, fakeConverse, GOOD, TEXT, TITLE } from './fixtures.ts';

const ORIGIN = 'https://awari.example';

function setup(converse: Converse = fakeConverse([GOOD])) {
  const logs: Record<string, unknown>[] = [];
  const handler = createHandler({
    converse,
    modelId: 'anthropic.claude-haiku-5-5',
    allowedOrigins: [ORIGIN],
    log: (entry) => logs.push(entry),
  });
  return { handler, logs };
}

const parse = (body: string | undefined): Record<string, unknown> =>
  JSON.parse(body ?? '{}') as Record<string, unknown>;

describe('handler', () => {
  it('answers preflight from an allowed origin', async () => {
    const { handler } = setup();
    const res = await handler(event('OPTIONS', undefined, { origin: ORIGIN }));
    expect(res.statusCode).toBe(204);
    expect(res.headers?.['access-control-allow-origin']).toBe(ORIGIN);
  });

  it('rejects other methods with 405 and never calls the model', async () => {
    const converse = fakeConverse([GOOD]);
    const { handler } = setup(converse);
    for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
      const res = await handler(event(method, { title: TITLE, text: TEXT }));
      expect(res.statusCode).toBe(405);
      expect(res.headers?.allow).toBe('POST, OPTIONS');
    }
    expect(converse.calls).toBe(0);
  });

  it('rejects bad input with 400 and never calls the model', async () => {
    const converse = fakeConverse([GOOD]);
    const { handler } = setup(converse);
    const res = await handler(event('POST', { title: TITLE, text: 'tiny' }));
    expect(res.statusCode).toBe(400);
    expect(parse(res.body).error).toMatch(/text/);
    expect(converse.calls).toBe(0);
  });

  it('rejects text with no paragraphs', async () => {
    const { handler } = setup();
    const text = Array.from({ length: 30 }, (_, i) => `== H${i} ==`).join('\n');
    const res = await handler(event('POST', { title: TITLE, text }));
    expect(res.statusCode).toBe(400);
  });

  it('returns validated questions with CORS for the allowed origin', async () => {
    const converse = fakeConverse([[...GOOD.slice(0, 5), BAD[0], BAD[1]]]);
    const { handler, logs } = setup(converse);
    const res = await handler(
      event('POST', { title: TITLE, text: TEXT }, { origin: ORIGIN }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers?.['access-control-allow-origin']).toBe(ORIGIN);
    expect(res.headers?.['cache-control']).toBe('no-store');
    const body = parse(res.body);
    expect(body.rejected).toBe(2);
    expect(body.questions).toHaveLength(5);
    expect(JSON.stringify(logs)).not.toContain('Volta');
  });

  it('gives no CORS headers to other origins', async () => {
    const { handler } = setup();
    const res = await handler(
      event('POST', { title: TITLE, text: TEXT }, {
        origin: 'https://evil.example',
      }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers?.['access-control-allow-origin']).toBeUndefined();
  });

  it('returns 502 without details when the model fails', async () => {
    const { handler, logs } = setup(async () => {
      throw new Error('AccessDeniedException: secret detail');
    });
    const res = await handler(event('POST', { title: TITLE, text: TEXT }));
    expect(res.statusCode).toBe(502);
    expect(res.body).not.toContain('secret');
    expect(logs.at(-1)).toMatchObject({ event: 'model_error', error: 'Error' });
  });

  it('never answers 403 or 404 (CloudFront would mask them)', async () => {
    const { handler } = setup();
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('GET', 'POST', 'PUT', 'OPTIONS', 'HEAD'),
        fc.oneof(fc.string(), fc.constant(undefined)),
        async (method, body) => {
          const e = event(method);
          e.body = body;
          const res = await handler(e);
          expect([403, 404]).not.toContain(res.statusCode);
        },
      ),
      { numRuns: 50 },
    );
  });
});
