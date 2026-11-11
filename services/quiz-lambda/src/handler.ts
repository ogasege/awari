/**
 * The Lambda function URL handler: method and CORS checks, request
 * limits, article building, generation and the HTTP contract. Never
 * answers 403 or 404, because CloudFront turns those into the app's
 * index.html.
 */
import type {
  LambdaFunctionURLEvent,
  APIGatewayProxyStructuredResultV2 as FunctionURLResult,
} from 'aws-lambda';
import { articleFromText } from '../../../src/lib/quiz/validate.ts';
import { corsHeaders } from './cors.ts';
import { generateQuiz } from './generate.ts';
import type { Converse } from './model.ts';
import { parseRequest } from './request.ts';

/** Everything the handler needs from the outside world. */
export interface HandlerDeps {
  converse: Converse;
  modelId: string;
  allowedOrigins: readonly string[];
  /** Structured log sink; never receives article text or model output. */
  log?: (entry: Record<string, unknown>) => void;
}

/** A function URL handler. */
export type Handler = (
  event: LambdaFunctionURLEvent,
) => Promise<FunctionURLResult>;

/** Builds the handler around injected dependencies. */
export function createHandler(deps: HandlerDeps): Handler {
  const log = deps.log ?? ((entry) => console.log(JSON.stringify(entry)));

  return async (event) => {
    const method = event.requestContext.http.method.toUpperCase();
    const cors = corsHeaders(event.headers.origin, deps.allowedOrigins);
    const reply = (
      statusCode: number,
      body?: unknown,
      extra: Record<string, string> = {},
    ): FunctionURLResult => ({
      statusCode,
      headers: {
        ...cors,
        ...extra,
        'cache-control': 'no-store',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? '' : JSON.stringify(body),
    });

    if (method === 'OPTIONS') {
      return reply(204);
    }
    if (method !== 'POST') {
      return reply(405, { error: 'Use POST.' }, { allow: 'POST, OPTIONS' });
    }

    const parsed = parseRequest(event.body, event.isBase64Encoded);
    if (!parsed.ok) {
      log({ event: 'bad_request', status: parsed.status });
      return reply(parsed.status, { error: parsed.error });
    }
    const { title, text, pack } = parsed.value;
    const article = articleFromText(title, text, { pack });
    if (article.sections.length === 0) {
      return reply(400, { error: '"text" has no paragraphs.' });
    }

    const started = Date.now();
    try {
      const result = await generateQuiz(
        article,
        deps.converse,
        deps.modelId,
      );
      log({
        event: 'generated',
        article: article.id,
        chars: text.length,
        returned: result.questions.length,
        rejected: result.rejected,
        calls: result.calls,
        ms: Date.now() - started,
      });
      return reply(200, {
        questions: result.questions,
        rejected: result.rejected,
      });
    } catch (error) {
      log({
        event: 'model_error',
        error: error instanceof Error ? error.name : 'unknown',
        ms: Date.now() - started,
      });
      return reply(502, { error: 'The quiz service is unavailable.' });
    }
  };
}
