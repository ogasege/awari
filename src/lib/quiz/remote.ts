/**
 * Client for the optional quiz service. The app must work without it,
 * so every failure (offline, timeout, bad status, bad JSON, questions
 * that fail validation) resolves to `null` instead of throwing. Returned
 * questions are re-checked here against the same article the service
 * built, so a faulty or tampered service can never show an unfair one.
 */
import type { PackId, Question } from '../packs/types.ts';
import {
  articleFromText,
  isQuestionShape,
  validateQuestion,
} from './validate.ts';

/** Above the service's 45 s function timeout, so it can answer first. */
export const DEFAULT_TIMEOUT_MS = 50_000;

/** Most questions one quiz shows. */
const QUIZ_SIZE = 5;

/** Options for `fetchRemoteQuiz`. */
export interface RemoteQuizOptions {
  /** Pack the article belongs to; defaults to `countries`. */
  pack?: PackId;
  timeoutMs?: number;
}

/** Hex SHA-256 of a UTF-8 string, using Web Crypto. */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Asks the quiz service at `endpoint` for questions about the article
 * with `title` and plain `text`. Resolves to one to five validated
 * questions, or `null` when the service cannot help.
 */
export async function fetchRemoteQuiz(
  endpoint: string,
  title: string,
  text: string,
  fetchImpl: typeof fetch = fetch,
  options: RemoteQuizOptions = {},
): Promise<Question[] | null> {
  const pack = options.pack ?? 'countries';
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  try {
    const body = JSON.stringify({ title, text, pack });
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // CloudFront origin access control signs requests to the Lambda
        // function URL and needs the payload hash for POST bodies.
        'x-amz-content-sha256': await sha256Hex(body),
      },
      body,
      signal: controller.signal,
    });
    if (response.status !== 200) {
      return null;
    }
    const data: unknown = await response.json();
    if (
      typeof data !== 'object' ||
      data === null ||
      !('questions' in data) ||
      !Array.isArray(data.questions)
    ) {
      return null;
    }
    const article = articleFromText(title, text, { pack });
    const questions = (data.questions as unknown[])
      .filter(isQuestionShape)
      .filter((q) => validateQuestion(q, article).ok)
      .slice(0, QUIZ_SIZE);
    return questions.length > 0 ? questions : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
