import { describe, expect, it } from 'vitest';
import { corsHeaders, parseOrigins } from '../src/cors.ts';
import { LIMITS, parseRequest } from '../src/request.ts';
import { TEXT } from './fixtures.ts';

const body = (value: unknown): string => JSON.stringify(value);

describe('parseRequest', () => {
  it('accepts a title and text, defaulting the pack', () => {
    expect(parseRequest(body({ title: ' Ghana ', text: TEXT }))).toEqual({
      ok: true,
      value: { title: 'Ghana', text: TEXT, pack: 'countries' },
    });
  });

  it('accepts a known pack and base64 bodies', () => {
    const raw = body({ title: 'Charge', text: TEXT, pack: 'physics' });
    const result = parseRequest(Buffer.from(raw).toString('base64'), true);
    expect(result.ok && result.value.pack).toBe('physics');
  });

  it.each([
    [undefined, /required/],
    ['', /required/],
    ['{nope', /JSON/],
    ['[1,2]', /object/],
    [body({ text: TEXT }), /title/],
    [body({ title: '  ', text: TEXT }), /title/],
    [body({ title: 'x'.repeat(201), text: TEXT }), /at most 200/],
    [body({ title: 'Ghana' }), /"text" must be a string/],
    [body({ title: 'Ghana', text: 'short' }), /200 to 40000/],
    [body({ title: 'Ghana', text: ' '.repeat(500) }), /200 to 40000/],
    [body({ title: 'Ghana', text: 'x'.repeat(40_001) }), /200 to 40000/],
    [body({ title: 'Ghana', text: TEXT, pack: 'music' }), /pack/],
  ])('rejects %#', (raw, message) => {
    const result = parseRequest(raw);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.status).toBe(400);
    expect(!result.ok && result.error).toMatch(message);
  });

  it('rejects oversized bodies with 413', () => {
    const raw = body({ title: 'Ghana', text: 'é'.repeat(LIMITS.maxBodyBytes) });
    const result = parseRequest(raw);
    expect(!result.ok && result.status).toBe(413);
  });

  it('ignores a url field and never treats it as something to fetch', () => {
    const result = parseRequest(
      body({ title: 'Ghana', text: TEXT, url: 'http://169.254.169.254/' }),
    );
    expect(result.ok && Object.keys(result.value)).toEqual([
      'title',
      'text',
      'pack',
    ]);
  });
});

describe('CORS', () => {
  const allowed = parseOrigins(' https://awari.example/ ,https://b.example');

  it('parses the allow-list', () => {
    expect(allowed).toEqual(['https://awari.example', 'https://b.example']);
    expect(parseOrigins(undefined)).toEqual([]);
  });

  it('allows listed origins only', () => {
    expect(corsHeaders('https://awari.example', allowed)).toMatchObject({
      'access-control-allow-origin': 'https://awari.example',
      'access-control-allow-methods': 'POST, OPTIONS',
    });
    expect(corsHeaders('https://evil.example', allowed)).toEqual({
      vary: 'Origin',
    });
    expect(corsHeaders(undefined, allowed)).toEqual({ vary: 'Origin' });
  });
});
