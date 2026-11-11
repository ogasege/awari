/**
 * Parses and limits a quiz request before anything costs money. Only
 * `{ title, text, pack? }` is accepted; the service never fetches a URL
 * a caller supplies, so there is no server-side request forgery surface.
 */
import type { PackId } from '../../../src/lib/packs/types.ts';
import { PACK_IDS } from '../../../src/lib/quiz/validate.ts';

/** Size limits for one request. */
export const LIMITS = {
  /** Largest accepted request body, in bytes. */
  maxBodyBytes: 64 * 1024,
  maxTitleChars: 200,
  /** Shorter texts cannot support five fair questions. */
  minTextChars: 200,
  maxTextChars: 40_000,
} as const;

/** A request that passed every check. */
export interface QuizRequest {
  title: string;
  text: string;
  pack: PackId;
}

/** The outcome of `parseRequest`. */
export type ParseResult =
  | { ok: true; value: QuizRequest }
  | { ok: false; status: 400 | 413; error: string };

const fail = (error: string, status: 400 | 413 = 400): ParseResult => ({
  ok: false,
  status,
  error,
});

/**
 * Decodes, size-checks and validates a request body from a Lambda
 * function URL event.
 */
export function parseRequest(
  body: string | undefined,
  isBase64Encoded = false,
): ParseResult {
  if (body === undefined || body === '') {
    return fail('Request body is required.');
  }
  const raw = isBase64Encoded
    ? Buffer.from(body, 'base64').toString('utf8')
    : body;
  if (Buffer.byteLength(raw, 'utf8') > LIMITS.maxBodyBytes) {
    return fail('Request body is too large.', 413);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fail('Request body must be JSON.');
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return fail('Request body must be a JSON object.');
  }
  const { title, text, pack } = data as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim() === '') {
    return fail('"title" must be a non-empty string.');
  }
  if (title.length > LIMITS.maxTitleChars) {
    return fail(`"title" must be at most ${LIMITS.maxTitleChars} characters.`);
  }
  if (typeof text !== 'string') {
    return fail('"text" must be a string.');
  }
  const length = text.trim().length;
  if (length < LIMITS.minTextChars || text.length > LIMITS.maxTextChars) {
    return fail(
      `"text" must be ${LIMITS.minTextChars} to ${LIMITS.maxTextChars} ` +
        'characters.',
    );
  }
  if (pack !== undefined && !PACK_IDS.includes(pack as PackId)) {
    return fail(`"pack" must be one of: ${PACK_IDS.join(', ')}.`);
  }

  return {
    ok: true,
    value: { title: title.trim(), text, pack: (pack as PackId) ?? 'countries' },
  };
}
