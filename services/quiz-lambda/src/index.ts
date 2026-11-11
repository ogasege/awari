/**
 * Lambda entry point: wires the real Bedrock Runtime client into the
 * handler from environment variables. No credentials live here; the
 * function's IAM role grants `bedrock:InvokeModel` on one model only.
 *
 * Environment:
 * - `BEDROCK_MODEL_ID` (required): model or inference profile ID.
 * - `BEDROCK_REGION` (optional): defaults to the function's region.
 * - `ALLOWED_ORIGINS` (optional): comma-separated site origins for CORS.
 */
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { parseOrigins } from './cors.ts';
import { createHandler } from './handler.ts';

/** Per-call limit, so two calls fit inside the 45 s function timeout. */
const MODEL_CALL_TIMEOUT_MS = 20_000;

const modelId = process.env.BEDROCK_MODEL_ID;
if (modelId === undefined || modelId === '') {
  throw new Error('BEDROCK_MODEL_ID is not set');
}

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || process.env.AWS_REGION,
  maxAttempts: 2,
});

/** The function URL handler (`index.handler`). */
export const handler = createHandler({
  modelId,
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  converse: (input) =>
    client.send(new ConverseCommand(input), {
      abortSignal: AbortSignal.timeout(MODEL_CALL_TIMEOUT_MS),
    }),
});
