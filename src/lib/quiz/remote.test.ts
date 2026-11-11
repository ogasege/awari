import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import type { Question } from '../packs/types.ts';
import { fetchRemoteQuiz, sha256Hex } from './remote.ts';
import { articleFromText, validateQuestion } from './validate.ts';

const ENDPOINT = 'https://awari.example/api/quiz';
const TITLE = 'Ghana';
const TEXT = [
  'Ghana is a country in West Africa. Its capital is Accra.',
  '',
  '== Economy ==',
  'Ghana exports cocoa, gold and oil. The currency is the cedi.',
].join('\n');

const GOOD: Question[] = [
  {
    id: 'ghana-ai-1',
    articleId: 'ghana',
    pack: 'countries',
    prompt: 'What is the capital of Ghana?',
    options: ['Kumasi', 'Accra', 'Tamale', 'Lagos'],
    answer: 1,
    hints: {
      nudge: 'It is on the coast.',
      whereToLook: 'The opening paragraph.',
      removed: [0, 3],
    },
    proof: 'Its capital is Accra.',
    proofSection: '',
  },
  {
    id: 'ghana-ai-2',
    articleId: 'ghana',
    pack: 'countries',
    prompt: 'What is the currency called?',
    options: ['naira', 'cedi', 'rand', 'shilling'],
    answer: 1,
    hints: {
      nudge: 'It is a short word.',
      whereToLook: 'Economy.',
      removed: [0, 2],
    },
    proof: 'The currency is the cedi.',
    proofSection: 'Economy',
  },
];

const UNFAIR: Question = { ...GOOD[0]!, proof: 'Its capital is Kumasi.' };

function respond(body: unknown, status = 200): typeof fetch {
  return vi.fn(async () =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
    }),
  );
}

describe('fetchRemoteQuiz', () => {
  it('hashes with SHA-256', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('posts title, text and pack with the payload hash', async () => {
    const fetchImpl = respond({ questions: GOOD, rejected: 0 });
    await fetchRemoteQuiz(ENDPOINT, TITLE, TEXT, fetchImpl, {
      pack: 'physics',
    });
    const [url, init] = vi.mocked(fetchImpl).mock.calls[0] ?? [];
    expect(url).toBe(ENDPOINT);
    expect(init?.method).toBe('POST');
    const body = String(init?.body);
    expect(JSON.parse(body)).toEqual({
      title: TITLE,
      text: TEXT,
      pack: 'physics',
    });
    const headers = init?.headers as Record<string, string>;
    expect(headers['x-amz-content-sha256']).toBe(await sha256Hex(body));
  });

  it('keeps only questions that pass validation locally', async () => {
    const result = await fetchRemoteQuiz(
      ENDPOINT,
      TITLE,
      TEXT,
      respond({ questions: [UNFAIR, GOOD[0], { junk: true }, GOOD[1]] }),
    );
    expect(result?.map((q) => q.id)).toEqual(['ghana-ai-1', 'ghana-ai-2']);
  });

  it.each([
    ['a non-200 status', respond({ questions: GOOD }, 502)],
    ['an HTML page (SPA fallback)', respond('<!doctype html><html></html>')],
    ['a body without questions', respond({ rejected: 3 })],
    ['only unfair questions', respond({ questions: [UNFAIR] })],
    [
      'a network error',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    ],
  ])('returns null for %s', async (_, fetchImpl) => {
    expect(await fetchRemoteQuiz(ENDPOINT, TITLE, TEXT, fetchImpl)).toBeNull();
  });

  it('returns null when the service is too slow', async () => {
    const hanging: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });
    const result = await fetchRemoteQuiz(ENDPOINT, TITLE, TEXT, hanging, {
      timeoutMs: 20,
    });
    expect(result).toBeNull();
  });

  it('Property 12: whatever the endpoint returns, the result is null or valid questions, and it never throws (Req 7.1-7.3)', async () => {
    const article = articleFromText(TITLE, TEXT);
    const item = fc.oneof(
      fc.constantFrom<unknown>(...GOOD, UNFAIR),
      fc.anything(),
    );
    const payload = fc.oneof(
      fc.record({ questions: fc.array(item, { maxLength: 8 }) }),
      fc.anything(),
      fc.string(),
    );
    const status = fc.constantFrom(200, 200, 400, 403, 500, 502);
    await fc.assert(
      fc.asyncProperty(payload, status, async (body, code) => {
        const fetchImpl: typeof fetch = async () =>
          new Response(
            typeof body === 'string' ? body : JSON.stringify(body),
            { status: code },
          );
        const result = await fetchRemoteQuiz(ENDPOINT, TITLE, TEXT, fetchImpl);
        if (result !== null) {
          expect(result.length).toBeGreaterThan(0);
          expect(result.length).toBeLessThanOrEqual(5);
          for (const q of result) {
            expect(validateQuestion(q, article)).toEqual({ ok: true });
          }
        }
      }),
      { numRuns: 200 },
    );
  });
});
